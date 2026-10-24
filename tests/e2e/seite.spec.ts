import { expect, test } from './test'
import { copy } from '../../src/content/copy'
import { DOMAIN, EMAIL, TELEFON, e164 } from '../../src/content/contact'
import { anfrageAnker, gewerke } from '../../src/content/gewerke'
import { gewerkText, gewerkseiten } from '../../src/content/gewerkseiten'
import { partner } from '../../src/content/partner'
import { RATGEBER_PFAD, ratgeber } from '../../src/content/ratgeber'
import { SECURITY_TXT_PFAD, securityTxt } from '../../src/lib/securityTxt'
import { VCARD_PFAD, vcardText } from '../../src/lib/vcard'

/** Rechtsseiten: Platzhalter, tragen noindex und fehlen in der Sitemap */
const RECHTSSEITEN = ['/impressum/', '/datenschutz/', '/agb/']
/** Notfall-Seiten je Gewerk (Bauplan M7), aus gewerke.ts: ein sechstes Gewerk kommt von selbst dazu */
const GEWERKSEITEN = gewerke.map((g) => ({ g, pfad: `/${g.seite}/`, text: gewerkText(g.id) }))
const ALLE = ['/', '/partner-werden/', RATGEBER_PFAD, ...GEWERKSEITEN.map((s) => s.pfad), ...RECHTSSEITEN]
// /404.html: die Seite, die der Webserver für unbekannte Pfade schickt (public/.htaccess)
const MIT_404 = [...ALLE, '/404.html']
const nurEinmal = (name: string) => test.skip(name !== 'm390', 'unabhängig von der Breite, läuft nur einmal')

for (const pfad of MIT_404) {
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

/** Inhalt des einen JSON-LD-Skripts im ausgelieferten HTML */
const jsonLd = (html: string) => {
  const skripte = [...html.matchAll(/<script type="application\/ld\+json">([^<]*)<\/script>/g)]
  expect(skripte, 'genau ein JSON-LD-Skript').toHaveLength(1)
  return JSON.parse(skripte[0][1]) as { '@type': string; itemListElement: { position: number; name: string; item: string }[] }
}

for (const { g, pfad, text } of GEWERKSEITEN)
  test(`${pfad}: eigener Titel und eigene Beschreibung, kanonisch, indexierbar, H1, BreadcrumbList im vorgerenderten HTML`, async ({ request }, info) => {
    nurEinmal(info.project.name)
    const antwort = await request.get(pfad)
    expect(antwort.status()).toBe(200)
    const html = await antwort.text()
    expect(html).toContain(`<title>${text.titel}</title>`)
    expect(html.match(/<meta name="description" content="([^"]*)" \/>/)?.[1]).toBe(text.beschreibung)
    expect(text.beschreibung).not.toBe(copy.meta.beschreibung)
    expect(html).toContain(`<link rel="canonical" href="${DOMAIN}${pfad}" />`)
    expect(html).toContain(`<meta property="og:url" content="${DOMAIN}${pfad}" />`)
    expect(html).not.toContain('noindex')
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]+>/g, '').trim()
    expect(h1).toBe(text.h1)
    expect(html).toContain('vermittelt')
    // nur die BreadcrumbList, keine Behauptung, fixit247 sei Betrieb oder Dienstleister (seo.md)
    expect(html).not.toMatch(/FAQPage|LocalBusiness|"Service"|Plumber|Locksmith|Electrician|HVACBusiness|AggregateRating|HowTo/)
    const liste = jsonLd(html)
    expect(liste['@type']).toBe('BreadcrumbList')
    expect(liste.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: gewerkseiten.brotkrumen.start, item: `${DOMAIN}/` },
      { '@type': 'ListItem', position: 2, name: g.name, item: `${DOMAIN}${pfad}` },
    ])
  })

test(`${RATGEBER_PFAD}: eigener Titel und eigene Beschreibung, kanonisch, indexierbar, H1, BreadcrumbList im vorgerenderten HTML`, async ({ request }, info) => {
  nurEinmal(info.project.name)
  const antwort = await request.get(RATGEBER_PFAD)
  expect(antwort.status()).toBe(200)
  const html = await antwort.text()
  expect(html).toContain(`<title>${ratgeber.meta.titel}</title>`)
  expect(html.match(/<meta name="description" content="([^"]*)" \/>/)?.[1]).toBe(ratgeber.meta.beschreibung)
  expect(html).toContain(`<link rel="canonical" href="${DOMAIN}${RATGEBER_PFAD}" />`)
  expect(html).not.toContain('noindex')
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]+>/g, '').trim()
  expect(h1).toBe(ratgeber.h1)
  expect(html).not.toMatch(/FAQPage|LocalBusiness|"Service"|Plumber|Locksmith|Electrician|HVACBusiness|AggregateRating|HowTo|Article/)
  expect(jsonLd(html).itemListElement).toEqual([
    { '@type': 'ListItem', position: 1, name: gewerkseiten.brotkrumen.start, item: `${DOMAIN}/` },
    { '@type': 'ListItem', position: 2, name: ratgeber.name, item: `${DOMAIN}${RATGEBER_PFAD}` },
  ])
})

test(`${RATGEBER_PFAD}: im Fuß verlinkt, Brotkrumen führen zur Startseite`, async ({ page }) => {
  await page.goto('/')
  await page.locator('footer').getByRole('link', { name: ratgeber.name, exact: true }).click()
  await expect(page).toHaveURL(RATGEBER_PFAD)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(ratgeber.h1)
  const krumen = page.getByRole('navigation', { name: gewerkseiten.brotkrumen.label })
  await expect(krumen.locator('[aria-current="page"]')).toHaveText(ratgeber.name)
  await expect(krumen.getByRole('link', { name: gewerkseiten.brotkrumen.start })).toHaveAttribute('href', '/')
})

test('Gewerk-Seiten: Titel und Beschreibung sind alle verschieden, auch von der Startseite', async ({ request }, info) => {
  nurEinmal(info.project.name)
  const titel = new Set<string>()
  const beschreibungen = new Set<string>()
  for (const pfad of ['/', ...GEWERKSEITEN.map((s) => s.pfad)]) {
    const html = await (await request.get(pfad)).text()
    titel.add(html.match(/<title>([^<]*)<\/title>/)![1])
    beschreibungen.add(html.match(/<meta name="description" content="([^"]*)" \/>/)![1])
  }
  expect(titel.size).toBe(GEWERKSEITEN.length + 1)
  expect(beschreibungen.size).toBe(GEWERKSEITEN.length + 1)
})

test('Startseite: JSON-LD nur Organization und WebSite, ohne Platzhalter; Partner-Seite ohne JSON-LD', async ({ request }, info) => {
  nurEinmal(info.project.name)
  const html = await (await request.get('/')).text()
  const json = html.match(/<script type="application\/ld\+json">(.+?)<\/script>/)?.[1]
  expect(json, 'JSON-LD fehlt').toBeTruthy()
  const graph: Record<string, unknown>[] = JSON.parse(json!)['@graph']
  // fixit247 vermittelt nur: kein LocalBusiness, Service o. Ä. (seo.md)
  expect(graph.map((knoten) => knoten['@type'])).toEqual(['Organization', 'WebSite'])
  const [org, website] = graph
  expect(org).toMatchObject({ name: 'fixit247', url: `${DOMAIN}/`, telephone: `+${e164(TELEFON)}`, email: EMAIL, description: copy.fuss.text })
  expect(website).toMatchObject({ name: 'fixit247', url: `${DOMAIN}/` })
  expect(json).not.toMatch(/"\[[^"]*\]"/)
  expect(await (await request.get('/partner-werden/')).text()).not.toContain('application/ld+json')
})

for (const { g, pfad } of GEWERKSEITEN) {
  test(`${pfad}: sichtbare Brotkrumen passen zum JSON-LD, Startseite ist verlinkt`, async ({ page }) => {
    await page.goto(pfad)
    const krumen = page.getByRole('navigation', { name: gewerkseiten.brotkrumen.label })
    const sichtbar = await krumen.getByRole('listitem').allTextContents()
    expect(sichtbar.map((t) => t.replace('›', '').trim())).toEqual([gewerkseiten.brotkrumen.start, g.name])
    await expect(krumen.getByRole('link', { name: gewerkseiten.brotkrumen.start })).toHaveAttribute('href', '/')
    await expect(krumen.locator('[aria-current="page"]')).toHaveText(g.name)
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!) as { itemListElement: { name: string }[] }
    expect(ld.itemListElement.map((i) => i.name)).toEqual(sichtbar.map((t) => t.replace('›', '').trim()))
  })

  test(`${pfad}: von der Startseite aus verlinkt (Leistungskarte und Fuß), „Anfrage senden“ wählt das Gewerk vor`, async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#leistungen').getByRole('link', { name: `${g.name} im Notfall`, exact: true })).toHaveAttribute('href', pfad)
    await expect(page.locator('footer').getByRole('navigation', { name: gewerkseiten.fuss.titel }).getByRole('link', { name: g.name, exact: true })).toHaveAttribute('href', pfad)
    // „… anfragen“ bleibt der stärkere Knopf: Textlink ist kleiner und steht nach ihm
    await page.locator('#leistungen').getByRole('link', { name: `${g.name} im Notfall`, exact: true }).click()
    await expect(page).toHaveURL(pfad)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(gewerkText(g.id).h1)
    // Vorauswahl kommt nach dem Seitenwechsel auf der Startseite an
    await page.getByRole('link', { name: 'Anfrage senden', exact: true }).click()
    await expect(page).toHaveURL(`/#${anfrageAnker(g.id)}`)
    await expect(page.locator('#anfrage').getByLabel(/^Gewerk/)).toHaveValue(g.id)
  })
}

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
  // Inhalt der 404-Seite (Apache liefert sie per ErrorDocument; vite preview zeigt sie nicht an)
  const html = await (await request.get('/404.html')).text()
  expect(html).toContain('Seite nicht gefunden')
  expect(html).toContain('href="/"')
  expect(html).not.toContain('og:url')
})

test('sitemap.xml und robots.txt', async ({ request }, info) => {
  nurEinmal(info.project.name)
  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.status()).toBe(200)
  const xml = await sitemap.text()
  expect(xml).toContain('<urlset')
  expect(xml).toContain('<loc>https://fixit247.at/</loc>')
  expect(xml).toContain('<loc>https://fixit247.at/partner-werden/</loc>')
  for (const pfad of [RATGEBER_PFAD, ...GEWERKSEITEN.map((s) => s.pfad)]) expect(xml).toContain(`<loc>${DOMAIN}${pfad}</loc>`)
  // Startseite, Partner-Seite, Ratgeber und eine Seite je Gewerk, keine Rechtsseite
  expect(xml.match(/<loc>/g)).toHaveLength(3 + GEWERKSEITEN.length)
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
  test.setTimeout(240_000)
  for (const breite of [320, 360, 390, 559, 560, 639, 640, 768, 919, 920, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width: breite, height: 900 })
    for (const pfad of ALLE) {
      await page.goto(pfad)
      const ueberlauf = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      expect(ueberlauf, `${pfad} bei ${breite} px`).toBeLessThanOrEqual(0)
    }
  }
})
