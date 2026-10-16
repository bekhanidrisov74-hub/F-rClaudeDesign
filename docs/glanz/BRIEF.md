# Glanz – Scroll-Konzept (scrollcraft, angepasst)

**Selbst verfasst, kein Interview.** Der Auftrag lautete „loslegen, nicht nachfragen“. Die Antworten unten sind aus `design/SPEC.md`, den Screens und dem Auftrag abgeleitet. Bitte korrigieren, wo es nicht stimmt.

## Auftrag (wörtlich, 16.10.2026)

> Verbessere meine Webseite in allen Belangen. Nicht am Original arbeiten. Ziel ist nicht, die Bilder wegzumachen, sondern einen Glanz zu geben, es attraktiver zu machen. Vielleicht könnte man die Schrift verbessern.

## Die acht Fragen (selbst beantwortet)

1. **Stimmung:** ruhig, präzise, hell, verlässlich, mit Augenzwinkern. Bezüge: ein Werkstattkatalog von Braun, eine gut gemachte Fahrplanauskunft, Studiofotografie von Chrom.
2. **Weg durch die Seite:** Notfall erkennen und anrufen (Hero, Schnellwahl) → sehen, wer hilft (Leistungen) → verstehen, wie es läuft (So funktioniert's) → wissen, was es kostet (Rechner) → Vertrauen (Zusagen) → Anfrage → Fragen → Fuß.
3. **Energie:** oben ruhig und sofort klar, in der Mitte (So funktioniert's) der einzige bewegte Moment, unten wieder still.
4. **Gefühl je Abschnitt und der eine Moment:** siehe Gefühlskurve und Höhepunkt.
5. **Was keine andere Seite macht:** Das Licht wandert mit. Beim Scrollen gleitet ein Glanzlicht über das Chrom der Fotos, als würde man an einer Vitrine vorbeigehen.
6. **Abstand zu Premium-minimal:** nah dran. Die Seite ist ein Notdienst, keine Spielwiese.
7. **Eine Welt oder Szenen:** Szenen. Jeder Abschnitt bleibt ein eigener Block mit eigener Fläche.
8. **Vorhandenes Material:** sechs Fotos, 23 Icons, Tokens, fertiges Layout. Auf der Seite wird nichts neu erzeugt; neue Fotos und Gewerke-Icons folgen über die überarbeiteten Prompts (`design/IMAGE-PROMPTS-CHATGPT.md`, `design/ICON-PROMPTS-CHATGPT.md`).

## Weg (Beats)

| # | Beat | Abschnitt |
|---|---|---|
| 1 | Erkennen | Hero, Schnellwahl |
| 2 | Zuordnen | Leistungen |
| 3 | Durchblick | So funktioniert's |
| 4 | Sicherheit beim Preis | Preisrechner |
| 5 | Vertrauen | Zusagen |
| 6 | Handeln | Anfrage, Fragen, Fuß |

## Gefühlskurve

| Abschnitt | Gefühl | Was es auslöst |
|---|---|---|
| Hero | Erleichterung | große klare Zeile, Anruf-Knopf sofort da; das Foto zoomt beim Wegscrollen minimal heran |
| Leistungen | Wiedererkennen | über das Chrom der Fotos läuft ein Glanzlicht, Spalte für Spalte versetzt |
| So funktioniert's | Durchblick (Höhepunkt) | auf Tiefsee zieht eine türkise Linie von Schritt 1 zu Schritt 3, die Ziffern werden nacheinander voll (vorher 70 %, damit sie immer lesbar bleiben) |
| Preisrechner | Kontrolle | ruhig, keine Bewegung außer der eigenen Eingabe |
| Zusagen | Vertrauen | die Karten setzen sich nacheinander |
| Anfrage, Fragen | Entschlossenheit | still, nichts lenkt ab |

**Höhepunkt:** „Bei ‚So funktioniert's‘ läuft beim Scrollen eine Linie durch die drei Schritte, und man sieht, wie die Anfrage beim Betrieb ankommt.“ (Abschnitt 3)

**Satz für Freunde:** Es ist die Seite, auf der das Licht über die Wasserhähne wandert, während man scrollt.

**Bewusste Stille:** Preisrechner, Anfrage und Fragen bewegen sich nicht. Wer dort ist, will rechnen oder schreiben.

## Grammatik und warum nicht die Maschine

Gewählt: **Gallery / Katalog**, als Abfolge von Szenen. Die Seite ist ein Verzeichnis von Leistungen mit Preis und Weg, das passt.

Nicht gewählt: Filmic one-shot, Continuous world (Scroll-Video, Kamerafahrt), Live surface, Typographic poster, Chaptered editorial, Split stage, Rhythmic cutlist. Ein Notdienst darf niemandem den Weg zum Anruf verlängern. `pin` und `scrub` halten die Seite fest, `pan` erzeugt seitliches Scrollen (verboten laut SPEC 4).

Die scrollcraft-Maschine (`scrollcraft.js`) wird nicht eingebaut. Die Seite ist React mit Vorrendern, Lighthouse ≥ 95 und WCAG AA. Alles läuft über native CSS-Scroll-Animationen (`animation-timeline: view()`), hinter `@supports`, und fällt bei `prefers-reduced-motion` komplett weg. Ohne Unterstützung ist die Seite einfach statisch.

## Partitur

| Abschnitt | Mittel | Warum |
|---|---|---|
| Hero | `parallax` (Foto zoomt beim Wegscrollen bis 7 % heran) | Tiefe, ohne Text zu bewegen |
| Leistungen | Signatur (Glanzlicht, Versatz nach Spalte) | das Chrom glänzt, ohne dass die Fotos sich ändern |
| So funktioniert's | Linie zeichnet sich, Ziffern leuchten nacheinander | der Weg der Anfrage wird sichtbar |
| Preisrechner | `flow`, still | Kontrolle |
| Zusagen | `in` | ruhiges Ankommen |

## Prüfen

- `npm run check`, `npm run test:e2e`, `npm run shots`, visual-reviewer.
- Scroll-Positionen mit Playwright (Chrome) fotografieren, nicht im versteckten Browser-Pane (dort feuern Scroll-Timelines nicht zuverlässig).
- Mit `prefers-reduced-motion: reduce` muss alles sofort sichtbar und still sein.
