import { expect, test, type Page } from './test'
import { oeffnePreisuebersicht, preisDialog } from './hilfen'

// Erlaubte Dauern laut tokens.css: 120 (Hover/Fokus), 160 (Dialog, Anstupser), 200 (Chat), 240 (Sheet).
const ERLAUBT = new Set(['0s', '0.12s', '0.16s', '0.2s', '0.24s'])

async function dauern(page: Page, wurzel: string) {
  return page.locator(wurzel).evaluate((w) => {
    const alle = [w, ...w.querySelectorAll('*')]
    return [...new Set(alle.flatMap((el) => getComputedStyle(el).transitionDuration.split(', ')))]
  })
}

test('Preisübersicht nutzt nur Token-Dauern (Dialog 160 ms, Sheet 240 ms)', async ({ page }) => {
  await page.goto('/')
  await oeffnePreisuebersicht(page)
  const d = await dauern(page, 'dialog[open]')
  for (const x of d) expect(ERLAUBT.has(x), x).toBe(true)
  expect(d).toContain(page.viewportSize()!.width < 640 ? '0.24s' : '0.16s')
})

test('reduced motion: keine Übergänge in Seite und Überlagerungen', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  expect(await dauern(page, 'body')).toEqual(['0s'])
  await oeffnePreisuebersicht(page)
  await expect(preisDialog(page)).toBeVisible()
  expect(await dauern(page, 'dialog[open]')).toEqual(['0s'])
})
