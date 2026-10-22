import { expect, test } from './test'

// WCAG 1.4.12 (AA): Mit den Textabständen des Erfolgskriteriums darf nichts abgeschnitten werden und nichts überlappen.
const ABSTAENDE = '*{line-height:1.5 !important;letter-spacing:.12em !important;word-spacing:.16em !important} p{margin-bottom:2em !important}'
const BREITEN = [320, 390, 768, 1024, 1280, 1440, 1920]

test('Textabstand 1.4.12: Hero ohne Abschneiden, ohne Überlappung, ohne Querscrollen', async ({ page }, info) => {
  test.skip(info.project.name !== 'm390', 'setzt die Breite selbst')
  test.setTimeout(60_000)
  for (const breite of BREITEN) {
    await page.setViewportSize({ width: breite, height: 900 })
    await page.goto(`/?breite=${breite}`)
    await page.addStyleTag({ content: ABSTAENDE })
    const r = await page.evaluate(() => {
      const h1 = document.querySelector('h1')!
      const unten = (s: string) => document.querySelector(s)!.getBoundingClientRect().bottom
      const oben = (s: string) => document.querySelector(s)!.getBoundingClientRect().top
      const hero = document.querySelector('.hd')!
      return {
        seite: document.documentElement.scrollWidth - innerWidth,
        titel: h1.scrollWidth - h1.clientWidth,
        // .hd schneidet ab (overflow: hidden): Nichts darin darf breiter werden als die Fläche, etwa ein Vorteilstitel
        hero: hero.scrollWidth - hero.clientWidth,
        // letzter Block des Hero-Texts endet über den Vorteilen (Foto und Raster sind Deko und dürfen hineinragen)
        luft: oben('.hd-vorteil') - unten('.hd-info'),
      }
    })
    expect(r.seite, `${breite} px: Seite`).toBeLessThanOrEqual(0)
    expect(r.titel, `${breite} px: Überschrift`).toBeLessThanOrEqual(1)
    expect(r.hero, `${breite} px: Hero und Vorteile`).toBeLessThanOrEqual(1)
    expect(r.luft, `${breite} px: Hero-Text über Vorteilen`).toBeGreaterThanOrEqual(0)
  }
})
