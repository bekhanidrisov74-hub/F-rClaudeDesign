// Lokale API für `npm run dev`, `npm run preview` und die Playwright-Tests (Vite-Plugin, siehe vite.config.ts).
// Live übernehmen die Google-Apps-Script-Web-Apps (tools/apps-script.gs, tools/apps-script-chat.gs).
//   POST /api/anfrage  Attrappe des Anfrage-Eingangs: prüft die Pflichtfelder, antwortet { ok: true, match: 'FOUND' }.
//                      Steht ?fehler=1 in der Adresse der Seite, antwortet sie mit HTTP 500 (Sendefehler testen).
//   POST /api/chat     Attrappe des KI-Backends: das Werkzeug „erfassen“ ohne Felder, Luna läuft mit den lokalen Regeln.
//                      Mit OPENAI_API_KEY in der Umgebung (node --env-file=.env tools/server.mjs 8080) echt an OpenAI,
//                      mit Systemprompt, Werkzeug und Eingangsprüfung aus tools/apps-script-chat.gs (keine zweite Fassung).
//                      Vite lädt .env nicht in process.env: `npm run preview` und die Tests bleiben bei der Attrappe.
import { readFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

export interface ChatBackend {
  SERVICES: { id: string; name: string; min: number; max: number; unit: string; anfahrt: number }[]
  KONTAKT: Record<string, string>
  MODELL: string
  MAX_BODY: number
  systemPrompt: (state: unknown) => string
  pruefe: (messages: unknown, state: unknown) => boolean
  openAiAnfrage: (messages: unknown[], state: unknown, model: string) => object
}

/** Lädt die Apps-Script-Datei. ponytail: plain JS mit globalen var/function, Function() reicht. */
export const ladeChatBackend = (): ChatBackend =>
  new Function(`${readFileSync('tools/apps-script-chat.gs', 'utf8')}; return { SERVICES, KONTAKT, MODELL, MAX_BODY, systemPrompt, pruefe, openAiAnfrage }`)()

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

/** Antwort in der Form der echten API (Chat Completions, erzwungenes Werkzeug) */
const werkzeug = (args: object) => ({
  role: 'assistant',
  content: null,
  tool_calls: [{ id: 'call_1', type: 'function', function: { name: 'erfassen', arguments: JSON.stringify(args) } }],
})

async function chat(req: IncomingMessage, res: ServerResponse) {
  const body = await lies(req)
  const schluessel = process.env.OPENAI_API_KEY
  if (body === null) return json(res, 200, { error: 'bad_request' })
  if (!schluessel) return json(res, 200, { message: werkzeug({}) })

  const gs = ladeChatBackend()
  const { messages, state } = JSON.parse(body) as { messages?: unknown; state?: unknown }
  if (!gs.pruefe(messages, state)) return json(res, 200, { error: 'bad_request' })
  const antwort = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${schluessel}` },
    body: JSON.stringify(gs.openAiAnfrage(messages as unknown[], state ?? {}, process.env.OPENAI_MODEL || gs.MODELL)),
  })
  if (!antwort.ok) {
    console.error('[OpenAI]', antwort.status, (await antwort.text()).slice(0, 300))
    return json(res, 200, { error: 'upstream' })
  }
  const daten = (await antwort.json()) as { choices: { message: unknown }[] }
  json(res, 200, { message: daten.choices[0].message })
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
