import { TELEFON, telHref } from '../../content/contact'
import { copy } from '../../content/copy'
import { Symbol3D } from './Symbol3D'

/**
 * Anruf-Knopf: überall Türkis mit Tiefsee-Schrift, als Pille, das auffälligste Element (SPEC 3).
 * - kopf:  Seitenkopf, 44/48 px, Nummer 560–919 px und ab 1140 px (dazwischen braucht das Logo neben der Navigation den Platz)
 * - hero:  groß mit Kreis und Nummer, 70/76 px (Screen 01/02)
 * - karte: mit Kreis und Nummer in dunklen Karten, 64/68 px (Menü 05, Seitenkasten 02)
 * - block: volle Breite, 56 px, Nummer optional in derselben Zeile (Karten, Dialog, Sheet, Luna)
 */
type Variante = 'kopf' | 'hero' | 'karte' | 'block'

interface Props {
  variante: Variante
  label?: string
  /** Nummer anzeigen (hero/karte: zweite Zeile, block: hinter dem Label) */
  nummer?: boolean
  className?: string
}

const BASIS = 'flex items-center rounded-pill bg-tuerkis text-tiefsee no-underline font-display font-extrabold transition-colors hover:bg-tuerkis-tief selection:bg-tiefsee selection:text-tuerkis'

export function CallButton({ variante, label, nummer = false, className = '' }: Props) {
  if (variante === 'kopf')
    return (
      <a
        href={telHref}
        className={`${BASIS} h-[44px] shrink-0 gap-s2 pr-s4 pl-s3 text-body leading-none whitespace-nowrap nav:h-[48px] nav:pr-s5 nav:pl-s4 ${className}`}
      >
        <Symbol3D name="ui-anrufen" className="size-[18px] nav:size-[20px]" />
        <span>{label ?? copy.kopf.anrufen}</span>
        <span className="text-small font-semibold max-kopf:hidden nav:max-[71.25rem]:hidden">{TELEFON}</span>
      </a>
    )

  if (variante === 'hero' || variante === 'karte') {
    const hero = variante === 'hero'
    return (
      <a
        href={telHref}
        className={`${BASIS} ${
          hero
            ? 'min-h-[70px] gap-s3 py-s2 pr-s5 pl-s2 nav:min-h-[76px] nav:gap-s4 nav:pr-s6'
            : 'min-h-[64px] gap-s3 py-s2 pr-s5 pl-s2 nav:min-h-[68px]'
        } ${className}`}
      >
        <span
          className={`flex shrink-0 items-center justify-center rounded-pill bg-tiefsee text-tuerkis ${
            hero ? 'size-[50px] nav:size-[54px]' : 'size-[48px] nav:size-[50px]'
          }`}
        >
          <Symbol3D name="ui-anrufen" hell className={hero ? 'size-[24px] nav:size-[26px]' : 'size-[22px] nav:size-[24px]'} />
        </span>
        <span className="flex flex-col gap-px">
          <span className={hero ? 'text-hero-call' : 'text-h4 leading-[1.1]'}>{label ?? copy.anruf.jetzt}</span>
          {nummer && <span className="font-text text-small font-bold leading-[1.3] nav:text-text">{TELEFON}</span>}
        </span>
      </a>
    )
  }

  return (
    <a href={telHref} className={`${BASIS} min-h-[56px] justify-center gap-s3 px-s4 text-btn-l ${className}`}>
      <Symbol3D name="ui-anrufen" className="size-[20px]" />
      <span>
        {label ?? copy.anruf.jetzt}
        {nummer && ` ${TELEFON}`}
      </span>
    </a>
  )
}
