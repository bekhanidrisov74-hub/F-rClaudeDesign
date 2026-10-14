// Lokale API für `npm run dev`, `npm run preview` und die Playwright-Tests (Vite-Plugin, siehe vite.config.ts).
// Live übernehmen die Google-Apps-Script-Web-Apps (tools/apps-script.gs, tools/apps-script-chat.gs).
//   POST /api/anfrage  Attrappe des Anfrage-Eingangs: prüft die Pflichtfelder, antwortet { ok: true, match: 'FOUND' }.
//                      Steht ?fehler=1 in der Adresse der Seite, antwortet sie mit HTTP 500 (Sendefehler testen).
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

export function lokaleApi(): Plugin {
  const routen: Record<string, (req: IncomingMessage, res: ServerResponse) => Promise<void>> = { '/api/anfrage': anfrage }
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
