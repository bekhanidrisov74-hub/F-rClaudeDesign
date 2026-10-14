import { copy } from '../content/copy'
import { gewerke } from '../content/gewerke'
import { GewerkIcon } from './ui/GewerkIcon'
import { Icon } from './ui/Icon'

const KACHEL =
  'flex min-h-[112px] flex-col justify-between gap-s3 rounded-tile p-s3 text-tiefsee nav:min-h-[154px] nav:gap-s4 nav:p-s4'
// Der Titel darf bis an den Kachelrand reichen (negativer Rand = Innenabstand), damit lange Wörter wie „Haushaltsgeräte“ nicht umbrechen.
const TITEL = 'font-display text-h5 font-[750] -mr-s3 break-words hyphens-auto text-balance nav:-mr-s4'

/**
 * Schnellwahl „Was ist passiert?“ (Screen 01/02): Kacheln aus gewerke plus Luna-Kachel.
 * Handy ohne Unterzeilen (Entscheidung 5), Raster 2 Spalten, ab 640 px 3, ab 920 px
 * so viele Spalten wie mit mindestens 176 px passen (ein weiteres Gewerk reiht sich ein).
 */
export function Schnellwahl() {
  return (
    <section aria-labelledby="schnellwahl-titel">
      <div className="wrapper pt-s2 pb-s6 nav:pt-0 nav:pb-s8">
        <h2 id="schnellwahl-titel" className="mb-s3 text-h4 font-[750] [font-stretch:100%] nav:mb-s4">
          {copy.schnellwahl.titel}
        </h2>
        <div className="grid grid-cols-2 gap-s3 dialog:grid-cols-3 nav:grid-cols-[repeat(auto-fit,minmax(min(176px,100%),1fr))]">
          {gewerke.map((g) => (
            <a key={g.id} href="#anfrage" data-gewerk={g.id} className={`${KACHEL} border border-linie bg-weiss`}>
              <GewerkIcon gewerk={g} className="size-[41px] nav:size-[47px]" />
              <span className="flex flex-col gap-s1">
                <span className={TITEL}>{g.name}</span>
                <span className="min-h-[2lh] text-note text-schiefer max-nav:hidden">{g.schnellwahl}</span>
              </span>
            </a>
          ))}

          <a href="#luna" className={`${KACHEL} rahmen border-rand bg-kalk`}>
            <span className="flex size-[46px] items-center justify-center rounded-icon bg-tiefsee nav:size-[52px]">
              <Icon name="luna-signet-glyph" className="size-[28px] nav:size-[30px]" />
            </span>
            <span className="flex flex-col gap-s1">
              <span className={`${TITEL} nav:hidden`}>{copy.schnellwahl.luna.handy}</span>
              <span className={`${TITEL} max-nav:hidden`}>{copy.schnellwahl.luna.titel}</span>
              <span className="min-h-[2lh] text-note text-schiefer max-nav:hidden">{copy.schnellwahl.luna.unterzeile}</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
