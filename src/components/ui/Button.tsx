import type { ReactNode, MouseEventHandler } from 'react'

/**
 * Knöpfe außer Anrufen (der hat CallButton).
 * - hell:     weiß mit Rand (WhatsApp/Anfrage im Hero, „… anfragen“, „Alle Richtpreise im Überblick“)
 * - dunkel:   auf Tiefsee, Rand, Kalk-Schrift („Luna fragen“, „Per WhatsApp schreiben“)
 * - primaer:  Tiefsee-Fläche, weiße Schrift („Anfrage senden“, „Auftrag aufgeben“)
 * - textlink: unterstrichen („Preisübersicht öffnen“, „Zum Preisrechner“)
 * Mit `href` ein Link, sonst ein <button type="button">. Größe und Breite über className.
 */
type Art = 'hell' | 'dunkel' | 'primaer' | 'textlink'

interface Props {
  art: Art
  children: ReactNode
  href?: string
  onClick?: MouseEventHandler<HTMLElement>
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}

const ARTEN: Record<Art, string> = {
  hell: 'rahmen border-rand bg-weiss text-tiefsee rounded-btn justify-center',
  dunkel: 'rahmen border-rand bg-transparent text-kalk rounded-btn justify-center',
  primaer: 'bg-tiefsee text-weiss rounded-btn justify-center',
  textlink: 'bg-transparent text-current underline underline-offset-4 justify-center',
}

export function Button({ art, children, href, onClick, className = '', type = 'button', disabled }: Props) {
  const klassen = `inline-flex items-center gap-s2 font-display font-bold no-underline leading-[1.1] cursor-pointer disabled:cursor-default ${ARTEN[art]} ${className}`
  if (href)
    return (
      <a href={href} onClick={onClick} className={klassen}>
        {children}
      </a>
    )
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={klassen}>
      {children}
    </button>
  )
}
