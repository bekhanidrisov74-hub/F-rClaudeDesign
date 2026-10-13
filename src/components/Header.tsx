import { copy } from '../content/copy'
import { useOverlays } from '../overlays'
import { CallButton } from './ui/CallButton'
import { Icon } from './ui/Icon'

/**
 * Sticky Seitenkopf (Screen 01/02): Wortmarke, Navigation ab 920 px, Anrufen, darunter der Menü-Knopf.
 * aufStartseite=false (Rechtsseiten): Anker zeigen auf „/#…“, das Logo auf „/“.
 * Der Menü-Knopf (nur unter 920 px) öffnet und schließt das Handy-Menü (MobileMenu, Screen 05).
 */
export function Header({ aufStartseite = true }: { aufStartseite?: boolean }) {
  const { menueOffen, setMenueOffen } = useOverlays()
  const anker = (href: string) => (aufStartseite ? href : `/${href}`)

  return (
    <header className="sticky top-0 z-10 border-b border-linie bg-kalk">
      <div className="wrapper flex h-kopf items-center gap-s2 nav:gap-s6">
        <a
          href={aufStartseite ? '#start' : '/'}
          onClick={() => setMenueOffen(false)}
          aria-label={copy.kopf.logoLabel}
          className="flex min-h-[44px] items-center font-display text-logo leading-none font-extrabold tracking-[-0.035em] text-tiefsee"
        >
          {copy.kopf.logo}
        </a>

        <nav aria-label={copy.kopf.navLabel} className="ml-auto flex gap-s5 max-nav:hidden">
          {copy.kopf.nav.map((link) => (
            <a
              key={link.href}
              href={anker(link.href)}
              className="flex min-h-[44px] items-center font-display text-btn font-semibold whitespace-nowrap text-schiefer hover:text-tiefsee"
            >
              {link.text}
            </a>
          ))}
        </nav>

        <CallButton variante="kopf" className="ml-auto nav:ml-0" />

        <button
          type="button"
          aria-label={menueOffen ? copy.kopf.menueSchliessen : copy.kopf.menueOeffnen}
          aria-expanded={menueOffen}
          aria-controls="menue"
          id="menue-knopf"
          onClick={() => setMenueOffen(!menueOffen)}
          className={`-mr-s2 flex size-[44px] shrink-0 cursor-pointer items-center justify-center rounded-chip text-tiefsee nav:hidden ${
            menueOffen ? 'rahmen border-rand bg-weiss' : ''
          }`}
        >
          <Icon name={menueOffen ? 'ui-schliessen' : 'ui-menue'} className={menueOffen ? 'size-[22px]' : 'size-[24px]'} />
        </button>
      </div>
    </header>
  )
}
