import type { Gewerk } from '../../content/gewerke'
import { Icon } from './Icon'

/** Gewerke-Icon direkt eingefärbt, ohne Fläche: Technik Petrol, Handwerk Orange (SPEC 3). */
export function GewerkIcon({ gewerk, className = '' }: { gewerk: Gewerk; className?: string }) {
  const farbe = gewerk.kategorie === 'technik' ? 'text-icon-technik' : 'text-icon-handwerk'
  return <Icon name={gewerk.icon} className={`${farbe} ${className}`} />
}
