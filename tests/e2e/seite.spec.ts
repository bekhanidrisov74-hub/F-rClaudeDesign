import { DOMAIN } from '../../src/content/contact'
import { expect, test } from './test'

const PFADE = ['/', '/impressum/', '/datenschutz/', '/agb/']
const nurEinmal = (name: string) => test.skip(name !== 'm390', 'unabhängig von der Breite, läuft nur einmal')

for (const pfad of PFADE) {
  test(`${pfad}: keine Fehler, keine fremden Anfragen, keine Cookies`, async ({ page, context }) => {
    const fehler: string[] = []
    const fremd: string[] = []
    page.on('console', (m) => m.type() === 'error' && fehler.push(m.text()))
    page.on('pageerror', (e) => fehler.push(e.message))
    page.on('request', (r) => {
      const host = new URL(r.url()).hostname
      if (!['localhost', '127.0.0.1'].includes(host) && !r.url().startsWith('data:')) fremd.push(r.url())
    })
    await page.goto(pfad)
    await page.waitForLoadState('networkidle')
    expect(fehler, 'Konsolen- oder Hydrationsfehler').toEqual([])
    expect(fremd, 'Anfragen an fremde Hosts').toEqual([])
    expect(await context.cookies()).toEqual([])
  })
}

test('HTML ist vorgerendert und hat Meta-Angaben', async ({ request }, info) => {
  nurEinmal(info.project.name)
  const html = await (await request.get('/')).text()
  expect(html).toContain('<html lang="de-AT">')
  expect(html).toContain('Rund um die Uhr.')
  expect(html).toMatch(/<title>[^<]+<\/title>/)
  for (const meta of ['name="description"', 'property="og:title"', 'property="og:description"', 'property="og:type"', 'property="og:locale"', 'property="og:site_name"'])
    expect(html).toContain(meta)
  expect(html).toContain('rel="icon" href="/favicon.svg"')
  expect(html).not.toContain('noindex')

  // Eine Adresse für canonical und og:url; das Vorschaubild muss im Build liegen (die Bilder werden öfter getauscht).
  expect(html).toContain(`<link rel="canonical" href="${DOMAIN}/" />`)
  expect(html).toContain(`<meta property="og:url" content="${DOMAIN}/" />`)
  const bild = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ?? ''
  expect(bild.startsWith(`${DOMAIN}/`), 'og:image fehlt oder ist nicht absolut').toBe(true)
  expect((await request.get(bild.slice(DOMAIN.length))).status()).toBe(200)

  // Strukturierte Daten: nur Organization und WebSite (fixit247 vermittelt), Gebiet Österreich, kein Platzhalter wie „[Telefonnummer]“.
  const json = html.match(/<script type="application\/ld\+json">(.+?)<\/script>/)?.[1]
  expect(json, 'JSON-LD fehlt').toBeTruthy()
  const graph: Record<string, unknown>[] = JSON.parse(json!)['@graph']
  expect(graph.map((knoten) => knoten['@type'])).toEqual(['Organization', 'WebSite'])
  const [org, website] = graph
  expect(org.areaServed).toEqual({ '@type': 'Country', name: 'Österreich' })
  expect(website).toMatchObject({ name: 'fixit247', url: `${DOMAIN}/` })
  expect(json).not.toMatch(/"\[[^"]*\]"/)
})

test('Platzhalterseiten tragen noindex', async ({ request }, info) => {
  nurEinmal(info.project.name)
  for (const pfad of PFADE.slice(1)) {
    const antwort = await request.get(pfad)
    expect(antwort.status()).toBe(200)
    expect(await antwort.text()).toContain('<meta name="robots" content="noindex" />')
  }
})

test('unbekannte Seite liefert 404', async ({ request }, info) => {
  nurEinmal(info.project.name)
  expect((await request.get('/gibt-es-nicht')).status()).toBe(404)
})

test('sitemap.xml und robots.txt', async ({ request }, info) => {
  nurEinmal(info.project.name)
  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.status()).toBe(200)
  const xml = await sitemap.text()
  expect(xml).toContain('<urlset')
  expect(xml).not.toContain('impressum')
  const robots = await request.get('/robots.txt')
  expect(await robots.text()).toContain('User-agent: *')
})

test('kein horizontales Scrollen von 320 bis 1920 px', async ({ page }, info) => {
  nurEinmal(info.project.name)
  for (const breite of [320, 360, 390, 559, 560, 639, 640, 768, 919, 920, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width: breite, height: 900 })
    for (const pfad of PFADE) {
      await page.goto(pfad)
      const ueberlauf = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      expect(ueberlauf, `${pfad} bei ${breite} px`).toBeLessThanOrEqual(0)
    }
  }
})
