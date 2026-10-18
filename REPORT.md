# fixit247 Website – Abschlussbericht

Stand: 14.10.2026 · Branch `main` · gebaut nach `design/` (SPEC > Screens > Referenz-HTML) und den Entscheidungen aus PLAN.md (Abschnitt 8, freigegeben am 13.10.2026).

## 1. Was gebaut ist

- **Startseite** `/`: Kopf mit Navigation (ab 920 px) bzw. Menü-Knopf, Hero mit Schnellwahl und Bild 1, Vertrauensleiste, Leistungen mit Hilfekarte, So funktioniert's, Preisrechner, Anfrage-Formular mit Seitenkasten, Fuß.
- **Überlagerungen**: Preisübersicht als Dialog (ab 640 px) bzw. Bottom-Sheet, Handy-Menü, Luna mit Anstupser, Gespräch, Zusammenfassung, Erfolg und Sendefehler (Fenster ab 640 px, Vollbild darunter).
- **Platzhalterseiten** `/impressum`, `/datenschutz`, `/agb` mit `noindex`.
- **Technik**: React 19.3, TypeScript 6, Vite 8, Tailwind 4.3 (Theme nur aus `src/styles/tokens.css`), vorgerendert als statische Seiten (`scripts/prerender.mjs`), Schriften lokal über Fontsource. Keine externen Anfragen, keine Cookies, kein Tracking.
- **Daten** nur in `src/content/` (`gewerke.ts`, `copy.ts`, `contact.ts`). Ein neues Gewerk erscheint mit einem Eintrag in Schnellwahl, Leistungen, Rechner, Preisübersicht, Formular und Luna (Test `tests/unit/content.test.tsx`).
- **Luna** ohne KI als geführter Ablauf in `src/luna/flow.ts`, angesprochen über die asynchrone Schnittstelle `Responder` (für eine spätere KI, siehe Abschnitt 8).
- **Versand** für Formular und Luna über `src/lib/submitLead.ts`.

## 2. Prüfergebnisse

Letzte Abnahme-Runde (Phase 6, Runde 2, 14.10.2026), ausgeführt vom qa-runner, geprüft von drei visual-reviewern und dem copy-checker.

| Prüfung | Befehl | Ergebnis |
|---|---|---|
| Typen, Lint, Unit-Tests, Build | `npm run check` | grün: `tsc -b`, `eslint .`, **Vitest 80/80** in 8 Dateien (u. a. alle 5 Pflichtfälle aus SPEC 5, Luna-Ablauf, Versand, Prüfregeln, Token-Wächter, sechstes Gewerk), Build mit Vorrendern von 4 Seiten |
| Abläufe, Barrierefreiheit, Falz, Überlauf | `npm run test:e2e` | **221 bestanden, 0 fehlgeschlagen**, 49 übersprungen (Tests, die nur in einem Viewport-Projekt laufen). Projekte 390 × 844, 1024 × 768, 1440 × 900 |
| axe (WCAG 2.0/2.1/2.2 A + AA) | in `test:e2e` | **0 Verstöße** in 14 Zuständen, jeweils bei 390, 1024 und 1440 px (das Menü nur bei 390), zusammen 40 Läufe: Startseite, Impressum, Preisübersicht, Rechner Schlüsseldienst, Rechner zwei Zuschläge, Menü, Luna (Anstupser, Gespräch, Zusammenfassung, Erfolg, Sendefehler), Formular (Fehler, Erfolg, Sendefehler) |
| Falz 390 × 844 | in `test:e2e` | bestanden: Anrufen, WhatsApp und Anfrage senden enden bei etwa 463 px (Grenze 660 px) |
| Kein horizontales Scrollen | in `test:e2e` | bestanden bei 320, 360, 390, 559, 560, 639, 640, 768, 919, 920, 1024, 1280, 1440, 1920 px: alle vier Seiten sowie mit offener Preisübersicht, offenem Menü und offenem Luna-Chat |
| Tastatur | in `test:e2e` | jedes Bedienelement per Tab vorwärts und rückwärts erreichbar, Fokus nie verdeckt (2.4.11), Fokusfallen in Dialog, Sheet, Menü und Luna-Vollbild, Esc überall |
| Bewegung | in `test:e2e` | nur Token-Dauern (120/160/200/240 ms), mit `prefers-reduced-motion` keine Übergänge |
| Keine externen Anfragen | in `test:e2e` | keine Anfrage an fremde Hosts, keine Cookies, keine Konsolen- oder Hydrationsfehler auf allen vier Seiten |
| Lighthouse mobil | `npm run lighthouse` | `/`: **Performance 98, Barrierefreiheit 100, Best Practices 100, SEO 100** (niedrigster Einzellauf Performance 97). `/impressum`: 98 / 100 / 100, SEO 63 wegen `noindex` (bewusst aus der Wertung). Alle Grenzwerte ≥ 95 erfüllt |
| Optik | `npm run shots` + visual-reviewer | **Freigabe ja** in allen drei Bereichen (Seite, Überlagerungen und Rechner, Luna und Formular) |
| Texte | copy-checker | **0 Befunde**. Geschäftsmodell, Sie-Form, Wortlaut und Preisformate stimmen. Offene SPEC-11-Punkte siehe Abschnitt 5 |

**Übrig mit Schwere „niedrig“** (nach der letzten grünen Runde bewusst nicht mehr geändert):
- Handy-Menü: Der Knopf „Per WhatsApp schreiben“ hat Radius 16 px, Screen 05 zeigt 14 px (`rounded-btn-lg` in `src/components/MobileMenu.tsx` entfernen).
- Handy-Menü: Kopfzeile und Schließen-Knopf liegen 1–2 px versetzt.
- Der Luna-Knopf (Tiefsee) hebt sich über dem Tiefsee-Fuß kaum ab. Dafür gibt es keinen Entwurf, die Entscheidung liegt bei Ihnen (z. B. Rand in Türkis).

## 3. Ablauf nach Phasen

| Phase | Inhalt | Runden | Ergebnis |
|---|---|---|---|
| 0 | Design gelesen, Plan (PLAN.md), Freigabe | – | Plan mit 5 Entscheidungen, alle Empfehlungen freigegeben |
| 1 | Gerüst, Tokens, Vorrendern, Prüf-Infrastruktur | 1 | grün, Freigabe ja |
| 2 | Statische Abschnitte, Platzhalterseiten | 1 | grün, Freigabe ja |
| 3 | Preisrechner, Preisübersicht, Handy-Menü | 4 | grün, Freigabe ja (Runden 2–4 wegen Texten im Code und Seitentitel) |
| 4 | Luna | 3 | grün, Freigabe ja |
| 5 | Formular und Versand | 3 | grün, Freigabe ja |
| 6 | Abnahme: alle Zustände, Überlauf mit Überlagerungen, Lighthouse | 2 | grün, Freigabe ja (Runde 2 nach Kacheltiteln und Kartentitel-Schnitt) |

## 4. Screenshots

Erzeugen mit `npm run shots` (nach `npm run build`). Ablage: `tests/screens-actual/<zustand>-<breite>.png` (nicht im Git).

| Zustand | 390 | 1024 | 1440 | Entwurf |
|---|---|---|---|---|
| Startseite (ganze Seite) | `startseite-390.png` | `startseite-1024.png` | `startseite-1440.png` | 01 / 02 / 02 |
| Falz (Viewport 390 × 844) | `falz-390.png` | – | – | 01 |
| Impressum | `impressum-390.png` | – | `impressum-1440.png` | – |
| Preisübersicht | `preisuebersicht-390.png` (Sheet) | `preisuebersicht-1024.png` | `preisuebersicht-1440.png` | 04 / 03 / 03 |
| Handy-Menü | `menue-390.png` | – | – | 05 |
| Rechner Schlüsseldienst | `rechner-schluesseldienst-390.png` | `…-1024.png` | `…-1440.png` | 13 oben |
| Rechner zwei Zuschläge | `rechner-zwei-zuschlaege-390.png` | `…-1024.png` | `…-1440.png` | 13 unten |
| Luna Anstupser | `luna-anstupser-390.png` | `…-1024.png` | `…-1440.png` | 06 / 02 |
| Luna Gespräch | `luna-gespraech-390.png` | `…-1024.png` | `…-1440.png` | 07 / 11 |
| Luna Zusammenfassung | `luna-zusammenfassung-390.png` | `…-1024.png` | `…-1440.png` | 08 / 12 |
| Luna Erfolg | `luna-erfolg-390.png` | `…-1024.png` | `…-1440.png` | 09 / 12 |
| Luna Sendefehler | `luna-sendefehler-390.png` | `…-1024.png` | `…-1440.png` | 10 / 12 |
| Formular mit Fehlern | `formular-fehler-390.png` | `…-1024.png` | `…-1440.png` | – (SPEC 9) |
| Formular Erfolg | `formular-erfolg-390.png` | `…-1024.png` | `…-1440.png` | – (SPEC 9) |
| Formular Sendefehler | `formular-sendefehler-390.png` | `…-1024.png` | `…-1440.png` | – (SPEC 9) |

Bewusste Abweichungen vom Entwurf stehen in `tests/accepted-deviations.md`.

## 5. Offene Entscheidungen aus SPEC 11 (Standard gebaut)

| Thema | Gebauter Standard | Wo ändern |
|---|---|---|
| „Auftrag aufgeben“ widerspricht dem Vermittlungsmodell | Label wie im Briefing. Auch die Echo-Blase nach dem Senden heißt „Auftrag aufgegeben“ (Screen 09). | `src/content/copy.ts`: `AUFTRAG_AUFGEBEN`, `AUFTRAG_AUFGEGEBEN` (z. B. „Anfrage absenden“ / „Anfrage gesendet“) |
| Brutto/netto | Hinweis „[inkl. 20 % USt.]“ als Platzhalter in der Preisübersicht | `src/content/copy.ts`: `UST_HINWEIS` |
| Zuschlag auf Anfahrt? | Zuschlag nur auf die Arbeit | `src/lib/preis.ts`: `rechne()` (eine Zeile) |
| Anfahrt 29,90 € (Website) vs. 15 € (App) | Werte laut Briefing | `src/content/gewerke.ts`: `anfahrt` |
| Logo | Wortmarke „fixit247“ in Bricolage 800 | `src/components/Header.tsx`, `Footer.tsx`; Favicon `public/favicon.svg` |
| Telefon, WhatsApp, E-Mail, Firmenname | Platzhalter, Links funktionieren ohne Nummer (`tel:`, `wa.me/?text=…`) | `src/content/contact.ts` |
| Bilder 1–6 | Türkisblaue Flächen ohne Text | `src/components/ui/Bildflaeche.tsx` (dort `<picture>` mit `public/images/bild-N.webp/.avif`) |
| Endpunkt für Anfragen | lokaler Ersatz (Erfolg nach 800 ms, `?fehler=1` für Fehler) | Umgebungsvariablen `VITE_FORM_ENDPOINT` und `VITE_CHAT_ENDPOINT` (Abschnitt 8) |
| Sicherheitstipps in Luna | Vorschlag aus SPEC 8, auch in der Erfolgskarte des Formulars | `src/content/gewerke.ts`: `tipp`, `tippErfolg` |

## 6. Weitere Entscheidungen und Ergänzungen

**Freigegeben in Phase 0** (PLAN.md Abschnitt 8):
1. Schriftgrößen aus den Screens als zusätzliche Tokens in `src/styles/tokens.css` (Block „Ergänzt aus den Screens“), Abstände auf die `--fx-s-*`-Stufen gerundet.
2. Luna-Texte, die im Design fehlen: „Danke, {Name}.“ statt „Danke, Frau Huber.“; Ort aus der PLZ nur für Wien (1010–1239); Nachfragen „Unter welcher Nummer erreicht Sie der Betrieb?“ und „Und wie heißen Sie?“; „an einen passenden {Betrieb}“ je Gewerk; Dringlichkeit in Zusammenfassung/Kurzform für „heute“ und „tage“; Formular-Erfolg und -Fehler mit den Texten aus Luna 09/10.
3. Luna-Fenster endet auf niedrigen Bildschirmen immer unter dem Seitenkopf (Anruf-Knopf bleibt sichtbar).
4. Fokusrahmen wie SPEC: 3 px Türkis. **Hinweis:** Auf Kalk 2,6 : 1 und auf Weiß 2,8 : 1, also unter den 3 : 1 aus WCAG 1.4.11 (axe prüft das nicht). Alternative: auf hellen Flächen Fokus in Tiefsee.
5. Handy-Texte wie Screen 01, Desktop wie Screen 02.

**Nach Rangfolge oder Technik entschieden** (vollständig in PLAN.md Abschnitt 7 und `tests/accepted-deviations.md`), u. a.:
- Einwilligung startet leer (DSGVO), obwohl Screen 08/12 sie angehakt zeigen.
- Preisformat mit Nachkommastellen nur im Rechner (SPEC 5), sonst ganze Euro wie in den Entwürfen.
- Gesamtpreis bleibt einzeilig und wird auf schmalen Bildschirmen bzw. bei vierstelligen Beträgen kleiner.
- Esc minimiert das Luna-Fenster auch, wenn der Fokus auf der Seite liegt (WCAG 2.4.11), der Fokus bleibt dort.
- Formular-Sendefehler als Meldung über dem Senden-Knopf (SPEC 9), erneut gesendet wird mit diesem Knopf.
- „… anfragen“ und Schnellwahl-Kacheln wählen das Gewerk im Formular vor. Nach einer erfolgreich gesendeten Anfrage blendet ein solcher Klick die Dankeskarte aus und zeigt ein leeres Formular mit vorgewähltem Gewerk (für eine zweite Anfrage ohne Neuladen).
- Payload-Regeln: „Weiß ich nicht“ und Freitext statt Gewerk → `gewerk: null`, Freitext in `beschreibung`; Freitext statt Dringlichkeit → `dringlichkeit: null`; das Formular sendet `dringlichkeit: null`.

**Texte, die nicht im Design stehen** (in `copy.ts` mit „nicht im Design“ markiert): Seitentitel und Meta-Beschreibung, Unterseiten-Titel, „Menü schließen“-Label, Name der Menü-Fläche, „Stunde“ (Einzahl), Hinweis bei drei Zuschlägen, „Zur Startseite“, Platzhaltertexte der Rechtsseiten, Luna-Nachfragen, „Gewerk wählen“, „Fachbetrieb“ bei „Weiß ich nicht“, Formular-Erfolg und -Fehler (aus Luna 09/10).

## 7. Verbliebene Platzhalter

| Platzhalter | Datei | Sichtbar in |
|---|---|---|
| `[Telefonnummer]` | `src/content/contact.ts:3` (`TELEFON`) | Kopf, Hero, Preisübersicht, Menü, Seitenkasten, Fuß; `tel:`-Links bleiben bis dahin leer |
| `[WhatsApp-Nummer]` | `src/content/contact.ts:4` (`WHATSAPP`) | Fuß; WhatsApp-Links öffnen bis dahin `wa.me` ohne Nummer |
| `[E-Mail-Adresse]` | `src/content/contact.ts:5` (`EMAIL`) | Fuß |
| `[Firmenname]` | `src/content/contact.ts:6` (`FIRMA`) | Fuß („© 2026 [Firmenname]“) |
| `[Domain]` | `src/content/contact.ts:8` (`DOMAIN`) | nicht sichtbar: `sitemap.xml`, `robots.txt` (Sitemap-Zeile), `og:url`, `canonical` |
| `[inkl. 20 % USt.]` | `src/content/copy.ts:10` (`UST_HINWEIS`) | Preisübersicht (Dialog und Sheet), SPEC 11 Brutto/netto |
| `[Impressum folgt]` | `src/content/copy.ts:322` | `/impressum` |
| `[Datenschutzerklärung folgt]` | `src/content/copy.ts:323` | `/datenschutz` |
| `[AGB folgen]` | `src/content/copy.ts:324` | `/agb` |
| Bilder 1–6 | 3D-Szenen `design/bilder-3d/` (`scripts/render-bilder-3d.py`), eingebunden über `src/components/ui/Bildflaeche.tsx` | Hero und Leistungskarten |
| Logo | Wortmarke im Kopf und Fuß, Favicon `public/favicon.svg` (Luna-Signet) | überall |
| WhatsApp-Symbol | 3D-Sprechblase `ui-chat` (`scripts/blender/symbole.py`, `Symbol3D`) | Hero, Seitenkasten, Menü, Fuß |

Der Build meldet sie im Log (`scripts/prerender.mjs`), ebenso eine fehlende Domain und fehlende `VITE_FORM_ENDPOINT` und `VITE_CHAT_ENDPOINT`.

## 8. Live schalten

Hosting und Backend (Webspace mit PHP, seit 16.10.2026) stehen in [docs/hosting.md](docs/hosting.md).

1. **Vor dem Build** in `.env` `VITE_FORM_ENDPOINT=/anfrage.php` (Anfrage-Eingang) und `VITE_CHAT_ENDPOINT=/chat.php` (KI-Backend für Luna) setzen, dann `npm run build` (Node 22, mindestens 22.13). Die PHP-Dateien aus `public/` kommen dabei mit nach `dist/`.
   - Die Variablen werden **beim Build** in den Code geschrieben. Jede Änderung braucht einen neuen Build und Upload.
   - Ohne `VITE_FORM_ENDPOINT` schlägt live jedes Senden fehl (Sendefehler mit Anruf-Knopf), ohne `VITE_CHAT_ENDPOINT` läuft Luna ohne KI. Der Build-Log warnt.
2. `dist/` in den Webroot hochladen und `fixit247-konfig.php` eine Ebene darüber anlegen, wie in [docs/hosting.md](docs/hosting.md), Abschnitt „Einrichtung beim Hoster“. Unterseiten wie `/impressum` funktionieren ohne `.htaccess`.
3. Der OpenAI-Schlüssel liegt nur in `fixit247-konfig.php` (`openai_key`, bzw. lokal in `.env`), nie in einer `VITE_`-Variable.
4. Vor dem Livegang in `src/content/contact.ts` eintragen: `TELEFON`, `WHATSAPP` (übliche Schreibweise, z. B. `0660 123 45 67`; daraus werden `tel:+43…` und `wa.me/43…`), `EMAIL`, `FIRMA`, `DOMAIN` (z. B. `https://www.fixit247.at`; dann bekommen `sitemap.xml`, `robots.txt`, `og:url` und `canonical` echte URLs).
5. Rechtstexte in `src/content/copy.ts` (`rechtliches`) ersetzen und das `noindex` der Rechtsseiten in `src/App.tsx` entfernen, wenn sie indexiert werden sollen.
6. Lokal prüfen: `npm run check`, `npm run test:e2e`, `npm run lighthouse`.

## 9. Luna mit KI

Gebaut am 14.10.2026 nach [docs/luna-ki/AUFGABE.md](docs/luna-ki/AUFGABE.md): Fragenkatalog je Gewerk, KI-Erfassung mit `gpt-6-luna` über Apps Script (seit 16.10.2026 über `public/chat.php`, siehe [docs/hosting.md](docs/hosting.md)), Versand an den Anfrage-Eingang. Bericht, Prüfergebnisse, Live-Schritte und offene Punkte: [docs/luna-ki/BERICHT.md](docs/luna-ki/BERICHT.md).

## 10. Hinweise

- WhatsApp: Die Sprechblase ist ein Platzhalter. Live das offizielle Logo nach den Markenrichtlinien von Meta als lokale Datei einsetzen (`design/icons/` bzw. `src/components/ui/Icon.tsx`).
- Der Datenschutz-Link in Luna und im Formular öffnet `/datenschutz` im selben Tab. Luna setzt das Gespräch danach fort (sessionStorage). Eingetippte Kontaktdaten und ein halb ausgefülltes Formular gehen verloren.
- Playwright und Lighthouse nutzen das installierte Google Chrome (`channel: 'chrome'`, Pfad in `lighthouserc.json`).
- `tests/accepted-deviations.md` listet alle bewussten Abweichungen vom Entwurf je Phase.
