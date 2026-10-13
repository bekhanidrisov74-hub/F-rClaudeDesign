import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

interface Zustand {
  name: string
  pfad: string
  vorbereiten?: (page: Page) => Promise<void>
}

/** Jede Phase ergänzt hier ihre Zustände (gleiche Liste wie die Screenshot-Matrix). */
const ZUSTAENDE: Zustand[] = [
  { name: 'startseite', pfad: '/' },
  { name: 'impressum', pfad: '/impressum' },
]

for (const z of ZUSTAENDE)
  test(`axe: ${z.name}`, async ({ page }) => {
    await page.goto(z.pfad)
    await z.vorbereiten?.(page)
    const ergebnis = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(
      ergebnis.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
    ).toEqual([])
  })
