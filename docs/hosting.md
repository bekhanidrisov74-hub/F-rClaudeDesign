# Hosting und Backend

Stand: 15.10.2026

## Entscheidung

- **Hosting:** Webspace eines „All-inclusive“-Hosters (Name noch offen). Hochgeladen wird der Inhalt von `dist/` nach `npm run build`.
- **Backend:** Google Apps Script wird ersetzt durch PHP-Dateien auf dem Webspace:
  - `anfrage.php` nimmt das Formular entgegen und verschickt die Mail (optional Speicherung in MySQL).
  - `chat.php` leitet Lunas KI-Anfragen an OpenAI weiter. Der Schlüssel liegt nur auf dem Server.
- **Endpunkte:** `VITE_FORM_ENDPOINT` und `VITE_CHAT_ENDPOINT` zeigen auf die eigene Domain, z. B. `https://<domain>/anfrage.php`. Gleiche Herkunft, also keine CORS-Probleme.
- **Nicht gewählt:** Supabase. Begründung in der Konversation: Anfragen werden nur weitergeleitet, und externe Requests widersprechen den Projektregeln.

## Offen

- Name des Hosters und ob PHP sowie MySQL im Paket enthalten sind.
- Versand per PHP-`mail()` zuverlässig? Oder SMTP nötig? Im Hoster-FAQ prüfen.
- Ob Anfragen zusätzlich in MySQL gespeichert werden sollen.
- `.htaccess` für saubere URLs (`/impressum` usw.), sobald der Hoster bekannt ist (Apache oder LiteSpeed).
- Datenschutz: Auftragsverarbeitung mit dem Hoster und Eintrag der Mail-Verarbeitung in der Datenschutzerklärung.

## Folgen für den Code

- `tools/apps-script.gs` und `tools/apps-script-chat.gs` entfallen, sobald die PHP-Endpunkte laufen.
- `src/luna/backend.test.ts` prüft derzeit die `.gs`-Kopien gegen `src/content/gewerke.ts`. Diese Prüfung muss auf die PHP-Dateien umziehen oder ersatzlos fallen.
- Lokal bleiben `tools/lokale-api.ts` und `tools/server.mjs` mit den Attrappen für `/api/anfrage` und `/api/chat`.
- Keine `VITE_`-Variable enthält einen Geheimwert.
