import { expect, test, type Page } from './test'
import {
  antworteLuna,
  chat,
  fuelleKontakt,
  lunaAbsenden,
  lunaBisZusammenfassung,
  lunaImGespraech,
  lunaKnopf,
  oeffneLuna,
  preisDialog,
} from './hilfen'

const handy = (breite: number) => breite < 640
const anstupser = (page: Page) => page.getByRole('status').filter({ hasText: 'Notfall?' })

/** Gesendete Anfragen an die lokale Attrappe mitschreiben */
function anfragen(page: Page) {
  const liste: URLSearchParams[] = []
  page.on('request', (r) => {
    if (r.method() === 'POST' && new URL(r.url()).pathname === '/api/anfrage') liste.push(new URLSearchParams(r.postData() ?? ''))
  })
  return liste
}

test.describe('Anstupser', () => {
  test('erscheint nach 25 s, einmal pro Besuch; Text öffnet den Chat', async ({ page }) => {
    await page.clock.install()
    await page.goto('/')
    await page.clock.fastForward(24_000)
    await expect(anstupser(page)).toHaveCount(0)
    await page.clock.fastForward(1500)
    await expect(anstupser(page)).toBeVisible()
    await expect(anstupser(page)).toContainText('Notfall? Ich helfe Ihnen in einer Minute.')
    expect(await page.evaluate(() => sessionStorage.getItem('fixit-nudge'))).not.toBeNull()
    await anstupser(page).getByRole('button', { name: /Notfall\?/ }).click()
    await expect(chat(page)).toBeVisible()
  })

  test('erscheint ab 60 % Scrolltiefe, auch vor 25 s', async ({ page }) => {
    await page.clock.install()
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.4))
    await page.clock.fastForward(500)
    await expect(anstupser(page)).toHaveCount(0)
    await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.65))
    await expect(anstupser(page)).toBeVisible()
  })

  test('Schließen blendet aus, nach dem Neuladen kommt er nicht wieder', async ({ page }) => {
    await page.clock.install()
    await page.goto('/')
    await page.clock.fastForward(26_000)
    await anstupser(page).getByRole('button', { name: 'Hinweis schließen' }).click()
    await expect(anstupser(page)).toHaveCount(0)
    await page.reload()
    await page.clock.fastForward(30_000)
    await expect(anstupser(page)).toHaveCount(0)
  })

  test('kommt nicht, wenn der Chat schon offen war', async ({ page }) => {
    await page.clock.install()
    await page.goto('/')
    await oeffneLuna(page)
    await page.keyboard.press('Escape')
    await page.clock.fastForward(30_000)
    await expect(anstupser(page)).toHaveCount(0)
  })
})

test('Luna-Knopf: Label, Größe, Position', async ({ page }) => {
  await page.goto('/')
  const knopf = lunaKnopf(page)
  await expect(knopf).toHaveAttribute('aria-expanded', 'false')
  await expect(knopf).toHaveAttribute('aria-controls', 'luna-chat')
  const box = (await knopf.boundingBox())!
  const { width, height } = page.viewportSize()!
  const [groesse, rand] = handy(width) ? [58, 16] : [64, 28]
  expect(Math.round(box.width)).toBe(groesse)
  expect(Math.round(width - box.x - box.width)).toBe(rand)
  expect(Math.round(height - box.y - box.height)).toBe(rand)
})

test('alle #luna-Links öffnen den Chat', async ({ page }) => {
  await page.goto('/')
  for (const link of await page.locator('a[href="#luna"]').all()) {
    await link.scrollIntoViewIfNeeded()
    await link.click()
    await expect(chat(page)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(chat(page)).toBeHidden()
  }
})

test('Fenster (ab 640) nicht modal, Vollbild (darunter) modal; Fokus in die erste Auswahl', async ({ page }) => {
  await page.goto('/')
  await oeffneLuna(page)
  const c = chat(page)
  const { width, height } = page.viewportSize()!
  await expect(c.getByRole('button', { name: 'Installateur' })).toBeFocused()
  const modal = await c.evaluate((d: Element) => d.matches(':modal'))
  const box = (await c.boundingBox())!
  if (handy(width)) {
    expect(modal).toBe(true)
    expect(Math.round(box.width)).toBe(width)
    expect(Math.round(box.height)).toBe(height)
    await expect(c.getByRole('button', { name: 'Chat schließen' })).toBeVisible()
    await expect(c.getByRole('link', { name: /Anrufen/ })).toBeVisible()
  } else {
    expect(modal).toBe(false)
    expect(Math.round(box.width)).toBe(380)
    expect(Math.round(width - box.x - box.width)).toBe(28)
    expect(Math.round(height - box.y - box.height)).toBe(108)
    // Seite bleibt bedienbar, Anrufen im Kopf sichtbar und nicht verdeckt
    const kopfAnruf = page.locator('header').getByRole('link', { name: /Anrufen/ })
    await expect(kopfAnruf).toBeVisible()
    const k = (await kopfAnruf.boundingBox())!
    expect(box.y).toBeGreaterThan(k.y + k.height)
    await expect(lunaKnopf(page)).toHaveAttribute('aria-expanded', 'true')
    await expect(c.getByRole('button', { name: 'Chat minimieren' })).toBeVisible()
  }
})

test('Fenster bleibt auch auf niedrigen Bildschirmen unter dem Kopf (1366 × 768)', async ({ page }, info) => {
  test.skip(info.project.name !== 'd1440', 'nur Desktop')
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/')
  await oeffneLuna(page)
  const kopf = (await page.locator('header').first().boundingBox())!
  expect((await chat(page).boundingBox())!.y).toBeGreaterThanOrEqual(kopf.y + kopf.height)
})

test('Fortschritt in vier Schritten, Live-Region, Esc behält den Verlauf, Fokus zurück zum Knopf', async ({ page }) => {
  await page.goto('/')
  await oeffneLuna(page)
  const c = chat(page)
  const balken = c.getByRole('progressbar')
  await expect(balken).toHaveAttribute('aria-valuetext', 'Schritt 1 von 4: Problem')
  await expect(c.locator('[aria-live="polite"]')).toContainText('Worum geht es?')
  await antworteLuna(page, 'Installateur')
  await expect(balken).toHaveAttribute('aria-valuetext', 'Schritt 2 von 4: Details')
  await expect(c.locator('[aria-live="polite"]')).toContainText('Was ist das Problem?')
  await expect(c.getByRole('group', { name: 'Antwort wählen' }).getByRole('button', { name: 'Überspringen' })).toBeVisible()
  await antworteLuna(page, 'Unter der Spüle tritt Wasser aus.')
  await page.keyboard.press('Escape')
  await expect(c).toBeHidden()
  await expect(lunaKnopf(page)).toBeFocused()
  await oeffneLuna(page)
  await expect(c).toContainText('Unter der Spüle tritt Wasser aus.')
  await expect(c).toContainText('Wo tritt das Problem auf?')
})

test('Neuladen setzt das Gespräch fort (sessionStorage fixit-luna)', async ({ page }) => {
  await page.goto('/')
  await lunaImGespraech(page)
  await page.reload()
  await oeffneLuna(page)
  await expect(chat(page)).toContainText('Unter der Spüle tritt Wasser aus.')
  await expect(chat(page).getByRole('button', { name: 'Läuft stark aus' })).toBeVisible()
  await expect(chat(page).getByRole('progressbar')).toHaveAttribute('aria-valuetext', 'Schritt 2 von 4: Details')
})

test('Esc schließt zuerst die Preisübersicht, dann den Chat', async ({ page }) => {
  test.skip(handy(page.viewportSize()!.width), 'Am Handy liegt der Chat als Vollbild über der Seite')
  await page.goto('/')
  await oeffneLuna(page)
  // Per Tastatur: Das Fenster kann den Knopf auf der Seite verdecken
  await page.getByRole('button', { name: 'Alle Richtpreise im Überblick' }).focus()
  await page.keyboard.press('Enter')
  await expect(preisDialog(page)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(preisDialog(page)).toBeHidden()
  await expect(chat(page)).toBeVisible()
  await chat(page).getByRole('button', { name: 'Installateur' }).focus()
  await page.keyboard.press('Escape')
  await expect(chat(page)).toBeHidden()
  await expect(lunaKnopf(page)).toBeFocused()
})

test('Notruf-Hinweis bei „Funken“, der Ablauf läuft weiter', async ({ page }) => {
  await page.goto('/')
  await oeffneLuna(page)
  for (const a of ['Elektro', 'Kein Strom', 'Ein Raum', 'Ja', 'Funken']) await antworteLuna(page, a)
  const c = chat(page)
  await expect(c.getByRole('alert')).toHaveText('Bei akuter Gefahr bitte sofort 122 bzw. 112 kontaktieren. Ich nehme Ihre Anfrage parallel weiter auf.')
  // ACUTE ist gesetzt: keine Frage nach der Dringlichkeit, weiter zum Ort
  await expect(c).toContainText('Wie lautet Ihre Postleitzahl?')
})

test('„Läuft stark aus“ setzt ACUTE; PLZ „123“ wird abgelehnt', async ({ page }) => {
  await page.goto('/')
  await oeffneLuna(page)
  for (const a of ['Installateur', 'Wasser tritt aus', 'Bad', 'Läuft stark aus', 'Nein']) await antworteLuna(page, a)
  await antworteLuna(page, '123')
  await expect(chat(page)).toContainText('Bitte geben Sie eine österreichische Postleitzahl mit vier Ziffern ein, zum Beispiel 1020.')
  await antworteLuna(page, '1020')
  const karte = chat(page).getByRole('region', { name: 'Ihre Anfrage' })
  await expect(karte).toContainText('DringlichkeitAkut/Gefahr')
  await expect(karte).toContainText('Ort1020 Wien')
})

test('Zusammenfassung: Kontaktdaten und Einwilligung sind Pflicht, der erste Fehler bekommt den Fokus', async ({ page }) => {
  await page.goto('/')
  await lunaBisZusammenfassung(page)
  const c = chat(page)
  for (const text of ['Installateur', 'Unter der Spüle tritt Wasser aus.', 'Küche', 'So schnell wie möglich', '1020 Wien', '95–140 € pro Stunde', 'Anfahrt 29,90 €'])
    await expect(c).toContainText(text)
  await expect(c).toContainText(
    'Ich stimme zu, dass meine Angaben zur Bearbeitung der Anfrage verwendet und zu diesem Zweck an einen passenden Partnerbetrieb weitergegeben werden.',
  )
  await expect(c.getByRole('progressbar')).toHaveAttribute('aria-valuetext', 'Schritt 4 von 4: Prüfen')
  await c.getByRole('button', { name: 'Auftrag aufgeben' }).click()
  await expect(c.getByLabel('Name')).toBeFocused()
  await expect(c).toContainText('Bitte geben Sie Ihren Namen ein.')
  await expect(c).toContainText('Bitte geben Sie eine Telefonnummer für den Rückruf ein.')
  await expect(c).toContainText('Bitte stimmen Sie der Weitergabe zu, sonst können wir keinen Betrieb vermitteln.')
  await fuelleKontakt(page)
  await c.getByLabel('E-Mail').fill('keine-adresse')
  await c.getByRole('button', { name: 'Auftrag aufgeben' }).click()
  await expect(c.getByLabel('E-Mail')).toBeFocused()
  await c.getByLabel('E-Mail').fill('')
  await c.getByRole('button', { name: 'Auftrag aufgeben' }).click()
  await expect(c.getByRole('checkbox')).toBeFocused()
})

test('Auftrag aufgeben: ein POST an den Anfrage-Eingang mit allen Feldern, Erfolg, Neue Anfrage', async ({ page }) => {
  const fehler: string[] = []
  page.on('console', (m) => m.type() === 'error' && fehler.push(m.text()))
  page.on('pageerror', (e) => fehler.push(e.message))
  const gesendet = anfragen(page)
  await page.goto('/')
  await lunaBisZusammenfassung(page)
  const c = chat(page)
  await fuelleKontakt(page)
  await c.getByRole('checkbox').check()
  // Doppelklick darf nicht doppelt senden; der Knopf ist im Fenster bzw. Vollbild erreichbar (auch 390 px)
  await c.getByRole('button', { name: 'Auftrag aufgeben' }).dblclick()
  await expect(c.getByRole('heading', { name: 'Danke, Maria Huber. Ihre Anfrage ist unterwegs.' })).toBeVisible()
  expect(gesendet).toHaveLength(1)
  const p = Object.fromEntries(gesendet[0])
  expect(p).toMatchObject({
    art: 'anfrage',
    name: 'Maria Huber',
    tel: '0664 1234567',
    email: '',
    plz: '1020',
    ort: 'Wien',
    kategorie: 'installateur',
    bereich: 'Installateur',
    dringlichkeit: 'URGENT',
    wunschtermin: '',
    dsgvo: 'on',
  })
  expect(p.anfrageId).toMatch(/^F247-[A-Z0-9]{6}$/)
  expect(JSON.parse(p.antworten)).toEqual({ was: 'Unter der Spüle tritt Wasser aus.', wo: 'Küche', menge: 'Tropft nur', abgestellt: 'Ja' })
  expect(p.text).toContain('(Anfrage über Luna)')

  await expect(c).toContainText(`Anfragenummer: ${p.anfrageId}`)
  await expect(c).toContainText('Wir geben sie jetzt an einen passenden Installateur in Ihrer Nähe weiter. Der Betrieb ruft Sie unter 0664 1234567 zurück.')
  await expect(c.getByRole('link', { name: 'Fragen? Jetzt anrufen' })).toHaveAttribute('href', /^tel:/)
  await expect(c.getByRole('progressbar')).toHaveCount(0)
  // Kontaktdaten nach dem Abschluss nicht in der Sitzung
  expect(await page.evaluate(() => JSON.stringify(sessionStorage))).not.toContain('0664')

  await c.getByRole('button', { name: 'Neue Anfrage starten' }).click()
  await expect(c.getByRole('button', { name: 'Installateur' })).toBeVisible()
  await expect(c).not.toContainText('Maria Huber')
  expect(fehler).toEqual([])
})

test('kein Betrieb gefunden: Anfrage ist trotzdem aufgenommen', async ({ page }) => {
  await page.route('**/api/anfrage', (r) => r.fulfill({ json: { ok: true, match: 'NONE' } }))
  await page.goto('/')
  await lunaAbsenden(page)
  const c = chat(page)
  await expect(c.getByRole('heading', { name: 'Danke, Maria Huber. Ihre Anfrage ist eingegangen.' })).toBeVisible()
  await expect(c).toContainText('Gerade ist kein passender Installateur frei. Wir nehmen Ihre Anfrage trotzdem auf, suchen weiter und melden uns unter 0664 1234567.')
})

test('fremde Antwort des Eingangs gilt als Fehler', async ({ page }) => {
  await page.route('**/api/anfrage', (r) => r.fulfill({ body: 'OK' }))
  await page.goto('/')
  await lunaAbsenden(page)
  await expect(chat(page).getByRole('alert')).toContainText('Die Anfrage wurde nicht gesendet.')
})

test('Sendefehler mit ?fehler=1: Alarm, Angaben bleiben, Erneut versuchen mit derselben Anfrage-Id', async ({ page }) => {
  const gesendet = anfragen(page)
  await page.goto('/?fehler=1')
  await lunaAbsenden(page)
  const c = chat(page)
  const alarm = c.getByRole('alert')
  await expect(alarm).toContainText('Die Anfrage wurde nicht gesendet.')
  await expect(alarm.getByRole('link', { name: 'Stattdessen anrufen' })).toHaveAttribute('href', /^tel:/)
  await expect(c).toContainText('Installateur, 1020 Wien, so schnell wie möglich. Unter der Spüle tritt Wasser aus. Maria Huber, 0664 1234567')
  // Fenster: bisheriger Verlauf bleibt sichtbar (Screen 12 rechts), Vollbild: nicht (Screen 10)
  const frage = c.getByText('Wie dringend ist es?')
  if (handy(page.viewportSize()!.width)) await expect(frage).toBeHidden()
  else await expect(frage).toBeVisible()
  // Nichts wurde aufgegeben: kein Echo „Auftrag aufgegeben“ (SPEC 1, Screen 10/12 rechts)
  await expect(c.getByText('Auftrag aufgegeben', { exact: true })).toHaveCount(0)
  await alarm.getByRole('button', { name: 'Erneut versuchen' }).click()
  await expect(c.getByRole('alert')).toContainText('Die Anfrage wurde nicht gesendet.')
  await expect.poll(() => gesendet.length).toBe(2)
  expect(gesendet[1].get('anfrageId')).toBe(gesendet[0].get('anfrageId'))
})

test('Wechsel über 640 px bei offenem Chat ohne Fehler, Verlauf bleibt', async ({ page }, info) => {
  test.skip(info.project.name !== 't1024', 'einmal reicht')
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(e.message))
  await page.goto('/')
  await oeffneLuna(page)
  await antworteLuna(page, 'Elektro')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(chat(page)).toBeVisible()
  expect(await chat(page).evaluate((d: Element) => d.matches(':modal'))).toBe(true)
  await page.setViewportSize({ width: 1024, height: 768 })
  await expect(chat(page)).toBeVisible()
  expect(await chat(page).evaluate((d: Element) => d.matches(':modal'))).toBe(false)
  await expect(chat(page)).toContainText('Was funktioniert nicht?')
  expect(fehler).toEqual([])
})

test('Fenster: Esc auf der Seite minimiert, der Fokus bleibt dort (WCAG 2.4.11)', async ({ page }) => {
  test.skip(handy(page.viewportSize()!.width), 'nur Fenster')
  await page.goto('/')
  await oeffneLuna(page)
  const kopfAnruf = page.locator('header').getByRole('link', { name: /Anrufen/ })
  await kopfAnruf.focus()
  await page.keyboard.press('Escape')
  await expect(chat(page)).toBeHidden()
  await expect(kopfAnruf).toBeFocused()
  await expect(lunaKnopf(page)).toHaveAttribute('aria-expanded', 'false')
})
