import { expect, test } from './test'
import { antwort, bewerbung, fuelleBewerbung, preisDialog, sendeBewerbung } from './hilfen'
import { fuelle } from '../../src/content/copy'
import { gewerke } from '../../src/content/gewerke'
import { partner } from '../../src/content/partner'

const t = partner.bewerbung
const f = t.felder
const senden = (page: Parameters<typeof bewerbung>[0]) => bewerbung(page).getByRole('button', { name: t.senden })

test.beforeEach(async ({ page }) => {
  await page.goto('/partner-werden/')
})

test('Seite mit H1, Gewerken, Nutzen, Schritten, Erwartungen, Bewerbung und Fragen', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(partner.intro.titel)
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  for (const titel of [partner.nutzen.titel, partner.schritte.titel, partner.erwartungen.titel, t.titel, partner.fragen.titel])
    await expect(page.getByRole('heading', { level: 2, name: titel, exact: true })).toBeVisible()

  const liste = page.getByRole('list', { name: partner.intro.gewerke })
  await expect(liste.getByRole('listitem')).toHaveText(gewerke.map((g) => g.name))
  for (const punkt of partner.nutzen.punkte) await expect(page.getByRole('heading', { level: 3, name: punkt.titel, exact: true })).toBeVisible()
  await expect(page.locator('#nutzen')).toContainText(partner.nutzen.punkte[2].text)
  await expect(page.locator('#partner').getByRole('link', { name: partner.intro.knopf })).toHaveAttribute('href', '#bewerbung')

  const schritte = page.locator('#partner-schritte').getByRole('listitem')
  await expect(schritte).toHaveCount(partner.schritte.liste.length)
  for (const [i, s] of partner.schritte.liste.entries()) await expect(schritte.nth(i)).toContainText(s.titel)

  const erwartungen = page.locator('#erwartungen')
  await expect(erwartungen.getByRole('listitem')).toHaveText([...partner.erwartungen.punkte])
  await expect(erwartungen).toContainText(partner.erwartungen.pruefung)

  await expect(page.locator('#partner-fragen details')).toHaveCount(partner.fragen.liste.length)
  await expect(bewerbung(page).getByRole('heading', { name: t.seitenkasten.titel })).toBeVisible()
})

test('Felder mit sichtbaren Labels, Pflichtangaben, autocomplete und passender Tastatur', async ({ page }) => {
  const b = bewerbung(page)
  const textfelder: [string, { autocomplete: string; inputmode?: string; type?: string; pflicht: boolean }][] = [
    [f.firma.label, { autocomplete: 'organization', type: 'text', pflicht: true }],
    [f.ansprechperson.label, { autocomplete: 'name', type: 'text', pflicht: true }],
    [f.telefon.label, { autocomplete: 'tel', inputmode: 'tel', type: 'tel', pflicht: true }],
    [f.email.label, { autocomplete: 'email', inputmode: 'email', type: 'email', pflicht: true }],
    [f.gisa.label, { autocomplete: 'off', inputmode: 'numeric', type: 'text', pflicht: true }],
    [f.uid.label, { autocomplete: 'off', type: 'text', pflicht: false }],
    [f.plz.label, { autocomplete: 'off', type: 'text', pflicht: true }],
  ]
  for (const [label, erwartet] of textfelder) {
    const feld = b.getByLabel(label)
    await expect(feld, label).toBeVisible()
    // Die Beschriftung ist ein sichtbares <label for>, kein Platzhalter
    await expect(b.locator(`label[for="${await feld.getAttribute('id')}"]`), label).toBeVisible()
    await expect(feld, label).toHaveAttribute('autocomplete', erwartet.autocomplete)
    if (erwartet.type) await expect(feld, label).toHaveAttribute('type', erwartet.type)
    if (erwartet.inputmode) await expect(feld, label).toHaveAttribute('inputmode', erwartet.inputmode)
    if (erwartet.pflicht) await expect(feld, label).toHaveAttribute('aria-required', 'true')
    else await expect(feld, label).not.toHaveAttribute('aria-required', 'true')
  }
  await expect(b.getByLabel(f.uid.label)).toHaveAccessibleName(/\(optional\)/)

  // Gruppen: sichtbare Legende; Optionsfelder als Pflicht-Radiogruppe
  await expect(b.getByRole('group', { name: f.gewerke.legende })).toBeVisible()
  await expect(b.getByRole('group', { name: f.gewerke.legende }).getByRole('checkbox')).toHaveCount(gewerke.length)
  await expect(b.getByRole('group', { name: f.zeiten.legende }).getByRole('checkbox')).toHaveCount(f.zeiten.optionen.length)
  for (const legende of [f.notdienst.legende, f.richtpreise.legende, f.haftpflicht.legende, f.preisVorab.legende, f.unbar.legende]) {
    const gruppe = b.getByRole('radiogroup', { name: legende })
    await expect(gruppe.locator('legend'), legende).toBeVisible()
    await expect(gruppe, legende).toHaveAttribute('aria-required', 'true')
  }
  await expect(b.getByRole('radiogroup', { name: f.richtpreise.legende }).getByRole('radio')).toHaveCount(3)
  // Kein Upload, kein bindendes Häkchen zu den Richtpreisen
  await expect(b.locator('input[type="file"]')).toHaveCount(0)
  await expect(b.getByRole('checkbox')).toHaveCount(gewerke.length + f.zeiten.optionen.length + 1)

  const reaktion = b.getByLabel(f.reaktionszeit.label)
  await expect(reaktion.locator('option')).toHaveText([f.reaktionszeit.bitteWaehlen, ...f.reaktionszeit.optionen.map((o) => o.text)])
  await expect(b.getByLabel(f.anmerkungen.label)).toBeVisible()

  const einwilligung = b.getByRole('checkbox', { name: /^Ich stimme zu/ })
  await expect(einwilligung).toHaveAttribute('aria-required', 'true')
  await expect(b.getByRole('link', { name: t.einwilligung.link })).toHaveAttribute('href', '/datenschutz/')
  await expect(b).toContainText(t.pflicht)
})

test('Prüfung erst beim Verlassen eines Feldes, Fehler verbunden über aria-describedby', async ({ page }) => {
  const b = bewerbung(page)
  const firma = b.getByLabel(f.firma.label)
  await firma.focus()
  await expect(b.getByText(t.fehler.firma)).toHaveCount(0)
  await firma.blur()
  const fehler = b.getByText(t.fehler.firma)
  await expect(fehler).toBeVisible()
  await expect(firma).toHaveAttribute('aria-invalid', 'true')
  const id = await fehler.getAttribute('id')
  expect(id).toBeTruthy()
  expect((await firma.getAttribute('aria-describedby'))?.split(' ')).toContain(id)
  await expect(firma).toHaveAccessibleDescription(t.fehler.firma)
  await firma.fill('Huber Installationen GmbH')
  await expect(b.getByText(t.fehler.firma)).toHaveCount(0)
  await expect(firma).not.toHaveAttribute('aria-invalid', 'true')

  // Mit Hinweis: aria-describedby nennt Hinweis und Fehler
  const email = b.getByLabel(f.email.label)
  await expect(email).toHaveAccessibleDescription(f.email.hinweis)
  await email.fill('office@')
  await email.blur()
  await expect(b.getByText(t.fehler.email)).toBeVisible()
  await expect(email).toHaveAttribute('aria-invalid', 'true')
  await expect(email).toHaveAccessibleDescription(`${f.email.hinweis} ${t.fehler.email}`)

  // Radiogruppe: geprüft beim Verlassen der ganzen Gruppe, Fehler an der Gruppe
  const notdienst = b.getByRole('radiogroup', { name: f.notdienst.legende })
  await antwort(page, 'notdienst', 'Ja').focus()
  await expect(notdienst.getByText(t.fehler.auswahl)).toHaveCount(0)
  await antwort(page, 'notdienst', 'Ja').blur()
  await expect(notdienst.getByText(t.fehler.auswahl)).toBeVisible()
  await expect(notdienst).toHaveAttribute('aria-invalid', 'true')
  await expect(notdienst).toHaveAccessibleDescription(t.fehler.auswahl)
  await antwort(page, 'notdienst', 'Nein').check()
  await expect(notdienst.getByText(t.fehler.auswahl)).toHaveCount(0)
})

test('Leeres Absenden: alle Pflichtfehler, Fokus auf „Firmenname“', async ({ page }) => {
  const b = bewerbung(page)
  await senden(page).click()
  for (const text of [
    t.fehler.firma,
    t.fehler.ansprechperson,
    t.fehler.telefon,
    t.fehler.email,
    t.fehler.gisa,
    t.fehler.gewerke,
    t.fehler.plz,
    t.fehler.zeiten,
    t.fehler.einwilligung,
  ])
    await expect(b.getByText(text)).toBeVisible()
  // Notdienst, Richtpreise, Haftpflicht, Preis vorab, unbare Zahlung
  await expect(b.getByText(t.fehler.auswahl)).toHaveCount(5)
  // Optionale Felder bleiben ohne Fehler, „Welche?“ erscheint nicht
  await expect(b.getByText(t.fehler.uid)).toHaveCount(0)
  await expect(b.getByLabel(f.abweichungen.label)).toHaveCount(0)
  await expect(b.getByLabel(f.firma.label)).toBeFocused()
  await expect(b.locator('[aria-invalid="true"]')).toHaveCount(5 + 5 + 2) // fünf Textfelder, fünf Radiogruppen, PLZ und Einwilligung
})

test('Unbekannte Postleitzahl: Meldung nennt sie, Fokus auf das Einsatzgebiet', async ({ page }) => {
  await fuelleBewerbung(page)
  const plz = bewerbung(page).getByLabel(f.plz.label)
  await plz.fill('1100, 1009')
  await senden(page).click()
  await expect(bewerbung(page).getByText(fuelle(t.fehler.plzUnbekannt, { liste: '1009' }))).toBeVisible()
  await expect(plz).toHaveAttribute('aria-invalid', 'true')
  await expect(plz).toBeFocused()
})

test('„Welche?“ erscheint nur bei „Ja, mit Abweichungen“ und ist dann Pflicht', async ({ page }) => {
  const b = bewerbung(page)
  const welche = b.getByLabel(f.abweichungen.label)
  await expect(welche).toHaveCount(0)
  await antwort(page, 'richtpreise', 'Ja').check()
  await expect(welche).toHaveCount(0)
  await antwort(page, 'richtpreise', 'Nein').check()
  await expect(welche).toHaveCount(0)

  await fuelleBewerbung(page)
  await antwort(page, 'richtpreise', 'Ja, mit Abweichungen').check()
  await expect(welche).toBeVisible()
  await expect(welche).toHaveAttribute('aria-required', 'true')
  // Kein Fehler gleich bei der Wahl
  await expect(b.getByText(t.fehler.abweichungen)).toHaveCount(0)
  await senden(page).click()
  await expect(b.getByText(t.fehler.abweichungen)).toBeVisible()
  await expect(welche).toBeFocused()
  await expect(welche).toHaveAttribute('aria-invalid', 'true')
  await welche.fill('Anfahrt außerhalb Wiens 49 €')
  await expect(b.getByText(t.fehler.abweichungen)).toHaveCount(0)

  await antwort(page, 'richtpreise', 'Ja').check()
  await expect(welche).toHaveCount(0)
})

test('Senden: „Wird gesendet …“, dann Dank mit Bewerbungsnummer; gesendet wird art=partner', async ({ page }) => {
  // Die lokale Attrappe antwortet sofort: verzögern, damit der Sendezustand sichtbar ist
  await page.route('**/api/anfrage', async (r) => {
    await new Promise((fertig) => setTimeout(fertig, 800))
    await r.fallback()
  })
  await fuelleBewerbung(page)
  const b = bewerbung(page)
  // Bereich „1010–1230“ (ganz Wien) wird angenommen und als einzelne Postleitzahlen gesendet
  await b.getByLabel(f.plz.label).fill('1010–1230')
  await antwort(page, 'richtpreise', 'Ja, mit Abweichungen').check()
  await b.getByLabel(f.abweichungen.label).fill('Anfahrt außerhalb Wiens 49 €')
  await antwort(page, 'preisVorab', 'Nein').check()

  const anfrage = page.waitForRequest((r) => r.url().endsWith('/api/anfrage') && r.method() === 'POST')
  await senden(page).click()
  const knopf = b.getByRole('button', { name: t.sendend })
  await expect(knopf).toBeVisible()
  await expect(knopf).toBeDisabled()

  const daten = new URLSearchParams((await anfrage).postData() ?? '')
  const plz = daten.get('plz')!.split(',')
  expect(plz).toHaveLength(23)
  expect(plz).toEqual(expect.arrayContaining(['1010', '1100', '1230']))
  daten.delete('plz')
  const id = daten.get('bewerbungId')!
  expect(id).toMatch(/^P247-[A-Z0-9]{6}$/)
  daten.delete('bewerbungId')
  expect(Object.fromEntries(daten)).toEqual({
    art: 'partner',
    firma: 'Huber Installationen GmbH',
    ansprechperson: 'Maria Huber',
    tel: '0664 1234567',
    email: 'office@huber-installationen.at',
    gisa: '12345678',
    uid: 'ATU12345678',
    gewerke: 'installateur,shk',
    zeiten: 'werktags,nachts',
    notdienst: 'ja',
    reaktionszeit: '60',
    richtpreise: 'abweichung',
    abweichungen: 'Anfahrt außerhalb Wiens 49 €',
    haftpflicht: 'ja',
    preisVorab: 'nein',
    unbar: 'ja',
    anmerkungen: 'Gasthermen, Rohrreinigung',
    dsgvo: 'on',
  })

  const titel = b.getByRole('heading', { name: t.erfolg.titel })
  await expect(titel).toBeVisible()
  await expect(titel).toBeFocused()
  await expect(b).toContainText(fuelle(t.erfolg.text, { telefon: '0664 1234567', email: 'office@huber-installationen.at' }))
  await expect(b).toContainText(fuelle(t.erfolg.nummer, { nummer: id }))
  await expect(b.getByRole('link', { name: t.erfolg.anrufen })).toHaveAttribute('href', /^tel:/)
  await expect(b.getByLabel(f.firma.label)).toHaveCount(0)
})

test('Sendefehler mit ?fehler=1: Meldung über dem Knopf mit Anruf-Link, Angaben bleiben', async ({ page }) => {
  await page.goto('/partner-werden/?fehler=1')
  await sendeBewerbung(page)
  const b = bewerbung(page)
  const meldung = b.getByRole('alert')
  await expect(meldung).toContainText(t.sendefehler.titel)
  await expect(meldung).toContainText(t.sendefehler.text)
  await expect(meldung.getByRole('link', { name: t.sendefehler.anrufen })).toHaveAttribute('href', /^tel:/)
  const knopf = senden(page)
  await expect(knopf).toBeEnabled()
  expect((await meldung.boundingBox())!.y).toBeLessThan((await knopf.boundingBox())!.y)
  await expect(b.getByLabel(f.firma.label)).toHaveValue('Huber Installationen GmbH')
  await expect(b.getByLabel(f.plz.label)).toHaveValue('1100, 1110, 1120')
  await expect(b.getByRole('group', { name: f.gewerke.legende }).getByRole('checkbox', { name: 'Installateur', exact: true })).toBeChecked()
  await expect(antwort(page, 'haftpflicht', 'Ja')).toBeChecked()
  await expect(b.getByRole('checkbox', { name: /^Ich stimme zu/ })).toBeChecked()
})

test('Honigtopf-Feld ist weder sichtbar noch per Tab oder Screenreader erreichbar', async ({ page }) => {
  const b = bewerbung(page)
  const fax = b.locator('input[name="fax"]')
  await expect(fax).toHaveCount(1)
  await expect(fax).toHaveAttribute('tabindex', '-1')
  // Die Hülle ist sr-only: 1 × 1 px und schneidet das Feld ab. Playwright zählt das als „sichtbar“, deshalb über die Hülle geprüft.
  const huelle = fax.locator('xpath=ancestor::*[@aria-hidden="true"][1]')
  await expect(huelle).toHaveCount(1)
  const box = (await huelle.boundingBox())!
  expect(box.width).toBeLessThanOrEqual(1)
  expect(box.height).toBeLessThanOrEqual(1)
  expect(await huelle.evaluate((el) => getComputedStyle(el).overflow)).toBe('hidden')
  await expect(b.getByRole('textbox', { name: t.honigtopf })).toHaveCount(0)
  // Nach dem letzten Link vor dem Feld springt Tab direkt zum Knopf
  await b.getByRole('link', { name: t.einwilligung.link }).focus()
  await page.keyboard.press('Tab')
  await expect(senden(page)).toBeFocused()
})

test('„Richtpreise ansehen“ öffnet die Preisübersicht', async ({ page }) => {
  const knopf = page.locator('#erwartungen').getByRole('button', { name: partner.erwartungen.richtpreiseLink })
  await expect(knopf).toHaveAttribute('aria-haspopup', 'dialog')
  await knopf.click()
  await expect(preisDialog(page)).toBeVisible()
})

for (const [wo, ort, name] of [
  ['#fragen', 'Karte am Ende von „Häufige Fragen“', partner.einstieg.hinweis.link],
  ['footer', 'Fuß', partner.einstieg.fuss],
] as const)
  test(`Erreichbar von der Startseite: ${ort}`, async ({ page }) => {
    await page.goto('/')
    await page.locator(wo).getByRole('link', { name, exact: true }).click()
    await expect(page).toHaveURL(/\/partner-werden\/$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(partner.intro.titel)
  })
