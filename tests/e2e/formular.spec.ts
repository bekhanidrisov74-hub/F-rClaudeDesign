import { GEFAHR, WOHIN, copy, dringlichkeit } from '../../src/content/copy'
import { expect, test, type Page } from './test'
import { anfrage, formularErfolg, fuelleFormular, sendeFormular } from './hilfen'

test.beforeEach(async ({ page }) => {
  await page.goto('/#anfrage')
})

const FRAGE = copy.luna.fragen.dringlichkeit
const stufen = (page: Page) => anfrage(page).getByRole('group', { name: FRAGE })
const stufe = (page: Page, chip: string) => stufen(page).getByRole('radio', { name: chip, exact: true })
const chipVon = (id: string) => dringlichkeit.find((d) => d.id === id)!.chip
/** Die Meldefläche im Formular (Preisrechner und Anstupser haben eigene, liegen aber außerhalb von #anfrage) */
const meldung = (page: Page) => anfrage(page).getByRole('status')

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

test('Dringlichkeit: Gruppe mit Legende zwischen Gewerk und E-Mail, drei Stufen, Start „So schnell wie möglich“, kein Hinweis', async ({ page }) => {
  const a = anfrage(page)
  await expect(stufen(page)).toBeVisible()
  await expect(stufen(page).locator('legend')).toHaveText(FRAGE)
  const radios = stufen(page).getByRole('radio')
  await expect(radios).toHaveCount(3)
  for (const [i, d] of dringlichkeit.entries()) {
    const radio = radios.nth(i)
    await expect(radio).toHaveAccessibleName(d.chip)
    await expect(radio).toHaveAttribute('name', 'dringlichkeit')
    await expect(radio).toHaveAttribute('value', d.id)
    expect((await radio.boundingBox())!.height, d.chip).toBeGreaterThanOrEqual(44)
  }
  await expect(radios.nth(1)).toBeChecked()
  await expect(radios.nth(0)).not.toBeChecked()
  await expect(radios.nth(2)).not.toBeChecked()
  await expect(stufe(page, chipVon('URGENT'))).toBeChecked()
  // Pflichtangabe ist sie nicht: es steht immer eine Stufe da
  await expect(stufen(page)).not.toHaveAttribute('aria-required', 'true')
  await expect(meldung(page)).toBeEmpty()
  await expect(a.getByText(GEFAHR)).toHaveCount(0)
  const oben = async (l: ReturnType<typeof a.locator>) => (await l.first().boundingBox())!.y
  const ys = [await oben(a.getByLabel(/^Gewerk/)), await oben(stufen(page)), await oben(a.getByLabel(/^E-Mail/))]
  expect([...ys].sort((x, y) => x - y)).toEqual(ys)
})

test('Akut/Gefahr zeigt den Notruf-Hinweis in der Meldefläche unter der Gruppe, jede andere Wahl blendet ihn aus', async ({ page }) => {
  const a = anfrage(page)
  await stufe(page, chipVon('ACUTE')).check()
  await expect(meldung(page)).toContainText(GEFAHR)
  await expect(a.getByText(GEFAHR)).toHaveCount(1)
  const gruppe = (await stufen(page).boundingBox())!
  expect((await a.getByText(GEFAHR).boundingBox())!.y).toBeGreaterThanOrEqual(gruppe.y + gruppe.height)
  await stufe(page, chipVon('NORMAL')).check()
  await expect(a.getByText(GEFAHR)).toHaveCount(0)
  await expect(meldung(page)).toBeEmpty()
  await stufe(page, chipVon('ACUTE')).check()
  await expect(a.getByText(GEFAHR)).toHaveCount(1)
  await stufe(page, chipVon('URGENT')).check()
  await expect(a.getByText(GEFAHR)).toHaveCount(0)
})

test('Dringlichkeit per Tastatur: Pfeiltasten wechseln die Stufe, der Hinweis folgt', async ({ page }) => {
  await stufe(page, chipVon('URGENT')).focus()
  await page.keyboard.press('ArrowDown')
  await expect(stufe(page, chipVon('NORMAL'))).toBeChecked()
  await expect(stufe(page, chipVon('NORMAL'))).toBeFocused()
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('ArrowUp')
  await expect(stufe(page, chipVon('ACUTE'))).toBeChecked()
  await expect(meldung(page)).toContainText(GEFAHR)
  await page.keyboard.press('ArrowDown')
  await expect(stufe(page, chipVon('URGENT'))).toBeChecked()
  await expect(meldung(page)).toBeEmpty()
})

for (const d of dringlichkeit) {
  test(`Absenden mit „${d.chip}“: der Anfrage-Eingang bekommt dringlichkeit=${d.id}`, async ({ page }) => {
    const a = anfrage(page)
    await fuelleFormular(page)
    await stufe(page, d.chip).check()
    const gesendet = page.waitForRequest((r) => r.method() === 'POST' && new URL(r.url()).pathname === '/api/anfrage')
    await a.getByRole('button', { name: 'Anfrage senden' }).click()
    expect(new URLSearchParams((await gesendet).postData() ?? '').get('dringlichkeit')).toBe(d.id)
    await expect(a.getByText(/Anfragenummer/)).toBeVisible()
  })
}

test('Ohne Wahl geht URGENT mit, nach dem Erfolg erscheint das Formular wieder mit URGENT und ohne Hinweis', async ({ page }) => {
  const a = anfrage(page)
  await fuelleFormular(page)
  const gesendet = page.waitForRequest((r) => r.method() === 'POST' && new URL(r.url()).pathname === '/api/anfrage')
  await a.getByRole('button', { name: 'Anfrage senden' }).click()
  expect(new URLSearchParams((await gesendet).postData() ?? '').get('dringlichkeit')).toBe('URGENT')
  await expect(a.getByText(/Anfragenummer/)).toBeVisible()

  // Zweite Anfrage mit „Akut/Gefahr“; danach kommt das Formular über „… anfragen“ zurück
  await page.getByRole('link', { name: 'Elektro anfragen' }).click()
  await fuelleFormular(page)
  await stufe(page, chipVon('ACUTE')).check()
  await expect(meldung(page)).toContainText(GEFAHR)
  await a.getByRole('button', { name: 'Anfrage senden' }).click()
  await expect(a.getByText(/Anfragenummer/)).toBeVisible()
  await page.getByRole('link', { name: 'Elektro anfragen' }).click()
  await expect(stufe(page, chipVon('URGENT'))).toBeChecked()
  await expect(a.getByText(GEFAHR)).toHaveCount(0)
})

test('Vor der Hydrierung gewählte Stufe „Akut/Gefahr“ zeigt nach der Hydrierung den Hinweis', async ({ page }) => {
  // Die Skripte der Seite werden zurückgehalten: Die Wahl fällt in das vorgerenderte Formular, ohne React.
  let frei!: () => void
  const gehalten = new Promise<void>((fertig) => (frei = fertig))
  await page.route('**/*.js', async (r) => {
    await gehalten
    await r.fallback()
  })
  await page.reload({ waitUntil: 'commit' })
  await stufe(page, chipVon('ACUTE')).check()
  await expect(page.locator('html[data-hydriert]')).toHaveCount(0)
  frei()
  await expect(stufe(page, chipVon('ACUTE'))).toBeChecked()
  await expect(meldung(page)).toContainText(GEFAHR)
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

test('E-Mail ist freiwillig: Typ, kein aria-required, Fehler erst beim Verlassen am Feld', async ({ page }) => {
  const a = anfrage(page)
  const email = a.getByLabel(/^E-Mail/)
  await expect(email).toHaveAttribute('type', 'email')
  await expect(email).toHaveAttribute('inputmode', 'email')
  await expect(email).toHaveAttribute('autocomplete', 'email')
  await expect(email).not.toHaveAttribute('aria-required', 'true')
  await expect(a.getByText('(optional)')).toBeVisible()
  await email.fill('maria@beispiel')
  await expect(a.getByText('Bitte prüfen Sie die E-Mail-Adresse.')).toHaveCount(0)
  await email.blur()
  const fehler = a.getByText('Bitte prüfen Sie die E-Mail-Adresse.')
  await expect(fehler).toBeVisible()
  await expect(email).toHaveAttribute('aria-invalid', 'true')
  const id = await fehler.getAttribute('id')
  expect(id).toBeTruthy()
  expect((await email.getAttribute('aria-describedby'))?.split(' ')).toContain(id)
  await email.fill('maria@beispiel.at')
  await expect(a.getByText('Bitte prüfen Sie die E-Mail-Adresse.')).toHaveCount(0)
  await expect(email).not.toHaveAttribute('aria-invalid', 'true')
  await email.fill('')
  await email.blur()
  await expect(a.getByText('Bitte prüfen Sie die E-Mail-Adresse.')).toHaveCount(0)
})

test('Absenden mit gültiger E-Mail: der Anfrage-Eingang bekommt email mit der Adresse', async ({ page }) => {
  const a = anfrage(page)
  await fuelleFormular(page)
  await a.getByLabel(/^E-Mail/).fill(' maria@beispiel.at ')
  const gesendet = page.waitForRequest((r) => r.method() === 'POST' && new URL(r.url()).pathname === '/api/anfrage')
  await a.getByRole('button', { name: 'Anfrage senden' }).click()
  const daten = new URLSearchParams((await gesendet).postData() ?? '')
  expect(daten.get('email')).toBe('maria@beispiel.at')
  await expect(a.getByText(/Anfragenummer/)).toBeVisible()
})

test('Absenden ohne E-Mail: email geht leer mit, der Erfolg kommt wie bisher', async ({ page }) => {
  const a = anfrage(page)
  await fuelleFormular(page)
  const gesendet = page.waitForRequest((r) => r.method() === 'POST' && new URL(r.url()).pathname === '/api/anfrage')
  await a.getByRole('button', { name: 'Anfrage senden' }).click()
  const daten = new URLSearchParams((await gesendet).postData() ?? '')
  expect(daten.has('email')).toBe(true)
  expect(daten.get('email')).toBe('')
  await expect(a.getByRole('heading', { name: 'Danke. Ihre Anfrage ist unterwegs.' })).toBeVisible()
  await expect(a).toContainText(/Anfragenummer: F247-[A-Z0-9]{6}/)
})

test('Ungültige E-Mail beim Absenden: Fehlertext, Fokus aufs Feld, nichts wird gesendet', async ({ page }) => {
  const a = anfrage(page)
  let posts = 0
  page.on('request', (r) => {
    if (r.method() === 'POST' && new URL(r.url()).pathname === '/api/anfrage') posts++
  })
  await fuelleFormular(page)
  await a.getByLabel(/^E-Mail/).fill('maria@beispiel')
  await a.getByRole('button', { name: 'Anfrage senden' }).click()
  await expect(a.getByText('Bitte prüfen Sie die E-Mail-Adresse.')).toBeVisible()
  await expect(a.getByLabel(/^E-Mail/)).toBeFocused()
  expect(posts).toBe(0)
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

test('Erfolg zeigt „So geht es weiter“ mit drei Schritten und Gefahr-Hinweis, ohne E-Mail keine Bestätigungszeile', async ({ page }) => {
  const a = anfrage(page)
  await formularErfolg(page)
  // Karte h3, darunter h4 (keine übersprungene Ebene)
  await expect(a.getByRole('heading', { level: 3, name: 'Danke. Ihre Anfrage ist unterwegs.' })).toBeVisible()
  await expect(a.getByRole('heading', { level: 4, name: 'So geht es weiter' })).toBeVisible()
  const schritte = a.getByRole('listitem')
  await expect(schritte).toHaveCount(3)
  const titel = ['Passender Fachbetrieb', 'Rückruf', 'Direkt mit dem Fachbetrieb']
  for (const [i, t] of titel.entries()) await expect(schritte.nth(i)).toContainText(t)
  await expect(a).toContainText('Wir vermitteln Ihre Anfrage an einen passenden Fachbetrieb in Ihrer Nähe.')
  await expect(a).toContainText('fixit247 oder der vermittelte Fachbetrieb meldet sich telefonisch bei Ihnen.')
  await expect(a).toContainText('Termin, Preis, Durchführung und Rechnung stimmen Sie direkt mit dem Fachbetrieb ab. Die Vermittlung ist kostenlos.')
  await expect(a).toContainText(GEFAHR)
  await expect(a).not.toContainText('Eine Bestätigung')
  // Reihenfolge: Anruf-Knopf gleich unter dem Text, dann Schritte, Tipp, Gefahr-Hinweis
  const hoehe = async (l: ReturnType<typeof a.locator>) => (await l.first().boundingBox())!.y
  const ys = [
    await hoehe(a.getByRole('link', { name: 'Fragen? Jetzt anrufen' })),
    await hoehe(a.getByRole('heading', { name: 'So geht es weiter' })),
    await hoehe(a.getByText('Bis der Betrieb kommt:')),
    await hoehe(a.getByText(GEFAHR)),
  ]
  expect([...ys].sort((x, y) => x - y)).toEqual(ys)
})

test('Erfolg mit E-Mail: Zeile „Eine Bestätigung schicken wir an …“, lange Adresse läuft nicht über', async ({ page }) => {
  const a = anfrage(page)
  const adresse = 'maria.huber.mit.sehr.langem.namen@sehr-lange-beispiel-domain-fuer-den-umbruch.at'
  await fuelleFormular(page)
  await a.getByLabel(/^E-Mail/).fill(` ${adresse} `)
  await a.getByRole('button', { name: 'Anfrage senden' }).click()
  const zeile = a.getByText(/^Eine Bestätigung schicken wir an/)
  await expect(zeile).toHaveText(`Eine Bestätigung schicken wir an ${adresse}.`)
  const karte = await a.getByRole('heading', { level: 3, name: 'Danke. Ihre Anfrage ist unterwegs.' }).locator('xpath=ancestor::div[contains(@class,"shadow-karte")]').boundingBox()
  const box = (await zeile.boundingBox())!
  expect(box.x + box.width).toBeLessThanOrEqual(karte!.x + karte!.width)
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

test('Vor dem Absenden steht, wohin die Anfrage geht: WOHIN direkt über dem Senden-Knopf, auch nach einem Sendefehler', async ({ page }) => {
  const a = anfrage(page)
  const satz = a.getByText(WOHIN, { exact: true })
  const knopf = a.getByRole('button', { name: 'Anfrage senden' })
  const stehtDarueber = async () => {
    await expect(satz).toHaveCount(1)
    await expect(satz).toBeVisible()
    const s = (await satz.boundingBox())!
    const k = (await knopf.boundingBox())!
    expect(s.y + s.height).toBeLessThanOrEqual(k.y)
    // nach der Einwilligung, nicht davor
    expect(s.y).toBeGreaterThan((await a.getByRole('checkbox').boundingBox())!.y)
  }
  await stehtDarueber()
  await page.goto('/?fehler=1#anfrage')
  await sendeFormular(page)
  const meldung = a.getByRole('alert')
  await expect(meldung).toBeVisible()
  await stehtDarueber()
  expect((await meldung.boundingBox())!.y).toBeLessThan((await satz.boundingBox())!.y)
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
