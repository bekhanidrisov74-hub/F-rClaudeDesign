import { copy } from '../content/copy'
import { Symbol3D } from './ui/Symbol3D'

/** Vertrauensleiste (Screen 01/02): vier Punkte, Handy untereinander, ab 920 px vier Spalten. */
export function Vertrauensleiste() {
  return (
    <section aria-label={copy.vertrauen.label} className="border-b border-linie bg-weiss nav:border-t">
      <ul className="wrapper grid gap-y-s4 py-s5 dialog:grid-cols-2 nav:grid-cols-4 nav:gap-x-s5 nav:py-s6">
        {copy.vertrauen.punkte.map((punkt) => (
          <li key={punkt.titel} className="flex items-start gap-s3">
            <Symbol3D name={punkt.icon} className="mt-px size-[26px] nav:size-[28px]" />
            <span className="flex flex-col nav:gap-px">
              <span className="font-display text-h5 font-[750]">{punkt.titel}</span>
              <span className="text-small text-schiefer">{punkt.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
