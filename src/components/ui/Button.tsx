import type { AriaAttributes, MouseEventHandler, ReactNode } from 'react'
import { Spinner } from './Spinner'

/**
 * Knöpfe außer Anrufen (der hat CallButton), im Stil des Hero („Hero – Desktop 1586“). Gesperrt wird mit
 * aria-disabled (Fokus bleibt), nie mit disabled.
 * - hell:     weiß mit Rand und weichem Schatten wie „Anfrage senden“ im Hero („… anfragen“, „Luna fragen“, WhatsApp)
 * - primaer:  Tiefsee-Fläche, weiße Schrift („Anfrage senden“ im Formular, „Auftrag aufgeben“)
 * - textlink: unterstrichen („Preisübersicht öffnen“, „Zum Preisrechner“)
 * `laedt` zeigt die Ladeanzeige vor dem Text (Text und Sperre setzt der Aufrufer).
 * Mit `href` ein Link, sonst ein <button type="button">. Größe und Breite über className,
 * ein eigenes rounded-* bzw. font-<gewicht> ersetzt Standardradius bzw. -gewicht. aria-* und data-* werden durchgereicht.
 */
type Art = 'hell' | 'primaer' | 'textlink'

interface Props extends AriaAttributes {
  art: Art
  children: ReactNode
  href?: string
  onClick?: MouseEventHandler<HTMLElement>
  className?: string
  type?: 'button' | 'submit'
  laedt?: boolean
  id?: string
  [data: `data-${string}`]: string | number | boolean | undefined
}

// Hover wie im Hero: Rand und Schatten bzw. Farbe (tokens.css: --fx-dur-fast); gesperrte Knöpfe reagieren nicht.
const ARTEN: Record<Art, string> = {
  hell: 'rahmen border-rand bg-weiss text-tiefsee shadow-knopf no-underline not-aria-disabled:hover:border-tiefsee not-aria-disabled:hover:shadow-knopf-hover',
  primaer: 'bg-tiefsee text-weiss no-underline not-aria-disabled:hover:bg-tiefsee-2',
  textlink: 'bg-transparent text-current underline underline-offset-4 hover:decoration-tuerkis',
}

export function Button({ art, children, href, onClick, className = '', type = 'button', laedt, ...rest }: Props) {
  const radius = art === 'textlink' || /\brounded-/.test(className) ? '' : 'rounded-btn'
  const gewicht = /\bfont-(?:bold|extrabold|semibold|\[\d+\])/.test(className) ? '' : 'font-[650]'
  const klassen = `inline-flex items-center justify-center gap-s2 font-display ${gewicht} leading-[1.1] transition-[color,background-color,border-color,box-shadow] cursor-pointer aria-disabled:cursor-default ${ARTEN[art]} ${radius} ${className}`
  if (href)
    return (
      <a href={href} onClick={onClick} className={klassen} {...rest}>
        {children}
      </a>
    )
  return (
    <button type={type} onClick={onClick} className={klassen} {...rest}>
      {laedt && <Spinner className="size-[20px]" />}
      {children}
    </button>
  )
}
