import { afterEach, describe, expect, test, vi } from 'vitest'
import { buildPayload, submitLead, zufallsnummer, type LeadDaten } from './submitLead'

const DATEN: LeadDaten = {
  quelle: 'formular',
  gewerk: 'installateur',
  beschreibung: 'Rohrbruch',
  plz: '1020',
  ort: 'Wien',
  dringlichkeit: null,
  name: 'Maria Huber',
  telefon: '0664 1234567',
  einwilligung: true,
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

test('Payload mit allen Feldern aus SPEC 9 und Zeit in ISO-8601', () => {
  const lead = buildPayload(DATEN, new Date('2026-10-13T08:30:00Z'))
  expect(Object.keys(lead).sort()).toEqual(
    ['quelle', 'gewerk', 'beschreibung', 'plz', 'ort', 'dringlichkeit', 'name', 'telefon', 'einwilligung', 'zeit'].sort(),
  )
  expect(lead.zeit).toBe('2026-10-13T08:30:00.000Z')
})

test('Anfragenummer im Format F247-XXXXXX', () => {
  for (let i = 0; i < 50; i++) expect(zufallsnummer()).toMatch(/^F247-[A-Z0-9]{6}$/)
})

describe('lokaler Ersatz (ohne VITE_LEAD_ENDPOINT)', () => {
  test('meldet nach 800 ms Erfolg', async () => {
    vi.stubEnv('VITE_LEAD_ENDPOINT', '')
    vi.stubGlobal('location', { search: '' })
    vi.useFakeTimers()
    let fertig = false
    const ergebnis = submitLead(DATEN).then((r) => ((fertig = true), r))
    await vi.advanceTimersByTimeAsync(799)
    expect(fertig).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect((await ergebnis).anfragenummer).toMatch(/^F247-[A-Z0-9]{6}$/)
  })

  test('mit ?fehler=1 kommt ein Fehler', async () => {
    vi.stubEnv('VITE_LEAD_ENDPOINT', '')
    vi.stubGlobal('location', { search: '?fehler=1' })
    vi.useFakeTimers()
    const ergebnis = expect(submitLead(DATEN)).rejects.toThrow()
    await vi.advanceTimersByTimeAsync(800)
    await ergebnis
  })
})

describe('mit Endpunkt', () => {
  test('POST als JSON, Nummer vom Server', async () => {
    vi.stubEnv('VITE_LEAD_ENDPOINT', 'https://beispiel.invalid/anfrage')
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ anfragenummer: 'F247-SERVER' }), { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)
    expect(await submitLead(DATEN)).toEqual({ anfragenummer: 'F247-SERVER' })
    const [url, optionen] = fetchMock.mock.calls[0]
    expect(url).toBe('https://beispiel.invalid/anfrage')
    expect(optionen.method).toBe('POST')
    expect(optionen.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(JSON.parse(optionen.body)).toMatchObject({ ...DATEN, zeit: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/) })
  })

  test.each([
    ['HTTP-Fehler', new Response('nein', { status: 500 })],
    ['Antwort ohne Nummer', new Response('{}', { status: 200 })],
  ])('%s wird zum Fehler', async (_, antwort) => {
    vi.stubEnv('VITE_LEAD_ENDPOINT', 'https://beispiel.invalid/anfrage')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(antwort))
    await expect(submitLead(DATEN)).rejects.toThrow()
  })

  test('Netzwerkfehler wird zum Fehler', async () => {
    vi.stubEnv('VITE_LEAD_ENDPOINT', 'https://beispiel.invalid/anfrage')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(submitLead(DATEN)).rejects.toThrow()
  })
})
