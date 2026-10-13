<raw>
Bau die komplette fixit247-Website nach dem fertigen Design im Ordner design/. Erst planen, dann nach meinem OK bauen. Arbeite in Schleifen: bauen, prüfen mit Screenshots, fixen, bis alles grün ist.
</raw>

<task>
Baue die responsive Website von fixit247, einem kostenlosen Vermittlungsdienst für Handwerker-Notdienste in Österreich.

Lieferumfang:
- **Startseite** mit allen Abschnitten:
  - Kopf mit Navigation
  - Hero
  - Schnellwahl
  - Vertrauensleiste
  - Leistungen
  - So funktioniert's
  - Preisrechner
  - Anfrage-Formular
  - Fuß
- **Überlagerungen:**
  - Preis-Dialog (Desktop) bzw. Bottom-Sheet (Handy)
  - Handy-Menü
  - Luna-Chat mit allen Zuständen: Anstupser, Gespräch, Zusammenfassung, Erfolg, Sendefehler
- **Platzhalterseiten** /impressum, /datenschutz, /agb (noindex)
- **Tests** für Logik, Abläufe, Barrierefreiheit, Falz und Optik
- **Abschlussbericht** in REPORT.md

Das Ergebnis soll wie die Entwürfe in design/screens aussehen und sich wie in design/SPEC.md beschrieben verhalten.
</task>

<context>
Im Repo liegt der Ordner design/ mit dem fertigen Design. Lies zuerst alles davon:
- design/SPEC.md: Verhalten, Logik, Texte, Qualität, offene Entscheidungen. Hat bei Widersprüchen Vorrang.
- design/screens/*.png: 14 Entwürfe (Handy 390, Desktop 1440, Dialog, Sheet, Menü, Luna-Zustände, Rechner-Zustände, Token-Board). Schau sie dir als Bilder an.
- design/reference-html/*.html: dieselben Entwürfe als statisches HTML. Quelle für exakte Texte, Icons und Maße. Inline-Styles nicht kopieren, sondern als Komponenten mit Tokens neu bauen.
- design/tokens.css und tokens.json: Farben, Schriften, Größen, Radien, Schatten, Abstände, Bewegung.
- design/icons/*.svg: Gewerke-Icons, Bedien-Icons, Luna-Signet.
- design/IMAGE-BRIEFS.md: Bilder kommen später. Bis dahin ruhige türkisblaue Flächen ohne Text.

Subagents liegen in .claude/agents/:
- ui-builder (Sonnet 5.5): baut abgegrenzte Komponenten
- visual-reviewer (Sonnet 5.5): vergleicht Screenshots mit den Entwürfen, ändert nichts
- qa-runner (Haiku 5.5): führt Prüfungen aus und fasst zusammen
- copy-checker (Haiku 5.5): prüft Texte und Geschäftsmodell

Du (Opus 5.5) planst, verteilst, integrierst und entscheidest. Verteile anspruchsvolle UI-Arbeit an ui-builder. Mechanische Prüfungen gehen an qa-runner und copy-checker. Nach jeder Phase prüft der visual-reviewer. Unabhängige Aufträge laufen parallel.

Stack: React 19 + TypeScript + Vite + Tailwind CSS v4 (Tokens aus tokens.css als @theme bzw. CSS-Variablen), vorgerendert als statische Seiten, Hosting auf Vercel. Schriften selbst gehostet über @fontsource-variable/bricolage-grotesque und @fontsource-variable/atkinson-hyperlegible-next. Tests: Vitest (Logik), Playwright mit @axe-core/playwright (Abläufe, Barrierefreiheit, Screenshots), Lighthouse CI.
</context>

<constraints>
- Plan-Gate: Phase 0 endet mit einem Plan, dann wartest du auf mein OK. Erst danach Code.
- Design treu umsetzen. Keine eigenen Farben, Schriften, Radien, Schatten oder Abstände außerhalb der Tokens. Keine zusätzlichen Abschnitte, Animationen oder Effekte.
- Anruf-Knopf überall Türkisblau mit Tiefsee-Schrift und das auffälligste Element. Gewerke-Icons direkt eingefärbt (Technik Petrol, Handwerk Orange), ohne Fläche.
- Texte exakt aus design/reference-html und SPEC.md. Österreichisches Deutsch, Sie-Form. Geschäftsmodell nie verfälschen (SPEC Abschnitt 1).
- Daten in src/content/ (gewerke.ts, copy.ts, contact.ts). Ein neues Gewerk muss mit einem Eintrag überall erscheinen.
- Preisrechner rechnet in Cent. Format „190,00–280,00 €“ und „ca. 219,90 € – 309,90 €“. Alle Testfälle aus SPEC Abschnitt 5 als Vitest.
- Luna ohne KI, als geführter Ablauf in src/luna/flow.ts. Formular und Luna senden über src/lib/submitLead.ts (Endpunkt aus VITE_LEAD_ENDPOINT, sonst lokaler Ersatz).
- Keine externen Requests beim Laden, kein Google-CDN, kein Tracking, keine Cookies.
- WCAG 2.2 AA, axe ohne Verstöße, volle Tastaturbedienung, prefers-reduced-motion.
- Offene Entscheidungen (SPEC Abschnitt 11) nicht selbst entscheiden: Standard aus der Tabelle bauen und im Bericht auflisten.
- Schleife pro Phase: bauen → qa-runner (`npm run check`, dann e2e) → Screenshots (`npm run shots`) → visual-reviewer und bei Text-Änderungen copy-checker → alle Punkte mit hoch und mittel fixen → von vorn.
  - Höchstens 4 Runden pro Phase.
  - Ist es nach Runde 4 nicht grün: stoppen, Stand und Blocker berichten, nicht weiterbauen.
- Eine Phase gilt erst als fertig, wenn qa-runner alles grün meldet und visual-reviewer „Freigabe: ja“ sagt. Nie Erfolg melden, ohne die Prüfungen in dieser Runde wirklich ausgeführt zu haben.
- Kleine, nachvollziehbare Commits pro Phase mit klarer Nachricht.
</constraints>

<format>
**Phase 0 – Entdecken und planen** (dann auf mein OK warten)
- Lies design/ komplett und schau dir alle Screens an.
- Liefere:
  1. Komponentenliste mit Zuordnung zu Screens
  2. Ordnerstruktur
  3. Datenmodell in src/content/
  4. Testplan: welche Playwright-Szenarien, welche Screenshots bei 390/1024/1440
  5. Aufteilung auf Subagents je Phase
  6. Risiken und Fragen, höchstens 5

**Phase 1 – Gerüst**
- Vite/React/TS/Tailwind aufsetzen, Tokens, Schriften, Basisstile, Fokusstil, reduced motion.
- npm-Skripte: `check` (tsc, eslint, vitest, build), `test:e2e`, `shots`, `lighthouse`.
- Screenshot-Skript und Falz-Test anlegen.

**Phase 2 – Statische Abschnitte**
- Kopf, Hero, Schnellwahl, Vertrauensleiste, Leistungen, So funktioniert's, Fuß, Platzhalterseiten.

**Phase 3 – Interaktion**
- Preisrechner mit Logik und Tests, Preis-Dialog bzw. Sheet, Handy-Menü.

**Phase 4 – Luna**
- Knopf, Anstupser, Fenster und Vollbild, kompletter Ablauf, Erfolg und Fehler.

**Phase 5 – Formular und Versand**
- Validierung, Zustände, submitLead mit lokalem Ersatz und ?fehler=1.

**Phase 6 – Abnahme**
- Alle Zustände bei 390, 1024 und 1440 px.
- axe, Lighthouse mobil ≥ 95 in allen Kategorien, Falz-Test, kein horizontales Scrollen von 320 bis 1920 px.
- Abschließende Prüfung durch visual-reviewer und copy-checker.

Nach jeder Phase eine kurze Meldung:
- erledigt
- Prüfergebnis mit Zahlen
- Runden gebraucht
- offen

Zum Schluss REPORT.md mit:
- Prüfergebnissen
- Screenshot-Pfaden
- Liste der offenen Entscheidungen aus SPEC Abschnitt 11
- allen verbliebenen Platzhaltern
- Anleitung für Deploy auf Vercel inkl. VITE_LEAD_ENDPOINT
</format>
