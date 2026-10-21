// npm run shots → tests/screens-actual/<zustand>-<breite>.png (Vergleichstabelle in PLAN.md, Abschnitt 4).
// Breiten 390, 1024, 1440, 1920 und 2560 px; die Höhen sind übliche Bildschirmhöhen (1920 × 1080, 2560 × 1440).
import { test, type Page } from '../e2e/test'
import {
  anfrage,
  bewerbung,
  bewerbungErfolg,
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
  sendeBewerbungLeer,
  waehleGewerk,
  zeigeAnstupser,
} from '../e2e/hilfen'
import { expect } from '../e2e/test'

const HOEHE: Record<number, number> = { 390: 844, 1024: 768, 1440: 900, 1920: 1080, 2560: 1440 }
const ALLE = [390, 1024, 1440, 1920, 2560]

/** Die Zusagen-Karten blenden beim Hinscrollen ein: einmal hinscrollen, damit sie im Bild stehen. */
const zusagen = async (p: Page) => {
  await p.locator('#zusagen').scrollIntoViewIfNeeded()
}

/** Ganze Seite: Der Fuß-Globus lädt erst beim Hinscrollen; Ganzseiten-Shots scrollen nie. */
const ganzeSeite = async (p: Page) => {
  const globus = p.locator('footer canvas')
  if (await globus.isVisible()) {
    await globus.scrollIntoViewIfNeeded()
    await expect.poll(() => globus.evaluate((c: HTMLCanvasElement) => c.width)).not.toBe(300)
  }
  await p.evaluate(() => window.scrollTo(0, 0))
  // Das Scrollen weckt den Anstupser (ab 60 % Scrolltiefe); er gehört nicht zum Grundzustand der Seite.
  await p.addStyleTag({ content: '[data-anstupser] { display: none !important; }' })
}

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
    vorbereiten: async (p) => {
      await zusagen(p)
      await ganzeSeite(p)
    },
  },
  { name: 'zusagen', pfad: '/', element: (p) => p.locator('#zusagen'), vorbereiten: zusagen },
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
  { name: 'partner', pfad: '/partner-werden/', ganzeSeite: true, vorbereiten: ganzeSeite },
  // Fehler: das Formular; Erfolg: der Abschnitt mit Dank und Seitenkasten
  { name: 'partner-fehler', pfad: '/partner-werden/', breiten: [390, 1440], element: (p) => bewerbung(p).locator('form'), vorbereiten: sendeBewerbungLeer },
  { name: 'partner-erfolg', pfad: '/partner-werden/', breiten: [390, 1440], element: bewerbung, vorbereiten: bewerbungErfolg },
]

for (const z of ZUSTAENDE)
  for (const breite of z.breiten ?? ALLE)
    test(`${z.name}-${breite}`, async ({ page }) => {
      await page.setViewportSize({ width: breite, height: HOEHE[breite] })
      // Ganze Seite: Scroll-Animationen (Einblenden, Linien, Wortmarke) hängen an der Scroll-Position, die Aufnahme
      // scrollt nicht. Mit reduced motion zeigt sie die Endzustände, wie sie beim Lesen erscheinen.
      if (z.ganzeSeite) await page.emulateMedia({ reducedMotion: 'reduce' })
      if (z.uhr) await page.clock.install()
      await page.goto(z.pfad)
      await page.evaluate(() => document.fonts.ready)
      // Kartenbilder laden verzögert; ohne das zeigt der Vollseiten-Screenshot leeres Türkis.
      await page.evaluate(() => Promise.all([...document.images].map((img) => { img.loading = 'eager'; return img.decode().catch(() => {}) })))
      await z.vorbereiten?.(page)
      // Die Vorbereitung blendet Teile mit weiteren Bildern ein (z. B. das Info-Symbol im Rechner): auch diese dekodieren.
      await page.evaluate(() => Promise.all([...document.images].map((img) => { img.loading = 'eager'; return img.decode().catch(() => {}) })))
      // Grundzustand fotografieren: der Zeiger bleibt sonst nach dem letzten Klick auf einem Knopf (Hover-Farbe).
      await page.mouse.move(0, 0)
      // Steht der Fuß-Globus schon im Bild, lädt er gerade; auf ihn warten statt auf das Timing zu hoffen.
      const globus = page.locator('footer canvas')
      if (!z.element && !z.ganzeSeite && (await globus.isVisible()) && (await globus.evaluate((c) => c.getBoundingClientRect().top < innerHeight)))
        await expect.poll(() => globus.evaluate((c: HTMLCanvasElement) => c.width)).not.toBe(300)
      const pfad = `tests/screens-actual/${z.name}-${breite}.png`
      if (z.element) {
        // Der sticky Kopf, der schwebende Luna-Knopf und sein Anstupser würden Teile des Elements verdecken.
        await page.addStyleTag({ content: 'header { position: static !important; } #luna-knopf, [data-anstupser] { display: none !important; }' })
        await z.element(page).screenshot({ path: pfad, animations: 'disabled' })
      }
      else await page.screenshot({ path: pfad, fullPage: z.ganzeSeite, animations: 'disabled' })
    })
