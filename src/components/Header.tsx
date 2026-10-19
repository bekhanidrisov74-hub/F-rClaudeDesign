import { copy } from '../content/copy'
import { useOverlays } from '../overlays'
import { CallButton } from './ui/CallButton'
import { Icon } from './ui/Icon'

/**
 * Sticky Seitenkopf nach dem Entwurf „Hero – Desktop 1586“ (styles/hero.css): Logo, Navigation ab 1280 px, Anrufen.
 * Logo: das bisherige (design/icons/logo.svg). Darunter statt der Navigation der Menü-Knopf (nicht im Entwurf);
 * er öffnet und schließt das Handy-Menü (MobileMenu, Screen 05).
 * aufStartseite=false (Rechtsseiten): Anker zeigen auf „/#…“, das Logo auf „/“.
 */
export function Header({ aufStartseite = true }: { aufStartseite?: boolean }) {
  const { menueOffen, setMenueOffen } = useOverlays()
  const anker = (href: string) => (aufStartseite ? href : `/${href}`)

  return (
    <header className="hd-kopf">
      <a
        href={aufStartseite ? '#start' : '/'}
        onClick={() => setMenueOffen(false)}
        aria-label={copy.kopf.logoLabel}
        className="hd-logo"
      >
        <Icon name="logo" className="hd-logo-bild" />
      </a>

      <nav aria-label={copy.kopf.navLabel} className="hd-nav">
        {copy.kopf.nav.map((link) => (
          <a key={link.href} href={anker(link.href)}>
            {link.text}
          </a>
        ))}
      </nav>

      <CallButton variante="kopf" />

      <button
        type="button"
        aria-label={menueOffen ? copy.kopf.menueSchliessen : copy.kopf.menueOeffnen}
        aria-expanded={menueOffen}
        aria-controls="menue"
        id="menue-knopf"
        onClick={() => setMenueOffen(!menueOffen)}
        className={`-mr-s2 flex size-[44px] shrink-0 cursor-pointer items-center justify-center rounded-chip text-tiefsee hd:hidden ${
          menueOffen ? 'rahmen border-rand bg-weiss' : ''
        }`}
      >
        <Icon name={menueOffen ? 'ui-schliessen' : 'ui-menue'} className={menueOffen ? 'size-[22px]' : 'size-[24px]'} />
      </button>
    </header>
  )
}
