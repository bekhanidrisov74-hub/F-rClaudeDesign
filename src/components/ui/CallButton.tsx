import { TELEFON, telHref } from '../../content/contact'
import { copy } from '../../content/copy'
import { Icon } from './Icon'
import { Symbol3D } from './Symbol3D'

/**
 * Anruf-Knopf als Pille, das auffälligste Element (SPEC 3).
 * - kopf:  Seitenkopf mit Nummer (unter 1280 px ohne), Entwurf „Hero – Desktop 1586“ (styles/hero.css)
 * - hero:  groß mit Kreis und Nummer, Entwurf „Hero – Desktop 1586“ (styles/hero.css)
 * - karte: Türkis mit Tiefsee-Schrift, Kreis und Nummer in dunklen Karten, 64/68 px (Menü 05, Seitenkasten 02)
 * - block: Türkis mit Tiefsee-Schrift, volle Breite, 56 px, Nummer optional in derselben Zeile (Karten, Dialog, Sheet, Luna)
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
      <a href={telHref} className={`hd-anrufen ${className}`}>
        <Icon name="telefon" className="hd-anrufen-icon" />
        <span className="hd-anrufen-text">
          <span className="hd-anrufen-label">{label ?? copy.kopf.anrufen}</span>
          <span className="hd-anrufen-nummer">{TELEFON}</span>
        </span>
      </a>
    )

  if (variante === 'hero')
    return (
      <a href={telHref} className={`hd-cta ${className}`}>
        <span className="hd-cta-kreis">
          <Icon name="telefon" className="hd-cta-icon" />
        </span>
        <span className="hd-cta-text">
          <span className="hd-cta-label">{label ?? copy.anruf.jetzt}</span>
          {nummer && <span className="hd-cta-nummer">{TELEFON}</span>}
        </span>
      </a>
    )

  if (variante === 'karte')
    return (
      <a href={telHref} className={`${BASIS} min-h-[64px] gap-s3 py-s2 pr-s5 pl-s2 nav:min-h-[68px] ${className}`}>
        <span className="flex size-[48px] shrink-0 items-center justify-center rounded-pill bg-tiefsee text-tuerkis nav:size-[50px]">
          <Symbol3D name="ui-anrufen" hell className="size-[22px] nav:size-[24px]" />
        </span>
        <span className="flex flex-col gap-px">
          <span className="text-h4 leading-[1.1]">{label ?? copy.anruf.jetzt}</span>
          {nummer && <span className="font-text text-small font-bold leading-[1.3] nav:text-text">{TELEFON}</span>}
        </span>
      </a>
    )

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
