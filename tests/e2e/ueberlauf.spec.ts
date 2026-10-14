import { expect, test, type Page } from './test'
import { chat, lunaBisZusammenfassung, oeffneMenue, oeffnePreisuebersicht, preisDialog } from './hilfen'

// SPEC 4: kein horizontales Scrollen zwischen 320 und 1920 px, auch mit offenen Überlagerungen.
const BREITEN = [320, 360, 390, 559, 560, 639, 640, 768, 919, 920, 1024, 1280, 1440, 1920]

const UEBERLAGERUNGEN: { name: string; oeffnen: (p: Page) => Promise<unknown>; element: (p: Page) => ReturnType<Page['locator']>; nurUnter?: number }[] = [
  { name: 'Preisübersicht', oeffnen: oeffnePreisuebersicht, element: preisDialog },
  { name: 'Handy-Menü', oeffnen: oeffneMenue, element: (p) => p.locator('#menue'), nurUnter: 920 },
  { name: 'Luna (Zusammenfassung)', oeffnen: lunaBisZusammenfassung, element: chat },
]

for (const u of UEBERLAGERUNGEN)
  test(`kein horizontales Scrollen mit offener Überlagerung: ${u.name}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'm390', 'setzt die Breite selbst')
    test.setTimeout(120_000)
    for (const breite of BREITEN) {
      if (u.nurUnter && breite >= u.nurUnter) continue
      await page.setViewportSize({ width: breite, height: 900 })
      await page.goto(`/?breite=${breite}`)
      await u.oeffnen(page)
      const seite = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
      expect(seite, `${u.name} bei ${breite} px: Seite`).toBeLessThanOrEqual(0)
      const innen = await u.element(page).evaluate((el) => {
        // jedes Kind, das breiter ist als sein scrollender Vorfahr, zählt als Überlauf
        // (unsichtbare Beschriftungen wie .sr-only sind absichtlich 1 px breit und zählen nicht)
        const zuBreit = [el, ...el.querySelectorAll('*')].filter(
          (x) => x.scrollWidth > x.clientWidth + 1 && getComputedStyle(x).overflowX !== 'visible' && x.getBoundingClientRect().width > 1,
        )
        return zuBreit.map((x) => `${x.tagName.toLowerCase()}.${(x.className || '').toString().slice(0, 40)}`)
      })
      expect(innen, `${u.name} bei ${breite} px: innen`).toEqual([])
    }
  })
