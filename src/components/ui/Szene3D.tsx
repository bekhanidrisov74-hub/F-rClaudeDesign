import { useEffect, useRef, useState } from 'react'

/** Ohne Scrollen oder Zeiger gleicht die Szene dem Standbild: three.js lädt erst nach der ersten Bewegung, nie vor
 * dem ersten Zeichnen und nicht für Besucher, die nur schauen. */
let bewegt: Promise<void> | undefined
function ersteBewegung() {
  bewegt ??= new Promise((weiter) => {
    const arten = ['scroll', 'wheel', 'pointermove', 'touchstart', 'keydown'] as const
    const los = () => {
      for (const art of arten) removeEventListener(art, los)
      weiter()
    }
    for (const art of arten) addEventListener(art, los, { passive: true })
  })
  return bewegt
}

function webgl() {
  const gl = document.createElement('canvas').getContext('webgl2')
  gl?.getExtension('WEBGL_lose_context')?.loseContext()
  return gl !== null
}

/**
 * Das Bild als echte 3D-Szene (three.js, public/modelle/bild-N.glb) über dem Standbild. three.js und das Modell
 * laden erst nach der ersten Bewegung, wenn die Fläche in die Nähe kommt und der Browser Zeit hat; bis zum ersten
 * gezeichneten Bild bleibt das
 * Standbild sichtbar, ohne WebGL oder bei prefers-reduced-motion bleibt es ganz. Die Wand mit dem türkisen Kegel ist
 * der Hintergrund der Zeichenfläche, die Kamera schwenkt beim Scrollen und unter dem Zeiger ein paar Grad.
 */
export function Szene3D({ bild }: { bild: number }) {
  const flaeche = useRef<HTMLCanvasElement>(null)
  const [bereit, setBereit] = useState(false)

  useEffect(() => {
    const el = flaeche.current
    const standbild = el?.parentElement?.querySelector('img')
    if (!el || !standbild || matchMedia('(prefers-reduced-motion: reduce)').matches || !webgl()) return
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
            abbau = buehne(el, { url: `/modelle/bild-${bild}.glb`, bild: standbild, bereit: () => setBereit(true) })
          }),
        )
      },
      { rootMargin: '50%' },
    )
    ersteBewegung().then(() => {
      if (!aus) sicht.observe(el)
    })
    return () => {
      aus = true
      sicht.disconnect()
      abbau?.()
    }
  }, [bild])

  return (
    <canvas
      ref={flaeche}
      className={`szene3d absolute inset-0 h-full w-full transition-opacity duration-(--fx-dur-sheet) ${bereit ? 'opacity-100' : 'opacity-0'}`}
    />
  )
}
