# Ganze Seite im Stil des Hero (19.10.2026)

Auftrag von Beks am 19.10.2026: Jeder Abschnitt und jedes Fenster der Website sieht aus wie der Hero
(Entwurf „Hero – Desktop 1586“: Kopf, Hero und die vier Vorteile). Stil, Look und Schrift wie dort.
**Texte und Fotos bleiben unverändert**; Icons und Grafiken durften ersetzt werden.

Der Hero selbst (`styles/hero.css`, `--fx-hd-*`) ist unverändert, bis auf eine Handy-Regel: Unter 560 px fällt der feste
Umbruch im Hinweiskasten weg, damit „uns“ nicht allein in einer Zeile steht. Alles andere nutzt die Basis-Tokens in
`src/styles/tokens.css`, deren Werte jetzt die des Hero sind. Die Namen der Tokens sind geblieben.

## Grundlagen

| Thema | Wert |
|---|---|
| Schrift | Inter (Variable, lokal über `@fontsource-variable/inter`) für alles. Bricolage und Atkinson sind entfernt. |
| Überschriften | Gewicht 750, eng gesetzt wie die H1 (H2 −0,045 em, H3 −0,025 em, H4 −0,02 em). Abschnittstitel bis 54 px. |
| Fließtext | Inter 400, Zweittext in Schiefer. Unterzeilen der Abschnitte wie die Unterzeile im Hero (bis 20,2 px). |
| Fokus | überall 3 px Tiefsee, 3 px Abstand (wie in Kopf und Hero). |
| Radien | Anruf-Knöpfe, Kreise und Luna-Knopf als Pille; Zweitknöpfe 16; Karten und Hinweiskästen 20; Kacheln 18; Felder und Chips 12. |
| Schatten | weich wie unter den Knöpfen des Hero: Zweitknöpfe `--fx-shadow-knopf`, Anruf-Knöpfe `--fx-shadow-anruf`, Karten `--fx-shadow-karte`. |

### Farben

| Token | Wert | Rolle |
|---|---|---|
| `--fx-tiefsee` | #03101F | Text, Icons, Primärknöpfe, gewählte Chips, Fokus |
| `--fx-tuerkis` | #22B5C0 | nur Anruf-Knöpfe (und Luna-Stern, Linien-Akzente) |
| `--fx-orange` | #EC5315 | Akzent wie „Rund um die Uhr.“: nur große Ziffern in So funktioniert's |
| `--fx-kalk` | #FBFCFD | Seitenfläche (wie der Hero) |
| `--fx-kalk-2` | #F4F8FB | zweite Abschnittsfläche, Abschnitte wechseln Kalk / Kalk-2 |
| `--fx-weiss` | #FFFFFF | Karten, Felder |
| `--fx-eis` | #E8F4F8 | Hinweiskästen wie im Hero, Luna-Sprechblasen, Tipps |
| `--fx-lagune` | #BEF0F6 | Kreise hinter Icons wie bei den Vorteilen |
| `--fx-nacht` / `--fx-tuerkis-hell` | #021022 / #8FE6EC | Kreis und Hörer im Anruf-Knopf, dunkle Icon-Kreise |
| `--fx-schiefer` | #5C606C | Zweittext |
| `--fx-rand` | #7C8494 | Rand von Feldern, Chips, Zweitknöpfen |
| `--fx-linie` | #E8ECF0 | Trennlinien, Kartenränder |

Kontraste (WCAG 2.2 AA): Tiefsee auf Türkis 7,7:1, Tiefsee auf Kalk 18,6:1, Schiefer auf Weiß 6,3:1 und auf Eis 5,6:1,
Rand auf Weiß 3,8:1 und auf Eis 3,4:1, Orange auf Kalk 3,5:1 (nur große, dekorative Ziffern).
Weiß auf Türkis (2,4:1) wird nirgends verwendet, auch nicht im großen Anruf-Knopf (Entscheidung 19.10.2026).

## Bausteine

- **Anruf-Knopf** (`ui/CallButton`) überall wie „Jetzt anrufen“: Türkis, Tiefsee-Schrift, Nacht-Kreis mit hellem Hörer.
- **Zweitknopf** (`ui/Button`, `hell`) wie „Anfrage senden“: weiß, 1,5-px-Rand, Radius 16, weicher Schatten. „… anfragen“
  trägt dasselbe Sprechblasen-Icon.
- **Primärknopf** (`primaer`): Tiefsee-Fläche, weiße Schrift. Die frühere Art `dunkel` ist entfallen.
- **Icons**: flache SVGs in `design/icons` (`gewerk-*`, `ui-*`, `telefon`, `vorteil-*`), immer in Tiefsee bzw. `currentColor`.
  Im Lagune-Kreis (`ui/IconKreis`) wie die Vorteile; mit `dunkel` im Nacht-Kreis (Luna, Erfolg), mit `weiss` im
  weißen Kreis auf Eis-Flächen (große Zusagen-Karten, Hinweise im Preisrechner).
- **Hinweiskasten** wie unter den Knöpfen im Hero: Eis-Fläche, Radius 20, ohne Rand.
- **Karte**: weiß, Haarlinie, Radius 20, weicher Schatten.

## Abschnitte

| Abschnitt | Fläche | Umsetzung |
|---|---|---|
| Was ist passiert? | Kalk | weiße Kacheln mit Schatten, Gewerk-Icon im Lagune-Kreis; Luna-Kachel als Hinweiskasten |
| Leistungen | Kalk-2 | weiße Karten mit Bild, Preis in Inter 800; Hilfekarte als Hinweiskasten |
| So funktioniert's | Kalk | hell statt Tiefsee, große Ziffern in Orange, türkise Linie über den Schritten |
| Preisrechner | Kalk-2 | Rechner als weiße Karte, Ergebnis als Hinweiskasten (statt Tiefsee) |
| Zusagen | Kalk | Kopf linksbündig; Bento-Raster: große Karten als Hinweiskasten, kleine weiß; Icon im Kreis oben, Inhalt unten |
| Anfrage | Kalk-2 | Formular als weiße Karte; Seitenkasten als Hinweiskasten mit Headset wie im Hero |
| Häufige Fragen | Kalk | weiße Karten, Pfeil im Lagune-Kreis (offen: Tiefsee) |
| Fuß | Kalk-2 | hell wie der Kopf: Haarlinie oben, Logo in Farbe, Kontakt-Icons im Lagune-Kreis, Globus in Tiefsee-Linien, große Wortmarke als helles Wasserzeichen |

## Fenster

- **Preisübersicht** (Dialog und Sheet): weiß, Gewerke im Lagune-Kreis, Schließen im Lagune-Kreis, Anruf-Knopf wie oben.
- **Handy-Menü**: große Links in Inter 750, Kontaktkarte als Hinweiskasten.
- **Luna**: Knopf und Signet im Nacht-Kreis (der Knopf mit weißem Ring für dunkle Fotos dahinter), Luna-Blasen in Eis, eigene Blasen in Tiefsee, runde Eingabe, Senden im
  Tiefsee-Kreis; Karten weiß, Tipps in Eis, Erfolg im Nacht-Kreis.
- **Rechtsseiten**: Titel in Inter 750 auf Kalk.

## Entfernt

- 3D-Renders als Icons (`public/icons`, `Symbol3D`, `GewerkIcon`); die Quellen bleiben in `design/icons-3d`.
- Dunkle Flächen in So funktioniert's, Zusagen, Hilfekarte, Rechner-Ergebnis, Seitenkasten, Menü und Fuß.
- Wirbel-Shader in den Zusagen (`@paper-design/shaders-react`), Lichtstrahl und Maus-Schein im Fuß, Lichtkanten der
  dunklen Karten, Leuchten in So funktioniert's.

Geblieben sind die ruhigen Bewegungen: Glanzlicht über den Bildern der Leistungen, Einblenden der Zusagen-Karten,
Linie über den Schritten, Haarlinien unter den Spaltentiteln im Fuß, aufsteigende Wortmarke, drehender Globus.
