<?php
/* Eingang für Kundenanfragen aus Formular und Luna (src/lib/submitLead.ts) und für Partner-Bewerbungen
   (src/lib/bewerbung.ts). POST application/x-www-form-urlencoded, Antwort immer JSON.
   art=anfrage: anfrageId, name, tel, email, plz, ort, kategorie, bereich, dringlichkeit, wunschtermin, text,
   antworten, dsgvo → { ok:true, match:'FOUND'|'NONE' }. Ablauf: Honigtopf, Feldlängen, Doppelsendung, Kontingent je
   IP, Pflichtfelder, Matching gegen die Partnerliste (§26–§29), Speicherung als Datei, Mail an fixit247, Mail an den
   Partnerbetrieb, Bestätigung an den Kunden.
   art=partner: bewerbungId, firma, ansprechperson, tel, email, gisa, uid, gewerke, plz, zeiten, notdienst,
   reaktionszeit, richtpreise, abweichungen, haftpflicht, preisVorab, unbar, anmerkungen, dsgvo → { ok:true }.
   Ablauf: Honigtopf, Feldlängen, Doppelsendung, eigenes Kontingent, Prüfung, Speicherung mit Status PENDING, Mail an
   fixit247 mit Prüfliste und Eintrag zum Kopieren, Bestätigung an den Betrieb. Kein Matching, keine KI, die
   Partnerliste bleibt unberührt.
   Fehler: { ok:false, error:'bad_request'|'limit'|'upstream' }.
   Konfiguration (Empfänger, Absender, Partnerliste) siehe _basis.php und docs/hosting.md. */

require __DIR__ . '/_basis.php';

const EMPFAENGER = 'support@fixit247.at';   /* Standard für 'empfaenger' und 'absender' in der Konfiguration */
/* ponytail: je IP und 6 Stunden. Hinter Carrier-NAT teilen sich viele Kunden eine IP, daher großzügig. */
const KONTINGENT_ANFRAGE = 30;
/* ponytail: je IP und 6 Stunden. Ein Betrieb bewirbt sich einmal, 5 lassen Raum für Korrekturen. */
const KONTINGENT_PARTNER = 5;
const MAX_FELD = 2000, MAX_TEXT = 6000;
/* wie istEmail in src/lib/validate.ts, zusätzlich ohne , ; < > " ( ): die Adresse landet in mail() und Reply-To */
const EMAIL_RE = '/^[^@\s,;<>"()]+@[^@\s,;<>"()]+\.[a-zA-Z]{2,}$/';

/* ================= PARTNER + MATCHING (§26–§29) ================= */
/* Die Partnerliste steht in der Konfiguration unter 'partner' (außerhalb des Webroots, erreicht nie den Browser,
   §43). Nur partnerStatus 'ACTIVE' wird automatisch vermittelt (§28). Solange die Liste leer ist, endet jedes
   Matching mit NONE und Luna zeigt den Text aus §29. Felder (§26):
   ['id' => 'p1', 'company' => 'Muster GmbH', 'contact' => 'Max Muster', 'trades' => ['installateur', 'shk'],
    'specializations' => ['gastherme'], 'postalCodes' => ['1100', '1110'], 'serviceRadius' => 25,
    'availability' => '24/7' | 'business', 'emergencyService' => true, 'phone' => '+43…', 'whatsapp' => '+43…',
    'email' => 'office@…', 'pricing' => 'low' | 'mid' | 'high', 'travelFee' => 29.90, 'responseTime' => 45,
    'rating' => 4.6, 'completedJobs' => 120, 'cancellationRate' => 0.02, 'reliabilityScore' => 0.95,
    'partnerStatus' => 'ACTIVE' | 'PAUSED' | 'PENDING']
   Bewerbungen über art=partner werden nie automatisch Partner: partnerEingang() liest und schreibt diese Liste nicht.
   Die Mail an fixit247 enthält einen fertigen Eintrag mit partnerStatus 'PENDING'; aufgenommen wird von Hand nach
   der Prüfliste in derselben Mail. */

/* Gewichte in der Priorität aus §27 (Gewerk ist Pflichtfilter, kein Gewicht). */
const GEWICHTE = [
  'distanz' => 30, 'verfuegbarkeit' => 22, 'spezialisierung' => 14, 'reaktionszeit' => 12,
  'qualitaet' => 10, 'preis' => 7, 'bewertung' => 5,
];

/* ponytail: Distanz ohne Geodaten über die PLZ-Struktur (gleiche PLZ 1, gleiche zwei Anfangsziffern .6,
   gleiche Region .3). Bei Bedarf serviceRadius mit echten Koordinaten berechnen. */
function distanzScore(array $partner, string $plz): float {
  $codes = array_map('strval', $partner['postalCodes'] ?? []);
  if ($plz === '') return $codes ? 0.3 : 0;
  if (in_array($plz, $codes, true)) return 1;
  foreach ($codes as $c) if (substr($c, 0, 2) === substr($plz, 0, 2)) return 0.6;
  foreach ($codes as $c) if (substr($c, 0, 1) === $plz[0]) return 0.3;
  return 0;
}

/* Nacht (18–08 Uhr) oder Sonntag in Wiener Zeit. Feiertage zählen hier nicht, anders als beim Zuschlag (copy.ts NACHTZEIT). */
function ausserhalb(DateTimeInterface $jetzt): bool {
  $h = (int) $jetzt->format('G');
  return $h >= 18 || $h < 8 || $jetzt->format('N') === '7';
}

function verfuegbarkeitScore(array $partner, array $req, DateTimeInterface $jetzt): float {
  $draussen = ausserhalb($jetzt);
  if ($req['urgency'] === 'NORMAL' && !$draussen) return 1;
  if (($partner['availability'] ?? '') === '24/7') return !empty($partner['emergencyService']) ? 1 : 0.8;
  if ($draussen) return !empty($partner['emergencyService']) ? 0.7 : 0;
  return 0.6;
}

function scorePartner(array $partner, array $req, DateTimeInterface $jetzt): float {
  $text = mb_strtolower($req['text']);
  $spez = 0.4;
  foreach ($partner['specializations'] ?? [] as $sp) if (str_contains($text, mb_strtolower((string) $sp))) { $spez = 1; break; }
  $reaktion = isset($partner['responseTime']) ? max(0, 1 - $partner['responseTime'] / 180) : 0.5;
  $qualitaet = isset($partner['reliabilityScore'])
    ? max(0, min(1, $partner['reliabilityScore'] - ($partner['cancellationRate'] ?? 0))) : 0.5;
  $preis = ['low' => 1, 'mid' => 0.7, 'high' => 0.4][$partner['pricing'] ?? ''] ?? 0.6;
  $bewertung = isset($partner['rating']) ? max(0, min(1, $partner['rating'] / 5)) : 0.5;
  return GEWICHTE['distanz'] * distanzScore($partner, $req['plz'])
    + GEWICHTE['verfuegbarkeit'] * verfuegbarkeitScore($partner, $req, $jetzt)
    + GEWICHTE['spezialisierung'] * $spez
    + GEWICHTE['reaktionszeit'] * $reaktion
    + GEWICHTE['qualitaet'] * $qualitaet
    + GEWICHTE['preis'] * $preis
    + GEWICHTE['bewertung'] * $bewertung;
}

/* Liefert den besten aktiven Partner für das Gewerk als ['partner' => …, 'score' => …] oder null. Partner ohne
   jede Nähe (distanzScore 0) oder ohne Verfügbarkeit fallen heraus.
   $req: ['category' => …, 'plz' => …, 'urgency' => 'NORMAL'|'URGENT'|'ACUTE', 'text' => …] */
function passenderPartner(array $req, ?array $partner = null, ?DateTimeInterface $jetzt = null): ?array {
  $partner ??= konfig()['partner'] ?? [];
  $jetzt ??= new DateTimeImmutable();
  $kandidaten = [];
  foreach ($partner as $p) {
    if (($p['partnerStatus'] ?? '') !== 'ACTIVE' || !in_array($req['category'], $p['trades'] ?? [], true)) continue;
    if (distanzScore($p, $req['plz']) > 0 && verfuegbarkeitScore($p, $req, $jetzt) > 0)
      $kandidaten[] = ['partner' => $p, 'score' => scorePartner($p, $req, $jetzt)];
  }
  usort($kandidaten, fn($a, $b) => $b['score'] <=> $a['score']);
  return $kandidaten[0] ?? null;
}

/* ================= MAIL ================= */
/* tuerkis und tiefsee wie --fx-tuerkis und --fx-tiefsee (src/styles/tokens.css): Anruf-Knöpfe überall gleich, als Pille wie
   ui/CallButton (CLAUDE.md, Audit-Befund N7). Ohne Hörer-Icon: Viele Mailprogramme entfernen SVG. */
const FARBE = ['navy' => '#17457C', 'orange' => '#F2761B', 'tuerkis' => '#22B5C0', 'tiefsee' => '#03101F', 'linie' => '#E3EAF3', 'grau' => '#6B7C93', 'tinte' => '#0F1D2E'];

/* Nutzereingaben nie ungeprüft ins HTML, sonst zerlegt ein "<" das Layout. */
function esc(?string $s): string { return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }

/* Werte für die Kundenmail: Die Bestätigung geht an eine vom Absender gewählte Adresse. Freie Felder darin wären
   ein Spam-Relais mit unserem Absender. Daher nur erlaubte Zeichen, kurz, ohne Links (Tokens mit Punkt in der
   Mitte wie spam.example werden vorher gestrichen) und ohne Ziffern im Namen. */
function nurZeichen(?string $s, string $erlaubt, int $max): string {
  return mb_substr(trim((string) preg_replace('/\s{2,}/u', ' ', (string) preg_replace($erlaubt, '', (string) $s))), 0, $max);
}

function gewerkName(string $bereich, string $kategorie): string {
  $namen = array_column(gewerke(), 'name', 'id');
  return $namen[$kategorie] ?? (in_array($bereich, $namen, true) ? $bereich : '');
}

/* Mail als multipart/alternative (Text und HTML), UTF-8. Mit 'mail_ordner' in der Konfiguration landet sie als
   .eml-Datei dort statt bei mail() (lokal und in Tests). Wirft, wenn mail() ablehnt. */
function sende(string $an, string $betreff, string $text, ?string $html, string $name, string $antwortAn): void {
  $k = konfig();
  $absender = $k['absender'] ?? EMPFAENGER;
  $grenze = 'fixit247-' . bin2hex(random_bytes(8));
  $teil = fn($typ, $inhalt) => "--$grenze\r\nContent-Type: $typ; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
    . chunk_split(base64_encode($inhalt));
  $kopf = implode("\r\n", [
    'From: ' . mb_encode_mimeheader($name, 'UTF-8', 'B') . " <$absender>",
    "Reply-To: $antwortAn",
    'MIME-Version: 1.0',
    "Content-Type: multipart/alternative; boundary=\"$grenze\"",
  ]);
  $koerper = $teil('text/plain', $text) . ($html === null ? '' : $teil('text/html', $html)) . "--$grenze--\r\n";
  $betreff = mb_encode_mimeheader(preg_replace('/[\r\n\t]+/', ' ', $betreff), 'UTF-8', 'B');
  if (!empty($k['mail_ordner'])) {
    if (!is_dir($k['mail_ordner'])) mkdir($k['mail_ordner'], 0700, true);
    $datei = $k['mail_ordner'] . '/' . date('Ymd-His') . '-' . bin2hex(random_bytes(3)) . '.eml';
    file_put_contents($datei, "To: $an\r\nSubject: $betreff\r\n$kopf\r\n\r\n$koerper");
    return;
  }
  if (!mail($an, $betreff, $koerper, $kopf, "-f$absender")) throw new RuntimeException("mail() an $an abgelehnt");
}

function zeile(string $label, string $wert): string {
  $f = FARBE;
  return <<<HTML
  <tr>
    <td style="padding:11px 0;border-bottom:1px solid {$f['linie']};font-size:13px;
      color:{$f['grau']};white-space:nowrap;vertical-align:top;">{$label}</td>
    <td style="padding:11px 0 11px 18px;border-bottom:1px solid {$f['linie']};
      font-size:15px;color:{$f['tinte']};font-weight:600;">{$wert}</td>
  </tr>
  HTML;
}

/* ================= KUNDENANFRAGE ================= */
function anfrageEingang(array $p): array {
  /* Ohne Name, Telefon und Einwilligung ist die Anfrage wertlos. Bots und Fehlaufrufe laufen hier auf, bevor sie
     Postfach und Speicher belasten. */
  $name = trim($p['name'] ?? '');
  $tel = trim($p['tel'] ?? '');
  if (($p['art'] ?? '') !== 'anfrage' || $name === '' || empty($p['dsgvo']) || strlen(preg_replace('/\D/', '', $tel)) < 6)
    return ['ok' => false, 'error' => 'bad_request'];
  $email = preg_match(EMAIL_RE, trim($p['email'] ?? '')) ? trim($p['email']) : '';
  $plz = preg_match('/\b[1-9]\d{3}\b/', ($p['plz'] ?? '') ?: ($p['ort'] ?? ''), $m) ? $m[0] : '';
  $kategorie = preg_match('/^[a-z]{2,20}$/', $p['kategorie'] ?? '') ? $p['kategorie'] : '';
  $dringlichkeit = preg_match('/^(NORMAL|URGENT|ACUTE)$/', $p['dringlichkeit'] ?? '') ? $p['dringlichkeit'] : '';
  $ort = $p['ort'] ?? '';
  /* Website und Luna schicken PLZ und Ort getrennt; der Betrieb braucht beides („1100 Wien“, nicht nur „Wien“). */
  $plzOrt = str_starts_with($ort, $plz) ? $ort : trim("$plz $ort");
  $bereich = ($p['bereich'] ?? '') ?: $kategorie;
  $text = $p['text'] ?? '';
  $wunschtermin = $p['wunschtermin'] ?? '';
  $id = $p['anfrageId'] ?? '';

  /* Matching: ein fehlerhafter Partnereintrag darf den Eingang nie blockieren, dann NONE und Protokoll. */
  $treffer = null;
  try {
    $treffer = passenderPartner(['category' => $kategorie, 'plz' => $plz, 'urgency' => $dringlichkeit ?: 'URGENT', 'text' => $text]);
  } catch (Throwable $fehler) {
    error_log('fixit247 Matching-Fehler (Partnerliste prüfen): ' . $fehler->getMessage());
  }
  $matchText = $treffer
    ? 'FOUND – ' . $treffer['partner']['company'] . ' (' . $treffer['partner']['id'] . ', Score ' . round($treffer['score']) . ')'
    : 'NONE – kein aktiver Partner passt, bitte manuell vermitteln';

  /* Speicherung vor dem Versand: geht die Mail verloren, bleibt die Anfrage in der Datei. Ein Monat je Datei,
     damit Löschen nach Frist einfach ist. Scheitert das Schreiben, zählt trotzdem die Mail. */
  $eintrag = json_encode(['zeit' => date('c'), 'match' => $matchText] + $p, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
  if (@file_put_contents(daten() . '/anfragen-' . date('Y-m') . '.jsonl', "$eintrag\n", FILE_APPEND | LOCK_EX) === false)
    error_log("fixit247 Anfrage $id nicht gespeichert: Datenordner prüfen");

  $f = FARBE;
  $e = [
    'name' => esc($name), 'tel' => esc($tel), 'telLink' => esc(preg_replace('/[^\d+]/', '', $tel)),
    'ort' => esc($plzOrt ?: '—'), 'bereich' => esc($bereich ?: '—'),
    'text' => str_replace("\n", '<br>', esc($text ?: '—')),
    'dring' => esc(['ACUTE' => 'AKUT – Gefahr oder laufender Schaden', 'URGENT' => 'Dringend', 'NORMAL' => 'Normal'][$dringlichkeit] ?? '—'),
    'wunschtermin' => esc($wunschtermin ?: '—'), 'id' => esc($id ?: '—'),
  ];
  $zeilen = zeile('Name', $e['name'])
    . zeile('Telefon', "<a href=\"tel:{$e['telLink']}\" style=\"color:{$f['orange']};text-decoration:none;font-weight:700;\">{$e['tel']}</a>")
    . zeile('E-Mail', $email
      ? '<a href="mailto:' . esc($email) . "\" style=\"color:{$f['navy']};text-decoration:none;\">" . esc($email) . '</a>'
      : '<span style="color:#8A9AAE;font-weight:400;">nicht angegeben</span>')
    . zeile('PLZ und Ort', $e['ort'])
    . zeile('Gewerk', $e['bereich'])
    . zeile('Dringlichkeit', $e['dring'])
    . zeile('Wunschtermin', $e['wunschtermin'])
    . zeile('Matching', esc($matchText));

  $html = <<<HTML
  <div style="margin:0;padding:24px 12px;background:#F4F7FB;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
      style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:16px;
      overflow:hidden;box-shadow:0 2px 12px rgba(15,29,46,.08);">

      <tr><td style="background:{$f['navy']};padding:22px 26px;">
        <div style="font-size:21px;font-weight:800;color:#FFFFFF;letter-spacing:-.02em;">
          fixit<span style="color:{$f['orange']};">247</span></div>
        <div style="font-size:12px;color:rgba(255,255,255,.72);margin-top:3px;">
          Neue Kundenanfrage</div>
      </td></tr>

      <tr><td style="padding:24px 26px 8px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          {$zeilen}
        </table>
      </td></tr>

      <tr><td style="padding:16px 26px 4px;">
        <div style="font-size:12px;font-weight:700;letter-spacing:.08em;
          text-transform:uppercase;color:{$f['grau']};margin-bottom:8px;">Was ist passiert?</div>
        <div style="background:#F4F7FB;border-radius:12px;padding:16px 18px;
          font-size:15px;line-height:1.55;color:{$f['tinte']};">{$e['text']}</div>
      </td></tr>

      <tr><td style="padding:20px 26px 8px;">
        <a href="tel:{$e['telLink']}" style="display:block;background:{$f['tuerkis']};
          color:{$f['tiefsee']};text-decoration:none;text-align:center;font-size:16px;font-weight:700;
          padding:15px 20px;border-radius:999px;">{$e['name']} zurückrufen</a>
      </td></tr>

      <tr><td style="padding:18px 26px 24px;">
        <div style="border-top:1px solid {$f['linie']};padding-top:16px;font-size:12px;
          line-height:1.6;color:{$f['grau']};">
          DSGVO-Zustimmung: <b style="color:{$f['tinte']};">erteilt</b> · Anfrage-ID {$e['id']}<br>
          <b style="color:{$f['tinte']};">fixit247</b> · digitale 24/7 Vermittlungsplattform für Fachbetriebe
        </div>
      </td></tr>
    </table>
  </div>
  HTML;

  /* Klartext-Fassung für Clients ohne HTML. */
  $plain = implode("\n", [
    'Neue Kundenanfrage über fixit247', '',
    'Name:             ' . $name,
    'Telefon:          ' . $tel,
    'E-Mail:           ' . ($email ?: '-'),
    'PLZ und Ort:      ' . ($plzOrt ?: '-'),
    'Gewerk:           ' . ($bereich ?: '-'),
    'Dringlichkeit:    ' . ($dringlichkeit ?: '-'),
    'Wunschtermin:     ' . ($wunschtermin ?: '-'),
    'Matching:         ' . $matchText, '',
    'Was ist passiert?', ($text ?: '-'), '',
    'DSGVO-Zustimmung: erteilt · Anfrage-ID ' . ($id ?: '-'),
  ]);

  /* Zuerst die interne Benachrichtigung: sie ist der Geschäftsvorgang. Schlägt sie fehl, meldet die Website den
     Fehler und der Kunde ruft an. Die Anfrage liegt dann trotzdem in der Datei. */
  $empfaenger = konfig()['empfaenger'] ?? EMPFAENGER;
  sende(
    $empfaenger,
    'Neue Anfrage' . ($dringlichkeit === 'ACUTE' ? ' (AKUT)' : '') . ': ' . ($bereich ?: 'unbekannt') . ' — ' . mb_substr($name, 0, 80)
      . ($treffer ? ' → ' . $treffer['partner']['company'] : ''),
    $plain, $html, 'fixit247 Website', $email ?: $empfaenger,
  );

  /* Vermittlung: der gematchte Partner bekommt die Anfrage direkt. Die Einwilligung des Kunden deckt die
     Weitergabe an einen Partnerbetrieb. */
  if ($treffer && !empty($treffer['partner']['email'])) {
    try {
      sende($treffer['partner']['email'], 'Vermittlung fixit247: ' . $bereich . ' in ' . ($plzOrt ?: '—'),
        "Neue Anfrage über fixit247 – bitte den Kunden direkt kontaktieren.\n\n" . $plain, null, 'fixit247 Vermittlung', $empfaenger);
    } catch (Throwable $fehler) {
      error_log('fixit247 Partnermail fehlgeschlagen: ' . $fehler->getMessage());
    }
  }

  /* Danach die Bestätigung an den Kunden, nur mit gültiger Adresse und gekapselt: eine vertippte Adresse darf
     die bereits zugestellte Anfrage nicht nachträglich als Fehlschlag erscheinen lassen. */
  if ($email) {
    try {
      bestaetigungSenden($email, [
        'name' => nurZeichen(preg_replace('/\S+\.\S+/u', ' ', $name), "/[^A-Za-zÀ-ÖØ-öø-ÿ' .-]/u", 60),
        'tel' => nurZeichen($tel, '/[^\d+()\/ .-]/u', 25),
        'ort' => nurZeichen(preg_replace('/\S+\.\S+/u', ' ', $plzOrt), '/[^A-Za-zÀ-ÖØ-öø-ÿ0-9 .,\/-]/u', 60) ?: '—',
        'bereich' => gewerkName($p['bereich'] ?? '', $kategorie) ?: '—',
      ], $empfaenger, $treffer !== null);
    } catch (Throwable $fehler) {
      error_log('fixit247 Bestätigung fehlgeschlagen: ' . $fehler->getMessage());
    }
  }

  return ['ok' => true, 'match' => $treffer ? 'FOUND' : 'NONE'];
}

/* ================= BESTÄTIGUNG AN DEN KUNDEN ================= */
/* Enthält bewusst keinen Freitext des Absenders: die Bestätigung geht an eine frei eingetragene Adresse und darf
   kein Relais für fremde Texte sein. $k sind die mit nurZeichen gefilterten Werte. */

function schritt(int $nummer, string $titel, string $beschreibung): string {
  $f = FARBE;
  return <<<HTML
  <tr>
    <td width="34" style="padding:0 14px 18px 0;vertical-align:top;">
      <div style="width:26px;height:26px;border-radius:50%;background:{$f['orange']};
        color:#FFFFFF;font-size:13px;font-weight:700;text-align:center;
        line-height:26px;">{$nummer}</div>
    </td>
    <td style="padding:0 0 18px;vertical-align:top;">
      <div style="font-size:15px;font-weight:700;color:{$f['tinte']};
        margin-bottom:2px;">{$titel}</div>
      <div style="font-size:14px;line-height:1.5;color:{$f['grau']};">{$beschreibung}</div>
    </td>
  </tr>
  HTML;
}

/* $gefunden = Matching FOUND. Schritte und Texte wie in den Erfolgskarten der Website (copy.weiter, erfolg.keinerText):
   die drei Schritte nur mit gefundenem Betrieb, sonst „Wir suchen weiter“. */
function bestaetigungSenden(string $email, array $k, string $antwortAn, bool $gefunden): void {
  $f = FARBE;
  $kontakt = kontakt();
  $telLink = 'tel:' . preg_replace('/[^\d+]/', '', $kontakt['telefon']);
  $telefon = esc($kontakt['telefon']);
  $mail = esc($kontakt['email']);
  $e = array_map('esc', $k);
  $gruss = $e['name'] === '' ? '' : ' ' . $e['name'];
  $einleitung = $gefunden
    ? 'Wir vermitteln Ihre Anfrage an einen passenden Fachbetrieb.'
    : "Wir haben gerade keinen passenden Fachbetrieb in Ihrer Nähe gefunden. Ihre Anfrage ist trotzdem aufgenommen: Wir suchen weiter und melden uns unter {$k['tel']}. Ist es dringend, rufen Sie uns bitte gleich an.";
  $liste = $gefunden ? [
    ['Passender Fachbetrieb', 'Wir vermitteln Ihre Anfrage an einen passenden Fachbetrieb in Ihrer Nähe.'],
    ['Rückruf', "fixit247 oder der vermittelte Fachbetrieb meldet sich telefonisch unter {$k['tel']}."],
    ['Direkt mit dem Fachbetrieb', 'Termin, Preis, Durchführung und Rechnung stimmen Sie direkt mit dem Fachbetrieb ab. Die Vermittlung ist kostenlos.'],
  ] : [];
  $schritte = '';
  foreach ($liste as $i => [$titel, $text]) $schritte .= schritt($i + 1, esc($titel), esc($text));
  $weiter = $schritte === '' ? '' : <<<HTML
      <tr><td style="padding:26px 26px 6px;">
        <div style="font-size:12px;font-weight:700;letter-spacing:.08em;
          text-transform:uppercase;color:{$f['grau']};margin-bottom:14px;">So geht es weiter</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          {$schritte}
        </table>
      </td></tr>
  HTML;
  $einleitungHtml = esc($einleitung);

  $html = <<<HTML
  <div style="margin:0;padding:24px 12px;background:#F4F7FB;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
      style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:16px;
      overflow:hidden;box-shadow:0 2px 12px rgba(15,29,46,.08);">

      <tr><td style="background:{$f['navy']};padding:22px 26px;">
        <div style="font-size:21px;font-weight:800;color:#FFFFFF;letter-spacing:-.02em;">
          fixit<span style="color:{$f['orange']};">247</span></div>
        <div style="font-size:12px;color:rgba(255,255,255,.72);margin-top:3px;">
          Digitale 24/7 Vermittlungsplattform für Fachbetriebe</div>
      </td></tr>

      <tr><td style="padding:30px 26px 4px;text-align:center;">
        <div style="width:56px;height:56px;border-radius:50%;background:#E8F6ED;
          margin:0 auto 16px;line-height:56px;font-size:27px;color:#22A758;">&#10003;</div>
        <div style="font-size:22px;font-weight:800;color:{$f['tinte']};
          letter-spacing:-.02em;margin-bottom:8px;">Ihre Anfrage ist angekommen</div>
        <div style="font-size:15px;line-height:1.6;color:{$f['grau']};">
          Guten Tag{$gruss},<br>vielen Dank für Ihr Vertrauen.
          {$einleitungHtml}</div>
      </td></tr>

      {$weiter}

      <tr><td style="padding:8px 26px 6px;">
        <div style="background:#F4F7FB;border-radius:12px;padding:18px 20px;">
          <div style="font-size:12px;font-weight:700;letter-spacing:.08em;
            text-transform:uppercase;color:{$f['grau']};margin-bottom:10px;">Ihre Angaben</div>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
            style="font-size:14px;color:{$f['tinte']};">
            <tr><td style="padding:3px 0;color:{$f['grau']};width:120px;">Gewerk</td>
              <td style="padding:3px 0;font-weight:600;">{$e['bereich']}</td></tr>
            <tr><td style="padding:3px 0;color:{$f['grau']};">PLZ und Ort</td>
              <td style="padding:3px 0;font-weight:600;">{$e['ort']}</td></tr>
          </table>
        </div>
      </td></tr>

      <tr><td style="padding:20px 26px 8px;">
        <a href="{$telLink}" style="display:block;background:{$f['tuerkis']};
          color:{$f['tiefsee']};text-decoration:none;text-align:center;font-size:16px;font-weight:700;
          padding:15px 20px;border-radius:999px;">Dringend? Jetzt anrufen: {$telefon}</a>
      </td></tr>

      <tr><td style="padding:16px 26px 24px;">
        <div style="border-top:1px solid {$f['linie']};padding-top:16px;font-size:12px;
          line-height:1.65;color:{$f['grau']};">
          <b style="color:{$f['tinte']};">fixit247</b> · digitale 24/7 Vermittlungsplattform für Fachbetriebe<br>
          <a href="{$telLink}" style="color:{$f['navy']};">{$telefon}</a> ·
          <a href="mailto:{$mail}" style="color:{$f['navy']};">{$mail}</a><br>
          <span style="color:#8A9AAE;">fixit247 vermittelt Anfragen an selbstständige, entsprechend
          berechtigte Fachbetriebe. Die handwerkliche Leistung wird ausschließlich durch den
          jeweiligen Fachbetrieb erbracht. Die konkrete Terminvereinbarung, Preisgestaltung,
          Durchführung und Rechnungsstellung erfolgt direkt zwischen Kunde und ausführendem
          Fachbetrieb. Genannte Preise sind unverbindliche Richtpreise.</span>
        </div>
      </td></tr>
    </table>
  </div>
  HTML;

  $plain = implode("\n", [
    'Ihre Anfrage ist angekommen', '',
    'Guten Tag ' . $k['name'] . ',',
    'vielen Dank für Ihr Vertrauen. ' . $einleitung, '',
    ...($liste ? ['So geht es weiter:', ...array_map(fn($i, $s) => ($i + 1) . '. ' . $s[1], array_keys($liste), $liste), ''] : []),
    'Ihre Angaben:',
    'Gewerk:           ' . $k['bereich'],
    'PLZ und Ort:      ' . $k['ort'], '',
    'Dringend? Rufen Sie an: ' . $kontakt['telefon'], '',
    'fixit247 · digitale 24/7 Vermittlungsplattform für Fachbetriebe',
    $kontakt['telefon'] . ' · ' . $kontakt['email'], '',
    'fixit247 vermittelt Anfragen an selbstständige, entsprechend berechtigte Fachbetriebe.',
    'Die handwerkliche Leistung wird ausschließlich durch den jeweiligen Fachbetrieb erbracht.',
    'Die konkrete Terminvereinbarung, Preisgestaltung, Durchführung und Rechnungsstellung',
    'erfolgt direkt zwischen Kunde und ausführendem Fachbetrieb. Genannte Preise sind',
    'unverbindliche Richtpreise.',
  ]);

  sende($email, 'Ihre Anfrage bei fixit247 ist angekommen', $plain, $html, 'fixit247', $antwortAn);
}

/* ================= PARTNER-BEWERBUNG (art=partner) ================= */
/* Kopien aus src/content/partner.ts (Zeiten und der Kostensatz von Beks, wörtlich). src/luna/backend.test.ts schlägt
   an, wenn sie von der Website-Quelle abweichen. */
const ZEITEN = [
  'werktags' => 'Werktags tagsüber', 'abends' => 'Werktags abends', 'nachts' => 'Nachts',
  'wochenende' => 'Am Wochenende', 'feiertag' => 'An Feiertagen',
];
const KOSTEN = 'Die Partnerschaft ist zum Start kostenlos. Bevor sich daran etwas ändert, informieren wir Sie rechtzeitig, und Sie entscheiden dann, ob Sie dabei bleiben.';
const GISA_ABFRAGE = 'https://www.gisa.gv.at/abfrage';
const MAX_PLZ = 400;   /* wie MAX_PLZ in src/lib/bewerbung.ts */

/* Prüft wie src/lib/bewerbung.ts und liefert nur die erwarteten Felder, normalisiert; alles andere in $p bleibt
   draußen. null, wenn etwas fehlt oder ein Format nicht passt. Listen kommen als Komma-Liste ohne leere Einträge. */
function bewerbungPruefen(array $p): ?array {
  $feld = fn(string $k): string => is_string($p[$k] ?? null) ? trim($p[$k]) : '';
  $pflicht = fn(string $k): ?string => $feld($k) === '' ? null : $feld($k);
  $eins = fn(string $k, array $erlaubt): ?string => in_array($feld($k), $erlaubt, true) ? $feld($k) : null;
  $liste = function (string $k, callable $passt) use ($feld): ?array {
    $werte = array_values(array_unique(explode(',', $feld($k))));
    foreach ($werte as $w) if (!$passt($w)) return null;
    return $werte;
  };
  $gewerkIds = array_column(gewerke(), 'id');
  $uid = strtoupper((string) preg_replace('/\s/', '', $feld('uid')));
  $b = [
    'bewerbungId' => preg_match('/^[A-Za-z0-9-]{6,40}$/', $feld('bewerbungId')) ? $feld('bewerbungId') : null,
    'firma' => $pflicht('firma'),
    'ansprechperson' => $pflicht('ansprechperson'),
    'tel' => strlen((string) preg_replace('/\D/', '', $feld('tel'))) >= 6 ? $feld('tel') : null,
    'email' => preg_match(EMAIL_RE, $feld('email')) ? $feld('email') : null,
    'gisa' => $liste('gisa', fn($z) => preg_match('/^\d{5,10}$/', $z) === 1),
    'uid' => preg_match('/^(ATU\d{8})?$/', $uid) ? $uid : null,
    'gewerke' => $liste('gewerke', fn($g) => in_array($g, $gewerkIds, true)),
    'plz' => $liste('plz', fn($z) => preg_match('/^\d{4}$/', $z) === 1 && (int) $z >= 1010 && (int) $z <= 9992),
    'zeiten' => $liste('zeiten', fn($z) => array_key_exists($z, ZEITEN)),
    'notdienst' => $eins('notdienst', ['ja', 'nein']),
    'reaktionszeit' => $eins('reaktionszeit', ['', '30', '60', '90', '120']),
    'richtpreise' => $eins('richtpreise', ['ja', 'abweichung', 'nein']),
    'abweichungen' => $feld('richtpreise') === 'abweichung' ? $pflicht('abweichungen') : '',
    'haftpflicht' => $eins('haftpflicht', ['ja', 'nein']),
    'preisVorab' => $eins('preisVorab', ['ja', 'nein']),
    'unbar' => $eins('unbar', ['ja', 'nein']),
    'anmerkungen' => $feld('anmerkungen'),
  ];
  return in_array(null, $b, true) || count($b['plz']) > MAX_PLZ || $feld('dsgvo') === '' ? null : $b;
}

function partnerEingang(array $p): array {
  $b = bewerbungPruefen($p);
  if ($b === null) return ['ok' => false, 'error' => 'bad_request'];

  /* Speicherung vor dem Versand wie bei der Anfrage, aber nur die geprüften Felder. Status PENDING: in die
     Partnerliste kommt ein Betrieb nur von Hand. */
  $eintrag = json_encode(['zeit' => date('c'), 'status' => 'PENDING'] + $b + ['dsgvo' => 'erteilt'],
    JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
  if (@file_put_contents(daten() . '/partner-' . date('Y-m') . '.jsonl', "$eintrag\n", FILE_APPEND | LOCK_EX) === false)
    error_log("fixit247 Bewerbung {$b['bewerbungId']} nicht gespeichert: Datenordner prüfen");

  /* Die Mail an fixit247 ist der Geschäftsvorgang: schlägt sie fehl, wirft sende() und die Seite zeigt den
     Sendefehler. Die Bestätigung an den Betrieb darf das nicht mehr ändern. */
  $empfaenger = konfig()['empfaenger'] ?? EMPFAENGER;
  bewerbungMelden($b, $empfaenger);
  try {
    bewerbungBestaetigen($b, $empfaenger);
  } catch (Throwable $fehler) {
    error_log('fixit247 Bestätigung an Betrieb fehlgeschlagen: ' . $fehler->getMessage());
  }
  return ['ok' => true];
}

/* Eintrag für 'partner' in fixit247-konfig.php. Jeder Wert geht durch var_export(): ein ' oder \ in der Eingabe
   bleibt Text und kann keinen Code in die Konfiguration schmuggeln. */
function partnerEintrag(array $b): string {
  $e = [
    'id' => strtolower($b['bewerbungId']),
    'company' => $b['firma'],
    'contact' => $b['ansprechperson'],
    'trades' => $b['gewerke'],
    'postalCodes' => $b['plz'],
    'availability' => count($b['zeiten']) === count(ZEITEN) ? '24/7' : 'business',
    'emergencyService' => $b['notdienst'] === 'ja',
    'phone' => $b['tel'],
    'email' => $b['email'],
  ] + ($b['reaktionszeit'] === '' ? [] : ['responseTime' => (int) $b['reaktionszeit']]) + ['partnerStatus' => 'PENDING'];
  $wert = fn($w) => is_array($w) ? '[' . implode(', ', array_map(fn($x) => var_export($x, true), $w)) . ']' : var_export($w, true);
  return "[\n" . implode('', array_map(fn($k, $w) => "  '$k' => " . $wert($w) . ",\n", array_keys($e), $e)) . ']';
}

/* Gerüst der beiden Bewerbungs-Mails im Stil der Mails oben. $inhalt sind Tabellenzeilen <tr>…</tr>. */
function rahmen(string $untertitel, string $inhalt): string {
  $f = FARBE;
  return <<<HTML
  <div style="margin:0;padding:24px 12px;background:#F4F7FB;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
      style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:16px;
      overflow:hidden;box-shadow:0 2px 12px rgba(15,29,46,.08);">

      <tr><td style="background:{$f['navy']};padding:22px 26px;">
        <div style="font-size:21px;font-weight:800;color:#FFFFFF;letter-spacing:-.02em;">
          fixit<span style="color:{$f['orange']};">247</span></div>
        <div style="font-size:12px;color:rgba(255,255,255,.72);margin-top:3px;">
          {$untertitel}</div>
      </td></tr>
      {$inhalt}
    </table>
  </div>
  HTML;
}

/* Abschnitt mit kleiner Überschrift; $html ist schon escaped. */
function abschnitt(string $titel, string $html): string {
  $f = FARBE;
  return <<<HTML
  <tr><td style="padding:16px 26px 4px;">
    <div style="font-size:12px;font-weight:700;letter-spacing:.08em;
      text-transform:uppercase;color:{$f['grau']};margin-bottom:8px;">{$titel}</div>
    {$html}
  </td></tr>
  HTML;
}

/* Mail an fixit247: alle Angaben, Prüfliste von Beks und der Eintrag für die Partnerliste zum Kopieren. */
function bewerbungMelden(array $b, string $empfaenger): void {
  $f = FARBE;
  $namen = array_column(gewerke(), 'name', 'id');
  $janein = fn(string $w): string => $w === 'ja' ? 'Ja' : 'Nein';
  $angaben = [
    'Firma' => $b['firma'],
    'Ansprechperson' => $b['ansprechperson'],
    'Telefon' => $b['tel'],
    'E-Mail' => $b['email'],
    'GISA-Zahl' => implode(', ', array_map(fn($z) => "$z (" . GISA_ABFRAGE . ')', $b['gisa'])),
    'UID-Nummer' => $b['uid'] ?: 'nicht angegeben',
    'Gewerke' => implode(', ', array_map(fn($g) => $namen[$g], $b['gewerke'])),
    'Einsatzgebiet' => count($b['plz']) . ' PLZ: ' . implode(', ', $b['plz']),
    'Erreichbarkeit' => implode(', ', array_map(fn($z) => ZEITEN[$z], $b['zeiten'])),
    'Notdienst' => $janein($b['notdienst']),
    'Bei Notfällen vor Ort in' => $b['reaktionszeit'] === '' ? 'nicht angegeben' : "{$b['reaktionszeit']} Minuten",
    'Richtpreise' => ['ja' => 'Ja', 'abweichung' => "Ja, mit Abweichungen: {$b['abweichungen']}", 'nein' => 'Nein'][$b['richtpreise']],
    'Betriebshaftpflicht' => $janein($b['haftpflicht']),
    'Preis vor Arbeitsbeginn' => $janein($b['preisVorab']),
    'Karte oder Überweisung' => $janein($b['unbar']),
  ];
  $pruefliste = [
    '☐ GISA-Abfrage (Link): Passt die Gewerbeberechtigung zu jedem gewählten Gewerk?',
    '☐ Versicherungsnachweis erhalten',
    '☐ Gespräch geführt',
    '☐ Erst danach in die Partnerliste: PENDING → ACTIVE',
  ];
  $eintrag = partnerEintrag($b) . ',';
  $eintragTitel = "Eintrag für die Partnerliste (fixit247-konfig.php, unter 'partner')";

  $link = fn(string $href, string $text): string => "<a href=\"$href\" style=\"color:{$f['navy']};\">$text</a>";
  $telLink = esc(preg_replace('/[^\d+]/', '', $b['tel']));
  $h = array_map('esc', $angaben);
  $h['Telefon'] = $link("tel:$telLink", $h['Telefon']);
  $h['E-Mail'] = $link('mailto:' . esc($b['email']), $h['E-Mail']);
  $h['GISA-Zahl'] = implode('<br>', array_map(fn($z) => esc($z) . ' · ' . $link(GISA_ABFRAGE, 'GISA-Abfrage'), $b['gisa']));
  $zeilen = implode('', array_map(fn($l, $w) => zeile(esc($l), $w), array_keys($h), $h));
  $pruefHtml = str_replace('(Link)', '(' . $link(GISA_ABFRAGE, 'Link') . ')', implode('<br>', array_map('esc', $pruefliste)));
  $person = esc($b['ansprechperson']);
  $id = esc($b['bewerbungId']);

  $html = rahmen('Neue Partner-Bewerbung', <<<HTML
      <tr><td style="padding:24px 26px 8px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          {$zeilen}
        </table>
      </td></tr>
    HTML
    . abschnitt('Schwerpunkte und Anmerkungen', "<div style=\"background:#F4F7FB;border-radius:12px;padding:16px 18px;
        font-size:15px;line-height:1.55;color:{$f['tinte']};\">" . str_replace("\n", '<br>', esc($b['anmerkungen'] ?: '—')) . '</div>')
    . abschnitt('Prüfliste', "<div style=\"font-size:15px;line-height:1.9;color:{$f['tinte']};\">$pruefHtml</div>")
    . abschnitt(esc($eintragTitel), "<pre style=\"margin:0;background:#F4F7FB;border-radius:12px;padding:14px 16px;
        font-size:13px;line-height:1.5;color:{$f['tinte']};white-space:pre-wrap;word-break:break-all;\">" . esc($eintrag) . '</pre>')
    . <<<HTML
      <tr><td style="padding:20px 26px 8px;">
        <a href="tel:{$telLink}" style="display:block;background:{$f['orange']};
          color:#FFFFFF;text-decoration:none;text-align:center;font-size:16px;font-weight:700;
          padding:15px 20px;border-radius:12px;">{$person} anrufen</a>
      </td></tr>

      <tr><td style="padding:18px 26px 24px;">
        <div style="border-top:1px solid {$f['linie']};padding-top:16px;font-size:12px;
          line-height:1.6;color:{$f['grau']};">
          DSGVO-Zustimmung: <b style="color:{$f['tinte']};">erteilt</b> · Bewerbungs-ID {$id}<br>
          <b style="color:{$f['tinte']};">fixit247</b> · digitale 24/7 Vermittlungsplattform für Fachbetriebe
        </div>
      </td></tr>
    HTML);

  $plain = implode("\n", [
    'Neue Partner-Bewerbung über fixit247', '',
    ...array_map(fn($l, $w) => "$l:" . str_repeat(' ', max(1, 26 - mb_strlen($l))) . $w, array_keys($angaben), $angaben), '',
    'Schwerpunkte und Anmerkungen:', ($b['anmerkungen'] ?: '-'), '',
    'Prüfliste:', $pruefliste[0], '  ' . GISA_ABFRAGE, ...array_slice($pruefliste, 1), '',
    "$eintragTitel:", $eintrag, '',
    'DSGVO-Zustimmung: erteilt · Bewerbungs-ID ' . $b['bewerbungId'],
  ]);

  sende($empfaenger, 'Neue Partner-Bewerbung: ' . mb_substr($b['firma'], 0, 80), $plain, $html, 'fixit247 Website', $b['email']);
}

/* Bestätigung an den Betrieb. Wie bei der Kundenbestätigung geht sie an eine frei eingetragene Adresse: kein Freitext
   des Absenders (keine Anmerkungen, keine Abweichungen), Firma und Ansprechperson nur gefiltert, Gewerke aus gewerke().
   Kein Versprechen von Aufträgen oder Fristen. */
function bewerbungBestaetigen(array $b, string $antwortAn): void {
  $f = FARBE;
  $kontakt = kontakt();
  $telLink = 'tel:' . preg_replace('/[^\d+]/', '', $kontakt['telefon']);
  $telefon = esc($kontakt['telefon']);
  $mail = esc($kontakt['email']);
  $ohneLinks = fn(string $s): string => (string) preg_replace('/\S+\.\S+/u', ' ', $s);
  $k = [
    'person' => nurZeichen($ohneLinks($b['ansprechperson']), "/[^A-Za-zÀ-ÖØ-öø-ÿ' .-]/u", 60),
    'firma' => nurZeichen($ohneLinks($b['firma']), "/[^A-Za-zÀ-ÖØ-öø-ÿ0-9&' .,-]/u", 80) ?: '—',
    'gewerke' => implode(', ', array_map(fn($g) => array_column(gewerke(), 'name', 'id')[$g], $b['gewerke'])),
  ];
  $e = array_map('esc', $k);
  $gruss = $k['person'] === '' ? '' : ' ' . $k['person'];
  $grussHtml = esc($gruss);
  $danke = 'vielen Dank für Ihre Bewerbung als Partnerbetrieb. Wir sehen uns Ihre Angaben an und melden uns persönlich bei Ihnen.';
  $hinweis = 'fixit247 vermittelt Anfragen an selbstständige, entsprechend berechtigte Fachbetriebe. Die handwerkliche '
    . 'Leistung erbringt ausschließlich der jeweilige Fachbetrieb. Termin, Preis, Durchführung und Rechnung vereinbart '
    . 'der Fachbetrieb direkt mit dem Kunden.';
  $kosten = esc(KOSTEN);

  $html = rahmen('Digitale 24/7 Vermittlungsplattform für Fachbetriebe', <<<HTML
      <tr><td style="padding:30px 26px 4px;text-align:center;">
        <div style="width:56px;height:56px;border-radius:50%;background:#E8F6ED;
          margin:0 auto 16px;line-height:56px;font-size:27px;color:#22A758;">&#10003;</div>
        <div style="font-size:22px;font-weight:800;color:{$f['tinte']};
          letter-spacing:-.02em;margin-bottom:8px;">Ihre Bewerbung ist angekommen</div>
        <div style="font-size:15px;line-height:1.6;color:{$f['grau']};">
          Guten Tag{$grussHtml},<br>{$danke}</div>
      </td></tr>

      <tr><td style="padding:18px 26px 6px;">
        <div style="font-size:15px;line-height:1.6;color:{$f['tinte']};">{$kosten}</div>
      </td></tr>

      <tr><td style="padding:14px 26px 6px;">
        <div style="background:#F4F7FB;border-radius:12px;padding:18px 20px;">
          <div style="font-size:12px;font-weight:700;letter-spacing:.08em;
            text-transform:uppercase;color:{$f['grau']};margin-bottom:10px;">Ihre Angaben</div>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
            style="font-size:14px;color:{$f['tinte']};">
            <tr><td style="padding:3px 0;color:{$f['grau']};width:120px;">Firma</td>
              <td style="padding:3px 0;font-weight:600;">{$e['firma']}</td></tr>
            <tr><td style="padding:3px 0;color:{$f['grau']};">Gewerke</td>
              <td style="padding:3px 0;font-weight:600;">{$e['gewerke']}</td></tr>
          </table>
        </div>
      </td></tr>

      <tr><td style="padding:20px 26px 8px;">
        <a href="{$telLink}" style="display:block;background:{$f['orange']};
          color:#FFFFFF;text-decoration:none;text-align:center;font-size:16px;font-weight:700;
          padding:15px 20px;border-radius:12px;">Fragen? Jetzt anrufen: {$telefon}</a>
      </td></tr>

      <tr><td style="padding:16px 26px 24px;">
        <div style="border-top:1px solid {$f['linie']};padding-top:16px;font-size:12px;
          line-height:1.65;color:{$f['grau']};">
          <b style="color:{$f['tinte']};">fixit247</b> · digitale 24/7 Vermittlungsplattform für Fachbetriebe<br>
          <a href="{$telLink}" style="color:{$f['navy']};">{$telefon}</a> ·
          <a href="mailto:{$mail}" style="color:{$f['navy']};">{$mail}</a><br>
          <span style="color:#8A9AAE;">{$hinweis}</span>
        </div>
      </td></tr>
    HTML);

  $plain = implode("\n", [
    'Ihre Bewerbung ist angekommen', '',
    "Guten Tag$gruss,", $danke, '',
    KOSTEN, '',
    'Ihre Angaben:',
    'Firma:            ' . $k['firma'],
    'Gewerke:          ' . $k['gewerke'], '',
    'Fragen? Rufen Sie an: ' . $kontakt['telefon'], '',
    'fixit247 · digitale 24/7 Vermittlungsplattform für Fachbetriebe',
    $kontakt['telefon'] . ' · ' . $kontakt['email'], '',
    $hinweis,
  ]);

  sende($b['email'], 'Ihre Bewerbung bei fixit247 ist angekommen', $plain, $html, 'fixit247', $antwortAn);
}

/* ================= EINGANG ================= */
/* Bis hierher nur Funktionen: Tests laden die Datei mit `php -r "require …"` und rufen sie einzeln auf. */
if (PHP_SAPI === 'cli') return;

$p = $_POST;
$partner = ($p['art'] ?? '') === 'partner';
/* Honigtopf: das Feld "fax" sieht kein Mensch, ausgefüllt heißt Bot. Antwort wie bei Erfolg, ohne Mail und ohne
   Speicherung, damit der Bot nichts merkt. */
if (($p['fax'] ?? '') !== '') antwort($partner ? ['ok' => true] : ['ok' => true, 'match' => 'NONE']);
foreach ($p as $k => $v)
  if (!is_string($v) || mb_strlen($v) > ($k === 'text' ? MAX_TEXT : MAX_FELD)) antwort(['ok' => false, 'error' => 'bad_request']);

/* Doppelte Sendung (Doppelklick, erneuter Versuch nach Timeout, Neuladen): gleiche anfrageId bzw. bewerbungId
   innerhalb von 10 Minuten wird nicht noch einmal verschickt und verbraucht kein Kontingent.
   ponytail: zwei gleichzeitige Aufrufe mit derselben Id gehen beide durch, wie beim Apps Script. */
$id = $p[$partner ? 'bewerbungId' : 'anfrageId'] ?? '';
$id = preg_match('/^[A-Za-z0-9-]{6,40}$/D', $id) ? $id : '';
$doppelt = $id === '' ? '' : daten('doppelt') . "/$id.json";
$vorher = $doppelt !== '' && is_file($doppelt) && filemtime($doppelt) >= time() - 600 ? json_decode((string) file_get_contents($doppelt), true) : null;
if (is_array($vorher)) antwort($vorher);
if (!kontingentFrei($partner ? 'partner' : 'anfrage', $partner ? KONTINGENT_PARTNER : KONTINGENT_ANFRAGE))
  antwort(['ok' => false, 'error' => 'limit']);

/* art=partner geht in den eigenen Zweig, jede andere art endet in anfrageEingang (bad_request, außer art=anfrage). */
try {
  $ergebnis = $partner ? partnerEingang($p) : anfrageEingang($p);
} catch (Throwable $fehler) {
  error_log('fixit247 Eingang-Fehler: ' . $fehler->getMessage());
  antwort(['ok' => false, 'error' => 'upstream']);
}
if ($doppelt !== '' && $ergebnis['ok']) {
  @file_put_contents($doppelt, json_encode($ergebnis));
  foreach (glob(dirname($doppelt) . '/*.json') ?: [] as $alt) if (filemtime($alt) < time() - 600) @unlink($alt);
}
antwort($ergebnis);
