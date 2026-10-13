// Gemeinsame Schritte für e2e-, axe- und Screenshot-Tests.
import { expect, type Page } from '@playwright/test'

export const rechner = (page: Page) => page.locator('#preisrechner')
export const ergebnis = (page: Page) => rechner(page).locator('[aria-live="polite"]').filter({ hasText: 'Ihre Richtpreis-Spanne' })
export const preisDialog = (page: Page) => page.getByRole('dialog', { name: 'Richtpreise im Überblick' })

export async function waehleGewerk(page: Page, name: string) {
  await rechner(page).getByRole('group', { name: 'Gewerk' }).getByRole('button', { name, exact: true }).click()
}

export async function schalteZuschlag(page: Page, name: 'Sonntag' | 'Feiertag' | 'Nacht') {
  await rechner(page).getByRole('group', { name: 'Zuschlag' }).getByRole('button', { name: new RegExp(`^${name}`) }).click()
}

export async function setzeStunden(page: Page, ziel: number) {
  const ausgabe = rechner(page).locator('output')
  for (let i = 0; i < 12; i++) {
    const jetzt = Number((await ausgabe.textContent())?.match(/\d+/)?.[0])
    if (jetzt === ziel) return
    await rechner(page).getByRole('button', { name: jetzt < ziel ? 'Eine Stunde mehr' : 'Eine Stunde weniger' }).click()
  }
  throw new Error(`Stunden ${ziel} nicht erreicht`)
}

export async function oeffnePreisuebersicht(page: Page) {
  const ausloeser = page.getByRole('button', { name: 'Alle Richtpreise im Überblick' })
  await ausloeser.click()
  await expect(preisDialog(page)).toBeVisible()
  return ausloeser
}

export async function oeffneMenue(page: Page) {
  await page.getByRole('button', { name: 'Menü öffnen' }).click()
  await expect(page.locator('#menue')).toBeVisible()
}

/** Auf schmalen Breiten liegt der Fokus am Ende der Seite: zuerst hinscrollen, damit Schnappschüsse stimmen. */
export async function zumRechner(page: Page) {
  await rechner(page).scrollIntoViewIfNeeded()
}
