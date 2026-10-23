# Website-Bildserie – korrigierte Fassung vom 2026-10-18

Seit 20.10.2026 nicht mehr auf der Seite: Die Leistungskarten zeigen die Fotos aus `../bilder-foto/` (Export mit `scripts/export-bilder.mjs`). Diese Serie bleibt als Archiv.

Die sechs Dateien `bild-1.png` bis `bild-6.png` sind die aktuellen Website-Quellen, jeweils native 1254 × 1254 px. Die Bearbeitungen wurden mit dem eingebauten Bildgenerator erzeugt. `../BILD-PROMPTS-3D-CHATGPT.md` (Originalprompts) und `PROMPTS-KORREKTUREN.md` dokumentieren die Prompts. Das vom Nutzer freigegebene Hero zeigt den korrigierten Maulschlüssel.

| Bild | Geprüfte und korrigierte Details |
|---|---|
| 1 Hero | Verstellbarer Maulschlüssel an einer Sechskantmutter, andere Hand am Auslauf; freigegebene Fassung übernommen. |
| 2 Sanitär | Glatte Schlüsselbacken greifen die Messingmutter, nachvollziehbarer Hebel und geschlossener Handgriff. |
| 3 Heizung | Messsonde am Abgasstutzen, durchgehender Probenschlauch, rechteckiges Messgerät direkt in der Hand statt auf einem Stiel. |
| 4 Schloss | Pick und separater dünner Spanner setzen am selben Zylinder an; der frei hängende orange Stab ist entfernt. |
| 5 Elektro | Zweipoliger Spannungsprüfer mit zwei isolierten Griffen, getrennten Metallkontakten und Verbindungskabel; unbedruckter Schalter. |
| 6 Geräte | Kurzes Pumpensieb mit Schraubdeckel und Dichtung; freie Pumpenöffnung, separater Schlauch am festen Gehäuse; Taschenlampe zeigt in die Öffnung. Kamera für den Kartenausschnitt zurückgesetzt. |

Herstellerreferenzen zur Plausibilitätsprüfung: [Wera: parallele glatte Schlüsselbacken](https://www.wera.de/en/tools/6006-joker-m-l-self-setting-double-spanner), [Testo: Abgasanalyse](https://static-int.testo.com/media/44/09/24c5948e0507/testo-310-Instruction-Manual.pdf), [BENNING: zweipolige Spannungsprüfer](https://www.benning.de/products-us/testing-measuring-and-safety-equipment/test-equipment-voltage-tester.html), [Bosch: Pumpenfilter](https://www.bosch-home.com/us/owner-support/get-support/cleaning-the-washing-machine-filter).

## Einbau

`node scripts/export-3d.mjs` hebt das Schwarz der Bilder auf Tiefsee an und schreibt AVIF und WebP bei 480, 800, 1200 und 1254 px nach `public/images/`. Den Bildausschnitt der Karten steuert `bildY` in `src/content/gewerke.ts`, im Hero die `object-position` in `Hero.tsx`. Die vollständige Serie zeigt `KONTAKTBLATT.png`.
