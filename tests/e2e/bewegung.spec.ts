import { expect, test, type Page } from './test'
import { oeffneLuna, oeffnePreisuebersicht, preisDialog, zeigeAnstupser } from './hilfen'

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

test('Luna: Anstupser 160 ms, Chat 200 ms; mit reduced motion 0', async ({ page }) => {
  await page.clock.install()
  await page.goto('/')
  await zeigeAnstupser(page)
  const anstupser = await page.getByRole('status').filter({ hasText: 'Notfall?' }).evaluate((w) => [
    ...new Set([w, ...w.querySelectorAll('*')].flatMap((el) => getComputedStyle(el).transitionDuration.split(', '))),
  ])
  for (const x of anstupser) expect(ERLAUBT.has(x), x).toBe(true)
  expect(anstupser).toContain('0.16s')
  await oeffneLuna(page)
  const chatDauern = await dauern(page, '#luna-chat')
  for (const x of chatDauern) expect(ERLAUBT.has(x), x).toBe(true)
  expect(chatDauern).toContain('0.2s')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect(await dauern(page, '#luna-chat')).toEqual(['0s'])
})
