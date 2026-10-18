# fixit247 Website – Paket für Claude Code

## So startest du

1. Neuen, leeren Ordner anlegen (z. B. `fixit247-website`) und `git init`.
2. Den **Inhalt** dieses Pakets hineinkopieren: `design/`, `.claude/`, `CLAUDE.md`, `CLAUDE-CODE-PROMPT.md`.
3. Claude Code im Ordner starten, Modell **Opus 5.5**.
4. Den kompletten Inhalt von `CLAUDE-CODE-PROMPT.md` als erste Nachricht einfügen.
5. Claude Code liefert zuerst einen Plan (Phase 0). Prüfen, dann mit „OK“ freigeben.

## Was drin ist

| Pfad | Inhalt |
|---|---|
| `CLAUDE-CODE-PROMPT.md` | Kickoff-Prompt mit Phasen, Bau-Prüf-Fix-Schleife (max. 4 Runden je Phase) und Subagents |
| `CLAUDE.md` | Dauerhafte Regeln fürs Repo |
| `.claude/agents/` | Subagents: ui-builder und visual-reviewer (Sonnet 5.5), qa-runner und copy-checker (Haiku 5.5) |
| `design/SPEC.md` | Verhalten, Rechner-Logik mit Testfällen, Luna-Ablauf, Formular, Qualität, offene Entscheidungen |
| `design/screens/` | 14 Entwürfe als PNG |
| `design/reference-html/` | Dieselben Entwürfe als HTML (Texte, Icons, Maße) |
| `design/tokens.css`, `tokens.json` | Design-Tokens |
| `design/icons/` | Steuer- und Feldzeichen (X, Pfeile, Plus/Minus, Menü, Häkchen, Warnung) und Luna-Signet als SVG |
| `design/icons-3d/` | 5 Gewerke-Icons und 11 Symbole (je zwei Farbstellungen) als 3D-Renders (`scripts/render-icons-3d.py`) |
| `design/bilder-3d/` | Bilder 1–6 als 3D-Szenen (`scripts/render-bilder-3d.py`); `scripts/export-3d.mjs` exportiert alles nach `public/` |
| `public/modelle/` | Dieselben Szenen als 3D-Objekte (GLB) für three.js (`render-bilder-3d.py -- --glb`, gezeigt von `src/components/ui/Szene3D.tsx`) |
| `design/IMAGE-BRIEFS.md` | Briefe für die 6 Bilder |

## Hinweise

- In den Agent-Dateien steht `model: sonnet` bzw. `model: haiku`. Falls deine Claude-Code-Version damit nicht Sonnet 5.5 und Haiku 5.5 wählt, dort `claude-sonnet-5-5` bzw. `claude-haiku-5-5` eintragen.
- Vor dem Livegang ausfüllen: Telefonnummer, WhatsApp, E-Mail, Firmenname (`src/content/contact.ts`), Endpunkte für Anfragen und Luna (`VITE_FORM_ENDPOINT`, `VITE_CHAT_ENDPOINT`, siehe `docs/hosting.md`), Logo, Bilder, Rechtstexte.
- Offene Entscheidungen stehen in `design/SPEC.md`, Abschnitt 11. Claude Code baut dafür Standards und listet sie im Bericht.
