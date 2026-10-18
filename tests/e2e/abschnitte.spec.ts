import { expect, test, type Page } from './test'
import { gewerke } from '../../src/content/gewerke'

const nurEinmal = (name: string) => test.skip(name !== 'm390', 'läuft nur einmal, setzt die Breite selbst')

/** Erwartete Reihenfolge der Abschnitte. Jede Phase ergänzt ihre Abschnitte. */
const REIHENFOLGE = ['#start', 'section[aria-label="Warum fixit247"]', '#leistungen', '#ablauf', '#preisrechner', '#zusagen', '#anfrage', '#fragen', 'footer']

test('Abschnitte in der richtigen Reihenfolge', async ({ page }) => {
  await page.goto('/')
  const oben: number[] = []
  for (const sel of REIHENFOLGE) {
    const box = await page.locator(sel).first().boundingBox()
    expect(box, sel).not.toBeNull()
    oben.push(box!.y)
  }
  expect(oben).toEqual([...oben].sort((a, b) => a - b))
})

test('Falz 390 × 844: Anrufen, WhatsApp und Anfrage senden liegen über 660 px', async ({ page }, info) => {
  nurEinmal(info.project.name)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const hero = page.locator('#start')
  for (const name of [/Jetzt anrufen/, /WhatsApp/, /Anfrage senden/]) {
    const box = await hero.getByRole('link', { name }).first().boundingBox()
    expect(box, String(name)).not.toBeNull()
    expect(box!.y + box!.height, String(name)).toBeLessThan(660)
  }
})

test('Navigation ab 920 px, darunter Menü-Knopf; Nummer im Kopf 560–919 px und ab 1140 px', async ({ page }, info) => {
  nurEinmal(info.project.name)
  const kopf = page.locator('header').first()
  const pruefe = async (breite: number, nav: boolean, nummer: boolean) => {
    await page.setViewportSize({ width: breite, height: 800 })
    await page.goto('/')
    await expect(kopf.getByRole('navigation', { name: 'Hauptnavigation' }), `Navigation bei ${breite}`).toBeVisible({ visible: nav })
    await expect(kopf.getByRole('button', { name: 'Menü öffnen' }), `Menü-Knopf bei ${breite}`).toBeVisible({ visible: !nav })
    await expect(kopf.getByRole('link', { name: /Anrufen/ }).getByText('[Telefonnummer]'), `Nummer bei ${breite}`).toBeVisible({
      visible: nummer,
    })
  }
  await pruefe(919, false, true)
  await pruefe(920, true, false)
  await pruefe(1139, true, false)
  await pruefe(1140, true, true)
  await pruefe(559, false, false)
  await pruefe(560, false, true)
})

test('Menü-Knopf ist mit dem Menü verbunden', async ({ page }, info) => {
  nurEinmal(info.project.name)
  await page.goto('/')
  const knopf = page.getByRole('button', { name: 'Menü öffnen' })
  await expect(knopf).toHaveAttribute('aria-expanded', 'false')
  const ziel = await knopf.getAttribute('aria-controls')
  expect(await page.locator(`#${ziel}`).count()).toBe(1)
})

test('Anruf-Knöpfe: Türkis mit Tiefsee-Schrift', async ({ page }) => {
  await page.goto('/')
  const knoepfe = page.locator('a[href^="tel:"]:visible').filter({ hasNot: page.locator('footer') })
  const farben = await knoepfe.evaluateAll((els) =>
    els
      .filter((el) => !el.closest('footer'))
      .map((el) => [getComputedStyle(el).backgroundColor, getComputedStyle(el).color].join(' / ')),
  )
  expect(farben.length).toBeGreaterThan(0)
  for (const f of farben) expect(f).toBe('rgb(58, 168, 184) / rgb(0, 27, 42)')
})

test('Gewerke-Icons: 3D-Render in der Farbe der Kategorie, ohne Fläche, 56/64 px', async ({ page }, info) => {
  await page.goto('/')
  const soll = info.project.name === 'm390' ? 56 : 64
  for (const g of gewerke) {
    const icon = page.locator(`[data-gewerk="${g.id}"] img`)
    await icon.scrollIntoViewIfNeeded()
    await expect.poll(() => icon.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0), { message: g.id }).toBe(true)
    const befund = await icon.evaluate(async (img: HTMLImageElement) => {
      await img.decode() // sonst zeichnet drawImage ein noch nicht dekodiertes Bild leer
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 64
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, 64, 64)
      const px = ctx.getImageData(0, 0, 64, 64).data
      // Deckende Pixel nahe Petrol (63, 125, 136) bzw. Orange (232, 132, 42) zählen
      let technik = 0, handwerk = 0, leer = 0
      for (let i = 0; i < px.length; i += 4) {
        if (px[i + 3] < 8) leer++ // fast 0: AVIF-Alpha rauscht leicht
        if (px[i + 3] < 250) continue
        const naehe = (r: number, gr: number, b: number) => Math.hypot(px[i] - r, px[i + 1] - gr, px[i + 2] - b) < 60
        if (naehe(63, 125, 136)) technik++
        if (naehe(232, 132, 42)) handwerk++
      }
      // Lage: oben links genau am Innenabstand der Kachel (kein zusätzlicher Abstand davor)
      const kachel = img.closest('a')!, k = kachel.getBoundingClientRect(), r = img.getBoundingClientRect(), s = getComputedStyle(kachel)
      return {
        breite: Math.round(r.width),
        versatz: [r.left - k.left - parseFloat(s.borderLeftWidth) - parseFloat(s.paddingLeft), r.top - k.top - parseFloat(s.borderTopWidth) - parseFloat(s.paddingTop)].map(Math.round),
        flaeche: getComputedStyle(img).backgroundColor,
        // keine Fläche dahinter: ein guter Teil des Quadrats bleibt durchsichtig
        durchsichtig: leer / (64 * 64) > 0.3,
        // ein leeres Bild darf nicht als Handwerk durchgehen: Mindestmenge an Farbpixeln (heute ≥ 700)
        hauptfarbe: technik + handwerk < 100 ? 'keine' : technik > handwerk ? 'technik' : 'handwerk',
      }
    })
    expect(befund, g.id).toEqual({ breite: soll, versatz: [0, 0], flaeche: 'rgba(0, 0, 0, 0)', durchsichtig: true, hauptfarbe: g.kategorie })
    expect(await icon.evaluate((img: HTMLImageElement) => img.currentSrc)).toMatch(new RegExp(`/icons/${g.icon}-(80|112|128)\\.avif$`))
  }
})

test('Bild 1 reicht am Desktop bis zum rechten Rand', async ({ page }, info) => {
  test.skip(info.project.name !== 'd1440', 'nur Desktop')
  await page.goto('/')
  const box = await page.locator('[data-bild="1"]:visible').boundingBox()
  expect(box).not.toBeNull()
  expect(Math.round(box!.x + box!.width)).toBe(1440)
})

async function bedienelemente(page: Page) {
  return page.locator('a:visible, button:visible, input:visible, select:visible, textarea:visible').evaluateAll((els) =>
    els
      .filter((el) => getComputedStyle(el).display !== 'inline') // Links im Fließtext sind ausgenommen (WCAG 2.5.8)
      .map((el) => {
        const r = el.getBoundingClientRect()
        return { name: (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 40), b: r.width, h: r.height }
      }),
  )
}

for (const pfad of ['/', '/impressum/'])
  test(`${pfad}: Touch-Ziele mindestens 44 × 44 px`, async ({ page }) => {
    await page.goto(pfad)
    const zuKlein = (await bedienelemente(page)).filter((e) => e.b < 44 || e.h < 44)
    expect(zuKlein).toEqual([])
  })

test('Schnellwahl: Kacheltitel einer Reihe auf gleicher Höhe', async ({ page }, info) => {
  nurEinmal(info.project.name)
  for (const breite of [920, 1024, 1180, 1440]) {
    await page.setViewportSize({ width: breite, height: 900 })
    await page.goto(`/?breite=${breite}`)
    const kacheln = await page.locator('section[aria-labelledby="schnellwahl-titel"] a').evaluateAll((els) =>
      els.map((el) => {
        const titel = [...el.querySelectorAll('span')].find((s) => getComputedStyle(s).display !== 'none' && s.textContent && !s.querySelector('svg') && s.className.includes('font-'))
        return { reihe: Math.round(el.getBoundingClientRect().top), titel: Math.round(titel!.getBoundingClientRect().top) }
      }),
    )
    const reihen = new Map<number, number[]>()
    for (const k of kacheln) reihen.set(k.reihe, [...(reihen.get(k.reihe) ?? []), k.titel])
    for (const [reihe, titel] of reihen) expect(new Set(titel).size, `${breite} px, Reihe bei ${reihe}`).toBe(1)
  }
})

test('Häufige Fragen: Tastatur öffnet, immer nur eine Antwort offen', async ({ page }) => {
  await page.goto('/')
  const fragen = page.locator('#fragen details')
  await fragen.nth(0).locator('summary').focus()
  await page.keyboard.press('Enter')
  await expect(fragen.nth(0)).toHaveAttribute('open')
  await fragen.nth(1).locator('summary').click()
  await expect(fragen.nth(1)).toHaveAttribute('open')
  await expect(fragen.nth(0)).not.toHaveAttribute('open')
})

test('Symbole: 3D-Renders in der Farbstellung ihrer Fläche, geladen und dekorativ', async ({ page }) => {
  await page.goto('/')
  // Die Farbstellung steckt im Dateinamen; src steht auch fest, bevor das träge geladene Bild da ist
  const datei = (img: HTMLImageElement) => img.getAttribute('src')!.slice(img.getAttribute('src')!.lastIndexOf('/') + 1)
  // Türkiser Anruf-Knopf im Kopf → Körper Tiefsee; Kreis Tiefsee im großen Anruf-Knopf → Körper Türkis (-hell)
  expect(await page.locator('header a[href^="tel:"] img').first().evaluate(datei)).toBe('ui-anrufen-96.webp')
  expect(await page.locator('#start a[href^="tel:"] img').first().evaluate(datei)).toBe('ui-anrufen-hell-96.webp')
  for (const name of await page.locator('footer img[src*="/icons/ui-"]').evaluateAll((els) => els.map((el) => el.getAttribute('src'))))
    expect(name).toMatch(/-hell-(96|168)\.webp$/)
  const alle = page.locator('img[src*="/icons/ui-"]:visible')
  expect(await alle.count()).toBeGreaterThan(10)
  for (const img of await alle.all()) {
    await img.scrollIntoViewIfNeeded()
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true)
    expect(await img.getAttribute('alt')).toBe('')
  }
})

test('Fuß: Wortmarke füllt die Inhaltsbreite und schließt den Fuß unten über die volle Breite ab', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  const wort = page.locator('footer .wortmarke')
  await expect(wort).toHaveAttribute('aria-hidden', 'true')
  // Offset-Maße statt boundingBox: vor dem Hinscrollen ist die Wortmarke noch nach unten verschoben (aufsteigen)
  const m = await wort.evaluate((el: HTMLElement) => {
    const fuss = el.parentElement!
    const innen = el.querySelector<HTMLElement>('.wrapper')!
    const s = getComputedStyle(innen)
    const text = document.createRange()
    text.selectNodeContents(innen)
    return {
      links: el.offsetLeft,
      breite: el.offsetWidth - fuss.clientWidth,
      // offset-Werte sind gerundet, darum auf 1 px genau
      unten: Math.abs(fuss.clientHeight - el.offsetTop - el.offsetHeight) <= 1,
      fuellt: text.getBoundingClientRect().width / (innen.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight)),
    }
  })
  // Das Licht sitzt in Hintergrund und Buchstaben nur gleich, wenn die Wortmarke unten rechts mit dem Fuß abschließt (app.css, strahl)
  expect({ links: m.links, breite: m.breite, unten: m.unten }).toEqual({ links: 0, breite: 0, unten: true })
  // 0,32 em je px Inhaltsbreite passt zu „fixit247“ in Bricolage 800 (app.css, wortmarke); ändern sich Wort oder Schrift, neu messen
  expect(m.fuellt).toBeGreaterThan(0.97)
  expect(m.fuellt).toBeLessThan(1.01)
})
