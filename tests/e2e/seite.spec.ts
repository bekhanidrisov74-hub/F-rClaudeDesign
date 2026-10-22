import { expect, test } from './test'
import { copy } from '../../src/content/copy'
import { DOMAIN } from '../../src/content/contact'
import { partner } from '../../src/content/partner'
import { SECURITY_TXT_PFAD, securityTxt } from '../../src/lib/securityTxt'
import { VCARD_PFAD, vcardText } from '../../src/lib/vcard'

/** Rechtsseiten: Platzhalter, tragen noindex und fehlen in der Sitemap */
const RECHTSSEITEN = ['/impressum/', '/datenschutz/', '/agb/']
const ALLE = ['/', '/partner-werden/', ...RECHTSSEITEN]
const nurEinmal = (name: string) => test.skip(name !== 'm390', 'unabhängig von der Breite, läuft nur einmal')

for (const pfad of ALLE) {
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
  for (const meta of ['name="description"', 'property="og:title"', 'property="og:description"', 'property="og:type"', 'property="og:locale"'])
    expect(html).toContain(meta)
  expect(html).toContain('rel="icon" href="/favicon.svg"')
  expect(html).not.toContain('noindex')
})

test('/partner-werden/: eigener Titel und eigene Beschreibung, kanonisch, indexierbar, H1 im vorgerenderten HTML', async ({ request }, info) => {
  nurEinmal(info.project.name)
  const antwort = await request.get('/partner-werden/')
  expect(antwort.status()).toBe(200)
  const html = await antwort.text()
  expect(html).toContain('<title>Partner werden: Anfragen für Fachbetriebe – fixit247</title>')
  const beschreibung = html.match(/<meta name="description" content="([^"]*)" \/>/)?.[1]
  expect(beschreibung).toBe(partner.meta.beschreibung)
  expect(beschreibung).not.toBe(copy.meta.beschreibung)
  expect(html).toContain('<link rel="canonical" href="https://fixit247.at/partner-werden/" />')
  expect(html).toContain('<meta property="og:url" content="https://fixit247.at/partner-werden/" />')
  expect(html).not.toContain('noindex')
  // Text der H1 ohne Tags und React-Kommentare
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]+>/g, '').trim()
  expect(h1).toBe('Partner werden')
})

test('Platzhalterseiten tragen noindex', async ({ request }, info) => {
  nurEinmal(info.project.name)
  for (const pfad of RECHTSSEITEN) {
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
  expect(xml).toContain('<loc>https://fixit247.at/</loc>')
  expect(xml).toContain('<loc>https://fixit247.at/partner-werden/</loc>')
  for (const rechtsseite of ['impressum', 'datenschutz', 'agb']) expect(xml).not.toContain(rechtsseite)
  const robots = await request.get('/robots.txt')
  expect(await robots.text()).toContain('User-agent: *')
})

test('Nummer speichern (M10): Datei und Fuß-Link gibt es nur mit echter Nummer und Firma', async ({ page, request }, info) => {
  nurEinmal(info.project.name)
  const link = page.locator('footer a[href="/fixit247.vcf"]')
  const antwort = await request.get(VCARD_PFAD)
  await page.goto('/')
  if (vcardText === null) {
    // Platzhalter: weder Datei noch toter Link
    expect(antwort.status()).toBe(404)
    await expect(link).toHaveCount(0)
  } else {
    expect(antwort.status()).toBe(200)
    expect(await antwort.text()).toBe(vcardText)
    await expect(link).toHaveCount(1)
    await expect(link).toHaveAttribute('download', '')
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  }
})

test('security.txt (M11): Datei gibt es nur mit echter E-Mail-Adresse, dann mit Contact und Expires in der Zukunft', async ({ request }, info) => {
  nurEinmal(info.project.name)
  const antwort = await request.get(SECURITY_TXT_PFAD)
  if (securityTxt() === null) {
    // Platzhalter: keine Datei
    expect(antwort.status()).toBe(404)
  } else {
    expect(antwort.status()).toBe(200)
    expect(antwort.headers()['content-type']).toContain('text/plain')
    const text = await antwort.text()
    expect(text).toMatch(/^Contact: mailto:\S+@\S+$/m)
    expect(Date.parse(text.match(/^Expires: (.+)$/m)![1])).toBeGreaterThan(Date.now())
    expect(text).toContain(`Canonical: ${DOMAIN}${SECURITY_TXT_PFAD}\n`)
    expect(text).not.toContain('\r')
  }
})

test('kein horizontales Scrollen von 320 bis 1920 px', async ({ page }, info) => {
  nurEinmal(info.project.name)
  test.setTimeout(90_000)
  for (const breite of [320, 360, 390, 559, 560, 639, 640, 768, 919, 920, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width: breite, height: 900 })
    for (const pfad of ALLE) {
      await page.goto(pfad)
      const ueberlauf = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      expect(ueberlauf, `${pfad} bei ${breite} px`).toBeLessThanOrEqual(0)
    }
  }
})
