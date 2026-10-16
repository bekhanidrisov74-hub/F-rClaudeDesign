# Bilder mit ChatGPT erzeugen – Anleitung und Prompts

Motive, Licht, Farbwelt und Ablage sind in `IMAGE-BRIEFS.md` festgelegt. Diese Datei ist nur die Übersetzung für ChatGPT: Stilanker, ein fertiger Prompt pro Bild und was danach mit den Dateien passiert. Bei Widerspruch gilt `IMAGE-BRIEFS.md`.

Die Prompts sind auf Englisch, weil Bildmodelle Englisch am genauesten umsetzen.

## So gehen Sie vor

1. **Ein einziger ChatGPT-Chat für alle sechs Bilder.** Sonst driften Licht, Chrom und Farbe auseinander.
2. Zuerst den **Stilanker** (unten) einfügen und abschicken. ChatGPT soll nur bestätigen, noch kein Bild erzeugen.
3. Dann **Bild 1** erzeugen. So oft neu erzeugen lassen, bis es passt. Dieses Bild ist ab jetzt die Referenz.
4. Für Bild 2 bis 6 jeweils den Prompt einfügen **und Bild 1 als Anhang mitschicken**.
5. Jedes Bild im **größten quadratischen Format** als PNG herunterladen.
6. Speichern als `bild-1.png` bis `bild-6.png` in `design/bilder-roh/` (die alten Dateien dort ersetzen). Den Rest erledigt das Projekt mit `node scripts/prepare-images.mjs`.

## Was ChatGPT nicht kann (und was wir danach machen)

- **Größe:** ChatGPT liefert etwa 1024 bis 1536 px. Das Projekt skaliert auf 2400 × 2400 px hoch.
- **Format:** ChatGPT liefert PNG. WebP und AVIF erzeugt das Projekt.
- **Farben:** Navy und Türkis werden nie exakt `#001B2A` und `#3AA8B8` sein. Das Projekt gleicht beim Aufbereiten Hintergrund und Lichtmitte an die Tokens an. Wichtig ist nur, dass der Hintergrund ein Verlauf von dunklem Blau zu Cyan ist und das einzige Orange am Problem sitzt.

## Wo die Bilder sitzen (gemessen am gebauten Layout)

Alle Bilder kommen aus **einer quadratischen Datei** und werden je nach Bildschirm zugeschnitten. Deshalb muss das Motiv im **mittleren Bereich (etwa 60 % der Fläche)** liegen.

| Bild | Desktop (1440 px) | Handy (390 px) |
|---|---|---|
| 1 Hero | rechte Spalte bis zum Rand, ca. 670 × 750 px, leicht hochkant | volle Breite × 300 px, quer (ca. 1,3 : 1) |
| 2–6 Karten | 4 : 3, ca. 365 × 275 px | volle Breite × 200 px, breit (ca. 1,8 : 1) |

**Nur Bild 1:** Am Desktop überlappen die Schnellwahl-Kacheln das **untere linke Viertel**. Dort darf nur ruhiger Verlauf sein.

## Stilanker (zuerst einfügen)

```
I need a consistent series of 6 hero-quality images for a modern Austrian emergency tradesperson referral website. Please confirm you understand the style rules; do not generate an image yet.

Style rules for every image in this series:
- Photorealistic macro still life, one single key object per image, shot very close, frozen at the exact moment something goes wrong with it (a splash, frost, a break, a spark, foam). Witty but precise, like a high-end editorial or tech-brand campaign still. Never a catalogue shot.
- Background: a smooth, seamless color-graded gradient. Deep navy (#001B2A) in the corners and along the edges, glowing into rich turquoise (#3AA8B8) right behind the object, like a soft radial glow. On top, an extremely subtle 1px hairline square grid in light turquoise at very low opacity, fading out toward the edges. No floor line, no horizon, no texture, no noise, no vignette banding.
- Light: one hard key light from the upper left, like direct sun, with a crisp cast shadow falling to the lower right onto the background. A cool turquoise rim light from the back right defines the edges. No soft box look.
- Color accent: exactly one small detail per image in vivid orange (#E8842A), always attached to the problem itself. No other orange anywhere. Everything else stays in navy, turquoise, chrome silver and neutral white.
- Chrome and metal rendered clean and realistic with sharp specular highlights; white plastic stays neutral white.
- Lens: 100 mm macro look, moderate depth of field, the key object fully sharp.
- Composition: square 1:1. The object sits in the central 60% of the frame with generous space around it, so the image can be cropped to portrait, 4:3 and wide formats without cutting the subject.
- Strictly no people, no hands, no text, no numbers other than those that physically belong to the object, no logos, no brand names, no watermarks, no frames or borders.
- Mood: calm, precise, modern, with a wink. The problem is one clean frozen effect on the object itself, never a disaster: no fire, no flooding, no dirt, no clutter. Water, ice, foam, smoke and sparks stay crisp and photoreal.
```

## Bild 1 – Hero: Armatur mit Wasserkrone

```
Generate image 1 of the series, following all style rules above.
Subject: a polished chrome faucet spout seen very close from the side. A single water droplet has just hit the surface below the spout and forms a perfect frozen crown splash with tiny flying droplets, like a high-speed photograph. A narrow warm orange (#E8842A) reflection streak runs along the chrome.
Framing: the spout enters from the right edge and fills about two thirds of the frame width, cut off by the right edge. The splash sits slightly right of center.
Keep the entire lower-left quarter of the image as calm gradient only, no objects, no grid lines there (UI elements will overlap it).
Hard light from the upper left, sharp cast shadow of the spout falling to the lower right.
Square 1:1, largest available resolution.
```

## Bild 2 – Karte Installateur: Rohrleck

```
Generate image 2 of the series. Match the style of the attached image exactly (same navy-to-turquoise gradient and hairline grid, same hard light from the upper left, same chrome rendering, same shadow angle).
Subject: a chrome pipe elbow with a tiny leak at its threaded joint: one fine, sparkling jet of water shoots out in a clean arc, frozen mid-air. A bright orange (#E8842A) rubber sealing washer is visible at the joint. Seen slightly from below.
Framing: elbow and the whole arc of the jet visible and centered, occupying the central 60% of the frame.
Cast shadow of the pipe falling to the lower right.
Square 1:1, largest available resolution.
```

## Bild 3 – Karte Heizung & Klima: vereister Thermostat

```
Generate image 3 of the series. Match the style of the attached image exactly (same navy-to-turquoise gradient and hairline grid, same hard light from the upper left, same chrome rendering, same shadow angle).
Subject: a white radiator thermostat head with the printed scale numbers 1 to 5 (and the small dots between them), mounted on a short chrome valve body, covered in fine hoar frost with a small icicle hanging from the valve. The marking at step 5 is vivid orange (#E8842A), the only warm spot. No radiator visible.
Framing: very close, the thermostat head dominates the central area, but keep space around it so it stays fully visible when cropped to a wide 16:9 format.
Cast shadow falling to the lower right.
Square 1:1, largest available resolution.
```

## Bild 4 – Karte Schlüsseldienst: abgebrochener Schlüssel

```
Generate image 4 of the series. Match the style of the attached image exactly (same navy-to-turquoise gradient and hairline grid, same hard light from the upper left, same chrome rendering, same shadow angle).
Subject: a nickel-colored house key that has snapped off inside a euro profile lock cylinder: the blade is broken, the shiny fracture edge is clearly visible, and the broken-off key head with a vivid orange (#E8842A) rubber cap lies beside the lock. A section of a brushed stainless door escutcheon (plate) is visible and cut off by the frame edge; the door itself dissolves into the gradient background.
Framing: seen from slightly diagonal front, cylinder and broken key in the central 60% of the frame.
Cast shadow falling to the lower right.
Square 1:1, largest available resolution.
```

## Bild 5 – Karte Elektro: Sicherung mit Funke

```
Generate image 5 of the series. Match the style of the attached image exactly (same navy-to-turquoise gradient and hairline grid, same hard light from the upper left, same shadow angle).
Subject: a single white miniature circuit breaker clipped onto a short piece of metal DIN rail, toggle lever in the down (tripped) position. A thin, crisp wisp of smoke rises from the top and one small glowing orange (#E8842A) spark flashes at the contact. No brand name, no labels; only generic molded markings are allowed.
Framing: straight frontal and close, breaker centered in the central 60% of the frame, room above it for the smoke.
Cast shadow falling to the lower right.
Square 1:1, largest available resolution.
```

## Bild 6 – Karte Haushaltsgeräte: Schaum und Socke

```
Generate image 6 of the series. Match the style of the attached image exactly (same navy-to-turquoise gradient and hairline grid, same hard light from the upper left, same chrome rendering, same shadow angle).
Subject: the round front door (porthole) of a washing machine with a chrome ring and tinted glass, the door standing open a small gap, with a mound of white soap foam bulging out of the gap and one orange (#E8842A) sock sticking out of the foam. The machine body is not visible; the gradient background replaces it.
Framing: frontal and very close, the porthole centered and filling the central 60% of the frame.
Cast shadow falling to the lower right.
Square 1:1, largest available resolution.
```

## Prüfliste vor dem Speichern

- [ ] Hintergrund: Navy am Rand, Türkis-Leuchten hinter dem Objekt, Raster kaum sichtbar, bei allen sechs gleich
- [ ] Licht von links oben, Schatten nach rechts unten, bei allen sechs gleich
- [ ] Genau ein orangenes Detail, am Problem
- [ ] Der Effekt (Spritzer, Frost, Bruch, Funke, Schaum) ist klar zu erkennen, aber nie bedrohlich
- [ ] Kein Text, keine Marke, kein Logo, keine Menschen, keine Hände
- [ ] Motiv liegt im mittleren Bereich, rundum Luft
- [ ] Bild 1: unteres linkes Viertel ruhig
- [ ] Alle sechs wirken nebeneinander wie eine Serie (am besten als Raster ansehen)

Typische Nachbesserungen, einfach im selben Chat schreiben:
- „The background is too bright. Make the edges deeper navy and keep the turquoise glow only behind the object.“
- „The grid is too strong. Make it almost invisible.“
- „Remove all text and brand marks.“
- „Only one orange detail, remove all other orange.“
- „The shadow must fall to the lower right, light from the upper left.“

## Nach dem Erzeugen (im Projekt)

Wenn die sechs PNGs in `design/bilder-roh/` liegen, führt `node scripts/prepare-images.mjs` aus:

1. Farben an die Tokens angleichen: Ecken auf Tiefsee `#001B2A`, Lichtmitte auf Türkis `#3AA8B8`. Orange, Weiß und Grau bleiben, Chrom und Wasser färben mit.
2. Auf 2400 × 2400 px hochskalieren (`design/bilder-final/`).
3. WebP und AVIF in 480, 800, 1200 und 2400 px nach `public/images/` schreiben.

`Bildflaeche.tsx` bindet sie bereits ein.

## Optional: Vorschaubild für geteilte Links (Open Graph)

Die Spezifikation verlangt Open-Graph-Angaben, ein Vorschaubild gibt es noch nicht. Ob eines kommt, entscheiden Sie. Falls ja, im selben Chat:

```
Generate one extra image in the same style as the attached series (same navy-to-turquoise gradient, hairline grid and hard light from the upper left).
Landscape 1200 x 630 pixel proportions (wide). Subject: the chrome faucet with the splashing droplet from image 1, placed in the right third of the frame. The left two thirds stay calm gradient only (the logo will be added there later). No text.
```
