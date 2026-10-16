# Bilder mit ChatGPT erzeugen – Anleitung und Prompts

Motive, Licht, Farbwelt und Ablage sind in `IMAGE-BRIEFS.md` festgelegt. Diese Datei ist die Übersetzung für ChatGPT: Stilanker, ein fertiger Prompt pro Bild, Prüfliste und was danach mit den Dateien passiert. Bei Widerspruch gilt `IMAGE-BRIEFS.md`.

Die Prompts sind auf Englisch, weil Bildmodelle Englisch am genauesten umsetzen.

## Was an der ersten Serie stört

- **Sie wirkt gerendert, nicht fotografiert.** Überschärft, HDR-Glanz, Spiegelchrom mit Glitzer, Wassertropfen überall. Das ist der typische KI-Look.
- **Zu viel Cyan.** Fast die ganze Fläche leuchtet türkis. Neben dem hellen Kalk der Seite wirken die Bilder wie Fremdkörper, und sie machen dem türkisen Anruf-Knopf Konkurrenz (SPEC 3: er muss das Auffälligste sein).
- **Keine Serie.** Jedes Objekt ist anders groß, anders gedreht und anders beleuchtet. Das Bullauge schwebt ohne Maschine, der Thermostat verschwindet unter Raureif.
- **Orange als Lichteffekt.** Der orange Streifen im Hero ist ein Reflex, kein Teil. Das wirkt aufgesetzt.

## Die neue Richtung: Tiefsee-Studio

Echte Low-Key-Produktfotografie, wie für einen guten Werkzeugkatalog:

- **Raum:** matte Hohlkehle in Tiefsee `#001B2A`. Das Objekt steht auf einer Fläche und wirft einen weichen Kontaktschatten. Kein Schweben mehr.
- **Türkis nur als Lichtkegel** hinter dem Objekt, gedämpft, höchstens ein Fünftel der Fläche. Mindestens zwei Drittel des Bildes sind dunkles Tiefsee. So bleibt der Anruf-Knopf das hellste Türkis der Seite.
- **Licht:** große Softbox von links oben (weich, aber gerichtet), schmales Streiflicht von rechts hinten für eine feine türkise Kante. Schatten nach rechts unten.
- **Material ehrlich:** Chrom mit ruhigen, breiten Lichtkanten statt Glitzer; Weiß bleibt weiß; Gummi und Messing matt.
- **Orange ist ein echtes Teil** am Problem (Dichtung, Kappe, Hebel, Markierung, Socke), nie Licht oder Reflex.
- **Gleiche Kamera für alle sechs:** Dreiviertel-Ansicht leicht von oben (etwa 15°), 90-mm-Makro, f/8. Das Objekt füllt etwa die halbe Bildhöhe.
- **Kein Raster mehr im Bild.** Bei Kartengröße wirkt es wie Rauschen, und Bildmodelle zeichnen es unsauber. Das Raster bleibt Sache der Seite (Hero).

## So gehen Sie vor

1. **Ein einziger ChatGPT-Chat für alle sechs Bilder.** Sonst driften Licht, Chrom und Farbe auseinander.
2. Zuerst den **Stilanker** (unten) einfügen und abschicken. ChatGPT soll nur bestätigen, noch kein Bild erzeugen.
3. Dann **Bild 2** (Installateur) erzeugen, nicht das Hero-Bild. Ein Kartenmotiv ist einfacher und legt Raum, Licht und Maßstab fest. So oft neu erzeugen lassen, bis es passt. Dieses Bild ist ab jetzt die Referenz.
4. Für alle weiteren Bilder den Prompt einfügen **und das Referenzbild als Anhang mitschicken**. Bild 1 (Hero) zuletzt.
5. Jedes Bild im **größten quadratischen Format** als PNG herunterladen.
6. Speichern als `bild-1.png` bis `bild-6.png` in `design/bilder-roh/` (die alten Dateien dort ersetzen). Den Rest erledigt das Projekt (siehe unten).

## Was ChatGPT nicht kann (und was wir danach machen)

- **Größe:** ChatGPT liefert etwa 1024 bis 1536 px. Das Projekt skaliert auf 2400 × 2400 px hoch.
- **Format:** ChatGPT liefert PNG. WebP und AVIF erzeugt das Projekt.
- **Farben:** Tiefsee und Türkis werden nie exakt `#001B2A` und `#3AA8B8` sein. Das Projekt gleicht beim Aufbereiten Hintergrund und Lichtkegel an die Tokens an. Wichtig ist nur: dunkler Raum, gedämpftes Türkis hinter dem Objekt, Orange nur am Problem.

## Wo die Bilder sitzen (gemessen am gebauten Layout)

Alle Bilder kommen aus **einer quadratischen Datei** und werden je nach Bildschirm zugeschnitten. Deshalb muss das Motiv im **mittleren Bereich (etwa 60 % der Fläche)** liegen.

| Bild | Desktop (1440 px) | Handy (390 px) |
|---|---|---|
| 1 Hero | rechte Spalte bis zum Rand, ca. 670 × 750 px, leicht hochkant; Ausschnitt eher rechts (75 % / 50 %) | volle Breite × 300 px, quer (ca. 1,3 : 1) |
| 2–6 Karten | 4 : 3, ca. 365 × 275 px | volle Breite, 16 : 9 |

**Nur Bild 1:** Am Desktop überlappen die Schnellwahl-Kacheln das **untere linke Viertel**. Dort darf nur ruhiges Tiefsee sein.

## Stilanker (zuerst einfügen)

```
I need a consistent series of 6 product photographs for an Austrian emergency-tradesperson referral website. The website itself is calm, precise and modern: off-white pages, deep navy text and sections, one turquoise accent color. The photos must feel like one professional studio shoot for a high-end tool catalogue. Please confirm you understand the rules; do not generate an image yet.

Style rules for every image in this series:
- Real studio product photography, not CGI, not 3D render, not illustration. Medium-format camera, 90 mm macro lens, f/8, ISO 100. Natural micro-detail and true materials. No HDR look, no oversharpening, no glow, no lens flare, no bokeh balls, no sparkles, no floating water droplets in the air.
- Low-key setup on a seamless matte backdrop in deep navy (#001B2A). The backdrop curves smoothly into the floor like an infinity cove, so the object stands on a surface and casts a soft contact shadow. No visible horizon line, no texture, no grid, no vignette banding.
- Behind the object, one soft, wide pool of light on the backdrop in a muted turquoise (#3AA8B8), falling off smoothly into navy toward every edge. The turquoise pool covers at most one fifth of the frame. At least two thirds of the image stay dark navy.
- Lighting: one large softbox from the upper left, soft but clearly directional, so shadows fall to the lower right. One narrow strip light from the back right draws a thin, cool turquoise rim along the object's edges. No other lights.
- Materials: chrome reflects the dark room and the softbox as calm, broad highlights, never as glitter or mirror chaos. White plastic and enamel stay clean neutral white. Rubber, brass and brushed steel stay matte.
- Exactly one orange (#E8842A) element per image, and it is a real physical part attached to the problem (a washer, a cap, a lever, a marking, a sock). Never orange light, glow or reflection. No other warm color anywhere in the image.
- One object per image, always at the same scale: the object fills about half of the frame height and sits in the middle 60% of the square, with calm navy space around it, so the image can be cropped to portrait, 4:3 and 16:9 without cutting the subject.
- Camera: identical for all images. Three-quarter view from slightly above (about 15 degrees), level horizon, no dutch angle, no wide-angle distortion.
- The problem is one small, precise, frozen moment: a thin jet of water, a fine frost, a clean break, a tripped lever with a wisp of smoke, a mound of foam. Calm and witty, never a disaster: no fire, no flooding, no dirt, no mess.
- Strictly no people, no hands, no text, no letters, no logos, no brand names, no watermarks, no frames, no borders. Numbers only where they physically belong to the object.
- Square 1:1, highest available resolution.
```

## Bild 2 – Karte Installateur: Leck an der Verschraubung (zuerst erzeugen)

```
Generate image 2 of the series, following all style rules above. This image sets the reference for the room, light and scale of the whole series.
Subject: a short section of polished chrome water pipe that rises vertically from the navy floor and bends 90 degrees toward the left in a clean elbow, joined by a hexagonal chrome union nut. At the union nut, one thin, clear jet of water sprays sideways in a fine, smooth arc and lands on the floor as a small, flat puddle. A bright orange (#E8842A) rubber sealing ring peeks out of the joint exactly where the leak is.
Framing: the whole elbow and the full arc of the jet are visible, centered in the middle 60% of the frame.
Shadow falls to the lower right.
Square 1:1, highest available resolution.
```

## Bild 3 – Karte Heizung & Klima: vereistes Thermostatventil

```
Generate image 3 of the series. Match the attached reference image exactly: same navy infinity cove, same muted turquoise light pool, same softbox from the upper left, same camera angle and the same object scale.
Subject: a white radiator thermostat head (cylindrical, fine vertical grip ribs, the scale numbers 1 to 5 printed in small grey digits) mounted on a short chrome valve body that stands on the floor. The chrome valve and the lower rim of the head are covered in a fine, even layer of hoar frost, and one short, clear icicle hangs from the valve. The head itself stays clean, so the scale is easy to read. The marking at "5" is orange (#E8842A), the only warm spot. No radiator.
Framing: centered, with navy space on all sides so the object stays complete in a wide 16:9 crop.
Shadow falls to the lower right.
Square 1:1, highest available resolution.
```

## Bild 4 – Karte Schlüsseldienst: abgebrochener Schlüssel

```
Generate image 4 of the series. Match the attached reference image exactly: same navy infinity cove, same muted turquoise light pool, same softbox from the upper left, same camera angle and the same object scale.
Subject: a brushed stainless steel door escutcheon plate standing upright on the floor like a small monolith, with a nickel euro-profile lock cylinder in it. In the cylinder sits the blade of a house key that has snapped off; the bright, clean fracture edge is clearly visible. The broken-off key head with an orange (#E8842A) rubber cap lies flat on the floor in front of the plate, slightly to the left.
Framing: plate and key head together in the middle 60% of the frame.
Shadow falls to the lower right.
Square 1:1, highest available resolution.
```

## Bild 5 – Karte Elektro: ausgelöster Sicherungsautomat

```
Generate image 5 of the series. Match the attached reference image exactly: same navy infinity cove, same muted turquoise light pool, same softbox from the upper left, same camera angle and the same object scale.
Subject: a single white miniature circuit breaker clipped onto a short piece of galvanized DIN rail that stands upright on the floor. The breaker's toggle lever is orange (#E8842A) and sits in the down position (tripped). One thin, crisp wisp of pale grey smoke rises from the top terminal and curls upward. Only generic molded markings on the housing, no text, no brand, no spark, no fire.
Framing: centered, with navy space above the breaker for the smoke.
Shadow falls to the lower right.
Square 1:1, highest available resolution.
```

## Bild 6 – Karte Haushaltsgeräte: Schaum und Socke

```
Generate image 6 of the series. Match the attached reference image exactly: same navy infinity cove, same muted turquoise light pool, same softbox from the upper left, same camera angle and the same object scale.
Subject: the round door of a white front-loading washing machine, close up in three-quarter view: a polished chrome door ring with smoky tinted glass, set in a section of the machine's white enamel front panel. The front panel is cut off by the frame and falls off into dark navy shadow toward the edges (low-key light), so only the door area is lit. The door stands open a small gap, and a soft, bright white mound of soap foam bulges out of the gap and runs a little down the panel. One orange (#E8842A) sock sticks out of the foam.
Framing: the door centered, filling about half of the frame height.
Shadow falls to the lower right.
Square 1:1, highest available resolution.
```

## Bild 1 – Hero: tropfende Armatur (zuletzt erzeugen)

```
Generate image 1 of the series, the hero image. Match the attached reference image exactly: same navy infinity cove, same muted turquoise light pool, same softbox from the upper left, same chrome rendering.
Subject: a modern single-lever kitchen mixer tap in polished chrome, seen from the side. The tall spout arcs in from the right edge of the frame, so the aerator sits at about 60% of the frame width and 35% of its height. One single water drop has just left the aerator and hangs frozen in mid-air; below it, on the navy floor, a small, perfectly round ripple spreads in a thin film of water. The small hot-water indicator on the lever is orange (#E8842A), the only warm spot. No other droplets, no splash crown.
Framing: the tap is cut off by the right edge. Keep the entire lower-left quarter of the image as calm, dark navy only, with nothing in it (interface elements will overlap that area).
Shadow falls to the lower right.
Square 1:1, highest available resolution.
```

## Prüfliste vor dem Speichern

- [ ] Wirkt wie ein Foto, nicht wie ein Rendering (kein Glitzer, keine Lichtblitze, keine schwebenden Tropfen)
- [ ] Mindestens zwei Drittel dunkles Tiefsee, Türkis nur als gedämpfter Lichtkegel hinter dem Objekt
- [ ] Objekt steht auf dem Boden, weicher Kontaktschatten, Schatten nach rechts unten
- [ ] Genau ein oranges Teil, am Problem, kein oranges Licht
- [ ] Gleiche Kamerahöhe und gleicher Maßstab wie das Referenzbild
- [ ] Kein Text, keine Marke, kein Logo, keine Menschen, keine Hände
- [ ] Motiv liegt im mittleren Bereich, rundum Luft
- [ ] Bild 1: unteres linkes Viertel leer
- [ ] Alle sechs nebeneinander wirken wie ein Shooting (am besten als Raster ansehen)

Typische Nachbesserungen, einfach im selben Chat schreiben:
- „This looks like a 3D render. Make it a real studio photograph: less contrast, no sparkle, softer highlights.“
- „Too much turquoise. Keep two thirds of the frame dark navy and only a soft turquoise glow behind the object.“
- „The object is floating. Let it stand on the navy floor with a soft contact shadow.“
- „Match the scale and camera angle of the attached reference image exactly.“
- „Only one orange element, and it must be a physical part, not light.“
- „Remove all text and brand marks.“

## Nach dem Erzeugen (im Projekt)

Wenn die sechs PNGs in `design/bilder-roh/` liegen, führt `node scripts/prepare-images.mjs` aus (Sharp-Pfad siehe Projekt-Gedächtnis):

1. Farben an die Tokens angleichen: Ecken auf Tiefsee `#001B2A`, Lichtkegel auf Türkis `#3AA8B8`. Orange, Weiß und Grau bleiben, Chrom färbt mit.
   Achtung: `HELL` im Skript ist die Helligkeit der Lichtmitte der **alten** Serie (0,58). Die neue Serie ist bewusst dunkler. Vorher an den neuen Rohbildern messen und anpassen, sonst wird der Lichtkegel zu hell oder zu trüb.
2. Auf 2400 × 2400 px hochskalieren (`design/bilder-final/`).
3. WebP und AVIF in 480, 800, 1200 und 2400 px nach `public/images/` schreiben.

`Bildflaeche.tsx` bindet sie bereits ein. Zuschnitte stehen in `Hero.tsx` (`object-position`) und `LeistungKarte.tsx`.

## Optional: Vorschaubild für geteilte Links (Open Graph)

Ob eines kommt, entscheiden Sie. Falls ja, im selben Chat:

```
Generate one extra image in the same style as the attached series (same navy infinity cove, muted turquoise light pool, softbox from the upper left).
Landscape 1200 x 630 pixel proportions (wide). Subject: the chrome kitchen tap with the single falling drop from image 1, placed in the right third of the frame. The left two thirds stay calm, dark navy only (the logo will be added there later). No text.
```
