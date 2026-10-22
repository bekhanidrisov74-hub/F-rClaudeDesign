import { expect, test } from './test'

// Jedes Bedienelement ist per Tab erreichbar (vorwärts und rückwärts) und nie ganz verdeckt (WCAG 2.4.11).
// Eine Gruppe von Optionsfeldern ist ein Tab-Halt (die Pfeiltasten wählen darin), sie zählt deshalb einmal.
// Felder mit tabindex="-1" (Honigtopf der Bewerbung) stehen absichtlich nicht in der Tab-Reihenfolge.
for (const pfad of ['/', '/partner-werden/', '/impressum/'])
  test(`${pfad}: Tab erreicht alles, Fokus nie verdeckt`, async ({ page }) => {
    await page.goto(pfad)
    const einzeln = await page
      .locator('a[href]:visible, button:not([disabled]):visible, input:not([type="radio"]):not([tabindex="-1"]):visible, select:visible, textarea:visible')
      .count()
    const gruppen = new Set(await page.locator('input[type="radio"]:visible').evaluateAll((els) => els.map((el) => (el as HTMLInputElement).name)))
    const erwartet = einzeln + gruppen.size

    for (const taste of ['Tab', 'Shift+Tab']) {
      await page.goto(pfad)
      const erreicht = new Set<string>()
      const verdeckt: string[] = []
      for (let i = 0; i < erwartet + 5; i++) {
        await page.keyboard.press(taste)
        const info = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null
          if (!el || el === document.body) return null
          const r = el.getBoundingClientRect()
          const x = Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1)
          const y = Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1)
          const oben = document.elementFromPoint(x, y)
          const sichtbar = !!oben && (el === oben || el.contains(oben) || oben.contains(el))
          if (!el.dataset.tabId) el.dataset.tabId = String(Math.random())
          return { id: el.dataset.tabId, name: (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 40), sichtbar }
        })
        if (!info) continue
        erreicht.add(info.id)
        if (!info.sichtbar) verdeckt.push(info.name)
      }
      expect(verdeckt, `${taste}: verdeckter Fokus`).toEqual([])
      expect(erreicht.size, `${taste}: erreichte Elemente`).toBeGreaterThanOrEqual(erwartet)
    }
  })
