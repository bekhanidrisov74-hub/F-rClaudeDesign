# Die sechs 3D-Szenen mit ChatGPT erzeugen – Stilanker und Prompts

> **Stand 18.10.2026:** Die sechs Bilder der Seite stammen aus diesen Prompts (`design/bilder-chatgpt/`). Die Blender-Vorlagen `design/bilder-3d/` sind aus dem Projekt entfernt (letzter Stand: Commit 2c0f598).

Vorlage sind die Blender-Renders `design/bilder-3d/bild-1.png` bis `bild-6.png` (2400 × 2400 px). Jede Szene bekommt einen Prompt, der die Blender-Szene Stück für Stück beschreibt: Figur, Hände, Werkzeug, Requisiten und Lage jedes Teils im Bild. Alle sechs teilen **denselben Serienblock** (Bühne, Licht, Farbanteile, Materialien, Figur, Kleidung, Kamera). Dadurch bleibt die Serie in einem Stil, im Look der Seite: ruhig, präzise, modern, Tiefsee mit türkisem Lichtkegel und kleinen orangen Akzenten.

Motive und Ausschnitte stehen in `IMAGE-BRIEFS.md`, bei Widerspruch gilt dort. Die Prompts sind auf Englisch, weil Bildmodelle Englisch am genauesten umsetzen. `IMAGE-PROMPTS-CHATGPT.md` (Studiofotos) ist überholt. Die Icons und Symbole bleiben Blender-Renders und brauchen keinen Prompt.

## So gehen Sie vor

1. **Ein einziger ChatGPT-Chat für alle Bilder.** Sonst driften Licht, Material und Figur auseinander.
2. **Schritt 0, Figurenblatt (empfohlen):** Alle sechs Blender-Dateien anhängen und den Prompt „Figurenblatt“ unten schicken. Ergebnis ansehen: Wirken die sechs Figuren wie eine Familie? Dann ist der Stil festgelegt. Dieses Blatt hängen Sie ab jetzt bei jedem Bild mit an.
3. **Bild 2 zuerst** (Installateur), dann 3, 4, 5, 6, **Hero (Bild 1) zuletzt.** Jeder Prompt ist eigenständig und enthält den Serienblock; über jedem Prompt steht, welche Dateien Sie anhängen. Der Prompt sagt ChatGPT, dass die Anhänge nur Stil, Figurenart und Aufbau vorgeben.
4. Pro Nachricht **ein** Bild, danach **eine** Änderung pro Nachricht, sonst kippen andere Teile.
5. Jedes Bild im **größten quadratischen Format** als PNG speichern, als `bild-N.png` in `design/bilder-chatgpt/` (neuer Ordner, damit `design/bilder-3d/` nicht überschrieben wird).
6. **Prüfliste** unten durchgehen.

Der Serienblock steht in jedem Prompt gleich. Nicht kürzen und nicht umformulieren, sonst leidet die Serie. Änderungen am Stil gehören in alle sechs Prompts.

## Was ChatGPT nicht kann (und was das Projekt danach macht)

- **Größe:** ChatGPT liefert etwa 1024 bis 1536 px. Das Projekt skaliert hoch und erzeugt WebP, AVIF und 480/800/1200 px.
- **Farben:** Exakte Hex-Werte trifft ChatGPT nie. Wichtig sind die Anteile: überwiegend dunkles Tiefsee, wenig Türkis, Orange als Akzent.
- **Hände und Text:** Die zwei häufigsten Fehler. Korrekturzeilen stehen unten.

## Wo die Bilder sitzen

Alle Bilder kommen aus **einer quadratischen Datei** und werden je nach Bildschirm zugeschnitten. Gesicht, Hände, Werkzeug und Schadstelle liegen im **mittleren Band (etwa 25–75 % der Höhe)**.

| Bild | Desktop | Handy |
|---|---|---|
| 1 Hero | rechte Spalte bis zum Rand, ca. 670 × 750 px; unten überlappen die Schnellwahl-Kacheln (untere ~13 %, linke ~80 %) | volle Breite × 300 px, nur 24–75 % der Höhe sichtbar |
| 2–6 Karten | 4 : 3, ca. 365 × 275 px | volle Breite, 16 : 9 |

## Schritt 0 – Figurenblatt

Anhang: alle sechs Dateien `design/bilder-3d/bild-1.png` bis `bild-6.png`

```
SERIES LOCK (identical in all six images of the series)
WORLD: A calm, precise, premium-service look. Stylized 3D render in the spirit of Fluent 3D emoji and soft Blender toy scenes: chunky rounded forms with generous, slightly quirky curves, like the friendly curves of a modern grotesque typeface. Lacquered soft-gloss plastic with broad gentle highlights and subtle inner shading. Clean, uncluttered, every object simplified to its essential shape. NOT photorealistic, NOT a photo, NOT flat vector, NOT sketchy, NOT noisy, no pores, no fabric weave, no dust.
STAGE: a seamless deep navy studio, base color #001B2A, falling off to nearly black toward the edges, matte, no horizon line. One soft, dimmed turquoise (#3AA8B8) spotlight glow on the wall behind the figure's head and shoulders, covering at most one fifth of the image. At least 60 % of the frame stays dark navy.
LIGHT: large soft key light from the upper left front; gentle flat fill from the right; one narrow turquoise rim light from the right rear that draws a fine bright edge along the figure. Soft contact shadows under every object. No lens flare, no bloom, no sparkles, no glitter, no volumetric fog.
COLOR BUDGET (share of the visible surface): dark navy about 60 %, petrol #3F7D88 (overalls, housings) about 15 %, off-white #F2F7F9 and white (shirt, appliance housings) about 10 %, orange #E8842A (accents only) about 6 %, chrome and steel about 4 %, turquoise (glow, water, displays) at most 5 %. Orange always belongs to a real object (hard hat, tool handle, toolbox, strap, glove, hose, button), never to the lighting. Dark parts use #0F2C3C.
MATERIALS: lacquered plastic for clothes, tools and housings; chrome with 2-3 broad calm highlight bands and no glitter; matte rubber and matte walls; water as smooth translucent turquoise, only a few clean drops or a calm puddle.
FIGURE (same body type in all six images): a friendly adult tradesperson, stylized and toy-like. Head about one third of the visible body height, big and softly rounded, small soft body, rounded limbs without knuckle detail on the arms. Face: two large glossy dark eyes with one small white highlight each, two short slightly angled eyebrows, a small rounded nose a shade darker than the skin, small rounded ears, a gentle closed smile; a calm, kind, focused look directed at the work; no teeth, no cheek blush, no freckles. Hair is a simple molded cap shape with a clean hairline. HANDS ARE IMPORTANT: rounded palm, four fingers with three visible segments each, a thumb, tiny nails; exactly five digits per hand; gripping hands wrap fully around the tool handle in a firm fist, supporting hands lie open and relaxed. A hand is about 6-8 % of the image width.
OUTFIT (same in all six): bib overalls in petrol #3F7D88 with two orange buttons on the bib, a small chest pocket with an orange stripe, cargo pockets on the thighs; an off-white long-sleeve shirt with soft rolled-up sleeves; a black wristwatch with a white face on one wrist; a dark tool belt with an orange holster; sturdy dark navy boots with rounded toe caps; dark navy #0F2C3C knee pads with an orange band on the shin.
TOOLS AND PROPS: handles, toolboxes and cases are orange #E8842A with dark navy rims; metal is chrome or steel; machines and housings are matte dark slate, off-white or petrol. Props are few, chunky and simple.
CAMERA: square 1:1, like a 50 mm lens at eye level, half-close: the figure fills the frame from head to about the hips (kneeling figures to the boots). Face, both hands, the tool and the damaged spot all lie inside the middle band of the image, away from the edges. No depth-of-field blur, everything sharp.
MOOD: calm, competent, friendly, with a small wink. Never dramatic: no fire, no flooding, no smoke, no sparks, no danger, no stress.
NEVER: no text, no numbers, no letters, no symbols, no logos, no brand names, no signs, no labels, no engravings anywhere; nothing is written on clothes, tools, devices, boxes or displays. No extra people. No grid or pattern on the wall.

TASK: Character line-up. The six attached images show six tradespeople from this series. Draw one wide square line-up of exactly these six figures standing side by side in a calm neutral pose, front view, full body from boots to hat, on the deep navy stage, each with a soft contact shadow. Keep each figure's skin tone, hair, headwear and outfit as in the attached image: (1) plumber with warm peach skin, short brown hair, orange hard hat; (2) plumber with dark brown skin, short dark hair, orange hard hat; (3) heating technician with light cream skin, white-grey quiff, no hat; (4) locksmith with medium-dark brown skin, short black hair, petrol cap; (5) electrician with light skin, short brown hair, orange hard hat, orange gloves; (6) appliance technician with light skin, dark navy quiff, no hat. All six share the same proportions, face style, overalls and tool belt. Hands relaxed at the sides, each with five fingers. No tools, no props, no text. The turquoise glow is one soft band on the wall behind all six.
```

## Bild 2 – Installateur, Karte (zuerst erzeugen)

Anhang: `design/bilder-3d/bild-2.png` und das Figurenblatt

```
SERIES LOCK (identical in all six images of the series)
WORLD: A calm, precise, premium-service look. Stylized 3D render in the spirit of Fluent 3D emoji and soft Blender toy scenes: chunky rounded forms with generous, slightly quirky curves, like the friendly curves of a modern grotesque typeface. Lacquered soft-gloss plastic with broad gentle highlights and subtle inner shading. Clean, uncluttered, every object simplified to its essential shape. NOT photorealistic, NOT a photo, NOT flat vector, NOT sketchy, NOT noisy, no pores, no fabric weave, no dust.
STAGE: a seamless deep navy studio, base color #001B2A, falling off to nearly black toward the edges, matte, no horizon line. One soft, dimmed turquoise (#3AA8B8) spotlight glow on the wall behind the figure's head and shoulders, covering at most one fifth of the image. At least 60 % of the frame stays dark navy.
LIGHT: large soft key light from the upper left front; gentle flat fill from the right; one narrow turquoise rim light from the right rear that draws a fine bright edge along the figure. Soft contact shadows under every object. No lens flare, no bloom, no sparkles, no glitter, no volumetric fog.
COLOR BUDGET (share of the visible surface): dark navy about 60 %, petrol #3F7D88 (overalls, housings) about 15 %, off-white #F2F7F9 and white (shirt, appliance housings) about 10 %, orange #E8842A (accents only) about 6 %, chrome and steel about 4 %, turquoise (glow, water, displays) at most 5 %. Orange always belongs to a real object (hard hat, tool handle, toolbox, strap, glove, hose, button), never to the lighting. Dark parts use #0F2C3C.
MATERIALS: lacquered plastic for clothes, tools and housings; chrome with 2-3 broad calm highlight bands and no glitter; matte rubber and matte walls; water as smooth translucent turquoise, only a few clean drops or a calm puddle.
FIGURE (same body type in all six images): a friendly adult tradesperson, stylized and toy-like. Head about one third of the visible body height, big and softly rounded, small soft body, rounded limbs without knuckle detail on the arms. Face: two large glossy dark eyes with one small white highlight each, two short slightly angled eyebrows, a small rounded nose a shade darker than the skin, small rounded ears, a gentle closed smile; a calm, kind, focused look directed at the work; no teeth, no cheek blush, no freckles. Hair is a simple molded cap shape with a clean hairline. HANDS ARE IMPORTANT: rounded palm, four fingers with three visible segments each, a thumb, tiny nails; exactly five digits per hand; gripping hands wrap fully around the tool handle in a firm fist, supporting hands lie open and relaxed. A hand is about 6-8 % of the image width.
OUTFIT (same in all six): bib overalls in petrol #3F7D88 with two orange buttons on the bib, a small chest pocket with an orange stripe, cargo pockets on the thighs; an off-white long-sleeve shirt with soft rolled-up sleeves; a black wristwatch with a white face on one wrist; a dark tool belt with an orange holster; sturdy dark navy boots with rounded toe caps; dark navy #0F2C3C knee pads with an orange band on the shin.
TOOLS AND PROPS: handles, toolboxes and cases are orange #E8842A with dark navy rims; metal is chrome or steel; machines and housings are matte dark slate, off-white or petrol. Props are few, chunky and simple.
CAMERA: square 1:1, like a 50 mm lens at eye level, half-close: the figure fills the frame from head to about the hips (kneeling figures to the boots). Face, both hands, the tool and the damaged spot all lie inside the middle band of the image, away from the edges. No depth-of-field blur, everything sharp.
MOOD: calm, competent, friendly, with a small wink. Never dramatic: no fire, no flooding, no smoke, no sparks, no danger, no stress.
NEVER: no text, no numbers, no letters, no symbols, no logos, no brand names, no signs, no labels, no engravings anywhere; nothing is written on clothes, tools, devices, boxes or displays. No extra people. No grid or pattern on the wall.

TASK: Generate image 2 of the series (file name bild-2). The attached images are references only: they fix the style, the figure type, the stage, the light and the composition of this scene. Recreate the scene in the same look, do not copy pixel by pixel. Square 1:1, largest size available.

SCENE 2: A plumber kneels at a tiled wall and tightens a pipe fitting.

FIGURE: dark brown skin (about #5A3418), short dark hair with a clean hairline, orange hard hat (smooth half dome with a short peak). Kneeling on the right knee; the knee pad with its orange shin band faces the viewer. Body turned three-quarters toward the wall on the left, head turned to the fitting, calm focused smile.
HANDS: the right hand (lower hand) grips the long orange handle of a pipe wrench in a firm fist; the wrench's chrome jaws sit on a brass union nut and pull it tight. The left arm is raised: the left hand rests open on the top ledge of the wall, next to a small flashlight with a chrome head lying on the ledge. A black wristwatch on the left wrist.
MAIN SET: a wall of large, soft-cornered dark slate tiles (about #1B2C3A) in a regular grid with narrow joints and a thin top ledge, filling the left half of the image from y 30 % to the bottom. On it a chrome wall mixer with a flat lever handle and a brass fitting with a chrome thread. A thick chrome pipe with rounded elbow runs in from the left edge at about y 55 % and bends downward along the left edge, brass sleeve nuts at its joints, a small orange valve lever at the lower left corner.
WATER: two or three small clean turquoise drops fall from the fitting down the tiles into a grey metal bucket with a turquoise rim and calm turquoise water, standing at the bottom center-left. Nothing else is wet.
PROPS: an open toolbox at the lower right corner, dark navy body with an orange rim, a grey and an orange screwdriver standing in it, cropped by the frame.
LAYOUT: wall and fitting in the left half (x 0-48 %), figure right of center (head at x 62 %, y 25-47 %), wrench diagonal from x 37 %, y 50 % to x 50 %, y 72 %. The brass nut, both hands and the face lie in the middle band. The turquoise glow sits behind the head and shoulders; the right edge fades to dark navy.
NO text or logos on any object.
```

## Bild 3 – Heizung & Klima, Karte

Anhang: `design/bilder-3d/bild-3.png`, das Figurenblatt und das fertige Bild 2

```
SERIES LOCK (identical in all six images of the series)
WORLD: A calm, precise, premium-service look. Stylized 3D render in the spirit of Fluent 3D emoji and soft Blender toy scenes: chunky rounded forms with generous, slightly quirky curves, like the friendly curves of a modern grotesque typeface. Lacquered soft-gloss plastic with broad gentle highlights and subtle inner shading. Clean, uncluttered, every object simplified to its essential shape. NOT photorealistic, NOT a photo, NOT flat vector, NOT sketchy, NOT noisy, no pores, no fabric weave, no dust.
STAGE: a seamless deep navy studio, base color #001B2A, falling off to nearly black toward the edges, matte, no horizon line. One soft, dimmed turquoise (#3AA8B8) spotlight glow on the wall behind the figure's head and shoulders, covering at most one fifth of the image. At least 60 % of the frame stays dark navy.
LIGHT: large soft key light from the upper left front; gentle flat fill from the right; one narrow turquoise rim light from the right rear that draws a fine bright edge along the figure. Soft contact shadows under every object. No lens flare, no bloom, no sparkles, no glitter, no volumetric fog.
COLOR BUDGET (share of the visible surface): dark navy about 60 %, petrol #3F7D88 (overalls, housings) about 15 %, off-white #F2F7F9 and white (shirt, appliance housings) about 10 %, orange #E8842A (accents only) about 6 %, chrome and steel about 4 %, turquoise (glow, water, displays) at most 5 %. Orange always belongs to a real object (hard hat, tool handle, toolbox, strap, glove, hose, button), never to the lighting. Dark parts use #0F2C3C.
MATERIALS: lacquered plastic for clothes, tools and housings; chrome with 2-3 broad calm highlight bands and no glitter; matte rubber and matte walls; water as smooth translucent turquoise, only a few clean drops or a calm puddle.
FIGURE (same body type in all six images): a friendly adult tradesperson, stylized and toy-like. Head about one third of the visible body height, big and softly rounded, small soft body, rounded limbs without knuckle detail on the arms. Face: two large glossy dark eyes with one small white highlight each, two short slightly angled eyebrows, a small rounded nose a shade darker than the skin, small rounded ears, a gentle closed smile; a calm, kind, focused look directed at the work; no teeth, no cheek blush, no freckles. Hair is a simple molded cap shape with a clean hairline. HANDS ARE IMPORTANT: rounded palm, four fingers with three visible segments each, a thumb, tiny nails; exactly five digits per hand; gripping hands wrap fully around the tool handle in a firm fist, supporting hands lie open and relaxed. A hand is about 6-8 % of the image width.
OUTFIT (same in all six): bib overalls in petrol #3F7D88 with two orange buttons on the bib, a small chest pocket with an orange stripe, cargo pockets on the thighs; an off-white long-sleeve shirt with soft rolled-up sleeves; a black wristwatch with a white face on one wrist; a dark tool belt with an orange holster; sturdy dark navy boots with rounded toe caps; dark navy #0F2C3C knee pads with an orange band on the shin.
TOOLS AND PROPS: handles, toolboxes and cases are orange #E8842A with dark navy rims; metal is chrome or steel; machines and housings are matte dark slate, off-white or petrol. Props are few, chunky and simple.
CAMERA: square 1:1, like a 50 mm lens at eye level, half-close: the figure fills the frame from head to about the hips (kneeling figures to the boots). Face, both hands, the tool and the damaged spot all lie inside the middle band of the image, away from the edges. No depth-of-field blur, everything sharp.
MOOD: calm, competent, friendly, with a small wink. Never dramatic: no fire, no flooding, no smoke, no sparks, no danger, no stress.
NEVER: no text, no numbers, no letters, no symbols, no logos, no brand names, no signs, no labels, no engravings anywhere; nothing is written on clothes, tools, devices, boxes or displays. No extra people. No grid or pattern on the wall.

TASK: Generate image 3 of the series (file name bild-3). The attached images are references only: they fix the style, the figure type, the stage, the light and the composition of this scene. Recreate the scene in the same look, do not copy pixel by pixel. Square 1:1, largest size available.

SCENE 3: A heating technician measures a wall-hung gas boiler with a handheld flue-gas analyser.

FIGURE: an older, friendly technician with light cream skin (about #F8EBCF) and thick white-grey hair swept back in a soft quiff, no hard hat. Standing upright, three-quarter view toward the boiler, head slightly lowered, focused kind smile. Eyebrows slightly raised.
HANDS: the right hand (on the left side of the image) holds a slim orange measuring probe at its handle and inserts its tip into a small round test port on the boiler's inner housing. The left hand holds the analyser at chest height: an orange handheld body with a dark navy screen frame, a turquoise display (no numbers), three small round white buttons below it. One dark cable runs in a soft loop from the probe handle down and around to the analyser. A black wristwatch on the left wrist.
MAIN SET: a wall-hung gas boiler with a rounded off-white casing, front panel open so the inside is visible: a petrol housing box with four small screws and a small dark display window, chrome pipes, a dark round pump at the lower left, a short grey flue neck leading up into a white curved flue pipe at the top. Along the lower front edge: a round pressure gauge with a plain white dial, two dark round knobs, a small turquoise display strip; four short dark pipe connections hang under the boiler.
PROPS: two petrol radiator sections lying in the lower left corner, cropped by the frame. An orange holster on the technician's belt, cargo pockets on the thighs.
LAYOUT: boiler left (x 17-40 %, y 20-72 %), figure right (head at x 62 %, y 24-45 %), analyser at x 57 %, y 46-57 %. The test port, probe, analyser and face lie in the middle band. The turquoise glow sits behind the head; the lower left stays dark.
NO numbers on the gauge or display, no labels, no symbols on the boiler.
```

## Bild 4 – Schlüsseldienst, Karte

Anhang: `design/bilder-3d/bild-4.png`, das Figurenblatt und das fertige Bild 2

```
SERIES LOCK (identical in all six images of the series)
WORLD: A calm, precise, premium-service look. Stylized 3D render in the spirit of Fluent 3D emoji and soft Blender toy scenes: chunky rounded forms with generous, slightly quirky curves, like the friendly curves of a modern grotesque typeface. Lacquered soft-gloss plastic with broad gentle highlights and subtle inner shading. Clean, uncluttered, every object simplified to its essential shape. NOT photorealistic, NOT a photo, NOT flat vector, NOT sketchy, NOT noisy, no pores, no fabric weave, no dust.
STAGE: a seamless deep navy studio, base color #001B2A, falling off to nearly black toward the edges, matte, no horizon line. One soft, dimmed turquoise (#3AA8B8) spotlight glow on the wall behind the figure's head and shoulders, covering at most one fifth of the image. At least 60 % of the frame stays dark navy.
LIGHT: large soft key light from the upper left front; gentle flat fill from the right; one narrow turquoise rim light from the right rear that draws a fine bright edge along the figure. Soft contact shadows under every object. No lens flare, no bloom, no sparkles, no glitter, no volumetric fog.
COLOR BUDGET (share of the visible surface): dark navy about 60 %, petrol #3F7D88 (overalls, housings) about 15 %, off-white #F2F7F9 and white (shirt, appliance housings) about 10 %, orange #E8842A (accents only) about 6 %, chrome and steel about 4 %, turquoise (glow, water, displays) at most 5 %. Orange always belongs to a real object (hard hat, tool handle, toolbox, strap, glove, hose, button), never to the lighting. Dark parts use #0F2C3C.
MATERIALS: lacquered plastic for clothes, tools and housings; chrome with 2-3 broad calm highlight bands and no glitter; matte rubber and matte walls; water as smooth translucent turquoise, only a few clean drops or a calm puddle.
FIGURE (same body type in all six images): a friendly adult tradesperson, stylized and toy-like. Head about one third of the visible body height, big and softly rounded, small soft body, rounded limbs without knuckle detail on the arms. Face: two large glossy dark eyes with one small white highlight each, two short slightly angled eyebrows, a small rounded nose a shade darker than the skin, small rounded ears, a gentle closed smile; a calm, kind, focused look directed at the work; no teeth, no cheek blush, no freckles. Hair is a simple molded cap shape with a clean hairline. HANDS ARE IMPORTANT: rounded palm, four fingers with three visible segments each, a thumb, tiny nails; exactly five digits per hand; gripping hands wrap fully around the tool handle in a firm fist, supporting hands lie open and relaxed. A hand is about 6-8 % of the image width.
OUTFIT (same in all six): bib overalls in petrol #3F7D88 with two orange buttons on the bib, a small chest pocket with an orange stripe, cargo pockets on the thighs; an off-white long-sleeve shirt with soft rolled-up sleeves; a black wristwatch with a white face on one wrist; a dark tool belt with an orange holster; sturdy dark navy boots with rounded toe caps; dark navy #0F2C3C knee pads with an orange band on the shin.
TOOLS AND PROPS: handles, toolboxes and cases are orange #E8842A with dark navy rims; metal is chrome or steel; machines and housings are matte dark slate, off-white or petrol. Props are few, chunky and simple.
CAMERA: square 1:1, like a 50 mm lens at eye level, half-close: the figure fills the frame from head to about the hips (kneeling figures to the boots). Face, both hands, the tool and the damaged spot all lie inside the middle band of the image, away from the edges. No depth-of-field blur, everything sharp.
MOOD: calm, competent, friendly, with a small wink. Never dramatic: no fire, no flooding, no smoke, no sparks, no danger, no stress.
NEVER: no text, no numbers, no letters, no symbols, no logos, no brand names, no signs, no labels, no engravings anywhere; nothing is written on clothes, tools, devices, boxes or displays. No extra people. No grid or pattern on the wall.

TASK: Generate image 4 of the series (file name bild-4). The attached images are references only: they fix the style, the figure type, the stage, the light and the composition of this scene. Recreate the scene in the same look, do not copy pixel by pixel. Square 1:1, largest size available.

SCENE 4: A locksmith kneels at an apartment door and opens the lock with fine tools, no damage.

FIGURE: medium-dark brown skin (about #7A4220), short black hair with a clean hairline, a petrol baseball-style cap (smooth dome with a short peak) instead of a hard hat. Kneeling on the left knee (knee pad facing the viewer), body turned three-quarters toward the door on the left, head slightly tilted, calm focused smile.
HANDS: the upper hand holds a slim pick with an orange handle in a firm fist and guides its thin steel tip into the key slot of the lock cylinder. The lower hand lies open and relaxed against the door and steadies a small orange tension wrench whose handle points downward. A black wristwatch on the upper wrist, sleeves rolled up.
MAIN SET: a tall dark navy apartment door with two smooth, softly raised panels, filling the left third of the image from top to bottom in slight perspective. A brushed steel handle plate with a lever handle and a euro profile cylinder with a keyhole at about the figure's chest height (x 31 %, y 47-56 %). A tiny round chrome peephole at the very top.
PROPS: an open flat case at the lower right (x 75-100 %, y 80-100 %), orange with dark navy rims: in the lid a foam inlay holds a small flashlight with a chrome head and two picks with petrol and orange handles; two chrome lock cylinders lie in the lower half.
LAYOUT: door left, figure right of center (head at x 54 %, y 27-49 %). The lock, both hands and the face lie in the middle band. The turquoise glow is a round spotlight on the wall behind the head, clearly visible left to right behind the figure; the top right corner stays almost black.
NO engravings, letters or numbers on the lock, the door or the case.
```

## Bild 5 – Elektro, Karte

Anhang: `design/bilder-3d/bild-5.png`, das Figurenblatt und das fertige Bild 2

```
SERIES LOCK (identical in all six images of the series)
WORLD: A calm, precise, premium-service look. Stylized 3D render in the spirit of Fluent 3D emoji and soft Blender toy scenes: chunky rounded forms with generous, slightly quirky curves, like the friendly curves of a modern grotesque typeface. Lacquered soft-gloss plastic with broad gentle highlights and subtle inner shading. Clean, uncluttered, every object simplified to its essential shape. NOT photorealistic, NOT a photo, NOT flat vector, NOT sketchy, NOT noisy, no pores, no fabric weave, no dust.
STAGE: a seamless deep navy studio, base color #001B2A, falling off to nearly black toward the edges, matte, no horizon line. One soft, dimmed turquoise (#3AA8B8) spotlight glow on the wall behind the figure's head and shoulders, covering at most one fifth of the image. At least 60 % of the frame stays dark navy.
LIGHT: large soft key light from the upper left front; gentle flat fill from the right; one narrow turquoise rim light from the right rear that draws a fine bright edge along the figure. Soft contact shadows under every object. No lens flare, no bloom, no sparkles, no glitter, no volumetric fog.
COLOR BUDGET (share of the visible surface): dark navy about 60 %, petrol #3F7D88 (overalls, housings) about 15 %, off-white #F2F7F9 and white (shirt, appliance housings) about 10 %, orange #E8842A (accents only) about 6 %, chrome and steel about 4 %, turquoise (glow, water, displays) at most 5 %. Orange always belongs to a real object (hard hat, tool handle, toolbox, strap, glove, hose, button), never to the lighting. Dark parts use #0F2C3C.
MATERIALS: lacquered plastic for clothes, tools and housings; chrome with 2-3 broad calm highlight bands and no glitter; matte rubber and matte walls; water as smooth translucent turquoise, only a few clean drops or a calm puddle.
FIGURE (same body type in all six images): a friendly adult tradesperson, stylized and toy-like. Head about one third of the visible body height, big and softly rounded, small soft body, rounded limbs without knuckle detail on the arms. Face: two large glossy dark eyes with one small white highlight each, two short slightly angled eyebrows, a small rounded nose a shade darker than the skin, small rounded ears, a gentle closed smile; a calm, kind, focused look directed at the work; no teeth, no cheek blush, no freckles. Hair is a simple molded cap shape with a clean hairline. HANDS ARE IMPORTANT: rounded palm, four fingers with three visible segments each, a thumb, tiny nails; exactly five digits per hand; gripping hands wrap fully around the tool handle in a firm fist, supporting hands lie open and relaxed. A hand is about 6-8 % of the image width.
OUTFIT (same in all six): bib overalls in petrol #3F7D88 with two orange buttons on the bib, a small chest pocket with an orange stripe, cargo pockets on the thighs; an off-white long-sleeve shirt with soft rolled-up sleeves; a black wristwatch with a white face on one wrist; a dark tool belt with an orange holster; sturdy dark navy boots with rounded toe caps; dark navy #0F2C3C knee pads with an orange band on the shin.
TOOLS AND PROPS: handles, toolboxes and cases are orange #E8842A with dark navy rims; metal is chrome or steel; machines and housings are matte dark slate, off-white or petrol. Props are few, chunky and simple.
CAMERA: square 1:1, like a 50 mm lens at eye level, half-close: the figure fills the frame from head to about the hips (kneeling figures to the boots). Face, both hands, the tool and the damaged spot all lie inside the middle band of the image, away from the edges. No depth-of-field blur, everything sharp.
MOOD: calm, competent, friendly, with a small wink. Never dramatic: no fire, no flooding, no smoke, no sparks, no danger, no stress.
NEVER: no text, no numbers, no letters, no symbols, no logos, no brand names, no signs, no labels, no engravings anywhere; nothing is written on clothes, tools, devices, boxes or displays. No extra people. No grid or pattern on the wall.

TASK: Generate image 5 of the series (file name bild-5). The attached images are references only: they fix the style, the figure type, the stage, the light and the composition of this scene. Recreate the scene in the same look, do not copy pixel by pixel. Square 1:1, largest size available.

SCENE 5: An electrician checks a fuse box with a voltage tester.

FIGURE: light skin (about #EFD5B8), short brown hair with a clean hairline, orange hard hat (smooth half dome with a peak). Standing, three-quarter view toward the cabinet on the left, head slightly lowered, calm focused smile. Both hands wear soft orange insulated gloves with the same finger structure as bare hands.
HANDS: the right hand grips a voltage tester screwdriver with a petrol handle and holds its tip against a terminal screw on one circuit breaker. The left hand rests flat and relaxed on the cabinet door frame. A black wristwatch with a white face on the right wrist under the glove cuff.
MAIN SET: a rounded off-white and light-grey fuse box mounted on a dark wall (x 14-43 %, y 35-87 %), the door swung open to the left, showing a dark grey inner face with a petrol handle. Inside: two neat rows of white circuit breakers with dark rectangular switches and round chrome terminal screws; one switch in the upper row is orange (tripped). Dark and petrol cables run in tidy curves into the top and bottom of each breaker. Top of the box: three small round dark cable glands.
PROPS: an orange cable reel with a petrol cable and a white round socket housing at the lower right (x 84-98 %, y 80-97 %); an orange toolbox with an orange-handled pliers beside it (x 66-90 %, y 87-100 %), partly cropped by the frame.
LAYOUT: cabinet left, figure right of center (head at x 57 %, y 24-45 %), tester at x 40-52 %, y 52-55 %. The tester tip, both hands and the face lie in the middle band. The turquoise glow is behind the head; the right edge fades to dark navy.
NO lightning bolts, warning signs, labels, symbols or numbers anywhere.
```

## Bild 6 – Haushaltsgeräte, Karte

Anhang: `design/bilder-3d/bild-6.png`, das Figurenblatt und das fertige Bild 2

```
SERIES LOCK (identical in all six images of the series)
WORLD: A calm, precise, premium-service look. Stylized 3D render in the spirit of Fluent 3D emoji and soft Blender toy scenes: chunky rounded forms with generous, slightly quirky curves, like the friendly curves of a modern grotesque typeface. Lacquered soft-gloss plastic with broad gentle highlights and subtle inner shading. Clean, uncluttered, every object simplified to its essential shape. NOT photorealistic, NOT a photo, NOT flat vector, NOT sketchy, NOT noisy, no pores, no fabric weave, no dust.
STAGE: a seamless deep navy studio, base color #001B2A, falling off to nearly black toward the edges, matte, no horizon line. One soft, dimmed turquoise (#3AA8B8) spotlight glow on the wall behind the figure's head and shoulders, covering at most one fifth of the image. At least 60 % of the frame stays dark navy.
LIGHT: large soft key light from the upper left front; gentle flat fill from the right; one narrow turquoise rim light from the right rear that draws a fine bright edge along the figure. Soft contact shadows under every object. No lens flare, no bloom, no sparkles, no glitter, no volumetric fog.
COLOR BUDGET (share of the visible surface): dark navy about 60 %, petrol #3F7D88 (overalls, housings) about 15 %, off-white #F2F7F9 and white (shirt, appliance housings) about 10 %, orange #E8842A (accents only) about 6 %, chrome and steel about 4 %, turquoise (glow, water, displays) at most 5 %. Orange always belongs to a real object (hard hat, tool handle, toolbox, strap, glove, hose, button), never to the lighting. Dark parts use #0F2C3C.
MATERIALS: lacquered plastic for clothes, tools and housings; chrome with 2-3 broad calm highlight bands and no glitter; matte rubber and matte walls; water as smooth translucent turquoise, only a few clean drops or a calm puddle.
FIGURE (same body type in all six images): a friendly adult tradesperson, stylized and toy-like. Head about one third of the visible body height, big and softly rounded, small soft body, rounded limbs without knuckle detail on the arms. Face: two large glossy dark eyes with one small white highlight each, two short slightly angled eyebrows, a small rounded nose a shade darker than the skin, small rounded ears, a gentle closed smile; a calm, kind, focused look directed at the work; no teeth, no cheek blush, no freckles. Hair is a simple molded cap shape with a clean hairline. HANDS ARE IMPORTANT: rounded palm, four fingers with three visible segments each, a thumb, tiny nails; exactly five digits per hand; gripping hands wrap fully around the tool handle in a firm fist, supporting hands lie open and relaxed. A hand is about 6-8 % of the image width.
OUTFIT (same in all six): bib overalls in petrol #3F7D88 with two orange buttons on the bib, a small chest pocket with an orange stripe, cargo pockets on the thighs; an off-white long-sleeve shirt with soft rolled-up sleeves; a black wristwatch with a white face on one wrist; a dark tool belt with an orange holster; sturdy dark navy boots with rounded toe caps; dark navy #0F2C3C knee pads with an orange band on the shin.
TOOLS AND PROPS: handles, toolboxes and cases are orange #E8842A with dark navy rims; metal is chrome or steel; machines and housings are matte dark slate, off-white or petrol. Props are few, chunky and simple.
CAMERA: square 1:1, like a 50 mm lens at eye level, half-close: the figure fills the frame from head to about the hips (kneeling figures to the boots). Face, both hands, the tool and the damaged spot all lie inside the middle band of the image, away from the edges. No depth-of-field blur, everything sharp.
MOOD: calm, competent, friendly, with a small wink. Never dramatic: no fire, no flooding, no smoke, no sparks, no danger, no stress.
NEVER: no text, no numbers, no letters, no symbols, no logos, no brand names, no signs, no labels, no engravings anywhere; nothing is written on clothes, tools, devices, boxes or displays. No extra people. No grid or pattern on the wall.

TASK: Generate image 6 of the series (file name bild-6). The attached images are references only: they fix the style, the figure type, the stage, the light and the composition of this scene. Recreate the scene in the same look, do not copy pixel by pixel. Square 1:1, largest size available.

SCENE 6: An appliance technician kneels in front of a washing machine and inspects the lint filter.

FIGURE: light skin (about #F7D7A5), glossy dark navy hair swept up into a quiff, no hard hat. Kneeling on both knees on a flat petrol mat, upright torso, looking at the filter with a focused friendly smile.
HANDS: the right hand holds a cylindrical white drain filter with orange rings and a few clean turquoise soap suds inside, lifted in front of the chest. The left hand holds a slim dark navy flashlight with two orange rings and points it at the machine's open filter hatch. A black wristwatch on the right wrist.
MAIN SET: a front-loading washing machine in matte dark slate with a soft rounded body (x 6-36 %, y 47-90 %): a round porthole with a thick glossy white ring, the door swung open to the left showing a glass window with soft reflections. On top of the front panel: a drawer, a round white knob and a small turquoise display with three tiny round buttons (no marks). At the bottom: a round filter hatch and an orange drain hose with a kink hanging out. A small petrol detergent bottle with an orange cap stands on top of the machine.
ON THE MAT (x 11-47 %, y 88-100 %): a shallow round tray with a white rim and calm turquoise water, an orange-handled pliers and an orange-handled screwdriver lying neatly side by side.
PROPS: an orange toolbox with a dark navy rim behind the figure on the right, cropped by the frame.
LAYOUT: machine left, figure right of center (head at x 55 %, y 25-46 %), filter at x 42-63 %, y 46-52 %. The filter, the flashlight and the face lie in the middle band. The turquoise glow is behind the head; the right edge fades to dark navy.
NO program symbols, labels or numbers on the machine.
```

## Bild 1 – Hero, zuletzt

Anhang: `design/bilder-3d/bild-1.png`, das Figurenblatt und das fertige Bild 2

```
SERIES LOCK (identical in all six images of the series)
WORLD: A calm, precise, premium-service look. Stylized 3D render in the spirit of Fluent 3D emoji and soft Blender toy scenes: chunky rounded forms with generous, slightly quirky curves, like the friendly curves of a modern grotesque typeface. Lacquered soft-gloss plastic with broad gentle highlights and subtle inner shading. Clean, uncluttered, every object simplified to its essential shape. NOT photorealistic, NOT a photo, NOT flat vector, NOT sketchy, NOT noisy, no pores, no fabric weave, no dust.
STAGE: a seamless deep navy studio, base color #001B2A, falling off to nearly black toward the edges, matte, no horizon line. One soft, dimmed turquoise (#3AA8B8) spotlight glow on the wall behind the figure's head and shoulders, covering at most one fifth of the image. At least 60 % of the frame stays dark navy.
LIGHT: large soft key light from the upper left front; gentle flat fill from the right; one narrow turquoise rim light from the right rear that draws a fine bright edge along the figure. Soft contact shadows under every object. No lens flare, no bloom, no sparkles, no glitter, no volumetric fog.
COLOR BUDGET (share of the visible surface): dark navy about 60 %, petrol #3F7D88 (overalls, housings) about 15 %, off-white #F2F7F9 and white (shirt, appliance housings) about 10 %, orange #E8842A (accents only) about 6 %, chrome and steel about 4 %, turquoise (glow, water, displays) at most 5 %. Orange always belongs to a real object (hard hat, tool handle, toolbox, strap, glove, hose, button), never to the lighting. Dark parts use #0F2C3C.
MATERIALS: lacquered plastic for clothes, tools and housings; chrome with 2-3 broad calm highlight bands and no glitter; matte rubber and matte walls; water as smooth translucent turquoise, only a few clean drops or a calm puddle.
FIGURE (same body type in all six images): a friendly adult tradesperson, stylized and toy-like. Head about one third of the visible body height, big and softly rounded, small soft body, rounded limbs without knuckle detail on the arms. Face: two large glossy dark eyes with one small white highlight each, two short slightly angled eyebrows, a small rounded nose a shade darker than the skin, small rounded ears, a gentle closed smile; a calm, kind, focused look directed at the work; no teeth, no cheek blush, no freckles. Hair is a simple molded cap shape with a clean hairline. HANDS ARE IMPORTANT: rounded palm, four fingers with three visible segments each, a thumb, tiny nails; exactly five digits per hand; gripping hands wrap fully around the tool handle in a firm fist, supporting hands lie open and relaxed. A hand is about 6-8 % of the image width.
OUTFIT (same in all six): bib overalls in petrol #3F7D88 with two orange buttons on the bib, a small chest pocket with an orange stripe, cargo pockets on the thighs; an off-white long-sleeve shirt with soft rolled-up sleeves; a black wristwatch with a white face on one wrist; a dark tool belt with an orange holster; sturdy dark navy boots with rounded toe caps; dark navy #0F2C3C knee pads with an orange band on the shin.
TOOLS AND PROPS: handles, toolboxes and cases are orange #E8842A with dark navy rims; metal is chrome or steel; machines and housings are matte dark slate, off-white or petrol. Props are few, chunky and simple.
CAMERA: square 1:1, like a 50 mm lens at eye level, half-close: the figure fills the frame from head to about the hips (kneeling figures to the boots). Face, both hands, the tool and the damaged spot all lie inside the middle band of the image, away from the edges. No depth-of-field blur, everything sharp.
MOOD: calm, competent, friendly, with a small wink. Never dramatic: no fire, no flooding, no smoke, no sparks, no danger, no stress.
NEVER: no text, no numbers, no letters, no symbols, no logos, no brand names, no signs, no labels, no engravings anywhere; nothing is written on clothes, tools, devices, boxes or displays. No extra people. No grid or pattern on the wall.

TASK: Generate image 1 of the series (file name bild-1). The attached images are references only: they fix the style, the figure type, the stage, the light and the composition of this scene. Recreate the scene in the same look, do not copy pixel by pixel. Square 1:1, largest size available.

SCENE 1 (hero image): A plumber leans over a kitchen counter and repairs a leaking tap, with a small smile.

FIGURE: light skin with a warm peach tone (about #F5C9A0), short brown hair visible at the temples under an orange hard hat (smooth half dome with a short peak). Standing, leaning forward over the counter, body turned three-quarters, head tilted down toward the tap, calm friendly smile, eyebrows slightly raised.
HANDS: the right hand (on the right side of the image) grips the chrome gooseneck spout of the tap in a firm fist. The left hand grips the orange handle of a long slim wrench whose chrome head sits on the nut at the base of the tap. A black wristwatch with a white face on the right wrist, sleeves rolled up.
MAIN SET: a tall chrome kitchen tap with a thick cylindrical body and a curved gooseneck spout, set into a stainless-steel sink in a white counter top (x 38-87 %, y 76 %). One clean turquoise water drop falls from the spout into the sink (x 63 %, y 68 %). On the counter beside the tap: a small white cartridge bottle with a chrome cap, a flat orange gasket ring and a small turquoise disc (the sink plug).
THE COUNTER: a long white counter top with a soft rounded front edge across the whole bottom of the image (top edge at y 78 %), below it two dark navy cabinet doors with slim white bar handles.
PROPS: an orange toolbox with a chrome handle at the left edge (x 0-17 %, y 47-78 %), cropped by the frame, tools resting in it.
LAYOUT: figure's head at x 48 %, y 25-45 %, tap and both hands at x 55-70 %, y 52-72 %. The upper quarter of the image is empty dark navy with the soft turquoise glow around and behind the head. The lower 13 % and the lower left quarter stay calm: only the counter and cabinet fronts, nothing bright, nothing important. The right edge fades into dark navy.
NO text or logos on any object.
```

## Prüfliste

- **Serie:** Wirken alle sechs wie aus einer Szene? Gleiche dunkle Bühne, gleiches Licht, gleiche Glanzstärke, gleiche Figurenart, gleiche Kleidung?
- **Dunkel und Türkis:** Mindestens 60 % dunkel? Türkis nur als Glow, Wasser, Anzeige? Sonst: „Make the background much darker, deep navy, keep the turquoise glow small and subtle.“
- **Orange:** Nur an echten Gegenständen, nie als Lichtstreifen? Sonst: „Orange only on real objects, remove the orange light streak.“
- **Hände:** Fünf Finger, Griff am Werkzeug richtig? Sonst: „Fix the hands: exactly five digits each, the gripping hand wraps fully around the handle, the supporting hand lies open and relaxed.“
- **Gesicht:** Gleiche Art in allen Bildern (große Augen mit Glanzpunkt, kleine Nase, geschlossenes Lächeln)? Keine Zähne, keine Wangenröte, keine Sommersprossen.
- **Kein Text:** Keine Buchstaben, Zahlen, Logos, Symbole auf Geräten, Anzeigen, Kleidung; nirgends „fixit247“. Sonst: „Remove all text, numbers, symbols and logos from every object.“
- **Kein Realismus:** Keine Hautporen, Gewebefasern, Staub, Kratzer. Sonst: „More stylized and smoother, like soft lacquered toy plastic.“
- **Nichts Bedrohliches:** Kein Feuer, Rauch, Funken, Wasserflut.
- **Ausschnitt:** Gesicht, Hände, Werkzeug und Schadstelle im mittleren Band? Bild 1: unten und unten links ruhig, oben viel Dunkel?
- **Format:** Jedes Bild im größten quadratischen Format als PNG.

## Wenn ein Bild nicht gelingt

- Anker erneut einfügen (jeder Prompt enthält ihn), das Figurenblatt und Bild 2 anhängen und den Szenen-Prompt noch einmal schicken. Lange Chats verlieren die Regeln.
- Figur passt nicht? Nur Figurenblatt anhängen und „use exactly this figure type“ ergänzen.
- Wenn ein Detail nicht stimmt (Werkzeug, Fitting), genau dieses Detail in einer Nachricht korrigieren lassen, nicht das ganze Bild neu beschreiben.
