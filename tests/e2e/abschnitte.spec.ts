import { expect, test, type Page } from './test'
import { gewerke } from '../../src/content/gewerke'

const nurEinmal = (name: string) => test.skip(name !== 'm390', 'läuft nur einmal, setzt die Breite selbst')

/** Erwartete Reihenfolge der Abschnitte. Jede Phase ergänzt ihre Abschnitte. */
const REIHENFOLGE = ['#start', 'section[aria-label="Warum fixit247"]', '#leistungen', '#ablauf', '#preisrechner', '#anfrage', 'footer']

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

test('Navigation ab 920 px, darunter Menü-Knopf; Nummer im Kopf ab 560 px', async ({ page }, info) => {
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
  await pruefe(920, true, true)
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

test('Gewerke-Icons: Petrol bzw. Orange, ohne Fläche', async ({ page }) => {
  await page.goto('/')
  for (const g of gewerke) {
    const icons = page.locator(`[data-gewerk="${g.id}"] [aria-hidden="true"]:has(svg)`)
    expect(await icons.count(), g.id).toBeGreaterThan(0)
    const stile = await icons.evaluateAll((els) =>
      els.map((el) => ({ farbe: getComputedStyle(el).color, flaeche: getComputedStyle(el).backgroundColor })),
    )
    for (const s of stile)
      expect(s, g.id).toEqual({
        farbe: g.kategorie === 'technik' ? 'rgb(63, 125, 136)' : 'rgb(232, 132, 42)',
        flaeche: 'rgba(0, 0, 0, 0)',
      })
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

for (const pfad of ['/', '/impressum'])
  test(`${pfad}: Touch-Ziele mindestens 44 × 44 px`, async ({ page }) => {
    await page.goto(pfad)
    const zuKlein = (await bedienelemente(page)).filter((e) => e.b < 44 || e.h < 44)
    expect(zuKlein).toEqual([])
  })
