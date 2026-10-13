import { describe, expect, test } from 'vitest'
import {
  formularZuLead,
  istTelefon,
  LEERES_FORMULAR,
  ortZuPlz,
  pruefeFeld,
  pruefeFormular,
  teileNameTelefon,
  teilePlzOrt,
  WEISS_NICHT_ID,
  type FormularWerte,
} from './validate'

const IDS = ['installateur', 'elektro']
const GUELTIG: FormularWerte = {
  name: 'Maria Huber',
  telefon: '0664 1234567',
  plzOrt: '1020 Wien',
  gewerk: 'installateur',
  beschreibung: 'Unter der Spüle tritt Wasser aus.',
  einwilligung: true,
}

describe('PLZ und Ort', () => {
  test.each([
    ['1020', { plz: '1020', ort: '' }],
    ['1020 Wien', { plz: '1020', ort: 'Wien' }],
    ['8010, Graz', { plz: '8010', ort: 'Graz' }],
    ['A-5020 Salzburg', { plz: '5020', ort: 'Salzburg' }],
  ])('„%s“', (eingabe, erwartet) => expect(teilePlzOrt(eingabe)).toEqual(erwartet))

  test.each(['1009', '9993', '10200', 'Wien 1020', 'abcd', ''])('„%s“ ist keine PLZ', (eingabe) => expect(teilePlzOrt(eingabe)).toBeNull())

  test('Ort aus der PLZ nur für Wien', () => {
    expect(ortZuPlz('1010')).toBe('Wien')
    expect(ortZuPlz('1239')).toBe('Wien')
    expect(ortZuPlz('1300')).toBe('')
    expect(ortZuPlz('8010')).toBe('')
  })
})

describe('Telefon und Name', () => {
  test.each(['0664 1234567', '+43 664 1234567', '01/234 56 78', '(0664) 123-45-67'])('„%s“ ist eine Nummer', (n) => expect(istTelefon(n)).toBe(true))
  test.each(['', '12345', 'abc', '0664 12345678901234', 'Huber 0664'])('„%s“ ist keine Nummer', (n) => expect(istTelefon(n)).toBe(false))
  test('Name und Nummer trennen', () => {
    expect(teileNameTelefon('Maria Huber, 0664 123 45 67')).toEqual({ name: 'Maria Huber', telefon: '0664 123 45 67' })
    expect(teileNameTelefon('Maria Huber')).toEqual({ name: 'Maria Huber', telefon: '' })
  })
})

describe('Formular', () => {
  test('leeres Formular: Fehlertexte laut SPEC 9 in Feld-Reihenfolge', () => {
    expect(pruefeFormular(LEERES_FORMULAR, IDS)).toEqual({
      name: 'Bitte geben Sie Ihren Namen ein.',
      telefon: 'Bitte geben Sie eine Telefonnummer für den Rückruf ein.',
      plzOrt: 'Bitte geben Sie Postleitzahl und Ort ein, zum Beispiel 1020 Wien.',
      gewerk: 'Bitte wählen Sie ein Gewerk.',
      einwilligung: 'Bitte stimmen Sie der Weitergabe zu, sonst können wir keinen Betrieb vermitteln.',
    })
    expect(Object.keys(pruefeFormular(LEERES_FORMULAR, IDS))[0]).toBe('name')
  })

  test('gültiges Formular hat keine Fehler, Beschreibung ist freiwillig', () => {
    expect(pruefeFormular(GUELTIG, IDS)).toEqual({})
    expect(pruefeFormular({ ...GUELTIG, beschreibung: '' }, IDS)).toEqual({})
  })

  test('PLZ ohne Ort: Wien wird ergänzt, andere Orte müssen angegeben werden', () => {
    expect(pruefeFeld('plzOrt', { ...GUELTIG, plzOrt: '1020' }, IDS)).toBeNull()
    expect(pruefeFeld('plzOrt', { ...GUELTIG, plzOrt: '4020' }, IDS)).not.toBeNull()
    expect(pruefeFeld('plzOrt', { ...GUELTIG, plzOrt: '4020 Linz' }, IDS)).toBeNull()
  })

  test('Gewerk: id aus den Daten oder „Weiß ich nicht“', () => {
    expect(pruefeFeld('gewerk', { ...GUELTIG, gewerk: WEISS_NICHT_ID }, IDS)).toBeNull()
    expect(pruefeFeld('gewerk', { ...GUELTIG, gewerk: 'gibt-es-nicht' }, IDS)).not.toBeNull()
  })

  test('Payload: Quelle formular, Dringlichkeit null, PLZ und Ort getrennt', () => {
    expect(formularZuLead({ ...GUELTIG, plzOrt: '1020', name: '  Maria Huber ' })).toEqual({
      quelle: 'formular',
      gewerk: 'installateur',
      beschreibung: 'Unter der Spüle tritt Wasser aus.',
      plz: '1020',
      ort: 'Wien',
      dringlichkeit: null,
      name: 'Maria Huber',
      telefon: '0664 1234567',
      einwilligung: true,
    })
    expect(formularZuLead({ ...GUELTIG, gewerk: WEISS_NICHT_ID }).gewerk).toBeNull()
    expect(() => formularZuLead({ ...GUELTIG, einwilligung: false })).toThrow()
  })
})
