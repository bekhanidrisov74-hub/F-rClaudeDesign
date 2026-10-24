import { renderToString } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { beschwerdeHref } from '../../src/content/contact'
import { copy, fuelle, GEFAHR, WOHIN } from '../../src/content/copy'
import { anfrageAnker, gewerke, PREISE_STAND, type Gewerk } from '../../src/content/gewerke'
import { gewerkseiten, gewerkText, type GewerkSeitenText } from '../../src/content/gewerkseiten'
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
    // gleicher Satz wie in der freigegebenen Frage „Was heißt „geprüft“?“
    expect(fragen[index].antwort).toContain('Bei Beschwerden pausieren wir die Vermittlung an diesen Betrieb')
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
  seite: 'dachdecker',
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

const DACH_TEXT: GewerkSeitenText = vi.hoisted(() => ({
  h1: 'Dachdecker im Notfall',
  titel: 'Dachdecker im Notfall in Wien: Fachbetrieb vermitteln – fixit247',
  beschreibung: 'Dach undicht nach dem Sturm? fixit247 vermittelt kostenlos einen geprüften Dachdecker aus Wien.',
  lead: 'Sturmschaden, Dach undicht: fixit247 vermittelt Ihnen einen geprüften Dachdecker aus Wien. Die Vermittlung ist kostenlos, der Betrieb ruft Sie zurück.',
  notfall: { lead: 'Ein Fall für den Dachdecker ist es, wenn es hereinregnet.', faelle: ['Dach undicht'] },
}))

vi.mock('../../src/content/gewerkseiten', async (original) => {
  const echt = await original<typeof import('../../src/content/gewerkseiten')>()
  return { ...echt, gewerkText: (id: string) => (id === 'dach' ? DACH_TEXT : echt.gewerkText(id)) }
})

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
    // Link auf die Notfall-Seite (Bauplan M7)
    expect(html).toMatch(/<a [^>]*href="\/dachdecker\/"[^>]*>Dachdecker im Notfall<\/a>/)
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

describe('Notfall-Seiten je Gewerk (M7)', () => {
  const haupt = (html: string) => html.match(/<main[^>]*>([\s\S]*)<\/main>/)?.[1] ?? ''

  test('mit seite in gewerke.ts bekommt jedes Gewerk, auch ein sechstes, eine eigene Seite samt Brotkrumen', async () => {
    const { seiten } = await import('../../src/App')
    expect(gewerke.length).toBeGreaterThanOrEqual(6)
    for (const g of gewerke) {
      expect(g.seite, g.id).toMatch(/^[a-z]+(-[a-z]+)*$/)
      const seite = seiten[`/${g.seite}`]
      expect(seite, g.id).toBeDefined()
      expect(seite.noindex, g.id).toBeUndefined()
      expect(seite.brotkrumen, g.id).toEqual([
        { name: gewerkseiten.brotkrumen.start, pfad: '/' },
        { name: g.name, pfad: `/${g.seite}` },
      ])
    }
    // Brotkrumen haben nur die Seiten der Gewerke und der Ratgeber (B7)
    expect(Object.keys(seiten).filter((p) => seiten[p].brotkrumen)).toEqual([
      ...gewerke.map((g) => `/${g.seite}`),
      '/serioese-notdienste-erkennen',
    ])
  })

  test('eigener Titel und eigene Beschreibung je Seite, Marke am Ende, Beschreibung verschieden von der Startseite', async () => {
    const { seiten } = await import('../../src/App')
    const unsere = gewerke.map((g) => seiten[`/${g.seite}`])
    for (const feld of ['titel', 'beschreibung'] as const) {
      // die Rechtsseiten (noindex) teilen sich die Beschreibung der Startseite
      const alle = Object.values(seiten).filter((s) => !s.noindex).map((s) => s[feld])
      expect(new Set(alle).size, feld).toBe(alle.length)
    }
    for (const s of unsere) {
      expect(s.titel.endsWith(' – fixit247')).toBe(true)
      expect(s.titel).toContain('vermitteln')
      expect(s.beschreibung).toContain('vermittelt')
    }
  })

  test('keine zwei Seiten haben denselben Hauptteil', async () => {
    const { App } = await import('../../src/App')
    const teile = gewerke.map((g) => haupt(renderToString(<App pfad={`/${g.seite}`} />)))
    for (const teil of teile) expect(teil).not.toBe('')
    expect(new Set(teile).size).toBe(teile.length)
  })

  test('jede Seite: ein h1 mit dem Suchbegriff, Anruf-Knopf vor „Anfrage senden“, Gefahr-Hinweis wörtlich, Zahlen wie in den Leistungen', async () => {
    const { App } = await import('../../src/App')
    for (const g of gewerke) {
      const html = renderToString(<App pfad={`/${g.seite}`} />)
      const main = haupt(html)
      expect(html.match(/<h1[ >]/g), g.id).toHaveLength(1)
      expect(main, g.id).toContain(gewerkText(g.id).h1)
      expect(main.indexOf('href="tel:'), g.id).toBeGreaterThan(-1)
      expect(main.indexOf('href="tel:'), g.id).toBeLessThan(main.indexOf(`href="/#${anfrageAnker(g.id)}"`))
      // GEFAHR enthält „“ nicht, aber Apostroph-freie Sonderzeichen: renderToString maskiert nur & < > "
      expect(main, g.id).toContain(GEFAHR)
      expect(main, g.id).toContain(`${g.min}–${g.max} €`)
      expect(main, g.id).toContain(fuelle(copy.preisStand, { stand: PREISE_STAND }))
      expect(main, g.id).toContain('href="/#preisrechner"')
      expect(main, g.id).toContain(g.tipp)
    }
  })

  test('Texte: sie sagen, dass fixit247 vermittelt, und versprechen nichts', async () => {
    const { seiten } = await import('../../src/App')
    for (const g of gewerke) {
      const text = gewerkText(g.id)
      expect(text.lead, g.id).toContain('vermittelt')
      expect(text.lead, g.id).toContain('kostenlos')
      const alle = [text.h1, text.titel, text.beschreibung, text.lead, text.notfall.lead, ...text.notfall.faelle, seiten[`/${g.seite}`].titel].join(' ')
      expect(alle, g.id).not.toMatch(/garantier|sofort|schnell|Minuten|Notdienst|wir reparieren|repariert fixit247|\[/i)
    }
    expect(JSON.stringify(gewerkseiten)).not.toMatch(/garantier|sofort|schnell|Minuten|Notdienst|\[/i)
  })

  test('ein Gewerk ohne Seitentexte bricht mit klarer Meldung ab', () => {
    expect(() => gewerkText('gibt-es-nicht')).toThrow(/gibt-es-nicht/)
  })
})
