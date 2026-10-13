import { renderToString } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'
import { existsSync } from 'node:fs'
import { gewerke, type Gewerk } from '../../src/content/gewerke'

describe('Gewerke-Daten', () => {
  test('sind vollständig und stimmig', () => {
    const ids = gewerke.map((g) => g.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const g of gewerke) {
      expect(g.min, g.id).toBeLessThan(g.max)
      expect(existsSync(`design/icons/${g.icon}.svg`), g.icon).toBe(true)
      for (const feld of ['name', 'schnellwahl', 'karte', 'betrieb', 'tipp', 'tippErfolg'] as const) expect(g[feld], `${g.id}.${feld}`).not.toBe('')
    }
  })
})

const SECHSTES: Gewerk = vi.hoisted(() => ({
  id: 'dach',
  name: 'Dachdecker',
  kategorie: 'handwerk',
  abrechnung: 'stunde',
  min: 70,
  max: 110,
  anfahrt: 29.9,
  schnellwahl: 'Dach undicht',
  karte: 'Sturmschaden, Dach undicht',
  bild: 7,
  icon: 'gewerk-installateur',
  betrieb: 'Dachdecker',
  tipp: 'Tipp',
  tippErfolg: 'Tipp',
}))

vi.mock('../../src/content/gewerke', async (original) => {
  const echt = await original<typeof import('../../src/content/gewerke')>()
  return { ...echt, gewerke: [...echt.gewerke, SECHSTES] }
})

describe('ein sechstes Gewerk', () => {
  test('erscheint mit einem Eintrag überall auf der Startseite', async () => {
    const { App } = await import('../../src/App')
    const html = renderToString(<App pfad="/" />)
    // Schnellwahl-Kachel und Leistungskarte („… anfragen“)
    expect(html.match(/data-gewerk="dach"/g)?.length ?? 0).toBeGreaterThanOrEqual(2)
    expect(html).toContain('Dachdecker anfragen')
    expect(html).toContain('70–110 €')
    expect(html).toContain('für diese sechs Bereiche')
  })
})
