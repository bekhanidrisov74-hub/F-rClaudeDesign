import { afterEach, describe, expect, test, vi } from 'vitest'
import plz from '../content/plz.json'
import {
  bewerbungZuPayload,
  gisaZahlen,
  istBetriebsEmail,
  LEERE_BEWERBUNG,
  leseGebiet,
  MAX_PLZ,
  pruefeBewerbung,
  pruefeFeld,
  sendeBewerbung,
  uidNummer,
  type Bewerbung,
} from './bewerbung'
import { zufallsnummer } from './submitLead'

const IDS = ['installateur', 'shk', 'elektro']
const VERZEICHNIS = plz as Record<string, string>
const GUELTIG: Bewerbung = {
  firma: 'Muster Installationen GmbH',
  ansprechperson: 'Maria Huber',
  telefon: '0664 1234567',
  email: 'office@muster.at',
  gisa: '12345678',
  uid: '',
  gewerke: ['installateur', 'shk'],
  plz: '1100, 1110',
  zeiten: ['werktags', 'abends'],
  notdienst: 'ja',
  reaktionszeit: '60',
  richtpreise: 'ja',
  abweichungen: '',
  haftpflicht: 'ja',
  preisVorab: 'ja',
  unbar: 'nein',
  anmerkungen: 'Gasthermen',
  einwilligung: true,
}

afterEach(() => vi.unstubAllGlobals())

describe('GISA-Zahl und UID', () => {
  test.each([
    ['12345678', ['12345678']],
    ['123 456 78', ['12345678']],
    ['12345678, 98765432', ['12345678', '98765432']],
  ])('„%s“', (eingabe, erwartet) => expect(gisaZahlen(eingabe)).toEqual(erwartet))
  test.each(['', '1234', '12345678901', 'GISA 1234567', '12345678, abc'])('„%s“ ist keine GISA-Zahl', (eingabe) => expect(gisaZahlen(eingabe)).toBeNull())

  test('UID optional, sonst ATU und 8 Ziffern', () => {
    expect(uidNummer('')).toBe('')
    expect(uidNummer('atu 1234 5678')).toBe('ATU12345678')
    expect(uidNummer('DE123456789')).toBeNull()
    expect(uidNummer('ATU1234567')).toBeNull()
  })
})

test('E-Mail wie auf dem Server: keine Zeichen, die in mail() stören', () => {
  expect(istBetriebsEmail('office@muster.at')).toBe(true)
  expect(istBetriebsEmail('a,b@muster.at')).toBe(false)
  expect(istBetriebsEmail('office@muster')).toBe(false)
})

describe('Einsatzgebiet', () => {
  test('Liste mit Komma, Leerzeichen und Strichpunkt, sortiert und ohne Doppelte', () => {
    expect(leseGebiet('1110 1100; 1100,1120', VERZEICHNIS)).toEqual({ plz: ['1100', '1110', '1120'], unbekannt: [] })
  })
  test('Bereich 1010–1230 ergibt die 23 Wiener Bezirke', () => {
    const gebiet = leseGebiet('1010–1230', VERZEICHNIS)!
    expect(gebiet.plz).toHaveLength(23)
    expect(gebiet.plz[0]).toBe('1010')
    expect(gebiet.plz.at(-1)).toBe('1230')
    expect(leseGebiet('1010 - 1230', VERZEICHNIS)!.plz).toEqual(gebiet.plz)
  })
  test('unbekannte PLZ werden gemeldet', () => {
    expect(leseGebiet('1100, 1009', VERZEICHNIS)).toEqual({ plz: ['1100'], unbekannt: ['1009'] })
  })
  test.each(['', 'Wien', '110', '1100 Wien', '11000'])('„%s“ ist kein Einsatzgebiet', (eingabe) => expect(leseGebiet(eingabe, VERZEICHNIS)).toBeNull())
  test('ohne Verzeichnis nur das Format', () => {
    expect(leseGebiet('1009', null)).toEqual({ plz: ['1009'], unbekannt: [] })
  })
})

describe('Formular', () => {
  test('leeres Formular: alle Pflichtfelder in Formular-Reihenfolge', () => {
    expect(Object.keys(pruefeBewerbung(LEERE_BEWERBUNG, IDS, VERZEICHNIS))).toEqual([
      'firma',
      'ansprechperson',
      'telefon',
      'email',
      'gisa',
      'gewerke',
      'plz',
      'zeiten',
      'notdienst',
      'richtpreise',
      'haftpflicht',
      'preisVorab',
      'unbar',
      'einwilligung',
    ])
  })
  test('gültige Bewerbung hat keine Fehler', () => expect(pruefeBewerbung(GUELTIG, IDS, VERZEICHNIS)).toEqual({}))

  test('„Ja, mit Abweichungen“ verlangt „Welche?“', () => {
    const w = { ...GUELTIG, richtpreise: 'abweichung' }
    expect(pruefeFeld('abweichungen', w, IDS, VERZEICHNIS)).toBe('Bitte beschreiben Sie kurz, wo Sie abweichen.')
    expect(pruefeFeld('abweichungen', { ...w, abweichungen: 'Anfahrt 39 €' }, IDS, VERZEICHNIS)).toBeNull()
  })
  test('unbekannte PLZ und zu großes Gebiet', () => {
    expect(pruefeFeld('plz', { ...GUELTIG, plz: '1100, 1009' }, IDS, VERZEICHNIS)).toBe('Diese Postleitzahlen kennen wir nicht: 1009. Bitte prüfen Sie die vier Ziffern.')
    expect(pruefeFeld('plz', { ...GUELTIG, plz: '1010–9992' }, IDS, VERZEICHNIS)).toBe(`Bitte grenzen Sie Ihr Einsatzgebiet auf höchstens ${MAX_PLZ} Postleitzahlen ein.`)
  })
  test('fremde Gewerke und Zeiten zählen nicht', () => {
    expect(pruefeFeld('gewerke', { ...GUELTIG, gewerke: ['dach'] }, IDS, VERZEICHNIS)).not.toBeNull()
    expect(pruefeFeld('zeiten', { ...GUELTIG, zeiten: ['immer'] }, IDS, VERZEICHNIS)).not.toBeNull()
  })
})

describe('Versand', () => {
  test('Bewerbungsnummer im Format P247-XXXXXX', () => expect(zufallsnummer('P247')).toMatch(/^P247-[A-Z0-9]{6}$/))

  test('Payload: art=partner, Listen als Komma-Liste, nur erwartete Felder', () => {
    const p = bewerbungZuPayload({ ...GUELTIG, gewerke: ['shk', 'dach'], plz: '1110 1100', uid: 'atu12345678' }, 'P247-ABCDEF', IDS, VERZEICHNIS)
    expect([...p.keys()].sort()).toEqual(
      [
        'art',
        'bewerbungId',
        'firma',
        'ansprechperson',
        'tel',
        'email',
        'gisa',
        'uid',
        'gewerke',
        'plz',
        'zeiten',
        'notdienst',
        'reaktionszeit',
        'richtpreise',
        'abweichungen',
        'haftpflicht',
        'preisVorab',
        'unbar',
        'anmerkungen',
        'dsgvo',
      ].sort(),
    )
    expect(p.get('art')).toBe('partner')
    expect(p.get('gewerke')).toBe('shk')
    expect(p.get('plz')).toBe('1100,1110')
    expect(p.get('uid')).toBe('ATU12345678')
    expect(p.get('abweichungen')).toBe('')
    expect(p.get('dsgvo')).toBe('on')
  })

  test('nur { ok: true } gilt als Erfolg', async () => {
    vi.stubGlobal('location', { hostname: 'localhost' })
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })))
    vi.stubGlobal('fetch', fetchMock)
    await sendeBewerbung(new URLSearchParams({ art: 'partner' }))
    expect(fetchMock.mock.calls[0][0]).toBe('/api/anfrage')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: false, error: 'limit' }))))
    await expect(sendeBewerbung(new URLSearchParams())).rejects.toThrow()
  })
})
