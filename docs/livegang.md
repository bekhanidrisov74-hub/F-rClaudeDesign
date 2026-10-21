# Livegang fixit247.at

Stand: 18.10.2026. Abhaken, was erledigt ist. Wie die KAS-Schritte im Einzelnen gehen, steht in `docs/hosting.md`.

## Erledigt

- [x] Formular und Luna senden live an `/anfrage.php`, die Endpunkte stehen in `.env.production`.
- [x] Alle Anfrage-Mails zeigen PLZ und Ort.
- [x] Die Domain `https://fixit247.at` steht in Sitemap, robots.txt, og:url und canonical.
- [x] `public/.htaccess` leitet http und www auf `https://fixit247.at` um.

## Bei ALL-INKL (KAS)

- [ ] Die Domain `fixit247.at` zeigt auf den Unterordner `/fixit247.at/`, nicht auf `/`.
- [ ] Für die Domain ist PHP 8.1 oder neuer gewählt.
- [ ] Es gibt ein Let’s-Encrypt-Zertifikat für `fixit247.at` und `www.fixit247.at`.
- [ ] Das Postfach `support@fixit247.at` ist angelegt.
- [ ] `npm run build` ist gelaufen und der Inhalt von `dist/` liegt im Domain-Ordner, mit `.htaccess`.
- [ ] `fixit247-konfig.php` liegt im Hauptverzeichnis des Accounts, mit OpenAI-Schlüssel und Partnerliste.
- [ ] Prüfung:
  - `http://www.fixit247.at/` landet auf `https://fixit247.at/`.
  - Je eine Testanfrage über das Formular und über Luna geht an die eigene Adresse.
  - Die Mail an `support@fixit247.at` und die Bestätigung kommen an.
  - Die Anfrage steht in `fixit247-daten/anfragen-*.jsonl`.
- [ ] Erscheint bei der Prüfung der Sendefehler, im PHP-Fehlerprotokoll nach `mail() an … abgelehnt` suchen. Dann nimmt ALL-INKL den Absender `-f support@fixit247.at` nicht an.
- [ ] Optional: DMARC-Eintrag für `fixit247.at` (KAS, DNS).

## Inhalte (Daten liefern, dann werden sie eingetragen)

- [ ] Telefonnummer (`src/content/contact.ts` und `KONTAKT` in `public/_basis.php`). Sie steht auch in der Bestätigungsmail an den Kunden.
- [ ] WhatsApp-Nummer, dazu das offizielle WhatsApp-Logo nach den Richtlinien von Meta (SPEC 3)
- [ ] Öffentliche E-Mail-Adresse. Sie steht auch in der Bestätigungsmail.
- [ ] Firmenname
- [ ] Logo-Datei (bis dahin die Wortmarke)
- [ ] Preise brutto: den Hinweis „[inkl. 20 % USt.]“ bestätigen (SPEC 11)
- [ ] Impressum, Datenschutzerklärung und AGB. In die Datenschutzerklärung gehören die Speicherung der Anfragen bei ALL-INKL (Auftragsverarbeitung), die Weitergabe an Partnerbetriebe und an OpenAI (Luna).
- [ ] Datenschutzerklärung: Zweck und Speicherdauer der freiwilligen E-Mail im Anfrageformular (nur für die Bestätigungsmail, Bauplan B1). Offen, rechtlich prüfen.
- [ ] Rechtlich prüfen: Häufige Frage „Was heißt ‚geprüft‘?“ (`src/content/copy.ts`, Bauplan B5). Der Text muss genau dem Aufnahmeablauf für Partner entsprechen: Gewerbeberechtigung je Gewerk im GISA, Nachweis der Betriebshaftpflichtversicherung, persönliches Gespräch, Pause der Vermittlung bei Beschwerden. Vor dem Livegang muss dieser Ablauf für jeden eingetragenen Partner tatsächlich gelaufen sein.
- [ ] Partnerbetriebe für das Matching in `fixit247-konfig.php`. Ohne sie gehen alle Anfragen nur an `support@fixit247.at`.
- [ ] Monatslimit im OpenAI-Konto
- [ ] Löschfrist für `anfragen-*.jsonl`

Weitere offene Entscheidungen, die den Livegang nicht blockieren, stehen in `design/SPEC.md`, Abschnitt 11.
