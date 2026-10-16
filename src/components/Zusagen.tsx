import { copy } from '../content/copy'
import { Icon } from './ui/Icon'

type Karte = (typeof copy.zusagen.karten)[number]

/** Spalten des Bento-Rasters ab 920 px: Handy untereinander. dunkel = Tiefsee-Fläche mit Raster. */
const spalten: { karten: [number, boolean, boolean][] }[] = [
  { karten: [[0, true, true], [1, false, false]] },
  { karten: [[2, false, true], [3, false, false], [4, false, true]] },
  { karten: [[5, false, false], [6, true, true]] },
]

function ZusageKarte({ karte, gross, dunkel }: { karte: Karte; gross: boolean; dunkel: boolean }) {
  return (
    <li
      className={`einblenden relative flex flex-col justify-end gap-s5 overflow-hidden rounded-card-lg p-s5 ${
        gross ? 'nav:grow-[7]' : 'nav:grow-[3]'
      } ${dunkel ? 'kante bg-tiefsee-2 text-kalk' : 'bg-weiss text-tiefsee'}`}
    >
      {gross && <div aria-hidden="true" className="raster-karte absolute inset-0 opacity-25" />}
      <p className={`relative ${gross ? 'text-lead' : 'text-body'}`}>{karte.text}</p>
      <div className="relative flex items-end justify-between gap-s4">
        <div className="flex flex-col gap-px">
          <h3 className="font-display text-h5 font-[750] [font-stretch:100%]">{karte.titel}</h3>
          <p className={`text-small ${dunkel ? 'text-nebel' : 'text-schiefer'}`}>{karte.zusatz}</p>
        </div>
        <span
          className={`flex size-s8 shrink-0 items-center justify-center rounded-icon ${
            dunkel ? 'bg-tiefsee text-tuerkis' : 'bg-kalk text-icon-technik'
          }`}
        >
          <Icon name={karte.icon} className="size-s6" />
        </span>
      </div>
    </li>
  )
}

/** Abschnitt „Zusagen“ (nicht im Design): Bento-Raster aus sieben Karten auf Tiefsee. */
export function Zusagen() {
  return (
    <section id="zusagen" aria-labelledby="zusagen-titel" className="bg-tiefsee text-kalk">
      <div className="wrapper flex flex-col gap-s6 pt-section pb-section-end nav:gap-s7">
        <div className="mx-auto flex max-w-[680px] flex-col gap-s3 text-center">
          <h2 id="zusagen-titel" className="text-h2">
            {copy.zusagen.titel}
          </h2>
          <p className="text-lead text-nebel">{copy.zusagen.lead}</p>
        </div>
        <div className="grid gap-s3 nav:grid-cols-3">
          {spalten.map((spalte, i) => (
            <ul key={i} role="list" className="flex flex-col gap-s3">
              {spalte.karten.map(([index, gross, dunkel]) => (
                <ZusageKarte key={index} karte={copy.zusagen.karten[index]} gross={gross} dunkel={dunkel} />
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}
