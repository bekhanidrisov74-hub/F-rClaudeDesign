import { renderToString } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { beschwerdeHref } from '../../src/content/contact'
import { copy, fuelle, GEFAHR, WOHIN } from '../../src/content/copy'
import { gewerke, PREISE_STAND, type Gewerk } from '../../src/content/gewerke'
import { partner } from '../../src/content/partner'
import { Fragen } from '../../src/components/Fragen'
import { GefahrHinweis, SoGehtEsWeiter } from '../../src/components/ui/SoGehtEsWeiter'

describe('Gewerke-Daten', () => {
  test('sind vollständig und stimmig', () => {
    const ids = gewerke.map((g) => g.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const g of gewerke) {
      expect(g.min, g.id).toBeLessThan(g.max)
      // Flaches Icon im Stil des Hero (ui/IconKreis), eine Datei je Gewerk
      expect(existsSync(`design/icons/${g.icon}.svg`), g.icon).toBe(true)
      for (const feld of ['name', 'schnellwahl', 'karte', 'betrieb', 'tipp', 'tippErfolg'] as const) expect(g[feld], `${g.id}.${feld}`).not.toBe('')
    }
  })
})

describe('Stand der Richtpreise (M5)', () => {
  test('der Satz nennt den Stand, ohne offenen Platzhalter und ohne Garantie-Wort', () => {
    const satz = fuelle(copy.preisStand, { stand: PREISE_STAND })
    expect(PREISE_STAND).not.toBe('')
    expect(satz).toBe(`Stand der Richtpreise: ${PREISE_STAND}.`)
    expect(satz).not.toMatch(/[{}]/)
    expect(satz).not.toMatch(/garant|fest|verbindlich/i)
  })
})

describe('Wohin die Anfrage geht (M4)', () => {
  test('WOHIN nennt einen passenden Fachbetrieb, keine Garantie, keine Löschfrist', () => {
    expect(WOHIN).toContain('einen passenden Fachbetrieb')
    expect(WOHIN).not.toMatch(/garantiert/i)
    expect(WOHIN).not.toMatch(/lösch|\d+\s*(Tage|Monate|Jahre)/i)
  })
})

describe('Wer bezahlt fixit247? (M3)', () => {
  const fragen = copy.fragen.liste
  const index = fragen.findIndex((f) => f.frage === 'Wer bezahlt fixit247?')

  test('die Frage steht direkt nach „Was kostet die Vermittlung?“, einmal', () => {
    expect(fragen.filter((f) => f.frage === 'Wer bezahlt fixit247?')).toHaveLength(1)
    expect(index).toBeGreaterThan(0)
    expect(fragen[index - 1].frage).toBe('Was kostet die Vermittlung?')
  })

  test('die Antwort widerspricht weder „kostenlos“ noch den Partner-Kosten', () => {
    const antwort = fragen[index].antwort
    expect(antwort).toContain('kostenlos')
    expect(antwort).not.toMatch(/\d\s*(€|Euro|%)|Gebühr|Provision|Beitrag|garant/i)
    // partner.ts (KOSTEN): „zum Start kostenlos“; die Antwort darf nichts anderes behaupten
    const kosten = partner.fragen.liste.find((f) => f.frage === 'Was kostet die Partnerschaft?')?.antwort
    expect(kosten).toContain('zum Start kostenlos')
    expect(antwort).toContain('zum Start')
    // die Frage davor sagt dasselbe für die Kundschaft
    expect(fragen[index - 1].antwort).toContain('kostenlos')
  })
})

describe('Beschwerde über einen vermittelten Betrieb (M8)', () => {
  const fragen = copy.fragen.liste
  const index = fragen.findIndex((f) => f.frage === 'Ich bin mit einem vermittelten Betrieb unzufrieden. Was tun?')

  test('die Frage steht direkt nach „Wie geht es nach meiner Anfrage weiter?“, einmal, mit Link', () => {
    expect(fragen.filter((f) => f.frage.startsWith('Ich bin mit einem vermittelten Betrieb unzufrieden'))).toHaveLength(1)
    expect(index).toBeGreaterThan(0)
    expect(fragen[index - 1].frage).toBe('Wie geht es nach meiner Anfrage weiter?')
    const frage = fragen[index] as { antwort: string; link: { text: string; href: string } }
    expect(frage.link).toEqual({ text: 'Beschwerde per E-Mail senden', href: beschwerdeHref })
    expect(frage.antwort).toContain('Anfragenummer')
  })

  test('die Zusage „pausieren“ stammt aus der freigegebenen Frage „Was heißt „geprüft“?“ und nennt keine Fristen', () => {
    // gleiche Zusage, anderer Satzbau: „pausieren bei Beschwerden die Vermittlung“ / „Bei Beschwerden pausieren wir die Vermittlung“
    expect(fragen[index].antwort).toContain('pausieren bei Beschwerden die Vermittlung an diesen Betrieb')
    expect(fragen.find((f) => f.frage === 'Was heißt „geprüft“?')?.antwort).toContain('Bei Beschwerden pausieren wir die Vermittlung an diesen Betrieb')
    expect(fragen[index].antwort).not.toMatch(/\d|garant|innerhalb|Stunde|Tag/i)
  })

  test('nur diese Antwort trägt einen Link, die Fragen-Komponente zeigt ihn unter dem Text', () => {
    expect(fragen.filter((f) => 'link' in f)).toHaveLength(1)
    const html = renderToString(<Fragen />)
    expect(html.match(/<a /g)).toHaveLength(1)
    expect(html).toContain(`href="${beschwerdeHref}"`)
    expect(html).toContain('Beschwerde per E-Mail senden</a>')
    expect(html.indexOf(fragen[index].antwort)).toBeLessThan(html.indexOf('Beschwerde per E-Mail senden'))
  })
})

describe('Notruf überall gleich (M1)', () => {
  const shk = gewerke.find((g) => g.id === 'shk')

  test('GEFAHR nennt bei Gasgeruch 128, dazu 122, 144 und 112', () => {
    expect(GEFAHR).toMatch(/Gasgeruch[^.]*128/)
    for (const nummer of ['122', '144', '112']) expect(GEFAHR, nummer).toContain(nummer)
  })

  test('Luna-Hinweis, Heizung-&-Klima-Tipp und Prompt der KI-Luna nennen bei Gas 128', () => {
    expect(copy.luna.notruf.startsWith(GEFAHR)).toBe(true)
    expect(copy.luna.notruf).toMatch(/Gasgeruch[^.]*128/)
    expect(shk?.tipp).toMatch(/Gas[^.]*128/)
    expect(shk?.tippErfolg).toMatch(/Gas[^.]*128/)
    // chat.php (Prompt der KI-Luna) trägt GEFAHR wörtlich, nicht eine ältere Fassung
    const prompt = readFileSync('public/chat.php', 'utf8')
    expect(prompt).toContain(GEFAHR)
    expect(prompt).not.toMatch(/122 bzw\. 112/)
  })
})

describe('So geht es weiter (B2)', () => {
  test('Gefahr-Hinweis: FAQ und Erfolgskarten nutzen dieselbe Konstante', () => {
    const faq = copy.fragen.liste.find((f) => f.frage === 'Was tue ich bei akuter Gefahr?')
    expect(faq?.antwort).toBe(GEFAHR)
    expect(renderToString(<GefahrHinweis />)).toContain(GEFAHR)
  })

  test('drei Schritte; die E-Mail-Zeile nur mit Adresse, Sonderzeichen werden maskiert', () => {
    const ohne = renderToString(<SoGehtEsWeiter ebene={4} mitSchritten />)
    expect(ohne).toContain('<h4')
    for (const s of copy.weiter.schritte) expect(ohne).toContain(s.titel)
    expect(ohne).not.toContain('Eine Bestätigung')
    expect(renderToString(<SoGehtEsWeiter ebene={3} email="" mitSchritten />)).not.toContain('Eine Bestätigung')
    const mit = renderToString(<SoGehtEsWeiter ebene={3} email="a&b@beispiel.at" mitSchritten />)
    expect(mit).toContain('<h3')
    expect(mit).toContain('Eine Bestätigung schicken wir an a&amp;b@beispiel.at.')
  })

  test('ohne gefundenen Betrieb (NONE) keine Schritte, nur die Zeile zur Bestätigung', () => {
    expect(renderToString(<SoGehtEsWeiter ebene={4} mitSchritten={false} />)).toBe('')
    const mit = renderToString(<SoGehtEsWeiter ebene={4} email="maria@beispiel.at" mitSchritten={false} />)
    expect(mit).toContain('Eine Bestätigung schicken wir an maria@beispiel.at.')
    expect(mit).not.toContain(copy.weiter.titel)
    for (const s of copy.weiter.schritte) expect(mit).not.toContain(s.titel)
  })
})

const SECHSTES: Gewerk = vi.hoisted(() => ({
  id: 'dach',
  name: 'Dachdecker',
  kategorie: 'handwerk',
  abrechnung: 'stunde',
  min: 70,
  max: 110,
  anfahrt: 29.9,
  schnellwahl: 'Dach undicht',
  karte: 'Sturmschaden, Dach undicht',
  bild: 7,
  bildFokus: '50% 50%',
  icon: 'gewerk-installateur',
  betrieb: 'Dachdecker',
  tipp: 'Tipp',
  tippErfolg: 'Tipp',
}))

vi.mock('../../src/content/gewerke', async (original) => {
  const echt = await original<typeof import('../../src/content/gewerke')>()
  return { ...echt, gewerke: [...echt.gewerke, SECHSTES] }
})

describe('ein sechstes Gewerk', () => {
  test('erscheint mit einem Eintrag überall auf der Startseite', async () => {
    const { App } = await import('../../src/App')
    const html = renderToString(<App pfad="/" />)
    // Schnellwahl-Kachel und Leistungskarte („… anfragen“)
    expect(html.match(/data-gewerk="dach"/g)?.length ?? 0).toBeGreaterThanOrEqual(2)
    expect(html).toContain('Dachdecker anfragen')
    expect(html).toContain('70–110 €')
    expect(html).toContain('für diese sechs Bereiche')
  })

  test('erscheint auf „Partner werden“ in der Gewerke-Liste und als Auswahl in der Bewerbung', async () => {
    const { App } = await import('../../src/App')
    const html = renderToString(<App pfad="/partner-werden" />)
    const auswahl = html.match(/<input[^>]*value="dach"[^>]*>/)?.[0]
    expect(auswahl).toContain('type="checkbox"')
    expect(auswahl).toContain('name="gewerke"')
    const liste = html.match(/<ul[^>]*aria-labelledby="partner-gewerke"[^>]*>([\s\S]*?)<\/ul>/)?.[1]
    expect(liste).toContain('Dachdecker')
    expect(liste?.match(/<li/g)).toHaveLength(6)
  })
})
