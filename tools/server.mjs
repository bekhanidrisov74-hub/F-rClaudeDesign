// Vorschau des Builds mit lokaler API (tools/lokale-api.ts): node tools/server.mjs [port]
// Mit den echten PHP-Endpunkten statt der Attrappen: php -S 127.0.0.1:8085 -t dist tools/php-router.php
import { preview } from 'vite'

const server = await preview({ preview: { port: Number(process.argv[2] ?? 8080), strictPort: true } })
server.printUrls()
