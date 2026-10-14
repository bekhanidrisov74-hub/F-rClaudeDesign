import { afterEach, describe, expect, test, vi } from 'vitest'
import { buildPayload, submitLead, zufallsnummer, type Lead } from './submitLead'

const LEAD: Lead = {
  anfrageId: 'F247-ABCDEF',
  name: 'Maria Huber',
  tel: '0664 1234567',
  email: '',
  plz: '1020',
  ort: 'Wien',
  kategorie: 'installateur',
  bereich: 'Installateur',
  dringlichkeit: 'ACUTE',
  wunschtermin: '',
  text: 'Wasser tritt aus',
  antworten: { was: 'Wasser tritt aus', wo: '' },
}

const antwort = (inhalt: unknown, status = 200) => vi.fn().mockResolvedValue(new Response(JSON.stringify(inhalt), { status }))

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

test('Anfrage-Id im Format F247-XXXXXX', () => {
  for (let i = 0; i < 50; i++) expect(zufallsnummer()).toMatch(/^F247-[A-Z0-9]{6}$/)
})

test('Payload: alle Felder laut Aufgabe, Antworten als JSON, Einwilligung', () => {
  const p = buildPayload(LEAD)
  expect([...p.keys()].sort()).toEqual(
    ['art', 'anfrageId', 'name', 'tel', 'email', 'plz', 'ort', 'kategorie', 'bereich', 'dringlichkeit', 'wunschtermin', 'text', 'antworten', 'dsgvo'].sort(),
  )
  expect(p.get('art')).toBe('anfrage')
  expect(p.get('dsgvo')).toBe('on')
  expect(JSON.parse(p.get('antworten')!)).toEqual(LEAD.antworten)
})

describe('Endpunkt nach Hostname', () => {
  test('lokal: Attrappe /api/anfrage, POST als URLSearchParams ohne eigenen Content-Type', async () => {
    vi.stubGlobal('location', { hostname: 'localhost' })
    vi.stubEnv('VITE_FORM_ENDPOINT', 'https://script.google.com/echt')
    const fetchMock = antwort({ ok: true, match: 'FOUND' })
    vi.stubGlobal('fetch', fetchMock)
    expect(await submitLead(LEAD)).toBe('FOUND')
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/anfrage')
    expect(init.method).toBe('POST')
    expect(init.body).toBeInstanceOf(URLSearchParams)
    expect(init.headers).toBeUndefined()
  })

  test('live: VITE_FORM_ENDPOINT; ohne Variable schlägt das Senden fehl', async () => {
    vi.stubGlobal('location', { hostname: 'www.fixit247.at' })
    vi.stubEnv('VITE_FORM_ENDPOINT', 'https://script.google.com/echt')
    const fetchMock = antwort({ ok: true, match: 'NONE' })
    vi.stubGlobal('fetch', fetchMock)
    expect(await submitLead(LEAD)).toBe('NONE')
    expect(fetchMock.mock.calls[0][0]).toBe('https://script.google.com/echt')
    vi.stubEnv('VITE_FORM_ENDPOINT', '')
    await expect(submitLead(LEAD)).rejects.toThrow()
  })
})

describe('Nur { ok: true, match } gilt als Erfolg', () => {
  test.each([
    ['ok false', { ok: false, error: 'limit' }],
    ['ohne match', { ok: true }],
    ['fremdes match', { ok: true, match: 'MAYBE' }],
    ['altes Format', { anfragenummer: 'F247-SERVER' }],
  ])('%s', async (_, inhalt) => {
    vi.stubGlobal('location', { hostname: 'localhost' })
    vi.stubGlobal('fetch', antwort(inhalt))
    await expect(submitLead(LEAD)).rejects.toThrow()
  })

  test('HTTP-Fehler und Text statt JSON', async () => {
    vi.stubGlobal('location', { hostname: 'localhost' })
    vi.stubGlobal('fetch', antwort({ ok: true, match: 'FOUND' }, 500))
    await expect(submitLead(LEAD)).rejects.toThrow()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('OK')))
    await expect(submitLead(LEAD)).rejects.toThrow()
  })

  test('Timeout nach 20 s', async () => {
    vi.stubGlobal('location', { hostname: 'localhost' })
    const timeout = vi.spyOn(AbortSignal, 'timeout')
    vi.stubGlobal('fetch', antwort({ ok: true, match: 'FOUND' }))
    await submitLead(LEAD)
    expect(timeout).toHaveBeenCalledWith(20_000)
  })
})
