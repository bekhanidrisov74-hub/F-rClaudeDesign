# Plan „Partner werden“ (Phase 3, wartet auf OK)

Stand: 21.10.2026 · Branch `feature/partner-werden` (eigener Worktree `.claude/worktrees/partner-werden`) · noch nichts gebaut.

Grundlage: [Bestand](partner-werden-bestand.md) und [Profihand-Analyse](profihand-partner.md). Ohne Antwort baue ich die Vorschläge als **Standard** und liste sie im Bericht, wie bei SPEC 11.

## Entscheidungen

| # | Thema | Vorschlag (Standard) | Warum |
|---|---|---|---|
| 1 | Pfad und Index | `/partner-werden/`, indexierbar, eigener Titel und eigene Beschreibung. Die Sitemap entsteht ab dann aus allen Seiten ohne `noindex` (`seo.md` Punkt 5). Lighthouse misst die Seite mit. | Betriebe suchen nach „Partner werden Notdienst Wien“; die Seite hat ein eigenes Thema. |
| 2 | Einstiege | **Fuß:** Link in der Spalte „Seiten“. **Handy-Menü:** kleiner Link unter der Kontaktkarte (nicht als sechster großer Link, SPEC 7 nennt fünf). **Startseite:** kurzer Hinweis am Ende von „Häufige Fragen“ (weiße Karte auf Eis, kein neues Band, der Flächenplan bleibt). **Nicht** im Hero und nicht in der Kopf-Navigation. | „Jetzt anrufen“ bleibt das auffälligste Element. Profihand stellt den Einstieg für Betriebe gleich groß neben den für Kunden; das passt nicht zu einer Notdienst-Seite. |
| 3 | Felder | siehe Tabelle unten | genau die Angaben, die Beks für den Eintrag in die Partnerliste braucht |
| 4 | Senden | `art=partner` an `/anfrage.php`, eigener Zweig ohne Matching und ohne KI. Gleiche Schutzschichten wie die Anfrage (Honigtopf, Feldlängen, Doppelsendung, eigenes Kontingent je IP, z. B. 5 in 6 Stunden). Speicherung in `fixit247-daten/partner-JJJJ-MM.jsonl` mit Status `PENDING`. Mail an `support@fixit247.at` mit allen Angaben und einem fertigen Eintrag für die Partnerliste zum Kopieren. Bestätigung an den Betrieb ohne Freitext. Die Partnerliste wird nie automatisch geändert. | Wie in der Aufgabe. Der Eintrag zum Kopieren ist sicher maskiert (PHP `var_export`), damit eine Eingabe wie `'` keinen Code in `fixit247-konfig.php` schmuggeln kann. |
| 5 | GISA | Pflichtfeld, nur das Format wird geprüft (Ziffern). Die Mail an Beks enthält den Link zur öffentlichen GISA-Abfrage (`https://www.gisa.gv.at/abfrage`). Kein automatisches Auslesen. | Kein Fremddienst auf der Website; die Prüfung macht ein Mensch. |
| 6 | Texte | Ich schreibe sie in `src/content/partner.ts`, Sie-Form, österreichisches Deutsch, „fixit247 vermittelt nur“. Kein „geprüft“, „verifiziert“, „Rückmeldung in 24 h“ oder „garantierte Aufträge“. Der copy-checker prüft, Beks gibt frei. | Für diese Seite gibt es keinen Entwurf in `design/`. |

### Felder des Formulars

| Feld | Pflicht | Prüfung | wird in der Partnerliste zu |
|---|---|---|---|
| Firmenname | ja | nicht leer | `company` |
| Ansprechperson | ja | nicht leer | `contact` |
| Telefon | ja | wie im Anfrageformular (6–15 Ziffern) | `phone` |
| E-Mail | ja | Format | `email` (an diese Adresse gehen später die Anfragen) |
| Gewerke | ja, mindestens eins | Mehrfachauswahl aus `gewerke.ts` | `trades` |
| Einsatzgebiet | ja | Postleitzahlen, getrennt durch Komma oder Leerzeichen; jede muss in `plz.json` stehen | `postalCodes` |
| Erreichbarkeit | ja, mindestens eins | Mehrfachauswahl: werktags tagsüber, abends, nachts, Wochenende, Feiertag | `availability`: alle fünf = `'24/7'`, sonst `'business'` |
| Notdienst | ja | ja / nein | `emergencyService` |
| Im Notfall vor Ort in | nein | Auswahl: 30, 60, 90, 120 Minuten | `responseTime` |
| GISA-Zahl | ja | nur Ziffern | in der Mail, mit Link zur GISA-Abfrage |
| UID-Nummer | nein | `ATU` und 8 Ziffern | in der Mail |
| Schwerpunkte, Anmerkungen | nein | höchstens 2000 Zeichen | in der Mail; Beks übernimmt Stichwörter nach `specializations` |
| Einwilligung Datenschutz | ja | Häkchen, Link zur Datenschutzerklärung | – |
| Honigtopf `fax` | – | unsichtbar, für Menschen und Screenreader verborgen | – |

`partnerStatus` setzt immer Beks (Standard im Eintrag: `'PENDING'`). Kennzahlen wie Bewertung oder Stornoquote fragt das Formular nicht ab.

## Aufbau der Seite

1. Kopf der Seite: H1, kurzer Satz, was fixit247 ist (Vermittlung, keine eigene Reparatur), Knopf zum Formular.
2. Nutzen für Betriebe (ehrlich: Anfragen aus der Region per Telefon oder Mail, passend zu Gewerk, PLZ und Erreichbarkeit; die Bewerbung ist kostenlos und unverbindlich).
3. Drei Schritte „So werden Sie Partner“: Bewerbung senden → wir melden uns persönlich → Aufnahme in die Vermittlung.
4. Was fixit247 erwartet: Gewerbeberechtigung, Erreichbarkeit in den angegebenen Zeiten, Richtpreise und Zuschläge kennen, die Kundinnen und Kunden auf der Seite sehen.
5. Formular (Muster wie das Anfrageformular, WCAG 2.2 AA).
6. Häufige Fragen für Betriebe (natives `<details>` wie auf der Startseite, kein `FAQPage`-Markup).
7. Anruf-Knopf (`ui/CallButton`) für Rückfragen.

Optik nur aus `src/styles/tokens.css`, `docs/hero-stil.md` und `src/components/ui/`. Icons aus `design/icons` (z. B. `ui-vermittlung`, `ui-region`, `vorteil-uhr`, `anfrage`).

## Bau und Prüfung (Phase 4 und 5)

- `src/App.tsx` (neue Seite), `src/content/partner.ts` (Texte), `src/lib/` (Prüfregeln und Versand), `src/components/PartnerSeite.tsx` und `PartnerFormular.tsx`, `public/anfrage.php` (Zweig `art=partner`), `tools/lokale-api.ts` (Attrappe für Partner), `scripts/prerender.mjs` (Sitemap aus `pfade`), Fuß, Menü, Fragen, Datenschutz-Platzhalter, `docs/livegang.md`, `docs/hosting.md`.
- Tests: PHP-Tests wie in `backend.test.ts` (Pflichtfelder, Honigtopf, Kontingent, gültige Bewerbung mit `PENDING` und zwei Mails, Partnerliste unverändert, andere unbekannte `art`), e2e bei 390, 1024 und 1440 px (Titel, Meta, Fehler, Erfolg, axe, Links, Sitemap), `npm run shots` und visual-reviewer, Lighthouse ≥ 0,95, REA-Bildvergleich mit Profihand, copy-checker.
- Test „fremde Art“ in `src/luna/backend.test.ts`: `art: 'partner'` wird mit dieser Seite eine bekannte Art. Er wird durch eine andere unbekannte Art ersetzt (z. B. `art: 'werbung'`), die weiter `bad_request` liefern muss. Die Prüfung bleibt gleich streng.

## Was Beks entscheidet (ohne Antwort gilt der Standard)

| Frage | Standard |
|---|---|
| Plan wie oben bauen? | ja |
| Kostet die Partnerschaft etwas (Gebühr, Provision)? | Die Seite sagt dazu nur: Bewerbung kostenlos und unverbindlich, Bedingungen im persönlichen Gespräch. |
| Müssen Partner den Richtpreisen zustimmen? | kein Pflicht-Häkchen; die Seite nennt Richtpreise und Zuschläge und verlinkt die Preisübersicht |
| Wer prüft GISA, und wie heißt der Schritt auf der Seite? | Beks von Hand; auf der Seite „Wir sehen uns Ihre Angaben an und melden uns persönlich“, kein „geprüft“ |
| Löschfrist für `partner-*.jsonl` | offen, Punkt in `docs/livegang.md` |
| Texte freigeben | nach dem copy-checker |
| Luna auf der Partner-Seite: Der Hinweis „Notfall? Ich helfe Ihnen …“ ist für Kundinnen und Kunden gedacht | Luna bleibt wie auf den Rechtsseiten (kein Umbau); Alternative: Hinweis auf `/partner-werden` aus |
| Push und Pull Request | erst nach OK |

## Widersprüche zu den Projektregeln

- `design/SPEC.md` Abschnitt 2 kennt nur die Startseite und die Rechtsseiten. `/partner-werden` kommt auf Wunsch von Beks dazu.
- SPEC 7 nennt fünf große Links im Handy-Menü. Der Partner-Link wird deshalb klein unter der Kontaktkarte, nicht als sechster großer Link.
- `CLAUDE.md` verlangt Texte exakt laut `design/`, der Auftrag eine Ergänzung der Datenschutz-Platzhalterseite um „Partner-Bewerbungen“. Das kommt nur als gekennzeichneter Entwurf und muss rechtlich geprüft werden.
- Die bestehenden Texte für Kundinnen und Kunden sagen „geprüfte Fachbetriebe“ (SPEC 1, Hero, Meta). Für die Partner-Seite ist „geprüft“ tabu, solange kein Prüfablauf feststeht. Das bleibt eine offene Entscheidung.
