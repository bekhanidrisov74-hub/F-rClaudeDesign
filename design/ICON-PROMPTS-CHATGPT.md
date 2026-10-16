# Icons mit ChatGPT erzeugen – Stilanker und Prompts

Diese Datei ist die Anleitung für neue Icons: Stilanker, ein fertiger Prompt pro Icon, eine Vorlage für künftige Icons und was danach mit den Dateien passiert. Die Fotos stehen in `IMAGE-PROMPTS-CHATGPT.md`.

Die Prompts sind auf Englisch, weil Bildmodelle Englisch am genauesten umsetzen.

## Was an den jetzigen Icons stört

- **Unklare Bilder.** Der Lichtschalter liest sich bei 40 px wie ein Handy, der Thermostat wie ein Zahn, der Schlüssel am Türblatt wie ein Balken. Das Bullauge ohne Maschine ist nur ein Ring.
- **Klobig und flach.** Alles in einer Farbe, alles gleich schwer. Neben der feinen, eigenwilligen Bricolage-Schrift wirken die Figuren grob.
- **Kein Bezug zur Seite.** Die Seite arbeitet mit Tiefen (Tiefsee, Tiefsee-2, Linie). Die Icons kennen nur Vollfläche.

## Die neue Richtung: Duoton

- **Zwei Töne derselben Farbe:** das Objekt in der vollen Gewerk-Farbe, ein Begleitteil (Gehäuse, Wand, Platte) als heller Ton derselben Farbe. Das gibt Tiefe ohne Verlauf und ohne Schatten.
- **Weicher, freundlicher:** großzügige Rundungen wie die Bögen der Bricolage, dafür etwas schlankere Teile als bisher.
- **Klare Motive:** Steckdose statt Lichtschalter, Heizkörper mit Thermostat statt Ventil allein, Waschmaschine statt Ring.
- **Auf der Seite** bleibt es ein SVG in `currentColor`: Der helle Ton wird beim Nachzeichnen zu `opacity="0.3"` derselben Farbe. Es braucht keinen neuen Token, und die Farbe kommt weiter aus `kategorie` in `src/content/gewerke.ts`. Keine Fläche hinter dem Icon (SPEC 3).

| Gruppe | Icons | Voller Ton | Heller Ton (nur im PNG) | Raster |
|---|---|---|---|---|
| Technik | `gewerk-heizung-und-klima`, `gewerk-elektro`, `gewerk-haushaltsgeraete` | Petrol `#3F7D88` | `#C5D8DB` | 32 × 32 |
| Handwerk | `gewerk-installateur`, `gewerk-schluesseldienst` | Orange `#E8842A` | `#F8DABF` | 32 × 32 |
| Luna | `luna-signet` | Tiefsee `#001B2A`, Kalk `#F2F7F9`, Türkis `#3AA8B8` | – | 32 × 32 |

Der helle Ton ist genau 30 % der vollen Farbe auf Weiß. So entspricht das PNG dem, was die Seite später mit `opacity="0.3"` zeigt.

**Empfehlung:** Nur die fünf Gewerke-Icons neu erzeugen. Sie sieht man groß (Schnellwahl, Preisübersicht). Die Bedien-Icons (`ui-*`) sind klein, funktional und als SVG scharf; sie bleiben, wie sie sind. Luna nur, wenn das Signet ohnehin neu soll.

## So gehen Sie vor

1. **Ein einziger ChatGPT-Chat für alle Icons.** Sonst driften Strichstärke, Rundung und Farbe auseinander.
2. Den **Stilanker** (unten) einfügen. ChatGPT soll nur bestätigen, noch kein Icon erzeugen. Kein Referenzblatt anhängen: Die alten Icons sollen den neuen Stil nicht vorgeben.
3. Mit **Icon 1** beginnen und so oft neu erzeugen, bis es passt. Es ist ab jetzt die Referenz und geht bei jedem weiteren Icon als Anhang mit.
4. Jedes Icon im **größten quadratischen Format** als PNG speichern, in `design/icons-roh/`, mit dem Dateinamen aus dem Prompt (`gewerk-installateur.png` usw.).
5. Zum Schluss mit dem **Kontaktblatt-Prompt** (ganz unten) prüfen, ob alle wie ein Satz wirken.

## Stilanker (zuerst einfügen)

```
I need a consistent set of five icons for the trades on a modern Austrian emergency-tradesperson website. The site uses a friendly, slightly quirky grotesque typeface (Bricolage Grotesque), deep navy text and calm off-white pages. Please confirm you understand the rules; do not generate an icon yet.

Style rules for every icon in this set:
- Flat vector pictogram in two tones of ONE hue: the main object in the full color, one supporting part (a housing, a wall, a plate, a body) in a light tint of the same color. No third color, no outlines or strokes, no gradients, no shadows, no glow, no 3D, no texture, no perspective.
- Built from simple geometric shapes: rounded rectangles, circles, arcs and straight bars. Generous, consistent corner rounding, like the soft curves of a friendly grotesque typeface. Only drops and lightning may have a pointed tip.
- Medium weight: the thinnest solid part is about 7% of the icon width, so the icon stays readable at 24 px. No hairlines.
- Interior detail only as negative space (cut-outs where the white background shows through). Never thin interior lines.
- At most 5 shapes per icon, so it can be traced as clean vector.
- Strictly frontal or side view, one object, centered, recognisable from its silhouette alone.
- The longest side of each icon fills about 84% of the canvas; all icons share the same optical weight and visual size.
- Colors, use exactly these hex values:
  - Technik (heating, electrical, household appliances): full #3F7D88, light tint #C5D8DB
  - Handwerk (plumbing, locksmith): full #E8842A, light tint #F8DABF
- The light tint is always BEHIND or AROUND the full-color object, never on top of it.
- Canvas: square 1:1, perfectly flat pure white #FFFFFF background, nothing else: no text, no labels, no frame, no drop shadow, no second icon, no background shape behind the whole icon.
- Friendly and trustworthy, not cartoonish: no faces, no eyes, no hands, no people.
```

## Gewerke-Icons (32 × 32)

### 1 – `gewerk-installateur` (Handwerk, Orange)

```
Generate icon 1 of the set (file name gewerk-installateur). Follow all style rules above.
Subject: a wall tap with a falling drop, side view.
- Light tint #F8DABF: a round wall rosette on the far left, a disc about 30% of the icon width in diameter.
- Full orange #E8842A: the tap. A thick horizontal spout (about 15% of the icon height) leaves the rosette to the right and bends down in one smooth rounded quarter circle at its right end, ending in a flat cut. On top of the spout, a short stem with a wide pill-shaped handle (about 40% of the icon width).
- Full orange #E8842A: one classic teardrop below the spout opening, separated by a small gap.
Square 1:1, flat pure white #FFFFFF background, icon centered, longest side about 84% of the canvas, nothing else in the image.
```

### 2 – `gewerk-heizung-und-klima` (Technik, Petrol)

```
Generate icon 2 of the set (file name gewerk-heizung-und-klima). Follow all style rules above and match the attached icon in weight, rounding and tint use.
Subject: a radiator with a thermostat knob, front view.
- Light tint #C5D8DB: the radiator body, four tall rounded vertical ribs side by side with narrow gaps between them, joined by a thin bar at top and bottom, together about 62% of the icon width and 70% of its height, placed left of center.
- Full petrol #3F7D88: a thermostat knob on the right side of the radiator, a tall rounded block (about 22% wide, 34% tall) with two short horizontal cut-out grooves, attached to the radiator by a short pipe stub.
- Full petrol #3F7D88: two short feet under the radiator.
No flame, no snowflake, no outlines.
Square 1:1, flat pure white #FFFFFF background, icon centered, longest side about 84% of the canvas, nothing else in the image.
```

### 3 – `gewerk-schluesseldienst` (Handwerk, Orange)

```
Generate icon 3 of the set (file name gewerk-schluesseldienst). Follow all style rules above and match the attached icon in weight, rounding and tint use.
Subject: a key in front of a lock, front view.
- Light tint #F8DABF: a tall rounded escutcheon plate behind, about 34% of the icon width and 80% of its height, on the left half, with a keyhole cut out near its top.
- Full orange #E8842A: a classic house key lying diagonally across the lower right, from upper left to lower right: a round bow (outer diameter about 34% of the icon width) with a round hole cut out, a straight blade and two square teeth on the blade's lower edge. The key overlaps the plate.
No keyring, no outlines.
Square 1:1, flat pure white #FFFFFF background, icon centered, longest side about 84% of the canvas, nothing else in the image.
```

### 4 – `gewerk-elektro` (Technik, Petrol)

```
Generate icon 4 of the set (file name gewerk-elektro). Follow all style rules above and match the attached icon in weight, rounding and tint use.
Subject: a European wall socket (Schuko type), front view, perfectly symmetric.
- Light tint #C5D8DB: a square cover plate with generous rounded corners, about 84% of the icon width.
- Full petrol #3F7D88: a round socket face centered on the plate, a disc about 56% of the icon width, with two round pin holes cut out side by side (each about 10% of the icon width).
- Cut-outs in the disc: two small rectangular notches, one at the top edge and one at the bottom edge (the earthing clips), where the light tint plate shows through.
No plug, no cable, no lightning bolt, no outlines.
Square 1:1, flat pure white #FFFFFF background, icon centered, longest side about 84% of the canvas, nothing else in the image.
```

### 5 – `gewerk-haushaltsgeraete` (Technik, Petrol)

```
Generate icon 5 of the set (file name gewerk-haushaltsgeraete). Follow all style rules above and match the attached icon in weight, rounding and tint use.
Subject: a front-loading washing machine, front view, perfectly symmetric.
- Light tint #C5D8DB: the machine body, a rounded square about 78% of the icon width and 84% of its height.
- Full petrol #3F7D88: a thick round door ring centered in the lower part of the body (outer diameter about 54% of the icon width); inside the ring, separated by a narrow white gap, a solid half disc of water with a gentle wave on top.
- Full petrol #3F7D88: in the top strip of the body, one small round knob on the left and a short rounded bar (display) on the right.
No bubbles, no outlines.
Square 1:1, flat pure white #FFFFFF background, icon centered, longest side about 84% of the canvas, nothing else in the image.
```

## Luna (optional)

### 6 – `luna-signet`

Nur erzeugen, wenn das Signet ohnehin neu soll. Es hat eigene Farben und bleibt ohne hellen Ton.

```
Generate icon 6 of the set (file name luna-signet), the emblem of the chat assistant "Luna". Flat vector, no gradients, no glow, no text.
- A perfectly round disc in deep navy #001B2A, filling the canvas with only a thin white margin.
- On it, centered, a bold off-white #F2F7F9 crescent moon, about 56% of the disc diameter, the open side facing the upper right.
- In the open area of the crescent at the upper right, one small round turquoise #3AA8B8 dot like a single star (about 11% of the disc).
Square 1:1, flat pure white #FFFFFF background, nothing else in the image.
```

Die Seite zeigt nur die Mondsichel mit dem Punkt (`luna-signet-glyph`). Sie lässt sich aus dem Kreis ohne neuen Prompt freistellen.

## Vorlage für neue Gewerke

```
Generate a new icon for the set (file name gewerk-<name>). Follow all style rules above and match the attached icons exactly: same two-tone use, same weight, same corner rounding, same size.
Subject: <ONE object and what makes it recognisable>, <front view or side view>.
- Light tint <#C5D8DB Technik | #F8DABF Handwerk>: <the supporting part behind the object: shape, size in % of the icon width and height, position>
- Full color <#3F7D88 Technik | #E8842A Handwerk>: <the object itself: shape, size, position, cut-outs>
Explicitly not: <things the model tends to add, e.g. outlines, shadows, text, extra objects>.
Square 1:1, flat pure white #FFFFFF background, icon centered, longest side about 84% of the canvas, nothing else in the image.
```

Welche Farbe: elektrisch, Heizung, Geräte, Technik allgemein = Petrol. Klassisches Handwerk mit Händen am Werkstück (Installateur, Schlüsseldienst, Tischler, Glaser) = Orange.

## Prüfliste vor dem Speichern

- [ ] Genau zwei Töne derselben Farbe, flach, keine Umrandung, kein Verlauf, kein Schatten
- [ ] Der helle Ton liegt hinter dem Objekt, nie darauf
- [ ] Auf 24 px verkleinert (Bild im Browser stark verkleinern) noch erkennbar, auch nur am vollen Ton
- [ ] Gleiche Rundung, Strichstärke und optische Größe wie Icon 1
- [ ] Details nur als Aussparung, keine dünnen Innenlinien, höchstens 5 Formen
- [ ] Kein Text, keine Marke, keine Hände, keine Gesichter
- [ ] Hintergrund reines Weiß, nichts sonst im Bild

Typische Nachbesserungen, einfach im selben Chat schreiben:
- „Use only the two given colors, flat. Remove shading, highlights and outlines.“
- „The light tint must sit behind the main object, not on top of it.“
- „Softer, rounder corners, like a friendly grotesque typeface.“
- „Fewer details. At most 5 shapes, details only as cut-outs.“
- „Same size and weight as the attached icon. Longest side 84% of the canvas.“

## Kontaktblatt zur Kontrolle

```
Arrange all icons generated so far on ONE image in an even row, each icon at the same size, on a flat pure white background, no labels and no text. Do not change any icon. I want to check that they look like one set.
```

## Nach dem Erzeugen (im Projekt)

Wenn die PNGs in `design/icons-roh/` liegen:

1. Die PNGs in `scripts/prepare-icons.mjs` als SVG-Pfade nachzeichnen (32 × 32, `fill="currentColor"`). Der helle Ton wird ein eigener Pfad mit `opacity="0.3"`, der volle Ton ein Pfad ohne Deckkraft. Die Farbe kommt wie bisher aus `kategorie`.
2. Die Dateien in `design/icons/` ersetzen. Namen und Einbindung bleiben, `Icon.tsx` lädt sie wie bisher.
3. Mit `npm run shots` und dem visual-reviewer prüfen (Schnellwahl, Preisübersicht, Rechner).
