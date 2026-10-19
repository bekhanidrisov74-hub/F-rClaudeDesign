import { useEffect, useState } from 'react'
import { useOverlays } from '../overlays'
import { Anstupser } from './Anstupser'
import { LunaChat } from './LunaChat'
import { LunaLauncher } from './LunaLauncher'

/**
 * Luna (SPEC 8): Anstupser, Chat (Fenster ab 640 px, Vollbild darunter) und Knopf. Der Zustand lebt in overlays.tsx.
 * Der Knopf steht zuletzt: Per Tab folgt er auf den Chat, den er öffnet und schließt.
 */
export function Luna() {
  const knopfSichtbar = useKnopfSichtbar()
  return (
    <>
      <Anstupser knopfSichtbar={knopfSichtbar} />
      <LunaChat />
      <LunaLauncher sichtbar={knopfSichtbar} />
    </>
  )
}

/**
 * Auf der Startseite erscheint der Knopf erst, wenn die vier Vorteile unter dem Hero (#vorteile) nach oben aus dem Bild
 * gescrollt sind (Wunsch vom 19.10.2026): sonst verdeckt er je nach Fensterhöhe das Ende des vierten Vorteils.
 * Seiten ohne Vorteile zeigen ihn sofort. War der Chat einmal offen, bleibt er, damit der Fokus nach dem Schließen zu ihm
 * zurückkehren kann. Vorgerendert ist er verborgen, damit er auf der Startseite nicht kurz aufblitzt.
 */
function useKnopfSichtbar(): boolean {
  const { lunaOffen } = useOverlays()
  const [vorbei, setVorbei] = useState(false)
  const [genutzt, setGenutzt] = useState(false)
  if (lunaOffen && !genutzt) setGenutzt(true)

  // Gemessen statt per IntersectionObserver: Ein Sprung über die Vorteile hinweg (Anker-Link, am Handy liegen sie anfangs
  // unter dem Falz) ändert ihren Schnitt mit dem Bild nicht und meldet deshalb nichts.
  useEffect(() => {
    const vorteile = document.getElementById('vorteile')
    const pruefe = () => setVorbei(!vorteile || vorteile.getBoundingClientRect().bottom <= 0)
    pruefe()
    window.addEventListener('scroll', pruefe, { passive: true })
    window.addEventListener('resize', pruefe)
    return () => {
      window.removeEventListener('scroll', pruefe)
      window.removeEventListener('resize', pruefe)
    }
  }, [])

  return vorbei || genutzt
}
