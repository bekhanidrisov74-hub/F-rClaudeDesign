# Bildbriefe fixit247

Sechs 3D-Szenen aus Blender: **eine Fachkraft eines Fachbetriebs arbeitet konkret an der Schadstelle ihres Gewerks.** Man erkennt in zwei Sekunden das Gewerk und die Tätigkeit. Der Ton bleibt ruhig, kompetent und freundlich, mit einem Augenzwinkern, nie bedrohlich: kein Feuer, keine Überschwemmung, keine Gefahr.

**Kein Text, keine Zahlen, keine Logos im Bild, und nirgends „fixit247“** auf Kleidung, Werkzeug oder Fahrzeug: fixit247 vermittelt nur, die Figuren gehören zu den Fachbetrieben (SPEC 1).

## Welt der Bilder: Tiefsee-Studio in 3D

Gebaut wie die Gewerke-Icons und Symbole: weich glänzende, gerundete Formen im Stil der Fluent-3D-Emojis. Alle sechs Bilder teilen Bühne, Licht und Figurenart.

- **Raum:** matte Hohlkehle in Tiefsee `#001B2A`. Softbox, Aufhellung und Streiflicht treffen nur Figur und Requisiten (Light-Linking), die Wand bleibt dunkel. Kein Raster im Bild (das Raster gehört der Seite).
- **Türkis nur als Lichtkegel:** ein gedämpfter Kegel in Türkis `#3AA8B8` auf der Wand hinter der Figur, höchstens ein Fünftel der Fläche, dazu kleine Akzente (Wasser, Anzeige). Das Bild bleibt überwiegend dunkel (Richtwert: mindestens 60 % dunkle Fläche). So bleibt der Anruf-Knopf das hellste Türkis der Seite (SPEC 3).
- **Licht:** Softbox von links oben vorne, flache Aufhellung von rechts, schmales türkises Streiflicht von rechts hinten für eine feine Kante.
- **Figuren:** stilisiert und freundlich, großer Kopf; Gesicht mit glänzenden Augen, Brauen, Nase, Ohren und leichtem Lächeln; Frisur mit Haaransatz. **Die Hände sind wichtig:** Handfläche, vier dreigliedrige Finger, Daumen und Nägel; greifende Hände legen sich genau um den Werkzeuggriff, stützende liegen offen an. Latzhose Petrol mit Beintaschen, Hemd Kalk mit gekrempelten Ärmeln, Uhr, Akzente Orange (Kappe, Reflexstreifen, Werkzeugtasche), Stiefel mit Zehenkappe und Knieschoner Tiefsee-2. Orange ist der Akzent des Bildes.
- **Haut und Haare:** Mischungen der Token-Farben wie `color-mix` in `tokens.css` (`scripts/blender/figur.py`): hell = Orange 30 % + Weiß, mittel = Orange 55 % + Weiß, braun = Orange 62 % + Tiefsee, dunkel = Orange 42 % + Tiefsee; Haare Tiefsee, Orange 35 % + Tiefsee oder Kalk 70 % + Tiefsee. Über die sechs Bilder verteilt.
- **Material:** lackiert und weich glänzend, Chrom mit breiten, ruhigen Lichtkanten, Wände und Böden matt.
- **Kamera:** 50-mm-Objektiv, halbnah: Die Figur füllt vom Kopf bis etwa zur Hüfte den größten Teil des Karten-Zuschnitts, eine Hand ist etwa 6–8 % der Bildbreite groß. Gesicht, Hände, Werkzeug und Schadstelle liegen im mittleren Band, damit Handy- und Desktop-Zuschnitt aus derselben Datei kommen.

Die Texte unten gehören nicht auf die Website.

## Ablage und Ablauf

- Bühne: `scripts/render-bilder-3d.py`; je Szene `scripts/blender/szenen/bild_N.py`; Figuren `scripts/blender/figur.py`; Formen und Farben `scripts/blender/fx3d.py`.
- Rendern (Blender 5.2, headless, ~1 min je Bild): `blender -b --factory-startup --python-exit-code 1 -P scripts/render-bilder-3d.py [-- bild-N …]`; Vorschau mit `-- --vorschau bild-N` (600 px), Detailprüfung von Händen und Gesicht mit `-- --pruefen bild-N` (1200 px), beide im Temp-Ordner `fixit247-vorschau`.
- Quelle `design/bilder-3d/bild-N.png`, 2400 × 2400 px. `scripts/export-3d.mjs` schreibt `public/images/bild-N.webp` und `.avif` plus 480, 800 und 1200 px.

| Nr. | Wo | Motiv und Tätigkeit | Ausschnitt |
|---|---|---|---|
| 1 | Hero, rechte Fläche (Desktop), Streifen unter der Schnellwahl (Handy) | Fachkraft beugt sich über die Spüle: die rechte Faust setzt den Maulschlüssel an der Mutter am Armaturenfuß an, die linke hält den Auslauf; ein türkiser Tropfen fällt ins Becken; offene Werkzeugkiste (angeschnitten), Kartusche und Dichtringe auf der Platte | Kappe bis Tropfen in der Mitte (Handy-Streifen zeigt 23–73 % der Höhe); unten nur Platte und Schrankfront, dort liegt am Desktop die Schnellwahl darüber |
| 2 | Karte Installateur | Fachkraft kniet an einer gefliesten Vorwand: die Faust zieht mit der Rohrzange die Messing-Überwurfmutter fest, die andere Hand stützt sich offen an den Fliesen ab; Tropfen fallen in einen Eimer, Taschenlampe auf der Vorwand, Werkzeugkoffer | Gesicht, beide Hände, Zange und Mutter |
| 3 | Karte Heizung & Klima | Fachkraft mit grauen Haaren hält den Messfühler im Messstutzen der geöffneten Gastherme und liest das Messgerät mit türkiser Anzeige in der anderen Hand ab; Kabel zwischen beiden | Therme, Messgerät, beide Hände und Gesicht |
| 4 | Karte Schlüsseldienst | Fachkraft kniet an der Wohnungstür: die Faust führt den Pick im Profilzylinder, die andere Hand hält offen den Spanner; Werkzeugrolle am Boden | Beschlag, beide Hände und Gesicht |
| 5 | Karte Elektro | Fachkraft mit orangen Handschuhen hält den Spannungsprüfer an eine Klemme im geöffneten Sicherungskasten, ein ausgelöster Hebel in Orange; die andere Hand am Kastenrahmen; Kabelrolle am Boden | Kasten, Prüfer, Hände und Gesicht |
| 6 | Karte Haushaltsgeräte | Fachkraft kniet vor der Frontlader-Waschmaschine und prüft das herausgedrehte Flusensieb, die Taschenlampe in der anderen Hand; Werkzeugkiste daneben | Maschine, Sieb, Lampe, Hände und Gesicht |

Seitenverhältnisse im Layout: Hero-Fläche Desktop füllt die rechte Spalte (mind. 640 px hoch), Handy 300 px hoch bzw. ab 600 px 2 : 1; Karten 4 : 3 (Handy 16 : 9). Die Lage im Hero steuert `object-position` in `Hero.tsx`.
