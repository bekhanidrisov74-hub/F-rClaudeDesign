import { describe, expect, test } from 'vitest'
import { NACHTZEIT } from '../content/copy'
import { istFeiertag, ostersonntag, wienerZeit, zuschlaegeJetzt } from './zuschlagJetzt'

// Zeitpunkte immer mit Versatz (+01:00 Winter, +02:00 Sommer): unabhängig von der Zeitzone des Rechners.
const jetzt = (iso: string) => zuschlaegeJetzt(new Date(iso))

test('Der sichtbare Text der Nachtzeit bleibt', () => {
  expect(NACHTZEIT).toBe('18 bis 8 Uhr')
})

describe('Nacht (ab 18:00 bis vor 08:00), Dienstag 27.10.2026', () => {
  test.each([
    ['00:00', ['nacht']],
    ['07:59', ['nacht']],
    ['08:00', []],
    ['12:00', []],
    ['17:59', []],
    ['18:00', ['nacht']],
    ['23:59', ['nacht']],
  ])('%s', (uhr, erwartet) => {
    expect(jetzt(`2026-10-27T${uhr}:00+01:00`)).toEqual(erwartet)
  })
})

describe('Sonntag und Feiertage', () => {
  test('Sonntag 12:00', () => expect(jetzt('2026-10-25T12:00:00+01:00')).toEqual(['sonntag']))
  test('Sonntag 22:00 ist auch Nacht, der Sonntag steht zuerst', () =>
    expect(jetzt('2026-10-25T22:00:00+01:00')).toEqual(['sonntag', 'nacht']))
  test('Samstag 22:00 ist nur Nacht', () => expect(jetzt('2026-10-24T22:00:00+02:00')).toEqual(['nacht']))
  test('Montag 00:30 nach dem Sonntag ist nur Nacht', () => expect(jetzt('2026-10-19T00:30:00+02:00')).toEqual(['nacht']))
  test('Feiertag auf einem Sonntag: Feiertag zuerst (Allerheiligen 2026)', () =>
    expect(jetzt('2026-11-01T12:00:00+01:00')).toEqual(['feiertag', 'sonntag']))
  test('Feiertag am Abend: Feiertag, dann Nacht', () =>
    expect(jetzt('2026-12-08T19:00:00+01:00')).toEqual(['feiertag', 'nacht']))
  test('normaler Werktag 12:00', () => expect(jetzt('2026-10-28T12:00:00+01:00')).toEqual([]))
})

describe('Feiertage', () => {
  test.each([
    ['1. Jänner', '2026-01-01T12:00:00+01:00'],
    ['6. Jänner', '2026-01-06T12:00:00+01:00'],
    ['1. Mai', '2026-05-01T12:00:00+02:00'],
    ['15. August', '2026-08-15T12:00:00+02:00'],
    ['26. Oktober', '2026-10-26T12:00:00+01:00'],
    ['1. November (Sonntag)', '2026-11-01T12:00:00+01:00'],
    ['8. Dezember', '2026-12-08T12:00:00+01:00'],
    ['25. Dezember', '2026-12-25T12:00:00+01:00'],
    ['26. Dezember', '2026-12-26T12:00:00+01:00'],
    ['Ostermontag 2026', '2026-04-06T12:00:00+02:00'],
    ['Christi Himmelfahrt 2026', '2026-05-14T12:00:00+02:00'],
    ['Pfingstmontag 2026', '2026-05-25T12:00:00+02:00'],
    ['Fronleichnam 2026', '2026-06-04T12:00:00+02:00'],
    ['Ostermontag 2027', '2027-03-29T12:00:00+02:00'],
  ])('%s', (_name, iso) => {
    expect(jetzt(iso)).toContain('feiertag')
  })

  test.each([
    ['Karfreitag 2026', '2026-04-03T12:00:00+02:00'],
    ['Karsamstag 2026', '2026-04-04T12:00:00+02:00'],
    ['Heiliger Abend 2026', '2026-12-24T12:00:00+01:00'],
    ['Leopoldi (Landesfeiertag)', '2026-11-15T12:00:00+01:00'],
    ['Tag nach Fronleichnam 2026', '2026-06-05T12:00:00+02:00'],
  ])('kein Feiertag: %s', (_name, iso) => {
    expect(jetzt(iso)).not.toContain('feiertag')
  })

  test('Wiener Mitternacht entscheidet, nicht UTC: 26.10.2026 00:30 Uhr ist schon Nationalfeiertag', () => {
    expect(jetzt('2026-10-25T23:30:00Z')).toEqual(['feiertag', 'nacht']) // 00:30 in Wien (+01:00)
    expect(jetzt('2026-10-25T22:59:00Z')).toEqual(['sonntag', 'nacht']) // 23:59 am 25.10. in Wien
  })

  test('istFeiertag nach Kalendertag', () => {
    expect(istFeiertag({ jahr: 2028, monat: 4, tag: 17 })).toBe(true) // Ostermontag 2028
    expect(istFeiertag({ jahr: 2028, monat: 4, tag: 16 })).toBe(false) // Ostersonntag selbst ist Sonntag, kein eigener Feiertag
  })
})

describe('Ostersonntag', () => {
  test.each([
    [2000, 4, 23],
    [2024, 3, 31],
    [2025, 4, 20],
    [2026, 4, 5],
    [2027, 3, 28],
    [2028, 4, 16],
    [2038, 4, 25],
  ])('%i', (jahr, monat, tag) => {
    expect(ostersonntag(jahr)).toEqual({ monat, tag })
  })
})

describe('Wiener Zeit über die Umstellung', () => {
  test('Sommerzeit 29.3.2026: 02:00 wird zu 03:00', () => {
    expect(wienerZeit(new Date('2026-03-29T00:59:00Z'))).toMatchObject({ tag: 29, stunde: 1, wochentag: 0 })
    expect(wienerZeit(new Date('2026-03-29T01:00:00Z'))).toMatchObject({ tag: 29, stunde: 3, wochentag: 0 })
    // derselbe UTC-Zeitpunkt: mit Winterzeit wäre es 07:30 (Nacht), mit Sommerzeit 08:30 (keine Nacht)
    expect(jetzt('2026-03-29T06:30:00Z')).toEqual(['sonntag'])
    expect(jetzt('2026-03-28T06:30:00Z')).toEqual(['nacht']) // Samstag davor, noch Winterzeit: 07:30
  })

  test('Winterzeit 25.10.2026: 03:00 wird zu 02:00', () => {
    expect(wienerZeit(new Date('2026-10-25T00:59:00Z'))).toMatchObject({ tag: 25, stunde: 2, wochentag: 0 })
    expect(wienerZeit(new Date('2026-10-25T01:00:00Z'))).toMatchObject({ tag: 25, stunde: 2, wochentag: 0 })
    expect(wienerZeit(new Date('2026-10-25T02:00:00Z'))).toMatchObject({ stunde: 3 })
    // derselbe UTC-Zeitpunkt 06:30: am 24.10. (Sommerzeit) 08:30, am 25.10. (Winterzeit) 07:30
    expect(wienerZeit(new Date('2026-10-24T06:30:00Z')).stunde).toBe(8)
    expect(wienerZeit(new Date('2026-10-25T06:30:00Z')).stunde).toBe(7)
    expect(jetzt('2026-10-24T06:30:00Z')).toEqual([])
    expect(jetzt('2026-10-25T06:30:00Z')).toEqual(['sonntag', 'nacht'])
  })

  test('Mitternacht ist Stunde 0, nicht 24', () => {
    expect(wienerZeit(new Date('2026-10-27T00:00:00+01:00')).stunde).toBe(0)
  })
})
