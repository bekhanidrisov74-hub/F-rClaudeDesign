import { copy } from '../content/copy'
import { IconKreis } from './ui/IconKreis'

/** Spalten des Bento-Rasters ab 920 px: Handy untereinander. groß = breite Karte als Hinweiskasten (Eis), sonst weiß. */
const spalten: { karten: [number, boolean][] }[] = [
  { karten: [[0, true], [1, false]] },
  { karten: [[2, true], [3, false], [4, true]] },
  { karten: [[5, false], [6, true]] },
]

/**
 * Karte wie ein Vorteil unter dem Hero: Icon im Lagune-Kreis oben, Titel und Text unten, darunter der Zusatz.
 * Große Karten als Hinweiskasten (Eis) mit größerem Text, kleine weiß mit Rand und weichem Schatten.
 * Der Inhalt steht unten: Im Bento-Raster wachsen die Karten mit ihrer Spalte, der Platz bleibt unter dem Icon.
 */
function ZusageKarte({ index, gross }: { index: number; gross: boolean }) {
  const karte = copy.zusagen.karten[index]
  return (
    <li
      className={`einblenden flex flex-col justify-between gap-s5 rounded-card-lg p-s5 text-tiefsee ${
        gross ? 'bg-eis nav:grow-[7]' : 'border border-linie bg-weiss shadow-karte nav:grow-[3]'
      }`}
    >
      <IconKreis name={karte.icon} weiss={gross} className={gross ? 'size-[64px]' : 'size-[56px]'} icon={gross ? 'size-[32px]' : 'size-[28px]'} />
      <div className="flex flex-col gap-s3">
        <div className="flex flex-col gap-s2">
          <h3 className="font-display text-h4">{karte.titel}</h3>
          <p className={gross ? 'text-lead' : 'text-body text-schiefer'}>{karte.text}</p>
        </div>
        <p className="border-t border-tiefsee/10 pt-s3 text-small text-schiefer">{karte.zusatz}</p>
      </div>
    </li>
  )
}

/** Abschnitt „Zusagen“ (nicht im Design): Bento-Raster aus sieben Karten auf heller Fläche, im Stil des Hero. */
export function Zusagen() {
  return (
    <section id="zusagen" aria-labelledby="zusagen-titel" className="bg-kalk text-tiefsee">
      <div className="wrapper flex flex-col gap-s6 pt-section pb-section-end nav:gap-s7">
        {/* linksbündig wie der Hero und alle anderen Abschnittsköpfe */}
        <div className="flex max-w-[680px] flex-col gap-s4 nav:gap-s3">
          <h2 id="zusagen-titel" className="text-h2">
            {copy.zusagen.titel}
          </h2>
          <p className="text-lead text-schiefer">{copy.zusagen.lead}</p>
        </div>
        <div className="grid gap-s4 nav:grid-cols-3 nav:gap-s5">
          {spalten.map((spalte, i) => (
            <ul key={i} role="list" className="flex flex-col gap-s4 nav:gap-s5">
              {spalte.karten.map(([index, gross]) => (
                <ZusageKarte key={index} index={index} gross={gross} />
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}
