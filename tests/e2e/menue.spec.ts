import { expect, test } from './test'
import { oeffneMenue, preisDialog } from './hilfen'

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'm390', 'Menü gibt es nur unter 1280 px, einmal am Handy reicht')
  await page.goto('/')
})

test('öffnen: aria-expanded, Label, Fokus auf den ersten Link', async ({ page }) => {
  const knopf = page.locator('#menue-knopf')
  await expect(knopf).toHaveAttribute('aria-expanded', 'false')
  await oeffneMenue(page)
  await expect(knopf).toHaveAttribute('aria-expanded', 'true')
  await expect(knopf).toHaveAttribute('aria-label', 'Menü schließen')
  await expect(page.locator('#menue').getByRole('link', { name: 'Leistungen' })).toBeFocused()
  for (const name of ['Leistungen', "So funktioniert's", 'Preisrechner', 'Anfrage senden'])
    await expect(page.locator('#menue').getByRole('link', { name, exact: true })).toBeVisible()
  await expect(page.locator('#menue').getByRole('button', { name: 'Preisübersicht' })).toBeVisible()
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden')
})

test('Fokusfalle: Tab bleibt in Kopf und Menü', async ({ page }) => {
  await oeffneMenue(page)
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press('Tab')
    const drin = await page.evaluate(() => {
      const el = document.activeElement
      return !el || el === document.body || !!el.closest('header, #menue')
    })
    expect(drin, `Tab ${i}`).toBe(true)
  }
})

test('Esc schließt, Fokus zurück zum Menü-Knopf', async ({ page }) => {
  await oeffneMenue(page)
  await page.keyboard.press('Escape')
  await expect(page.locator('#menue')).toBeHidden()
  await expect(page.locator('#menue-knopf')).toBeFocused()
  await expect(page.locator('#menue-knopf')).toHaveAttribute('aria-expanded', 'false')
})

test('Link schließt das Menü und springt zum Anker unter den Kopf', async ({ page }) => {
  await oeffneMenue(page)
  await page.locator('#menue').getByRole('link', { name: 'Preisrechner' }).click()
  await expect(page.locator('#menue')).toBeHidden()
  const titel = page.locator('#preisrechner h2')
  await expect(titel).toBeInViewport()
  const kopf = (await page.locator('header').first().boundingBox())!
  expect((await titel.boundingBox())!.y).toBeGreaterThanOrEqual(kopf.y + kopf.height - 1)
})

test('„Preisübersicht“ öffnet ein bedienbares Sheet, danach Fokus auf dem Menü-Knopf', async ({ page }) => {
  await oeffneMenue(page)
  await page.locator('#menue').getByRole('button', { name: 'Preisübersicht' }).click()
  await expect(page.locator('#menue')).toBeHidden()
  await expect(preisDialog(page)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Preisübersicht schließen' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(preisDialog(page)).toBeHidden()
  await expect(page.locator('#menue-knopf')).toBeFocused()
})

test('schließt, wenn das Fenster 1280 px oder breiter wird', async ({ page }) => {
  await oeffneMenue(page)
  await page.setViewportSize({ width: 1280, height: 800 })
  await expect(page.locator('#menue')).toBeHidden()
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe('hidden')
})

test('„Partner werden“ steht klein unter der Kontaktkarte, die großen Links bleiben fünf (SPEC 7)', async ({ page }) => {
  await oeffneMenue(page)
  const menue = page.locator('#menue')
  await expect(menue.getByRole('link', { name: 'Für Fachbetriebe: Partner werden', exact: true })).toHaveAttribute('href', '/partner-werden/')
  await expect(menue.getByRole('navigation').getByRole('listitem')).toHaveCount(5)
})

test('auf Rechtsseiten zeigen die Links auf die Startseite', async ({ page }) => {
  await page.goto('/impressum/')
  await oeffneMenue(page)
  await expect(page.locator('#menue').getByRole('link', { name: 'Leistungen' })).toHaveAttribute('href', '/#leistungen')
})
