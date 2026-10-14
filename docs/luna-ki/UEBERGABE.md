# Übergabe: Luna mit KI (neue Session)

Stand 14.10.2026. Die Aufgabe steht wörtlich in [AUFGABE.md](AUFGABE.md). **Umgesetzt am selben Tag, siehe [BERICHT.md](BERICHT.md).** Diese Übergabe ist der Stand davor.

## 1. Ausgangslage im Repo

- Website komplett gebaut und abgenommen (Phasen 0–6), alles auf `main` committet, kein Remote. Bericht: [../../REPORT.md](../../REPORT.md), Plan und Entscheidungen: [../../PLAN.md](../../PLAN.md), bewusste Abweichungen: [../../tests/accepted-deviations.md](../../tests/accepted-deviations.md).
- Stack: React 19 + TS 6 + Vite 8 + Tailwind 4, vorgerendert (`scripts/prerender.mjs`), Hosting Vercel. Prüfen: `npm run check`, `npm run test:e2e` (Playwright mit installiertem Chrome), `npm run shots`, `npm run lighthouse`.
- **Luna heute:** geführter Ablauf ohne KI nach design/SPEC.md Abschnitt 8.
  - Logik: `src/luna/flow.ts` (reiner Zustandsautomat, `Responder`-Schnittstelle `gefuehrt`, asynchron, extra für eine spätere KI vorbereitet), Tests `src/luna/flow.test.ts`.
  - Oberfläche: `src/luna/` (Luna, LunaLauncher, Anstupser, LunaChat, Kopf, Verlauf, Eingabe, cards/*).
  - Zustand im Speicher: `src/overlays.tsx` (nicht in sessionStorage).
  - Versand: `src/lib/submitLead.ts` (JSON-POST an `VITE_LEAD_ENDPOINT`, Antwort `{anfragenummer}`, lokaler Ersatz, `?fehler=1`), Prüfregeln `src/lib/validate.ts`.
  - Daten: `src/content/gewerke.ts` (5 Gewerke, Preise, Tipps), Texte `src/content/copy.ts` (`copy.luna`).
  - Tests: `tests/e2e/luna.spec.ts`, axe- und Screenshot-Zustände `luna-*`.
- Referenz der alten Umsetzung: `C:\Users\gesch\Downloads\Impeccable` (nur lesen). Dort liegt eine `.env` mit Schlüssel: **nicht lesen, nicht kopieren.**

## 2. Widersprüche zwischen neuer Aufgabe und gebautem Stand (vor dem Bauen klären)

Rangfolge bisher: design/SPEC.md > Screens > Referenz-HTML. Die neue Aufgabe ändert SPEC 8 und 9 an vielen Stellen. Es muss feststehen, ob sie SPEC 8/9 ersetzt.

| # | Thema | Heute (SPEC 8/9, gebaut) | Neue Aufgabe |
|---|---|---|---|
| 1 | Ablauf | 5 feste Fragen für alle Gewerke | Fragenkatalog je Gewerk (4–6 Fragen), Dringlichkeit, Wunschtermin bei NORMAL, Ort |
| 2 | Fortschritt | „Frage x von 5“ | 4 Schritte Problem → Details → Ort → Prüfen |
| 3 | Kontaktdaten | im Chat abgefragt („Wie heißen Sie …“) | erst als Felder in der Zusammenfassungskarte (Name, Telefon Pflicht, E-Mail optional), nie an OpenAI |
| 4 | Einwilligungstext | „Ich bin einverstanden, dass fixit247 meine Angaben zur Vermittlung an einen Fachbetrieb weitergibt.“ (Screen 08) | „Ich stimme zu, dass meine Angaben zur Bearbeitung der Anfrage verwendet und … an einen passenden Partnerbetrieb weitergegeben werden.“ |
| 5 | Versand | JSON an `VITE_LEAD_ENDPOINT`, Erfolg = `{anfragenummer}`, Anzeige „F247-…“ | URLSearchParams an `FORM_ENDPOINT` (Apps Script), Erfolg nur `{ok:true, match:'FOUND'|'NONE'}`, 20 s Timeout, `anfrageId` je Anfrage; gilt auch für das Website-Formular |
| 6 | Ergebnisse | Erfolg / Sendefehler | Betrieb gefunden / kein Betrieb / Fehler, danach „Neue Anfrage starten“ |
| 7 | Gewerk-Namen | „Heizung & Klima“, „Elektro“, „Haushaltsgeräte“ (Design) | „SHK (Heizung & Klima)“, „Elektriker“, „Haushaltsgeräte-Reparatur“ |
| 8 | Nacht-Zuschlag | ohne Uhrzeit | „Nacht (18–08 Uhr)“ |
| 9 | Anstupser | nach 8 s (SPEC 8) | nach 25 s oder 60 % Scrolltiefe, `sessionStorage['fixit-nudge']` |
| 10 | Zustand | im Speicher, übersteht Minimieren | `sessionStorage['fixit-luna']`, übersteht Neuladen; Kontaktdaten nach Abschluss löschen |
| 11 | Scrollen | Vollbild am Handy ist modal und sperrt die Seite | „Der Chat sperrt das Scrollen der Seite nicht“ (Handy-Vollbild?) |
| 12 | Gewerk-Karten | „… anfragen“ wählt das Gewerk im Formular vor | Klick auf eine Gewerk-Karte öffnet Luna mit vorgewähltem Gewerk |
| 13 | Backend/Hosting | Vercel, keine Server-Funktion | lokal `tools/server.mjs` (`/api/chat`, Attrappe), live Google Apps Script; Vite-Dev-Server und Vercel bleiben? Wohin kommt `/api/chat` lokal (Vite-Proxy/Plugin statt eigenem Server?) |
| 14 | PLZ | 1010–9992 gültig, Ort nur für Wien abgeleitet | gegen PLZ-Liste prüfen, Ort abfragen. **Test verlangt, dass „2020“ abgelehnt wird – 2020 ist aber eine gültige PLZ (Hollabrunn).** Vermutlich ist „2020“ als Jahreszahl gemeint (Prompt-Regel „Jahreszahlen sind keine PLZ“). Klären. |
| 15 | Tests | Playwright-Projekt in `tests/e2e`, `npm run test:e2e` | „Playwright, `check.mjs`“ – in die bestehende Suite einordnen statt eigener `check.mjs`? |
| 16 | Notruf | kein Notfall-Zustand | EMERGENCY-Hinweis 122/112 bei Funken, Rauch, Brand- oder Gasgeruch (Text ist nicht im Design, steht aber wörtlich in der Aufgabe) |
| 17 | Modell | – | `gpt-5.6-luna` laut Aufgabe; Name vor dem Bauen in der OpenAI-Konfiguration bestätigen |

Weiter offen aus SPEC 11 (unverändert): „Auftrag aufgeben/aufgegeben“, Brutto/netto, Zuschlag auf Anfahrt, Anfahrt 29,90 vs 15 €, Logo, Kontaktdaten, Bilder, Endpunkt, Sicherheitstipps.

## 3. Vorschlag für den Ablauf in der neuen Session

1. Session starten mit Opus 5.5 im Ordner `C:\Users\gesch\Videos\fixit247-website`. CLAUDE.md wird automatisch geladen.
2. Zuerst die Widersprüche oben entscheiden lassen (höchstens 5 Fragen, Rest als Standard).
3. Referenz `Impeccable/assets/luna.js`, `tools/apps-script-chat.gs`, `tools/server.mjs`, `tools/apps-script.gs` lesen (ohne `.env`).
4. Plan-Gate wie bisher: Plan vorlegen, auf OK warten.
5. In den vier Schichten der Aufgabe bauen (Abschnitt 9), je Schicht `npm run check`, `npm run test:e2e`, Shots, visual-reviewer/copy-checker, höchstens 4 Runden.
   - Schicht 1 ersetzt `src/luna/flow.ts` durch den Katalog-Automaten (Responder-Schnittstelle beibehalten), Versand-Umstellung betrifft auch `src/components/AnfrageFormular.tsx` und `src/lib/submitLead.ts`.
   - `SERVICES` = bestehende Quelle `src/content/gewerke.ts` erweitern statt neu anlegen (Regel: eine Quelle).
6. API-Schlüssel nur in `.env` (lokal, ist in `.gitignore`) bzw. als Skripteigenschaft im Apps Script. **Nicht in den Chat kopieren.**

## 4. Startprompt für die neue Session (zum Einfügen)

> Lies `docs/luna-ki/UEBERGABE.md` und `docs/luna-ki/AUFGABE.md`, dann `REPORT.md` und `PLAN.md`. Wir bauen die Aufgabe aus AUFGABE.md auf dem bestehenden Stand weiter. Kläre zuerst die Widersprüche aus UEBERGABE.md Abschnitt 2 mit mir (höchstens 5 Fragen, Rest mit Standard), lies dann die Referenz in `C:\Users\gesch\Downloads\Impeccable` (nur lesen, `.env` nicht öffnen) und lege einen Plan vor. Erst nach meinem OK bauen. Arbeite wie bisher in Schleifen mit qa-runner, visual-reviewer und copy-checker, höchstens 4 Runden je Schicht.
