# fixit247 – Plan (Phase 0)

Grundlage: `design/SPEC.md`, alle 14 Screens, alle 14 Referenz-HTML-Dateien, `tokens.css/json` und 22 Icons. Rangfolge bei Widersprüchen: SPEC > Screens > Referenz-HTML.

Die Inventur mit 8 Lesern hat rund 50 Widersprüche und Lücken gefunden, eine Gegenprüfung mit 3 Kritikern weitere 31 Punkte zum Plan. Alles, was die Rangfolge oder die Technik entscheidet, ist in Abschnitt 7 eingeplant. Fünf Punkte brauchen Ihre Entscheidung (Abschnitt 8).

## 1. Komponenten und Zuordnung zu den Screens

### Sichtbare Komponenten

| Komponente | Datei | Screens | Kern |
|---|---|---|---|
| Icon | `src/components/ui/Icon.tsx` | alle | `import.meta.glob('/design/icons/*.svg', {query:'?raw', import:'default', eager:true})`, keine Kopien, `currentColor`, dekorativ `aria-hidden` |
| Gewerk-Icon | `src/components/ui/GewerkIcon.tsx` | 01–04, 13 | Farbe aus `kategorie`: `--fx-icon-technik` bzw. `--fx-icon-handwerk`, ohne Fläche. Alle Stellen nutzen diesen Baustein |
| Anruf-Knopf | `src/components/ui/CallButton.tsx` | 01–05, 07–13 | Varianten `kopf` (48/44 px, Nummer ab 560 px), `gross` (76/70 px, Kreis + Nummer), `block` (Karten, Dialog, Luna), `kompakt` (Luna-Kopf Handy). Immer Türkis mit Tiefsee-Schrift, Pille |
| Knöpfe | `src/components/ui/Button.tsx` | alle | `sekundaer` (Rand `--fx-rand`, Weiß), `primaer` (Tiefsee), `textlink` |
| Chip | `src/components/ui/Chip.tsx` | 02, 07, 11, 13 | `aria-pressed`, Häkchen bei Auswahl |
| Bildfläche | `src/components/ui/Bildflaeche.tsx` | 01, 02 | leere Türkis-Fläche ohne Text, später `<picture>` für `bild-N.webp/avif` |
| Kopf | `src/components/Header.tsx` | 01, 02, 05 | sticky, Logo (Bricolage 800), Navigation ab 920 px, darunter Menü-Knopf (`aria-expanded`, `aria-controls`, Icon wechselt zu Schließen) |
| Handy-Menü | `src/components/MobileMenu.tsx` | 05 | Vollfläche unter dem Kopf. Kopf bleibt bedienbar, der Rest der Seite ist `inert`. Esc, Fokusfalle, ohne Bewegung. Ein Link schließt das Menü und springt zum Anker. „Preisübersicht“ ist ein Knopf: Er schließt erst das Menü und hebt `inert` auf, dann öffnet sich das Sheet. Beim Schließen des Sheets geht der Fokus zum Menü-Knopf |
| Hero | `src/components/Hero.tsx` | 01, 02 | H1, Unterzeile, Anruf groß, WhatsApp, Anfrage senden, Hinweis. Desktop: Bild 1 rechts bis zum Rand. Unter 920 px: Bild 1 vollbreit nach der Schnellwahl (Screen 01) |
| Schnellwahl | `src/components/Schnellwahl.tsx` | 01, 02 | Kacheln aus `gewerke` + Luna-Kachel (`href="#luna"`), Kacheln ab 160 px, am Desktop 104 px Überlappung |
| Vertrauensleiste | `src/components/Vertrauensleiste.tsx` | 01, 02 | 4 Punkte mit Icons |
| Leistungen | `src/components/Leistungen.tsx` (+ `LeistungKarte`, `Hilfekarte`) | 01, 02 | `auto-fill` ab 340 px, Bild 200 px am Handy bzw. 4 : 3 am Desktop. „Alle Richtpreise im Überblick“ öffnet die Preisübersicht |
| So funktioniert's | `src/components/Ablauf.tsx` | 01, 02 | 3 Schritte auf Tiefsee |
| Preisrechner | `src/components/Preisrechner.tsx` | 01, 02, 13 | Chips, Stepper mit `<output aria-live="polite">`, 3 Umschalter, Hinweis `role="status"`, Ergebniskarte `aria-live`, Gesamt einzeilig |
| Preisübersicht | `src/components/Preisuebersicht.tsx` | 03, 04 | eine Komponente auf nativem `<dialog>` mit `showModal()`. Ab 640 px Dialog mit 680 px, darunter Bottom-Sheet mit Griff, innen scrollend. Fokus beim Öffnen auf Schließen. Esc, Klick auf die Abdunklung, Fokus zurück zum Auslöser, Seite gesperrt. „Zum Preisrechner“ schließt und scrollt |
| Anfrage | `src/components/Anfrage.tsx` (+ `AnfrageFormular`, Seitenkasten) | 01, 02 | Felder (Telefon `type=tel`, `autocomplete=tel`), Prüfung beim Verlassen und Absenden, Zustände sendend, Erfolg, Fehler |
| Fuß | `src/components/Footer.tsx` | 01, 02 | Geschäftsmodell-Text, Kontakt, Rechtliches |
| Platzhalterseite | `src/components/LegalPage.tsx` | – | `/impressum`, `/datenschutz`, `/agb` mit `noindex`, Kopf und Fuß wie die Startseite |
| Luna-Knopf | `src/luna/LunaLauncher.tsx` | 01, 02, 06, 11 | rund, Tiefsee, 64 bzw. 58 px, `position: fixed`. Label bleibt „Chat mit Luna öffnen“. Bei offenem Chat am Desktop Schließen-Icon und `aria-expanded="true"`, dazu `aria-controls` |
| Anstupser | `src/luna/Anstupser.tsx` | 02, 06 | einmal pro Besuch nach 8 s (sessionStorage), nicht wenn der Chat schon offen war. `role="status"`, 160 ms. Der Text ist ein Knopf, Schließen-Fläche 44 × 44 |
| Luna-Chat | `src/luna/LunaChat.tsx` (+ Kopf, Fortschritt, Verlauf, Eingabe) | 07, 11 | Ab 640 px nicht modales Fenster (`dialog.show()`, `position: fixed`, eigener Esc-Handler minimiert). Darunter modales Vollbild (`showModal()`, Esc schließt). Bei einem Wechsel über 640 px per matchMedia sauber umschalten, Zustand bleibt. Fortschritt `role="progressbar"`, `aria-valuenow` 1–5, `aria-valuetext` „Frage x von 5“. Verlauf ist eine `aria-live="polite"`-Region. Fokus beim Öffnen in die Eingabe bzw. auf die erste Auswahl |
| Luna-Karten | `src/luna/cards/*.tsx` | 08–10, 12 | Zusammenfassung, Kurzfassung „Ihre Anfrage“, Erfolg, Sendefehler (`role="alert"`) |

### Nicht sichtbare Teile

| Teil | Datei | Aufgabe |
|---|---|---|
| Preislogik | `src/lib/preis.ts` | Rechnen in Cent. Format selbst gebaut, kein `Intl` (ICU-Unterschiede, „€ 219,90“): „190,00–280,00 €“, „ca. 219,90 € – 309,90 €“, Tausenderpunkt. Unterzeile |
| Luna-Ablauf | `src/luna/flow.ts` | reiner Zustandsautomat ohne React: `start(gewerke)`, `antworte(zustand, eingabe)`, Fortschritt, Payload. In Vitest ohne DOM testbar |
| Versand | `src/lib/submitLead.ts` | `buildPayload()` setzt `quelle` und `zeit` (ISO-8601). `POST` an `VITE_LEAD_ENDPOINT`. Ohne die Variable: lokaler Ersatz, 800 ms, `?fehler=1` → Fehler, Nummer `F247-XXXXXX` |
| Prüfregeln | `src/lib/validate.ts` | Formularfelder, PLZ (1010–9992), „1020 Wien“ in plz/ort teilen, Name und Telefon trennen. Formular und Luna nutzen dieselben Regeln |
| Kontakt-Links | `src/content/contact.ts` | `telHref` (0660 … → `tel:+43660…`), `whatsappHref` (`https://wa.me/43660…?text=Hallo%20fixit247%2C%20ich%20brauche%20Hilfe%3A%20`), `mailHref`. Bei Platzhalter: `tel:` usw. |
| Überlagerungen | `src/overlays.tsx` | React-Context: `openPreise(ausloeser)`, Luna offen/minimiert, Menü-Zustand. Hält den Luna-Gesprächszustand für den ganzen Besuch. Minimieren und Schließen blenden nur aus. Klicks auf `a[href="#luna"]` öffnen Luna |
| Seiten | `src/App.tsx` | Tabelle mit 4 Pfaden, kein Router |
| Vorrendern | `src/entry-server.tsx`, `src/entry-client.tsx`, `scripts/prerender.mjs` | siehe Abschnitt 2 |

**Payload-Regeln (Standard, steht im Bericht):** Bei „Weiß ich nicht“ oder Freitext statt Gewerk-Chip ist `gewerk: null`. Der Freitext kommt an `beschreibung` angehängt, es gibt keinen Tipp und keine Richtpreis-Zeile. Bei Freitext statt Dringlichkeits-Chip ist `dringlichkeit: null` und der Text kommt ebenfalls an `beschreibung`. Das Formular sendet `dringlichkeit: null`. „Weiß ich nicht“ ist in Formular und Luna derselbe Wert.

## 2. Ordnerstruktur

```
fixit247-website/
├─ design/                      unverändert, Quelle der Icons
├─ public/
│  └─ favicon.svg               Luna-Signet (Platzhalter bis zum Logo)
├─ src/
│  ├─ entry-client.tsx          hydrateRoot
│  ├─ entry-server.tsx          render(pfad) → HTML + Kopfdaten
│  ├─ App.tsx                   Pfad → Seite
│  ├─ overlays.tsx
│  ├─ styles/
│  │  ├─ tokens.css             Kopie von design/tokens.css (--fx-*), dazu die responsiven Varianten aus den Token-Kommentaren
│  │  └─ app.css                @import tailwindcss, @theme-Aliase auf --fx-*, Schriften, Basis, Fokus, reduced motion
│  ├─ content/                  gewerke.ts, copy.ts, contact.ts
│  ├─ lib/                      preis.ts, submitLead.ts, validate.ts (+ *.test.ts daneben)
│  ├─ components/               Abschnitte + ui/
│  └─ luna/                     flow.ts, flow.test.ts, LunaLauncher, Anstupser, LunaChat, cards/
├─ scripts/
│  └─ prerender.mjs             rendert /, /impressum, /datenschutz, /agb nach dist/*.html, schreibt sitemap.xml und robots.txt, warnt bei Platzhaltern und fehlendem VITE_LEAD_ENDPOINT
├─ tests/
│  ├─ e2e/*.spec.ts             Playwright
│  ├─ shots/shots.spec.ts       npm run shots
│  ├─ screens-actual/           Ausgabe der Screenshots (nicht im Git)
│  └─ accepted-deviations.md    bewusste Abweichungen, wird pro Phase fortgeschrieben
├─ package.json                 "type": "module", Versionen exakt
├─ vite.config.ts               appType 'mpa' in preview (unbekannte Pfade → 404 wie auf Vercel)
├─ tsconfig.json → tsconfig.app.json (src, types vite/client) + tsconfig.node.json (Konfiguration, Tests, Skripte, types node)
├─ eslint.config.js, playwright.config.ts, lighthouserc.json
├─ vercel.json                  cleanUrls: true
├─ .env.example                 VITE_LEAD_ENDPOINT=
└─ PLAN.md, REPORT.md
```

**Vorrendern:** `vite build && vite build --ssr src/entry-server.tsx --outDir dist-ssr && node scripts/prerender.mjs`. Der SSR-Build geht nach `dist-ssr/`, sonst löscht er `dist`. Das Skript nutzt `renderToString` aus `react-dom/server` (rund 40 Zeilen) und schreibt `dist/index.html`, `dist/impressum.html` usw. Vercel liefert sie über `cleanUrls` unter `/impressum` aus. Für vier feste Pfade braucht es weder Router noch SSG-Bibliothek. `sessionStorage`, `location.search` und `matchMedia` werden nur in Effekten gelesen. Das ist der erste Schritt in Phase 1 (Spike). Abnahme: Das ausgelieferte HTML enthält die H1 schon vor JavaScript, und beim Laden aller vier Pfade gibt es keinen Konsolenfehler und keinen Hydrationsfehler.

**Meta:** title, description, og:title, og:description, og:type=website, og:locale=de_AT, `lang="de-AT"`, Favicon. og:url und kanonische URL erst mit echter Domain, kein og:image bis die Bilder da sind. Die sitemap.xml wird immer geschrieben und enthält nur `/` mit `[Domain]` als Platzhalter. robots.txt bekommt die `Sitemap:`-Zeile erst mit echter Domain, sonst schlägt Lighthouse fehl. Bei Platzhalter warnt der Build-Log.

**Tokens und Tailwind v4:** `src/styles/tokens.css` ist die einzige Quelle für `--fx-*`. Varianten, die tokens.css selbst im Kommentar nennt, werden responsive Werte desselben Tokens, z. B. `--fx-lead` 17 → 20 px, `--fx-h3` 23–26 → 26–28 px, `--fx-gutter` 16 → 24 px, `--fx-section-y` 56/64 → 96/104 px, `--fx-r-card` am Handy 16 px. In `app.css` setzt `@theme` alle Tailwind-Standards zurück: Farben, Radien, Schatten inklusive inset-, drop- und text-shadow, Schriftgrößen, Schriftfamilien, Abstände (`--spacing`) und Umbrüche. Danach legt es nur Aliase auf `--fx-*` an, z. B. `bg-tuerkis`, `rounded-card`, `p-s4`. Die Umbrüche heißen `kopf` 35rem, `dialog` 40rem und `nav` 57.5rem (560/640/920 px), alle in rem. „Strikt unter“ wird mit `max-*` umgesetzt. Die 640-px-Abfrage für JavaScript steht als eine Konstante bereit. `--default-font-family` zeigt auf Atkinson.

Ein Vitest-Wächter verbietet Hex- und rgb-Farben außerhalb von `tokens.css`, freie Werte (`[…]`) für Farbe, Radius, Schatten, Schriftgröße und Abstand, Schatten-Klassen ohne Token und freie Umbrüche (`max-[`, `min-[`). Ausnahme sind Maße, die SPEC oder Screens als Komponentenmaß nennen (380 × 680, 680, 64/58, 44, 76). Davor sorgt `scroll-padding-top` in Kopfhöhe dafür, dass Ankersprünge nicht unter dem sticky Kopf landen (WCAG 2.4.11).

**Schriften:** `@fontsource-variable/bricolage-grotesque/standard.css` mit den Achsen opsz, wdth und wght (131 KB latin). `index.css` enthält nur die Gewichtsachse, dann wirkt `font-stretch: 96 %` nicht. Die Screens sind mit optischer Größe gerendert, deshalb die volle Datei. Falls Lighthouse leidet: `wdth.css` (78 KB, ohne opsz). Atkinson kommt aus `@fontsource-variable/atkinson-hyperlegible-next`. Beide latin-Dateien werden vorgeladen.

**Versionen (exakt, mit package-lock):** react und react-dom 19.3.0, vite 8.3.4, @vitejs/plugin-react 6.1.2, tailwindcss und @tailwindcss/vite 4.3.3, **typescript 6.0.x** (nicht 7: typescript-eslint 8.71 verlangt < 6.1, und TS 7 hat keine Compiler-API), vitest 5.0.4, @types/node 22, @playwright/test 1.64.0, @axe-core/playwright 4.13.0, @lhci/cli 0.15.1, eslint 10.12 mit @eslint/js, typescript-eslint 8.71.2, eslint-plugin-react-hooks 7.1.1, beide Fontsource-Pakete 5.3.0. Node 22.17 erfüllt alle engines-Angaben.

## 3. Datenmodell in `src/content/`

```ts
// gewerke.ts
export type Kategorie = 'technik' | 'handwerk'      // Icon-Farbe Petrol bzw. Orange
export type Abrechnung = 'stunde' | 'einsatz'

export interface Gewerk {
  id: string                 // 'installateur' … (SPEC 2)
  name: string               // 'Installateur'
  kategorie: Kategorie
  abrechnung: Abrechnung
  min: number                // Euro wie im Briefing; preis.ts rechnet in Cent um (Math.round(x * 100))
  max: number
  anfahrt: number            // 29.90
  schnellwahl: string        // Unterzeile der Kachel
  karte: string              // Text der Leistungskarte
  bild: number               // 2–6, später public/images/bild-N.webp
  icon: string               // 'gewerk-installateur' (Dateiname in design/icons)
  betrieb: string            // Luna-Erfolg: „an einen passenden {betrieb}“ (nicht im Design, Frage 2)
  tipp: string               // Luna Schritt 3 (SPEC 8)
  tippErfolg: string         // Luna-Erfolgskarte „Bis der Betrieb kommt:“ (SPEC 8)
}
export const gewerke: Gewerk[] = [ /* 5 Einträge laut SPEC 2 */ ]
```

Ein sechster Eintrag erscheint automatisch in Schnellwahl, Leistungen, Rechner-Chips, Preisübersicht, Formular-Auswahl und Luna-Chips. Auch „diese fünf Bereiche“ in den Leistungen zählt mit (`zahlwort(gewerke.length)`).

```ts
// copy.ts (Struktur; alle Texte wörtlich aus reference-html bzw. SPEC)
export const AUFTRAG_AUFGEBEN = 'Auftrag aufgeben'        // SPEC 11 offen
export const AUFTRAG_AUFGEGEBEN = 'Auftrag aufgegeben'    // Echo-Blase in Luna, ändert sich mit
export const UST_HINWEIS = '[inkl. 20 % USt.]'            // SPEC 11 offen
export const WEISS_NICHT = 'Weiß ich nicht'

export const dringlichkeit = [
  { id: 'sofort', chip: 'Sofort, es ist ein Notfall', zusammenfassung: 'Sofort, Notfall', kurz: 'sofort' },
  { id: 'heute',  chip: 'Heute noch',                 zusammenfassung: 'Heute noch',      kurz: 'heute' },                // nicht im Design, Frage 2
  { id: 'tage',   chip: 'In den nächsten Tagen',      zusammenfassung: 'In den nächsten Tagen', kurz: 'in den nächsten Tagen' }, // nicht im Design, Frage 2
] as const

export const copy = {
  meta: { titel, beschreibung },
  kopf: { nav: [...], anrufen, menueOeffnen, menueSchliessen },
  hero: { h1: ['Handwerker-', 'Notdienst.', 'Rund um die Uhr.'], lead, jetztAnrufen, whatsapp, anfrage, hinweis },
  schnellwahl: { titel, luna: { titel, unterzeile, handy } },
  vertrauen: [{ icon, titel, text } /* × 4 */],
  leistungen: { titel, lead /* {anzahl} */, ueberblick, anfragen /* '{name} anfragen' */, hilfe: {...} },
  ablauf: { titel, schritte: [...] },
  rechner: { titel, lead, gewerk, arbeitszeit, stundenHinweis, einsatz: {...}, zuschlag, zuschlaege: [...], hinweisEiner, hinweisMehrere, ergebnis: {...} },
  preisuebersicht: { titel, lead, spalten, hinweiseDialog: [/* 2 */], hinweisSheet, zumRechner },   // Dialog und Sheet haben verschiedene Hinweistexte
  anfrage: { titel, lead, felder: {...}, fehler: {...}, senden, sendend, erfolg: {...}, sendefehler: {...}, pflicht, seitenkasten: {...} },
  fuss: { text, kontakt, rechtliches, copyright, preise },
  menue: { links: [...], kontaktTitel, whatsapp },
  luna: { name, rolle, oeffnen, minimieren, schliessen, fragen: {...}, plzFehler, telefonFehlt, einwilligungFehlt, eingabe: {...}, zusammenfassung: {...}, erfolg: {...}, fehler: {...}, anstupser: {...} },
  rechtliches: { impressum, datenschutz, agb },
}
```

```ts
// contact.ts (Platzhalter laut SPEC 9)
export const TELEFON = '[Telefonnummer]'
export const WHATSAPP = '[WhatsApp-Nummer]'
export const EMAIL = '[E-Mail-Adresse]'
export const FIRMA = '[Firmenname]'
export const DOMAIN = '[Domain]'          // sitemap.xml, og:url, robots.txt (siehe Abschnitt 2)
export const telHref, whatsappHref, mailHref   // abgeleitet, getestet
```

## 4. Tests und Skripte

### npm-Skripte

| Skript | Inhalt |
|---|---|
| `build` | `vite build` + SSR-Build nach `dist-ssr` + `prerender.mjs` |
| `check` | `tsc -b && eslint . && vitest run && npm run build` |
| `test:e2e` | Playwright gegen `vite preview` von `dist` |
| `shots` | Playwright-Projekt `shots` → `tests/screens-actual/` |
| `lighthouse` | `lhci autorun` (Konfiguration unten) |

Jede Phase schreibt die Tests für das, was sie baut. Der Falz-Test entsteht in Phase 1 als `test.fixme` und wird scharf, sobald der Hero steht (Phase 2). Lighthouse prüft der qa-runner erst ab Phase 6, vorher läuft es nur informativ.

### Vitest (Teil von `npm run check`)

| Datei | Prüft |
|---|---|
| `preis.test.ts` | alle 5 Pflichtfälle aus SPEC 5 (jede Zeile und Gesamt, exakter String inkl. Leerzeichenart), Tausenderpunkt, Unterzeilen („1 Stunde“, „Sonntag und Nacht“, „Sonntag, Feiertag und Nacht“, Schlüsseldienst), Grenzen 1–12 |
| `flow.test.ts` | ganzer Ablauf, Chips und Freitext, „Weiß ich nicht“ ohne Tipp, PLZ 1009/9993/„abc“/10200 abgelehnt, 1010/9992 angenommen, Name und Telefon in mehreren Schreibweisen, Nachfrage bei fehlender Nummer, „Angaben ändern“ führt zu Schritt 2 und behält die Daten, Fortschritt bleibt bei Nachfragen gleich, Payload-Regeln |
| `submitLead.test.ts` | `buildPayload` (alle SPEC-9-Felder, `zeit` ISO-8601, `quelle`), Ersatz: Erfolg nach 800 ms, Nummernformat, `?fehler=1` → Fehler. Mit Endpunkt: POST-JSON, Nummer vom Server, HTTP-Fehler |
| `validate.test.ts` | alle Formularregeln und Fehlertexte, „1020 Wien“ → plz/ort, Formular-Payload |
| `contact.test.ts` | `tel:+43…`, wa.me-Link mit kodiertem Text, Verhalten bei Platzhalter |
| `content.test.ts` | Daten konsistent (eindeutige ids, min < max, Icon-Datei vorhanden, Tipps vorhanden). Sechstes Gewerk per `vi.mock`: erscheint in allen Listen der gerenderten Seite und als Luna-Chip in `flow.start()`, Payload und Tipp funktionieren |
| `icon.test.ts` | `<Icon>` liefert im Server-Rendering ein `<svg>` |
| `tokens.test.ts` | Wächter aus Abschnitt 2 |
| `platzhalter.test.ts` | listet verbliebene `[…]`-Platzhalter als Warnung im Log, schlägt nicht fehl |

### Playwright (`npm run test:e2e`, Chromium, Projekte 390 × 844, 1024 × 768, 1440 × 900)

| Spec | Szenarien |
|---|---|
| `seite.spec` | Abschnitte in Reihenfolge, Anker; Navigation ab 920 px, Menü-Knopf darunter; Nummer im Kopf ab 560 px. **Falz** 390 × 844: Unterkante von Anrufen, WhatsApp und Anfrage senden < 660 px. **Kein horizontales Scrollen** bei 320, 360, 390, 559, 560, 639, 640, 768, 919, 920, 1024, 1280, 1440 und 1920 px (Seite und offene Überlagerungen). Touch-Ziele ≥ 44 px. Alle `tel:`-Knöpfe Türkis mit Tiefsee-Schrift. Gewerke-Icons Petrol bzw. Orange ohne Fläche, auch im Dialog. **Keine Anfrage an fremde Hosts** beim Laden (Mitschnitt), keine Cookies. Kein Konsolen- oder Hydrationsfehler auf allen 4 Pfaden. H1 im HTML vor JavaScript. Meta-Felder, `lang`, Favicon, sitemap.xml, robots.txt. Platzhalterseiten 200 mit `noindex`, `/gibt-es-nicht` → 404 |
| `preisrechner.spec` | Start Installateur 2 h, Gewerk wechseln, Stepper-Grenzen, Schlüsseldienst (Stepper weg, Hinweis, „Einsatz“), zwei Zuschläge (Hinweis `role="status"`), SPEC-Fälle über die Oberfläche, Gesamt einzeilig auch bei 320 px |
| `preisuebersicht.spec` | 3 Auslöser; Dialog ab 640 px, Sheet darunter; Fokus auf Schließen; Fokusfalle, Esc, Klick auf die Abdunklung, Fokus zurück zum Auslöser, Seite scrollt nicht mit; „Zum Preisrechner“ |
| `menue.spec` | `aria-expanded`/`aria-controls`, Fokusfalle, Esc, Link schließt und springt (Ziel unter dem Kopf sichtbar). „Preisübersicht“ öffnet ein bedienbares Sheet, danach Fokus auf dem Menü-Knopf |
| `luna.spec` | Anstupser nach 8 s (Playwright-Uhr), nur einmal pro Sitzung, nicht nach offenem Chat, Text öffnet den Chat. `#luna`-Links. Desktop nicht modal (Seite bedienbar, Anrufen sichtbar), Handy Vollbild modal. Esc minimiert bzw. schließt, Verlauf und Fortschritt bleiben nach dem Wiederöffnen. Wechsel 1024 → 390 → 1024 bei offenem Chat ohne Fehler. Fokus in Eingabe bzw. auf erste Auswahl. `aria-valuenow`/`-valuetext` nach jeder Antwort. Ganzer Ablauf bis Erfolg mit `F247-…`, PLZ-Fehler, fehlende Nummer, „Angaben ändern“, Einwilligung Pflicht. `?fehler=1` → Fehler, „Erneut senden“, Angaben bleiben |
| `formular.spec` | Prüfung beim Verlassen; Absenden leer → Fokus auf ersten Fehler, `aria-invalid`/`aria-describedby`; `type=tel`/`autocomplete=tel`; „Wird gesendet …“ deaktiviert; Erfolg ersetzt das Formular; `?fehler=1` → Meldung über dem Knopf mit „Stattdessen anrufen“, Angaben bleiben |
| `a11y.spec` | axe (WCAG 2.0/2.1/2.2 A und AA) in jedem Zustand der Screenshot-Matrix, 0 Verstöße |
| `tastatur.spec` | Jedes Bedienelement per Tab erreichbar, vorwärts und rückwärts. Fokusrahmen 3 px Türkis, Abstand 3 px. Fokussiertes Element nie ganz von Kopf, Luna-Knopf oder Luna-Fenster verdeckt (2.4.11) |
| `bewegung.spec` | Zuordnung: Preis-Dialog und Anstupser 160 ms (`--fx-dur-dialog`), Luna öffnen/schließen und Fortschritt 200 ms (`--fx-dur-chat`), Sheet 240 ms (`--fx-dur-sheet`), Hover/Fokus 120 ms nur Farbe, Menü ohne Bewegung. Mit `reducedMotion: 'reduce'` keine Übergänge |

### Screenshots (`npm run shots` → `tests/screens-actual/<zustand>-<breite>.png`)

Für 1024 gibt es keinen Entwurf. Dort gilt das Desktop-Layout (Navigation sichtbar, da ≥ 920 px), verglichen wird gegen 02.

| Zustand | 390 | 1024 | 1440 | Vergleich mit |
|---|---|---|---|---|
| startseite (ganze Seite) | ✓ | ✓ | ✓ | 01 / 02 / 02 |
| falz (nur Viewport) | ✓ | – | – | 01 oben |
| preisuebersicht | Sheet | Dialog | Dialog | 04 / 03 / 03 |
| menue | ✓ | – (kein Menü ab 920) | – | 05 |
| luna-anstupser | ✓ | ✓ | ✓ | 06 / 02 / 02 |
| luna-gespraech (Frage 4) | Vollbild | Fenster | Fenster | 07 / 11 / 11 |
| luna-zusammenfassung | ✓ | ✓ | ✓ | 08 / 12 links |
| luna-erfolg | ✓ | ✓ | ✓ | 09 / 12 Mitte |
| luna-sendefehler | ✓ | ✓ | ✓ | 10 / 12 rechts |
| rechner-schluesseldienst | ✓ | ✓ | ✓ | 13 oben |
| rechner-zwei-zuschlaege | ✓ | ✓ | ✓ | 13 unten |
| formular-fehler / -erfolg / -sendefehler | ✓ | ✓ | ✓ | 01 / 02 (Zustände nicht gezeichnet, SPEC 9) |
| impressum | ✓ | – | ✓ | – |

### Lighthouse (`lighthouserc.json`)

`staticDistDir: ./dist`, Liste `/index.html` und `/impressum.html`, mobil, 3 Läufe, `chromePath: C:\Program Files\Google\Chrome\Application\chrome.exe`. Für `/` gilt ≥ 95 in allen vier Kategorien, für `/impressum` ≥ 95 in Performance, Barrierefreiheit und Best Practices. SEO zählt dort nicht, weil `noindex` den Wert absichtlich senkt.

## 5. Ablauf und Aufteilung auf Subagents

**Schleife pro Phase** (als Workflow): bauen → qa-runner (`npm run check`, dann `npm run test:e2e`) → `npm run shots` → visual-reviewer und, wenn sich Texte geändert haben, copy-checker parallel → alle Punkte „hoch“ und „mittel“ beheben → von vorn.
- **Fertig** ist eine Phase nur, wenn der qa-runner in dieser Runde alles grün meldet und der visual-reviewer „Freigabe: ja“ sagt. Erfolg melde ich nie ohne die Prüfungen der aktuellen Runde.
- **Höchstens 4 Runden.** Ist es nach Runde 4 nicht grün, höre ich auf, berichte Stand und Blocker und baue nicht weiter.

**Dateihoheit:** Zuerst baue ich die gemeinsamen Dateien der Phase (`content/*`, `ui/`, `overlays.tsx`, Logik) und bringe sie per `npm run check` auf grün. Erst danach starten die ui-builder. Parallele Builder arbeiten jeweils in einer eigenen Git-Worktree mit eigenem `npm ci`. Sie ändern nur ihre eigenen Dateien und melden fehlende Texte, statt `copy.ts` anzufassen. Ich führe die Ergebnisse zusammen und fahre danach den vollen Check.

**accepted-deviations.md:** Der visual-reviewer bekommt pro Phase die Liste bewusster Abweichungen: noch nicht gebaute Abschnitte, leere Bildflächen, Logo 800, Abweichungen durch Tokens und alle Standards aus Abschnitt 7. Ohne diese Liste gibt er nie frei.

| Phase | Ich (Opus) | ui-builder (Sonnet), parallel | qa-runner (Haiku) | visual-reviewer (Sonnet) | copy-checker (Haiku) |
|---|---|---|---|---|---|
| 1 Gerüst | `git init`, Projekt, Vorrender-Spike, Tokens, Tailwind-Theme, Schriften, Basis, Fokus, reduced motion, Skripte, Playwright- und Lighthouse-Konfiguration, Falz-Test (fixme), Screenshot-Skript, Token-Wächter | – | check, e2e | Basisseite: Schriften, Farben, Fokus | – |
| 2 Statisch | `content/*` komplett, `contact.ts`-Ableitungen + Tests, `ui/`-Bausteine, `App.tsx`, Platzhalterseiten, Meta | A: Kopf, Hero, Schnellwahl, Vertrauensleiste · B: Leistungen, Ablauf · C: Fuß | check, e2e | 01, 02 bei 390/1024/1440 | ja |
| 3 Interaktion | `preis.ts` + Tests, `overlays.tsx` | A: Preisrechner-UI · B: Preisübersicht Dialog/Sheet · C: Handy-Menü | check, e2e | 01, 02, 03, 04, 05, 13 | ja |
| 4 Luna | `validate.ts`, `submitLead.ts` (Ersatz, `?fehler=1`, `F247-…`), `flow.ts`, alle mit Tests | A: Knopf, Anstupser, Fenster und Vollbild, Verlauf, Eingabe · danach B: Karten Zusammenfassung, Erfolg, Sendefehler | check, e2e | 06–12 | ja |
| 5 Formular | Endpunkt-Pfad in `submitLead.ts` + Tests, Formular-Payload | A: Formular-UI mit allen Zuständen | check, e2e | 01, 02 (Anfrage) | ja |
| 6 Abnahme | REPORT.md, letzte Korrekturen | nur für Befunde | check, e2e, lighthouse | alle Zustände, Freigabe | alle Texte |

**Commits:** am Ende jeder Phase (`Phase N: …`). Es gibt noch kein Git-Repo und keinen Remote. `git init` kommt in Phase 1, danach nur lokale Commits, kein Push.

**Meldung nach jeder Phase:** erledigt · Prüfergebnis mit Zahlen (Vitest, Playwright, axe, ggf. Lighthouse) · Runden gebraucht · offen.

**REPORT.md (Phase 6)** enthält:
- Prüfergebnisse mit Zahlen
- Screenshot-Pfade
- SPEC 11 mit den gebauten Standards
- die Standards aus Abschnitt 7 und den Payload-Regeln
- alle verbliebenen Platzhalter
- Vercel-Anleitung:
  - Build-Befehl `npm run build`, Ausgabe `dist`, `cleanUrls`
  - `VITE_LEAD_ENDPOINT` vor dem Build setzen, jede Änderung braucht ein Redeploy
  - CORS des Endpunkts
  - Warnung: Ohne die Variable meldet der lokale Ersatz live Erfolg, und Anfragen gehen verloren

## 6. Nicht entschieden und nicht gezeichnet

- Für 1024 px und die Formularzustände gibt es keinen Entwurf. Vergleich gegen 02 bzw. SPEC 9.
- Die Einwilligung ist in Screen 08 und 12 schon angehakt. Sie startet leer (DSGVO), der Screen zeigt den Zustand nach dem Anhaken. Fehlt sie, greift der Text aus SPEC 9.

## 7. Durch Rangfolge oder Technik entschieden (Standard gebaut, steht im Bericht)

| Punkt | Standard |
|---|---|
| Logo-Gewicht 900 im HTML | Bricolage 800 (SPEC 11, die Achse endet bei 800) |
| Umbrüche im HTML `max-width: 920/560` | strikt „unter“ 920, 560 und 640 px (SPEC 4) |
| Kopf zwischen 560 und 920 px (kein Entwurf) | kompakter Handy-Kopf (64 px), sobald der Menü-Knopf erscheint |
| Bild 1 am Handy | wie Screen 01: nach der Schnellwahl, vollbreit, 300 px. Am Desktop rechts im Hero |
| Anstupser im HTML unter 560 px ausgeblendet | sichtbar auf allen Breiten (SPEC 8, Screen 06) |
| Luna-Knopf-Abstände im HTML 18/24 px | laut SPEC: 16/16 am Handy, 28/28 am Desktop |
| Anstupser-Schließen 36 px, Checkboxen 22–24 px, Fußlinks ~22 px | Trefferfläche ≥ 44 px, die Optik bleibt |
| Anstupser-Text ist im HTML ein `<p>` | Knopf, öffnet den Chat |
| Rechtliche Links `#impressum` usw. | `/impressum`, `/datenschutz`, `/agb` |
| `tel:` leer, WhatsApp `#whatsapp` | aus `contact.ts` (SPEC 9) |
| Icons mit festem `fill="#001B2A"` | Dateien mit `currentColor`, Farbe vom Elternelement |
| Menü-Link „Preisübersicht“ `href="#preise"` | Knopf, öffnet das Sheet |
| Luna-Knopf: Das HTML ändert `aria-label` auf „Chat schließen“ | Label bleibt, nur `aria-expanded` und Icon wechseln (SPEC 8) |
| Luna-Fenster 680 px fest, Verlauf abgeschnitten | `min(680px, 100vh − 136px)`, Verlauf scrollt und bleibt unten (siehe Frage 3) |
| Zuschlags-Hinweis ohne `role` | ein dauerhaftes Element mit `role="status"` |
| Leistungen am Handy als Spalte | ein Raster `auto-fill` ab 340 px auf allen Breiten |
| Preisübersicht, Reihenfolge der Knöpfe | wie Screens: Dialog [Zum Preisrechner][Anrufen], Sheet [Anrufen] und darunter der Textlink |
| Preisübersicht, zwei Hinweistexte | beide wörtlich in `copy.ts` |
| Fortschritt nach dem Senden | wie Screens: 5/5 bei der Zusammenfassung, danach kein Balken |
| Verlauf nach dem Senden | wie Screens: Die Ergebnisansicht ersetzt den Verlauf, der Fehler zeigt die Kurzfassung „Ihre Anfrage“ |
| Größe der Luna-Signet-Glyphe (Seite 50 %, Board 60 %) | Werte der Seitenentwürfe |
| WhatsApp-Logo | Sprechblase `ui-chat` als Platzhalter. Das offizielle Logo wird als lokale Datei nachgeliefert |
| Lighthouse SEO auf den Platzhalterseiten | ausgenommen, weil `noindex` |
| SPEC 11 (alle 9 Punkte) | Standard aus der Tabelle, Liste im Bericht |

## 8. Risiken und Fragen (5)

**Entscheidung vom 13.10.2026:** Die Empfehlungen gelten (1A, 2 bis 5 wie vorgeschlagen).

**Luna mit KI (später):** Die API-Schlüssel liefern Sie. Deshalb ruft die Chat-Oberfläche schon jetzt eine asynchrone Antwort-Schnittstelle auf (`antworte(zustand, eingabe): Promise<…>`). Der geführte Ablauf in `src/luna/flow.ts` ist ihre erste Umsetzung. Eine KI-Umsetzung kommt später daneben. Die Schlüssel gehören nie in den Browser-Code: Variablen mit `VITE_`-Präfix sind öffentlich. Die KI läuft deshalb über eine Vercel-Funktion (z. B. `api/luna`), und der Schlüssel liegt als Server-Umgebungsvariable in Vercel. Gebaut wird diese Funktion jetzt nicht, die Anleitung kommt in den Bericht.

1. **Schriftgrößen, die nur in den Screens stehen.** Die in tokens.css kommentierten Varianten deckt Abschnitt 2 schon ab. Übrig bleiben:
   - Ergebnis-Überschrift 22 px
   - Gesamtpreis am Handy 24 px
   - Schrittnummern 72/56 px
   - Hero-Anruf 25/23 px
   - Knöpfe und Chips 16–18 px
   - Hinweis 13 px
   - Abstände 10/14/18/20/22 px

   Dazu kommt: „ca. 2.189,90 € – 3.389,90 €“ passt mit 30 px (und auch mit 24 px) bei 320 px nicht einzeilig in die Karte.
   - **A (Empfehlung):** in `src/styles/tokens.css` als klar markierter Block „ergänzt aus Screen 01/02/13/14“ aufnehmen, dazu `--fx-total` mit fließender Verkleinerung auf schmalen Screens. Komponenten nutzen weiter nur Tokens, das Ergebnis ist pixelnah. Abstände werden auf die `--fx-s-*`-Stufen gerundet.
   - **B:** nur vorhandene Tokens, jeweils der nächste Wert. Das ergibt Abweichungen von 1–14 px. Der Gesamtpreis bricht dann bei 320 px um, SPEC sagt aber „einzeilig“.
2. **Luna-Texte, die im Design fehlen.** Vorschläge:
   - „Danke, Frau Huber.“: Luna fragt kein Geschlecht ab → „Danke, Maria Huber. Ihre Anfrage ist unterwegs.“
   - Ort aus der PLZ („1020 Wien“, Luna fragt nur die PLZ) → 1010–1239 = Wien, sonst nur die PLZ. Alternative: PLZ-Liste der Post mit rund 2.500 Einträgen.
   - Nummer fehlt → „Unter welcher Nummer erreicht Sie der Betrieb?“
   - Erfolgstext je Gewerk („an einen passenden …“): Installateur, Fachbetrieb für Heizung und Klima, Schlüsseldienst, Elektriker, Fachbetrieb für Haushaltsgeräte. Bei „Weiß ich nicht“: Fachbetrieb.
   - Dringlichkeit in der Zusammenfassung und Kurzfassung: „Heute noch“/„heute“ und „In den nächsten Tagen“/„in den nächsten Tagen“. Gezeichnet ist nur „Sofort, Notfall“/„sofort“.
   - Erfolg und Fehler des Formulars übernehmen die Texte aus Luna 09/10.
3. **Luna-Fenster gegen den Anruf-Knopf (Widerspruch in SPEC 8).** Mit „höchstens Fensterhöhe − 136 px“ reicht das Fenster auf niedrigen Bildschirmen (z. B. 1366 × 768) bis 28 px unter den oberen Rand. Dann verdeckt es den Anruf-Knopf im Kopf, obwohl „Anrufen bleibt im Seitenkopf sichtbar“ gilt.
   - **Empfehlung:** die Höhe zusätzlich so begrenzen, dass das Fenster immer unter dem Kopf endet.
   - **Alternative:** die SPEC-Zahl wörtlich übernehmen.
4. **Kontrast des Fokusrahmens.** 3 px Türkis erreicht auf Kalk 2,6 : 1 und auf Weiß 2,8 : 1, also weniger als die 3 : 1 aus WCAG 1.4.11. Auf Tiefsee sind es 6,3 : 1. axe erkennt das nicht.
   - **Standard:** wie in der SPEC, Hinweis im Bericht.
   - **Alternative:** auf hellen Flächen Fokus in Tiefsee (16,3 : 1), auf dunklen in Türkis.
5. **Handy-Texte.** Screen 01 kürzt am Handy:
   - Schnellwahl ohne Unterzeilen
   - „Nicht sicher? Luna fragen“
   - im Fuß „[Telefonnummer]“ statt „Telefon [Telefonnummer]“
   - Anruf-Knopf im Seitenkasten ohne Nummer

   SPEC 2 sagt „Texte exakt aus 02“.
   - **Empfehlung:** Handy wie Screen 01, Desktop wie 02, beide Varianten in `copy.ts`.
   - **Alternative:** die Texte aus 02 auf allen Breiten.
