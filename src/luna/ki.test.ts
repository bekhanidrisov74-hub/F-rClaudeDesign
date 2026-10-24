import { afterEach, expect, test, vi } from 'vitest'
import { erfasseUeberApi } from './ki'
import type { KiZustand } from './flow'

const ZUSTAND: KiZustand = { category: null, urgency: null, postalCode: null, answers: {}, pending: null, questions: [], phase: 'INITIAL', match: null }
const VERLAUF = [{ role: 'user' as const, content: 'Heizung kalt' }]
const werkzeug = (args: string, name = 'erfassen') => ({ message: { role: 'assistant', tool_calls: [{ type: 'function', function: { name, arguments: args } }] } })

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

test('lokal: POST an /api/chat als text/plain mit Seite und Zuschlag, Argumente von „erfassen“', async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-25T22:00:00+01:00')) // Sonntag 22 Uhr in Wien
  vi.stubGlobal('location', { hostname: 'localhost', pathname: '/heizung-klima/' })
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(werkzeug('{"absicht":"anliegen","category":"shk"}'))))
  vi.stubGlobal('fetch', fetchMock)
  expect(await erfasseUeberApi(VERLAUF, ZUSTAND)).toEqual({ absicht: 'anliegen', category: 'shk' })
  const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
  expect(url).toBe('/api/chat')
  expect(init.headers).toBeUndefined()
  expect(JSON.parse(init.body as string)).toEqual({ messages: VERLAUF, state: { ...ZUSTAND, seite: '/heizung-klima/', zuschlag: ['sonntag', 'nacht'] } })
})

test('fremde Adresse (404-Seite): ohne Seite, damit chat.php die Anfrage nicht ablehnt', async () => {
  vi.stubGlobal('location', { hostname: 'localhost', pathname: '/Über-uns' })
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(werkzeug('{}'))))
  vi.stubGlobal('fetch', fetchMock)
  await erfasseUeberApi(VERLAUF, ZUSTAND)
  expect(JSON.parse((fetchMock.mock.calls[0] as [string, RequestInit])[1].body as string).state).not.toHaveProperty('seite')
})

test.each([
  ['Kontingent', { error: 'limit' }],
  ['anderes Werkzeug', werkzeug('{"category":"shk"}', 'chatten')],
  ['kaputtes JSON', werkzeug('{category')],
  ['freier Text statt Werkzeug', { message: { role: 'assistant', content: 'Hallo!' } }],
])('%s → null (Ausfall)', async (_, antwort) => {
  vi.stubGlobal('location', { hostname: 'localhost', pathname: '/' })
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(antwort))))
  expect(await erfasseUeberApi(VERLAUF, ZUSTAND)).toBeNull()
})

test('nicht erreichbar oder Timeout → null; Timeout 18 s', async () => {
  vi.stubGlobal('location', { hostname: 'localhost', pathname: '/' })
  const timeout = vi.spyOn(AbortSignal, 'timeout')
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Zeit abgelaufen', 'TimeoutError')))
  expect(await erfasseUeberApi(VERLAUF, ZUSTAND)).toBeNull()
  expect(timeout).toHaveBeenCalledWith(18_000)
})

test('live ohne VITE_CHAT_ENDPOINT: keine Anfrage, null', async () => {
  vi.stubGlobal('location', { hostname: 'www.fixit247.at', pathname: '/' })
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  expect(await erfasseUeberApi(VERLAUF, ZUSTAND)).toBeNull()
  expect(fetchMock).not.toHaveBeenCalled()
})
