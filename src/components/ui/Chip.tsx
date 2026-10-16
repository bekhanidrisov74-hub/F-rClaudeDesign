import type { AriaAttributes, MouseEventHandler, ReactNode } from 'react'
import { Icon } from './Icon'

/**
 * Chip (Screen 13): weiß mit Rand, ausgewählt Tiefsee mit Häkchen.
 * - pressed: gesetzt = Umschalter mit aria-pressed (Rechner, Luna-Auswahl); weggelassen = einfacher Knopf ohne aria-pressed
 * - zusatz:  kleiner Zusatztext hinter dem Namen, z. B. „+100 %“
 * Die Auswahl steuert allein aria-pressed, die Optik folgt dem Attribut.
 */
interface Props extends AriaAttributes {
  children: ReactNode
  pressed?: boolean
  zusatz?: string
  onClick?: MouseEventHandler<HTMLButtonElement>
  className?: string
}

export function Chip({ children, pressed, zusatz, onClick, className = '', ...rest }: Props) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`group rahmen inline-flex min-h-[48px] cursor-pointer items-center gap-s2 rounded-chip border-rand bg-weiss transition-[border-color] hover:border-tiefsee px-s4 font-display text-btn font-bold text-tiefsee aria-pressed:border-tiefsee aria-pressed:bg-tiefsee aria-pressed:pl-s3 aria-pressed:text-kalk ${className}`}
      {...rest}
    >
      {pressed && <Icon name="ui-haekchen" className="size-[20px]" />}
      <span>{children}</span>
      {zusatz && <span className="font-text text-note font-normal text-schiefer group-aria-pressed:text-nebel">{zusatz}</span>}
    </button>
  )
}
