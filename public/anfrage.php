<?php
/* Anfrage-Eingang für Formular und Luna (src/lib/submitLead.ts).
   POST application/x-www-form-urlencoded mit art=anfrage, anfrageId, name, tel, email, plz, ort, kategorie, bereich,
   dringlichkeit, wunschtermin, text, antworten, dsgvo. Antwort immer JSON:
   { ok:true, match:'FOUND'|'NONE' } bzw. { ok:false, error:'bad_request'|'limit'|'upstream' }.
   Ablauf: Honigtopf, Feldlängen, Doppelsendung, Kontingent je IP, Pflichtfelder, Matching gegen die Partnerliste
   (§26–§29), Speicherung als Datei, Mail an fixit247, Mail an den Partnerbetrieb, Bestätigung an den Kunden.
   Konfiguration (Empfänger, Absender, Partnerliste) siehe _basis.php und docs/hosting.md. */

require __DIR__ . '/_basis.php';

const EMPFAENGER = 'support@fixit247.at';   /* Standard für 'empfaenger' und 'absender' in der Konfiguration */
/* ponytail: je IP und 6 Stunden. Hinter Carrier-NAT teilen sich viele Kunden eine IP, daher großzügig. */
const KONTINGENT_ANFRAGE = 30;
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
    'partnerStatus' => 'ACTIVE' | 'PAUSED' | 'PENDING'] */

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

/* Nacht (18–08 Uhr) oder Sonntag in Wiener Zeit, entspricht der Zuschlagsregel. */
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
      ], $empfaenger);
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

function bestaetigungSenden(string $email, array $k, string $antwortAn): void {
  $f = FARBE;
  $kontakt = kontakt();
  $telLink = 'tel:' . preg_replace('/[^\d+]/', '', $kontakt['telefon']);
  $telefon = esc($kontakt['telefon']);
  $mail = esc($kontakt['email']);
  $e = array_map('esc', $k);
  $gruss = $e['name'] === '' ? '' : ' ' . $e['name'];
  $schritte = schritt(1, 'Rückruf', "fixit247 oder der vermittelte Fachbetrieb meldet sich telefonisch unter {$e['tel']}.")
    . schritt(2, 'Passender Fachbetrieb', 'Wir vermitteln Ihre Anfrage an einen passenden Fachbetrieb in Ihrer Nähe.')
    . schritt(3, 'Direkt mit dem Fachbetrieb',
      'Termin, Preis, Durchführung und Rechnung stimmen Sie direkt mit dem Fachbetrieb ab. Die Vermittlung ist für Sie kostenlos.');

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
          Wir vermitteln Ihre Anfrage an einen passenden Fachbetrieb.</div>
      </td></tr>

      <tr><td style="padding:26px 26px 6px;">
        <div style="font-size:12px;font-weight:700;letter-spacing:.08em;
          text-transform:uppercase;color:{$f['grau']};margin-bottom:14px;">Wie es weitergeht</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          {$schritte}
        </table>
      </td></tr>

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
    'vielen Dank für Ihr Vertrauen. Wir vermitteln Ihre Anfrage an einen passenden Fachbetrieb.', '',
    'Wie es weitergeht:',
    '1. fixit247 oder der vermittelte Fachbetrieb meldet sich telefonisch unter ' . $k['tel'] . '.',
    '2. Wir vermitteln Ihre Anfrage an einen passenden Fachbetrieb in Ihrer Nähe.',
    '3. Termin, Preis, Durchführung und Rechnung stimmen Sie direkt mit dem Fachbetrieb ab. Die Vermittlung ist für Sie kostenlos.', '',
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

/* ================= EINGANG ================= */
/* Bis hierher nur Funktionen: Tests laden die Datei mit `php -r "require …"` und rufen sie einzeln auf. */
if (PHP_SAPI === 'cli') return;

$p = $_POST;
/* Honigtopf: das Feld "fax" sieht kein Mensch, ausgefüllt heißt Bot. */
if (($p['fax'] ?? '') !== '') antwort(['ok' => true, 'match' => 'NONE']);
foreach ($p as $k => $v)
  if (!is_string($v) || mb_strlen($v) > ($k === 'text' ? MAX_TEXT : MAX_FELD)) antwort(['ok' => false, 'error' => 'bad_request']);

/* Doppelte Anfrage (Doppelklick, erneuter Versuch nach Timeout, Neuladen): gleiche anfrageId innerhalb von
   10 Minuten wird nicht noch einmal verschickt und verbraucht kein Kontingent.
   ponytail: zwei gleichzeitige Aufrufe mit derselben Id gehen beide durch, wie beim Apps Script. */
$id = preg_match('/^[A-Za-z0-9-]{6,40}$/', $p['anfrageId'] ?? '') ? $p['anfrageId'] : '';
$doppelt = $id === '' ? '' : daten('doppelt') . "/$id.json";
$vorher = $doppelt !== '' && is_file($doppelt) && filemtime($doppelt) >= time() - 600 ? json_decode((string) file_get_contents($doppelt), true) : null;
if (is_array($vorher)) antwort($vorher);
if (!kontingentFrei('anfrage', KONTINGENT_ANFRAGE)) antwort(['ok' => false, 'error' => 'limit']);

try {
  $ergebnis = anfrageEingang($p);
} catch (Throwable $fehler) {
  error_log('fixit247 Eingang-Fehler: ' . $fehler->getMessage());
  antwort(['ok' => false, 'error' => 'upstream']);
}
if ($doppelt !== '' && $ergebnis['ok']) {
  @file_put_contents($doppelt, json_encode($ergebnis));
  foreach (glob(dirname($doppelt) . '/*.json') ?: [] as $alt) if (filemtime($alt) < time() - 600) @unlink($alt);
}
antwort($ergebnis);
