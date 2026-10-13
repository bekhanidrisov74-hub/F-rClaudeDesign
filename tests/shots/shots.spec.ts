// npm run shots → tests/screens-actual/<zustand>-<breite>.png (Vergleichstabelle in PLAN.md, Abschnitt 4).
import { test, type Page } from '../e2e/test'
import { oeffneMenue, oeffnePreisuebersicht, rechner, schalteZuschlag, waehleGewerk } from '../e2e/hilfen'

const HOEHE: Record<number, number> = { 390: 844, 1024: 768, 1440: 900 }
const ALLE = [390, 1024, 1440]

interface Zustand {
  name: string
  pfad: string
  breiten?: number[]
  ganzeSeite?: boolean
  vorbereiten?: (page: Page) => Promise<unknown>
  /** Nur dieses Element fotografieren (z. B. den Rechner wie in Screen 13) */
  element?: (page: Page) => ReturnType<Page['locator']>
}

// Jede Phase ergänzt hier ihre Zustände.
const ZUSTAENDE: Zustand[] = [
  { name: 'startseite', pfad: '/', ganzeSeite: true },
  { name: 'falz', pfad: '/', breiten: [390] },
  { name: 'impressum', pfad: '/impressum', breiten: [390, 1440] },
  { name: 'preisuebersicht', pfad: '/', vorbereiten: oeffnePreisuebersicht },
  { name: 'menue', pfad: '/', breiten: [390], vorbereiten: oeffneMenue },
  { name: 'rechner-schluesseldienst', pfad: '/', element: rechner, vorbereiten: (p) => waehleGewerk(p, 'Schlüsseldienst') },
  {
    name: 'rechner-zwei-zuschlaege',
    pfad: '/',
    element: rechner,
    vorbereiten: async (p) => {
      await schalteZuschlag(p, 'Sonntag')
      await schalteZuschlag(p, 'Nacht')
    },
  },
]

for (const z of ZUSTAENDE)
  for (const breite of z.breiten ?? ALLE)
    test(`${z.name}-${breite}`, async ({ page }) => {
      await page.setViewportSize({ width: breite, height: HOEHE[breite] })
      await page.goto(z.pfad)
      await page.evaluate(() => document.fonts.ready)
      await z.vorbereiten?.(page)
      const pfad = `tests/screens-actual/${z.name}-${breite}.png`
      if (z.element) await z.element(page).screenshot({ path: pfad, animations: 'disabled' })
      else await page.screenshot({ path: pfad, fullPage: z.ganzeSeite, animations: 'disabled' })
    })
