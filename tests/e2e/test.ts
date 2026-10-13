// Playwright-`test` für alle Specs: page.goto wartet, bis React hydriert hat.
import { test as basis } from '@playwright/test'

export { expect, type Page } from '@playwright/test'

export const test = basis.extend({
  page: async ({ page }, use) => {
    const goto = page.goto.bind(page)
    page.goto = async (url, optionen) => {
      const antwort = await goto(url, optionen)
      if (antwort?.ok() !== false) await page.locator('html[data-hydriert]').waitFor({ state: 'attached' })
      return antwort
    }
    await use(page)
  },
})
