import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { gefuehrt, type Zustand } from './luna/flow'

/**
 * Steuerung der Überlagerungen: Handy-Menü, Preisübersicht und Luna.
 * Jede Überlagerung rendert sich selbst und liest hier nur, ob sie offen ist.
 * Der Luna-Gesprächszustand lebt hier, damit er Minimieren und Schließen übersteht.
 */
interface Overlays {
  menueOffen: boolean
  setMenueOffen: (offen: boolean) => void
  /** Preisübersicht offen? */
  preiseOffen: boolean
  /**
   * Öffnet die Preisübersicht. `rueckfokus` bekommt nach dem Schließen den Fokus,
   * Standard ist das gerade fokussierte Element (der Auslöser).
   */
  oeffnePreise: (rueckfokus?: HTMLElement | null) => void
  /** Schließt die Preisübersicht und gibt den Fokus an den Auslöser zurück. */
  schliessePreise: () => void
  /** Luna-Fenster bzw. -Vollbild offen? */
  lunaOffen: boolean
  oeffneLuna: () => void
  /** Minimieren (Desktop) und Schließen (Handy) blenden nur aus, das Gespräch bleibt. */
  schliesseLuna: () => void
  luna: Zustand
  setLuna: (z: Zustand) => void
}

const Kontext = createContext<Overlays | null>(null)

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [menueOffen, setMenueOffen] = useState(false)
  const [preise, setPreise] = useState<{ offen: boolean; rueckfokus: HTMLElement | null }>({ offen: false, rueckfokus: null })
  const [lunaOffen, setLunaOffen] = useState(false)
  const [luna, setLuna] = useState<Zustand>(gefuehrt.start)

  const oeffnePreise = useCallback((rueckfokus?: HTMLElement | null) => {
    setPreise({ offen: true, rueckfokus: rueckfokus ?? (document.activeElement as HTMLElement | null) })
  }, [])

  const schliessePreise = useCallback(() => {
    setPreise((alt) => {
      // Nach dem Rendern fokussieren: der Auslöser ist erst wieder bedienbar, wenn die Seite nicht mehr gesperrt ist.
      if (alt.offen) requestAnimationFrame(() => alt.rueckfokus?.focus())
      return { offen: false, rueckfokus: null }
    })
  }, [])

  const oeffneLuna = useCallback(() => setLunaOffen(true), [])
  const schliesseLuna = useCallback(() => setLunaOffen(false), [])

  // Alle Elemente mit href="#luna" öffnen den Chat (SPEC 8).
  useEffect(() => {
    const beiKlick = (e: MouseEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest('a[href="#luna"]')) return
      e.preventDefault()
      setLunaOffen(true)
    }
    document.addEventListener('click', beiKlick)
    return () => document.removeEventListener('click', beiKlick)
  }, [])

  const wert = useMemo(
    () => ({
      menueOffen,
      setMenueOffen,
      preiseOffen: preise.offen,
      oeffnePreise,
      schliessePreise,
      lunaOffen,
      oeffneLuna,
      schliesseLuna,
      luna,
      setLuna,
    }),
    [menueOffen, preise.offen, oeffnePreise, schliessePreise, lunaOffen, oeffneLuna, schliesseLuna, luna],
  )
  return <Kontext.Provider value={wert}>{children}</Kontext.Provider>
}

export function useOverlays(): Overlays {
  const wert = useContext(Kontext)
  if (!wert) throw new Error('useOverlays braucht den OverlayProvider')
  return wert
}
