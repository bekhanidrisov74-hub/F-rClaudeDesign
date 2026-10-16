<?php
/* Gebaute Seite lokal mit den echten PHP-Endpunkten: php -S 127.0.0.1:8085 -t dist tools/php-router.php
   Auf localhost schickt die Website an /api/anfrage und /api/chat (src/lib/endpunkte.ts), hier landen sie bei
   anfrage.php und chat.php. Alles andere liefert php -S als Datei aus. Konfiguration über FIXIT247_KONFIG. */
$ziel = ['/api/anfrage' => 'anfrage.php', '/api/chat' => 'chat.php'][parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH)] ?? null;
if ($ziel === null) return false;
require $_SERVER['DOCUMENT_ROOT'] . '/' . $ziel;
