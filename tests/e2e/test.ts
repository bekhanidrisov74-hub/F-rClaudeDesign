// Playwright-`test` für alle Specs: page.goto wartet, bis React hydriert hat.
import { test as basis } from '@playwright/test'

export { expect, type Page } from '@playwright/test'

/**
 * Startzeit jedes Tests: Dienstag 12:00 in Wien, kein Zuschlag. Der Rechner schaltet den Zuschlag, der gerade gilt, selbst ein;
 * ohne feste Startzeit hinge jeder Rechner-Test an der echten Uhrzeit. Die Uhr läuft ab hier normal weiter. Tests mit eigener
 * Uhr setzen sie neu (`setFixedTime`, `install({ time })`); ein `install()` ohne Zeit nimmt wieder die echte Uhrzeit.
 */
export const DIENSTAG_MITTAG = new Date('2026-10-27T12:00:00+01:00')

export const test = basis.extend({
  page: async ({ page }, use) => {
    await page.clock.setSystemTime(DIENSTAG_MITTAG)
    const goto = page.goto.bind(page)
    page.goto = async (url, optionen) => {
      const antwort = await goto(url, optionen)
      if (antwort?.ok() !== false) await page.locator('html[data-hydriert]').waitFor({ state: 'attached' })
      return antwort
    }
    await use(page)
  },
})
