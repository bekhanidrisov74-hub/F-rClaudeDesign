import { expect, test } from '@playwright/test'

test('Schriften kommen lokal und mit Breitenachse', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  const geladen = await page.evaluate(() => ({
    display: document.fonts.check('700 44px "Bricolage Grotesque Variable"'),
    text: document.fonts.check('400 17px "Atkinson Hyperlegible Next Variable"'),
  }))
  expect(geladen).toEqual({ display: true, text: true })
  const h1 = await page.locator('h1').evaluate((el) => {
    const s = getComputedStyle(el)
    return { familie: s.fontFamily, staerke: s.fontWeight, breite: s.fontStretch }
  })
  expect(h1.familie).toContain('Bricolage Grotesque Variable')
  expect(h1.staerke).toBe('700')
  expect(h1.breite).toBe('96%')
})

test('Seite: Kalk-Hintergrund, Tiefsee-Schrift', async ({ page }) => {
  await page.goto('/')
  const farben = await page.evaluate(() => {
    const s = getComputedStyle(document.body)
    return { grund: s.backgroundColor, schrift: getComputedStyle(document.documentElement).color }
  })
  expect(farben).toEqual({ grund: 'rgb(242, 247, 249)', schrift: 'rgb(0, 27, 42)' })
})

test('Fokusrahmen: 3 px Türkis, Abstand 3 px', async ({ page }) => {
  await page.goto('/impressum')
  await page.keyboard.press('Tab')
  const fokus = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement
    const s = getComputedStyle(el)
    return { tag: el.tagName, stil: s.outlineStyle, breite: s.outlineWidth, farbe: s.outlineColor, abstand: s.outlineOffset }
  })
  expect(fokus).toEqual({ tag: 'A', stil: 'solid', breite: '3px', farbe: 'rgb(58, 168, 184)', abstand: '3px' })
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
