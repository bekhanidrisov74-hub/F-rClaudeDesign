/* Anfrage-Eingang fuer fixit247 — als Google-Apps-Script-Web-App deployen.
   Nimmt Kundenanfragen von Luna (src/luna) und vom Anfrageformular (src/lib/submitLead.ts) sowie
   Partneranfragen vom Partnerformular entgegen (Feld art = anfrage | partner),
   verschickt die E-Mails und fuehrt fuer Kundenanfragen das Matching gegen die
   Partnerliste aus (§26–§29). Antwort ist immer JSON:
   { ok:true, match:'FOUND'|'NONE' } fuer Anfragen, { ok:true } fuer Partner,
   { ok:false, error:'bad_request'|'limit'|'upstream' } bei Fehlern.

   Erstmalig:  script.google.com -> Neues Projekt -> Code einfuegen ->
               Bereitstellen -> Neue Bereitstellung -> Web-App
               -> "Ausfuehren als: Ich", "Zugriff: Jeder" -> URL beim Build als VITE_FORM_ENDPOINT setzen.
   Nach jeder Aenderung: Bereitstellen -> Bereitstellungen verwalten -> Stift
               -> Version "Neu" -> Bereitstellen. Sonst laeuft die alte Fassung weiter.
   Die Website wertet ausschliesslich JSON: eine alte Bereitstellung (Antwort "OK")
   zeigt dem Kunden einen Sendefehler. Also immer gemeinsam mit dem Push bereitstellen.
   GEWERK und KONTAKT sind Kopien aus src/content/gewerke.ts und src/content/contact.ts;
   src/luna/backend.test.ts schlaegt an, wenn sie abweichen. */

/* Empfaenger — hier aendern, mehrere mit Komma trennen */
var EMPFAENGER = 'support@fixit247.at';

var KONTINGENT = 300;            /* Eingaenge je 6-Stunden-Fenster (CacheService-Maximum) */
var MAX_FELD = 2000, MAX_TEXT = 6000;
var ZEITZONE = 'Europe/Vienna';  /* unabhaengig von der Skript-Zeitzone */
var EMAIL_RE = /^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/;
var PLZ_RE = /^[1-9]\d{3}$/;

/* ================= PARTNER + MATCHING (§26–§29) ================= */
/* Echte Partnerbetriebe hier eintragen. Nur partnerStatus 'ACTIVE' wird
   automatisch vermittelt (§28). Die Liste bleibt serverseitig – nichts davon
   erreicht den Browser (§43). Solange sie leer ist, endet jedes Matching mit
   NONE und Luna zeigt den Text aus §29.
   Felder (§26):
   { id:'p1', company:'Muster GmbH', contact:'Max Muster', trades:['installateur','shk'],
     specializations:['gastherme'], postalCodes:['1100','1110','1120'], serviceRadius:25,
     availability:'24/7' | 'business', emergencyService:true, phone:'+43…', whatsapp:'+43…',
     email:'office@…', pricing:'low' | 'mid' | 'high', travelFee:29.90, responseTime:45 (Minuten),
     rating:4.6, completedJobs:120, cancellationRate:0.02, reliabilityScore:0.95,
     partnerStatus:'ACTIVE' | 'PAUSED' | 'PENDING' } */
var PARTNER = [];

/* Gewerknamen wie src/content/gewerke.ts – die Kundenmail zeigt nur diese. */
var GEWERK = {
  installateur: 'Installateur', shk: 'Heizung & Klima', schluessel: 'Schlüsseldienst',
  elektro: 'Elektro', geraete: 'Haushaltsgeräte'
};

/* Kontakt wie src/content/contact.ts – erscheint in der Bestaetigung an den Kunden. */
var KONTAKT = { telefon: '[Telefonnummer]', whatsapp: '[WhatsApp-Nummer]', email: '[E-Mail-Adresse]' };
function kontaktTelLink() { return 'tel:' + KONTAKT.telefon.replace(/[^\d+]/g, ''); }

/* Werte fuer die Kundenmail: Die Bestaetigung geht an eine vom Absender
   gewaehlte Adresse – freie Felder darin waeren ein Spam-Relais mit unserem
   Absender. Daher nur erlaubte Zeichen, kurz, ohne Links (Tokens mit Punkt in der
   Mitte wie spam.example werden vorher gestrichen) und ohne Ziffern im Namen. */
function nurZeichen(s, erlaubt, max) {
  return String(s == null ? '' : s).replace(erlaubt, '').replace(/\s{2,}/g, ' ').trim().slice(0, max);
}
function gewerkName(bereich, kategorie) {
  if (GEWERK[kategorie]) return GEWERK[kategorie];
  for (var k in GEWERK) if (GEWERK[k] === bereich) return GEWERK[k];
  return '';
}

/* Gewichte in der Prioritaet aus §27 (Gewerk ist Pflichtfilter, kein Gewicht).
   Zentral aenderbar. */
var GEWICHTE = {
  distanz: 30, verfuegbarkeit: 22, spezialisierung: 14, reaktionszeit: 12,
  qualitaet: 10, preis: 7, bewertung: 5
};

/* ponytail: Distanz ohne Geodaten ueber die PLZ-Struktur (gleiche PLZ 1,
   gleiche zwei Anfangsziffern .6, gleiche Region .3). Bei Bedarf serviceRadius
   mit echten Koordinaten berechnen. */
function distanzScore(partner, plz) {
  var codes = partner.postalCodes || [];
  if (!plz) return codes.length ? 0.3 : 0;
  if (codes.indexOf(plz) !== -1) return 1;
  for (var i = 0; i < codes.length; i++) if (String(codes[i]).slice(0, 2) === plz.slice(0, 2)) return 0.6;
  for (var j = 0; j < codes.length; j++) if (String(codes[j]).charAt(0) === plz.charAt(0)) return 0.3;
  return 0;
}

/* Nacht (18–08 Uhr) oder Sonntag in Wiener Zeit – entspricht der Zuschlagsregel. */
function ausserhalb(jetzt) {
  var h = Number(Utilities.formatDate(jetzt, ZEITZONE, 'H'));
  var tag = Utilities.formatDate(jetzt, ZEITZONE, 'u');   /* 1 = Montag … 7 = Sonntag */
  return h >= 18 || h < 8 || tag === '7';
}

function verfuegbarkeitScore(partner, req, jetzt) {
  var draussen = ausserhalb(jetzt);
  if (req.urgency === 'NORMAL' && !draussen) return 1;
  if (partner.availability === '24/7') return partner.emergencyService ? 1 : 0.8;
  if (draussen) return partner.emergencyService ? 0.7 : 0;
  return 0.6;
}

function scorePartner(partner, req, jetzt) {
  var text = String(req.text || '').toLowerCase();
  var spez = (partner.specializations || []).some(function (sp) { return text.indexOf(String(sp).toLowerCase()) !== -1; }) ? 1 : 0.4;
  var reaktion = partner.responseTime == null ? 0.5 : Math.max(0, 1 - partner.responseTime / 180);
  var qualitaet = partner.reliabilityScore == null ? 0.5 : Math.max(0, Math.min(1, partner.reliabilityScore - (partner.cancellationRate || 0)));
  var preis = { low: 1, mid: 0.7, high: 0.4 }[partner.pricing] || 0.6;
  var bewertung = partner.rating == null ? 0.5 : Math.max(0, Math.min(1, partner.rating / 5));
  return GEWICHTE.distanz * distanzScore(partner, req.plz)
    + GEWICHTE.verfuegbarkeit * verfuegbarkeitScore(partner, req, jetzt)
    + GEWICHTE.spezialisierung * spez
    + GEWICHTE.reaktionszeit * reaktion
    + GEWICHTE.qualitaet * qualitaet
    + GEWICHTE.preis * preis
    + GEWICHTE.bewertung * bewertung;
}

/* Liefert den besten aktiven Partner fuer das Gewerk oder null. Partner ohne
   jede Naehe (distanzScore 0) oder ohne Verfuegbarkeit fallen heraus. */
function match(req, partner, jetzt) {
  partner = partner || PARTNER; jetzt = jetzt || new Date();
  var kandidaten = partner.filter(function (p) {
    return p.partnerStatus === 'ACTIVE' && (p.trades || []).indexOf(req.category) !== -1
      && distanzScore(p, req.plz) > 0 && verfuegbarkeitScore(p, req, jetzt) > 0;
  }).map(function (p) { return { partner: p, score: scorePartner(p, req, jetzt) }; })
    .sort(function (a, b) { return b.score - a.score; });
  return kandidaten.length ? kandidaten[0] : null;
}

/* Im Editor ausfuehren (sendet keine Mail): prueft die Zeitzonenformate 'H'/'u'
   von Utilities.formatDate, die offline nur gestubbt sind, und ein Matching
   gegen einen Beispielpartner. Wirft, wenn kein Match entsteht. */
function testEingang() {
  var jetzt = new Date();
  Logger.log('ausserhalb(%s) = %s', jetzt, ausserhalb(jetzt));
  var probe = [{ id: 'probe', company: 'Probe-Betrieb', trades: ['shk'], postalCodes: ['1100'],
    availability: '24/7', emergencyService: true, partnerStatus: 'ACTIVE' }];
  var m = match({ category: 'shk', plz: '1100', urgency: 'URGENT', text: 'Heizung ausgefallen' }, probe, jetzt);
  if (!m) throw new Error('Kein Match fuer den Beispielpartner – Verfuegbarkeits- oder Distanzlogik pruefen');
  Logger.log('match: %s mit %s Punkten', m.partner.company, m.score.toFixed(1));
}

/* ================= EINGANG ================= */
var FARBE = { navy:'#17457C', orange:'#F2761B', linie:'#E3EAF3', grau:'#6B7C93', tinte:'#0F1D2E' };

/* Nutzereingaben nie ungeprueft ins HTML — sonst zerlegt ein "<" das Layout. */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function zeile(label, wert) {
  return `<tr>
    <td style="padding:11px 0;border-bottom:1px solid ${FARBE.linie};font-size:13px;
      color:${FARBE.grau};white-space:nowrap;vertical-align:top;">${label}</td>
    <td style="padding:11px 0 11px 18px;border-bottom:1px solid ${FARBE.linie};
      font-size:15px;color:${FARBE.tinte};font-weight:600;">${wert}</td>
  </tr>`;
}

function antwort(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() { return antwort({ ok: true }); }

/* Verteiler: Honigtopf, Feldlaengen, Doppelsendung, Kontingent, dann Anfrage oder Partner. */
function doPost(e) {
  var p = (e && e.parameter) || {};
  try {
    /* Honigtopf: das Feld "fax" sieht kein Mensch – ausgefuellt heisst Bot. */
    if (p.fax) return antwort({ ok: true, match: 'NONE' });
    for (var k in p) if (String(p[k]).length > (k === 'text' ? MAX_TEXT : MAX_FELD)) return antwort({ ok: false, error: 'bad_request' });
    var cache = CacheService.getScriptCache();
    /* Doppelte Anfrage (Doppelklick, erneuter Versuch nach Timeout, Neuladen):
       gleiche anfrageId innerhalb von 10 Minuten wird nicht noch einmal verschickt. */
    var id = /^[A-Za-z0-9-]{6,40}$/.test(p.anfrageId || '') ? p.anfrageId : '';
    if (id) { var vorher = cache.get('req-' + id); if (vorher) return antwort(JSON.parse(vorher)); }
    if (!kontingentFrei(cache)) return antwort({ ok: false, error: 'limit' });
    var ergebnis = p.art === 'partner' ? partnerEingang(p) : anfrageEingang(p);
    if (id && ergebnis.ok) cache.put('req-' + id, JSON.stringify(ergebnis), 600);
    return antwort(ergebnis);
  } catch (fehler) {
    Logger.log('Eingang-Fehler: %s', fehler.message);
    return antwort({ ok: false, error: 'upstream' });
  }
}

/* Grobes Kontingent gegen Missbrauch der oeffentlichen URL; Apps Script kennt
   keine Client-IP, daher global statt je Absender. Der Zaehler wird gesperrt,
   damit parallele Aufrufe ihn nicht ueberschreiben. */
function kontingentFrei(cache) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(3000); } catch (e) { return true; }
  try {
    var key = 'in-' + Math.floor(Date.now() / 21600000);
    var n = Number(cache.get(key) || 0) + 1;
    cache.put(key, String(n), 21600);
    return n <= KONTINGENT;
  } finally { lock.releaseLock(); }
}

/* ================= PARTNERANFRAGE (§37) ================= */
function partnerEingang(p) {
  if (!p.firma || !p.name || !p.tel || !p.email || !p.bereich || !p.dsgvo) return { ok: false, error: 'bad_request' };
  if (!EMAIL_RE.test(p.email) || !PLZ_RE.test(p.plz || '') || String(p.tel).replace(/\D/g, '').length < 6) return { ok: false, error: 'bad_request' };
  Logger.log('Partneranfrage: %s | PLZ %s', p.bereich, p.plz);
  var felder = [
    ['Firma', p.firma], ['Ansprechpartner', p.name], ['Gewerk', p.bereich], ['PLZ', p.plz],
    ['Einsatzgebiet', p.gebiet], ['Telefon', p.tel], ['E-Mail', p.email], ['Website', p.website],
    ['24/7 verfügbar', p.rund_um_die_uhr ? 'ja' : 'nein'], ['Notdienst', p.notdienst ? 'ja' : 'nein'],
    ['Anmerkungen', p.text], ['Einwilligung', 'erteilt']
  ];
  var zeilen = felder.map(function (f) { return zeile(f[0], esc(f[1] || '—').replace(/\n/g, '<br>')); }).join('');
  var html = `
  <div style="margin:0;padding:24px 12px;background:#F4F7FB;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
      style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:16px;overflow:hidden;">
      <tr><td style="background:${FARBE.navy};padding:22px 26px;">
        <div style="font-size:21px;font-weight:800;color:#FFFFFF;">fixit<span style="color:${FARBE.orange};">247</span></div>
        <div style="font-size:12px;color:rgba(255,255,255,.72);margin-top:3px;">Neue Partneranfrage (Fachbetrieb werden)</div>
      </td></tr>
      <tr><td style="padding:24px 26px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${zeilen}</table></td></tr>
    </table>
  </div>`;
  MailApp.sendEmail({
    to: EMPFAENGER, name: 'fixit247 Website', replyTo: p.email,
    subject: `Partneranfrage: ${p.bereich} — ${p.firma}`,
    body: felder.map(function (f) { return f[0] + ': ' + (f[1] || '-'); }).join('\n'),
    htmlBody: html
  });
  return { ok: true };
}

/* ================= KUNDENANFRAGE ================= */
function anfrageEingang(p) {
  /* Ohne Name, Telefon und Einwilligung ist die Anfrage wertlos — Bots und
     Fehlaufrufe laufen hier auf, bevor sie Postfach und Kontingent belasten. */
  if (!p.name || !p.tel || !p.dsgvo || String(p.tel).replace(/\D/g, '').length < 6) return { ok: false, error: 'bad_request' };
  var email = EMAIL_RE.test(p.email || '') ? p.email : '';
  var plz = (String(p.plz || p.ort || '').match(/\b[1-9]\d{3}\b/) || [''])[0];
  var kategorie = /^[a-z]{2,20}$/.test(p.kategorie || '') ? p.kategorie : '';
  var dringlichkeit = /^(NORMAL|URGENT|ACUTE)$/.test(p.dringlichkeit || '') ? p.dringlichkeit : '';

  /* Matching gegen die Partnerliste – ein fehlerhafter Partnereintrag darf den
     Eingang nie blockieren: dann NONE und Protokoll. */
  var treffer = null;
  try {
    treffer = match({ category: kategorie, plz: plz, urgency: dringlichkeit || 'URGENT', text: p.text || '' });
  } catch (fehler) {
    Logger.log('Matching-Fehler (Partnerliste pruefen): %s', fehler.message);
  }
  var matchText = treffer
    ? 'FOUND – ' + treffer.partner.company + ' (' + treffer.partner.id + ', Score ' + treffer.score.toFixed(0) + ')'
    : 'NONE – kein aktiver Partner passt, bitte manuell vermitteln';

  /* Protokoll ohne Klardaten (keine Namen, keine Telefonnummern). */
  Logger.log('Anfrage %s: %s | PLZ %s | %s', p.anfrageId || '-', p.bereich || kategorie || '-', plz || '-', matchText);

  var name = esc(p.name),
      tel = esc(p.tel),
      telLink = esc(String(p.tel).replace(/[^\d+]/g, '')),
      ort = esc(p.ort || '—'),
      bereich = esc(p.bereich || kategorie || '—'),
      text = esc(p.text || '—').replace(/\n/g, '<br>'),
      dringText = esc({ ACUTE: 'AKUT – Gefahr oder laufender Schaden', URGENT: 'Dringend', NORMAL: 'Normal' }[dringlichkeit] || '—'),
      wunschtermin = esc(p.wunschtermin || '—');

  var html = `
  <div style="margin:0;padding:24px 12px;background:#F4F7FB;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
      style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:16px;
      overflow:hidden;box-shadow:0 2px 12px rgba(15,29,46,.08);">

      <tr><td style="background:${FARBE.navy};padding:22px 26px;">
        <div style="font-size:21px;font-weight:800;color:#FFFFFF;letter-spacing:-.02em;">
          fixit<span style="color:${FARBE.orange};">247</span></div>
        <div style="font-size:12px;color:rgba(255,255,255,.72);margin-top:3px;">
          Neue Kundenanfrage</div>
      </td></tr>

      <tr><td style="padding:24px 26px 8px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          ${zeile('Name', name)}
          ${zeile('Telefon', `<a href="tel:${telLink}"
            style="color:${FARBE.orange};text-decoration:none;font-weight:700;">${tel}</a>`)}
          ${zeile('E-Mail', email
            ? `<a href="mailto:${esc(email)}" style="color:${FARBE.navy};text-decoration:none;">${esc(email)}</a>`
            : '<span style="color:#8A9AAE;font-weight:400;">nicht angegeben</span>')}
          ${zeile('PLZ und Ort', ort)}
          ${zeile('Gewerk', bereich)}
          ${zeile('Dringlichkeit', dringText)}
          ${zeile('Wunschtermin', wunschtermin)}
          ${zeile('Matching', esc(matchText))}
        </table>
      </td></tr>

      <tr><td style="padding:16px 26px 4px;">
        <div style="font-size:12px;font-weight:700;letter-spacing:.08em;
          text-transform:uppercase;color:${FARBE.grau};margin-bottom:8px;">Was ist passiert?</div>
        <div style="background:#F4F7FB;border-radius:12px;padding:16px 18px;
          font-size:15px;line-height:1.55;color:${FARBE.tinte};">${text}</div>
      </td></tr>

      <tr><td style="padding:20px 26px 8px;">
        <a href="tel:${telLink}" style="display:block;background:${FARBE.orange};
          color:#FFFFFF;text-decoration:none;text-align:center;font-size:16px;font-weight:700;
          padding:15px 20px;border-radius:12px;">${name} zurückrufen</a>
      </td></tr>

      <tr><td style="padding:18px 26px 24px;">
        <div style="border-top:1px solid ${FARBE.linie};padding-top:16px;font-size:12px;
          line-height:1.6;color:${FARBE.grau};">
          DSGVO-Zustimmung: <b style="color:${FARBE.tinte};">erteilt</b> · Anfrage-ID ${esc(p.anfrageId || '—')}<br>
          <b style="color:${FARBE.tinte};">fixit247</b> · digitale 24/7 Vermittlungsplattform für Fachbetriebe
        </div>
      </td></tr>
    </table>
  </div>`;

  /* Klartext-Fassung fuer Clients ohne HTML. */
  var plain = [
    'Neue Kundenanfrage über fixit247', '',
    'Name:             ' + p.name,
    'Telefon:          ' + p.tel,
    'E-Mail:           ' + (email || '-'),
    'PLZ und Ort:      ' + (p.ort || '-'),
    'Gewerk:           ' + (p.bereich || kategorie || '-'),
    'Dringlichkeit:    ' + (dringlichkeit || '-'),
    'Wunschtermin:     ' + (p.wunschtermin || '-'),
    'Matching:         ' + matchText, '',
    'Was ist passiert?', (p.text || '-'), '',
    'DSGVO-Zustimmung: erteilt · Anfrage-ID ' + (p.anfrageId || '-')
  ].join('\n');

  /* Zuerst die interne Benachrichtigung: sie ist der Geschaeftsvorgang.
     Schlaegt sie fehl, bricht doPost ab und die Website meldet den Fehler. */
  MailApp.sendEmail({
    to: EMPFAENGER,
    name: 'fixit247 Website',
    replyTo: email || EMPFAENGER,
    subject: `Neue Anfrage${dringlichkeit === 'ACUTE' ? ' (AKUT)' : ''}: ${p.bereich || kategorie || 'unbekannt'} — ${String(p.name).slice(0, 80)}${treffer ? ' → ' + treffer.partner.company : ''}`,
    body: plain,
    htmlBody: html
  });

  /* Vermittlung: der gematchte Partner bekommt die Anfrage direkt – die
     Einwilligung des Kunden deckt die Weitergabe an einen Partnerbetrieb. */
  if (treffer && treffer.partner.email) {
    try {
      MailApp.sendEmail({
        to: treffer.partner.email, name: 'fixit247 Vermittlung', replyTo: EMPFAENGER,
        subject: `Vermittlung fixit247: ${p.bereich || kategorie || ''} in ${plz || (p.ort || '')}`,
        body: 'Neue Anfrage über fixit247 – bitte den Kunden direkt kontaktieren.\n\n' + plain
      });
    } catch (fehler) {
      Logger.log('Partnermail fehlgeschlagen: %s', fehler.message);
    }
  }

  /* Danach die Bestaetigung an den Kunden — nur mit gueltiger Adresse und
     bewusst gekapselt: eine vertippte Adresse darf die bereits zugestellte
     Anfrage nicht nachtraeglich als Fehlschlag erscheinen lassen. */
  if (email) {
    try {
      var k = {
        name: nurZeichen(String(p.name).replace(/\S+\.\S+/g, ' '), /[^A-Za-zÀ-ÖØ-öø-ÿ' .-]/g, 60),
        tel: nurZeichen(p.tel, /[^\d+()\/ .-]/g, 25),
        ort: nurZeichen(String(p.ort || '').replace(/\S+\.\S+/g, ' '), /[^A-Za-zÀ-ÖØ-öø-ÿ0-9 .,\/-]/g, 60) || '—',
        bereich: gewerkName(p.bereich, kategorie) || '—'
      };
      bestaetigungSenden(email, { name: esc(k.name), tel: esc(k.tel), ort: esc(k.ort), bereich: esc(k.bereich) }, k);
    } catch (fehler) {
      Logger.log('Bestaetigung fehlgeschlagen: %s', fehler.message);
    }
  }

  return { ok: true, match: treffer ? 'FOUND' : 'NONE' };
}

/* ================= BESTAETIGUNG AN DEN KUNDEN ================= */
/* Enthaelt bewusst keinen Freitext des Absenders: die Bestaetigung geht an
   eine frei eingetragene Adresse und darf kein Relais fuer fremde Texte sein. */

function schritt(nummer, titel, beschreibung) {
  return `<tr>
    <td width="34" style="padding:0 14px 18px 0;vertical-align:top;">
      <div style="width:26px;height:26px;border-radius:50%;background:${FARBE.orange};
        color:#FFFFFF;font-size:13px;font-weight:700;text-align:center;
        line-height:26px;">${nummer}</div>
    </td>
    <td style="padding:0 0 18px;vertical-align:top;">
      <div style="font-size:15px;font-weight:700;color:${FARBE.tinte};
        margin-bottom:2px;">${titel}</div>
      <div style="font-size:14px;line-height:1.5;color:${FARBE.grau};">${beschreibung}</div>
    </td>
  </tr>`;
}

function bestaetigungSenden(email, f, p) {
  var html = `
  <div style="margin:0;padding:24px 12px;background:#F4F7FB;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
      style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:16px;
      overflow:hidden;box-shadow:0 2px 12px rgba(15,29,46,.08);">

      <tr><td style="background:${FARBE.navy};padding:22px 26px;">
        <div style="font-size:21px;font-weight:800;color:#FFFFFF;letter-spacing:-.02em;">
          fixit<span style="color:${FARBE.orange};">247</span></div>
        <div style="font-size:12px;color:rgba(255,255,255,.72);margin-top:3px;">
          Digitale 24/7 Vermittlungsplattform für Fachbetriebe</div>
      </td></tr>

      <tr><td style="padding:30px 26px 4px;text-align:center;">
        <div style="width:56px;height:56px;border-radius:50%;background:#E8F6ED;
          margin:0 auto 16px;line-height:56px;font-size:27px;color:#22A758;">&#10003;</div>
        <div style="font-size:22px;font-weight:800;color:${FARBE.tinte};
          letter-spacing:-.02em;margin-bottom:8px;">Ihre Anfrage ist angekommen</div>
        <div style="font-size:15px;line-height:1.6;color:${FARBE.grau};">
          Guten Tag${f.name ? ' ' + f.name : ''},<br>vielen Dank für Ihr Vertrauen.
          Wir vermitteln Ihre Anfrage an einen passenden Fachbetrieb.</div>
      </td></tr>

      <tr><td style="padding:26px 26px 6px;">
        <div style="font-size:12px;font-weight:700;letter-spacing:.08em;
          text-transform:uppercase;color:${FARBE.grau};margin-bottom:14px;">Wie es weitergeht</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          ${schritt(1, 'Rückruf',
            `fixit247 oder der vermittelte Fachbetrieb meldet sich telefonisch unter ${f.tel}.`)}
          ${schritt(2, 'Passender Fachbetrieb',
            'Wir vermitteln Ihre Anfrage an einen passenden Fachbetrieb in Ihrer Nähe.')}
          ${schritt(3, 'Direkt mit dem Fachbetrieb',
            'Termin, Preis, Durchführung und Rechnung stimmen Sie direkt mit dem Fachbetrieb ab. Die Vermittlung ist für Sie kostenlos.')}
        </table>
      </td></tr>

      <tr><td style="padding:8px 26px 6px;">
        <div style="background:#F4F7FB;border-radius:12px;padding:18px 20px;">
          <div style="font-size:12px;font-weight:700;letter-spacing:.08em;
            text-transform:uppercase;color:${FARBE.grau};margin-bottom:10px;">Ihre Angaben</div>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
            style="font-size:14px;color:${FARBE.tinte};">
            <tr><td style="padding:3px 0;color:${FARBE.grau};width:120px;">Gewerk</td>
              <td style="padding:3px 0;font-weight:600;">${f.bereich}</td></tr>
            <tr><td style="padding:3px 0;color:${FARBE.grau};">PLZ und Ort</td>
              <td style="padding:3px 0;font-weight:600;">${f.ort}</td></tr>
          </table>
        </div>
      </td></tr>

      <tr><td style="padding:20px 26px 8px;">
        <a href="${kontaktTelLink()}" style="display:block;background:${FARBE.orange};
          color:#FFFFFF;text-decoration:none;text-align:center;font-size:16px;font-weight:700;
          padding:15px 20px;border-radius:12px;">Dringend? Jetzt anrufen: ${esc(KONTAKT.telefon)}</a>
      </td></tr>

      <tr><td style="padding:16px 26px 24px;">
        <div style="border-top:1px solid ${FARBE.linie};padding-top:16px;font-size:12px;
          line-height:1.65;color:${FARBE.grau};">
          <b style="color:${FARBE.tinte};">fixit247</b> · digitale 24/7 Vermittlungsplattform für Fachbetriebe<br>
          <a href="${kontaktTelLink()}" style="color:${FARBE.navy};">${esc(KONTAKT.telefon)}</a> ·
          <a href="mailto:${esc(KONTAKT.email)}" style="color:${FARBE.navy};">${esc(KONTAKT.email)}</a><br>
          <span style="color:#8A9AAE;">fixit247 vermittelt Anfragen an selbstständige, entsprechend
          berechtigte Fachbetriebe. Die handwerkliche Leistung wird ausschließlich durch den
          jeweiligen Fachbetrieb erbracht. Die konkrete Terminvereinbarung, Preisgestaltung,
          Durchführung und Rechnungsstellung erfolgt direkt zwischen Kunde und ausführendem
          Fachbetrieb. Genannte Preise sind unverbindliche Richtpreise.</span>
        </div>
      </td></tr>
    </table>
  </div>`;

  var plain = [
    'Ihre Anfrage ist angekommen', '',
    'Guten Tag ' + p.name + ',',
    'vielen Dank für Ihr Vertrauen. Wir vermitteln Ihre Anfrage an einen passenden Fachbetrieb.', '',
    'Wie es weitergeht:',
    '1. fixit247 oder der vermittelte Fachbetrieb meldet sich telefonisch unter ' + p.tel + '.',
    '2. Wir vermitteln Ihre Anfrage an einen passenden Fachbetrieb in Ihrer Nähe.',
    '3. Termin, Preis, Durchführung und Rechnung stimmen Sie direkt mit dem Fachbetrieb ab. Die Vermittlung ist für Sie kostenlos.', '',
    'Ihre Angaben:',
    'Gewerk:           ' + (p.bereich || '-'),
    'PLZ und Ort:      ' + (p.ort || '-'), '',
    'Dringend? Rufen Sie an: ' + KONTAKT.telefon, '',
    'fixit247 · digitale 24/7 Vermittlungsplattform für Fachbetriebe',
    KONTAKT.telefon + ' · ' + KONTAKT.email, '',
    'fixit247 vermittelt Anfragen an selbstständige, entsprechend berechtigte Fachbetriebe.',
    'Die handwerkliche Leistung wird ausschließlich durch den jeweiligen Fachbetrieb erbracht.',
    'Die konkrete Terminvereinbarung, Preisgestaltung, Durchführung und Rechnungsstellung',
    'erfolgt direkt zwischen Kunde und ausführendem Fachbetrieb. Genannte Preise sind',
    'unverbindliche Richtpreise.'
  ].join('\n');

  MailApp.sendEmail({
    to: email,
    name: 'fixit247',
    replyTo: EMPFAENGER,
    subject: 'Ihre Anfrage bei fixit247 ist angekommen',
    body: plain,
    htmlBody: html
  });
}
