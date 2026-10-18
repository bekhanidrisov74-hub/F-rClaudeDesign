# Hosting und Backend

Stand: 18.10.2026

## Entscheidung

- **Hosting:** ALL-INKL.COM, Domain `fixit247.at` (ohne www, `DOMAIN` in `src/content/contact.ts`). Webspace, PHP, Postfächer und Domain liegen dort in einem Paket. Hochgeladen wird der Inhalt von `dist/` nach `npm run build`.
- **Mail:** PHP `mail()` über die Mailserver von ALL-INKL. SPF und DKIM für diese Server legt ALL-INKL automatisch an, SMTP ist nicht nötig. Absender (`-f` und `From`) ist eine Adresse von `fixit247.at`, damit Envelope- und sichtbarer Absender zur selben Domain gehören (Vorgabe von ALL-INKL wegen DMARC).
- **Backend:** PHP-Dateien auf dem Webspace statt Google Apps Script (gebaut am 16.10.2026). Sie liegen in `public/` und kommen mit `npm run build` nach `dist/`:
  - `anfrage.php` nimmt Formular und Luna entgegen, speichert die Anfrage als Datei und verschickt die Mails.
  - `chat.php` leitet Lunas KI-Anfragen an OpenAI weiter. Der Schlüssel liegt nur auf dem Server.
  - `_basis.php` enthält das Gemeinsame (Kopien aus `src/content`, Konfiguration, Kontingent). Direkt aufgerufen gibt sie nichts aus.
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
   - Zeigt die Seite den Sendefehler, im PHP-Fehlerprotokoll nach `mail() an … abgelehnt` suchen. Lokal geprüft ist `mail()` nur gegen einen SMTP-Empfänger. Ob ALL-INKL den Envelope-Absender `-f support@fixit247.at` annimmt, zeigt erst dieser Test.

## Speicherung, Doppelsendung, Kontingent

Alles als Datei in `fixit247-daten/`, keine Datenbank nötig.

- `anfragen-JJJJ-MM.jsonl`: eine Zeile je Anfrage, geschrieben vor dem Mailversand. Geht die Mail verloren, bleibt die Anfrage hier. Scheitert die Mail an fixit247, sieht der Kunde den Sendefehler und ruft an.
- `doppelt/<anfrageId>.json`: gleiche `anfrageId` innerhalb von 10 Minuten wird nicht noch einmal verschickt.
- `kontingent-anfrage.json`, `kontingent-chat.json`: je IP und 6 Stunden höchstens 30 Anfragen bzw. 120 KI-Aufrufe. Die IP wird nur als Hash gespeichert, IPv6 je /64.
- **MySQL (Option, nicht gebaut):** nur sinnvoll, wenn Anfragen ausgewertet werden sollen. Dann in `anfrageEingang()` statt der `.jsonl`-Zeile ein `INSERT` per PDO in eine Tabelle `anfragen` (Zeit, Anfrage-ID, Felder, Match). Zugangsdaten in die Konfiguration.

## Lokal

- `npm run dev`, `npm run preview` und die Playwright-Tests nutzen die Attrappen aus `tools/lokale-api.ts` für `/api/anfrage` und `/api/chat`.
- Mit den echten PHP-Endpunkten: `npm run build`, dann

  ```bash
  FIXIT247_KONFIG=/pfad/konfig.php php -S 127.0.0.1:8085 -t dist tools/php-router.php
  ```

  Der Router leitet `/api/anfrage` und `/api/chat` an die PHP-Dateien. Mit `'mail_ordner' => '/pfad/mails'` in der lokalen Konfiguration landen Mails als `.eml` dort statt bei `mail()`. Für echte KI `OPENAI_API_KEY` in der Shell setzen.
- `src/luna/backend.test.ts` prüft die Kopien in `_basis.php` immer gegen `src/content`. Mit PHP im PATH zusätzlich Eingangsprüfung, Systemprompt, Matching, Kontingent und beide Endpunkte über `php -S`.
- PHP unter Windows: `winget install --id PHP.PHP.8.4 -e`, dann im PHP-Ordner `php.ini-development` nach `php.ini` kopieren und `extension_dir = "ext"`, `extension=curl`, `extension=mbstring`, `extension=openssl` aktivieren.

## Offen

Was vor dem Livegang noch fehlt, steht als Checkliste in `docs/livegang.md`. Technisch offen:

- MySQL ja oder nein: Standard ist die Datei (siehe oben).
- Steht beim Hoster ein Proxy vor PHP, ist `REMOTE_ADDR` für alle gleich und das Kontingent gilt dann für alle Kunden gemeinsam. Nach der Einrichtung prüfen.

## Folgen für den Code

- `tools/apps-script.gs` und `tools/apps-script-chat.gs` sind entfernt. Systemprompt, Werkzeug „erfassen“, Eingangsprüfung, Honigtopf, Matching und Kundenbestätigung stehen jetzt in `public/chat.php` und `public/anfrage.php`.
- Die Partneranfrage (`art=partner`) des Apps Scripts ist nicht übernommen, die Website hat kein Partnerformular.
- Keine `VITE_`-Variable enthält einen Geheimwert.
- Unterseiten liegen als `impressum/index.html` usw. in `dist/`. `/impressum` funktioniert damit auf jedem Webserver ohne `.htaccess` (Audit vom 15.10.2026, Befund H2).
