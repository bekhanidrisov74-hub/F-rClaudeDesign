import { expect, test } from './test'

test('Schriften kommen lokal: Inter auf der ganzen Seite wie im Entwurf „Hero – Desktop 1586“', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  const geladen = await page.evaluate(() => ({
    hero: document.fonts.check('750 88px "Inter Variable"'),
    text: document.fonts.check('400 17px "Inter Variable"'),
    // Die früheren Schriften (Bricolage, Atkinson) sind entfernt und werden nicht mehr geladen
    alt: [...document.fonts].some((f) => /Bricolage|Atkinson/.test(f.family)),
  }))
  expect(geladen).toEqual({ hero: true, text: true, alt: false })
  const stil = (sel: string) =>
    page.locator(sel).evaluate((el) => {
      const s = getComputedStyle(el)
      return { familie: s.fontFamily, staerke: s.fontWeight }
    })
  for (const sel of ['h1', '#leistungen-titel', '#rechner-titel', '#fragen-titel', 'body']) {
    const s = await stil(sel)
    expect(s.familie, sel).toContain('Inter Variable')
    if (sel !== 'body') expect(s.staerke, sel).toBe('750')
  }
})

test('Seite: Kalk-Hintergrund und Tiefsee-Schrift wie im Hero', async ({ page }) => {
  await page.goto('/')
  const farben = await page.evaluate(() => {
    const s = getComputedStyle(document.body)
    return { grund: s.backgroundColor, schrift: getComputedStyle(document.documentElement).color }
  })
  expect(farben).toEqual({ grund: 'rgb(251, 252, 253)', schrift: 'rgb(3, 16, 31)' })
})

test('Fokusrahmen: 3 px, Abstand 3 px, überall Tiefsee wie im Entwurf „Hero – Desktop 1586“', async ({ page }) => {
  await page.goto('/impressum/')
  const fokus = () =>
    page.evaluate(() => {
      const el = document.activeElement as HTMLElement
      const s = getComputedStyle(el)
      return { tag: el.tagName, imKopf: !!el.closest('header'), stil: s.outlineStyle, breite: s.outlineWidth, farbe: s.outlineColor, abstand: s.outlineOffset }
    })
  await page.keyboard.press('Tab')
  expect(await fokus()).toEqual({ tag: 'A', imKopf: true, stil: 'solid', breite: '3px', farbe: 'rgb(3, 16, 31)', abstand: '3px' })
  let danach = await fokus()
  for (let i = 0; i < 12 && danach.imKopf; i++) {
    await page.keyboard.press('Tab')
    danach = await fokus()
  }
  // Knöpfe mit transition-colors blenden die Rahmenfarbe 120 ms lang über
  await expect.poll(fokus).toMatchObject({ imKopf: false, stil: 'solid', breite: '3px', farbe: 'rgb(3, 16, 31)', abstand: '3px' })
})

test('reduced motion schaltet Übergänge ab', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const dauer = await page.evaluate(() => {
    const el = document.createElement('div')
    el.style.transition = 'opacity var(--fx-dur-dialog) var(--fx-ease)'
    document.body.append(el)
    return getComputedStyle(el).transitionDuration
  })
  expect(dauer).toBe('0s')
})
