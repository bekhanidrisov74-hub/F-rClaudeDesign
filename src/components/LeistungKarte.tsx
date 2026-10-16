import { copy, fuelle } from '../content/copy'
import { anfahrtText, einheit, spanne, type Gewerk } from '../content/gewerke'
import { Bildflaeche } from './ui/Bildflaeche'
import { Button } from './ui/Button'

/** Leistungskarte eines Gewerks (Screen 01/02): Bildfläche, Text, Richtpreis, „… anfragen“. */
export function LeistungKarte({ gewerk: g }: { gewerk: Gewerk }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-card-lg border border-linie bg-weiss">
      <Bildflaeche bild={g.bild} className="aspect-[16/9] nav:aspect-[4/3]" />
      <div className="flex flex-1 flex-col gap-s3 p-s4 nav:p-s5">
        <h3 className="text-h3-karte">{g.name}</h3>
        <p className="text-text text-schiefer">{g.karte}</p>
        <div className="mt-auto flex flex-col items-start gap-px border-t border-linie pt-s3">
          <p className="flex items-baseline gap-s2">
            <span className="font-display text-h3-karte font-extrabold leading-[1.1]">{spanne(g)}</span>
            <span className="text-small text-schiefer">{einheit(g)}</span>
          </p>
          <p className="text-small text-schiefer">{`${copy.leistungen.anfahrt} ${anfahrtText(g)}`}</p>
        </div>
        <Button
          art="hell"
          href="#anfrage"
          data-gewerk={g.id}
          className="min-h-[50px] w-full px-s4 text-btn"
        >
          {fuelle(copy.leistungen.anfragen, { name: g.name })}
        </Button>
      </div>
    </article>
  )
}
