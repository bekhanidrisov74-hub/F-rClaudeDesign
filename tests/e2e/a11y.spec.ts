import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { oeffneMenue, oeffnePreisuebersicht, schalteZuschlag, waehleGewerk } from './hilfen'

interface Zustand {
  name: string
  pfad: string
  vorbereiten?: (page: Page) => Promise<unknown>
  nurUnter920?: boolean
}

/** Jede Phase ergänzt hier ihre Zustände (gleiche Liste wie die Screenshot-Matrix). */
const ZUSTAENDE: Zustand[] = [
  { name: 'startseite', pfad: '/' },
  { name: 'impressum', pfad: '/impressum' },
  { name: 'preisuebersicht', pfad: '/', vorbereiten: oeffnePreisuebersicht },
  { name: 'rechner-schluesseldienst', pfad: '/', vorbereiten: (p) => waehleGewerk(p, 'Schlüsseldienst') },
  {
    name: 'rechner-zwei-zuschlaege',
    pfad: '/',
    vorbereiten: async (p) => {
      await schalteZuschlag(p, 'Sonntag')
      await schalteZuschlag(p, 'Nacht')
    },
  },
  { name: 'menue', pfad: '/', nurUnter920: true, vorbereiten: oeffneMenue },
]

for (const z of ZUSTAENDE)
  test(`axe: ${z.name}`, async ({ page }) => {
    test.skip(!!z.nurUnter920 && page.viewportSize()!.width >= 920, 'nur unter 920 px')
    await page.goto(z.pfad)
    await z.vorbereiten?.(page)
    const ergebnis = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(
      ergebnis.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
    ).toEqual([])
  })
