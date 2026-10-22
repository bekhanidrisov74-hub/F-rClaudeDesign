<?php
/* Gemeinsames für anfrage.php und chat.php: Kopien aus src/content, Konfiguration, Datenordner, Kontingent, JSON-Antwort.
   Direkt aufgerufen gibt die Datei nichts aus. Braucht PHP ab 8.1 mit mbstring (chat.php zusätzlich curl).

   Konfiguration: eine PHP-Datei, die ein Array zurückgibt (Aufbau in docs/hosting.md). Standard ist
   fixit247-konfig.php eine Ebene über dieser Datei, also außerhalb des Webroots. Lokal und in Tests zeigt die
   Umgebungsvariable FIXIT247_KONFIG auf eine andere Datei. Anfragen, Doppelsendungen und Kontingent liegen im
   Ordner fixit247-daten neben der Konfiguration. */

date_default_timezone_set('Europe/Vienna');
/* Keine PHP-Version in den Antworten (expose_php ist beim Hoster nicht unsere Einstellung). Audit-Befund N4. */
header_remove('X-Powered-By');

/* Kopien aus src/content/gewerke.ts und src/content/contact.ts, als JSON. src/luna/backend.test.ts schlägt an,
   wenn sie von der Website-Quelle abweichen. */
const GEWERKE = '[
  {"id":"installateur","name":"Installateur","min":95,"max":140,"unit":"stunde","anfahrt":29.9},
  {"id":"shk","name":"Heizung & Klima","min":95,"max":140,"unit":"stunde","anfahrt":29.9},
  {"id":"schluessel","name":"Schlüsseldienst","min":80,"max":180,"unit":"einsatz","anfahrt":19.9},
  {"id":"elektro","name":"Elektro","min":90,"max":140,"unit":"stunde","anfahrt":29.9},
  {"id":"geraete","name":"Haushaltsgeräte","min":90,"max":130,"unit":"stunde","anfahrt":29.9}
]';
const KONTAKT = '{"telefon":"[Telefonnummer]","whatsapp":"[WhatsApp-Nummer]","email":"[E-Mail-Adresse]"}';

function gewerke(): array { return json_decode(GEWERKE, true); }
function kontakt(): array { return json_decode(KONTAKT, true); }

function konfigPfad(): string { return getenv('FIXIT247_KONFIG') ?: dirname(__DIR__) . '/fixit247-konfig.php'; }

function konfig(): array {
  static $k = null;
  return $k ??= is_file(konfigPfad()) ? require konfigPfad() : [];
}

/* Datenordner (außerhalb des Webroots), wird beim ersten Aufruf angelegt. */
function daten(string $unterordner = ''): string {
  $pfad = dirname(konfigPfad()) . '/fixit247-daten' . ($unterordner === '' ? '' : "/$unterordner");
  if (!is_dir($pfad)) @mkdir($pfad, 0700, true);
  return $pfad;
}

/* Kontingent je IP und 6-Stunden-Fenster gegen Missbrauch der öffentlichen URL. Gespeichert wird nur ein Hash
   der IP (IPv6 je /64, sonst wechselt ein Anschluss die Adresse beliebig). flock schützt den Zähler vor parallelen
   Aufrufen. Ist die Datei nicht beschreibbar, gilt das Kontingent als frei: Anfragen gehen vor.
   ponytail: REMOTE_ADDR ungeprüft. Steht beim Hoster ein Proxy davor, zählen alle Kunden gemeinsam. */
function kontingentFrei(string $name, int $grenze): bool {
  $f = @fopen(daten() . "/kontingent-$name.json", 'c+');
  if (!$f) return true;
  try {
    if (!flock($f, LOCK_EX)) return true;
    $fenster = intdiv(time(), 21600);
    $z = json_decode(stream_get_contents($f), true);
    if (($z['fenster'] ?? null) !== $fenster) $z = ['fenster' => $fenster, 'ip' => []];
    $ip = @inet_pton($_SERVER['REMOTE_ADDR'] ?? '') ?: '';
    $schluessel = hash('sha256', strlen($ip) === 16 ? substr($ip, 0, 8) : $ip);
    $n = $z['ip'][$schluessel] = ($z['ip'][$schluessel] ?? 0) + 1;
    ftruncate($f, 0);
    rewind($f);
    fwrite($f, json_encode($z));
    return $n <= $grenze;
  } finally {
    fclose($f);
  }
}

function antwort(array $daten): never {
  header('Content-Type: application/json; charset=utf-8');
  header('Cache-Control: no-store');
  echo json_encode($daten, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
  exit;
}
