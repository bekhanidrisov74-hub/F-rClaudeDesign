import { afterEach, expect, test, vi } from 'vitest'
import { erfasseUeberApi } from './ki'

const ZUSTAND = { category: null, urgency: null, postalCode: null, answers: {}, pending: null, questions: [] }
const VERLAUF = [{ role: 'user' as const, content: 'Heizung kalt' }]
const werkzeug = (args: string, name = 'erfassen') => ({ message: { role: 'assistant', tool_calls: [{ type: 'function', function: { name, arguments: args } }] } })

afterEach(() => vi.unstubAllGlobals())

test('lokal: POST an /api/chat als text/plain, Argumente von „erfassen“', async () => {
  vi.stubGlobal('location', { hostname: 'localhost' })
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(werkzeug('{"category":"shk"}'))))
  vi.stubGlobal('fetch', fetchMock)
  expect(await erfasseUeberApi(VERLAUF, ZUSTAND)).toEqual({ category: 'shk' })
  const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
  expect(url).toBe('/api/chat')
  expect(init.headers).toBeUndefined()
  expect(JSON.parse(init.body as string)).toEqual({ messages: VERLAUF, state: ZUSTAND })
})

test.each([
  ['Kontingent', { error: 'limit' }],
  ['anderes Werkzeug', werkzeug('{"category":"shk"}', 'chatten')],
  ['kaputtes JSON', werkzeug('{category')],
  ['freier Text statt Werkzeug', { message: { role: 'assistant', content: 'Hallo!' } }],
])('%s → leeres Objekt', async (_, antwort) => {
  vi.stubGlobal('location', { hostname: 'localhost' })
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(antwort))))
  expect(await erfasseUeberApi(VERLAUF, ZUSTAND)).toEqual({})
})

test('nicht erreichbar oder Timeout → leeres Objekt; Timeout 12 s', async () => {
  vi.stubGlobal('location', { hostname: 'localhost' })
  const timeout = vi.spyOn(AbortSignal, 'timeout')
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Zeit abgelaufen', 'TimeoutError')))
  expect(await erfasseUeberApi(VERLAUF, ZUSTAND)).toEqual({})
  expect(timeout).toHaveBeenCalledWith(12_000)
})

test('live ohne VITE_CHAT_ENDPOINT: keine Anfrage', async () => {
  vi.stubGlobal('location', { hostname: 'www.fixit247.at' })
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  expect(await erfasseUeberApi(VERLAUF, ZUSTAND)).toEqual({})
  expect(fetchMock).not.toHaveBeenCalled()
})
