# Bildbriefe fixit247

Ein Schlüsselobjekt pro Gewerk, **mitten im Moment der Panne**. Das Objekt ist heil erkennbar, das Problem steckt als Handlung im Bild (Spritzer, Frost, Bruch, Funke, Schaum). Sehr nah, keine Menschen, keine Hände, kein Text im Bild. Der Ton bleibt ruhig, präzise und modern mit einem Augenzwinkern, nie bedrohlich: kein Feuer, kein Wasserschaden.

## Welt der Bilder (die Farben der Seite)

Kein flacher Hintergrund mehr. Jedes Bild spielt in derselben Farbwelt wie die Seite (`src/styles/tokens.css`):

- **Hintergrund:** weicher, nahtloser Verlauf von Tiefsee `#001B2A` (Ecken, Ränder) zu Türkis `#3AA8B8` (leuchtet hinter dem Objekt). Darüber ein kaum sichtbares Haarlinien-Raster, das zu den Rändern ausläuft; es greift das Raster im Hero auf.
- **Licht:** hartes Hauptlicht von links oben, kühles türkises Kantenlicht von rechts hinten. Klarer Schlagschatten nach rechts unten.
- **Akzent:** genau ein kleines Detail pro Bild in Orange `#E8842A`, immer am Problem. Orange kommt sonst nicht vor, so bleibt es der Blickfang.
- **Material:** Chrom und Weiß bleiben neutral, damit der Hintergrund die Farbe trägt.

Bis die Bilder da sind, zeigt die Website an diesen Stellen eine ruhige Fläche in Türkisblau ohne Text. Die Texte unten gehören nicht auf die Website.

Ablage: `public/images/bild-1.webp` bis `bild-6.webp` (plus AVIF). Quelle jeweils 2400 × 2400 px, Motiv mittig mit Luft, damit Handy- und Desktop-Zuschnitt aus derselben Datei kommen.

| Nr. | Wo | Motiv und Moment | Orange Akzent | Ausschnitt |
|---|---|---|---|---|
| 1 | Hero, rechte Fläche (Desktop), Fläche unter den Knöpfen (Handy) | Verchromter Auslauf, ein Tropfen schlägt gerade auf der Fläche auf und bildet eine eingefrorene Wasserkrone | Schmaler warmer Reflex im Chrom | Sehr nah, Auslauf füllt zwei Drittel, rechts angeschnitten; unteres linkes Viertel nur ruhiger Verlauf |
| 2 | Karte Installateur | Verchromtes Rohrknie mit winzigem Leck: feiner Wasserstrahl im Bogen aus der Naht | Orange Gummidichtung an der Verschraubung | Leicht von unten |
| 3 | Karte Heizung & Klima | Weißer Thermostatkopf mit Ziffern auf Chromventil, vereist: Raureif, ein Eiszapfen | Orange Markierung an der Stufe 5 | Sehr nah, Kopf füllt das Bild |
| 4 | Karte Schlüsseldienst | Schlüssel im Profilzylinder, Bart abgebrochen, Bruchkante glänzt, Schlüsselkopf liegt daneben | Orange Gummikappe am Schlüsselkopf | Schräg von vorne, Beschlag angeschnitten |
| 5 | Karte Elektro | Sicherungsautomat auf Hutschiene, Hebel unten, dünner Rauchfaden, kleiner Funke | Der Funke selbst, glühend orange | Frontal und nah, Luft über dem Automaten |
| 6 | Karte Haushaltsgeräte | Bullauge mit Chromring, Tür einen Spalt offen, weißer Schaum quillt als Berg heraus | Eine orange Socke, die aus dem Schaum ragt | Frontal und sehr nah |

Seitenverhältnisse im Layout: Hero-Fläche Desktop füllt die rechte Spalte (mind. 640 px hoch), Karten 4 : 3.
