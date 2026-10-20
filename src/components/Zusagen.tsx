import { copy } from '../content/copy'
import { IconKreis } from './ui/IconKreis'

/** Breite Karten ab 920 px: die erste und die letzte. Reihen: [0 breit][1] / [2][3][4] / [5][6 breit]. */
const BREIT = [0, copy.zusagen.karten.length - 1]

/**
 * Ab 920 px eine weiße Karte mit Haarlinie und weichem Schatten, darunter ein Eintrag der gruppierten Liste (Zusagen).
 * Icon im Lagune-Kreis wie bei den Vorteilen unter dem Hero.
 * Alle Teile sind direkte Kinder eines Grids, damit eine Markierung drei Anordnungen trägt:
 * - unter 920 px: Icon links neben dem Titel, darunter Text und Zusatz über die volle Breite, ohne eigene Trennlinie;
 * - ab 920 px normal: eine Spalte, Icon oben; die Textzeile wächst (1fr), der Zusatz sitzt unten und steht in einer Reihe bündig
 *   (zwischen 920 und 1119 px bricht er schmal um: zwei Zeilen Mindesthöhe, damit die Trennlinien einer Reihe auf einer Höhe bleiben);
 * - ab 920 px breit: Icon links (64 px) über alle drei Zeilen, rechts Titel, Text als Lead und Zusatz. Die Reihenhöhe bestimmt die
 *   Nachbarkarte (Icon oben); den Überschuss verteilt content-center oben und unten, statt ihn zwischen Text und Zusatz zu lassen.
 */
function ZusageKarte({ karte, breit }: { karte: (typeof copy.zusagen.karten)[number]; breit: boolean }) {
  return (
    <li
      className={`einblenden grid grid-cols-[auto_1fr] items-center gap-x-s4 gap-y-s2 px-s5 py-s4 text-tiefsee nav:items-start nav:gap-y-0 nav:rounded-card-lg nav:border nav:border-linie nav:bg-weiss nav:p-s5 nav:shadow-karte ${
        breit
          ? 'nav:col-span-2 nav:grid-rows-[auto_auto_auto] nav:content-center nav:gap-x-s5'
          : 'nav:grid-cols-1 nav:grid-rows-[auto_auto_1fr_auto]'
      }`}
    >
      <IconKreis
        name={karte.icon}
        className={
          breit
            ? 'size-[48px] nav:row-span-3 nav:size-[64px]'
            : 'size-[48px] nav:mb-s4 nav:size-[56px]'
        }
        icon={breit ? 'size-[24px] nav:size-[32px]' : 'size-[24px] nav:size-[28px]'}
      />
      <h3 className={`font-display text-h4 ${breit ? 'nav:col-start-2' : ''}`}>{karte.titel}</h3>
      <p
        className={`col-span-2 nav:col-span-1 nav:mt-s2 ${
          breit ? 'text-lead text-schiefer nav:col-start-2' : 'text-body text-schiefer'
        }`}
      >
        {karte.text}
      </p>
      <p
        className={`col-span-2 box-content text-small text-schiefer nav:col-span-1 nav:mt-s3 nav:min-h-[2lh] nav:border-t nav:border-linie nav:pt-s3 spalten:min-h-0 ${
          breit ? 'nav:col-start-2' : ''
        }`}
      >
        {karte.zusatz}
      </p>
    </li>
  )
}

/** Abschnitt „Zusagen“ (nicht im Design): ab 920 px sieben weiße Karten auf dem Eis-Band, in einem Raster mit zwei breiten Karten.
 *  Darunter eine gruppierte Liste: eine weiße Fläche, die Einträge durch Haarlinien getrennt, statt sieben gleicher Karten. */
export function Zusagen() {
  return (
    <section id="zusagen" aria-labelledby="zusagen-titel" className="bg-eis text-tiefsee">
      <div className="wrapper pt-section pb-section-end">
        {/* linksbündig wie der Hero und alle anderen Abschnittsköpfe */}
        <div className="mb-s5 flex max-w-[680px] flex-col gap-s4 nav:mb-s7 nav:gap-s3">
          <h2 id="zusagen-titel" className="text-h2">
            {copy.zusagen.titel}
          </h2>
          <p className="text-lead text-schiefer">{copy.zusagen.lead}</p>
        </div>
        <ul
          role="list"
          className="grid divide-y divide-linie rounded-card-lg border border-linie bg-weiss shadow-karte nav:grid-cols-3 nav:gap-s5 nav:divide-y-0 nav:rounded-none nav:border-0 nav:bg-transparent nav:shadow-none"
        >
          {copy.zusagen.karten.map((karte, index) => (
            <ZusageKarte key={karte.titel} karte={karte} breit={BREIT.includes(index)} />
          ))}
        </ul>
      </div>
    </section>
  )
}
