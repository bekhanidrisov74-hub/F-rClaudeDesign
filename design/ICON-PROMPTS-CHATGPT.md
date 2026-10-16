# Icons mit ChatGPT erzeugen – Stilanker und Prompts

Diese Datei ist die Übersetzung der vorhandenen Icons in Prompts für ChatGPT: ein Stilanker, ein fertiger Prompt pro Icon, eine Vorlage für alle Icons, die später dazukommen, und was danach mit den Dateien passiert. Die Fotos stehen in `IMAGE-PROMPTS-CHATGPT.md`, hier geht es nur um die flachen Figuren.

Die Prompts sind auf Englisch, weil Bildmodelle Englisch am genauesten umsetzen. Alle Maße stammen aus den echten SVGs in `icons/`, deshalb treffen die Prompts den Stil der vorhandenen Figuren.

## Was erzeugt wird

| Gruppe | Icons | Farbe | Raster |
|---|---|---|---|
| Gewerke (Schnellwahl, Preisübersicht) | `gewerk-installateur`, `gewerk-heizung-und-klima`, `gewerk-schluesseldienst`, `gewerk-elektro`, `gewerk-haushaltsgeraete` | Technik Petrol `#3F7D88`, Handwerk Orange `#E8842A` | 32 × 32 |
| Luna | `luna-signet` | Tiefsee `#001B2A`, Kalk `#F2F7F9`, Türkis `#3AA8B8` | 32 × 32 |
| Bedien-Icons (Knöpfe, Vertrauensleiste, Zusagen, Formular, Luna) | 17 Stück `ui-*` | Tiefsee `#001B2A` | 24 × 24 |
| Künftige Icons | Vorlage weiter unten | je nach Gruppe | 32 × 32 bzw. 24 × 24 |

Die Farbe eines Gewerks bestimmt das Feld `kategorie` in `src/content/gewerke.ts` (`technik` = Petrol, `handwerk` = Orange). Ein neues Gewerk bekommt also automatisch die richtige Farbe, wenn das Icon in dieser Farbe erzeugt wird.

**Empfehlung:** Mit den fünf Gewerke-Icons und Luna anfangen, die sieht man groß. Die 17 Bedien-Icons sind klein (16 bis 24 px) und als SVG schon scharf. Sie hier mitzuerzeugen lohnt sich nur, wenn der ganze Satz einheitlich neu wirken soll.

## So gehen Sie vor

1. **Ein einziger ChatGPT-Chat für alle Icons.** Sonst driften Strichstärke, Rundung und Farbe auseinander.
2. Im ersten Beitrag **`design/ICON-REFERENZ.png` anhängen** (alle vorhandenen Icons auf einem Blatt) und den **Stilanker** (unten) einfügen. ChatGPT soll nur bestätigen, noch kein Icon erzeugen.
3. Dann die Prompts **einzeln** einfügen, ein Icon pro Beitrag. Ein Icon, das gefällt, dient ab jetzt als zusätzliche Referenz.
4. Jedes Icon im **größten quadratischen Format** als PNG speichern, in `design/icons-roh/`, mit dem Dateinamen aus der Tabelle (`gewerk-installateur.png` usw.).
5. Zum Schluss mit dem **Kontaktblatt-Prompt** (ganz unten) prüfen, ob alle wie ein Satz wirken.

## Was ChatGPT nicht kann (und was wir danach machen)

- **SVG:** ChatGPT liefert PNG. Die Seite braucht SVG (`design/icons/*.svg`, geladen von `Icon.tsx`, Farbe aus den Tokens). Das Projekt zeichnet die PNGs deshalb als SVG nach und ersetzt die Dateien in `design/icons/`.
- **Transparenz:** Die Prompts verlangen ein flaches Weiß als Hintergrund. Beim Nachzeichnen fällt es weg.
- **Exakte Farben:** ChatGPT trifft die Hex-Werte nur ungefähr. Beim Nachzeichnen setzen wir sie exakt.

## Stilanker (zuerst einfügen, mit angehängtem Referenzblatt)

```
I need a consistent icon set for a modern Austrian emergency-tradesperson website. The attached sheet shows the existing icons; they define the style exactly. Please confirm you understand the rules; do not generate an icon yet.

Style rules for every icon in this set:
- Flat vector pictogram: a solid filled silhouette in ONE flat color. No outlines or strokes around shapes, no gradients, no shadows, no glow, no 3D, no perspective, no texture, no photo realism, no hand-drawn wobble.
- Built only from simple geometric shapes: rounded rectangles, circles, circular arcs and straight bars. All corners are softly rounded with one consistent small radius (about 6% of the icon width). Only arrows, triangles and check marks keep sharp points.
- Chunky and bold: the thinnest solid part is at least 8% of the icon width, so the icon stays readable at 24 px. No hairlines anywhere.
- Interior detail comes from negative space only: cut-outs let the white background show through the silhouette (the hole in the key bow, the slots in the thermostat head, the window in the switch plate, the gap around the water in the washing machine ring). Never draw thin interior lines.
- A complex object is built from 2 to 4 solid parts that are either fused into one silhouette or separated by clean narrow gaps (about 5% of the icon width), like a stencil. At most 6 distinct shapes per icon, so the icon can be traced as clean vector.
- Strictly orthographic side or front view, one object, centered, recognisable from its silhouette alone.
- The longest side of each icon fills about 85% of the canvas; all icons have the same optical weight and the same visual size.
- Colors, use exactly these hex values:
  - Technik (heating and cooling, electrical, household appliances): petrol #3F7D88
  - Handwerk (plumbing, locksmith): orange #E8842A
  - Functional UI symbols: deep navy #001B2A
  - Luna emblem: navy disc #001B2A, off-white crescent #F2F7F9, turquoise dot #3AA8B8
- Canvas: square 1:1, perfectly flat pure white #FFFFFF background, nothing else in the image: no text, no labels, no frame, no drop shadow, no second icon.
- Friendly and trustworthy, not cartoonish: no faces, no eyes, no hands, no people.
```

## Gewerke-Icons (32 × 32)

### 1 – `gewerk-installateur` (Handwerk, Orange)

```
Generate icon 1 of the set (file name gewerk-installateur). Follow all style rules above and match the attached reference sheet exactly in chunkiness, corner radius and flatness.
Subject: a wall-mounted water tap with a goose-neck spout and one falling drop, side view.
Construction, 4 solid parts, all in the same flat orange #E8842A:
- Wall plate: a short, thick vertical rounded bar on the far left, about 11% of the icon width wide and 34% of its height tall, flush against the start of the pipe.
- Spout: a thick horizontal pipe (thickness about 16% of the icon height) running from the wall plate to the right, then bending down in one smooth round quarter circle at the right end and ending in a flat straight cut about 16% of the height below the bend. The inner corner of the bend is only slightly rounded.
- Handle: on top of the pipe, centered over its horizontal run, a T-shaped handle: a short stem about 11% of the icon width wide standing on the pipe, topped by a wide flat pill-shaped bar about 45% of the icon width with fully rounded ends.
- Drop: one classic teardrop (pointed tip up, round belly down), about 16% wide and 24% tall, hanging below the open spout end on the right, separated from the spout by a narrow gap.
No cut-outs, no outlines, no water jet, no tiles.
Square 1:1, flat pure white #FFFFFF background, icon centered, longest side about 88% of the canvas, nothing else in the image.
```

### 2 – `gewerk-heizung-und-klima` (Technik, Petrol)

```
Generate icon 2 of the set (file name gewerk-heizung-und-klima). Follow all style rules above and match the attached reference sheet exactly in chunkiness, corner radius and flatness.
Subject: a radiator thermostat valve, front view, perfectly symmetric.
Construction, 3 solid parts, all in the same flat petrol #3F7D88:
- Thermostat head: a tall rounded block at the top center, about 50% of the icon width wide and 53% of its height tall. Generous corner radius at the top (about 12% of the icon width), smaller at the bottom (about 9%). Three evenly spaced thin vertical rounded slots are cut out of the head like grip ribs (the white background shows through), each about 5% of the icon width wide and 30% of its height tall, in the upper part of the head.
- Neck: a short narrow block under the head, about 25% wide and 8% tall.
- Valve body: a wide horizontal rounded bar under the neck, about 69% of the icon width wide and 23% tall, small corner radius. A short square pipe stub is attached on each side and reaches almost to the canvas edge (each about 11% wide and 14% tall, vertically centered on the body).
No radiator, no flame, no snowflake, no outlines.
Square 1:1, flat pure white #FFFFFF background, icon centered, longest side about 88% of the canvas, nothing else in the image.
```

### 3 – `gewerk-schluesseldienst` (Handwerk, Orange)

```
Generate icon 3 of the set (file name gewerk-schluesseldienst). Follow all style rules above and match the attached reference sheet exactly in chunkiness, corner radius and flatness.
Subject: a house key lying against a door edge, side view.
Construction, 3 solid parts fused into one silhouette, all in the same flat orange #E8842A:
- Door edge: a tall vertical rounded bar on the far left, about 28% of the icon width wide and 81% of its height tall, corner radius about 8% of the icon width.
- Key blade: a horizontal bar leaving the door edge to the right at mid height, about 33% of the icon width long and 16% thick. Two small square teeth hang down from its underside, each about 8% wide and 8% tall, evenly spaced with a gap of about 5% between them.
- Key bow: a round ring at the right end of the blade, outer diameter about 38% of the icon width, overlapping the blade end, with a round hole cut out of its center (hole diameter about 14% of the icon width).
No lock cylinder, no keychain, no outlines.
Square 1:1, flat pure white #FFFFFF background, icon centered, longest side about 88% of the canvas, nothing else in the image.
```

### 4 – `gewerk-elektro` (Technik, Petrol)

```
Generate icon 4 of the set (file name gewerk-elektro). Follow all style rules above and match the attached reference sheet exactly in chunkiness, corner radius and flatness.
Subject: a light switch plate, front view, perfectly symmetric.
Construction, all in the same flat petrol #3F7D88:
- Plate: a tall rounded rectangle centered on the canvas, about 56% of the icon width wide and 88% of its height tall, corner radius about 8% of the icon width.
- Window: a rounded-square cut-out in the middle of the plate, about 34% of the icon width wide, corner radius about 5%; the white background shows through.
- Rocker: inside the window, one smaller solid rounded rectangle (about 22% wide, 17% tall) sitting in the upper half of the window, with a thin white gap to the window edge on all sides.
- Screw holes: two small round cut-outs (diameter about 10% of the icon width), one centered above the window and one centered below it.
No wires, no lightning bolt, no outlines.
Square 1:1, flat pure white #FFFFFF background, icon centered, longest side about 88% of the canvas, nothing else in the image.
```

### 5 – `gewerk-haushaltsgeraete` (Technik, Petrol)

```
Generate icon 5 of the set (file name gewerk-haushaltsgeraete). Follow all style rules above and match the attached reference sheet exactly in chunkiness, corner radius and flatness.
Subject: the round front door of a washing machine with water inside, front view.
Construction, 3 solid parts, all in the same flat petrol #3F7D88:
- Ring: a thick round ring, outer diameter about 81% of the icon width, ring thickness about 13% of the icon width. The ring sits slightly left of center (its center at about 47% of the icon width) to leave room for the handle.
- Water: inside the ring, separated from it by a narrow even white gap, one solid bowl-shaped lower half disc whose top edge is a soft double wave (two gentle waves, water level slightly below the middle of the window).
- Handle: a small rounded tab on the right, attached to the outside of the ring, about 11% wide and 22% tall, with rounded outer corners.
No machine body, no knobs, no bubbles, no outlines.
Square 1:1, flat pure white #FFFFFF background, icon centered, longest side about 88% of the canvas, nothing else in the image.
```

## Luna

### 6 – `luna-signet`

```
Generate icon 6 of the set (file name luna-signet). Follow all style rules above and match the attached reference sheet exactly in flatness and chunkiness.
Subject: the emblem of the chat assistant "Luna", a night sky roundel.
Construction:
- A perfectly round solid disc in deep navy #001B2A, filling the canvas edge to edge with only a thin white margin.
- On it, centered, a bold off-white #F2F7F9 crescent moon, about 56% of the disc diameter in size and chunky (the thickest part is about a third of the crescent diameter). The horns point to the upper right and lower right, the open side faces the upper right.
- In the open area of the crescent at the upper right, one small round turquoise #3AA8B8 dot (diameter about 11% of the disc) like a single star.
No other stars, no clouds, no text, no gradient, no glow.
Square 1:1, flat pure white #FFFFFF background, nothing else in the image.
```

Die Seite zeigt nur die Mondsichel mit dem Punkt (`luna-signet-glyph`). Sie sitzt in der Schnellwahl auf einem Tiefsee-Quadrat mit abgerundeten Ecken und im Chat-Knopf auf einem runden Tiefsee-Knopf. Aus dem Kreis lässt sich die Glyphe daher ohne neuen Prompt freistellen.

## Bedien-Icons (24 × 24)

### Vorlage für ein Bedien-Icon

Die Zeile „Subject“ aus der Tabelle darunter wird in diese Vorlage eingesetzt. Ein Beitrag pro Icon.

```
Generate UI icon ui-<NAME> (file name ui-<NAME>) of the set. Follow all style rules above and match the attached reference sheet exactly in weight and corner treatment. This is a small functional symbol that must stay readable at 20 px.
Subject: <SUBJECT FROM THE TABLE>
Color: one flat deep navy #001B2A, solid fill only, no outline.
Square 1:1, flat pure white #FFFFFF background, symbol centered, sized as in the reference sheet (bars and chevrons smaller than discs and badges), nothing else in the image.
```

### Subjects

Spalte „Datei“ = Dateiname beim Speichern, Spalte „Subject“ = Text für die Vorlage.

| Datei | Subject (auf Englisch einsetzen) |
|---|---|
| `ui-anrufen` | a classic telephone handset running diagonally from upper left to lower right: a rounded earpiece end at the upper left and a rounded mouthpiece end at the lower right, joined by a gently curved bar. One solid shape, no cord, no sound waves. |
| `ui-aufklappen` | a downward-pointing chevron (V): two bars, each about 9% of the canvas thick, meeting at a sharp mitered point at the bottom, flat diagonal cut ends. About 58% of the canvas wide and 35% tall. |
| `ui-chat` | a speech bubble: a wide rounded rectangle (about 83% wide and 58% tall, corner radius about 12% of the canvas) with a small triangular tail at the bottom left pointing down. Three round dots in a row are cut out inside (typing indicator), each about 11% of the canvas in diameter, evenly spaced. |
| `ui-formular` | a portrait document page, about 65% wide and 83% tall, with the top right corner cut diagonally (cut about 23% of the width), other corners rounded. Three horizontal text lines are cut out in the lower half: two long, one shorter, each about 7% thick, evenly spaced. |
| `ui-haekchen` | a bold check mark: a short stroke from the upper left down to the vertex and a long stroke up to the upper right. Stroke thickness about 8% of the canvas, flat angular ends. About 56% wide and 44% tall. |
| `ui-info` | a solid disc (about 83% of the canvas) with a letter i cut out: a square-ended vertical bar in the lower part and a small square dot above it, both about 9% of the canvas wide. |
| `ui-menue` | three horizontal bars of equal length (75% of the canvas wide), each about 9% thick, evenly spaced with gaps of about 13%, flat square ends. |
| `ui-minus` | a single horizontal bar, 58% of the canvas wide and about 9% thick, flat square ends, centered. |
| `ui-plus` | a plus sign with four equal arms, bars about 9% thick, 58% by 58% of the canvas, flat square ends. |
| `ui-region` | a map location pin: a rounded teardrop that is round on top (about 60% of the canvas wide, 83% tall) and narrows to a point at the bottom, with a round hole cut out of the upper part (diameter about 23% of the canvas). |
| `ui-richtpreis` | a price tag: a square upper left corner with a small round hole cut out near it (diameter about 13% of the canvas), then two straight 45-degree edges running to the right and downward that end in a softly rounded point at the lower right. Small rounded corners, one solid shape. |
| `ui-rund-um-die-uhr` | a clock: a solid disc (about 83% of the canvas) with the hands cut out as one L-shaped cut: a vertical hand from the center up toward 12 and a horizontal hand from the center to the right toward 3, thickness about 8% of the canvas. |
| `ui-schliessen` | an X: two bars crossing diagonally at the center, each about 9% thick, flat angular ends, about 58% by 58% of the canvas. |
| `ui-senden` | a paper plane pointing to the right: a solid arrow-like triangle with its tip at the right center and a rectangular notch cut into the left side so it reads as a paper plane. Sharp corners, about 79% wide and 71% tall. |
| `ui-vermittlung` | two linked rings side by side, each ring about 50% of the canvas in outer diameter and about 10% thick, placed so that each ring's edge passes through the center of the other ring. Same flat color, no weaving. |
| `ui-warnung` | a warning triangle pointing up, sharp corners, about 88% wide and 77% tall, with an exclamation mark cut out: a vertical bar (about 8% wide, 23% tall) above a small square dot. |
| `ui-weiter` | a right-pointing chevron (>): two bars, each about 9% of the canvas thick, meeting at a sharp mitered point on the right, flat diagonal cut ends. About 35% wide and 58% tall. |

## Vorlage für neue Icons

Für ein neues Gewerk oder ein neues Bedien-Icon: Platzhalter ausfüllen, Beschreibung in 2 bis 4 Teilen halten, Prozentwerte wie in den Beispielen oben angeben.

```
Generate a new icon for the set (file name <gewerk-xyz or ui-xyz>). Follow all style rules above and match the attached reference sheet and all previous icons exactly: same flat solid silhouette, same chunkiness, same corner radius, same use of cut-outs.
Subject: <ONE object and what makes it recognisable>, <side view or front view>.
Construction, <2 to 4> solid parts, all in the same flat color <#3F7D88 Technik | #E8842A Handwerk | #001B2A UI>:
- <Part 1: shape, size as a percentage of the icon width and height, position>
- <Part 2: ...>
- <Cut-outs: what is cut out, where, how big>
Explicitly not: <things ChatGPT tends to add, for example outlines, shadows, text, background objects>.
Square 1:1, flat pure white #FFFFFF background, icon centered, longest side about 88% of the canvas, nothing else in the image.
```

Welche Farbe: elektrisch, Heizung, Geräte, Technik allgemein = Petrol `#3F7D88`. Klassisches Handwerk mit Händen am Werkstück (Installateur, Schlüsseldienst, Tischler, Glaser) = Orange `#E8842A`.

## Prüfliste vor dem Speichern

- [ ] Eine Farbe, flach, keine Umrandung, kein Verlauf, kein Schatten
- [ ] Auf 24 px verkleinert (Bild im Browser stark verkleinern) noch erkennbar
- [ ] Dieselbe Strichstärke, Rundung und optische Größe wie auf dem Referenzblatt
- [ ] Details nur als Aussparung, keine dünnen Innenlinien
- [ ] Höchstens 6 Formen, damit das Nachzeichnen sauber wird
- [ ] Kein Text, keine Marke, keine Hände, keine Gesichter
- [ ] Hintergrund reines Weiß, nichts sonst im Bild

Typische Nachbesserungen, einfach im selben Chat schreiben:
- „Remove the outline and fill the shape solid in one flat color.“
- „Make it chunkier. The thinnest part must be at least 8% of the icon width.“
- „Fewer details. At most 6 shapes, no thin interior lines, details only as cut-outs.“
- „Use exactly #3F7D88, flat, no shading and no highlights.“
- „Same size and weight as the reference icons. The longest side fills 88% of the canvas.“
- „Remove the shadow and the background texture. Pure white #FFFFFF.“

## Kontaktblatt zur Kontrolle

Wenn mehrere Icons fertig sind, im selben Chat:

```
Arrange all icons generated so far on ONE image in an even grid, each icon at the same size, on a flat pure white background, no labels and no text. Do not change any icon. I want to check that they look like one set.
```

## Nach dem Erzeugen (im Projekt)

Wenn die PNGs in `design/icons-roh/` liegen:

1. Die PNGs als SVG nachzeichnen (32 × 32 bzw. 24 × 24, `fill="currentColor"` bei Bedien-Icons, feste Farbe über die Tokens bei den Gewerken wie bisher).
2. Die Dateien in `design/icons/` ersetzen. Namen und Einbindung bleiben, `Icon.tsx` lädt sie wie bisher.
3. Mit `npm run shots` und dem visual-reviewer gegen die Screens prüfen.
