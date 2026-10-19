import { TELEFON, telHref } from '../../content/contact'
import { copy } from '../../content/copy'
import { Icon } from './Icon'

/**
 * Anruf-Knopf als Pille, das auffälligste Element (SPEC 3), überall wie „Jetzt anrufen“ im Hero
 * (Entwurf „Hero – Desktop 1586“): Türkis, Tiefsee-Schrift, Nacht-Kreis mit hellem Hörer.
 * - kopf:  Seitenkopf mit Nummer (unter 1280 px ohne), styles/hero.css
 * - hero:  groß mit Kreis und Nummer, styles/hero.css
 * - karte: Kreis, Label und Nummer in zwei Zeilen, 64/68 px (Menü, Seitenkasten)
 * - block: volle Breite, 56 px, Kreis und Label, Nummer optional in derselben Zeile (Karten, Dialog, Sheet, Luna)
 */
type Variante = 'kopf' | 'hero' | 'karte' | 'block'

interface Props {
  variante: Variante
  label?: string
  /** Nummer anzeigen (hero/karte: zweite Zeile, block: hinter dem Label) */
  nummer?: boolean
  className?: string
}

const BASIS =
  'flex items-center rounded-pill bg-tuerkis text-tiefsee no-underline font-display font-bold shadow-anruf transition-colors hover:bg-tuerkis-tief selection:bg-tiefsee selection:text-tuerkis'
const KREIS = 'flex shrink-0 items-center justify-center rounded-pill bg-nacht text-tuerkis-hell'

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
        <span className={`${KREIS} size-[48px] nav:size-[52px]`}>
          <Icon name="telefon" className="size-[22px] nav:size-[24px]" />
        </span>
        <span className="flex flex-col gap-px">
          <span className="text-h4 leading-[1.1]">{label ?? copy.anruf.jetzt}</span>
          {nummer && <span className="font-text text-small font-normal leading-[1.3] nav:text-text">{TELEFON}</span>}
        </span>
      </a>
    )

  return (
    <a href={telHref} className={`${BASIS} min-h-[56px] justify-center gap-s3 py-s2 pr-s5 pl-s2 text-btn-l ${className}`}>
      <span className={`${KREIS} size-[40px]`}>
        <Icon name="telefon" className="size-[18px]" />
      </span>
      <span>
        {label ?? copy.anruf.jetzt}
        {nummer && <span className="font-normal">{` ${TELEFON}`}</span>}
      </span>
    </a>
  )
}
