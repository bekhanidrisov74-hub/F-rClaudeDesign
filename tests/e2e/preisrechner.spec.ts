import { expect, test, type Page } from './test'
import { ergebnis, rechner, schalteZuschlag, setzeStunden, waehleGewerk } from './hilfen'
import { copy, fuelle } from '../../src/content/copy'
import { PREISE_STAND } from '../../src/content/gewerke'

test.beforeEach(async ({ page }) => {
  await page.goto('/#preisrechner')
})

test('Startzustand: Installateur, 2 Stunden, kein Zuschlag', async ({ page }) => {
  const gewerk = rechner(page).getByRole('group', { name: 'Gewerk' })
  await expect(gewerk.getByRole('button', { name: 'Installateur', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(gewerk.getByRole('button', { pressed: true })).toHaveCount(1)
  await expect(rechner(page).locator('output')).toHaveText('2 Stunden')
  await expect(rechner(page).locator('output')).toHaveAttribute('aria-live', 'polite')
  const karte = ergebnis(page)
  await expect(karte).toContainText('Installateur, 2 Stunden, kein Zuschlag')
  await expect(karte).toContainText('190,00–280,00 €')
  await expect(karte).toContainText('29,90 €')
  await expect(karte).toContainText('keiner')
  await expect(karte).toContainText('ca. 219,90 € – 309,90 €')
})

const FAELLE = [
  { gewerk: 'Installateur', stunden: 2, zuschlaege: [], gesamt: 'ca. 219,90 € – 309,90 €', zeile: 'Arbeit' },
  { gewerk: 'Schlüsseldienst', stunden: null, zuschlaege: [], gesamt: 'ca. 99,90 € – 199,90 €', zeile: 'Einsatz' },
  { gewerk: 'Installateur', stunden: 2, zuschlaege: ['Sonntag', 'Nacht'], gesamt: 'ca. 409,90 € – 589,90 €', zeile: 'Arbeit' },
  { gewerk: 'Schlüsseldienst', stunden: null, zuschlaege: ['Nacht'], gesamt: 'ca. 179,90 € – 379,90 €', zeile: 'Einsatz' },
  { gewerk: 'Elektro', stunden: 12, zuschlaege: ['Feiertag'], gesamt: 'ca. 2.189,90 € – 3.389,90 €', zeile: 'Arbeit' },
] as const

for (const f of FAELLE)
  test(`SPEC-Fall: ${f.gewerk}, ${f.stunden ?? 'Einsatz'}, ${f.zuschlaege.join('+') || 'kein Zuschlag'}`, async ({ page }) => {
    await waehleGewerk(page, f.gewerk)
    if (f.stunden) await setzeStunden(page, f.stunden)
    for (const z of f.zuschlaege) await schalteZuschlag(page, z)
    const karte = ergebnis(page)
    await expect(karte).toContainText(f.gesamt)
    await expect(karte.getByText(f.zeile, { exact: true })).toBeVisible()
    if (f.zuschlaege.length) {
      await expect(karte).toContainText('Zuschlag +100 %')
      await expect(karte).toContainText('auf die Arbeit, nur einmal')
    }
  })

test('Stepper geht in halben Stunden und bleibt zwischen 0,5 und 12', async ({ page }) => {
  const ausgabe = rechner(page).locator('output')
  const weniger = rechner(page).getByRole('button', { name: 'Eine halbe Stunde weniger' })
  const mehr = rechner(page).getByRole('button', { name: 'Eine halbe Stunde mehr' })
  await weniger.click()
  await expect(ausgabe).toHaveText('1,5 Stunden')
  await expect(ergebnis(page)).toContainText('Installateur, 1,5 Stunden, kein Zuschlag')
  await expect(ergebnis(page)).toContainText('ca. 172,40 € – 239,90 €')
  await setzeStunden(page, 0.5)
  await expect(weniger).toHaveAttribute('aria-disabled', 'true')
  await weniger.click({ force: true }) // an der Grenze: aria-disabled, Fokus bleibt
  await expect(ausgabe).toHaveText('0,5 Stunden')
  await setzeStunden(page, 12)
  await mehr.click({ force: true })
  await expect(ausgabe).toHaveText('12 Stunden')
  await expect(mehr).toHaveAttribute('aria-disabled', 'true')
})

test('Schlüsseldienst: Stepper weg, Hinweis „Preis pro Einsatz“, Zeile „Einsatz“', async ({ page }) => {
  await waehleGewerk(page, 'Schlüsseldienst')
  await expect(rechner(page).locator('output')).toHaveCount(0)
  await expect(rechner(page).getByText('Preis pro Einsatz', { exact: true })).toBeVisible()
  await expect(ergebnis(page)).toContainText('Schlüsseldienst, pro Einsatz, kein Zuschlag')
  await waehleGewerk(page, 'Installateur')
  await expect(rechner(page).locator('output')).toHaveText('2 Stunden')
})

test('Zuschläge: Hinweis wechselt bei zwei oder mehr', async ({ page }) => {
  const status = rechner(page).getByRole('group', { name: 'Zuschlag' }).getByRole('status')
  await expect(status).toHaveText('Nacht gilt von 18 bis 8 Uhr. Es zählt höchstens ein Zuschlag, auch wenn mehrere zutreffen.')
  await schalteZuschlag(page, 'Sonntag')
  await expect(status).toHaveText('Nacht gilt von 18 bis 8 Uhr. Es zählt höchstens ein Zuschlag, auch wenn mehrere zutreffen.')
  await schalteZuschlag(page, 'Nacht')
  await expect(status).toHaveText(
    'Es zählt nur ein Zuschlag. Sonntag und Nacht treffen beide zu, berechnet wird trotzdem nur einmal +100 %.',
  )
  await expect(ergebnis(page)).toContainText('Installateur, 2 Stunden, Sonntag und Nacht')
  await schalteZuschlag(page, 'Sonntag')
  await expect(status).toHaveText('Nacht gilt von 18 bis 8 Uhr. Es zählt höchstens ein Zuschlag, auch wenn mehrere zutreffen.')
})

test('Gesamt bleibt einzeilig, auch bei 320 px und vierstelligen Beträgen', async ({ page }, info) => {
  test.skip(info.project.name !== 'm390', 'setzt die Breite selbst')
  for (const breite of [320, 390, 1024, 1440]) {
    await page.setViewportSize({ width: breite, height: 900 })
    await page.goto(`/?breite=${breite}#preisrechner`) // neue URL: sonst bleibt der Zustand der letzten Runde
    await waehleGewerk(page, 'Elektro')
    await setzeStunden(page, 12)
    await schalteZuschlag(page, 'Feiertag')
    const gesamt = ergebnis(page).getByText('ca. 2.189,90 € – 3.389,90 €')
    const mass = await gesamt.evaluate((el) => {
      const s = getComputedStyle(el)
      return { hoehe: el.getBoundingClientRect().height, zeile: parseFloat(s.lineHeight) || parseFloat(s.fontSize) * 1.2, ueber: el.scrollWidth - el.clientWidth }
    })
    expect(mass.hoehe, `${breite}: einzeilig`).toBeLessThan(mass.zeile * 1.5)
    expect(mass.ueber, `${breite}: kein Überlauf`).toBeLessThanOrEqual(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `${breite}: Seite`).toBeLessThanOrEqual(0)
  }
})

test('Knöpfe der Ergebniskarte', async ({ page }) => {
  const karte = ergebnis(page)
  await expect(karte.getByRole('link', { name: /Jetzt anrufen/ })).toHaveAttribute('href', /^tel:/)
  await karte.getByRole('button', { name: 'Preisübersicht öffnen' }).click()
  await expect(page.getByRole('dialog', { name: 'Richtpreise im Überblick' })).toBeVisible()
})

test('Ergebniskarte nennt den Stand der Richtpreise, direkt nach dem Hinweis', async ({ page }) => {
  const karte = ergebnis(page)
  const stand = fuelle(copy.preisStand, { stand: PREISE_STAND })
  await expect(karte.getByText(stand, { exact: true })).toBeVisible()
  await expect(karte.getByText(copy.rechner.ergebnis.hinweis, { exact: true })).toBeVisible()
  // eigener Absatz nach dem Absatz mit dem Hinweis
  const folgt = await karte.getByText(copy.rechner.ergebnis.hinweis, { exact: true }).evaluate((p) => p.nextElementSibling?.textContent)
  expect(folgt).toBe(stand)
  // bleibt beim Wechsel von Gewerk und Zuschlag stehen
  await waehleGewerk(page, 'Schlüsseldienst')
  await schalteZuschlag(page, 'Nacht')
  await expect(karte.getByText(stand, { exact: true })).toBeVisible()
})

// ── „Jetzt gilt in Wien“ (Bauplan M6) ──
// Feste Uhr in Wiener Zeit (Versatz im Zeitpunkt), danach neu laden: Die Zeit wird beim Laden bestimmt.
// Jede Runde bekommt eine eigene Adresse, damit die Seite wirklich neu lädt (sonst bleibt der Zustand der letzten Runde).
const NAME = Object.fromEntries(copy.rechner.zuschlaege.map((z) => [z.id, z.name]))
const jetztGilt = (zuschlag: string) => fuelle(copy.rechner.jetztGilt, { zuschlag })

const zuschlagGruppe = (page: Page) => rechner(page).getByRole('group', { name: copy.rechner.zuschlag })
const jetztHinweis = (page: Page) => zuschlagGruppe(page).locator('[aria-live="polite"]')
const uebernehmenKnopf = (page: Page) => zuschlagGruppe(page).getByRole('button', { name: copy.rechner.uebernehmen, exact: true })
const umschalter = (page: Page, name: string) => zuschlagGruppe(page).getByRole('button', { name: new RegExp(`^${name}`) })

async function mitUhr(page: Page, wiener: string, runde: string) {
  await page.clock.setFixedTime(new Date(wiener))
  await page.goto(`/?uhr=${runde}#preisrechner`)
}

test.describe('Jetzt gilt in Wien', () => {
  test('Sonntag 12:00: Hinweis, Übernehmen schaltet Sonntag ein und der Knopf verschwindet', async ({ page }) => {
    await mitUhr(page, '2026-10-25T12:00:00+01:00', 'sonntag')
    await expect(jetztHinweis(page)).toHaveAttribute('aria-live', 'polite')
    await expect(jetztHinweis(page)).toContainText(jetztGilt(NAME.sonntag))
    await expect(zuschlagGruppe(page).getByRole('button', { pressed: true })).toHaveCount(0) // Start bleibt: keiner an
    await expect(ergebnis(page)).toContainText('Installateur, 2 Stunden, kein Zuschlag')

    await uebernehmenKnopf(page).click()
    await expect(umschalter(page, NAME.sonntag)).toHaveAttribute('aria-pressed', 'true')
    await expect(zuschlagGruppe(page).getByRole('button', { pressed: true })).toHaveCount(1)
    await expect(umschalter(page, NAME.sonntag)).toBeFocused()
    await expect(ergebnis(page)).toContainText('Installateur, 2 Stunden, Sonntag')
    await expect(ergebnis(page)).toContainText('Zuschlag +100 %')
    await expect(ergebnis(page)).toContainText('ca. 409,90 € – 589,90 €')
    await expect(uebernehmenKnopf(page)).toHaveCount(0)
    await expect(jetztHinweis(page)).toContainText(jetztGilt(NAME.sonntag)) // der Satz bleibt
  })

  test('Dienstag 12:00: kein Hinweis', async ({ page }) => {
    await mitUhr(page, '2026-10-27T12:00:00+01:00', 'dienstag-mittag')
    await schalteZuschlag(page, 'Nacht') // erst nach der Hydration prüfen, sonst wäre „nichts da“ nichts wert
    await expect(umschalter(page, NAME.nacht)).toHaveAttribute('aria-pressed', 'true')
    await expect(jetztHinweis(page)).toBeEmpty()
    await expect(rechner(page).getByText('Jetzt gilt in Wien')).toHaveCount(0)
    await expect(uebernehmenKnopf(page)).toHaveCount(0)
  })

  test('Dienstag 22:00: Nacht', async ({ page }) => {
    await mitUhr(page, '2026-10-27T22:00:00+01:00', 'dienstag-nacht')
    await expect(jetztHinweis(page)).toContainText(jetztGilt(NAME.nacht))
    await uebernehmenKnopf(page).click()
    await expect(umschalter(page, NAME.nacht)).toHaveAttribute('aria-pressed', 'true')
    await expect(ergebnis(page)).toContainText('Installateur, 2 Stunden, Nacht')
    await expect(uebernehmenKnopf(page)).toHaveCount(0)
  })

  test('26. Oktober 12:00: Feiertag', async ({ page }) => {
    await mitUhr(page, '2026-10-26T12:00:00+01:00', 'nationalfeiertag')
    await expect(jetztHinweis(page)).toContainText(jetztGilt(NAME.feiertag))
    await uebernehmenKnopf(page).click()
    await expect(umschalter(page, NAME.feiertag)).toHaveAttribute('aria-pressed', 'true')
    await expect(ergebnis(page)).toContainText('Installateur, 2 Stunden, Feiertag')
  })

  test('Feiertag auf einem Sonntag: Feiertag zuerst, nur ein Umschalter; schon an: kein Knopf', async ({ page }) => {
    await mitUhr(page, '2026-11-01T12:00:00+01:00', 'allerheiligen')
    await expect(jetztHinweis(page)).toContainText(jetztGilt(NAME.feiertag))
    await uebernehmenKnopf(page).click()
    await expect(umschalter(page, NAME.feiertag)).toHaveAttribute('aria-pressed', 'true')
    await expect(umschalter(page, NAME.sonntag)).toHaveAttribute('aria-pressed', 'false')
    await expect(zuschlagGruppe(page).getByRole('button', { pressed: true })).toHaveCount(1)
    // von Hand ausschalten: der Knopf kommt zurück, wieder einschalten: weg
    await schalteZuschlag(page, 'Feiertag')
    await expect(uebernehmenKnopf(page)).toBeVisible()
    await schalteZuschlag(page, 'Feiertag')
    await expect(uebernehmenKnopf(page)).toHaveCount(0)
  })

  test('Der Knopf ist mindestens 44 px hoch', async ({ page }) => {
    await mitUhr(page, '2026-10-25T12:00:00+01:00', 'sonntag-knopf')
    const box = await uebernehmenKnopf(page).boundingBox()
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(44)
  })

  test('Einmal pro Minute neu: Dienstag 17:59 kein Hinweis, eine Minute später Nacht', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-10-27T17:59:00+01:00') })
    await page.goto('/?uhr=minute#preisrechner')
    await schalteZuschlag(page, 'Sonntag') // Hydration abwarten
    await expect(umschalter(page, NAME.sonntag)).toHaveAttribute('aria-pressed', 'true')
    await expect(jetztHinweis(page)).toBeEmpty()
    await page.clock.fastForward(90_000)
    await expect(jetztHinweis(page)).toContainText(jetztGilt(NAME.nacht))
  })
})
