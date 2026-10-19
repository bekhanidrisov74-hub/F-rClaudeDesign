# Bewusste Abweichungen (für den visual-reviewer)

Diese Punkte sind entschieden und gelten **nicht** als Abweichung. Quelle: PLAN.md, Abschnitte 7 und 8.

## Immer

- Bildflächen zeigen 3D-Szenen statt der Platzhalter (siehe „Bilder und Icons“), **ohne** Text. Die Bildbrief-Texte, „Bild N: …“ und die Marke „Platzhalter“ aus den Entwürfen erscheinen nie auf der Website.
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

## Phase 2 (statische Abschnitte)

Gebaut sind Kopf, Hero mit Schnellwahl und Bild 1, Vertrauensleiste, Leistungen, So funktioniert's, Fuß und die Platzhalterseiten. Bewusst noch nicht da:
- Preisrechner, Preisübersicht und Handy-Menü (Phase 3). Der Menü-Knopf und „Alle Richtpreise im Überblick“ haben noch keine Funktion.
- Luna-Knopf und Anstupser (Phase 4).
- Anfrage-Formular (Phase 5).

Im Screenshot folgt deshalb auf „So funktioniert's“ direkt der Fuß.

Entschiedene Standards:
- Handy wie Screen 01, Desktop wie Screen 02 (Entscheidung 5):
  - Schnellwahl-Kacheln am Handy ohne Unterzeile, Luna-Kachel „Nicht sicher? Luna fragen“
  - Fuß-Kontakt am Handy ohne „Telefon“-Präfix und „WhatsApp“ ohne Nummer
- Leistungen sind auf allen Breiten ein Raster (`auto-fill` ab 340 px) mit 24 px Abstand. Im Entwurf hat die Handy-Spalte 20 px.
- Kartenradius 22 px (`--fx-r-card-lg`) auf allen Breiten, im Entwurf am Handy 20 px.
- Schnellwahl ab 920 px: Kacheln mindestens 176 statt 160 px breit, damit „Haushaltsgeräte“ bei 19 px Titelgröße passt. Bei 1024 px stehen 5 Kacheln in der ersten Reihe, die Luna-Kachel allein darunter. Für 1024 gibt es keinen Entwurf.
- Schnellwahl-Titel „Was ist passiert?“ in `text-h4` (22 px bei 1440, Entwurf 24 px). Kachel- und Spaltentitel in `text-h5` (19 px bei 1440, Entwurf 18 px).
- Zwischen 640 und 919 px: Schnellwahl mit 3 Spalten, Fuß im Handy-Layout (kein Entwurf).
- So funktioniert's: eine Spalte bis 919 px, drei ab 920 px.
- Fuß: Abstände gerundet, am Handy oben 40 statt 48 px, am Desktop vor der unteren Zeile 56 statt 48 px.
- Preis in den Leistungskarten in Bricolage 800 wie im Entwurf.

## Phase 3 (Interaktion)

Neu: Preisrechner (nach So funktioniert's), Preisübersicht als Dialog ab 640 px bzw. Bottom-Sheet darunter, Handy-Menü. Das Anfrage-Formular fehlt weiterhin (Phase 5), ebenso Luna (Phase 4). Im Screenshot folgt deshalb auf den Preisrechner direkt der Fuß.
- Der Hintergrund hinter Dialog, Sheet und Menü ist die echte Seite, nicht der Entwurfsausschnitt. Dass dort andere Teile der Seite zu sehen sind, ist kein Befund.
- Im Handy-Menü ist „Preisübersicht“ ein Knopf. Er öffnet das Sheet, die Optik ist wie bei den Links.
- Rechner: Bei vierstelligen Summen wird der Gesamtpreis kleiner, damit er einzeilig bleibt (z. B. 26 statt 30 px bei 1440, 19 px bei 320). Passen Zuschlag-Label und Betrag bei 320 px nicht nebeneinander, steht der Betrag rechtsbündig darunter.
- Rechner und Preisübersicht: Beträge in den Zeilen in Atkinson 700 wie im Entwurf, nur „x Stunden“ und Gesamt in Bricolage.
- Preisübersicht: Sheet-Titel 30 px (`--fx-h2-s`), im Entwurf 29 px. Innenabstände und Blockabstände auf Token-Stufen gerundet (Dialog 32 statt 36 px innen, 24–32 px zwischen den Blöcken). Das Sheet ist dadurch etwa 25 px niedriger, der Dialog etwa 16 px höher als im Entwurf.
- Rechner: Der Textlink „Preisübersicht öffnen“ hat eine Trefferfläche von 44 px. Der Abstand zum Kartenrand verschiebt sich dadurch am Handy um etwa 10 px.
- Menü: Zwischen 640 und 919 px nimmt die Kontaktkarte die volle Inhaltsbreite ein (kein Entwurf).

## Phase 4 (Luna)

Neu: Luna-Knopf, Anstupser, Chat als Fenster (ab 640 px) bzw. Vollbild (darunter), Zusammenfassung, Erfolg, Sendefehler. Das Anfrage-Formular fehlt weiterhin (Phase 5).
- Die Screenshots zeigen echte Testdaten: „Maria Huber, 0664 1234567“ statt „[Ihre Nummer]“, eine echte Anfragenummer „F247-…“ statt „[Nummer]“.
- Erfolg: „Danke, Maria Huber. Ihre Anfrage ist unterwegs.“ statt „Danke, Frau Huber.“ (Entscheidung 2, Luna fragt kein Geschlecht ab).
- Die Einwilligung startet leer (DSGVO). In Screen 08 und 12 ist sie bereits angehakt. Der Zusammenfassungs-Screenshot zeigt sie deshalb leer.
- Fensterhöhe: Auf niedrigen Bildschirmen endet das Fenster immer unter dem Seitenkopf (Entscheidung 3). Bei 1024 × 768 ist es deshalb niedriger als 680 px.
- Der Verlauf im Fenster scrollt und zeigt unten die neueste Nachricht. Im Entwurf ist er oben abgeschnitten.
- Größe der Luna-Glyphe wie in den Seitenentwürfen (32 px im 64-px-Knopf, 29 px im 58-px-Knopf).
- Der Hintergrund hinter dem Fenster ist die echte Seite.
- Preisformat: Mit Nachkommastellen („190,00–280,00 €“) rechnet nur der Preisrechner (SPEC 5). Leistungen, Preisübersicht und die Luna-Zusammenfassung zeigen ganze Euro („95–140 €“) wie die Entwürfe 01–04, 08 und 12.
- Luna-Sendefehler im Fenster: Der bisherige Verlauf bleibt über der Kurzfassung sichtbar (Screen 12 rechts), am Handy nicht (Screen 10). Beim Erfolg ersetzt die Kurzfassung den Verlauf (Screen 12 Mitte).
- Luna-Fenster: Die Chips sind 48 px hoch mit 16 px Schrift (gemeinsamer Chip-Baustein). Die Dringlichkeits-Chips brechen deshalb eine Reihe früher um als in Screen 11.
- Luna: Bei langem Verlauf erscheint ein schmaler Scrollbalken in Rand-Farbe.
- Anstupser etwa 5 px höher als im Entwurf, weil der Text-Knopf und das Schließen eine Trefferfläche von 44 px haben.
- Nach dem Erfolg ist die Eingabezeile gesperrt (Optik unverändert weiß). Die Anfrage ist abgeschlossen, weitere Nachrichten würden nichts bewirken.
- Titel der Erfolgs- und Fehlerkarte im Fenster 22 px (`--fx-h4`), im Entwurf 21–23 px. Alle Kartentitel in Bricolage 700 mit Breite 96 % wie die übrigen Überschriften.

## Phase 5 (Formular)

Neu: Abschnitt „Anfrage senden“ mit Formular und Seitenkasten „Lieber sofort sprechen?“, Zustände Fehler, sendend, Erfolg, Sendefehler.
- Für die Formular-Zustände gibt es keinen Entwurf (SPEC 9). Erfolg und Sendefehler übernehmen die Texte der Luna-Karten 09/10 (Entscheidung 2). Der Sendefehler steht laut SPEC 9 als Meldung über dem Senden-Knopf mit „Stattdessen anrufen“. Erneut gesendet wird mit diesem Knopf, ein eigener „Erneut senden“-Knopf wie in Luna entfällt.
- Seitenkasten am Handy wie Screen 01: Anruf-Knopf ohne Nummer, am Desktop wie Screen 02 mit Kreis und Nummer (Entscheidung 5).
- Die Einwilligung startet leer, Pflichtfelder tragen das Sternchen im Label wie im Entwurf.
- „… anfragen“ und die Schnellwahl-Kacheln wählen das Gewerk im Formular vor (nicht im Design, SPEC verlangt es nicht; es ändert nichts an der Optik).
- Abstände im Formular auf Token-Stufen gerundet: Karte innen am Handy 16/24 px statt 18/22 px, am Desktop 32 statt 36 px; Feldabstände 16 bzw. 24 px. Felder 54 px hoch wie im Entwurf.
- Zwischen 640 und 919 px (kein Entwurf): Felder schon zweispaltig, Seitenkasten wie am Handy.
- Seitenkasten-Titel bis 919 px 26 px, ab 920 px 30 px.
- Ein Feld mit Fehler bekommt zusätzlich einen Tiefsee-Rand, damit der Fehler nicht nur über Text erkennbar ist.
- Die Checkbox ist sichtbar 24 px groß, die Trefferfläche 44 px.
- Die Erfolgskarte des Formulars zeigt wie Luna 09 den Sicherheitstipp und „Fragen? Jetzt anrufen“.

## Luna mit KI (docs/luna-ki/AUFGABE.md)

Die Aufgabe ersetzt den Ablauf aus SPEC 8. Optik wie Screens 06–12, Verhalten und Texte laut Aufgabe:
- Fragen je Gewerk aus dem Katalog mit Chips plus „Überspringen“, Dringlichkeits-Chips „Akut/Gefahr“, „So schnell wie möglich“, „In den nächsten Tagen“, bei Bedarf eine Wunschtermin-Frage. „Überspringen“ sieht aus wie die übrigen Chips.
- Notruf-Hinweis als Luna-Blase mit 2-px-Rand in Tiefsee, Warn-Icon und fetter Schrift (`role="alert"`), nicht im Design.
- Fortschrittsbalken in vier Schritten (Problem, Details, Ort, Prüfen) statt fünf.
- Zusammenfassung mit mehr Zeilen (Antworten aus dem Katalog), darunter durch eine Linie getrennt die Felder Name, Telefon und E-Mail (optional) statt der Textzeilen Name/Telefon, und der Einwilligungstext der Aufgabe. Der Verlauf zeigt die Karte mit ihrem Anfang.
- Erfolg mit zusätzlichem Knopf „Neue Anfrage starten“ (hell, volle Breite). Bei „kein Betrieb gefunden“ ein anderer Titel und Text, ohne Tipp „Bis der Betrieb kommt“. Der Sendefehler-Knopf heißt „Erneut versuchen“.
- Erfolg und Sendefehler zeigt der Verlauf mit ihrem Ende, damit ihre Knöpfe auch in niedrigen Fenstern sichtbar sind (Screens 10 und 12: Karte unten ausgerichtet). Ist die Karte höher als der Verlauf (im Fenster bei Viewport-Höhen unter etwa 800 px beim Erfolg, unter etwa 660 px beim Sendefehler), ist ihr oberer Teil weggescrollt. Er lässt sich hochscrollen.
- Während Luna antwortet, steht eine Blase „…“ im Verlauf und die Eingabe ist gesperrt.
- Anstupser nach 25 s oder ab 60 % Scrolltiefe, nicht über einem per Tastatur fokussierten Element.

## Auf Wunsch nach Phase 5 (Hero und Fuß)

Bewusst und nicht im Entwurf (das Hero-Raster `GridPulse` ist mit dem Hero vom 19.10.2026 entfallen):
- Fuß (nach Vorlage am 16.10.2026, Lichtstrahl seit 18.10.2026): vier Spalten (Marke mit Uhr-Abzeichen und ab 920 px Globus, Seiten, Kontakt mit 24-px-Icons in Türkis, Rechtliches), Spaltentitel in Türkis über einer türkisen Haarlinie. Über dem Tiefsee-Grund liegt ein schräger türkiser Lichtstrahl, oben eine türkise Lichtkante statt des Tiefsee-2-Randes. Unten schließt eine große Wortmarke „fixit247“ über die volle Inhaltsbreite ab, petrolfarben und nach unten ins Dunkle auslaufend; der Strahl läuft durch die Buchstaben. Beim Hinscrollen kommt der Strahl von links und steht dann still, die Wortmarke steigt auf, die Haarlinien ziehen sich auf; mit der Maus wandert ein weicher Schein durch die Buchstaben. Der Entwurf 01/02 hat einen flachen Tiefsee-Grund, weiße Titel, Links ohne Icons und keine Wortmarke unten; der Fuß ist dadurch deutlich höher. Die Größe der Wortmarke folgt der Inhaltsbreite und ist kein Token. Ein heller schräger Streifen im Fuß oder auf der Wortmarke ist kein Bildfehler.

## Bilder und Icons

- Bildflächen der Leistungskarten zeigen 3D-Szenen aus Blender (`public/images/bild-2` bis `bild-6`, `design/IMAGE-BRIEFS.md`): eine stilisierte Fachkraft arbeitet an der Schadstelle ihres Gewerks, dunkles Tiefsee-Studio, gedämpfter türkiser Kegel hinter der Figur, orange Akzente. Völlig andere Motive als in den Entwürfen, gewollt. Zu prüfen sind nur: Gesicht, Hände und Werkzeug vollständig sichtbar, nichts Wichtiges abgeschnitten.
- Zuschnitt: Karten unter 920 px 16 : 9, ab 920 px 4 : 3.
- Alle Icons in `design/icons/*.svg` sind neu gezeichnet. Form und Rundung weichen leicht von den Entwurfs-Icons ab. Farben und Platz müssen stimmen: Steuer- und Feldzeichen in der Textfarbe der Umgebung, Luna-Mond auf Tiefsee. X, Chevrons und Häkchen sind etwas größer als im Entwurf.
- Die Symbole (Telefon in den Anruf-Knöpfen außer Kopf und Hero, Chat, Senden, Zusagen, Preisrechner, Fuß, Luna, Erfolgs- und Fehlerkarten) sind farbige 3D-Renders statt flacher Icons (SPEC 3): Körper Tiefsee auf hellen und türkisen Flächen, Türkis auf dunklen, Warnung Orange. Form und Farbe weichen deshalb vom Entwurf ab. Zu prüfen sind nur: gleiche Größe und Lage wie vorher, gut erkennbar, und der Anruf-Knopf bleibt das auffälligste Element.
- Die Gewerke-Icons in Schnellwahl und Preisübersicht sind farbige 3D-Renders statt flacher Piktogramme (SPEC 3, freigegeben am 17.10.2026). Motive: Wasserhahn mit Tropfen, Heizkörper mit Thermostat, Schlüssel vor einem Türschild, Steckdose und Waschmaschine. Sie sind größer als im Entwurf: in der Schnellwahl 56 px (Handy) bzw. 64 px (ab 920 px) statt 41/47 px, in der Preisübersicht 40 px statt 32 px. Zu prüfen sind nur: Hauptfarbe Petrol bzw. Orange, keine Fläche dahinter, Motiv nicht abgeschnitten und der Abstand zum Kacheltitel.

## Glanz (Branch `glanz`, docs/glanz/BRIEF.md)

Bewusst, auf Wunsch „schöner, attraktiver, Schrift verbessern“:
- So funktioniert's: weiches türkises Leuchten oben rechts im Hintergrund (auch am Handy sichtbar). Über der Linie jedes Schritts liegt eine türkise Linie, die sich beim Scrollen von links füllt; die Ziffern sind vorher gedämpft (70 %, Kontrast über 3:1). In Ganzseiten-Screenshots sind Linien und Ziffern voll; ist eine Linie teilweise oder eine Ziffer blass, hängt das nur von der Scroll-Position ab.
- Leistungskarten: Beim Scrollen gleitet ein diagonales Glanzlicht über die Fotos, je Spalte etwas später. Ein heller schräger Streifen auf einem Kartenfoto ist kein Bildfehler.
- Dunkle Karten (Zusagen, Hilfekarte, Rechner-Ergebnis, Seitenkasten, Kontaktkarte im Menü) haben oben eine 1-px-Lichtkante.
- Beträge in Rechner und Preisübersicht stehen in Bricolage mit gleich breiten Ziffern statt in Atkinson (Atkinson zeichnet die Null durchgestrichen). Gewicht wie bisher.
- Überschriften sind ausgeglichen umbrochen (`text-wrap: balance`), Absätze ohne Einzelwort in der letzten Zeile. Zeilenumbrüche können deshalb vom Entwurf abweichen.
- Hover nur als Farbe (120 ms): Zweitknöpfe bekommen einen Tiefsee-Rand, Primärknöpfe Tiefsee-2, Kacheln einen türkisen Rand, der Anruf-Knopf wird etwas tiefer (`--fx-tuerkis-tief`).
- Textmarkierung in Türkis mit Tiefsee-Schrift.

## Wirbel (Worktree `shader-karten`)

- Zusagen: Die zwei großen dunklen Karten („Vermittlung statt Reparatur“, „Richtpreise, keine Festpreise“) zeigen statt des Türkis-Rasters einen langsam fließenden Wirbel (Paper-Shader „Warp“, `Wirbelflaeche.tsx`) in Tiefsee-2, Technik und Türkis, 50 % Deckkraft, nach unten zum Text hin ausgeblendet; die zweite Karte ist um 135° gedreht. Ohne WebGL 2 und vor dem Laden steht das Raster, bei prefers-reduced-motion ein Standbild. Die Struktur unterscheidet sich zwischen zwei Aufnahmen, das ist kein Befund. Für den Abschnitt gibt es keinen Entwurf; `zusagen-*.png` nur auf Stimmigkeit prüfen.

## Kopf, Hero und Vorteile (Entwurf „Hero – Desktop 1586“, 19.10.2026)

Quelle: Zip „Hero – Desktop 1586-html“ (`Main.dc.html`), verglichen bei 1534 × 960 px. Kopf, Hero und die vier Vorteile folgen diesem Entwurf, nicht den Screens 01/02. Bewusst:
- Schrift Inter, Farben, Größen und Abstände 1:1 aus dem Entwurf (`--fx-hd-*` in `tokens.css`), auch wo sie von den übrigen Tokens abweichen: Türkis #22B5C0 statt #3AA8B8, Tiefsee #03101F statt #001B2A, Fokusrahmen an Links in Kopf und Hero Tiefsee statt Türkis.
- Logo: das bisherige (`design/icons/logo.svg`, Wunsch vom 19.10.2026), so breit wie Zeichen, Wortmarke und Zeile im Entwurf. Formen und Orange weichen vom Entwurfslogo ab.
- Großer Anruf-Knopf: „Jetzt anrufen“ und die Nummer in Tiefsee #03101F statt Weiß bzw. #D4F7F9 (Entscheidung 19.10.2026, WCAG AA: Weiß hatte auf dem Türkis nur 2,5:1). Wie der Anruf-Knopf im Kopf.
- Ab 1534 px feste Werte wie im Entwurf, von 1280 bis 1534 px schrumpft alles proportional mit der Breite. Das Foto ist höchstens 1006 px breit: auf breiten Fenstern bleibt sein Verlauf unten erhalten, zwischen Text und Foto liegt mehr weißer Raum.
- Unter 1280 px die Handy-Fassung des Entwurfs (dort ≤ 900 px). Dazu, nicht im Entwurf: Menü-Knopf neben „Anrufen“, das Logo deshalb höchstens 205 px breit; Foto im Seitenverhältnis des Bildes (mindestens 280 px hoch, Entwurf fest 280 px); Titel der Vorteile dürfen umbrechen; unter 364 px wird „Rund um die Uhr.“ etwas kleiner, damit die Zeile hält; von 920 bis 1279 px Vorteile in zwei Spalten.
- Der Weißverlauf links im Foto hat im Bild selbst einen gezackten Rand mit zwei grauen Spitzen. Ab 1600 px und unter 1280 px, wo er frei läge, blendet eine Maske ihn weich aus; das Foto beginnt dort optisch etwas weiter rechts als im Entwurf.
- Schnellwahl „Was ist passiert?“ als eigener Abschnitt unter den Vorteilen (nicht im Entwurf).
- Luna-Knopf und Anstupser erscheinen auf der Startseite erst, wenn die vier Vorteile nach oben aus dem Bild gescrollt sind (Wunsch vom 19.10.2026; sonst verdeckte der Knopf je nach Fensterhöhe das Ende des vierten Vorteils). War der Chat einmal offen, bleibt der Knopf. Auf Seiten ohne Hero ist er sofort da. Ein fehlender Luna-Knopf im ersten Bildschirm der Startseite ist kein Befund.
- Prüfstand 19.10.2026: bei 1534 × 960 außerhalb des Logos und der Schrift im großen Anruf-Knopf pixelgleich mit dem Entwurf.
