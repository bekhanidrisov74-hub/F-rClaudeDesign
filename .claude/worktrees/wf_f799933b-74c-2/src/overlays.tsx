import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

/**
 * Steuerung der Überlagerungen: Handy-Menü und Preisübersicht (Phase 3), Luna folgt in Phase 4.
 * Jede Überlagerung rendert sich selbst und liest hier nur, ob sie offen ist.
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
}

const Kontext = createContext<Overlays | null>(null)

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [menueOffen, setMenueOffen] = useState(false)
  const [preise, setPreise] = useState<{ offen: boolean; rueckfokus: HTMLElement | null }>({ offen: false, rueckfokus: null })

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

  const wert = useMemo(
    () => ({ menueOffen, setMenueOffen, preiseOffen: preise.offen, oeffnePreise, schliessePreise }),
    [menueOffen, preise.offen, oeffnePreise, schliessePreise],
  )
  return <Kontext.Provider value={wert}>{children}</Kontext.Provider>
}

export function useOverlays(): Overlays {
  const wert = useContext(Kontext)
  if (!wert) throw new Error('useOverlays braucht den OverlayProvider')
  return wert
}
