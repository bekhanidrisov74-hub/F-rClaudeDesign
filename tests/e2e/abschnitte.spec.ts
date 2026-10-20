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

test('Hero über 1586 px: Text im Rahmen, Foto bis zum Fensterrand (höchstens 1,25-fach), Raster-Muster ab dem Rand', async ({ page }, info) => {
  test.skip(info.project.name !== 'd1440', 'setzt die Breite selbst')
  for (const breite of [1920, 2000, 2560]) {
    await page.setViewportSize({ width: breite, height: 1200 })
    await page.goto('/')
    const m = await page.evaluate(() => {
      const r = (sel: string) => document.querySelector(sel)!.getBoundingClientRect()
      const anfrage = getComputedStyle(document.querySelector('.hd-anfrage')!)
      return {
        lead: r('.hd-lead').left, textRechts: r('.hd-info').right, foto: r('.hd-foto'), raster: r('.hd-raster').left,
        anfrageRand: `${anfrage.borderTopStyle} ${anfrage.borderTopColor}`, fenster: document.documentElement.clientWidth,
      }
    })
    const rand = (m.fenster - 1586) / 2
    expect(Math.round(m.lead), `${breite}: Text auf der Rahmenkante`).toBe(Math.round(rand + 100))
    expect(m.foto.left, `${breite}: kein Loch zwischen Text und Foto`).toBeLessThan(m.textRechts)
    expect(m.foto.width, `${breite}: höchstens 1,25-fach`).toBeLessThanOrEqual(1006 * 1.25 + 0.5)
    // Reicht die 1,25-fache Breite nicht bis zum Rand, läuft das Foto dort per Maske aus (hero.css)
    expect(Math.round(m.foto.right), `${breite}: Foto bis zum Fensterrand`).toBe(Math.round(Math.min(m.fenster, m.foto.left + 1006 * 1.25)))
    expect(Math.round(m.raster), `${breite}: Raster-Muster ab dem Fensterrand`).toBe(0)
    // „Anfrage senden“ behält seinen Rand (die Farbe --fx-hd-rand darf nicht von einer gleichnamigen Länge überschrieben werden)
    expect(m.anfrageRand, `${breite}: Rand von „Anfrage senden“`).toBe('solid rgb(124, 132, 148)')
  }
})

/** Abschnitte der Startseite in Seitenreihenfolge ab „Was ist passiert?“, mit Fläche laut docs/hero-stil.md (Flächenplan). */
const FLAECHEN: { name: string; sel: string; farbe: string }[] = [
  { name: 'Was ist passiert?', sel: 'section[aria-labelledby="schnellwahl-titel"]', farbe: 'rgb(232, 244, 248)' }, // Eis
  { name: 'Leistungen', sel: '#leistungen', farbe: 'rgb(251, 252, 253)' }, // Kalk
  { name: "So funktioniert's", sel: '#ablauf', farbe: 'rgb(3, 16, 31)' }, // Tiefsee
  { name: 'Preisrechner', sel: '#preisrechner', farbe: 'rgb(251, 252, 253)' }, // Kalk
  { name: 'Zusagen', sel: '#zusagen', farbe: 'rgb(232, 244, 248)' }, // Eis
  { name: 'Anfrage', sel: '#anfrage', farbe: 'rgb(251, 252, 253)' }, // Kalk
  { name: 'Häufige Fragen', sel: '#fragen', farbe: 'rgb(232, 244, 248)' }, // Eis
  { name: 'Fuß', sel: 'footer', farbe: 'rgb(3, 16, 31)' }, // Tiefsee
]

test('Gemeinsames Raster: alle Abschnitte auf der Textlinie des Hero, rechts bündig mit dem Kopf', async ({ page }, info) => {
  test.skip(info.project.name !== 'd1440', 'setzt die Breite selbst')
  test.setTimeout(60_000)
  for (const breite of [390, 768, 1024, 1280, 1440, 1586, 1920, 2560]) {
    await page.setViewportSize({ width: breite, height: 900 })
    await page.goto('/')
    const m = await page.evaluate((selektoren) => {
      const abschnitte = selektoren.map((sel) => {
        const wrapper = document.querySelector(`${sel} .wrapper`)!.getBoundingClientRect()
        const s = getComputedStyle(document.querySelector(`${sel} .wrapper`)!)
        return { sel, links: wrapper.left + parseFloat(s.paddingLeft), rechts: wrapper.right - parseFloat(s.paddingRight) }
      })
      return {
        lead: document.querySelector('.hd-lead')!.getBoundingClientRect().left,
        anrufen: document.querySelector('.hd-kopf .hd-anrufen')!.getBoundingClientRect().right,
        abschnitte,
      }
    }, FLAECHEN.map((f) => f.sel))
    for (const a of m.abschnitte) expect(Math.abs(a.links - m.lead), `${breite} px, ${a.sel}: Inhaltskante links gegen Hero-Text`).toBeLessThanOrEqual(1)
    const rechts = m.abschnitte[0].rechts
    for (const a of m.abschnitte) expect(Math.abs(a.rechts - rechts), `${breite} px, ${a.sel}: Inhaltskante rechts gegen „${m.abschnitte[0].sel}“`).toBeLessThanOrEqual(1)
    // Unter 1280 px folgt auf „Anrufen“ der Menü-Knopf; erst ab 1280 px endet „Anrufen“ im Kopf an der rechten Inhaltskante
    if (breite >= 1280) expect(Math.abs(m.anrufen - rechts), `${breite} px: „Anrufen“ im Kopf gegen rechte Inhaltskante`).toBeLessThanOrEqual(2)
  }
})

test('Flächenplan: Eis, Kalk und Tiefsee wechseln wie in docs/hero-stil.md', async ({ page }, info) => {
  test.skip(info.project.name !== 'd1440', 'eine Breite genügt')
  await page.goto('/')
  const farben = await page.evaluate(
    (selektoren) => selektoren.map((sel) => getComputedStyle(document.querySelector(sel)!).backgroundColor),
    FLAECHEN.map((f) => f.sel),
  )
  expect(farben.map((farbe, i) => `${FLAECHEN[i].name}: ${farbe}`)).toEqual(FLAECHEN.map((f) => `${f.name}: ${f.farbe}`))
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

test('Leistungen am Handy: Wischreihe auf der Textlinie, ab 736 px wieder Raster', async ({ page }, info) => {
  test.skip(info.project.name !== 'm390', 'setzt die Breite selbst')
  for (const breite of [320, 390, 735]) {
    await page.setViewportSize({ width: breite, height: 844 })
    await page.goto('/')
    const m = await page.evaluate(() => {
      const reihe = document.querySelector('#leistungen .wischreihe')!
      const karten = [...reihe.children].map((k) => k.getBoundingClientRect())
      return {
        lead: document.querySelector('.hd-lead')!.getBoundingClientRect().left,
        erste: karten[0].left,
        zweite: karten[1].left,
        quer: reihe.scrollWidth > reihe.clientWidth,
        seite: document.documentElement.scrollWidth - innerWidth,
      }
    })
    expect(Math.abs(m.erste - m.lead), `${breite} px: erste Karte auf der Textlinie`).toBeLessThanOrEqual(1)
    expect(m.zweite, `${breite} px: zweite Karte schaut rechts heraus`).toBeLessThan(breite)
    expect(m.quer, `${breite} px: Reihe lässt sich wischen`).toBe(true)
    expect(m.seite, `${breite} px: Seite ohne Querscrollen`).toBeLessThanOrEqual(0)
  }
  await page.setViewportSize({ width: 736, height: 900 })
  await page.goto('/')
  const reihen = await page.evaluate(() => {
    const karten = [...document.querySelectorAll('#leistungen article')].map((k) => Math.round(k.getBoundingClientRect().top))
    return new Set(karten).size
  })
  expect(reihen, '736 px: zwei Spalten, drei Reihen').toBe(3)
})

test('Handy quer: „Jetzt anrufen“ steht ganz auf dem ersten Bildschirm', async ({ page }, info) => {
  test.skip(info.project.name !== 'm390', 'setzt die Größe selbst')
  for (const [breite, hoehe] of [[667, 375], [844, 390], [932, 430]]) {
    await page.setViewportSize({ width: breite, height: hoehe })
    await page.goto('/')
    const unten = await page.locator('.hd-cta').evaluate((el) => el.getBoundingClientRect().bottom)
    expect(unten, `${breite} × ${hoehe}`).toBeLessThanOrEqual(hoehe)
  }
})
