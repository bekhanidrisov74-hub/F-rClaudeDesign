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

// ── Luna ──
export const lunaKnopf = (page: Page) => page.getByRole('button', { name: 'Chat mit Luna öffnen' })
export const chat = (page: Page) => page.getByRole('dialog', { name: 'Chat mit Luna' })

export async function oeffneLuna(page: Page) {
  await lunaKnopf(page).click()
  await expect(chat(page)).toBeVisible()
}

/** Antwort geben: als Chip, wenn es ihn gibt, sonst als Freitext. */
export async function antworteLuna(page: Page, text: string) {
  const c = chat(page)
  const chip = c.getByRole('button', { name: text, exact: true })
  if (await chip.isVisible()) await chip.click()
  else {
    await c.getByRole('textbox').fill(text)
    await c.getByRole('button', { name: 'Nachricht senden' }).click()
  }
  await expect(c.getByText(text, { exact: true }).last()).toBeVisible()
}

export async function lunaBisFrage4(page: Page) {
  await oeffneLuna(page)
  for (const a of ['Installateur', 'Unter der Spüle tritt Wasser aus.', '1020']) await antworteLuna(page, a)
}

export async function lunaBisZusammenfassung(page: Page) {
  await lunaBisFrage4(page)
  for (const a of ['Sofort, es ist ein Notfall', 'Maria Huber, 0664 1234567']) await antworteLuna(page, a)
  await expect(chat(page).getByRole('heading', { name: 'Ihre Anfrage' })).toBeVisible()
}

export async function lunaAbsenden(page: Page) {
  await lunaBisZusammenfassung(page)
  await chat(page).getByRole('checkbox').check()
  await chat(page).getByRole('button', { name: 'Auftrag aufgeben' }).click()
}

export async function zeigeAnstupser(page: Page) {
  await page.clock.fastForward(9000)
  await expect(page.getByRole('status').filter({ hasText: 'Notfall?' })).toBeVisible()
}

// ── Anfrage-Formular ──
export const anfrage = (page: Page) => page.locator('#anfrage')

export async function fuelleFormular(page: Page) {
  const a = anfrage(page)
  await a.getByLabel(/^Name/).fill('Maria Huber')
  await a.getByLabel(/^Telefon/).fill('0664 1234567')
  await a.getByLabel(/^PLZ und Ort/).fill('1020 Wien')
  await a.getByLabel(/^Gewerk/).selectOption({ label: 'Installateur' })
  await a.getByLabel(/^Kurze Beschreibung/).fill('Unter der Spüle tritt Wasser aus.')
  await a.getByRole('checkbox').check()
}

export async function sendeLeer(page: Page) {
  await anfrage(page).getByRole('button', { name: 'Anfrage senden' }).click()
  await expect(anfrage(page).getByText('Bitte geben Sie Ihren Namen ein.')).toBeVisible()
}

export async function sendeFormular(page: Page) {
  await fuelleFormular(page)
  await anfrage(page).getByRole('button', { name: 'Anfrage senden' }).click()
}

export async function formularErfolg(page: Page) {
  await sendeFormular(page)
  await expect(anfrage(page).getByText(/Anfragenummer/)).toBeVisible()
}

export async function formularSendefehler(page: Page) {
  await sendeFormular(page)
  await expect(anfrage(page).getByRole('alert')).toBeVisible()
}
