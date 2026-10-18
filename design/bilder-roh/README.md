# Rohbilder

> **Nicht mehr in Verwendung (seit 17.10.2026).** Die Bilder der Seite sind 3D-Szenen aus Blender: `scripts/render-bilder-3d.py` → `../bilder-3d/`, Export mit `scripts/export-3d.mjs`. `scripts/prepare-images.mjs` und `../bilder-final/` gibt es nicht mehr.

Hier liegen die unveränderten PNGs aus ChatGPT, `bild-1.png` bis `bild-6.png`. Prompts: `../IMAGE-PROMPTS-CHATGPT.md`, Motive und Farbwelt: `../IMAGE-BRIEFS.md`.

Aufbereitung: `node scripts/prepare-images.mjs` aus dem Projektverzeichnis. Das Skript gleicht die Farben an die Tokens aus `design/tokens.json` an (Ecken auf Tiefsee, Lichtmitte auf Türkis, Chrom und Wasser mit, Weiß, Grau und Orange bleiben), skaliert auf 2400 × 2400 px nach `../bilder-final/` und schreibt WebP und AVIF nach `../../public/images/`. Die Rohbilder werden nie verändert. Benötigt Sharp; `SHARP_MODULE_PATH` zeigt bei Bedarf auf ein vorhandenes Sharp-Modul.
