# Generierter Icon-Satz

23 einzelne PNGs wurden mit dem integrierten Imagegen-Tool anhand von `../ICON-PROMPTS-CHATGPT.md` und `../ICON-REFERENZ.png` erzeugt: fünf Gewerke, Luna und 17 Bedien-Icons.

Die geometrischen SVG-Nachzeichnungen von Luna und den Steuer- und Feldzeichen liegen unter `../icons/`; Gewerke-Icons und Symbole sind seit 17.10.2026 3D-Renders (`../icons-3d/`). Dabei wurden Rundungen, optische Größe und dünne Teile für kleine Darstellungen vereinheitlicht, der Hintergrund entfernt und Farben exakt gesetzt. Bedien-Icons nutzen `currentColor`; Luna verwendet #001B2A, #F2F7F9 und #3AA8B8. `luna-signet-glyph.svg` ist aus dem neuen Luna-Motiv abgeleitet.

Die PNGs bleiben unverändert als Generierungsquellen erhalten. `../ICON-KONTAKTBLATT-ROH.png` zeigt die unveränderten PNGs; `../ICON-KONTAKTBLATT.png` zeigt den SVG-Satz groß und zusätzlich in 24 px. Reihenfolge: Luna, Bedien-Icons laut Tabelle, zuletzt die Luna-Glyphe auf Navy.

Die fünf `gewerk-*.png` verarbeitet kein Skript mehr. Die Gewerke-Icons sind seit 17.10.2026 3D-Renders (`../icons-3d/`, SPEC 3).

Reproduzierbare SVG-Ausgabe und Kontaktblätter: `node scripts/prepare-icons.mjs` aus dem Projektverzeichnis, mit Sharp über `SHARP_MODULE_PATH` wie beim Bildexport. Die SVGs sind bewusst aus wenigen geometrischen Flächen nachgezeichnet; es sind keine automatisch eingebetteten PNGs.
