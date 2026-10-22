# fixit247 Website – Spezifikation (Richtung B Türkis)

Diese Datei beschreibt das Verhalten der Website. Wie sie aussieht, zeigen `screens/` (Bilder) und `reference-html/` (Markup mit allen Texten, Icons und Abständen). Die Werte stehen in `tokens.css`.

**Rangfolge bei Widersprüchen:**
1. Diese Spezifikation
2. `screens/`
3. `reference-html/`

Die Referenz-HTML-Dateien sind statische Entwürfe mit Inline-Styles. Sie zeigen Texte, Struktur und Maße. Ihr Code wird nicht 1:1 übernommen, sondern als saubere Komponenten mit Tokens neu gebaut.

## 1. Geschäftsmodell (muss überall stimmen)

- fixit247 repariert nicht selbst. fixit247 gibt die Anfrage an einen geprüften Fachbetrieb aus der Region weiter.
- Die Vermittlung ist kostenlos. Der Vertrag kommt direkt mit dem Betrieb zustande.
- Alle Preise sind Richtpreise der Betriebe.
- Kein Text darf behaupten, dass fixit247 selbst repariert, einen Preis garantiert oder Aufträge annimmt.
  - Ausnahme: das Label „Auftrag aufgeben“ in Luna. Es steht so im Briefing und liegt als Konstante in der Copy-Datei, damit es leicht zu ändern ist (siehe Abschnitt 11).

Sprache: österreichisches Deutsch, Sie-Form, kurz und ruhig. `lang="de-AT"`.

## 2. Seitenaufbau

Es gibt eine Startseite (`/`). Dazu kommen Platzhalterseiten `/impressum`, `/datenschutz` und `/agb` mit `noindex`, bis die Rechtstexte da sind.

Abschnitte in dieser Reihenfolge. Die Texte kommen exakt aus `reference-html/02-startseite-desktop-1440.html`:

| # | Abschnitt | Anker | Screen |
|---|---|---|---|
| 1 | Kopf (sticky): Logo, Navigation, Anruf-Knopf; unter 920 px Menü-Knopf | – | 01, 02 |
| 2 | Hero: H1, Unterzeile, Anruf-Knopf groß, WhatsApp, Anfrage senden, Hinweis „Vermittlung kostenlos“, Bild 1 | `#start` | 01, 02 |
| 3 | Schnellwahl „Was ist passiert?“: 5 Gewerke und „Nicht sicher? Luna hilft beim Zuordnen“ | – | 01, 02 |
| 4 | Vertrauensleiste: 4 Punkte mit Icons | – | 01, 02 |
| 5 | Leistungen: 5 Karten und Hilfekarte „Ihr Problem ist nicht dabei?“ | `#leistungen` | 01, 02 |
| 6 | So funktioniert's: 3 Schritte auf Tiefsee | `#ablauf` | 01, 02 |
| 7 | Preisrechner | `#preisrechner` | 01, 02, 13 |
| 8 | Anfrage: Formular und Seitenkasten „Lieber sofort sprechen?“ | `#anfrage` | 01, 02 |
| 9 | Fuß: Geschäftsmodell-Text, Kontakt, Rechtliches | – | 01, 02 |

Dazu kommen schwebend: der Luna-Knopf und der Anstupser. Als Überlagerungen gibt es den Preis-Dialog bzw. das Bottom-Sheet, das Handy-Menü und das Luna-Fenster.

**Daten statt Hardcode:** Gewerke, Preise und Texte liegen in `src/content/` (z. B. `gewerke.ts`, `copy.ts`, `contact.ts`).
- Kacheln, Karten, Rechner, Preisübersicht, Formular-Auswahl und Luna-Chips lesen alle aus `gewerke.ts`.
- Ein sechstes Gewerk muss sich mit einem einzigen Eintrag überall einreihen. Das Leistungsraster ist `auto-fill` mit Spalten ab 340 px.

```ts
// Form der Gewerke-Daten (Werte laut Briefing)
{ id: 'installateur', name: 'Installateur', kategorie: 'handwerk', abrechnung: 'stunde', min: 95,  max: 140, anfahrt: 29.90, schnellwahl: 'Rohrbruch, WC verstopft',          karte: 'Rohrbruch, WC oder Abfluss verstopft, tropfende Armatur', bild: 2 }
{ id: 'shk',          name: 'Heizung & Klima', kategorie: 'technik', abrechnung: 'stunde', min: 95,  max: 140, anfahrt: 29.90, schnellwahl: 'Therme aus, kein Warmwasser', karte: 'Therme fällt aus, kein Warmwasser, Klimaanlage', bild: 3 }
{ id: 'schluessel',   name: 'Schlüsseldienst', kategorie: 'handwerk', abrechnung: 'einsatz', min: 80, max: 180, anfahrt: 19.90, schnellwahl: 'Ausgesperrt, Schloss defekt', karte: 'Ausgesperrt, Schlüssel abgebrochen, Schloss tauschen', bild: 4 }
{ id: 'elektro',      name: 'Elektro', kategorie: 'technik', abrechnung: 'stunde', min: 90, max: 140, anfahrt: 29.90, schnellwahl: 'Strom weg, FI-Schalter fliegt', karte: 'Stromausfall, FI-Schalter fliegt, Steckdose defekt', bild: 5 }
{ id: 'geraete',      name: 'Haushaltsgeräte', kategorie: 'technik', abrechnung: 'stunde', min: 90, max: 130, anfahrt: 29.90, schnellwahl: 'Waschmaschine, Herd, Kühlschrank', karte: 'Waschmaschine, Geschirrspüler, Herd, Kühlschrank', bild: 6 }
```

## 3. Farbe und Icons

- **Anruf-Knopf:** überall Türkisblau `--fx-tuerkis` mit Tiefsee-Schrift, als Pille. Er ist das auffälligste Element. Keine andere Fläche darf ihm Konkurrenz machen.
- **Gewerke-Icons** (`icons-3d/gewerk-*.png`): 3D-Renders, weich glänzend im Stil der Fluent-3D-Emojis. Alle mit derselben Kamera (leichte Draufsicht von schräg vorne), demselben Licht und derselben optischen Größe. Transparenter Hintergrund, keine Fläche dahinter. Motive wie in `ICON-PROMPTS-CHATGPT.md`.
  - Die Hauptfarbe entspricht `kategorie` in den Daten: Technik (Heizung & Klima, Elektro, Haushaltsgeräte) in `--fx-icon-technik`, Handwerk (Installateur, Schlüsseldienst) in `--fx-icon-handwerk`. Sie ist im Render festgelegt; ein e2e-Test gleicht sie mit `kategorie` ab.
  - Akzente nur in `--fx-tiefsee` (Öffnungen, Füße), `--fx-tuerkis` (Wasser, Anzeige) und `--fx-weiss` (Bedienteile). Weiß liegt immer innerhalb der Form, nie am Umriss, damit das Icon auf weißen Kacheln nicht ausfranst.
  - Größe: Schnellwahl 56 px (Handy), ab 920 px 64 px; Preisübersicht 40 px.
  - Auf der Seite als AVIF und WebP in doppelter Anzeigegröße (80, 112 und 128 px) aus `public/icons/`. Neu rendern mit `scripts/render-icons-3d.py` (Blender 5.2, headless), danach exportiert `scripts/export-3d.mjs` die Dateien und das Kontaktblatt `ICON-3D-KONTAKTBLATT.png`.
- **Symbole** (Telefon, Chat, Formular, Senden, Region, Uhr, Richtpreis, Vermittlung, Info, Häkchen, Warnung): 3D-Renders im Stil der Gewerke-Icons (`icons-3d/ui-*.png`, Komponente `Symbol3D`), dieselbe Kamera und dasselbe Licht, mittig im Bild.
  - Ein Bild erbt keine Textfarbe, darum zwei Farbstellungen: Körper Tiefsee auf hellen und türkisen Flächen (Anruf-Knopf, weiße Karten, Kalk-Kacheln), Körper Türkis (`-hell`) auf dunklen Flächen (Fuß, Kreis im großen Anruf-Knopf, dunkle Knöpfe und Karten). Details in Weiß; die Warnung bleibt Orange mit Tiefsee.
  - Größe wie bisher an jeder Stelle; Dateien 96 px (AVIF/WebP) aus `public/icons/`, gerendert mit `scripts/render-icons-3d.py`, exportiert mit `scripts/export-3d.mjs` (Kontaktblatt `SYMBOLE-3D-KONTAKTBLATT.png`).
  - Ein Symbol steht nie allein: immer mit Text oder `aria-label`. Dekorativ mit `alt=""`.
- **Steuer- und Feldzeichen** (X, Pfeile, Plus/Minus, Menü; Häkchen in Checkbox und Chip; Warnung an Feldfehlern): `icons/ui-*.svg`, gefüllt, `currentColor`, `aria-hidden="true"`. Sie bleiben flach, damit sie in jeder Größe scharf und in der Farbe ihrer Umgebung sind.
- **WhatsApp:** die Sprechblase ist ein Platzhalter. Live das offizielle Logo nach den Markenrichtlinien von Meta verwenden.
- **Bilder 1–6:** 3D-Szenen, mit ChatGPT erzeugt, nach `IMAGE-BRIEFS.md`: Fachleute bei der Arbeit im dunklen Tiefsee-Studio. Solange ein Bild lädt, bleibt die Fläche Türkisblau. Die Bildbrief-Texte aus den Entwürfen erscheinen nicht auf der Website.

## 4. Responsiv

- **Entwürfe:** Handy 390 px, Desktop 1440 px. Inhalt 1140 px, mit 24 px Rand also max-width 1188 px.
- **Unter 920 px:** Navigation wird zum Menü-Knopf. Anrufen bleibt im Kopf.
- **Unter 560 px:** die Telefonnummer im Kopf-Knopf entfällt, er heißt nur „Anrufen“.
- **Unter 640 px:**
  - Preisübersicht als Bottom-Sheet statt Dialog.
  - Luna als Vollbild statt Fenster.
- **Hero Desktop:** Text links, Bildfläche rechts bis zum Rand. Die Schnellwahl-Kacheln überlappen die Bildfläche, siehe Screen 02.
- **Falz:** Auf 390 × 844 müssen Anrufen, WhatsApp und Anfrage senden vollständig über 660 px liegen. Im Entwurf enden sie bei etwa 470 px. Das ist ein automatischer Test (Abschnitt 10).
- **Touch-Ziele:** mindestens 44 × 44 px.
- **Kein horizontales Scrollen** zwischen 320 und 1920 px.

## 5. Preisrechner (Logik)

**Eingaben**
- Gewerk: Chips mit `aria-pressed`, Einfachauswahl, Start „Installateur“.
- Arbeitszeit: Stepper in halben Stunden, 0,5–12 Stunden, Start 2. Jede angefangene halbe Stunde zählt (Auftraggeber, 22.10.2026). Der Wert steht in einem `<output aria-live="polite">`, mit Dezimalkomma: „0,5 Stunden“, „1 Stunde“, „1,5 Stunden“.
- Zuschläge: drei Umschalter, Sonntag, Feiertag und Nacht, jeweils „+100 %“, Mehrfachauswahl möglich.

**Schlüsseldienst** (`abrechnung: 'einsatz'`):
- Der Stepper verschwindet. An seiner Stelle steht der Hinweis „Preis pro Einsatz“ (siehe Screen 13 oben).
- Die Zeile heißt „Einsatz“ statt „Arbeit“.

**Rechnung**
```
arbeit_min = min × stunden        (Einsatz: min)
arbeit_max = max × stunden        (Einsatz: max)
zuschlag   = mind. ein Zuschlag aktiv ? +100 % auf die Arbeit : 0   // höchstens einer zählt
gesamt_min = arbeit_min + zuschlag_min + anfahrt
gesamt_max = arbeit_max + zuschlag_max + anfahrt
```
- Der Zuschlag gilt nur auf die Arbeit, nicht auf die Anfahrt. Das ist eine Annahme, siehe Abschnitt 11.
- Sind zwei oder mehr Zuschläge gewählt, erscheint unter den Umschaltern ein Hinweis (`role="status"`, Screen 13 unten): „**Es zählt nur ein Zuschlag.** Sonntag und Nacht treffen beide zu, berechnet wird trotzdem nur einmal +100 %.“ Die Namen setzen sich aus der Auswahl zusammen.
- Ohne oder mit nur einem Zuschlag steht dort der normale Hinweis „Es zählt höchstens ein Zuschlag, auch wenn mehrere zutreffen.“

**Ergebniskarte** (Tiefsee, `aria-live="polite"`)
- Unterzeile, z. B. „Installateur, 2 Stunden, kein Zuschlag“, „Installateur, 1,5 Stunden, kein Zuschlag“ oder „Installateur, 2 Stunden, Sonntag und Nacht“.
- Zeilen: Arbeit (bzw. Einsatz), Anfahrt, Zuschlag („keiner“ oder „Zuschlag +100 %“ mit Unterzeile „auf die Arbeit, nur einmal“ und Betrag), Gesamt.

**Format**
- Beträge mit Komma und zwei Nachkommastellen, das €-Zeichen *nach* der Zahl mit Leerzeichen. Achtung: `Intl.NumberFormat('de-AT', {style:'currency'})` liefert „€ 219,90“. Deshalb als Dezimalzahl formatieren und „ €“ anhängen.
- Spannen in Zeilen: „190,00–280,00 €“ (Halbgeviertstrich ohne Leerzeichen).
- Gesamt: „ca. 219,90 € – 309,90 €“ (mit Leerzeichen um den Strich), einzeilig.

**Pflicht-Testfälle** (Vitest)

| Fall | Arbeit / Einsatz | Zuschlag | Anfahrt | Gesamt |
|---|---|---|---|---|
| Installateur, 2 h, kein Zuschlag | 190,00–280,00 € | keiner | 29,90 € | ca. 219,90 € – 309,90 € |
| Schlüsseldienst, kein Zuschlag | 80,00–180,00 € | keiner | 19,90 € | ca. 99,90 € – 199,90 € |
| Installateur, 2 h, Sonntag + Nacht | 190,00–280,00 € | 190,00–280,00 € | 29,90 € | ca. 409,90 € – 589,90 € |
| Schlüsseldienst, Nacht | 80,00–180,00 € | 80,00–180,00 € | 19,90 € | ca. 179,90 € – 379,90 € |
| Elektro, 12 h, Feiertag | 1.080,00–1.680,00 € | 1.080,00–1.680,00 € | 29,90 € | ca. 2.189,90 € – 3.389,90 € |

Tausenderpunkt ab 1.000. Rechnen in Cent (Ganzzahlen), keine Gleitkomma-Fehler.

**Knöpfe in der Ergebniskarte:** „Jetzt anrufen“ (tel) und „Preisübersicht öffnen“ (öffnet Dialog bzw. Sheet).

## 6. Preisübersicht (Dialog / Bottom-Sheet)

- **Öffnen über:**
  - „Alle Richtpreise im Überblick“ (Leistungen)
  - „Preisübersicht öffnen“ (Rechner)
  - „Preisübersicht“ im Handy-Menü
- **Inhalt:** wie Screen 03 und 04. Tabelle bzw. Liste aller Gewerke mit Icon, Richtpreis und Anfahrt, dazu die Hinweise zu Zuschlag und Preisen, dann „Zum Preisrechner“ und der Anruf-Knopf.
- **Ab 640 px:** zentrierter Dialog, 680 px breit, Abdunklung `--fx-abdunklung`.
- **Unter 640 px:** Bottom-Sheet mit Griff, oben gerundet. Scrollt innen, wenn es zu hoch wird.
- **Barrierefreiheit:** `role="dialog"`, `aria-modal="true"`, Fokus beim Öffnen auf die Überschrift oder den Schließen-Knopf, Fokusfalle. Esc und Klick auf die Abdunklung schließen. Danach geht der Fokus zurück zum Auslöser, und die Seite scrollt im Hintergrund nicht mit.
- **„Zum Preisrechner“:** schließt und scrollt zu `#preisrechner`.

## 7. Handy-Menü

Wie Screen 05:
- Vollfläche unter dem Kopf.
- Der Menü-Knopf wird zu Schließen (`aria-expanded`, `aria-controls`).
- 5 große Links: Leistungen, So funktioniert's, Preisrechner, Preisübersicht (öffnet das Sheet), Anfrage senden.
- Kontaktkarte in Tiefsee mit Anruf-Knopf und WhatsApp, darunter Impressum, Datenschutz und AGB.
- Ein Link schließt das Menü und springt zum Anker. Esc schließt. Fokusfalle wie beim Dialog.

## 8. Luna – digitale Assistentin

Luna ist ein **geführter Ablauf ohne KI**. Fragen und Antworten sind fest. Freitext ist überall erlaubt und wird als Antwort übernommen. Eine KI-Anbindung kann später dazukommen. Die Struktur so bauen, dass die Logik in einer eigenen Datei liegt (`src/luna/flow.ts`).

**Knopf und Anstupser**
- Knopf: rund, Tiefsee, Signet `icons/luna-signet-glyph.svg`.
  - Desktop: 64 px, rechts 28 px, unten 28 px.
  - Handy: 58 px, rechts 16 px, unten 16 px.
  - `aria-label="Chat mit Luna öffnen"`. Ist der Chat offen, zeigt der Knopf am Desktop das Schließen-Icon mit `aria-expanded="true"`.
- Anstupser: Sprechblase über dem Knopf, „**Notfall?** Ich helfe Ihnen in einer Minute.“, mit Schließen-Knopf.
  - Erscheint einmal pro Besuch (sessionStorage) nach etwa 8 s, nicht wenn der Chat schon offen war.
  - Klick auf den Text öffnet den Chat. `role="status"`, 160 ms einblenden.
- Alle Elemente mit `href="#luna"` öffnen den Chat: die Schnellwahl-Kachel „Nicht sicher?“ und „Luna fragen“.

**Fenster**
- Ab 640 px: schwebendes Fenster, 380 × 680 px, höchstens Fensterhöhe minus 136 px, rechts 28 px, unten 108 px, `--fx-shadow-l`.
  - Kopf mit Signet, „Luna / Digitale Assistentin“ und einem Knopf „Chat minimieren“.
  - Nicht modal: Die Seite bleibt bedienbar, Anrufen bleibt im Seitenkopf sichtbar.
- Unter 640 px: Vollbild-Dialog (modal), wie Screens 07–10.
  - Kopf mit Schließen, Signet, Name und einem kleinen Anruf-Knopf.
- Fortschrittsbalken unter dem Kopf (`role="progressbar"`, Frage x von 5).
- Verlauf unten ausgerichtet. Neue Nachrichten kommen in eine `aria-live="polite"`-Region.
- Eingabezeile „Oder selbst schreiben“ bzw. „Nachricht schreiben“ mit Senden-Knopf.
- Esc schließt bzw. minimiert. Der Fokus geht beim Öffnen in die Eingabe bzw. auf die erste Auswahl.

**Ablauf** (Texte wie in den Screens)
1. „Hallo, ich bin Luna, die digitale Assistentin von fixit247. Ich gebe Ihre Anfrage an einen Fachbetrieb in Ihrer Nähe weiter. Worum geht es?“
   - Chips: die 5 Gewerke und „Weiß ich nicht“.
2. „Verstanden. Was ist passiert?“
   - Freitext.
3. „Danke. [Sicherheitstipp je Gewerk] Wie lautet Ihre Postleitzahl?“
   - PLZ: 4 Ziffern, 1010–9992. Bei falscher Eingabe: „Bitte geben Sie eine österreichische Postleitzahl mit vier Ziffern ein, zum Beispiel 1020.“
4. „Wie dringend ist es?“
   - Chips: „Sofort, es ist ein Notfall“, „Heute noch“, „In den nächsten Tagen“.
5. „Wie heißen Sie, und unter welcher Nummer erreicht Sie der Betrieb?“
   - Freitext. Name und Telefon werden getrennt erkannt. Fehlt die Nummer, fragt Luna nach.
6. Zusammenfassung (Screen 08):
   - Felder: Gewerk, Problem, Ort, Dringlichkeit, Name, Telefon.
   - Richtpreis des Gewerks, Einwilligungs-Checkbox (Pflicht) und Hinweis „Vermittlung kostenlos“.
   - Knöpfe „Auftrag aufgeben“ und „Angaben ändern“. Dieser springt zu Schritt 2 zurück, die Angaben bleiben.
7. Senden. Danach Erfolg (Screen 09) mit Anfragenummer und Sicherheitstipp, oder Fehler (Screen 10, `role="alert"`) mit „Stattdessen anrufen“ und „Erneut senden“. Die Angaben bleiben dabei erhalten.

Am Desktop gelten dieselben Zustände im Fenster (Screen 11 und 12). Im Fenster stehen „Angaben ändern“ und „Auftrag aufgeben“ nebeneinander.

**Sicherheitstipps** (Vorschlag, bitte prüfen):

| Gewerk | Tipp in Schritt 3 | Tipp in der Erfolgskarte („Bis der Betrieb kommt:“) |
|---|---|---|
| Installateur | Falls möglich, drehen Sie den Hauptwasserhahn zu. | Drehen Sie, wenn möglich, den Hauptwasserhahn zu und halten Sie Abstand zu nassen Steckdosen. |
| Heizung & Klima | Riecht es nach Gas, öffnen Sie die Fenster, betätigen Sie keine Schalter und rufen Sie den Gasnotruf 128. | wie links |
| Schlüsseldienst | Halten Sie, wenn möglich, einen Ausweis bereit. | Der Betrieb fragt nach einem Nachweis, dass Sie dort wohnen. |
| Elektro | Berühren Sie keine beschädigten Kabel oder nassen Geräte. | Schalten Sie, wenn möglich, die betroffene Sicherung aus. |
| Haushaltsgeräte | Trennen Sie das Gerät, wenn möglich, vom Strom. | Bei Waschmaschine oder Geschirrspüler auch den Wasserhahn zudrehen. |
| Weiß ich nicht | – | – |

## 9. Anfrage-Formular und Versand

**Felder:**
- Name *
- Telefon * (`type=tel`, `autocomplete=tel`)
- PLZ und Ort * (beginnt mit 4 Ziffern)
- Gewerk * (Auswahl aus den Gewerken und „Weiß ich nicht“)
- Kurze Beschreibung
- Einwilligung * (Checkbox mit Link zur Datenschutzerklärung)

**Validierung**
- Erst beim Verlassen eines Feldes und beim Absenden.
- Fehlertext unter dem Feld, verbunden über `aria-describedby`, `aria-invalid`.
- Beim Absenden springt der Fokus zum ersten Fehler.
- Beispiele: „Bitte geben Sie Ihren Namen ein.“, „Bitte geben Sie eine Telefonnummer für den Rückruf ein.“, „Bitte geben Sie Postleitzahl und Ort ein, zum Beispiel 1020 Wien.“, „Bitte wählen Sie ein Gewerk.“, „Bitte stimmen Sie der Weitergabe zu, sonst können wir keinen Betrieb vermitteln.“

**Zustände des Senden-Knopfs**
- normal „Anfrage senden“
- sendend „Wird gesendet …“ (deaktiviert)
- Erfolg: das Formular wird ersetzt durch „Danke. Ihre Anfrage ist unterwegs.“ mit Anfragenummer und dem Hinweis, dass der Betrieb zurückruft
- Fehler: Meldung über dem Knopf mit „Stattdessen anrufen“, die Angaben bleiben

**Versand** (gemeinsam für Formular und Luna) über `src/lib/submitLead.ts`:
- `POST` an `import.meta.env.VITE_LEAD_ENDPOINT`.
- Ist die Variable nicht gesetzt: ein lokaler Ersatz, der nach 800 ms Erfolg meldet. Mit `?fehler=1` in der URL meldet er Fehler, für Tests.
- Daten:
  ```json
  { "quelle": "formular|luna", "gewerk": "installateur", "beschreibung": "…", "plz": "1020", "ort": "Wien",
    "dringlichkeit": "sofort|heute|tage|null", "name": "…", "telefon": "…", "einwilligung": true, "zeit": "ISO-8601" }
  ```
- Die Anfragenummer kommt vom Server. Im Ersatz ist sie zufällig, Format `F247-XXXXXX`.

**Kontakt:** `src/content/contact.ts` mit Platzhaltern: `TELEFON = '[Telefonnummer]'`, `WHATSAPP = '[WhatsApp-Nummer]'`, `EMAIL = '[E-Mail-Adresse]'`, `FIRMA = '[Firmenname]'`.
- tel-Link: `tel:` mit E.164-Nummer.
- WhatsApp: `https://wa.me/<nummer>?text=` mit dem vorbefüllten Text „Hallo fixit247, ich brauche Hilfe: “.
- Solange Platzhalter drin sind, zeigt die Seite die Klammer-Texte. Ein Test warnt im Build-Log.

## 10. Qualität (alles automatisch prüfbar)

- **WCAG 2.2 AA:** axe ohne Verstöße auf allen Zuständen (Seite, Dialog, Sheet, Menü, Luna offen, Formular mit Fehlern).
- **Tastatur:** alles erreichbar, sichtbarer Fokus 3 px `--fx-tuerkis`, Abstand 3 px.
- **Bewegung:** nur als Antwort auf Handlungen, Dauern laut `tokens.css`. Bei `prefers-reduced-motion` keine Bewegung.
- **Lighthouse mobil:** in allen vier Kategorien mindestens 95.
- **Keine externen Requests beim Laden:** Schriften lokal über `@fontsource-variable/bricolage-grotesque` und `@fontsource-variable/atkinson-hyperlegible-next`, kein Google-CDN, kein Tracking.
- **Meta:** Titel, Beschreibung, Open Graph, `lang="de-AT"`, Favicon (Luna-Signet als Platzhalter, bis das Logo da ist), sitemap.xml, robots.txt.
- **Falz-Test** (Playwright, 390 × 844): die Unterkante von „Anfrage senden“ im Hero liegt unter 660 px.
- **Bildvergleich:** Screenshots bei 390, 1024 und 1440 px aller Zustände gegen `screens/`. Kleine Abweichungen durch echte Inhalte sind ok. Layout, Farben, Schriftgrößen, Reihenfolge und Abstände müssen passen.

## 11. Offene Entscheidungen (mit Standard, damit der Bau nicht wartet)

| Thema | Standard im Bau | Entscheidet Beks |
|---|---|---|
| „Auftrag aufgeben“ widerspricht dem Vermittlungsmodell | Label wie im Briefing, als Konstante in `copy.ts` | eventuell „Anfrage absenden“ / „Anfrage gesendet“ |
| Brutto/netto | Hinweis „[inkl. 20 % USt.]“ als Platzhalter | Für Verbraucher müssen Preise in Österreich brutto ausgewiesen werden. Bitte gegenchecken. |
| Zuschlag auf Anfahrt? | nur auf die Arbeit | bestätigen |
| Anfahrt 29,90 € (Website) vs. 15 € (App) | Werte laut Briefing | angleichen? |
| Logo | Wortmarke „fixit247“ in Bricolage 800 | Logo-Datei liefern |
| Telefon, WhatsApp, E-Mail, Firmenname | Platzhalter | echte Daten |
| Bilder 1–6 | Türkisblaue Flächen | nach `IMAGE-BRIEFS.md` |
| Endpunkt für Anfragen | lokaler Ersatz | URL für `VITE_LEAD_ENDPOINT` |
| Sicherheitstipps in Luna | Vorschlag aus Abschnitt 8 | prüfen |
| Luna-Kasten in der Schnellwahl neben den 3D-Icons | 46/52 px wie im Entwurf, die Gewerke-Icons sind 56/64 px (SPEC 3) | mitwachsen auf 56/64 px? |
| Gesichter der Figuren in den Bildern | freundlich: glänzende Augen, Brauen, Nase, leichtes Lächeln | so lassen oder schlichter? |
| Hauttöne der Figuren | vier Mischungen aus Orange, Weiß und Tiefsee (`IMAGE-BRIEFS.md`), über die Bilder verteilt | Auswahl passend? |
| Welche Zeichen 3D werden | alle bildhaften Symbole; Steuer- und Feldzeichen bleiben SVG (SPEC 3) | auch X, Pfeile, Plus/Minus als 3D? |
