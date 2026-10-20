import { copy, fuelle } from '../content/copy'
import { anfahrtText, einheit, spanne, type Gewerk } from '../content/gewerke'
import { Bildflaeche } from './ui/Bildflaeche'
import { Button } from './ui/Button'
import { Icon } from './ui/Icon'

/** Leistungskarte eines Gewerks (Screen 01/02) im Stil des Hero: Bild, Text, Richtpreis, „… anfragen“ wie „Anfrage senden“. */
export function LeistungKarte({ gewerk: g }: { gewerk: Gewerk }) {
  return (
    <article className="flex flex-col overflow-clip rounded-card-lg border border-linie bg-weiss shadow-karte">
      <Bildflaeche bild={g.bild} fokus={g.bildFokus} className="glanz aspect-[16/9] border-b border-linie nav:aspect-[4/3]" />
      <div className="flex flex-1 flex-col gap-s3 p-s4 nav:p-s5">
        <h3 className="text-h3-karte">{g.name}</h3>
        <p className="text-text text-schiefer">{g.karte}</p>
        <div className="mt-auto flex flex-col items-start gap-px border-t border-linie pt-s3">
          <p className="flex items-baseline gap-s2">
            <span className="betrag text-h3-karte font-extrabold leading-[1.1]">{spanne(g)}</span>
            <span className="text-small text-schiefer">{einheit(g)}</span>
          </p>
          <p className="text-small text-schiefer">{`${copy.leistungen.anfahrt} ${anfahrtText(g)}`}</p>
        </div>
        <Button
          art="hell"
          href="#anfrage"
          data-gewerk={g.id}
          className="min-h-[54px] w-full gap-s2 rounded-btn-lg px-s2 text-btn dialog:gap-s3 dialog:px-s4"
        >
          <Icon name="anfrage" className="size-[20px]" />
          <span>{fuelle(copy.leistungen.anfragen, { name: g.name })}</span>
        </Button>
      </div>
    </article>
  )
}
