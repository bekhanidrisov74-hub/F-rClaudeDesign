# Bericht: Audit und Korrektur

Stand 15.10.2026. Details und Rohbelege: [BEFUND.md](BEFUND.md), Belege in `belege/vorher/` und `belege/nachher/`. Nichts ist committet.

**Kurz:** Die Seite erfüllt ihr Ziel derzeit nicht. Die Anruf-Knöpfe wählen keine Nummer (`tel:` ohne Nummer), live scheitert jedes Senden (kein Anfrage-Eingang), Impressum und Datenschutzerklärung sind Platzhalter. Das sind Entscheidungen bzw. Daten von Ihnen (Teil 2). Technisch erreicht man den Anruf-Knopf mit einer Berührung, auch gedrosselt nach 1,8 s.

## 1. Behoben und belegt

Gemessen vorher und nachher mit denselben Befehlen. Die Zahlen stammen aus meinen Messungen, Sie haben sie nicht unabhängig geprüft.

| ID | Problem | Korrektur | Beleg vorher → nachher |
|---|---|---|---|
| A2 | Was auf langsamem Netz vor der Hydrierung ins Formular getippt wurde, löschte React. Das Senden scheiterte mit „Bitte geben Sie Ihren Namen ein.“ | Felder unkontrolliert, Werte aus dem DOM (`AnfrageFormular.tsx`) | `probe-hydrierung-fest.mjs`: Felder leer → Felder erhalten, `Erfolg: true`. S2 gedrosselt: kein POST → POST und Erfolg |
| A3 | Ohne JavaScript schickte das Formular `GET /?name=…&telefon=…`. Personendaten landeten in der Adresszeile, gesendet wurde nichts | Senden-Knopf erst nach der Hydrierung `type="submit"` | S5: `GET /?name=Maria+Huber&telefon=…` → keine Seitenanfrage, Adresse bleibt `/#anfrage` |
| F1 | Telefonnummer und E-Mail aus Lunas Freitext gingen an die KI (OpenAI). Ihre Aufgabe verlangt „Kontaktdaten gehen nie an OpenAI“ | `ohneKontakt()` in `flow.ts`, Unit-Test | `probe-luna-daten.mjs`: `0664 1234567` → `[Nummer entfernt]` |
| H2 | `/impressum`, `/datenschutz`, `/agb` gaben auf einem Webspace ohne Umschreibregeln 404 | Vorrendern als `impressum/index.html`, Links mit `/` am Ende | statischer Server: `404` → `200`. Alte Adresse `/impressum` → `301` → `200` |

Gegenprobe ohne Veränderung: axe, Tastatur-Durchgang (49 bzw. 52 Halte), Zielgrößen, Umbruch.

**Nachweise Phase 3:**
- `npm run check`: Exit 0. 105 Unit-Tests bestanden, 2 übersprungen (die mit echtem Modell).
- `npm run test:e2e`: Erster Lauf 249 bestanden, 1 rot (`basis.spec.ts` „Kalk-Hintergrund“ m390, Zeitüberschreitung beim Warten auf die Hydrierung). Der Test lief direkt nach einem Neubau gegen einen noch laufenden Preview-Server. Einzeln lief er 3 von 3 Mal grün. Zweiter Lauf der ganzen Suite mit frischem Server: 250 bestanden, 50 übersprungen, Exit 0.
- `npm run shots`: 40 Bilder.
- `npm run lighthouse` (nach Anpassung der URL-Muster an `impressum/index.html`): Exit 0. Startseite Performance 0,97–0,98, Barrierefreiheit, Best Practices und SEO je 1. Impressum Performance 0,98, Barrierefreiheit und Best Practices je 1. SEO 0,63 wegen `noindex`, dafür gibt es keine Prüfung (`belege/nachher/b-lighthouse.txt`).
- visual-reviewer und copy-checker: Ergebnis im Abschnitt „Prüfer“ unten.

**Restrisiken:**
- F1 erkennt keine Namen und keine Nummern ohne führende 0 oder +.
- A3 verhindert nur den Datenabfluss. Ohne JavaScript wird weiterhin nichts gesendet.

## 2. Offen, braucht Ihre Entscheidung

**P0, ohne das geht die Seite nicht live:**
1. **A1 Telefon und WhatsApp** (SPEC 11): echte Nummern in `src/content/contact.ts`. Zusätzlich die Frage: Soll der Build bei Platzhaltern abbrechen statt warnen?
2. **H1 Anfrage-Eingang** (SPEC 11): `anfrage.php` bauen bzw. Endpunkt setzen. Ebenso die Frage: Build ohne Endpunkt abbrechen?
3. **D1 Impressum** (ECG § 5, MedienG § 25, UGB § 14 / GewO § 63): Firmendaten liefern.
4. **D2 Datenschutzerklärung:** Text mit Fachbetrieben, Hoster und OpenAI als Empfänger, Drittland, Speicherdauer, sessionStorage.
5. **D3 Brutto/netto** (SPEC 11, ECG § 5 Abs 2, PrAG § 9): an jeder Preisangabe kennzeichnen.

**P1:**
6. **D4** „geprüfte Fachbetriebe“, „sofort“, „rund um die Uhr erreichbar“, „Richtpreise der Betriebe“: Im Backend steht `PARTNER = []`. Gibt es beim Livegang Partner und eine Prüfung, die sich belegen lässt?
7. **D5** „Auftrag aufgeben“ → z. B. „Anfrage absenden“ (SPEC 11).
8. **D6** Luna als KI kennzeichnen? KI-VO Art 50 gilt seit 2.8.2026, die Begrüßung sagt nur „digitale Assistentin“.
9. **E1** Schlüsseldienst nachts: Rechner bis 379,90 €. Laut AK Wien 2025 kostet eine verschlossene Türe um 22 Uhr höchstens 300 €, eine zugefallene 190 €. +100 % ist für Aufsperrdienste nicht marktüblich (AK: +20 bis +33 %).
10. **H3** Was `anfrage.php`/`chat.php` übernehmen müssen: Antwortformat, Doppelsendung, Kontingent, Zustellbarkeit (SPF/DKIM), Speicherung (Liste in BEFUND H3).
11. **H4** Header, HTTPS, HSTS, Kompression, Cache beim Hoster. `vercel.json` ist nach dem Umzug überflüssig.

**P2** (Liste in BEFUND):
- Fokusrand 2,6:1 (SPEC 10)
- Anzeigeschrift 131 KB
- Anfahrt bei Heizung und Haushaltsgeräten
- Gasnotruf 128 in Luna
- Uhrzeit „Nacht“
- Ort und Gewerk-Seiten für die Suche, strukturierte Daten
- Sitemap mit Platzhalter
- eigenes 404
- „PLZ und Ort“ als ein Feld (1.3.5)

## 3. Nur extern prüfbar

Ich habe nichts davon geprüft. Es ist auch nicht als „richtig“ gemeldet.

### Nutzertest mit 5 Personen
- **Voraussetzung:** echte Testnummer in `contact.ts`, Seite auf einer öffentlichen Testadresse, eigenes Handy der Person.
- **Netz:** mobiles Netz, oder WLAN über einen Laptop mit Drosselung (z. B. „clumsy“ unter Windows, 150 ms, 1,6 Mbit/s).
- **Ablauf je Person:**
  1. Drei Karten nacheinander: „Sie haben sich ausgesperrt. Holen Sie Hilfe.“ – „In der Küche läuft Wasser aus der Wand. Holen Sie Hilfe.“ – „Der Strom ist in der ganzen Wohnung weg. Holen Sie Hilfe.“
  2. In der anderen Hand hält die Person eine volle Tasse.
  3. Bildschirmaufnahme starten, Link öffnen lassen. Gemessen wird die Zeit von der ersten sichtbaren Seite bis zur Berührung von Anrufen bzw. Senden.
- **Notieren:** gewählter Weg, Zeit, Fehlgriffe, Zögern, Kommentare (lautes Denken erst danach).
- **Erfolg:** 4 von 5 rufen in unter 10 s an. Bei Formular oder Luna: Abbrüche und Gründe notieren.

### Rechtsprüfung
An eine Kanzlei für IT- und Wettbewerbsrecht übergeben:
- BEFUND Abschnitt d) und e), `belege/recht-normen.md` sowie die Texte aus `src/content/copy.ts`
- Fragen D1 bis D10
- E1: Richtpreise, die über dem Markt liegen
- D4: „geprüft“ ohne Prüfprozess
- Einwilligung oder Art 6 Abs 1 lit b
- Auftragsverarbeitung mit Hoster und OpenAI
- Ist fixit247 „Anbieter“ nach KI-VO?
- Gilt das PrAG („Wegekosten“) für fremde Richtpreise?

Ergebnis: schriftliche Liste mit „muss / soll / ok“.

### Echtes Handy (je ein Android-Mittelklassegerät mit Chrome und ein iPhone mit Safari)
1. Hero-„Jetzt anrufen“ öffnet die Telefon-App mit der richtigen Nummer. Ebenso Kopf-Knopf, Seitenkasten, Menü, Preisübersicht und Luna-Kopf.
2. WhatsApp öffnet den Chat mit fixit247, der Text „Hallo fixit247, ich brauche Hilfe: “ ist vorbefüllt.
3. Formular: Autofill für Name und Telefon, Tastatur `tel` beim Telefonfeld. Senden mit eingeblendeter Tastatur: Der Knopf ist erreichbar.
4. Luna im Vollbild mit offener Tastatur: Eingabe und Senden bleiben sichtbar. Querformat prüfen.
5. TalkBack bzw. VoiceOver: H1, Anruf-Knopf, Formularfehler, Luna-Nachrichten werden vorgelesen.
6. Flugmodus nach dem Laden, dann Senden: Der Sendefehler mit „Stattdessen anrufen“ erscheint, die Eingaben bleiben.

### Echtes Postfach (sobald `anfrage.php` läuft)
1. Drei Testanfragen senden: Formular, Luna, Luna mit „Weiß ich nicht“. Kommen alle an, in welcher Zeit, landet eine im Spam?
2. Im Mail-Quelltext unter `Authentication-Results` müssen SPF, DKIM und DMARC `pass` zeigen.
3. Inhalt vollständig: alle Felder, Anfragenummer, Dringlichkeit. Kundenbestätigung an eine Testadresse prüfen.
4. Doppelklick auf Senden ergibt eine Mail, nicht zwei.
5. Eingang abschalten: Die Website zeigt den Sendefehler mit Anruf-Knopf.
6. Abgleich: Jede Anfrage ist auch gespeichert (falls MySQL gewählt).

### Weitere externe Prüfungen
- **NVDA** (kostenlos, nvaccess.org) mit Chrome:
  - Mit H durch die Überschriften gehen.
  - Formular mit Fehlern absenden: Wird der Fehler vorgelesen?
  - Luna-Nachrichten und „Wird gesendet …“: Werden sie angesagt?
  - Den H1-Trennstrich anhören (C4).
- **Header und Observatory** nach dem Upload:
  - Scan mit `https://developer.mozilla.org/en-US/observatory`.
  - `curl -sI http://<domain>/` muss auf https weiterleiten.
  - `curl -sI -H "Accept-Encoding: br" https://<domain>/assets/<datei>.js` muss eine Kompression zeigen.
  - `curl -sIL https://<domain>/impressum` muss mit 200 enden.
- **Google:** Search Console einrichten. Die drei Suchanfragen aus BEFUND g) aus Österreich (ohne Anmeldung) wiederholen und mit `belege/suche.md` vergleichen.

## Prüfer

### visual-reviewer
Alle 40 Bilder gegen design/screens: „Nichts Neues durch die Änderungen dieser Runde“, keine Abweichung der Schwere hoch oder mittel. Das Formular sieht in allen Zuständen gleich aus, beim Sendefehler bleiben die Angaben stehen, `/impressum/` rendert. Ältere Punkte (gering):
- Der Luna-Anstupser liegt in einigen Shots über dem Seitenkasten bzw. über „Jetzt anrufen“ im Rechner (1024/1440). Das Shot-Skript blendet nur den Luna-Knopf aus. Im echten Betrieb erscheint der Anstupser einmal und lässt sich schließen; über einem Anruf-Knopf ist er trotzdem unglücklich (Entscheidung).
- Luna-Fenster bei 1024 × 768: „Neue Anfrage starten“ bzw. „Erneut versuchen“ erst nach Scrollen sichtbar (bekannt).
- Der Luna-Knopf (Tiefsee) ist auf Tiefsee-Flächen (Fuß, Seitenkasten) kaum zu sehen (nicht dokumentiert, Entscheidung).
- Der längere Einwilligungstext im Formular fehlt in `tests/accepted-deviations.md`.

### copy-checker
- **Keine Aussage gefunden, dass fixit247 selbst repariert, Preise garantiert oder Aufträge annimmt.** Ausnahmen sind nur „Auftrag aufgeben“ und das Echo „Auftrag aufgegeben“ (SPEC 11, D5). Das Echo nennt SPEC 11 nicht ausdrücklich.
- Sie-Form durchgehend, Preisformat laut SPEC 5 korrekt.
- Neu für Ihre Entscheidung:
  - **Notruf-Satz:** „Bei akuter Gefahr bitte sofort 122 bzw. 112 kontaktieren.“ In Österreich ist 122 die Feuerwehr, 144 die Rettung, 128 der Gasnotruf, 112 der Euro-Notruf. „bzw.“ ist im Notfall unscharf (gehört zu F3).
  - **„Der Betrieb ruft Sie zurück“** (Formular-Lead, Ablauf, Erfolg) sagt etwas für Dritte zu. Im Fall „kein Betrieb gefunden“ trifft es nicht zu (gehört zu D4).
  - **SPEC 8 und 9 sind veraltet.** Die Entscheidungen vom 14.10. (Dringlichkeits-Chips, „Erneut versuchen“, Einwilligungstext, Kontaktdaten erst in der Zusammenfassung, `VITE_FORM_ENDPOINT` statt `VITE_LEAD_ENDPOINT`) stehen nur in `copy.ts` und `docs/luna-ki/AUFGABE.md`. Laut CLAUDE.md hat SPEC Vorrang, sie sollte nachgezogen werden.
  - Richtpreise in Leistungen und Preisübersicht in ganzen Euro („95–140 €“), wie im Design. SPEC 5 verlangt zwei Nachkommastellen nur für Beträge im Rechner. Kein Handlungsbedarf, sofern Sie das so lesen.

## Geänderte Dateien

`src/components/AnfrageFormular.tsx`, `src/luna/flow.ts`, `src/luna/flow.test.ts`, `scripts/prerender.mjs`, `src/content/copy.ts` (nur Link-Ziele), `src/entry-server.tsx` (`og:url`), `src/App.tsx` (Kommentar), `lighthouserc.json`, `docs/hosting.md`, Testpfade in `tests/e2e/*.spec.ts` und `tests/shots/shots.spec.ts`. Neu: `docs/audit/` (Befund, Bericht, Messskripte, Belege).

Kosten: Die Luna-Angriffsliste hat rund 30 kurze Aufrufe an Ihr OpenAI-Konto geschickt (gpt-6-luna, Cent-Bereich).
