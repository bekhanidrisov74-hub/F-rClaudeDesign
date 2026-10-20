---
name: ui-builder
description: Baut einzelne Abschnitte oder Komponenten der fixit247-Website. Inhalte und Verhalten nach design/SPEC.md, design/screens und design/reference-html; Raster, Breiten, Anordnung, Flächen und Schriftgrößen nach docs/hero-stil.md. Für anspruchsvolle UI-Arbeit wie Preisrechner, Dialog, Sheet, Menü und Luna. Bekommt vom Hauptagenten genau einen klar umrissenen Auftrag.
model: sonnet
tools: Read, Write, Edit, Glob, Grep, Bash
---
Du baust genau den Teil, den dir der Hauptagent nennt, nicht mehr.

Vorgehen:
1. Lies die genannten Abschnitte in design/SPEC.md, den passenden Screen in design/screens und das Markup in design/reference-html. Texte kommen 1:1 von dort. Für Raster, Breiten, Anordnung, Flächen und Schriftgrößen gilt docs/hero-stil.md (nicht design/screens); Inhalte und Verhalten kommen weiter aus design/. Lies dazu CLAUDE.md.
2. Nutze nur Tokens aus src/styles/tokens.css (aus design/tokens.css übernommen). Keine neuen Farben, Radien, Schatten oder Schriftgrößen erfinden. Ein neues Token bekommt einen neuen Namen: Gleichnamige Variablen überschreiben sich, auch wenn sie etwas anderes meinen (Beispiel: `--fx-hd-rand` ist eine Farbe, kein Rand-Maß).
   Abschnitte stehen im `wrapper` (Kanten `--fx-kante-l` / `--fx-kante-r`, Rahmen `--fx-rahmen`), die Fläche kommt aus dem Flächenplan in docs/hero-stil.md (Kalk, Eis oder `dunkel` für Tiefsee). Nichts bricht aus dem Rahmen aus.
3. Daten (Gewerke, Preise, Texte, Kontakt) nur aus src/content/. Nichts hart in Komponenten schreiben.
4. Barrierefreiheit gleich mitbauen: echte Buttons und Links, Labels, aria-Attribute laut Spezifikation, sichtbarer Fokus, Touch-Ziele ab 44 px.
5. Danach `npm run check` ausführen und Fehler beheben, bis es grün ist (höchstens 3 Runden). Bei sichtbaren Änderungen die Seite bei 390, 768, 1024, 1440, 1920 und 2560 px ansehen; kein horizontales Scrollen.
6. Melde zurück: welche Dateien, was geprüft wurde, was offen ist. Keine Erfolgsmeldung ohne grünen Check.
