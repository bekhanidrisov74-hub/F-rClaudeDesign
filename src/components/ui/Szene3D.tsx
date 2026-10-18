import { useEffect, useRef, useState } from 'react'

/** Ohne Scrollen oder Zeiger gleicht die Szene dem Standbild: three.js lädt erst nach der ersten Bewegung, nie vor
 * dem ersten Zeichnen und nicht für Besucher, die nur schauen. Erst dann wird auch einmal WebGL 2 geprüft.
 * Ergebnis: true, wenn die Szenen laden dürfen. */
let bereitFuer3D: Promise<boolean> | undefined
function nachErsterBewegung() {
  bereitFuer3D ??= new Promise((weiter) => {
    const arten = ['scroll', 'wheel', 'pointermove', 'touchstart', 'keydown'] as const
    const los = () => {
      for (const art of arten) removeEventListener(art, los)
      const gl = document.createElement('canvas').getContext('webgl2')
      gl?.getExtension('WEBGL_lose_context')?.loseContext()
      weiter(gl !== null)
    }
    for (const art of arten) addEventListener(art, los, { passive: true })
  })
  return bereitFuer3D
}

/**
 * Das Bild als echte 3D-Szene (three.js, public/modelle/bild-N.glb) über dem Standbild. three.js und das Modell
 * laden erst nach der ersten Bewegung, wenn die Fläche in die Nähe kommt und der Browser Zeit hat; bis zum ersten
 * gezeichneten Bild bleibt das Standbild sichtbar, ohne WebGL 2 oder bei prefers-reduced-motion bleibt es ganz.
 * Die Wand mit dem türkisen Kegel (public/images/wand-N.webp) ist der Hintergrund der Zeichenfläche, die Kamera
 * schwenkt beim Scrollen und unter dem Zeiger ein paar Grad.
 */
export function Szene3D({ bild }: { bild: number }) {
  const wand = useRef<HTMLDivElement>(null)
  const flaeche = useRef<HTMLCanvasElement>(null)
  const [bereit, setBereit] = useState(false)

  useEffect(() => {
    const el = flaeche.current
    const hinten = wand.current
    const standbild = hinten?.parentElement?.querySelector('img')
    if (!el || !hinten || !standbild || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let aus = false
    let abbau: (() => void) | undefined
    const sicht = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return
        sicht.disconnect()
        // Safari kennt requestIdleCallback nicht
        ;(window.requestIdleCallback ?? ((f: () => void) => setTimeout(f, 300)))(() =>
          import('../../lib/buehne3d').then(({ buehne }) => {
            if (aus) return
            abbau = buehne(el, {
              url: `/modelle/bild-${bild}.glb`,
              wand: `/images/wand-${bild}.webp`,
              wandFlaeche: hinten,
              bild: standbild,
              bereit: () => setBereit(true),
            })
          }),
        )
      },
      { rootMargin: '50%' },
    )
    nachErsterBewegung().then((webgl) => {
      if (webgl && !aus) sicht.observe(el)
    })
    return () => {
      aus = true
      sicht.disconnect()
      abbau?.()
    }
  }, [bild])

  return (
    <div
      ref={wand}
      className={`szene3d absolute inset-0 transition-opacity duration-(--fx-dur-sheet) ${bereit ? 'opacity-100' : 'opacity-0'}`}
    >
      <canvas ref={flaeche} className="h-full w-full" />
    </div>
  )
}
