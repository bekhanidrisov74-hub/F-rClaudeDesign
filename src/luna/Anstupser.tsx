import { useEffect, useState } from 'react'
import { Icon } from '../components/ui/Icon'
import { copy } from '../content/copy'
import { PARTNER_PFAD } from '../content/partner'
import { useOverlays } from '../overlays'

const t = copy.luna.anstupser

/** Erscheint einmal pro Besuch nach 25 s oder ab 60 % Scrolltiefe, was zuerst eintritt (Aufgabe, Abschnitt 7). */
const SCHLUESSEL = 'fixit-nudge'
const VERZOEGERUNG = 25_000
const SCROLLTIEFE = 0.6

type Bereich = 'formular' | 'rechner' | 'partner'

/**
 * Was beim Einblenden zu sehen ist (Ausbau 24.10.2026, wie im Impeccable-Chat): die Seite „Partner werden“, das Formular
 * (#anfrage, components/Anfrage) oder der Preisrechner (#preisrechner, components/Preisrechner). Ein Abschnitt zählt, wenn er
 * über die Mitte des Fensters reicht (40 bis 60 % der Höhe). Sonst null: der Text aus dem Design.
 */
function bereich(): Bereich | null {
  if (location.pathname === PARTNER_PFAD) return 'partner'
  const mitte = (id: string) => {
    const r = document.getElementById(id)?.getBoundingClientRect()
    return !!r && r.top < innerHeight * 0.6 && r.bottom > innerHeight * 0.4
  }
  if (mitte('anfrage')) return 'formular'
  if (mitte('preisrechner')) return 'rechner'
  return null
}

// sessionStorage kann im privaten Modus oder bei gesperrten Cookies werfen. Dann bleibt der Hinweis weg.
function gesehen(): boolean {
  try {
    return sessionStorage.getItem(SCHLUESSEL) !== null
  } catch {
    return true
  }
}

function merke() {
  try {
    sessionStorage.setItem(SCHLUESSEL, '1')
  } catch {
    // Nicht speichern zu können ist unkritisch: gesehen() meldet dann ohnehin „gesehen“.
  }
}

/**
 * Sprechblase über dem Knopf (Screen 02, 06). Der Container ist von Anfang an da, damit die Ansage
 * beim Einblenden zuverlässig vorgelesen wird. Der Text ist ein Knopf und öffnet den Chat.
 * Ist der Knopf noch verborgen (Startseite, Vorteile im Bild), wartet die Blase auf ihn.
 */
export function Anstupser({ knopfSichtbar }: { knopfSichtbar: boolean }) {
  const { lunaOffen, oeffneLuna } = useOverlays()
  const [sichtbar, setSichtbar] = useState(false)
  const [art, setArt] = useState<Bereich | null>(null)
  const inhalt = art ? t[art] : t

  // War der Chat in diesem Besuch offen, kommt der Hinweis nicht mehr.
  useEffect(() => {
    if (lunaOffen) merke()
  }, [lunaOffen])

  useEffect(() => {
    const zeige = () => {
      // Nicht über die Tastatur-Navigation legen (WCAG 2.4.11): Mit sichtbarem Fokus auf der Seite bleibt der Hinweis weg.
      if (document.activeElement?.matches(':focus-visible')) return
      aufraeumen()
      if (gesehen()) return
      merke()
      setArt(bereich())
      setSichtbar(true)
    }
    const beiScroll = () => {
      const { scrollHeight, clientHeight } = document.documentElement
      if (scrollHeight > clientHeight && window.scrollY / (scrollHeight - clientHeight) >= SCROLLTIEFE) zeige()
    }
    const timer = setTimeout(zeige, VERZOEGERUNG)
    const aufraeumen = () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', beiScroll)
    }
    window.addEventListener('scroll', beiScroll, { passive: true })
    return aufraeumen
  }, [])

  // Geht der Tastaturfokus woandershin, verschwindet der Hinweis, damit er das fokussierte Element nicht verdeckt.
  useEffect(() => {
    if (!sichtbar) return
    const beiFokus = (e: FocusEvent) => {
      if (e.target instanceof Element && e.target.matches(':focus-visible') && !e.target.closest('[data-anstupser]')) setSichtbar(false)
    }
    document.addEventListener('focusin', beiFokus)
    return () => document.removeEventListener('focusin', beiFokus)
  }, [sichtbar])

  // Öffnet sich der Chat (auch über einen #luna-Link), verschwindet der Hinweis dauerhaft.
  if (lunaOffen && sichtbar) setSichtbar(false)

  return (
    <div role="status" data-anstupser className="fixed right-s4 bottom-[90px] z-8 dialog:right-(--fx-schwebe-r) dialog:bottom-[146px]">
      {sichtbar && knopfSichtbar && (
        <div className="flex w-[286px] items-start gap-s2 rounded-card rounded-br-ecke border border-linie bg-weiss py-s2 pr-0 pl-s3 text-tiefsee shadow-s transition-opacity duration-(--fx-dur-dialog) ease-fx starting:opacity-0 dialog:w-[262px] dialog:gap-0 dialog:pl-s4">
          <span
            aria-hidden="true"
            className="mt-s1 mr-s1 flex size-[32px] shrink-0 items-center justify-center rounded-pill bg-nacht dialog:hidden"
          >
            <Icon name="luna-signet-glyph" className="size-[19px]" />
          </span>
          <button type="button" onClick={oeffneLuna} className="min-h-[44px] flex-1 cursor-pointer py-s2 text-left text-text text-pretty">
            <span className="font-display font-bold">{inhalt.fett}</span> {inhalt.text}
          </button>
          <button
            type="button"
            aria-label={t.schliessen}
            onClick={() => setSichtbar(false)}
            className="flex size-[44px] shrink-0 cursor-pointer items-center justify-center rounded-chip text-schiefer"
          >
            <Icon name="ui-schliessen" className="size-[18px]" />
          </button>
        </div>
      )}
    </div>
  )
}
