import { copy } from '../content/copy'
import { Symbol3D } from './ui/Symbol3D'

/**
 * Vertrauensleiste (Entwurfsbild vom 18.10.2026): vier Punkte mit Symbol im Kreis, Handy untereinander, ab 640 px 2 × 2, ab 1140 px vier Spalten mit Trennlinien.
 * ponytail: Spaltenbreiten nach Textlänge, damit bei 1440 px jeder Titel eine Zeile und jede Beschreibung zwei Zeilen hat; bei anderem Text neu messen.
 */
export function Vertrauensleiste() {
  return (
    <section aria-label={copy.vertrauen.label} className="border-b border-linie bg-weiss">
      <ul className="wrapper grid gap-y-s4 py-s5 dialog:grid-cols-2 dialog:gap-x-s5 nav:py-s6 weit:grid-cols-[1.1fr_1fr_1.1fr_1.25fr] weit:gap-x-0 weit:divide-x weit:divide-linie">
        {copy.vertrauen.punkte.map((punkt) => (
          <li key={punkt.titel} className="flex items-start gap-s3 weit:px-s4 weit:first:pl-0 weit:last:pr-0">
            <span className="flex size-[56px] shrink-0 items-center justify-center rounded-pill bg-tuerkis/20 nav:size-[60px]">
              <Symbol3D name={punkt.icon} gross className="size-[30px] nav:size-[34px]" />
            </span>
            <span className="flex flex-col nav:gap-px">
              <span className="font-display text-h5 font-[750] nav:text-body nav:leading-[1.25]">{punkt.titel}</span>
              <span className="text-small text-schiefer">{punkt.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
