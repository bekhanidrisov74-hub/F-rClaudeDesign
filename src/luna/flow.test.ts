import { describe, expect, test } from 'vitest'
import { AUFTRAG_AUFGEGEBEN, WEISS_NICHT } from '../content/copy'
import { aendern, antworte, auswahl, fortschritt, gefuehrt, gesendet, kurzfassung, start, vorschlag, zuLead, type Zustand } from './flow'

const reihe = (...antworten: string[]): Zustand => antworten.reduce(antworte, start())
const letzte = (z: Zustand) => z.verlauf[z.verlauf.length - 1]
const BIS_KONTAKT = ['Installateur', 'Unter der Spüle tritt Wasser aus.', '1020', 'Sofort, es ist ein Notfall'] as const

describe('Ablauf wie in den Screens 07–09', () => {
  test('Frage 1 mit Gewerken und „Weiß ich nicht“', () => {
    const z = start()
    expect(z.verlauf).toEqual([
      {
        von: 'luna',
        text: 'Hallo, ich bin Luna, die digitale Assistentin von fixit247. Ich gebe Ihre Anfrage an einen Fachbetrieb in Ihrer Nähe weiter. Worum geht es?',
      },
    ])
    expect(auswahl(z)).toEqual(['Installateur', 'Heizung & Klima', 'Schlüsseldienst', 'Elektro', 'Haushaltsgeräte', WEISS_NICHT])
    expect(fortschritt(z)).toBe(1)
  })

  test('ganzer Ablauf bis zur Zusammenfassung', () => {
    let z = reihe('Installateur')
    expect(letzte(z).text).toBe('Verstanden. Was ist passiert?')
    expect(auswahl(z)).toEqual([])
    expect(fortschritt(z)).toBe(2)
    z = antworte(z, 'Unter der Spüle tritt Wasser aus.')
    expect(letzte(z).text).toBe('Danke. Falls möglich, drehen Sie den Hauptwasserhahn zu. Wie lautet Ihre Postleitzahl?')
    z = antworte(z, '1020')
    expect(letzte(z).text).toBe('Wie dringend ist es?')
    expect(auswahl(z)).toEqual(['Sofort, es ist ein Notfall', 'Heute noch', 'In den nächsten Tagen'])
    expect(fortschritt(z)).toBe(4)
    z = antworte(z, 'Sofort, es ist ein Notfall')
    expect(letzte(z).text).toBe('Wie heißen Sie, und unter welcher Nummer erreicht Sie der Betrieb?')
    expect(fortschritt(z)).toBe(5)
    z = antworte(z, 'Maria Huber, 0664 123 45 67')
    expect(z.schritt).toBe('zusammenfassung')
    expect(fortschritt(z)).toBe(5)
    expect(z.angaben).toMatchObject({
      gewerkText: 'Installateur',
      problem: 'Unter der Spüle tritt Wasser aus.',
      plz: '1020',
      ort: 'Wien',
      dringlichkeit: 'sofort',
      dringlichkeitText: 'Sofort, Notfall',
      name: 'Maria Huber',
      telefon: '0664 123 45 67',
    })
    expect(kurzfassung(z.angaben)).toBe('Installateur, 1020 Wien, sofort. Unter der Spüle tritt Wasser aus. Maria Huber, 0664 123 45 67')
  })

  test('Chip-Text und Freitext werden gleich behandelt, Groß-/Kleinschreibung egal', () => {
    expect(reihe('elektro').angaben.gewerk?.id).toBe('elektro')
    expect(letzte(reihe('Elektro', 'Kein Strom')).text).toContain('Berühren Sie keine beschädigten Kabel oder nassen Geräte.')
  })
})

describe('Sonderfälle', () => {
  test('„Weiß ich nicht“: kein Tipp, Gewerk null im Payload', () => {
    const z = reihe(WEISS_NICHT, 'Es tropft von der Decke.')
    expect(letzte(z).text).toBe('Danke. Wie lautet Ihre Postleitzahl?')
    expect(zuLead(reihe(WEISS_NICHT, 'Es tropft.', '1020', 'Heute noch', 'Max Muster 0664 1234567'))).toMatchObject({
      gewerk: null,
      beschreibung: 'Es tropft.',
      dringlichkeit: 'heute',
    })
  })

  test('Freitext statt Gewerk: Gewerk null, Text in der Beschreibung', () => {
    const lead = zuLead(reihe('Dach undicht', 'Wasser im Dachboden.', '4020 Linz', 'Morgen früh', 'Max Muster, +43 732 123456'))
    expect(lead).toMatchObject({ gewerk: null, plz: '4020', ort: 'Linz', dringlichkeit: null, telefon: '+43 732 123456' })
    expect(lead.beschreibung).toBe('Wasser im Dachboden.\nGewerk: Dach undicht\nDringlichkeit: Morgen früh')
  })

  test.each(['1009', '9993', 'abc', '10200', '102', ''])('PLZ „%s“ wird abgelehnt', (plz) => {
    const z = reihe('Installateur', 'Rohrbruch', ...(plz ? [plz] : []))
    if (!plz) return expect(z.schritt).toBe('plz') // leere Eingabe ändert nichts
    expect(z.schritt).toBe('plz')
    expect(letzte(z).text).toBe('Bitte geben Sie eine österreichische Postleitzahl mit vier Ziffern ein, zum Beispiel 1020.')
    expect(fortschritt(z)).toBe(3)
  })

  test.each([
    ['1010', 'Wien'],
    ['9992', ''],
    ['8010 Graz', 'Graz'],
    ['A-5020 Salzburg', 'Salzburg'],
  ])('PLZ „%s“ wird angenommen, Ort „%s“', (eingabe, ort) => {
    const z = reihe('Installateur', 'Rohrbruch', eingabe)
    expect(z.schritt).toBe('dringlichkeit')
    expect(z.angaben.ort).toBe(ort)
  })

  test.each([
    ['Maria Huber, 0664 123 45 67', 'Maria Huber', '0664 123 45 67'],
    ['Maria Huber 0664/1234567', 'Maria Huber', '0664/1234567'],
    ['+43 664 1234567 Maria Huber', 'Maria Huber', '+43 664 1234567'],
    ['Huber Maria, Tel. 01 234 56 78', 'Huber Maria', '01 234 56 78'],
  ])('Name und Telefon getrennt: „%s“', (eingabe, name, telefon) => {
    const z = antworte(reihe(...BIS_KONTAKT), eingabe)
    expect(z.schritt).toBe('zusammenfassung')
    expect(z.angaben).toMatchObject({ name, telefon })
  })

  test('fehlt die Nummer, fragt Luna nach', () => {
    let z = antworte(reihe(...BIS_KONTAKT), 'Maria Huber')
    expect(z.schritt).toBe('kontakt')
    expect(letzte(z).text).toBe('Unter welcher Nummer erreicht Sie der Betrieb?')
    expect(fortschritt(z)).toBe(5)
    z = antworte(z, '0664 1234567')
    expect(z.schritt).toBe('zusammenfassung')
    expect(z.angaben).toMatchObject({ name: 'Maria Huber', telefon: '0664 1234567' })
  })

  test('fehlt der Name, fragt Luna nach', () => {
    let z = antworte(reihe(...BIS_KONTAKT), '0664 1234567')
    expect(z.schritt).toBe('kontakt')
    z = antworte(z, 'Maria Huber')
    expect(z.schritt).toBe('zusammenfassung')
  })
})

describe('Zusammenfassung, Ändern, Senden', () => {
  const fertig = () => antworte(reihe(...BIS_KONTAKT), 'Maria Huber, 0664 1234567')

  test('„Angaben ändern“ geht zu Frage 2, die Angaben bleiben und sind vorbelegt', () => {
    const z = aendern(fertig())
    expect(z.schritt).toBe('problem')
    expect(fortschritt(z)).toBe(2)
    expect(letzte(z).text).toBe('Verstanden. Was ist passiert?')
    expect(z.angaben.name).toBe('Maria Huber')
    expect(vorschlag(z)).toBe('Unter der Spüle tritt Wasser aus.')
    const weiter = antworte(z, 'Unter der Spüle tritt Wasser aus, viel.')
    expect(vorschlag(weiter)).toBe('1020 Wien')
  })

  test('Payload für submitLead', () => {
    expect(zuLead(fertig())).toEqual({
      quelle: 'luna',
      gewerk: 'installateur',
      beschreibung: 'Unter der Spüle tritt Wasser aus.',
      plz: '1020',
      ort: 'Wien',
      dringlichkeit: 'sofort',
      name: 'Maria Huber',
      telefon: '0664 1234567',
      einwilligung: true,
    })
  })

  test('Erfolg und Fehler, Angaben bleiben, kein „Auftrag aufgegeben“ im Verlauf', () => {
    const vorher = fertig()
    const fehler = gesendet(vorher, null)
    expect(fehler.schritt).toBe('fehler')
    expect(fehler.verlauf).toEqual(vorher.verlauf)
    expect(fehler.verlauf.some((n) => n.text === AUFTRAG_AUFGEGEBEN)).toBe(false)
    expect(fortschritt(fehler)).toBeNull()
    expect(fehler.angaben.name).toBe('Maria Huber')
    const erfolg = gesendet(fehler, { anfragenummer: 'F247-ABC234' })
    expect(erfolg.schritt).toBe('erfolg')
    expect(erfolg.anfragenummer).toBe('F247-ABC234')
    expect(erfolg.verlauf).toEqual(vorher.verlauf)
  })

  test('Responder ist asynchron (für eine spätere KI-Anbindung)', async () => {
    const z = await gefuehrt.antworte(gefuehrt.start(), 'Elektro')
    expect(z.schritt).toBe('problem')
  })
})
