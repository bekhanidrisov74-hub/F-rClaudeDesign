# Hosting und Backend

Stand: 21.10.2026

## Entscheidung

- **Hosting:** ALL-INKL.COM, Domain `fixit247.at` (ohne www, `DOMAIN` in `src/content/contact.ts`). Webspace, PHP, Postfächer und Domain liegen dort in einem Paket. Hochgeladen wird der Inhalt von `dist/` nach `npm run build`.
- **Mail:** PHP `mail()` über die Mailserver von ALL-INKL. SPF und DKIM für diese Server legt ALL-INKL automatisch an, SMTP ist nicht nötig. Absender (`-f` und `From`) ist eine Adresse von `fixit247.at`, damit Envelope- und sichtbarer Absender zur selben Domain gehören (Vorgabe von ALL-INKL wegen DMARC).
- **Backend:** PHP-Dateien auf dem Webspace statt Google Apps Script (gebaut am 16.10.2026). Sie liegen in `public/` und kommen mit `npm run build` nach `dist/`:
  - `anfrage.php` nimmt Formular und Luna entgegen, speichert die Anfrage als Datei und verschickt die Mails. Mit `art=partner` nimmt sie auch Partner-Bewerbungen von `/partner-werden/` an (eigener Zweig ohne Matching und ohne KI).
  - `chat.php` leitet Lunas KI-Anfragen an OpenAI weiter. Der Schlüssel liegt nur auf dem Server.
  - `_basis.php` enthält das Gemeinsame (Kopien aus `src/content`, Konfiguration, Kontingent). Direkt aufgerufen gibt sie nichts aus.
  - `_wissen.php` enthält die Fakten der Website für Lunas Antworten (FAQ, Preise, Ablauf, Partner werden). Die Datei wird mit `npm run wissen` aus `src/content` erzeugt; `npm run check` schlägt an, wenn sie veraltet ist. Sie muss mit `chat.php` hochgeladen werden.
- **Endpunkte:** `VITE_FORM_ENDPOINT=/anfrage.php` und `VITE_CHAT_ENDPOINT=/chat.php` stehen in `.env.production` und gelten für jeden `npm run build`. Abweichend nur in `.env.production.local`. Gleiche Herkunft, also keine CORS-Probleme.
- **Nicht gewählt:** Supabase. Begründung in der Konversation: Anfragen werden nur weitergeleitet, und externe Requests widersprechen den Projektregeln.

## Einrichtung bei ALL-INKL (KAS)

1. **Domain-Ordner:** `fixit247.at` in KAS unter Domain auf einen Unterordner zeigen lassen, z. B. `/fixit247.at/`, nicht auf `/`. Die Konfiguration liegt eine Ebene über dem Webroot, also im Hauptverzeichnis des Accounts (`/www/htdocs/<KAS-Login>/`). Nur dort darf PHP lesen und schreiben (`open_basedir`). Zeigt die Domain auf `/`, liest PHP die Konfiguration nicht: keine Partnerliste, kein KI-Schlüssel, kein Ordner `fixit247-daten/`. Mails gingen dann trotzdem mit den Standardadressen hinaus.
2. **PHP:** für die Domain PHP 8.1 oder neuer wählen (`mbstring` und `curl` sind dabei).
3. **SSL:** in KAS unter SSL-Schutz ein Let’s-Encrypt-Zertifikat für `fixit247.at` **und** `www.fixit247.at` anlegen. `public/.htaccess` leitet http und www auf `https://fixit247.at` um. Ohne Zertifikat für www scheitert der Aufruf mit www schon am Zertifikat, bevor die Weiterleitung greift.
4. **Postfach:** `support@fixit247.at` anlegen. Diese Adresse ist im Code Standard für Empfänger und Absender (`EMPFAENGER` in `anfrage.php`), sie bekommt die Anfragen und Rückläufer.
5. **Hochladen:** `npm run build`, dann den Inhalt von `dist/` (auch die unsichtbare `.htaccess`) per FTP in den Domain-Ordner. Die FTP-Zugangsdaten stehen in KAS unter FTP.
6. **Konfiguration:** ins Hauptverzeichnis des Accounts, also neben den Domain-Ordner, `fixit247-konfig.php` legen. Sie gehört nicht ins Repo (`.gitignore`):

   ```php
   <?php
   return [
     'openai_key' => 'sk-…',  // nur hier, nie in einer VITE_-Variable
     'partner'    => [],        // Partnerbetriebe für das Matching, Felder siehe anfrage.php
     // 'empfaenger' => 'support@fixit247.at, office@fixit247.at',  // optional, mehrere mit Komma
     // 'absender'   => 'support@fixit247.at',                      // optional, immer @fixit247.at
     // 'modell'     => 'gpt-6-luna',                               // optional
   ];
   ```

   PHP legt daneben beim ersten Aufruf den Ordner `fixit247-daten/` an. Statt `openai_key` geht auch die Umgebungsvariable `OPENAI_API_KEY`.
7. **Prüfen:**
   - `http://www.fixit247.at/` landet mit einer Weiterleitung auf `https://fixit247.at/`.
   - Eine echte Anfrage über das Formular und eine über Luna mit der eigenen E-Mail-Adresse schicken. Die Mail an `support@fixit247.at` und die Bestätigung kommen an (auch im Spam-Ordner nachsehen), die Anfrage steht in `fixit247-daten/anfragen-*.jsonl`.
   - Eine Test-Bewerbung über `/partner-werden/` mit der eigenen Adresse schicken: Mail mit Prüfliste und Bestätigung kommen an, die Bewerbung steht in `fixit247-daten/partner-*.jsonl`.
   - Zeigt die Seite den Sendefehler, im PHP-Fehlerprotokoll nach `mail() an … abgelehnt` suchen. Lokal geprüft ist `mail()` nur gegen einen SMTP-Empfänger. Ob ALL-INKL den Envelope-Absender `-f support@fixit247.at` annimmt, zeigt erst dieser Test.

## Speicherung, Doppelsendung, Kontingent

Alles als Datei in `fixit247-daten/`, keine Datenbank nötig.

- `anfragen-JJJJ-MM.jsonl`: eine Zeile je Anfrage, geschrieben vor dem Mailversand. Geht die Mail verloren, bleibt die Anfrage hier. Scheitert die Mail an fixit247, sieht der Kunde den Sendefehler und ruft an.
- `partner-JJJJ-MM.jsonl`: eine Zeile je Partner-Bewerbung mit Status `PENDING`, nur die geprüften Felder, geschrieben vor der Mail an fixit247. Die Mail enthält eine Prüfliste und den fertigen Eintrag für `'partner'` in der Konfiguration. Die Partnerliste selbst ändert nur ein Mensch.
- `doppelt/<Id>.json`: gleiche `anfrageId` bzw. `bewerbungId` innerhalb von 10 Minuten wird nicht noch einmal verschickt.
- `kontingent-anfrage.json`, `kontingent-chat.json`, `kontingent-partner.json`: je IP und 6 Stunden höchstens 30 Anfragen, 120 KI-Aufrufe bzw. 5 Partner-Bewerbungen. Die IP wird nur als Hash gespeichert, IPv6 je /64.
- **MySQL (Option, nicht gebaut):** nur sinnvoll, wenn Anfragen ausgewertet werden sollen. Dann in `anfrageEingang()` statt der `.jsonl`-Zeile ein `INSERT` per PDO in eine Tabelle `anfragen` (Zeit, Anfrage-ID, Felder, Match). Zugangsdaten in die Konfiguration.

## Lokal

- `npm run dev`, `npm run preview` und die Playwright-Tests nutzen die Attrappen aus `tools/lokale-api.ts` für `/api/anfrage` und `/api/chat`.
- Mit den echten PHP-Endpunkten: `npm run build`, dann

  ```bash
  FIXIT247_KONFIG=/pfad/konfig.php php -S 127.0.0.1:8085 -t dist tools/php-router.php
  ```

  Der Router leitet `/api/anfrage` und `/api/chat` an die PHP-Dateien. Mit `'mail_ordner' => '/pfad/mails'` in der lokalen Konfiguration landen Mails als `.eml` dort statt bei `mail()`. Für echte KI `OPENAI_API_KEY` in der Shell setzen.
- `src/luna/backend.test.ts` prüft die Kopien in `_basis.php` und `_wissen.php` immer gegen `src/content`. Mit PHP im PATH zusätzlich Eingangsprüfung, Systemprompt, Matching, Kontingent, Partner-Bewerbung und beide Endpunkte über `php -S`. `npm run test:ki` schickt etwa zehn Fragen über `php -S` und `chat.php` an das echte Modell.
- PHP unter Windows: `winget install --id PHP.PHP.8.4 -e`, dann im PHP-Ordner `php.ini-development` nach `php.ini` kopieren und `extension_dir = "ext"`, `extension=curl`, `extension=mbstring`, `extension=openssl` aktivieren.
- PHP unter Windows kennt keine Stammzertifikate. curl bricht dann jede HTTPS-Verbindung zu OpenAI ab („unable to get local issuer certificate“), und Luna antwortet ohne KI. `npm run test:ki` gibt PHP deshalb die Stammzertifikate von Node mit. Für `php -S` von Hand einmal `node -e "require('fs').writeFileSync('ca.pem', require('tls').rootCertificates.join('\n'))"` und dann `php -d curl.cainfo=ca.pem -S …`. Beim Hoster (Linux) ist das nicht nötig.

## Offen

Was vor dem Livegang noch fehlt, steht als Checkliste in `docs/livegang.md`. Technisch offen:

- MySQL ja oder nein: Standard ist die Datei (siehe oben).
- `/.well-known/security.txt` (Bauplan M11) entsteht beim Build, sobald die echte E-Mail-Adresse in `src/content/contact.ts` steht. Sie läuft knapp ein Jahr nach dem Build ab (`Expires`): mindestens einmal im Jahr neu bauen und hochladen. Nach dem ersten Upload mit `curl -I https://fixit247.at/.well-known/security.txt` prüfen, ob Status 200 und `text/plain` kommen.
- Steht beim Hoster ein Proxy vor PHP, ist `REMOTE_ADDR` für alle gleich und das Kontingent gilt dann für alle Kunden gemeinsam. Nach der Einrichtung prüfen.

## Folgen für den Code

- `tools/apps-script.gs` und `tools/apps-script-chat.gs` sind entfernt. Systemprompt, Werkzeug „erfassen“, Eingangsprüfung, Honigtopf, Matching und Kundenbestätigung stehen jetzt in `public/chat.php` und `public/anfrage.php`.
- Partner-Bewerbungen (`art=partner`) kommen vom Formular auf `/partner-werden/` (`src/lib/bewerbung.ts`) und laufen in `anfrage.php` durch `partnerEingang()`: Prüfung, Speicherung mit `PENDING`, Mail an fixit247, Bestätigung an den Betrieb ohne Freitext. Kein Matching, keine KI, die Partnerliste wird nie automatisch geändert.
- Keine `VITE_`-Variable enthält einen Geheimwert.
- Unterseiten liegen als `impressum/index.html` usw. in `dist/`. `/impressum` funktioniert damit auf jedem Webserver ohne `.htaccess` (Audit vom 15.10.2026, Befund H2).
