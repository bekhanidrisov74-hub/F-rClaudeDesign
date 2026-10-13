# Bewusste Abweichungen (für den visual-reviewer)

Diese Punkte sind entschieden und gelten **nicht** als Abweichung. Quelle: PLAN.md, Abschnitte 7 und 8.

## Immer

- Bildflächen sind leere türkisblaue Flächen **ohne** Text. Die Bildbrief-Texte, „Bild N: …“ und die Marke „Platzhalter“ aus den Entwürfen erscheinen nie auf der Website.
- Die Wortmarke „fixit247“ steht in Bricolage 800, nicht 900.
- Schriftgrößen, Radien, Abstände und Schatten kommen nur aus `src/styles/tokens.css`. Halbe Pixel aus den Entwürfen (13,5 / 14,5 / 15,5 px) sind auf die nächste Token-Stufe gerundet, ebenso Abstände (10/14/18/20/22 px) auf die `--fx-s-*`-Stufen. Unterschiede bis 2 px bei Schriftgrößen und bis 4 px bei Abständen sind deshalb gewollt.
- Telefonnummer, WhatsApp, E-Mail, Firmenname und Domain zeigen die Klammer-Platzhalter wie in den Entwürfen.
- Für 1024 px gibt es keinen Entwurf. Dort gilt das Desktop-Layout aus Screen 02 (Navigation sichtbar).
- Board-Beschriftungen in den Screens 12 und 13 (Überschriften über den Rahmen) gehören nicht zur Website.

## Phase 1 (Gerüst)

Die Startseite ist nur ein Gerüst: H1 und Unterzeile des Hero ohne Kopf, Knöpfe, Bild und weitere Abschnitte. Zu prüfen sind nur:
- Schriften (Bricolage für die H1, Breite 96 %, Gewicht 700, Atkinson für die Unterzeile)
- Farben (Kalk-Hintergrund, Tiefsee-Schrift, Schiefer-Unterzeile)
- Größe der H1 (44 px bei 390, 62 px bei 1440)
- Fokusrahmen (3 px Türkis, Abstand 3 px)

Verglichen wird mit Screen 01/02 (Hero-Text) und Screen 14 (Token-Board). Alle übrigen Abschnitte fehlen absichtlich.
