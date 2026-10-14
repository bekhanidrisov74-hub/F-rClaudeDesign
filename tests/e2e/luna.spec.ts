import { expect, test } from './test'
import { antworteLuna, chat, lunaBisZusammenfassung, lunaKnopf, oeffneLuna } from './hilfen'

const handy = (breite: number) => breite < 640

test.describe('Anstupser', () => {
  test('erscheint nach etwa 8 s, einmal pro Besuch; Text öffnet den Chat', async ({ page }) => {
    await page.clock.install()
    await page.goto('/')
    const anstupser = page.getByRole('status').filter({ hasText: 'Notfall?' })
    await page.clock.fastForward(7000)
    await expect(anstupser).toHaveCount(0)
    await page.clock.fastForward(1500)
    await expect(anstupser).toBeVisible()
    await expect(anstupser).toContainText('Notfall? Ich helfe Ihnen in einer Minute.')
    await anstupser.getByRole('button', { name: /Notfall\?/ }).click()
    await expect(chat(page)).toBeVisible()
  })

  test('Schließen blendet aus, nach dem Neuladen kommt er nicht wieder', async ({ page }) => {
    await page.clock.install()
    await page.goto('/')
    await page.clock.fastForward(9000)
    const anstupser = page.getByRole('status').filter({ hasText: 'Notfall?' })
    await anstupser.getByRole('button', { name: 'Hinweis schließen' }).click()
    await expect(anstupser).toHaveCount(0)
    await page.reload()
    await page.clock.fastForward(20000)
    await expect(page.getByRole('status').filter({ hasText: 'Notfall?' })).toHaveCount(0)
  })

  test('kommt nicht, wenn der Chat schon offen war', async ({ page }) => {
    await page.clock.install()
    await page.goto('/')
    await oeffneLuna(page)
    await page.keyboard.press('Escape')
    await page.clock.fastForward(20000)
    await expect(page.getByRole('status').filter({ hasText: 'Notfall?' })).toHaveCount(0)
  })
})

test('Luna-Knopf: Label, Größe, Position', async ({ page }) => {
  await page.goto('/')
  const knopf = lunaKnopf(page)
  await expect(knopf).toHaveAttribute('aria-expanded', 'false')
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

test('Fortschritt, Live-Region und Esc mit erhaltenem Verlauf', async ({ page }) => {
  await page.goto('/')
  await oeffneLuna(page)
  const c = chat(page)
  const balken = c.getByRole('progressbar')
  await expect(balken).toHaveAttribute('aria-valuenow', '1')
  await expect(balken).toHaveAttribute('aria-valuetext', 'Frage 1 von 5')
  await expect(c.locator('[aria-live="polite"]')).toContainText('Worum geht es?')
  await antworteLuna(page, 'Installateur')
  await expect(balken).toHaveAttribute('aria-valuenow', '2')
  await expect(c.locator('[aria-live="polite"]')).toContainText('Verstanden. Was ist passiert?')
  await antworteLuna(page, 'Unter der Spüle tritt Wasser aus.')
  await expect(balken).toHaveAttribute('aria-valuetext', 'Frage 3 von 5')
  await page.keyboard.press('Escape')
  await expect(c).toBeHidden()
  await oeffneLuna(page)
  await expect(c.getByRole('progressbar')).toHaveAttribute('aria-valuetext', 'Frage 3 von 5')
  await expect(c).toContainText('Unter der Spüle tritt Wasser aus.')
})

test('falsche PLZ, fehlende Nummer, Zusammenfassung, Angaben ändern', async ({ page }) => {
  await page.goto('/')
  await oeffneLuna(page)
  const c = chat(page)
  await antworteLuna(page, 'Installateur')
  await antworteLuna(page, 'Unter der Spüle tritt Wasser aus.')
  await expect(c).toContainText('Danke. Falls möglich, drehen Sie den Hauptwasserhahn zu. Wie lautet Ihre Postleitzahl?')
  await antworteLuna(page, '102')
  await expect(c).toContainText('Bitte geben Sie eine österreichische Postleitzahl mit vier Ziffern ein, zum Beispiel 1020.')
  await antworteLuna(page, '1020')
  await antworteLuna(page, 'Sofort, es ist ein Notfall')
  await antworteLuna(page, 'Maria Huber')
  await expect(c).toContainText('Unter welcher Nummer erreicht Sie der Betrieb?')
  await antworteLuna(page, '0664 1234567')
  const zusammenfassung = c.getByRole('heading', { name: 'Ihre Anfrage' })
  await expect(zusammenfassung).toBeVisible()
  for (const text of ['Installateur', 'Unter der Spüle tritt Wasser aus.', '1020 Wien', 'Sofort, Notfall', 'Maria Huber', '0664 1234567', '95–140 € pro Stunde', 'Anfahrt 29,90 €'])
    await expect(c).toContainText(text)
  await expect(c.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '5')
  await c.getByRole('button', { name: 'Angaben ändern' }).click()
  await expect(c.getByRole('progressbar')).toHaveAttribute('aria-valuetext', 'Frage 2 von 5')
  await expect(c.getByRole('textbox')).toHaveValue('Unter der Spüle tritt Wasser aus.')
})

test('Einwilligung ist Pflicht, dann Erfolg mit Anfragenummer und Tipp', async ({ page }) => {
  await page.goto('/')
  await lunaBisZusammenfassung(page)
  const c = chat(page)
  const einwilligung = c.getByRole('checkbox')
  await expect(einwilligung).not.toBeChecked()
  await c.getByRole('button', { name: 'Auftrag aufgeben' }).click()
  await expect(c).toContainText('Bitte stimmen Sie der Weitergabe zu, sonst können wir keinen Betrieb vermitteln.')
  await expect(einwilligung).toBeFocused()
  await einwilligung.check()
  await c.getByRole('button', { name: 'Auftrag aufgeben' }).click()
  await expect(c.getByRole('heading', { name: 'Danke, Maria Huber. Ihre Anfrage ist unterwegs.' })).toBeVisible()
  await expect(c).toContainText(/Anfragenummer: F247-[A-Z0-9]{6}/)
  await expect(c).toContainText('Wir geben sie jetzt an einen passenden Installateur in Ihrer Nähe weiter. Der Betrieb ruft Sie unter 0664 1234567 zurück.')
  await expect(c).toContainText('Bis der Betrieb kommt: Drehen Sie, wenn möglich, den Hauptwasserhahn zu und halten Sie Abstand zu nassen Steckdosen.')
  await expect(c.getByRole('link', { name: 'Fragen? Jetzt anrufen' })).toHaveAttribute('href', /^tel:/)
  await expect(c.getByRole('progressbar')).toHaveCount(0)
})

test('Sendefehler mit ?fehler=1: Alarm, Angaben bleiben, Erneut senden', async ({ page }) => {
  await page.goto('/?fehler=1')
  await lunaBisZusammenfassung(page)
  const c = chat(page)
  await c.getByRole('checkbox').check()
  await c.getByRole('button', { name: 'Auftrag aufgeben' }).click()
  const alarm = c.getByRole('alert')
  await expect(alarm).toContainText('Die Anfrage wurde nicht gesendet.')
  await expect(alarm.getByRole('link', { name: 'Stattdessen anrufen' })).toHaveAttribute('href', /^tel:/)
  await expect(c).toContainText('Installateur, 1020 Wien, sofort. Unter der Spüle tritt Wasser aus. Maria Huber, 0664 1234567')
  await alarm.getByRole('button', { name: 'Erneut senden' }).click()
  await expect(c.getByRole('alert')).toContainText('Die Anfrage wurde nicht gesendet.')
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
  await expect(chat(page)).toContainText('Verstanden. Was ist passiert?')
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
