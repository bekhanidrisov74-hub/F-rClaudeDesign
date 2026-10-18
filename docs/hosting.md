# Hosting und Backend

Stand: 16.10.2026

## Entscheidung

- **Hosting:** Webspace eines „All-inclusive“-Hosters (Name noch offen). Hochgeladen wird der Inhalt von `dist/` nach `npm run build`.
- **Backend:** PHP-Dateien auf dem Webspace statt Google Apps Script (gebaut am 16.10.2026). Sie liegen in `public/` und kommen mit `npm run build` nach `dist/`:
  - `anfrage.php` nimmt Formular und Luna entgegen, speichert die Anfrage als Datei und verschickt die Mails.
  - `chat.php` leitet Lunas KI-Anfragen an OpenAI weiter. Der Schlüssel liegt nur auf dem Server.
  - `_basis.php` enthält das Gemeinsame (Kopien aus `src/content`, Konfiguration, Kontingent). Direkt aufgerufen gibt sie nichts aus.
- **Endpunkte:** `VITE_FORM_ENDPOINT=/anfrage.php` und `VITE_CHAT_ENDPOINT=/chat.php` stehen in `.env.production` und gelten für jeden `npm run build`. Abweichend nur in `.env.production.local`. Gleiche Herkunft, also keine CORS-Probleme.
- **Nicht gewählt:** Supabase. Begründung in der Konversation: Anfragen werden nur weitergeleitet, und externe Requests widersprechen den Projektregeln.

## Einrichtung beim Hoster

1. PHP ab 8.1 mit `mbstring` und `curl` (bei Webhostern Standard).
2. `dist/` in den Webroot hochladen.
3. Eine Ebene über dem Webroot `fixit247-konfig.php` anlegen. Sie gehört nicht ins Repo (`.gitignore`):

   ```php
   <?php
   return [
     'openai_key' => 'sk-…',                  // nur hier, nie in einer VITE_-Variable
     'empfaenger' => 'support@fixit247.at',   // mehrere mit Komma trennen
     'absender'   => 'website@<domain>',      // Postfach der eigenen Domain (SPF/DKIM)
     'partner'    => [],                      // Partnerbetriebe für das Matching, Felder siehe anfrage.php
     // 'modell' => 'gpt-6-luna',             // optional
   ];
   ```

   Ohne Elternordner (z. B. `open_basedir` nur auf den Webroot) die Datei an einen anderen Ort außerhalb des Webroots legen und mit `SetEnv FIXIT247_KONFIG /pfad/zur/fixit247-konfig.php` in der `.htaccess` darauf zeigen. Statt `openai_key` geht auch die Umgebungsvariable `OPENAI_API_KEY`.
4. Neben der Konfiguration legt PHP beim ersten Aufruf den Ordner `fixit247-daten/` an. PHP braucht dort Schreibrecht.
5. Eine echte Testanfrage schicken und prüfen, ob die Mail ankommt (auch im Spam-Ordner) und in `fixit247-daten/anfragen-*.jsonl` steht.

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

- Name des Hosters, PHP-Version und ob MySQL im Paket enthalten ist.
- `mail()` oder SMTP: gebaut ist `mail()`. Verlangt der Hoster SMTP, braucht `sende()` in `anfrage.php` einen SMTP-Versand (z. B. PHPMailer).
- MySQL ja oder nein: Standard ist die Datei (siehe oben).
- Empfängeradresse: Standard `support@fixit247.at` aus dem Apps Script. Dazu die Absenderadresse mit SPF, DKIM und DMARC der eigenen Domain.
- Steht beim Hoster ein Proxy vor PHP, ist `REMOTE_ADDR` für alle gleich und das Kontingent gilt dann für alle Kunden gemeinsam. Nach der Einrichtung prüfen.
- Löschfrist für `anfragen-*.jsonl` festlegen.
- Datenschutz: Auftragsverarbeitung mit dem Hoster, Speicherung der Anfragen und die Weitergabe an OpenAI in der Datenschutzerklärung.
- Monatslimit im OpenAI-Konto setzen. Das Kontingent je IP bremst einzelne Absender, aber keine verteilten Angriffe.

## Folgen für den Code

- `tools/apps-script.gs` und `tools/apps-script-chat.gs` sind entfernt. Systemprompt, Werkzeug „erfassen“, Eingangsprüfung, Honigtopf, Matching und Kundenbestätigung stehen jetzt in `public/chat.php` und `public/anfrage.php`.
- Die Partneranfrage (`art=partner`) des Apps Scripts ist nicht übernommen, die Website hat kein Partnerformular.
- Keine `VITE_`-Variable enthält einen Geheimwert.
- Unterseiten liegen als `impressum/index.html` usw. in `dist/`. `/impressum` funktioniert damit auf jedem Webserver ohne `.htaccess` (Audit vom 15.10.2026, Befund H2).
