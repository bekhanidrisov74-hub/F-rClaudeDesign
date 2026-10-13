import { useEffect, useRef } from 'react'
import { whatsappHref } from '../content/contact'
import { copy } from '../content/copy'
import { useOverlays } from '../overlays'
import { Button } from './ui/Button'
import { CallButton } from './ui/CallButton'
import { Icon } from './ui/Icon'

// Wie --breakpoint-nav in app.css (920 px): ab hier gibt es keinen Menü-Knopf mehr.
const AB_NAV = '(min-width: 57.5rem)'

// Links und der Knopf „Preisübersicht“ sehen gleich aus (Screen 05).
const EINTRAG =
  'flex min-h-[64px] w-full cursor-pointer items-center justify-between text-left font-display text-h2-s font-bold [font-stretch:96%] text-tiefsee no-underline'

// Rechtslinks: sichtbar wie im Entwurf, die Trefferfläche ist mindestens 44 px groß.
const RECHTSLINK = 'flex min-h-[44px] min-w-[44px] items-center text-small text-schiefer underline underline-offset-4'

/**
 * Handy-Menü (Screen 05, SPEC 7). Ziel von aria-controls="menue" am Menü-Knopf im Kopf.
 * Offen: Vollfläche direkt unter dem Kopf. Der Seitenrahmen setzt die Seite dahinter `inert`,
 * das globale CSS sperrt ihr Scrollen. Tab bleibt deshalb in Kopf und Menü.
 */
export function MobileMenu({ aufStartseite = true }: { aufStartseite?: boolean }) {
  const { menueOffen } = useOverlays()
  return menueOffen ? <OffenesMenue aufStartseite={aufStartseite} /> : <div id="menue" hidden />
}

function OffenesMenue({ aufStartseite }: { aufStartseite: boolean }) {
  const { setMenueOffen, oeffnePreise } = useOverlays()
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Fokus auf den ersten Eintrag
    navRef.current?.querySelector<HTMLElement>('a, button')?.focus()

    // Esc schließt und gibt den Fokus an den Menü-Knopf zurück (er liegt im Kopf und ist nie inert).
    const beiTaste = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setMenueOffen(false)
      document.getElementById('menue-knopf')?.focus()
    }
    // Ab 920 px zeigt der Kopf die Navigation, das Menü schließt sich.
    const ab920 = window.matchMedia(AB_NAV)
    const beiBreite = (e: MediaQueryListEvent) => {
      if (e.matches) setMenueOffen(false)
    }
    document.addEventListener('keydown', beiTaste)
    ab920.addEventListener('change', beiBreite)
    return () => {
      document.removeEventListener('keydown', beiTaste)
      ab920.removeEventListener('change', beiBreite)
    }
  }, [setMenueOffen])

  const schliessen = () => setMenueOffen(false)
  const preiseOeffnen = () => {
    setMenueOffen(false)
    // Danach geht der Fokus zum Menü-Knopf zurück, nicht zum (dann entfernten) Eintrag.
    oeffnePreise(document.getElementById('menue-knopf'))
  }

  return (
    <section
      id="menue"
      data-offen
      aria-label={copy.menue.label}
      className="fixed inset-x-0 top-kopf bottom-0 z-9 overflow-y-auto overscroll-contain bg-kalk"
    >
      <div className="wrapper">
        <nav ref={navRef} aria-label={copy.kopf.navLabel} className="pt-s3">
          <ul className="m-0 list-none p-0">
            {copy.menue.links.map((link) => (
              <li key={link.text} className="border-b border-linie">
                {link.href ? (
                  <a href={aufStartseite ? link.href : `/${link.href}`} onClick={schliessen} className={EINTRAG}>
                    <span>{link.text}</span>
                    <Icon name="ui-weiter" className="size-[24px] text-rand" />
                  </a>
                ) : (
                  <button type="button" onClick={preiseOeffnen} className={EINTRAG}>
                    <span>{link.text}</span>
                    <Icon name="ui-weiter" className="size-[24px] text-rand" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-s5 flex flex-col gap-s3 rounded-card-lg bg-tiefsee px-s4 py-s5 text-kalk">
          <p className="m-0 font-display text-h5 font-[750] [font-stretch:100%]">{copy.menue.kontaktTitel}</p>
          <CallButton variante="karte" nummer className="w-full" />
          <Button art="dunkel" href={whatsappHref} className="min-h-[52px] w-full rounded-btn-lg text-btn">
            <Icon name="ui-chat" className="size-[20px]" />
            <span>{copy.menue.whatsapp}</span>
          </Button>
        </div>

        <ul className="m-0 flex list-none flex-wrap gap-x-s5 gap-y-s2 p-0 pt-s4 pb-s5">
          {copy.fuss.links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={RECHTSLINK}>
                {link.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
