// Lokale API für `npm run dev`, `npm run preview` und die Playwright-Tests (Vite-Plugin, siehe vite.config.ts).
// Live übernehmen public/anfrage.php und public/chat.php. Mit den echten PHP-Endpunkten lokal:
// php -S 127.0.0.1:8085 -t dist tools/php-router.php (siehe docs/hosting.md).
//   POST /api/anfrage  Attrappe des Eingangs (public/anfrage.php). art=anfrage: prüft die Pflichtfelder, antwortet
//                      { ok: true, match: 'FOUND' }. art=partner (Partner-Bewerbung): einfache Prüfung, antwortet
//                      { ok: true }. Sonst HTTP 400 bad_request. Steht ?fehler=1 in der Adresse der Seite, antwortet
//                      sie für beide Arten mit HTTP 500 (Sendefehler testen).
//   POST /api/chat     Attrappe des KI-Backends: das Werkzeug „erfassen“ ohne Felder, Luna läuft mit den lokalen Regeln.
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

const MAX_BODY = 16_000

async function lies(req: IncomingMessage): Promise<string | null> {
  let body = ''
  for await (const teil of req) {
    body += teil
    if (body.length > MAX_BODY) return null
  }
  return body
}

function json(res: ServerResponse, status: number, daten: unknown) {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify(daten))
}

async function anfrage(req: IncomingMessage, res: ServerResponse) {
  if (req.headers.referer?.includes('fehler=1')) return json(res, 500, { ok: false, error: 'upstream' })
  const body = await lies(req)
  const p = new URLSearchParams(body ?? '')
  if (body !== null && p.get('art') === 'partner') return bewerbung(p, res)
  const gueltig =
    body !== null &&
    p.get('art') === 'anfrage' &&
    p.get('dsgvo') === 'on' &&
    /^[A-Za-z0-9-]{6,40}$/.test(p.get('anfrageId') ?? '') &&
    !!p.get('name')?.trim() &&
    !!p.get('tel')?.trim() &&
    /^[1-9]\d{3}$/.test(p.get('plz') ?? '')
  if (!gueltig) return json(res, 400, { ok: false, error: 'bad_request' })
  console.log(`[Anfrage-Attrappe] ${p.get('anfrageId')} ${p.get('kategorie') || '-'} ${p.get('plz')}`)
  json(res, 200, { ok: true, match: 'FOUND' })
}

/** Partner-Bewerbung: nur die Grundprüfung, die genauen Regeln stehen in public/anfrage.php (partnerEingang). */
function bewerbung(p: URLSearchParams, res: ServerResponse) {
  const gueltig =
    p.get('dsgvo') === 'on' &&
    /^[A-Za-z0-9-]{6,40}$/.test(p.get('bewerbungId') ?? '') &&
    !!p.get('firma')?.trim() &&
    !!p.get('tel')?.trim() &&
    !!p.get('email')?.trim() &&
    /^[\d,]+$/.test(p.get('gisa') ?? '') &&
    !!p.get('gewerke') &&
    !!p.get('plz')
  if (!gueltig) return json(res, 400, { ok: false, error: 'bad_request' })
  console.log(`[Bewerbung-Attrappe] ${p.get('bewerbungId')} ${p.get('gewerke')} ${p.get('plz')!.split(',').length} PLZ`)
  json(res, 200, { ok: true })
}

/** Antwort in der Form der echten API (Chat Completions, erzwungenes Werkzeug) */
const werkzeug = (args: object) => ({
  role: 'assistant',
  content: null,
  tool_calls: [{ id: 'call_1', type: 'function', function: { name: 'erfassen', arguments: JSON.stringify(args) } }],
})

async function chat(req: IncomingMessage, res: ServerResponse) {
  const body = await lies(req)
  json(res, 200, body === null ? { error: 'bad_request' } : { message: werkzeug({}) })
}

export function lokaleApi(): Plugin {
  const routen: Record<string, (req: IncomingMessage, res: ServerResponse) => Promise<void>> = { '/api/anfrage': anfrage, '/api/chat': chat }
  const middleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const route = req.method === 'POST' ? routen[req.url?.split('?')[0] ?? ''] : undefined
    if (!route) return next()
    route(req, res).catch((fehler: unknown) => {
      console.error('[lokale API]', fehler)
      json(res, 500, { error: 'upstream' })
    })
  }
  return {
    name: 'fixit-lokale-api',
    configureServer: (server) => void server.middlewares.use(middleware),
    configurePreviewServer: (server) => void server.middlewares.use(middleware),
  }
}
