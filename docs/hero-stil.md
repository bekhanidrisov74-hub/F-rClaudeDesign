# Ganze Seite im Stil des Hero (19.10.2026, Raster und Rhythmus 20.10.2026)

Auftrag von Beks am 19.10.2026: Jeder Abschnitt und jedes Fenster der Website sieht aus wie der Hero
(Entwurf „Hero – Desktop 1586“: Kopf, Hero und die vier Vorteile). Stil, Look und Schrift wie dort.
**Texte und Fotos bleiben unverändert**; Icons und Grafiken durften ersetzt werden.

Der Hero selbst (`styles/hero.css`, `--fx-hd-*`) ist bis 1586 px unverändert, bis auf eine Handy-Regel: Unter 560 px fällt
der feste Umbruch im Hinweiskasten weg, damit „uns“ nicht allein in einer Zeile steht. Alles andere nutzt die Basis-Tokens in
`src/styles/tokens.css`, deren Werte jetzt die des Hero sind. Die Namen der Tokens sind geblieben.

Seit 20.10.2026 (Branch `design/raster-rhythmus`, Freigabe 19.10.2026) gilt ein gemeinsames Raster für die ganze Seite (Zeile „Raster“ unten) und
ein Flächenplan mit Eis- und Tiefsee-Bändern (Tabelle „Abschnitte“). Für Raster, Breiten, Anordnung, Flächen und Schriftgrößen
ist dieses Dokument maßgeblich, nicht design/screens. Inhalte und Verhalten kommen weiter aus design/.
Der Plan dazu: `docs/plans/2026-10-19-optik-raster.md`.

**Hero über 1586 px:** Kopfinhalt, Text, Knöpfe, Hinweiskasten und Vorteile stehen im zentrierten Rahmen; Foto und Raster-Muster
reichen weiter bis an den Fensterrand. Das Foto behält seine linke Kante im Rahmen (Überlappung mit dem Text wie im Entwurf) und
wächst nach rechts, höchstens auf das 1,25-Fache (`--fx-hd-foto-zoom`, es gibt es nur in 1006 × 724 px). Es wird von oben links
aus vergrößert, die Turmspitze bleibt im Bild; unten blendet es so weit aus, wie Vordergrund wegfällt. Reicht die 1,25-fache
Breite nicht bis zum Rand (ab ca. 2090 px), läuft es rechts weich in die Kalk-Fläche aus. Das Raster-Muster beginnt am
Fensterrand und blendet hinter dem Text und nach unten aus. Alle Übergänge wachsen stufenlos ab 1586 px. Die Titel der Vorteile
sind h2 (vorher h3 direkt nach der h1), die Optik ist gleich.

## Grundlagen

| Thema | Wert |
|---|---|
| Schrift | Inter (Variable, lokal über `@fontsource-variable/inter`) für alles. Bricolage und Atkinson sind entfernt. |
| Überschriften | Gewicht 750, eng gesetzt wie die H1 (H2 −0,045 em, H3 −0,025 em, H4 −0,02 em). Abschnittstitel 34 bis 60 px, Rechtsseiten-H1 (`--fx-h1`) 44 bis 62 px. |
| Fließtext | Inter 400, Zweittext in Schiefer. Unterzeilen der Abschnitte wie die Unterzeile im Hero (bis 20,2 px). Fließtext 16 bis 18 px, Kartentext 16, ab 920 px 17 px, Kleintext 15 px (`--fx-small`, nichts darunter). Alle Größen wachsen fließend von 390 bis 1534 px und bleiben darüber stehen. |
| Raster | Kopf, alle Abschnitte, der Fuß, das Menü und die Rechtsseiten stehen auf den Kanten des Hero (`--fx-kante-l` / `--fx-kante-r`, Utility `wrapper`). Unter 1280 px sind beide 16 px (wie der Hero am Handy). Ab 1280 px sind es 100 / 80 Entwurfs-px (`--fx-hd-px` = min(1 px, Fensterbreite / 1534), die Kanten schrumpfen also zwischen 1280 und 1534 px mit); bei 1440 px ergibt das eine Inhaltsbreite von 1271 px. Der Rahmen (`--fx-rahmen`) ist 1586 px breit und wird darüber zentriert (Inhaltsbreite dann 1406 px); Kopfleiste, Flächen und Linien laufen voll breit. Logo im Kopf und Vorteil-Kreise hängen wie im Entwurf 7 bis 8 px vor der Kante, die H1 4 px dahinter. |
| Fokus | 3 px, Abstand 3 px. Auf hellen Flächen Tiefsee (wie in Kopf und Hero); auf den Tiefsee-Flächen (So funktioniert's, Fuß) Türkis über die Utility `dunkel`. |
| Radien | Anruf-Knöpfe, Kreise und Luna-Knopf als Pille; Zweitknöpfe 16; Karten und Hinweiskästen 20; Kacheln 18; Felder und Chips 12. |
| Schatten | weich wie unter den Knöpfen des Hero: Zweitknöpfe `--fx-shadow-knopf`, Anruf-Knöpfe `--fx-shadow-anruf`, Karten `--fx-shadow-karte`. Auf Eis tragen auch die Fragen-Karten den Kartenschatten, die Haarlinie allein ist dort kaum zu sehen. |

### Farben

| Token | Wert | Rolle |
|---|---|---|
| `--fx-tiefsee` | #03101F | Text, Icons, Primärknöpfe, gewählte Chips, Fokus auf hellen Flächen; Fläche von So funktioniert's und Fuß |
| `--fx-tiefsee-2` | #13263A | Hover der Primärknöpfe, Trennlinie im Fuß |
| `--fx-tuerkis` | #22B5C0 | Anruf-Knöpfe (und Luna-Stern, Linien-Akzente, Fokus auf Tiefsee) |
| `--fx-orange` | #EC5315 | Akzent wie „Rund um die Uhr.“: große Ziffern in So funktioniert's (auf Tiefsee 5,3:1), „247“ im Logo |
| `--fx-kalk` | #FBFCFD | Seitenfläche (wie der Hero), Fläche von Leistungen, Preisrechner und Anfrage |
| `--fx-weiss` | #FFFFFF | Karten, Felder; Schrift auf Tiefsee |
| `--fx-eis` | #E8F4F8 | Fläche von Was ist passiert?, Zusagen und Fragen; Hinweiskästen wie im Hero, Luna-Sprechblasen, Tipps |
| `--fx-lagune` | #BEF0F6 | Kreise hinter Icons wie bei den Vorteilen; Wortmarke im Fuß |
| `--fx-nacht` / `--fx-tuerkis-hell` | #021022 / #8FE6EC | Kreis und Hörer im Anruf-Knopf, dunkle Icon-Kreise |
| `--fx-schiefer` | #5C606C | Zweittext auf hellen Flächen |
| `--fx-nebel` | #B5BFCC | Zweittext auf Tiefsee (10,3:1), Globus-Linien im Fuß |
| `--fx-rand` | #7C8494 | Rand von Feldern, Chips, Zweitknöpfen |
| `--fx-linie` | #E8ECF0 | Trennlinien, Kartenränder |
| `--fx-linie-dunkel` | Mischung aus Nebel und Tiefsee | Grundlinie der Schritte in So funktioniert's (gut 2:1, die türkise Laufline braucht eine Spur) |

Es gibt kein `--fx-kalk-2` mehr: Als Abschnittsfläche war es gegen Kalk 1,04:1 und damit nicht zu unterscheiden. Neue Tokens
tragen immer einen neuen Namen (`--fx-hd-rand` ist eine Farbe, keine Länge).

Kontraste (WCAG 2.2 AA): Tiefsee auf Türkis 7,7:1, Tiefsee auf Kalk 18,6:1, Schiefer auf Weiß 6,3:1 und auf Eis 5,6:1,
Rand auf Weiß 3,8:1 und auf Eis 3,4:1, Orange auf Kalk 3,5:1 (nur große, dekorative Ziffern). Auf Tiefsee: Weiß 19:1,
Nebel 10,3:1, Orange 5,3:1, Türkis 7,7:1.
Weiß auf Türkis (2,4:1) wird nirgends verwendet, auch nicht im großen Anruf-Knopf (Entscheidung 19.10.2026).

## Bausteine

- **Anruf-Knopf** (`ui/CallButton`) überall wie „Jetzt anrufen“: Türkis, Tiefsee-Schrift, Nacht-Kreis mit hellem Hörer.
  Der Umbau „Raster und Rhythmus“ hat keine neuen Anruf-Knöpfe ergänzt (Freigabe 19.10.2026).
- **Zweitknopf** (`ui/Button`, `hell`) wie „Anfrage senden“: weiß, 1,5-px-Rand, Radius 16, weicher Schatten. „… anfragen“
  trägt dasselbe Sprechblasen-Icon.
- **Primärknopf** (`primaer`): Tiefsee-Fläche, weiße Schrift. Die frühere Art `dunkel` ist entfallen.
- **Icons**: flache SVGs in `design/icons` (`gewerk-*`, `ui-*`, `telefon`, `vorteil-*`), immer in Tiefsee bzw. `currentColor`.
  Im Lagune-Kreis (`ui/IconKreis`) wie die Vorteile; mit `dunkel` im Nacht-Kreis (Luna, Erfolg), mit `weiss` im
  weißen Kreis auf Eis-Flächen (Hinweise im Preisrechner).
- **Hinweiskasten** wie unter den Knöpfen im Hero: Eis-Fläche, Radius 20, ohne Rand.
- **Karte**: weiß, Haarlinie, Radius 20, weicher Schatten.

## Abschnitte

Reihenfolge und Fläche: Kopf (Kalk-Kopf `#F7FBFE`) · Hero und Vorteile Kalk · Was ist passiert? Eis · Leistungen Kalk ·
So funktioniert's Tiefsee · Preisrechner Kalk · Zusagen Eis · Anfrage Kalk · Fragen Eis · Fuß Tiefsee.
Ein e2e-Test (`abschnitte.spec.ts`, „Flächenplan“) prüft die Farben, einer („Gemeinsames Raster“) die Kanten von 390 bis 2560 px.

| Abschnitt | Fläche | Umsetzung |
|---|---|---|
| Kopf | Kalk-Kopf | Leiste voll breit, Inhalt im Rahmen; „Anrufen“ endet ab 1280 px an der rechten Inhaltskante der Abschnitte (±2 px); ab 1280 px Navigation, darunter Menü-Knopf |
| Hero, Vorteile | Kalk | wie im Entwurf; über 1586 px siehe oben; Handy quer (unter 1280 px, Höhe unter 500 px): Überschrift zweizeilig, weniger Luft, beide Knöpfe nebeneinander, damit „Jetzt anrufen“ auf dem ersten Bildschirm steht; unter 360 px weniger Luft in „Jetzt anrufen“ und im Anrufen-Knopf des Kopfs |
| Was ist passiert? | Eis | H2 in Abschnittsgröße; weiße Kacheln mit Haarlinie und Schatten, Gewerk-Icon im Lagune-Kreis; 2 Spalten unter 640 px, 3 bis 1279 px, ab 1280 px alle sechs in einer Reihe; Unterzeilen ab 920 px, zwei Zeilen hoch; Luna-Kachel als Umriss-Kachel (Rand, transparent) |
| Leistungen | Kalk | weiße Karten mit Bild im Raster (zwei Spalten ab 704, drei ab 1068 px Inhaltsbreite), Preis in Inter 800; unter 736 px Fenster eine Wischreihe (Karte 84 %, die nächste schaut heraus, rastet auf der Textlinie ein, Bild 4:3); Hilfekarte als Hinweiskasten (Eis) darunter, Inhalt mittig |
| So funktioniert's | Tiefsee | H2 und Titel weiß, drei Schritte ab 920 px nebeneinander; große Ziffern in Orange (bis 96 px), Text Nebel; Grundlinie `--fx-linie-dunkel` mit türkiser Laufline |
| Preisrechner | Kalk | Rechner als weiße Karte, Ergebnis als Hinweiskasten (Eis); zweispaltig ab 1120 px (Ergebnis 420 px, ab 1280 px 440 px), darunter untereinander |
| Zusagen | Eis | Kopf linksbündig; ein Raster mit drei Spalten ab 920 px: [0 breit][1] / [2][3][4] / [5][6 breit]; alle Karten weiß mit Schatten, Icon im Lagune-Kreis; breite Karten mit Icon links und Text als Lead; unter 920 px eine gruppierte Liste auf einer weißen Fläche (Haarlinien statt einzelner Karten), Icon neben dem Titel |
| Anfrage | Kalk | Formular als weiße Karte; Seitenkasten als Hinweiskasten (Eis) mit Headset wie im Hero, ab 920 px rechts daneben (320 px, ab 1280 px 380 px), so hoch wie sein Inhalt |
| Häufige Fragen | Eis | weiße Karten mit Haarlinie und Schatten, Pfeil im Lagune-Kreis (offen: Tiefsee); ab 920 px links Titel und Lead, solange rechts die Liste läuft (sticky) |
| Fuß | Tiefsee | Logo „Fixit“ weiß, „247“ Orange, Zeile Nebel; Spaltentitel weiß über türkiser Linie, Links Nebel, beim Überfahren weiß; Kontakt-Icons im Lagune-Kreis; Globus in Nebel-Linien; Trennlinie Tiefsee-2; unten die große Wortmarke, die von Lagune in die Fläche ausläuft und so breit ist wie der Inhalt |

## Fenster

- **Preisübersicht** (Dialog und Sheet): weiß, Gewerke im Lagune-Kreis, Schließen im Lagune-Kreis, Anruf-Knopf wie oben,
  Spaltenköpfe der Tabelle 15 px.
- **Menü** (unter 1280 px): Vollfläche unter dem Kopf auf den Kanten des Kopfs. Unter 640 px einspaltig, ab 640 px zweispaltig:
  links die großen Links in Inter 750, rechts die Kontaktkarte als Hinweiskasten und die Rechtslinks.
- **Luna**: Knopf und Signet im Nacht-Kreis (der Knopf mit weißem Ring für dunkle Fotos dahinter), Luna-Blasen in Eis, eigene
  Blasen in Tiefsee, runde Eingabe, Senden im Tiefsee-Kreis; Karten weiß, Tipps in Eis, Erfolg im Nacht-Kreis.
  Knopf, Anstupser und Fenster halten ab 640 px 28 px Abstand zum rechten Rand, ab 1586 px zur rechten Rahmenkante
  (`--fx-schwebe-r`).
- **Rechtsseiten**: Titel (h1) in der Größe von `--fx-h1` auf Kalk, Kanten im Rahmen, Text höchstens 40 em breit.

## Entfernt

- 3D-Renders als Icons (`public/icons`, `Symbol3D`, `GewerkIcon`); die Quellen bleiben in `design/icons-3d`.
- Kalk-2 als Abschnittsfläche, `--fx-container`, `--fx-hero-max`.
- Dunkle Flächen in Zusagen, Hilfekarte, Rechner-Ergebnis, Seitenkasten und Menü. Dunkel sind wieder So funktioniert's und der
  Fuß, als Tiefsee-Bänder (Freigabe 19.10.2026), mit weißer Schrift, Nebel als Zweittext und türkisem Fokus.
- Wirbel-Shader in den Zusagen (`@paper-design/shaders-react`), Lichtstrahl und Maus-Schein im Fuß, Lichtkanten der
  dunklen Karten, Leuchten in So funktioniert's.

Geblieben sind die ruhigen Bewegungen: Glanzlicht über den Bildern der Leistungen, Einblenden der Zusagen-Karten,
Linie über den Schritten, Haarlinien unter den Spaltentiteln im Fuß, aufsteigende Wortmarke, drehender Globus.
