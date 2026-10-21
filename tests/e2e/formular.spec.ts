import { expect, test } from './test'
import { anfrage, fuelleFormular, sendeFormular } from './hilfen'

test.beforeEach(async ({ page }) => {
  await page.goto('/#anfrage')
})

test('Felder mit Labels, Pflichtangaben und passenden Typen', async ({ page }) => {
  const a = anfrage(page)
  await expect(a.getByRole('heading', { name: 'Anfrage senden' })).toBeVisible()
  const telefon = a.getByLabel(/^Telefon/)
  await expect(telefon).toHaveAttribute('type', 'tel')
  await expect(telefon).toHaveAttribute('autocomplete', 'tel')
  await expect(a.getByLabel(/^Name/)).toHaveAttribute('autocomplete', 'name')
  for (const feld of [/^Name/, /^Telefon/, /^PLZ und Ort/, /^Gewerk/]) await expect(a.getByLabel(feld)).toHaveAttribute('aria-required', 'true')
  const optionen = await a.getByLabel(/^Gewerk/).locator('option').allTextContents()
  expect(optionen).toEqual(['Bitte wählen', 'Installateur', 'Heizung & Klima', 'Schlüsseldienst', 'Elektro', 'Haushaltsgeräte', 'Weiß ich nicht'])
  await expect(a.getByRole('link', { name: 'Datenschutzerklärung' })).toHaveAttribute('href', '/datenschutz/')
  await expect(a).toContainText('* Pflichtfeld. Die Vermittlung ist kostenlos.')
})

test('Prüfung erst beim Verlassen eines Feldes, Fehler verbunden über aria-describedby', async ({ page }) => {
  const name = anfrage(page).getByLabel(/^Name/)
  await name.focus()
  await expect(anfrage(page).getByText('Bitte geben Sie Ihren Namen ein.')).toHaveCount(0)
  await name.blur()
  const fehler = anfrage(page).getByText('Bitte geben Sie Ihren Namen ein.')
  await expect(fehler).toBeVisible()
  await expect(name).toHaveAttribute('aria-invalid', 'true')
  const id = await fehler.getAttribute('id')
  expect(id).toBeTruthy()
  expect((await name.getAttribute('aria-describedby'))?.split(' ')).toContain(id)
  await name.fill('Maria Huber')
  await name.blur()
  await expect(anfrage(page).getByText('Bitte geben Sie Ihren Namen ein.')).toHaveCount(0)
  await expect(name).not.toHaveAttribute('aria-invalid', 'true')
})

test('Absenden mit Fehlern: alle Meldungen, Fokus auf das erste fehlerhafte Feld', async ({ page }) => {
  const a = anfrage(page)
  await a.getByLabel(/^Name/).fill('Maria Huber')
  await a.getByRole('button', { name: 'Anfrage senden' }).click()
  for (const text of [
    'Bitte geben Sie eine Telefonnummer für den Rückruf ein.',
    'Bitte geben Sie Postleitzahl und Ort ein, zum Beispiel 1020 Wien.',
    'Bitte wählen Sie ein Gewerk.',
    'Bitte stimmen Sie der Weitergabe zu, sonst können wir keinen Betrieb vermitteln.',
  ])
    await expect(a.getByText(text)).toBeVisible()
  await expect(a.getByLabel(/^Telefon/)).toBeFocused()
})

test('„… anfragen“ wählt das Gewerk im Formular vor', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Elektro anfragen' }).click()
  await expect(anfrage(page).getByLabel(/^Gewerk/)).toHaveValue('elektro')
})

test('Senden: „Wird gesendet …“, dann ersetzt der Dank das Formular', async ({ page }) => {
  // Die lokale Attrappe antwortet sofort: verzögern, damit der Sendezustand sichtbar ist
  await page.route('**/api/anfrage', async (r) => {
    await new Promise((fertig) => setTimeout(fertig, 800))
    await r.fallback()
  })
  await sendeFormular(page)
  const knopf = anfrage(page).getByRole('button', { name: 'Wird gesendet …' })
  await expect(knopf).toBeVisible()
  await expect(knopf).toBeDisabled()
  await expect(anfrage(page).getByRole('heading', { name: 'Danke. Ihre Anfrage ist unterwegs.' })).toBeVisible()
  await expect(anfrage(page)).toContainText(/Anfragenummer: F247-[A-Z0-9]{6}/)
  await expect(anfrage(page)).toContainText('Wir geben sie jetzt an einen passenden Installateur in Ihrer Nähe weiter.')
  await expect(anfrage(page)).toContainText('Der Betrieb ruft Sie unter 0664 1234567 zurück.')
  await expect(anfrage(page)).toContainText('Bis der Betrieb kommt: Drehen Sie, wenn möglich, den Hauptwasserhahn zu')
  await expect(anfrage(page).getByRole('link', { name: 'Fragen? Jetzt anrufen' })).toHaveAttribute('href', /^tel:/)
  await expect(anfrage(page).getByLabel(/^Name/)).toHaveCount(0)
})

test('Sendefehler mit ?fehler=1: Meldung über dem Knopf, Angaben bleiben', async ({ page }) => {
  await page.goto('/?fehler=1#anfrage')
  await sendeFormular(page)
  const meldung = anfrage(page).getByRole('alert')
  await expect(meldung).toContainText('Die Anfrage wurde nicht gesendet.')
  await expect(meldung.getByRole('link', { name: 'Stattdessen anrufen' })).toHaveAttribute('href', /^tel:/)
  const knopf = anfrage(page).getByRole('button', { name: 'Anfrage senden' })
  expect((await meldung.boundingBox())!.y).toBeLessThan((await knopf.boundingBox())!.y)
  await expect(anfrage(page).getByLabel(/^Name/)).toHaveValue('Maria Huber')
  await expect(anfrage(page).getByRole('checkbox')).toBeChecked()
})

test('Seitenkasten „Lieber sofort sprechen?“', async ({ page }) => {
  const a = anfrage(page)
  await expect(a.getByRole('heading', { name: 'Lieber sofort sprechen?' })).toBeVisible()
  await expect(a.getByRole('link', { name: /Jetzt anrufen/ })).toHaveAttribute('href', /^tel:/)
  await expect(a.getByRole('link', { name: 'Per WhatsApp schreiben' })).toHaveAttribute('href', /^https:\/\/wa\.me\//)
})

test('Angaben bleiben beim Ausfüllen erhalten', async ({ page }) => {
  await fuelleFormular(page)
  await expect(anfrage(page).getByLabel(/^PLZ und Ort/)).toHaveValue('1020 Wien')
})

test('Kachel vor der Hydrierung angetippt: Sprung zum Formular, danach ist das Gewerk vorgewählt (Audit A4)', async ({ page }) => {
  // App-Bundle zurückhalten: So lange ist die Seite nur vorgerendertes HTML (langsames Netz)
  let freigeben = () => {}
  const frei = new Promise<void>((r) => (freigeben = r))
  await page.route(/\/assets\/index-[^/]+\.js$/, async (route) => {
    await frei
    await route.continue()
  })
  await page.mainFrame().goto('/', { waitUntil: 'domcontentloaded' })
  await page.locator('section[aria-labelledby="schnellwahl-titel"] a[data-gewerk="installateur"]').click()
  await expect(page).toHaveURL(/#anfrage-installateur$/)
  await expect(page.locator('#anfrage-titel')).toBeInViewport()
  freigeben()
  await page.locator('html[data-hydriert]').waitFor({ state: 'attached' })
  await expect(anfrage(page).getByLabel(/^Gewerk/)).toHaveValue('installateur')
})
