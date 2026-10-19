import { copy } from '../content/copy'
import { gewerke } from '../content/gewerke'
import { IconKreis } from './ui/IconKreis'

// Alle Kacheln tragen denselben 1-px-Rand (Haarlinie wie die übrigen Karten der Seite): So haben Gewerke-Kacheln und Umriss-Kachel
// dieselbe Innenbox, und die Titel einer Reihe stehen auf einer Linie. Unter 920 px beginnt der Titel direkt unter dem Icon (justify-start),
// damit auch der zweizeilige Luna-Titel („Nicht sicher? Luna fragen“) in der Reihe oben auf gleicher Höhe anfängt.
const KACHEL =
  'flex min-h-[112px] flex-col justify-start gap-s3 border rounded-tile p-s3 text-tiefsee no-underline transition-[background-color,border-color,box-shadow] nav:min-h-[154px] nav:justify-between nav:gap-s4 nav:p-s4'
// Der Titel darf bis an den Kachelrand reichen (negativer Rand = Innenabstand), damit lange Wörter wie „Haushaltsgeräte“ nicht umbrechen.
const TITEL = 'font-display text-kachel font-bold -mr-s3 break-words hyphens-auto text-balance nav:-mr-s4 nav:text-h5'

/**
 * Schnellwahl „Was ist passiert?“ (Screen 01/02) als Eis-Band im Raster der Seite: weiße Kacheln mit Haarlinie und
 * weichem Schatten, das Gewerk als flaches Icon im Lagune-Kreis wie bei den Vorteilen. Die Luna-Kachel ist auf Eis
 * eine Umriss-Kachel (transparent, Rand), damit sie sich als Hinweis von den Gewerken abhebt.
 * Handy ohne Unterzeilen (Entscheidung 5). Spalten: 2 unter 640 px, 3 bis 1279 px, ab 1280 px alle in einer Reihe
 * (ab 1280 px ist eine Kachel gut 175 px breit, „Haushaltsgeräte“ braucht in Inter 750 bei 19 px 152 px).
 */
export function Schnellwahl() {
  return (
    <section aria-labelledby="schnellwahl-titel" className="bg-eis">
      <div className="wrapper pt-section pb-section-end">
        <h2 id="schnellwahl-titel" className="mb-s5 text-h2 nav:mb-s7">
          {copy.schnellwahl.titel}
        </h2>
        <div className="grid grid-cols-2 gap-s3 dialog:grid-cols-3 hd:grid-cols-6">
          {gewerke.map((g) => (
            <a
              key={g.id}
              href="#anfrage"
              data-gewerk={g.id}
              className={`${KACHEL} border-linie bg-weiss shadow-karte hover:border-lagune hover:shadow-karte-hover`}
            >
              <IconKreis name={g.icon} className="size-[56px] nav:size-[64px]" icon="size-[30px] nav:size-[34px]" />
              <span className="flex flex-col gap-s1">
                <span className={TITEL}>{g.name}</span>
                <span className="text-small text-schiefer text-balance max-nav:hidden hd:min-h-[2lh]">{g.schnellwahl}</span>
              </span>
            </a>
          ))}

          <a href="#luna" className={`${KACHEL} border-rand bg-transparent hover:bg-weiss`}>
            <IconKreis name="luna-signet-glyph" dunkel className="size-[56px] nav:size-[64px]" icon="size-[30px] nav:size-[34px]" />
            <span className="flex flex-col gap-s1">
              <span className={`${TITEL} nav:hidden`}>{copy.schnellwahl.luna.handy}</span>
              <span className={`${TITEL} max-nav:hidden`}>{copy.schnellwahl.luna.titel}</span>
              <span className="text-small text-schiefer text-balance max-nav:hidden hd:min-h-[2lh]">{copy.schnellwahl.luna.unterzeile}</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
