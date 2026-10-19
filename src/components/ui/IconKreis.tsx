import { Icon } from './Icon'

/**
 * Flaches Icon (design/icons) in einem Lagune-Kreis, wie die vier Vorteile unter dem Hero (styles/hero.css).
 * Dekorativ: die Bedeutung trägt der Text daneben. Größe des Kreises über `className`, die des Icons über `icon`.
 * `dunkel`: Nacht-Kreis mit hellem Icon, wie der Kreis im Anruf-Knopf des Hero (Luna, Erfolg).
 * `weiss`: weißer Kreis für Eis-Flächen (Hinweiskästen), auf denen Lagune zu schwach absetzt.
 */
export function IconKreis({
  name,
  className = '',
  icon = '',
  dunkel = false,
  weiss = false,
}: {
  name: string
  className?: string
  icon?: string
  dunkel?: boolean
  weiss?: boolean
}) {
  const flaeche = dunkel ? 'bg-nacht text-tuerkis-hell' : weiss ? 'bg-weiss text-tiefsee' : 'bg-lagune text-tiefsee'
  return (
    <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-pill ${flaeche} ${className}`}>
      <Icon name={name} className={icon} />
    </span>
  )
}
