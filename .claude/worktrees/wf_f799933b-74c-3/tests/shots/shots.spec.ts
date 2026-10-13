// npm run shots → tests/screens-actual/<zustand>-<breite>.png (Vergleichstabelle in PLAN.md, Abschnitt 4).
import { test, type Page } from '@playwright/test'

const HOEHE: Record<number, number> = { 390: 844, 1024: 768, 1440: 900 }
const ALLE = [390, 1024, 1440]

interface Zustand {
  name: string
  pfad: string
  breiten?: number[]
  ganzeSeite?: boolean
  vorbereiten?: (page: Page) => Promise<void>
}

// Jede Phase ergänzt hier ihre Zustände.
const ZUSTAENDE: Zustand[] = [
  { name: 'startseite', pfad: '/', ganzeSeite: true },
  { name: 'falz', pfad: '/', breiten: [390] },
  { name: 'impressum', pfad: '/impressum', breiten: [390, 1440] },
]

for (const z of ZUSTAENDE)
  for (const breite of z.breiten ?? ALLE)
    test(`${z.name}-${breite}`, async ({ page }) => {
      await page.setViewportSize({ width: breite, height: HOEHE[breite] })
      await page.goto(z.pfad)
      await page.evaluate(() => document.fonts.ready)
      await z.vorbereiten?.(page)
      await page.screenshot({
        path: `tests/screens-actual/${z.name}-${breite}.png`,
        fullPage: z.ganzeSeite,
        animations: 'disabled',
      })
    })
