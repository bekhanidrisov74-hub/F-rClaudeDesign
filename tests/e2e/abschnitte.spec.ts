import { expect, test, type Page } from './test'
import { gewerke } from '../../src/content/gewerke'

const nurEinmal = (name: string) => test.skip(name !== 'm390', 'läuft nur einmal, setzt die Breite selbst')

/** Erwartete Reihenfolge der Abschnitte. Jede Phase ergänzt ihre Abschnitte. */
const REIHENFOLGE = ['#start', 'section[aria-label="Ihre Vorteile"]', '#leistungen', '#ablauf', '#preisrechner', '#zusagen', '#anfrage', '#fragen', 'footer']

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

test('Falz 390 × 844: Anrufen und Anfrage senden liegen über 660 px', async ({ page }, info) => {
  nurEinmal(info.project.name)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const hero = page.locator('#start')
  for (const name of [/Jetzt anrufen/, /Anfrage senden/]) {
    const box = await hero.getByRole('link', { name }).first().boundingBox()
    expect(box, String(name)).not.toBeNull()
    expect(box!.y + box!.height, String(name)).toBeLessThan(660)
  }
})

test('Navigation und Nummer im Kopf ab 1280 px, darunter Menü-Knopf', async ({ page }, info) => {
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
  await pruefe(390, false, false)
  await pruefe(920, false, false)
  await pruefe(1279, false, false)
  await pruefe(1280, true, true)
  await pruefe(1534, true, true)
})

test('Menü-Knopf ist mit dem Menü verbunden', async ({ page }, info) => {
  nurEinmal(info.project.name)
  await page.goto('/')
  const knopf = page.getByRole('button', { name: 'Menü öffnen' })
  await expect(knopf).toHaveAttribute('aria-expanded', 'false')
  const ziel = await knopf.getAttribute('aria-controls')
  expect(await page.locator(`#${ziel}`).count()).toBe(1)
})

test('Anruf-Knöpfe: überall Türkis mit Tiefsee-Schrift wie im Entwurf „Hero – Desktop 1586“', async ({ page }) => {
  await page.goto('/')
  const knoepfe = page.locator('a[href^="tel:"]:visible').filter({ hasNot: page.locator('footer') })
  const farben = await knoepfe.evaluateAll((els) =>
    els
      .filter((el) => !el.closest('footer'))
      .map((el) => ({
        entwurf: !!el.closest('.hd-kopf, .hd'),
        farbe: [getComputedStyle(el).backgroundColor, getComputedStyle(el).color].join(' / '),
      })),
  )
  expect(farben.filter((f) => f.entwurf).length).toBe(2)
  expect(farben.filter((f) => !f.entwurf).length).toBeGreaterThan(0)
  for (const f of farben) expect(f.farbe).toBe('rgb(34, 181, 192) / rgb(3, 16, 31)')
})

test('Anruf-Knöpfe außerhalb des Hero: Nacht-Kreis mit hellem Hörer wie „Jetzt anrufen“ im Hero', async ({ page }) => {
  await page.goto('/')
  const kreise = await page
    .locator('#leistungen a[href^="tel:"], #preisrechner a[href^="tel:"], #anfrage a[href^="tel:"]:visible')
    .evaluateAll((els) =>
      els.map((el) => {
        const kreis = el.querySelector('svg')!.parentElement!.parentElement!
        const s = getComputedStyle(kreis)
        return { flaeche: s.backgroundColor, hoerer: s.color, rund: s.borderRadius === '999px' }
      }),
    )
  expect(kreise.length).toBeGreaterThanOrEqual(3)
  for (const k of kreise) expect(k).toEqual({ flaeche: 'rgb(2, 16, 34)', hoerer: 'rgb(143, 230, 236)', rund: true })
})

test('Gewerke-Icons: flaches SVG im Lagune-Kreis wie bei den Vorteilen, 56/64 px, oben links in der Kachel', async ({ page }, info) => {
  await page.goto('/')
  const soll = info.project.name === 'm390' ? 56 : 64
  for (const g of gewerke) {
    const kachel = page.locator(`section[aria-labelledby="schnellwahl-titel"] [data-gewerk="${g.id}"]`)
    await expect(kachel.locator('img'), g.id).toHaveCount(0)
    const befund = await kachel.evaluate((a: HTMLElement) => {
      const kreis = a.querySelector('svg')!.parentElement!.parentElement!
      const k = a.getBoundingClientRect(), r = kreis.getBoundingClientRect(), s = getComputedStyle(a), ks = getComputedStyle(kreis)
      return {
        breite: Math.round(r.width),
        hoehe: Math.round(r.height),
        versatz: [r.left - k.left - parseFloat(s.borderLeftWidth) - parseFloat(s.paddingLeft), r.top - k.top - parseFloat(s.borderTopWidth) - parseFloat(s.paddingTop)].map(Math.round),
        flaeche: ks.backgroundColor,
        farbe: ks.color,
        dekorativ: kreis.getAttribute('aria-hidden'),
      }
    })
    expect(befund, g.id).toEqual({ breite: soll, hoehe: soll, versatz: [0, 0], flaeche: 'rgb(190, 240, 246)', farbe: 'rgb(3, 16, 31)', dekorativ: 'true' })
  }
})

test('Hero-Foto reicht am Desktop bis zum rechten Rand', async ({ page }, info) => {
  test.skip(info.project.name !== 'd1440', 'nur Desktop')
  await page.goto('/')
  const box = await page.locator('.hd-foto').boundingBox()
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

test('Symbole: flache SVGs aus design/icons wie im Hero, keine Bilddateien als Icons', async ({ page }) => {
  await page.goto('/')
  // Alle Bilder der Seite sind Fotos bzw. Motive (Hero, Leistungen), keine Icons
  const quellen = await page.locator('img').evaluateAll((els) => els.map((el) => el.getAttribute('src') ?? ''))
  expect(quellen.filter((q) => q.includes('/icons/'))).toEqual([])
  for (const q of quellen) expect(q).toMatch(/^\/images\//)
  // Anruf-Knöpfe in Kopf, Hero, Leistungen und Fuß zeigen den flachen Hörer
  for (const wo of ['header', '#start', '#leistungen', 'footer']) await expect(page.locator(`${wo} a[href^="tel:"] svg`).first(), wo).toBeAttached()
  // dekorativ: jedes Icon steckt in einem aria-hidden-Element
  const offen = await page.locator('svg').evaluateAll((els) => els.filter((el) => !el.closest('[aria-hidden="true"]')).length)
  expect(offen).toBe(0)
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
  // Die Wortmarke schließt den Fuß unten über die volle Breite ab (app.css, wortmarke)
  expect({ links: m.links, breite: m.breite, unten: m.unten }).toEqual({ links: 0, breite: 0, unten: true })
  // 0,288 em je px Inhaltsbreite passt zu „fixit247“ in Inter 800 mit −0,05 em (tokens.css); ändern sich Wort oder Schrift, neu messen
  expect(m.fuellt).toBeGreaterThan(0.97)
  expect(m.fuellt).toBeLessThan(1.01)
})
