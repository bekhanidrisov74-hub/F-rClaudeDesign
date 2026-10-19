import { expect, test } from './test'

test('Schriften kommen lokal: Inter in Kopf und Hero (Entwurf „Hero – Desktop 1586“), sonst Bricolage mit Breitenachse', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  const geladen = await page.evaluate(() => ({
    hero: document.fonts.check('750 88px "Inter Variable"'),
    display: document.fonts.check('700 44px "Bricolage Grotesque Variable"'),
    text: document.fonts.check('400 17px "Atkinson Hyperlegible Next Variable"'),
  }))
  expect(geladen).toEqual({ hero: true, display: true, text: true })
  const stil = (sel: string) =>
    page.locator(sel).evaluate((el) => {
      const s = getComputedStyle(el)
      return { familie: s.fontFamily, staerke: s.fontWeight, breite: s.fontStretch }
    })
  const h1 = await stil('h1')
  expect(h1.familie).toContain('Inter Variable')
  expect(h1.staerke).toBe('750')
  const h2 = await stil('#leistungen-titel')
  expect(h2.familie).toContain('Bricolage Grotesque Variable')
  expect(h2.staerke).toBe('700')
  expect(h2.breite).toBe('96%')
})

test('Seite: Kalk-Hintergrund, Tiefsee-Schrift', async ({ page }) => {
  await page.goto('/')
  const farben = await page.evaluate(() => {
    const s = getComputedStyle(document.body)
    return { grund: s.backgroundColor, schrift: getComputedStyle(document.documentElement).color }
  })
  expect(farben).toEqual({ grund: 'rgb(242, 247, 249)', schrift: 'rgb(0, 27, 42)' })
})

test('Fokusrahmen: 3 px, Abstand 3 px; Türkis, an Links im Kopf Tiefsee wie im Entwurf „Hero – Desktop 1586“', async ({ page }) => {
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
  await expect.poll(fokus).toMatchObject({ imKopf: false, stil: 'solid', breite: '3px', farbe: 'rgb(58, 168, 184)', abstand: '3px' })
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
