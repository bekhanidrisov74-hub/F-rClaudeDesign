# Plan Optik „ganze Breite“ (Phase 1, 19.10.2026, Stand main 22260fd)

**Freigegeben am 19.10.2026 mit diesen Entscheidungen:** Tiefsee für So funktioniert's **und** den Fuß · Rand unter 1280 px
überall 16 px wie der Hero (Hero bleibt unverändert) · **keine** zusätzlichen Anruf-Knöpfe.
Arbeitsort: Worktree `.claude/worktrees/raster`, Branch `design/raster-rhythmus`, Prüfrunden mit
`bash tests/screens-actual/nachher/shots.sh <TEILE> <ordner>` (Port 4867).

Vorher-Bilder und Messwerte: dieser Ordner (`tests/screens-actual/vorher/` im Haupt-Checkout, gitignoriert).
Spec dazu: `bestand.spec.ts` / `bestand.config.ts` (Preview auf PW_PORT, Standard 4290).

## Gemeinsames Raster

u = `--fx-hd-px` = min(1px, 100vw/1534) ab 1280 px. Rahmen F = 1586 px (Foto 1006 px = 63,43 % von 1586).

| Fensterbreite | Rahmen | Kante links / rechts | Inhaltsbreite |
|---|---|---|---|
| < 1280 | Fenster | 16 / 16 (Hero-Handy 1:1) | vw − 32 |
| 1280–1534 | Fenster | 100u / 80u | 1130 (1280), 1271 (1440) |
| 1534–1586 | Fenster | 100 / 80 | 1354–1406 |
| > 1586 | 1586, zentriert | M + 100 / M + 80, M = (vw − 1586)/2 | 1406 (1920: 267/247, 2560: 587/567) |

- Tokens: `--fx-rahmen: 1586px`, `--fx-kante-l`, `--fx-kante-r` (unter 1280 = 16 px, ab 1280 100u/80u). `--fx-container`, `--fx-hero-max`, `--fx-kalk-2` (falls ungenutzt) entfallen.
- `wrapper` (app.css): max-width Rahmen, margin auto, padding Kanten. Abschnitte, Fuß, Menü, Rechtsseiten ziehen mit.
- `.hd-hero`, `.hd-vorteile`: max-width Rahmen, margin auto (Hintergrund bleibt auf `.hd` voll breit). Foto hängt an der rechten Rahmenkante, Überlappung mit dem Text wie im Entwurf; über 1586 rechts weiche Ausblendung (~96 px). Regel `@media (min-width: 100rem)` in hero.css entfällt.
- `.hd-kopf`: Leiste voll breit, Innenabstand = max(0, (100% − Rahmen)/2) + 92u bzw. 79u.
- Logo (92) und Vorteil-Kreise (93) hängen 7–8 px vor der Kante, H1 hat −4: Hero bleibt 1:1.
- Mitziehen: `--fx-wortmarke-gross`, `sizes` in ui/Bildflaeche.tsx, Glanz-Kommentar.
- Kein Hochskalieren: Hero-Foto gibt es nur in 1006 × 724.

## Typo-Skala (fließend 390 → 1534 wie der Hero)

| Token | heute | neu |
|---|---|---|
| --fx-h2 | 34 → 54 (bis 1440) | 34 → 60 |
| --fx-h3 | 23 → 26 | 23 → 28 |
| --fx-h4 | 20 → 22 | 20 → 24 |
| --fx-lead | 17 → 20,2 | 17 → 20,2 (bis 1534) |
| --fx-body | 16 → 17 | 16 → 18 |
| --fx-text | 16 | 16, ab 920: 17 |
| --fx-note | 14 | 15 |
| --fx-step-nr | 56 → 72 | 56 → 96 |
| --fx-h5 | 17 → 19 | 17 → 19 (bis 1534) |

Gemessen: „Haushaltsgeräte“ Inter 750 bei 19 px = 152 px; Kachel bei 1280 px: 178 px breit, 146 px Text + 16 px negativer Rand = 162 px → 6 Kacheln in einer Reihe ab 1280 passen.

## Flächenplan

Kopf Kalk-Kopf · Hero+Vorteile Kalk · Was ist passiert? **Eis** · Leistungen Kalk · So funktioniert's **Tiefsee** · Preisrechner Kalk · Zusagen **Eis** · Anfrage Kalk · Fragen **Eis** · Fuß **Tiefsee** (Entscheidung; hell: Fuß Kalk-Kopf mit Haarlinie).
Kalk-2 als Abschnittsfläche entfällt (1,04:1 gegen Kalk). Auf Tiefsee: Weiß 19:1, Nebel 10,3:1, Orange 5,3:1, Türkis 7,7:1. Fokus auf dunklen Flächen Türkis statt Tiefsee.

## Abschnitte

- Kopf: Inhalt im Rahmen. Unter 1280 unverändert.
- Hero: bis 1586 unverändert, darüber im Rahmen zentriert (siehe Raster).
- Vorteile: im Rahmen; Text unverändert (13,3 px bei 1280 bleibt offen); Titel h3 → h2 (nur Semantik, Optik gleich).
- Was ist passiert?: Eis-Band, H2 in Abschnittsgröße, Kacheln 2 / 3 / 6 Spalten (< 640 / 640–1279 / ≥ 1280), Unterzeilen 15 px, Luna-Kachel als Umriss-Kachel (Rand, transparent) statt Eis.
- Leistungen: Kalk, 3 Spalten im Rahmen (Karten 361–452 px), Kartentext 17, Bild-`sizes` ans Raster.
- So funktioniert's: Tiefsee-Band, H2 und Titel weiß, Ziffern Orange bis 96 px, Text Nebel 18 px, Grundlinie Tiefsee-2 mit türkiser Laufline.
- Preisrechner: Kalk, im Rahmen, Ergebnis-Spalte ab 1280 ~440 px, Kleintexte 15.
- Zusagen: Eis-Band, CSS-Grid 3 Spalten, Reihenfolge bleibt: [0 breit][1] / [2][3][4] / [5][6 breit]; breite Karten Icon links und Lead-Text, alle Karten weiß, keine Streckung; Handy: Icon neben dem Titel.
- Anfrage: Kalk, Formular + Seitenkasten (ab 1280 380 px).
- Fragen: Eis-Band, linke Spalte (H2 + Lead) ab 920 sticky, rechts weiße Karten.
- Fuß (Tiefsee): Logo „Fixit“ weiß, 247 Orange, Zeile Nebel (`--logo-zeile`); Titel weiß, Links Nebel → weiß; Kontakt-Kreise Lagune; Globus-Linien in Nebel über currentColor statt `--fx-tiefsee`; Wortmarke Lagune → Tiefsee, so breit wie der Inhalt; Trennlinie Tiefsee-2.
- Preisübersicht: Spaltenköpfe 15 px, sonst bleibt.
- Menü: Kanten wie der Kopf; ab 640 zweispaltig (Links | Kontaktkarte).
- Luna: Knopf und Fenster ab 1586 an der rechten Rahmenkante.
- Rechtsseiten: H1 in `--fx-h1`, Kanten im Rahmen.

## Tests und Doku

- tests/e2e/ueberlauf.spec.ts: Breiten + 1586, 2560.
- tests/shots/shots.spec.ts: ALLE + 1920 (Höhe 1080), 2560 (1440).
- Neu in abschnitte.spec.ts: gemeinsame Kanten bei 390 … 2560 (Hero-Lead links = Abschnittstitel links ± 1; Kopf-Anruf rechts = Inhalt rechts ± 1); Hero ohne Lücke zwischen Text und Foto bei 1920/2560.
- Anpassen statt streichen: Wortmarke füllt Inhaltsbreite (neue Breite), ggf. Kachel-Icons.
- CLAUDE.md, docs/hero-stil.md (Raster, Flächen, Typo, „Entfernt“), .claude/agents/ui-builder.md und visual-reviewer.md (Autorität hero-stil.md, 6 Breiten).

## Ablauf Phase 2/3

- Worktree `.claude/worktrees/raster`, Branch `design/raster-rhythmus` von main; eigener PW_PORT (4297) und eigener Preview-Port.
- Reihenfolge: Raster → Hero breit → Abschnitte oben → unten → Fuß → Fenster. Je Schritt: ui-builder (Sonnet) → Shots 390/768/1024/1440/1920/2560 → visual-reviewer (Sonnet) gegen den Hero → fixen; höchstens 3 Runden, Rest notieren.
- Phase 3: qa-runner (check, test:e2e, shots, lighthouse) und copy-checker (Haiku), höchstens 3 Runden; Commit auf dem Branch, vor dem Push fragen.

## Nicht Teil der Umsetzung (Inhalt/Verhalten, nur gemeldet)

- „Was tue ich bei akuter Gefahr?“ ist die letzte, zugeklappte Frage; Text nennt 122/112, Gas-Notruf in Österreich ist 128 (copy.ts:346, 390).
- „Unsere eigenen, geprüften Fachkräfte“ widerspricht der Vermittlung (copy.ts:104, schon als offen markiert).
- Globus: ~15 ms je Bild (headless gemessen), kein Pause-Schalter (WCAG 2.2.2), reduced motion nur beim Laden gelesen (ui/Globus.tsx:28, 46–56, 93–103).
- Doppeltes Tokensystem `--fx-hd-*` (14 wertgleiche Dubletten) bleibt, solange der Hero 1:1 gilt.
