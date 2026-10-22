import { useEffect, useRef } from 'react'

/**
 * Langsam drehender Drahtgitter-Globus, Österreich in Türkis. Die Linien nehmen die Schriftfarbe des Canvas (im Fuß Nebel auf
 * Tiefsee, per className gesetzt). Reine Dekoration: aria-hidden, ohne Zeiger-Ereignisse, ein Canvas. Gezeichnet wird in einem
 * Worker (globus.worker.ts, OffscreenCanvas), damit der Hauptthread frei bleibt; Worker, Kartendaten und d3-geo werden erst
 * geladen, wenn der Globus ins Bild kommt (kein CDN, alles aus dem eigenen Bundle). Außerhalb des Bildes pausiert er;
 * bei prefers-reduced-motion bleibt er still auf Österreich stehen, auch wenn die Einstellung erst später umgeschaltet wird.
 */
export function Globus({ className = '' }: { className?: string }) {
  const papier = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = papier.current
    // ponytail: ohne OffscreenCanvas (vor Safari 16.4) bleibt die Dekoration leer
    if (!canvas?.transferControlToOffscreen) return
    const bewegung = window.matchMedia('(prefers-reduced-motion: reduce)')
    let stopp = () => {}

    const starten = () => {
      const stil = getComputedStyle(canvas)
      const leinwand = canvas.transferControlToOffscreen()
      const zeichner = new Worker(new URL('./globus.worker.ts', import.meta.url), { type: 'module' })
      zeichner.onmessage = () => (canvas.dataset.gezeichnet = '')
      zeichner.postMessage({ leinwand, tinte: stil.color, tuerkis: stil.getPropertyValue('--fx-tuerkis').trim() }, [leinwand])

      let sichtbar = true
      const melden = () => zeichner.postMessage({ lauf: sichtbar && !document.hidden, still: bewegung.matches })
      const groesse = new ResizeObserver(() =>
        zeichner.postMessage({ breite: canvas.clientWidth, dpr: Math.min(window.devicePixelRatio || 1, 2) }),
      )
      groesse.observe(canvas)
      const sicht = new IntersectionObserver(([e]) => {
        sichtbar = e?.isIntersecting ?? true
        melden()
      })
      sicht.observe(canvas)
      document.addEventListener('visibilitychange', melden)
      bewegung.addEventListener('change', melden)

      stopp = () => {
        zeichner.terminate()
        groesse.disconnect()
        sicht.disconnect()
        document.removeEventListener('visibilitychange', melden)
        bewegung.removeEventListener('change', melden)
      }
    }

    // Erst laden, wenn der Fuß in die Nähe kommt.
    const vorab = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return
        vorab.disconnect()
        starten()
      },
      { rootMargin: '400px' },
    )
    vorab.observe(canvas)

    return () => {
      vorab.disconnect()
      stopp()
    }
  }, [])

  return <canvas ref={papier} aria-hidden="true" className={`pointer-events-none aspect-square w-full ${className}`} />
}
