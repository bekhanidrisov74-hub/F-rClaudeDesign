import { useEffect, useRef, useState } from 'react'
import type { Warp as WarpTyp } from '@paper-design/shaders-react'

/**
 * Langsam fließender Wirbel (Warp-Shader von Paper) hinter großen dunklen Karten. Reine Dekoration:
 * aria-hidden, ohne Zeiger-Ereignisse. Der Shader wird erst geladen, wenn die Karte in die Nähe kommt
 * (kein CDN, alles aus dem eigenen Bundle), und pausiert außerhalb des Bildes. Ohne WebGL 2 bleibt das
 * Raster stehen, bei prefers-reduced-motion steht der Wirbel still.
 * Liegt absolut im nächsten positionierten Elternteil.
 */

/**
 * Farben aus tokens.css, überwiegend Tiefsee-2 (nie dunkler als die Karte, sonst löst sich ihr Rand auf):
 * Türkis nur als Schimmer, damit Anrufen das Auffälligste bleibt.
 */
const FARBEN = ['--fx-tiefsee-2', '--fx-icon-technik', '--fx-tiefsee-2', '--fx-tuerkis']
/** Langsam, damit die Karte ruhig bleibt; für den Stillstand ein Bild, in dem der Wirbel schon geformt ist. */
const TEMPO = 0.3
const STILLBILD = 4000
/** Weiche Muster brauchen keine volle Auflösung; schont Handys. */
const PIXEL = 800_000

/** Weich und ruhig („ruhig, klar“); stärkere Wirbel falten sich zu Graten hinter dem Text. */
const FORM = { shape: 'checks', proportion: 0.35, softness: 1, distortion: 0.15, swirl: 0.6, swirlIterations: 8, shapeScale: 0.08 } as const

type Shader = { Warp: typeof WarpTyp; farben: string[]; still: boolean }

function webgl2() {
  const gl = document.createElement('canvas').getContext('webgl2')
  gl?.getExtension('WEBGL_lose_context')?.loseContext()
  return gl !== null
}

/** drehung in Grad: dieselbe Form, damit nebeneinanderliegende Karten nicht gleich aussehen. */
export function Wirbelflaeche({ drehung = 0 }: { drehung?: number }) {
  const box = useRef<HTMLDivElement>(null)
  const [shader, setShader] = useState<Shader | null>(null)

  useEffect(() => {
    const el = box.current
    if (!el || !webgl2()) return
    let aus = false
    const sicht = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return
        sicht.disconnect()
        import('@paper-design/shaders-react').then(({ Warp }) => {
          if (aus) return
          const stil = getComputedStyle(el)
          setShader({
            Warp,
            farben: FARBEN.map((name) => stil.getPropertyValue(name).trim()),
            still: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          })
        })
      },
      { rootMargin: '50%' },
    )
    sicht.observe(el)
    return () => {
      aus = true
      sicht.disconnect()
    }
  }, [])

  return (
    // top-px: die Lichtkante der Karte (kante) bleibt so hell wie bei den übrigen dunklen Karten.
    <div ref={box} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-px bottom-0">
      {shader ? (
        <shader.Warp
          {...FORM}
          rotation={drehung}
          colors={shader.farben}
          speed={shader.still ? 0 : TEMPO}
          frame={STILLBILD}
          minPixelRatio={1}
          maxPixelCount={PIXEL}
          className="wirbel-karte size-full opacity-50"
        />
      ) : (
        <div className="raster-karte size-full opacity-25" />
      )}
    </div>
  )
}
