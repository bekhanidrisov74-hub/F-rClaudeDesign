import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from './test'
import {
  bewerbungErfolg,
  bewerbungSendefehler,
  chat,
  formularErfolg,
  formularSendefehler,
  lunaAbsenden,
  lunaImGespraech,
  lunaBisZusammenfassung,
  oeffneMenue,
  sendeLeer,
  oeffnePreisuebersicht,
  schalteZuschlag,
  sendeBewerbungLeer,
  waehleGewerk,
  zeigeAnstupser,
} from './hilfen'

interface Zustand {
  name: string
  pfad: string
  vorbereiten?: (page: Page) => Promise<unknown>
  /** nur mit Menü-Knopf, also unter 1280 px */
  nurMitMenue?: boolean
  /** Playwright-Uhr installieren (Anstupser nach 8 s) */
  uhr?: boolean
}

/** Jede Phase ergänzt hier ihre Zustände (gleiche Liste wie die Screenshot-Matrix). */
const ZUSTAENDE: Zustand[] = [
  { name: 'startseite', pfad: '/' },
  { name: 'impressum', pfad: '/impressum/' },
  { name: 'preisuebersicht', pfad: '/', vorbereiten: oeffnePreisuebersicht },
  { name: 'rechner-schluesseldienst', pfad: '/', vorbereiten: (p) => waehleGewerk(p, 'Schlüsseldienst') },
  {
    name: 'rechner-zwei-zuschlaege',
    pfad: '/',
    vorbereiten: async (p) => {
      await schalteZuschlag(p, 'Sonntag')
      await schalteZuschlag(p, 'Nacht')
    },
  },
  { name: 'menue', pfad: '/', nurMitMenue: true, vorbereiten: oeffneMenue },
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
  { name: 'formular-fehler', pfad: '/#anfrage', vorbereiten: sendeLeer },
  { name: 'formular-erfolg', pfad: '/#anfrage', vorbereiten: formularErfolg },
  { name: 'formular-sendefehler', pfad: '/?fehler=1#anfrage', vorbereiten: formularSendefehler },
  { name: 'partner', pfad: '/partner-werden/' },
  { name: 'partner-fehler', pfad: '/partner-werden/', vorbereiten: sendeBewerbungLeer },
  { name: 'partner-erfolg', pfad: '/partner-werden/', vorbereiten: bewerbungErfolg },
  { name: 'partner-sendefehler', pfad: '/partner-werden/?fehler=1', vorbereiten: bewerbungSendefehler },
]

for (const z of ZUSTAENDE)
  test(`axe: ${z.name}`, async ({ page }) => {
    test.skip(!!z.nurMitMenue && page.viewportSize()!.width >= 1280, 'nur unter 1280 px')
    if (z.uhr) await page.clock.install()
    await page.goto(z.pfad)
    await z.vorbereiten?.(page)
    const ergebnis = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(
      ergebnis.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
    ).toEqual([])
  })
