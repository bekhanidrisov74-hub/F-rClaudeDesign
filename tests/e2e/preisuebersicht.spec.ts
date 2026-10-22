import { expect, test } from './test'
import { ergebnis, oeffnePreisuebersicht, preisDialog } from './hilfen'
import { copy, fuelle } from '../../src/content/copy'
import { gewerke, PREISE_STAND } from '../../src/content/gewerke'

const schliessen = 'Preisübersicht schließen'

test('öffnet als Dialog ab 640 px, als Sheet darunter', async ({ page }) => {
  await page.goto('/')
  await oeffnePreisuebersicht(page)
  const dialog = preisDialog(page)
  const fenster = page.viewportSize()!
  const box = (await dialog.boundingBox())!
  if (fenster.width < 640) {
    // Sheet: unten angedockt, volle Breite
    const inhalt = await dialog.evaluate((d) => {
      const r = [...d.querySelectorAll('*')].map((e) => e.getBoundingClientRect()).filter((r) => r.width > 300)
      return { unten: Math.max(...r.map((x) => x.bottom)), links: Math.min(...r.map((x) => x.left)) }
    })
    expect(Math.round(inhalt.unten)).toBeGreaterThanOrEqual(fenster.height - 1)
    expect(Math.round(inhalt.links)).toBeLessThanOrEqual(0)
    await expect(dialog.getByRole('table')).toBeHidden()
  } else {
    // Dialog: 680 px breit, mittig
    const breite = await dialog.evaluate((d) => {
      const r = [...d.querySelectorAll('*')].map((e) => e.getBoundingClientRect()).filter((r) => r.width > 300)
      return Math.max(...r.map((x) => x.width))
    })
    expect(Math.round(breite)).toBe(680)
    expect(Math.abs(box.x + box.width / 2 - fenster.width / 2)).toBeLessThan(2)
    await expect(dialog.getByRole('table')).toBeVisible()
  }
  for (const g of gewerke) await expect(dialog.getByText(g.name, { exact: true }).locator('visible=true')).toHaveCount(1)
})

test('Fokus auf Schließen, Fokusfalle, Esc, Fokus zurück, Seite gesperrt', async ({ page }) => {
  await page.goto('/')
  const ausloeser = await oeffnePreisuebersicht(page)
  const dialog = preisDialog(page)
  await expect(page.getByRole('button', { name: schliessen })).toBeFocused()
  // showModal(): modal, aria-modal implizit
  expect(await dialog.evaluate((d) => d.matches(':modal'))).toBe(true)
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden')
  // Modaler Dialog: Die Seite ist inert. Tab läuft durch den Dialog und höchstens kurz in die Browserleiste (body).
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press('Tab')
    const drin = await dialog.evaluate((d) => d.contains(document.activeElement) || document.activeElement === document.body)
    expect(drin, `Tab ${i}`).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(ausloeser).toBeFocused()
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe('hidden')
})

test('Klick auf die Abdunklung schließt, Klick in die Karte nicht', async ({ page }) => {
  await page.goto('/')
  await oeffnePreisuebersicht(page)
  const dialog = preisDialog(page)
  await dialog.getByRole('heading', { name: 'Richtpreise im Überblick' }).click()
  await expect(dialog).toBeVisible()
  await page.mouse.click(4, 4)
  await expect(dialog).toBeHidden()
})

test('Schließen-Knopf schließt', async ({ page }) => {
  await page.goto('/')
  await oeffnePreisuebersicht(page)
  await page.getByRole('button', { name: schliessen }).click()
  await expect(preisDialog(page)).toBeHidden()
})

test('„Zum Preisrechner“ schließt und springt zum Rechner', async ({ page }) => {
  await page.goto('/')
  await oeffnePreisuebersicht(page)
  const dialog = preisDialog(page)
  await dialog.getByRole('link', { name: 'Zum Preisrechner' }).or(dialog.getByRole('button', { name: 'Zum Preisrechner' })).locator('visible=true').click()
  await expect(preisDialog(page)).toBeHidden()
  await expect(page.locator('#preisrechner h2')).toBeInViewport()
})

test('Auslöser im Rechner öffnet ebenfalls', async ({ page }) => {
  await page.goto('/#preisrechner')
  const ausloeser = page.locator('#preisrechner').getByRole('button', { name: 'Preisübersicht öffnen' })
  await ausloeser.click()
  await expect(preisDialog(page)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(ausloeser).toBeFocused()
})

test('Gewerke-Icons: flache SVGs im Lagune-Kreis wie bei den Vorteilen, bündig am Zeilenanfang', async ({ page }, info) => {
  await page.goto('/')
  await oeffnePreisuebersicht(page)
  await expect(preisDialog(page).locator('img')).toHaveCount(0)
  const kreise = await preisDialog(page)
    .locator('svg:visible')
    .evaluateAll((els) =>
      els
        .filter((el) => el.closest('th, li'))
        .map((el) => {
          const kreis = el.parentElement!.parentElement!
          const zeile = kreis.closest('th, li')!
          return {
            breite: Math.round(kreis.getBoundingClientRect().width),
            // bündig am Zeilenanfang (Spalte „Gewerk“ bzw. Listenrand)
            links: Math.round(kreis.getBoundingClientRect().left - zeile.getBoundingClientRect().left - parseFloat(getComputedStyle(zeile).paddingLeft)),
            flaeche: getComputedStyle(kreis).backgroundColor,
          }
        }),
    )
  expect(kreise).toHaveLength(gewerke.length)
  // ab 640 px Tabelle mit 44-px-Kreisen, darunter die Liste im Sheet mit 40 px
  const breite = info.project.name === 'm390' ? 40 : 44
  for (const k of kreise) expect(k).toEqual({ breite, links: 0, flaeche: 'rgb(190, 240, 246)' })
})

test('Stand der Richtpreise: im Kopf-Satz von Dialog und Sheet, derselbe Wortlaut wie in der Ergebniskarte', async ({ page }, info) => {
  const stand = fuelle(copy.preisStand, { stand: PREISE_STAND })
  await page.goto('/#preisrechner')
  const karte = ergebnis(page)
  await expect(karte.getByText(stand, { exact: true })).toBeVisible()
  await oeffnePreisuebersicht(page)
  const dialog = preisDialog(page)
  const sichtbar = dialog.getByText(stand).locator('visible=true')
  await expect(sichtbar).toHaveCount(1)
  await expect(sichtbar).toHaveText(`${copy.preisuebersicht.lead} ${stand}`)
  await expect(sichtbar).toHaveJSProperty('tagName', 'P')
  // Die Hinweise unten bleiben unverändert
  if (info.project.name === 'm390') await expect(dialog.getByText(copy.preisuebersicht.hinweisSheet, { exact: true })).toBeVisible()
  else expect(await dialog.locator('ul:visible').last().locator('li').allTextContents()).toEqual([...copy.preisuebersicht.hinweiseDialog])
})

test('Preisübersicht bei 1024 × 768: Anruf-Knopf ganz im Dialog, ohne Scrollen', async ({ page }, info) => {
  test.skip(info.project.name !== 't1024', 'eine niedrige Fensterhöhe genügt')
  await page.goto('/')
  await oeffnePreisuebersicht(page)
  const dialog = preisDialog(page)
  const rahmen = (await dialog.boundingBox())!
  const knopf = (await dialog.getByRole('link', { name: /Jetzt anrufen/ }).locator('visible=true').boundingBox())!
  expect(knopf.y + knopf.height).toBeLessThanOrEqual(rahmen.y + rahmen.height)
})
