// npm run shots → tests/screens-actual/<zustand>-<breite>.png (Vergleichstabelle in PLAN.md, Abschnitt 4).
import { test, type Page } from '../e2e/test'
import {
  anfrage,
  chat,
  formularErfolg,
  formularSendefehler,
  lunaAbsenden,
  lunaImGespraech,
  lunaBisZusammenfassung,
  oeffneMenue,
  sendeLeer,
  oeffnePreisuebersicht,
  rechner,
  schalteZuschlag,
  waehleGewerk,
  zeigeAnstupser,
} from '../e2e/hilfen'
import { expect } from '../e2e/test'

const HOEHE: Record<number, number> = { 390: 844, 1024: 768, 1440: 900 }
const ALLE = [390, 1024, 1440]

interface Zustand {
  name: string
  pfad: string
  breiten?: number[]
  ganzeSeite?: boolean
  vorbereiten?: (page: Page) => Promise<unknown>
  /** Nur dieses Element fotografieren (z. B. den Rechner wie in Screen 13) */
  element?: (page: Page) => ReturnType<Page['locator']>
  /** Playwright-Uhr installieren (Anstupser nach 8 s) */
  uhr?: boolean
}

// Jede Phase ergänzt hier ihre Zustände.
const ZUSTAENDE: Zustand[] = [
  {
    name: 'startseite',
    pfad: '/',
    ganzeSeite: true,
    // Der Fuß-Globus lädt erst beim Hinscrollen; Ganzseiten-Shots scrollen nie.
    vorbereiten: async (p) => {
      const globus = p.locator('footer canvas')
      if (!(await globus.isVisible())) return
      await globus.scrollIntoViewIfNeeded()
      await expect.poll(() => globus.evaluate((c: HTMLCanvasElement) => c.width)).not.toBe(300)
      await p.evaluate(() => window.scrollTo(0, 0))
    },
  },
  { name: 'falz', pfad: '/', breiten: [390] },
  { name: 'impressum', pfad: '/impressum/', breiten: [390, 1440] },
  { name: 'preisuebersicht', pfad: '/', vorbereiten: oeffnePreisuebersicht },
  { name: 'menue', pfad: '/', breiten: [390], vorbereiten: oeffneMenue },
  { name: 'rechner-schluesseldienst', pfad: '/', element: rechner, vorbereiten: (p) => waehleGewerk(p, 'Schlüsseldienst') },
  {
    name: 'rechner-zwei-zuschlaege',
    pfad: '/',
    element: rechner,
    vorbereiten: async (p) => {
      await schalteZuschlag(p, 'Sonntag')
      await schalteZuschlag(p, 'Nacht')
    },
  },
  { name: 'luna-anstupser', pfad: '/', uhr: true, vorbereiten: zeigeAnstupser },
  { name: 'luna-gespraech', pfad: '/', vorbereiten: lunaImGespraech },
  { name: 'luna-zusammenfassung', pfad: '/', vorbereiten: lunaBisZusammenfassung },
  {
    name: 'luna-erfolg',
    pfad: '/',
    vorbereiten: async (p) => {
      await lunaAbsenden(p)
      await expect(chat(p).getByText(/Anfragenummer/)).toBeVisible()
    },
  },
  {
    name: 'luna-sendefehler',
    pfad: '/?fehler=1',
    vorbereiten: async (p) => {
      await lunaAbsenden(p)
      await expect(chat(p).getByRole('alert')).toBeVisible()
    },
  },
  { name: 'formular-fehler', pfad: '/#anfrage', element: anfrage, vorbereiten: sendeLeer },
  { name: 'formular-erfolg', pfad: '/#anfrage', element: anfrage, vorbereiten: formularErfolg },
  { name: 'formular-sendefehler', pfad: '/?fehler=1#anfrage', element: anfrage, vorbereiten: formularSendefehler },
]

for (const z of ZUSTAENDE)
  for (const breite of z.breiten ?? ALLE)
    test(`${z.name}-${breite}`, async ({ page }) => {
      await page.setViewportSize({ width: breite, height: HOEHE[breite] })
      if (z.uhr) await page.clock.install()
      await page.goto(z.pfad)
      await page.evaluate(() => document.fonts.ready)
      // Kartenbilder laden verzögert; ohne das zeigt der Vollseiten-Screenshot leeres Türkis.
      await page.evaluate(() => Promise.all([...document.images].map((img) => { img.loading = 'eager'; return img.decode().catch(() => {}) })))
      await z.vorbereiten?.(page)
      // Grundzustand fotografieren: der Zeiger bleibt sonst nach dem letzten Klick auf einem Knopf (Hover-Farbe).
      await page.mouse.move(0, 0)
      // Steht der Fuß-Globus schon im Bild, lädt er gerade; auf ihn warten statt auf das Timing zu hoffen.
      const globus = page.locator('footer canvas')
      if (!z.element && !z.ganzeSeite && (await globus.isVisible()) && (await globus.evaluate((c) => c.getBoundingClientRect().top < innerHeight)))
        await expect.poll(() => globus.evaluate((c: HTMLCanvasElement) => c.width)).not.toBe(300)
      const pfad = `tests/screens-actual/${z.name}-${breite}.png`
      if (z.element) {
        // Der sticky Kopf und der schwebende Luna-Knopf würden Teile des Elements verdecken.
        await page.addStyleTag({ content: 'header { position: static !important; } #luna-knopf { display: none !important; }' })
        await z.element(page).screenshot({ path: pfad, animations: 'disabled' })
      }
      else await page.screenshot({ path: pfad, fullPage: z.ganzeSeite, animations: 'disabled' })
    })
