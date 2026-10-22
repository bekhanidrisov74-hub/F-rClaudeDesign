import { describe, expect, test } from 'vitest'
import { bezirke } from '../content/bezirke'
import { copy, fuelle } from '../content/copy'
import { ladePlz, ortsHinweis } from './plz'

const bezirkText = (plz: string) => fuelle(copy.anfrage.bezirk, { ort: 'Wien', ...bezirke[plz] })

describe('ortsHinweis', () => {
  test('Wien: Ort mit Nummer und Name des Bezirks', async () => {
    const liste = await ladePlz()
    expect(bezirke['1010']).toEqual({ nummer: 1, name: 'Innere Stadt' })
    expect(bezirke['1100']).toEqual({ nummer: 10, name: 'Favoriten' })
    expect(bezirke['1230']).toEqual({ nummer: 23, name: 'Liesing' })
    for (const plz of ['1010', '1100', '1230']) expect(ortsHinweis(plz, liste)?.text, plz).toBe(bezirkText(plz))
  })

  test('alle 23 Bezirke stehen im PLZ-Verzeichnis als Wien, ihre Nummern laufen von 1 bis 23', async () => {
    const liste = await ladePlz()
    const plzs = Object.keys(bezirke)
    expect(plzs).toHaveLength(23)
    plzs.forEach((plz, i) => {
      expect(bezirke[plz].nummer).toBe(i + 1)
      expect(ortsHinweis(plz, liste)).toMatchObject({ plz, ort: 'Wien', text: bezirkText(plz) })
    })
  })

  test('ohne Bezirk: Flughafen und andere Orte nur mit dem Ortsnamen', async () => {
    const liste = await ladePlz()
    expect(ortsHinweis('1300', liste)?.text).toBe('Wien-Flughafen')
    expect(ortsHinweis('2000', liste)?.text).toBe('Stockerau')
  })

  test('unbekannte PLZ oder keine PLZ am Anfang: nichts', async () => {
    const liste = await ladePlz()
    for (const eingabe of ['1011', '0999', '11000', '110', 'Wien', 'Wien 1100', '']) expect(ortsHinweis(eingabe, liste), eingabe).toBeNull()
  })

  test('nurPlz: der Ort lässt sich nur einsetzen, wenn noch keiner im Feld steht', async () => {
    const liste = await ladePlz()
    expect(ortsHinweis('1100', liste)).toMatchObject({ plz: '1100', ort: 'Wien', nurPlz: true })
    expect(ortsHinweis(' 2000 ', liste)).toMatchObject({ plz: '2000', ort: 'Stockerau', nurPlz: true })
    expect(ortsHinweis('1100 Wien', liste)?.nurPlz).toBe(false)
    expect(ortsHinweis('2000, Hollabrunn', liste)).toMatchObject({ ort: 'Stockerau', nurPlz: false })
  })
})
