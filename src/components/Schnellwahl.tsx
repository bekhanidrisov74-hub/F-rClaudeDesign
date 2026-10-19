import { copy } from '../content/copy'
import { gewerke } from '../content/gewerke'
import { IconKreis } from './ui/IconKreis'

const KACHEL =
  'flex min-h-[112px] flex-col justify-between gap-s3 rounded-tile p-s3 text-tiefsee no-underline transition-[border-color,box-shadow] nav:min-h-[154px] nav:gap-s4 nav:p-s4'
// Der Titel darf bis an den Kachelrand reichen (negativer Rand = Innenabstand), damit lange Wörter wie „Haushaltsgeräte“ nicht umbrechen.
const TITEL = 'font-display text-kachel font-bold -mr-s3 break-words hyphens-auto text-balance nav:-mr-s4 nav:text-h5'

/**
 * Schnellwahl „Was ist passiert?“ (Screen 01/02) im Stil des Hero: weiße Kacheln mit weichem Schatten, das Gewerk als
 * flaches Icon im Lagune-Kreis wie bei den Vorteilen; die Luna-Kachel als Hinweiskasten (Eis).
 * Handy ohne Unterzeilen (Entscheidung 5), Raster 2 Spalten, ab 640 px 3, ab 920 px
 * so viele Spalten wie mit mindestens 176 px passen (ein weiteres Gewerk reiht sich ein).
 */
export function Schnellwahl() {
  return (
    <section aria-labelledby="schnellwahl-titel" className="bg-kalk">
      <div className="wrapper py-s6 nav:pt-s4 nav:pb-s8">
        <h2 id="schnellwahl-titel" className="mb-s3 text-h4 nav:mb-s4">
          {copy.schnellwahl.titel}
        </h2>
        <div className="grid grid-cols-2 gap-s3 dialog:grid-cols-3 nav:grid-cols-[repeat(auto-fit,minmax(min(176px,100%),1fr))]">
          {gewerke.map((g) => (
            <a
              key={g.id}
              href="#anfrage"
              data-gewerk={g.id}
              className={`${KACHEL} border border-linie bg-weiss shadow-karte hover:border-lagune hover:shadow-karte-hover`}
            >
              <IconKreis name={g.icon} className="size-[56px] nav:size-[64px]" icon="size-[30px] nav:size-[34px]" />
              <span className="flex flex-col gap-s1">
                <span className={TITEL}>{g.name}</span>
                <span className="min-h-[2lh] text-small text-schiefer max-nav:hidden">{g.schnellwahl}</span>
              </span>
            </a>
          ))}

          <a href="#luna" className={`${KACHEL} border border-eis bg-eis hover:border-rand`}>
            <IconKreis name="luna-signet-glyph" dunkel className="size-[56px] nav:size-[64px]" icon="size-[30px] nav:size-[34px]" />
            <span className="flex flex-col gap-s1">
              <span className={`${TITEL} nav:hidden`}>{copy.schnellwahl.luna.handy}</span>
              <span className={`${TITEL} max-nav:hidden`}>{copy.schnellwahl.luna.titel}</span>
              <span className="min-h-[2lh] text-small text-schiefer max-nav:hidden">{copy.schnellwahl.luna.unterzeile}</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
