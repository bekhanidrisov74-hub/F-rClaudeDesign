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

/**
 * Scrollt und wartet, bis der Browser das scroll-Ereignis zugestellt hat: Knopf und Anstupser reagieren erst darauf,
 * und unter Last kommt es bis zu Sekunden nach scrollTo (gemessen bis 8,7 s), länger als ein expect wartet.
 * `ziel`: Anteil der Scrolltiefe (0 bis 1) oder „vorteile“ (bis die Vorteile nach oben aus dem Bild sind, nie zurück).
 */
export async function scrolle(page: Page, ziel: number | 'vorteile') {
  await page.evaluate(
    (ziel) =>
      new Promise<void>((fertig) => {
        const { scrollHeight } = document.documentElement
        const unten = document.getElementById('vorteile')?.getBoundingClientRect().bottom ?? 0
        const y = ziel !== 'vorteile' ? (scrollHeight - innerHeight) * ziel : unten > 0 ? scrollY + unten + 1 : scrollY
        const vorher = scrollY
        addEventListener('scroll', () => fertig(), { once: true })
        window.scrollTo(0, y)
        if (scrollY === vorher) fertig() // nichts bewegt, also kommt auch kein Ereignis
      }),
    ziel,
  )
}

/**
 * Wartet zwei gezeichnete Frames. Bis dahin hat der Browser die Ereignisse seines Rendering-Schritts zugestellt
 * (matchMedia-change nach einer Größenänderung) und die Seite ihre per requestAnimationFrame verschobene Arbeit erledigt.
 * Unter Last kommt der nächste Frame mitunter erst nach einer Sekunde.
 */
export async function zweiFrames(page: Page) {
  await page.evaluate(() => new Promise((fertig) => requestAnimationFrame(() => requestAnimationFrame(fertig))))
}

/** Auf der Startseite erscheint der Knopf erst, wenn die vier Vorteile (#vorteile) nach oben aus dem Bild gescrollt sind. */
export async function zeigeLunaKnopf(page: Page) {
  await scrolle(page, 'vorteile')
  await expect(lunaKnopf(page)).toBeVisible()
}

export async function oeffneLuna(page: Page) {
  await zeigeLunaKnopf(page)
  await lunaKnopf(page).click()
  await expect(chat(page)).toBeVisible()
}

/** Antwort geben: als Chip, wenn es ihn gibt, sonst als Freitext. */
export async function antworteLuna(page: Page, text: string) {
  const c = chat(page)
  const chip = c.getByRole('button', { name: text, exact: true })
  if (await chip.isVisible()) await chip.click()
  else {
    await c.getByRole('textbox', { name: 'Nachricht an Luna' }).fill(text)
    await c.getByRole('button', { name: 'Nachricht senden' }).click()
  }
  await expect(c.getByText(text, { exact: true }).last()).toBeVisible()
}

/** Mitten im Gespräch: Fragenkatalog des Installateurs, Chips zur Frage „Läuft Wasser aus oder tropft es?“ */
export async function lunaImGespraech(page: Page) {
  await oeffneLuna(page)
  for (const a of ['Installateur', 'Unter der Spüle tritt Wasser aus.', 'Küche']) await antworteLuna(page, a)
}

export async function lunaBisZusammenfassung(page: Page) {
  await lunaImGespraech(page)
  for (const a of ['Tropft nur', 'Ja', 'So schnell wie möglich', '1020']) await antworteLuna(page, a)
  await expect(chat(page).getByRole('heading', { name: 'Ihre Anfrage' })).toBeVisible()
}

/** Kontaktdaten in der Zusammenfassungskarte */
export async function fuelleKontakt(page: Page) {
  await chat(page).getByLabel('Name').fill('Maria Huber')
  await chat(page).getByLabel('Telefon').fill('0664 1234567')
}

export async function lunaAbsenden(page: Page) {
  await lunaBisZusammenfassung(page)
  await fuelleKontakt(page)
  await chat(page).getByRole('checkbox').check()
  await chat(page).getByRole('button', { name: 'Auftrag aufgeben' }).click()
}

export async function zeigeAnstupser(page: Page) {
  await page.clock.fastForward(26_000)
  await zeigeLunaKnopf(page)
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

// ── Partner-Bewerbung (/partner-werden/) ──
/** Abschnitt mit Formular bzw. Dank und Seitenkasten */
export const bewerbung = (page: Page) => page.locator('#bewerbung')
/** Optionsfeld in der Gruppe eines Feldes (alle Ja/Nein-Gruppen haben ein „Ja“) */
export const antwort = (page: Page, feld: string, name: string) =>
  bewerbung(page).locator(`#bewerbung-${feld}`).getByRole('radio', { name, exact: true })

/** Gültige Bewerbung, alle Felder über ihre Beschriftung */
export async function fuelleBewerbung(page: Page) {
  const b = bewerbung(page)
  await b.getByLabel('Firmenname').fill('Huber Installationen GmbH')
  await b.getByLabel('Ansprechperson').fill('Maria Huber')
  await b.getByLabel('Telefon').fill('0664 1234567')
  await b.getByLabel('E-Mail').fill('office@huber-installationen.at')
  await b.getByLabel('GISA-Zahl').fill('12345678')
  await b.getByLabel('UID-Nummer').fill('ATU12345678')
  const gewerke = b.getByRole('group', { name: 'Gewerke' })
  for (const name of ['Installateur', 'Heizung & Klima']) await gewerke.getByRole('checkbox', { name, exact: true }).check()
  await b.getByLabel('Einsatzgebiet (Postleitzahlen)').fill('1100, 1110, 1120')
  const zeiten = b.getByRole('group', { name: 'Wann sind Sie für Anfragen erreichbar?' })
  for (const name of ['Werktags tagsüber', 'Nachts']) await zeiten.getByRole('checkbox', { name, exact: true }).check()
  await antwort(page, 'notdienst', 'Ja').check()
  await b.getByLabel('Bei Notfällen vor Ort in').selectOption({ label: 'etwa 1 Stunde' })
  await antwort(page, 'richtpreise', 'Ja').check()
  for (const feld of ['haftpflicht', 'preisVorab', 'unbar']) await antwort(page, feld, 'Ja').check()
  await b.getByLabel('Schwerpunkte und Anmerkungen').fill('Gasthermen, Rohrreinigung')
  await b.getByRole('checkbox', { name: /^Ich stimme zu/ }).check()
}

export async function sendeBewerbungLeer(page: Page) {
  await bewerbung(page).getByRole('button', { name: 'Bewerbung senden' }).click()
  await expect(bewerbung(page).getByText('Bitte geben Sie den Namen Ihres Betriebs ein.')).toBeVisible()
}

export async function sendeBewerbung(page: Page) {
  await fuelleBewerbung(page)
  await bewerbung(page).getByRole('button', { name: 'Bewerbung senden' }).click()
}

export async function bewerbungErfolg(page: Page) {
  await sendeBewerbung(page)
  await expect(bewerbung(page).getByText(/Bewerbungsnummer/)).toBeVisible()
}

export async function bewerbungSendefehler(page: Page) {
  await sendeBewerbung(page)
  await expect(bewerbung(page).getByRole('alert')).toBeVisible()
}
