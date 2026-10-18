import { copy } from '../content/copy'
import { Symbol3D } from './ui/Symbol3D'
import { Wirbelflaeche } from './ui/Wirbelflaeche'

/** Spalten des Bento-Rasters ab 920 px: Handy untereinander. dunkel = Tiefsee-Fläche; groß = mit Wirbel. */
const spalten: { karten: [number, boolean, boolean][] }[] = [
  { karten: [[0, true, true], [1, false, false]] },
  { karten: [[2, false, true], [3, false, false], [4, false, true]] },
  { karten: [[5, false, false], [6, true, true]] },
]

function ZusageKarte({ index, gross, dunkel }: { index: number; gross: boolean; dunkel: boolean }) {
  const karte = copy.zusagen.karten[index]
  return (
    <li
      className={`einblenden relative flex flex-col justify-end gap-s5 overflow-hidden rounded-card-lg p-s5 ${
        gross ? 'nav:grow-[7]' : 'nav:grow-[3]'
      } ${dunkel ? 'kante bg-tiefsee-2 text-kalk' : 'bg-weiss text-tiefsee'}`}
    >
      {gross && <Wirbelflaeche drehung={index === 0 ? 0 : 135} />}
      <p className={`relative ${gross ? 'text-lead' : 'text-body'}`}>{karte.text}</p>
      <div className="relative flex items-end justify-between gap-s4">
        <div className="flex flex-col gap-px">
          <h3 className="font-display text-h5 font-[750] [font-stretch:100%]">{karte.titel}</h3>
          <p className={`text-small ${dunkel ? 'text-nebel' : 'text-schiefer'}`}>{karte.zusatz}</p>
        </div>
        <Symbol3D name={karte.icon} hell={dunkel} trage gross className="size-s8" />
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
                <ZusageKarte key={index} index={index} gross={gross} dunkel={dunkel} />
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}
