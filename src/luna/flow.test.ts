import { describe, expect, test, vi } from 'vitest'
import { TELEFON } from '../content/contact'
import { copy, GEFAHR } from '../content/copy'
import { katalog } from '../content/fragen'
import { gewerke } from '../content/gewerke'
import { ladePlz } from '../lib/plz'
import {
  aendern,
  antworte,
  auswahl,
  fortschritt,
  gesendet,
  istFrage,
  kurzfassung,
  mitId,
  offeneFrage,
  ohneKontakt,
  plzKandidat,
  start,
  uebernimm,
  zeilen,
  zuLead,
  zuschlagImTermin,
  type Erfasser,
  type Zustand,
} from './flow'

const lauf = async (eingaben: string[], erfasse?: Erfasser, z: Zustand = start()) => {
  for (const e of eingaben) z = await antworte(z, e, erfasse)
  return z
}
const letzte = (z: Zustand) => z.verlauf[z.verlauf.length - 1].text
const texte = (z: Zustand) => z.verlauf.map((n) => n.text)
const KONTAKT = { name: 'Maria Huber', telefon: '0664 1234567', email: '' }

describe('Fragenkatalog', () => {
  test('jedes Gewerk aus gewerke.ts hat einen Katalog, ids passen zur Eingangsprüfung des Backends', () => {
    expect(katalog.map((k) => k.id).sort()).toEqual(gewerke.map((g) => g.id).sort())
    for (const f of katalog.flatMap((k) => k.fragen)) {
      expect(f.id).toMatch(/^[a-z]{1,20}$/)
      expect(f.frage.length).toBeLessThanOrEqual(160)
    }
  })
})

describe('Ablauf mit Chips', () => {
  test('Start: Gewerke und „Weiß ich nicht“, Schritt 1', () => {
    const z = start()
    expect(z.phase).toBe('INITIAL')
    expect(auswahl(z)).toEqual([...gewerke.map((g) => g.name), 'Weiß ich nicht'])
    expect(fortschritt(z)).toBe(1)
  })

  test('Installateur bis zur Zusammenfassung: je Schritt eine Frage, „Läuft stark aus“ setzt ACUTE', async () => {
    let z = await lauf(['Installateur'])
    expect(z.phase).toBe('ASKING')
    expect(letzte(z)).toBe('Was ist das Problem?')
    expect(auswahl(z)).toContain('Überspringen')
    expect(fortschritt(z)).toBe(2)

    z = await lauf(['Wasser tritt aus', 'Küche', 'Läuft stark aus'], undefined, z)
    expect(z.anfrage.dringlichkeit).toBe('ACUTE')
    expect(letzte(z)).toBe('Ist das Wasser bereits abgestellt?')

    // Dringlichkeit ist schon bekannt: keine Frage danach, weiter zum Ort mit Sicherheitstipp
    z = await lauf(['Überspringen'], undefined, z)
    expect(z.phase).toBe('LOCATION')
    expect(letzte(z)).toBe('Danke. Falls möglich, drehen Sie den Hauptwasserhahn zu. Wie lautet Ihre Postleitzahl?')
    expect(fortschritt(z)).toBe(3)

    z = await lauf(['1020'], undefined, z)
    expect(z.phase).toBe('SUMMARY')
    expect(fortschritt(z)).toBe(4)
    expect(z.anfrage).toMatchObject({ plz: '1020', ort: 'Wien', antworten: { was: 'Wasser tritt aus', wo: 'Küche', menge: 'Läuft stark aus', abgestellt: '' } })
    expect(zeilen(z.anfrage)).toEqual([
      ['Gewerk', 'Installateur'],
      ['Problem', 'Wasser tritt aus'],
      ['Wo', 'Küche'],
      ['Wasser', 'Läuft stark aus'],
      ['Dringlichkeit', 'Akut/Gefahr'],
      ['Ort', '1020 Wien'],
    ])
  })

  test('Dringlichkeit ohne „Überspringen“; „In den nächsten Tagen“ fragt nach dem Wunschtermin', async () => {
    let z = await lauf(['Schlüsseldienst', 'Ausgesperrt', 'Zugefallen', 'Wohnung', 'Ja'])
    expect(offeneFrage(z)?.id).toBe('dringlichkeit')
    expect(auswahl(z)).toEqual(['Akut/Gefahr', 'So schnell wie möglich', 'In den nächsten Tagen'])
    z = await lauf(['In den nächsten Tagen'], undefined, z)
    expect(z.anfrage.dringlichkeit).toBe('NORMAL')
    expect(letzte(z)).toBe('Wann passt es Ihnen am besten?')
    z = await lauf(['Nächste Woche'], undefined, z)
    expect(z.phase).toBe('LOCATION')
    expect(z.anfrage.wunschtermin).toBe('Nächste Woche')
  })

  test('„So schnell wie möglich“ fragt keinen Wunschtermin', async () => {
    const z = await lauf(['Schlüsseldienst', 'Ausgesperrt', 'Zugefallen', 'Wohnung', 'Ja', 'So schnell wie möglich'])
    expect(z.anfrage.dringlichkeit).toBe('URGENT')
    expect(z.phase).toBe('LOCATION')
  })

  test('„Akut/Gefahr“ zeigt den Notruf-Hinweis einmal, der Ablauf läuft weiter', async () => {
    const z = await lauf(['Schlüsseldienst', 'Ausgesperrt', 'Zugefallen', 'Wohnung', 'Ja', 'Akut/Gefahr'])
    expect(z.notruf).toBe(true)
    expect(z.verlauf.filter((n) => n.von === 'notruf')).toHaveLength(1)
    expect(z.phase).toBe('LOCATION')
  })

  test('Heizung & Klima: bei Klimaanlage keine Frage nach der Heizungsart', async () => {
    const z = await lauf(['Heizung & Klima', 'Klimaanlage'])
    expect(offeneFrage(z)?.id).toBe('code')
  })
})

describe('Freitext und lokale Erkennung', () => {
  test('„Heizung … seit heute … 1100 Wien“: Gewerk, PLZ und Antworten erkannt, kein Notruf („funktioniert“)', async () => {
    const z = await lauf(['Meine Heizung funktioniert seit heute nicht mehr, 1100 Wien.'])
    expect(z.anfrage).toMatchObject({ gewerk: 'shk', plz: '1100', ort: 'Wien', antworten: { was: 'Heizung', seit: 'Seit heute' } })
    expect(z.notruf).toBe(false)
    expect(letzte(z)).toBe('Welche Heizungsart haben Sie?')
  })

  test('Funken: Notruf-Hinweis, ACUTE, Gefahrenfrage beantwortet', async () => {
    const z = await lauf(['Weiß ich nicht', 'Aus der Steckdose kommen Funken'])
    expect(z.anfrage.gewerk).toBe('elektro')
    expect(z.anfrage.dringlichkeit).toBe('ACUTE')
    expect(z.anfrage.antworten.gefahr).toBe('Funken')
    expect(z.verlauf.find((n) => n.von === 'notruf')?.text).toBe(copy.luna.notruf)
  })

  test('Chip „Funken“ bei der Gefahrenfrage', async () => {
    const z = await lauf(['Elektro', 'Kein Strom', 'Ein Raum', 'Ja', 'Funken'])
    expect(z.notruf).toBe(true)
    expect(z.anfrage.dringlichkeit).toBe('ACUTE')
  })

  test('„Ich brauche Hilfe“ ist keine Gefahr', async () => {
    const z = await lauf(['Ich brauche Hilfe, die Waschmaschine läuft aus'])
    expect(z.notruf).toBe(false)
    expect(z.anfrage.gewerk).toBe('geraete')
  })

  test('Was bekannt ist, wird nicht erneut gefragt (Gerät, Marke, Fehlercode aus dem ersten Satz)', async () => {
    const z = await lauf(['Mein Geschirrspüler von Bosch zeigt E24'])
    expect(z.anfrage.antworten).toMatchObject({ geraet: 'Geschirrspüler', hersteller: 'Bosch', code: 'E24' })
    expect(letzte(z)).toBe('Was ist das Problem?')
  })

  test('Kühlschrank landet bei den Haushaltsgeräten, nicht bei der Klimaanlage', async () => {
    expect((await lauf(['Der Kühlschrank kühlt nicht mehr'])).anfrage.gewerk).toBe('geraete')
  })

  test('unklares Gewerk: die fünf Gewerke als Chips, beim zweiten Mal ein anderer Text', async () => {
    let z = await lauf(['Es ist etwas kaputt'])
    expect(z.phase).toBe('CLASSIFYING')
    expect(auswahl(z)).toEqual(gewerke.map((g) => g.name))
    expect(letzte(z)).toBe('Verstanden. Um welches Gewerk geht es?')
    z = await lauf(['Weiß nicht genau'], undefined, z)
    expect(letzte(z)).toMatch(/^Das kann ich noch keinem Gewerk zuordnen/)
    z = await lauf(['Elektro'], undefined, z)
    expect(z.phase).toBe('ASKING')
  })

  test('sehr kurze Eingabe: Luna fragt nach', async () => {
    const z = await lauf(['hm'])
    expect(z.phase).toBe('INITIAL')
    expect(letzte(z)).toMatch(/^Können Sie das Problem/)
  })
})

describe('PLZ', () => {
  test('Jahreszahlen im Freitext sind keine PLZ, im Ort-Schritt zählt jede vierstellige Zahl', () => {
    expect(plzKandidat('Heizung seit 2020 kaputt', false)).toBeNull()
    expect(plzKandidat('Therme von 2015', false)).toBeNull()
    expect(plzKandidat('2020 ist das Baujahr', false)).toBeNull()
    expect(plzKandidat('Wohnung in 2020 Hollabrunn', false)).toBe('2020')
    expect(plzKandidat('1100 Wien', false)).toBe('1100')
    expect(plzKandidat('2020', true)).toBe('2020')
    expect(plzKandidat('123', true)).toBeNull()
  })

  test('„seit 2020“ im ersten Satz setzt keine PLZ', async () => {
    const z = await lauf(['Die Therme ist seit 2020 eingebaut und heizt nicht'])
    expect(z.anfrage.plz).toBe('')
  })

  test('Ort-Schritt: „123“ abgelehnt, unbekannte PLZ abgelehnt, 2020 ist Hollabrunn', async () => {
    let z = await lauf(['Schlüsseldienst', 'Ausgesperrt', 'Zugefallen', 'Wohnung', 'Ja', 'So schnell wie möglich'])
    z = await lauf(['123'], undefined, z)
    expect(z.phase).toBe('LOCATION')
    expect(letzte(z)).toBe('Bitte geben Sie eine österreichische Postleitzahl mit vier Ziffern ein, zum Beispiel 1020.')
    z = await lauf(['1239'], undefined, z)
    expect(letzte(z)).toMatch(/^Zu dieser Postleitzahl finde ich keinen Ort/)
    z = await lauf(['2020'], undefined, z)
    expect(z.anfrage).toMatchObject({ plz: '2020', ort: 'Hollabrunn' })
    expect(z.phase).toBe('SUMMARY')
  })
})

describe('KI-Erfassung (optional)', () => {
  test('ergänzt nur gültige Felder; Kontaktdaten und Kundendaten bleiben außen vor', async () => {
    const erfasse = vi.fn<Erfasser>().mockResolvedValue({
      category: 'shk',
      postalCode: '1100',
      answers: { seit: 'seit heute', art: 'unbekannt' },
      reply: 'Die Vermittlung ist kostenlos.',
    })
    const z = await lauf(['Bei mir ist es seit heute ganz kalt in der Wohnung'], erfasse)
    expect(z.anfrage).toMatchObject({ gewerk: 'shk', plz: '1100', ort: 'Wien' })
    expect(z.anfrage.antworten).toEqual({ seit: 'seit heute' })
    expect(z.verlauf.map((n) => n.text)).toContain('Die Vermittlung ist kostenlos.')
    const [verlauf, zustand] = erfasse.mock.calls[0]
    expect(verlauf.at(-1)).toEqual({ role: 'user', content: 'Bei mir ist es seit heute ganz kalt in der Wohnung' })
    expect(zustand).toEqual({ category: null, urgency: null, postalCode: null, answers: {}, pending: null, questions: [], phase: 'INITIAL', match: null })
  })

  test('Telefonnummern und E-Mail-Adressen aus dem Freitext gehen nicht an die KI (Audit F1)', async () => {
    const erfasse = vi.fn<Erfasser>().mockResolvedValue({})
    await lauf(['Rohrbruch, bitte Maria Huber anrufen: 0664 1234567 oder +43 660 1234567, maria@example.at', 'In der Küche, Rückruf bitte unter 0664/1234567'], erfasse)
    expect(erfasse).toHaveBeenCalled()
    const gesendet = JSON.stringify(erfasse.mock.calls)
    expect(gesendet).not.toMatch(/0664|1234567|@/)
    expect(erfasse.mock.calls[0][0].at(-1)?.content).toBe('Rohrbruch, bitte Maria Huber anrufen: [Nummer entfernt] oder [Nummer entfernt], [E-Mail entfernt]')
    expect(ohneKontakt('PLZ 1020 Wien, seit 2020, am 05.10., Baujahr 2015, Fehler 0815')).toBe('PLZ 1020 Wien, seit 2020, am 05.10., Baujahr 2015, Fehler 0815')
    expect(ohneKontakt('Meine Nummer 0664.123.45.67 bitte')).toBe('Meine Nummer [Nummer entfernt] bitte')
  })

  test('Notruf (M1): eine KI-Antwort, die nur den Kern-Satz wiederholt, entfällt – nur bei gezeigtem Hinweis', async () => {
    const liste = await ladePlz()
    const antwort = (notruf: boolean, reply: string) => {
      const z = start()
      z.notruf = notruf
      uebernimm(z, { reply }, liste)
      return z
    }
    for (const reply of [GEFAHR, `„${GEFAHR}“`, copy.luna.notruf]) {
      expect(antwort(true, reply).verlauf.map((n) => n.text), reply).not.toContain(reply)
      expect(antwort(true, reply).ki).toEqual([])
    }
    // ohne gezeigten Hinweis bleibt auch der Kern-Satz stehen
    expect(antwort(false, GEFAHR).verlauf.map((n) => n.text)).toContain(GEFAHR)
    // andere Antworten bleiben: auch mit Notruf-Satz hinter anderem Inhalt oder mit viel Inhalt dahinter
    for (const reply of ['Die Vermittlung ist kostenlos.', `Bleiben Sie ruhig. ${GEFAHR}`, `${GEFAHR} ${'Die Vermittlung ist kostenlos. '.repeat(3)}`.trim()]) {
      const z = antwort(true, reply)
      expect(z.verlauf.map((n) => n.text), reply).toContain(reply)
      expect(z.ki.at(-1)).toEqual({ role: 'assistant', content: reply })
    }
  })

  test('fremdes Format, falsches Gewerk, ungültige PLZ und Platzhalter werden ignoriert', async () => {
    const liste = await ladePlz()
    for (const felder of [null, 'Text', 42, [], { category: 'sanitaer', postalCode: '9999', reply: '' }, { postalCode: 11000 }, { postalCode: 'constructor' }, { urgency: 'constructor' }, { category: 'constructor' }]) {
      const z = start()
      uebernimm(z, felder, liste)
      expect(z).toEqual(start())
    }
    const z = start()
    uebernimm(z, { urgency: 'SEHR', preferredTime: 'nicht angegeben', reply: 'x'.repeat(900) }, liste)
    expect(z.anfrage.dringlichkeit).toBeNull()
    expect(z.anfrage.wunschtermin).toBeNull()
    expect(letzte(z)).toHaveLength(600)
  })

  test('nur bei der ersten Beschreibung, Fragen und längeren Freitexten; nach der Zusammenfassung nur Fragen', async () => {
    const erfasse = vi.fn<Erfasser>().mockResolvedValue({})
    let z = await lauf(['Installateur', 'Wasser tritt aus'], erfasse)
    expect(erfasse).not.toHaveBeenCalled()
    z = await lauf(['Es ist unter der Spüle'], erfasse, z)
    expect(erfasse).toHaveBeenCalledTimes(1)
    expect(erfasse.mock.calls[0][1].pending).toMatchObject({ id: 'wo' })
    z = await lauf(['Läuft stark aus', 'Ja', '1020'], erfasse, z)
    expect(z.phase).toBe('SUMMARY')
    erfasse.mockClear()
    z = await lauf(['Bitte vorher anrufen, Maria Huber 0664 1234567'], erfasse, z)
    expect(erfasse).not.toHaveBeenCalled()
    expect(z.anfrage.zusatz).toBe('Bitte vorher anrufen, Maria Huber 0664 1234567')
    await lauf(['Wann kommt der Betrieb?'], erfasse, z)
    expect(erfasse).toHaveBeenCalledTimes(1)
    expect(erfasse.mock.calls[0][1].phase).toBe('SUMMARY')
  })
})

describe('Fragen in jedem Schritt (Ausbau 24.10.2026)', () => {
  const antwortet = (absicht: string, reply = 'Antwort der KI.') => vi.fn<Erfasser>().mockResolvedValue({ absicht, reply })
  const ausfall = () => vi.fn<Erfasser>().mockResolvedValue(null)
  const ersatz = `Diese Frage kann ich gerade nicht beantworten. Rufen Sie uns an: ${TELEFON}.`

  test('Begrüßung: Satz laut SPEC, danach der Hinweis, dass Luna eine KI ist', () => {
    expect(texte(start())).toEqual([copy.luna.fragen.gewerk, copy.luna.kiHinweis])
  })

  test('istFrage: Fragezeichen, Fragewort, Verb mit Pronomen; Angaben sind keine Fragen', () => {
    for (const f of ['Was kostet das', 'wie lange dauert es', 'Können Sie auch am Sonntag kommen', 'Gibt es einen Zuschlag', 'Wann?', 'How much is it', 'Is there a fee'])
      expect(istFrage(f), f).toBe(true)
    for (const f of ['Wasser tritt aus', 'Wien 1100', 'Ist kaputt', 'Küche', 'Waschmaschine läuft aus', 'Werkstatt im Keller', 'Wohnung'])
      expect(istFrage(f), f).toBe(false)
  })

  test('Anfang: Frage beantwortet, die Anfrage bleibt leer, die Gewerke bleiben zur Auswahl', async () => {
    const z = await lauf(['Was kostet ein Installateur am Sonntag?'], antwortet('frage', 'Am Sonntag gilt +100 % auf die Arbeit.'))
    expect(z.phase).toBe('INITIAL')
    expect(z.anfrage).toEqual(start().anfrage)
    expect(letzte(z)).toBe('Am Sonntag gilt +100 % auf die Arbeit.')
    expect(auswahl(z)).toEqual(auswahl(start()))
  })

  test('fremdes Thema: die Absage der KI, sonst nichts', async () => {
    const z = await lauf(['Wie wird morgen das Wetter?'], antwortet('fremd', 'Dabei kann ich nicht helfen.'))
    expect(texte(z).slice(2)).toEqual(['Wie wird morgen das Wetter?', 'Dabei kann ich nicht helfen.'])
  })

  test('mitten im Katalog: die Frage wird keine Antwort, Luna antwortet und fragt erneut', async () => {
    const erfasse = antwortet('frage', 'Ca. 95–140 € pro Stunde.')
    const z = await lauf(['Installateur', 'Was kostet das?'], erfasse)
    expect(z.anfrage.antworten).toEqual({})
    expect(texte(z).slice(-2)).toEqual(['Ca. 95–140 € pro Stunde.', 'Was ist das Problem?'])
    expect(erfasse.mock.calls[0][1]).toMatchObject({ phase: 'ASKING', pending: { id: 'was' } })
  })

  test('KI fällt aus: Ersatztext mit Telefon, die offene Frage kommt erneut', async () => {
    const z = await lauf(['Installateur', 'Wie lange dauert das?'], ausfall())
    expect(z.anfrage.antworten).toEqual({})
    expect(texte(z).slice(-2)).toEqual([ersatz, 'Was ist das Problem?'])
    // ohne KI genauso
    expect(texte(await lauf(['Installateur', 'Wie lange dauert das?'])).slice(-2)).toEqual([ersatz, 'Was ist das Problem?'])
  })

  test('Attrappe {} und fehlende absicht: Angaben wie vor dem Ausbau; eine Frage ohne Antwort bekommt den Ersatztext', async () => {
    const leer = vi.fn<Erfasser>().mockResolvedValue({})
    let z = await lauf(['Installateur', 'Es ist unter der Spüle in der Küche'], leer)
    expect(z.anfrage.antworten.was).toBe('Es ist unter der Spüle in der Küche')
    expect(texte(z)).not.toContain(ersatz)
    z = await lauf(['Installateur', 'Was kostet das?'], leer)
    expect(texte(z).slice(-2)).toEqual([ersatz, 'Was ist das Problem?'])
    z = await lauf(['Mir ist kalt, ist das schlimm?'], vi.fn<Erfasser>().mockResolvedValue({ absicht: 'unsinn', category: 'shk' }))
    expect(z.anfrage.gewerk).toBe('shk')
    expect(z.phase).toBe('ASKING')
  })

  test('Anliegen mit Frage: Felder übernommen, Antwort gezeigt, der Ablauf geht weiter', async () => {
    const erfasse = vi.fn<Erfasser>().mockResolvedValue({ absicht: 'anliegen', category: 'shk', reply: 'Ca. 95–140 € pro Stunde.' })
    const z = await lauf(['Meine Heizung ist kalt, was kostet das?'], erfasse)
    expect(z.anfrage.gewerk).toBe('shk')
    expect(texte(z)).toContain('Ca. 95–140 € pro Stunde.')
    expect(z.phase).toBe('ASKING')
  })

  test('eine Frage, die eine Schnellantwort nennt, zählt als Antwort', async () => {
    const z = await lauf(['Installateur', 'Wasser tritt aus', 'Küche?'])
    expect(z.anfrage.antworten.wo).toBe('Küche')
  })

  test('Ort-Schritt: Frage beantwortet, dann die Bitte um die PLZ; eine gültige PLZ der KI zählt', async () => {
    const bisOrt = ['Schlüsseldienst', 'Ausgesperrt', 'Zugefallen', 'Wohnung', 'Ja', 'So schnell wie möglich']
    let z = await lauf([...bisOrt, 'Warum brauchen Sie die?'], antwortet('frage', 'Damit ein Betrieb aus Ihrer Nähe kommt.'))
    expect(z.phase).toBe('LOCATION')
    expect(texte(z).slice(-2)).toEqual(['Damit ein Betrieb aus Ihrer Nähe kommt.', copy.luna.plzFehler])
    z = await lauf([...bisOrt, 'Warum brauchen Sie die?'], ausfall())
    expect(texte(z).slice(-2)).toEqual([ersatz, copy.luna.plzFehler])
    z = await lauf([...bisOrt, 'Wien Favoriten'], vi.fn<Erfasser>().mockResolvedValue({ absicht: 'anliegen', postalCode: '1100' }))
    expect(z.anfrage).toMatchObject({ plz: '1100', ort: 'Wien' })
    expect(z.phase).toBe('SUMMARY')
  })

  test('Zusammenfassung: Frage unter der Karte beantwortet, die Ergänzung bleibt leer', async () => {
    let z = await lauf(['Installateur', 'Unter der Spüle tritt Wasser aus.', 'Küche', 'Tropft nur', 'Nein', 'So schnell wie möglich', '1020 Wien'])
    expect(z.phase).toBe('SUMMARY')
    expect(z.vorKarte).toBe(z.verlauf.length)
    z = await lauf(['Muss ich zu Hause sein?'], antwortet('frage', 'Ja, der Betrieb kommt zu Ihnen.'), z)
    expect(z.phase).toBe('SUMMARY')
    expect(z.anfrage.zusatz).toBe('')
    expect(texte(z).slice(z.vorKarte)).toEqual(['Muss ich zu Hause sein?', 'Ja, der Betrieb kommt zu Ihnen.'])
    z = await lauf(['Wie lange dauert es?'], ausfall(), z)
    expect(letzte(z)).toBe(ersatz)
    // Keine Antwort der KI: auch dann der Hinweis aufs Telefon, die Frage wird keine Ergänzung
    z = await lauf(['Kommt der Betrieb heute?'], vi.fn<Erfasser>().mockResolvedValue({}), z)
    expect(letzte(z)).toBe(ersatz)
    expect(z.anfrage.zusatz).toBe('')
  })

  test('nach dem Senden: Fragen an die KI, sonst ein fester Satz ohne KI; beim Sendefehler nur die Ergänzung', async () => {
    const z = await lauf(['Installateur', 'Unter der Spüle tritt Wasser aus.', 'Küche', 'Tropft nur', 'Nein', 'So schnell wie möglich', '1020 Wien'])
    const fertig = gesendet(z, 'FOUND')
    expect(fertig).toMatchObject({ verlauf: [], vorKarte: 0 })
    const erfasse = antwortet('frage', 'Der Betrieb ruft Sie zurück.')
    expect(texte(await lauf(['Wann ruft der Betrieb an?'], erfasse, fertig))).toEqual(['Wann ruft der Betrieb an?', 'Der Betrieb ruft Sie zurück.'])
    expect(erfasse.mock.calls[0][1]).toMatchObject({ phase: 'COMPLETED', match: 'FOUND' })
    erfasse.mockClear()
    expect(letzte(await lauf(['Danke, Maria Huber'], erfasse, fertig))).toBe(`Gern. Bei Fragen zu Ihrer Anfrage erreichen Sie uns unter ${TELEFON}.`)
    expect(erfasse).not.toHaveBeenCalled()
    const fehler = await lauf(['Wann ruft der Betrieb an?'], erfasse, gesendet(z, null))
    expect(erfasse).not.toHaveBeenCalled()
    expect(fehler.anfrage.zusatz).toBe('Wann ruft der Betrieb an?')
  })

  test('Gefahrenwort in einer Frage: Notruf-Hinweis, aber die Anfrage bleibt unverändert', async () => {
    const z = await lauf(['Was mache ich bei Gasgeruch?'], antwortet('frage', 'Öffnen Sie die Fenster.'))
    expect(z.verlauf.filter((n) => n.von === 'notruf')).toHaveLength(1)
    expect(z.anfrage.dringlichkeit).toBeNull()
    expect(letzte(z)).toBe('Öffnen Sie die Fenster.')
  })
})

describe('Zuschlag beim Wunschtermin', () => {
  const samstag = new Date('2026-10-24T12:00:00+02:00')
  const sonntag = new Date('2026-10-25T12:00:00+01:00')
  const dienstag = new Date('2026-10-27T12:00:00+01:00')
  test.each([
    ['Sonntag Vormittag', dienstag, true],
    ['Montag 20 Uhr', dienstag, true],
    ['um 7:30 Uhr', dienstag, true],
    ['am Abend', dienstag, true],
    ['abends', dienstag, true],
    ['Christtag', dienstag, true],
    ['Montag 10 Uhr', dienstag, false],
    ['Morgen', dienstag, false],
    ['Morgen', samstag, true],
    ['morgen früh', sonntag, true], // Montag, 26.10.: Nationalfeiertag
    ['Diese Woche', samstag, false],
  ])('„%s“ (%s): %s', (termin, jetzt, erwartet) => expect(zuschlagImTermin(termin, jetzt)).toBe(erwartet))

  test('Hinweis nach dem Wunschtermin, vor der Frage nach der PLZ', async () => {
    const z = await lauf(['Schlüsseldienst', 'Ausgesperrt', 'Zugefallen', 'Wohnung', 'Ja', 'In den nächsten Tagen', 'Sonntag um 10'])
    expect(texte(z).slice(-2)).toEqual([copy.preisuebersicht.hinweiseDialog[0], expect.stringContaining('Postleitzahl')])
  })
})

describe('Zusammenfassung und Versand', () => {
  const bisZusammenfassung = () => lauf(['Installateur', 'Unter der Spüle tritt Wasser aus.', 'Küche', 'Tropft nur', 'Nein', 'So schnell wie möglich', '1020 Wien'])

  test('Lead mit allen Feldern, Kontakt nur aus der Karte', async () => {
    const z = mitId(await bisZusammenfassung())
    expect(z.anfrageId).toMatch(/^F247-[A-Z0-9]{6}$/)
    expect(mitId(z).anfrageId).toBe(z.anfrageId)
    const lead = zuLead(z, KONTAKT)
    expect(lead).toMatchObject({
      anfrageId: z.anfrageId,
      name: 'Maria Huber',
      tel: '0664 1234567',
      plz: '1020',
      ort: 'Wien',
      kategorie: 'installateur',
      bereich: 'Installateur',
      dringlichkeit: 'URGENT',
      antworten: { was: 'Unter der Spüle tritt Wasser aus.', wo: 'Küche', menge: 'Tropft nur', abgestellt: 'Nein' },
    })
    expect(lead.text).toContain('Wo: Küche')
    expect(JSON.stringify(z)).not.toContain('0664')
    expect(kurzfassung(z.anfrage, KONTAKT)).toBe(
      'Installateur, 1020 Wien, so schnell wie möglich. Unter der Spüle tritt Wasser aus. Maria Huber, 0664 1234567',
    )
  })

  test('gesendet: FOUND/NONE schließen ab, Fehler bleibt mit allen Angaben', async () => {
    const z = await bisZusammenfassung()
    expect(gesendet(z, 'FOUND')).toMatchObject({ phase: 'COMPLETED', match: 'FOUND' })
    expect(gesendet(z, 'NONE')).toMatchObject({ phase: 'COMPLETED', match: 'NONE' })
    expect(gesendet(z, null)).toMatchObject({ phase: 'ERROR', anfrage: z.anfrage })
    expect(fortschritt(gesendet(z, 'FOUND'))).toBeNull()
  })

  test('„Angaben ändern“: Gewerk und Beschreibung bleiben, die Fragen beginnen neu', async () => {
    const z = aendern(await lauf(['Wasser tropft unter der Spüle', 'Tropft nur', 'Küche', 'Nein', 'So schnell wie möglich', '1020']))
    expect(z.phase).toBe('ASKING')
    expect(z.anfrage).toMatchObject({ gewerk: 'installateur', problem: 'Wasser tropft unter der Spüle', plz: '', antworten: {}, dringlichkeit: null })
    expect(letzte(z)).toBe('Was ist das Problem?')
  })
})
