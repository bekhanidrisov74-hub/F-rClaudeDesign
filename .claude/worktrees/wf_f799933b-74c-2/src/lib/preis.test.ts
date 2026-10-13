import { describe, expect, test } from 'vitest'
import { gewerke } from '../content/gewerke'
import { aufzaehlung, cent, euro, rechne, spanneGesamt, spanneZeile, stundenText, type ZuschlagId } from './preis'

const g = (id: string) => gewerke.find((x) => x.id === id)!

/** Zeilen so, wie die Ergebniskarte sie zeigt. */
function zeilen(id: string, stunden: number, zuschlaege: ZuschlagId[]) {
  const e = rechne(g(id), stunden, zuschlaege)
  return {
    arbeit: spanneZeile(e.arbeit.min, e.arbeit.max),
    zuschlag: e.zuschlag ? spanneZeile(e.zuschlag.min, e.zuschlag.max) : 'keiner',
    anfahrt: euro(e.anfahrt),
    gesamt: spanneGesamt(e.gesamt.min, e.gesamt.max),
  }
}

describe('Pflichtfälle aus SPEC 5', () => {
  test.each([
    ['installateur', 2, [], '190,00–280,00 €', 'keiner', '29,90 €', 'ca. 219,90 € – 309,90 €'],
    ['schluessel', 2, [], '80,00–180,00 €', 'keiner', '19,90 €', 'ca. 99,90 € – 199,90 €'],
    ['installateur', 2, ['sonntag', 'nacht'], '190,00–280,00 €', '190,00–280,00 €', '29,90 €', 'ca. 409,90 € – 589,90 €'],
    ['schluessel', 2, ['nacht'], '80,00–180,00 €', '80,00–180,00 €', '19,90 €', 'ca. 179,90 € – 379,90 €'],
    ['elektro', 12, ['feiertag'], '1.080,00–1.680,00 €', '1.080,00–1.680,00 €', '29,90 €', 'ca. 2.189,90 € – 3.389,90 €'],
  ] as const)('%s, %i h, %j', (id, stunden, zuschlaege, arbeit, zuschlag, anfahrt, gesamt) => {
    expect(zeilen(id, stunden, [...zuschlaege])).toEqual({ arbeit, zuschlag, anfahrt, gesamt })
  })
})

describe('Rechnung', () => {
  test('Schlüsseldienst ignoriert die Stunden', () => {
    expect(rechne(g('schluessel'), 7, []).arbeit).toEqual(rechne(g('schluessel'), 1, []).arbeit)
  })
  test('drei Zuschläge zählen wie einer', () => {
    expect(rechne(g('installateur'), 2, ['sonntag', 'feiertag', 'nacht']).gesamt).toEqual(rechne(g('installateur'), 2, ['nacht']).gesamt)
  })
  test('Stunden bleiben zwischen 1 und 12', () => {
    expect(rechne(g('installateur'), 0, []).arbeit.min).toBe(cent(95))
    expect(rechne(g('installateur'), 99, []).arbeit.min).toBe(cent(95) * 12)
  })
})

describe('Texte', () => {
  test('Unterzeile', () => {
    expect(rechne(g('installateur'), 2, []).unterzeile).toBe('Installateur, 2 Stunden, kein Zuschlag')
    expect(rechne(g('installateur'), 1, []).unterzeile).toBe('Installateur, 1 Stunde, kein Zuschlag')
    expect(rechne(g('installateur'), 2, ['nacht', 'sonntag']).unterzeile).toBe('Installateur, 2 Stunden, Sonntag und Nacht')
    expect(rechne(g('schluessel'), 2, []).unterzeile).toBe('Schlüsseldienst, pro Einsatz, kein Zuschlag')
  })
  test('Aufzählung und Stunden', () => {
    expect(aufzaehlung(['Sonntag', 'Feiertag', 'Nacht'])).toBe('Sonntag, Feiertag und Nacht')
    expect(aufzaehlung(['Nacht'])).toBe('Nacht')
    expect(stundenText(1)).toBe('1 Stunde')
    expect(stundenText(12)).toBe('12 Stunden')
  })
  test('Euro-Format', () => {
    expect(euro(2990)).toBe('29,90 €')
    expect(euro(108000)).toBe('1.080,00 €')
    expect(euro(5)).toBe('0,05 €')
    expect(cent(0.1 + 0.2)).toBe(30)
  })
})
