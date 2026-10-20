import { useEffect, useRef } from 'react'

/**
 * Langsam drehender Drahtgitter-Globus, Österreich in Türkis. Die Linien nehmen die Schriftfarbe des Canvas (im Fuß Nebel auf
 * Tiefsee, per className gesetzt). Reine Dekoration: aria-hidden, ohne Zeiger-Ereignisse, ein Canvas. Kartendaten und d3-geo
 * werden erst geladen, wenn der Globus ins Bild kommt (kein CDN, alles aus dem eigenen Bundle). Außerhalb des Bildes pausiert er;
 * bei prefers-reduced-motion bleibt er still auf Österreich stehen, auch wenn die Einstellung erst später umgeschaltet wird.
 */

/** Mitte Österreichs [Länge, Breite]; ISO-3166-Nummer in world-atlas. */
const OESTERREICH: [number, number] = [14.5, 47.5]
const OESTERREICH_ID = '040'
/** Grad je Sekunde. */
const TEMPO = 6
/** Gedämpft, damit der Anruf-Knopf das Auffälligste bleibt (Nebel auf dunklem Grund; heller Strich wirkt stärker als dunkler). */
const LINIEN = 0.5
const RASTER = 0.16
/** Österreich ist auf 320 px nur ein paar Pixel groß, darf also kräftiger sein. */
const LAND = 0.9

export function Globus({ className = '' }: { className?: string }) {
  const papier = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = papier.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const bewegung = window.matchMedia('(prefers-reduced-motion: reduce)')
    let still = bewegung.matches
    let aus = false
    let stopp = () => {}

    const starten = async () => {
      const [{ geoOrthographic, geoPath, geoGraticule10 }, { feature }, { default: welt }] = await Promise.all([
        import('d3-geo'),
        import('topojson-client'),
        import('world-atlas/countries-110m.json'),
      ])
      if (aus) return

      const stil = getComputedStyle(canvas)
      const tinte = stil.color
      const tuerkis = stil.getPropertyValue('--fx-tuerkis').trim()
      const laender = feature(welt as never, welt.objects.countries as never) as unknown as GeoJSON.FeatureCollection
      const heimat = laender.features.find((f) => f.id === OESTERREICH_ID)
      const raster = geoGraticule10()
      const projektion = geoOrthographic().precision(0.3).clipAngle(90)
      const pfad = geoPath(projektion, ctx)

      let breite = 0
      const messen = () => {
        breite = canvas.clientWidth
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        canvas.width = Math.round(breite * dpr)
        canvas.height = Math.round(breite * dpr)
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        projektion.scale(breite / 2 - 1).translate([breite / 2, breite / 2])
      }

      const zeichnen = (laenge: number) => {
        // 20° über der Mitte, damit Österreich im sichtbaren oberen Teil liegt.
        projektion.rotate([-laenge, -OESTERREICH[1] + 20])
        ctx.clearRect(0, 0, breite, breite)
        ctx.lineWidth = 1
        ctx.strokeStyle = tinte
        ctx.globalAlpha = RASTER
        ctx.beginPath()
        pfad(raster)
        ctx.stroke()
        ctx.globalAlpha = LINIEN
        ctx.lineWidth = 0.6
        ctx.beginPath()
        pfad(laender)
        ctx.stroke()
        if (heimat) {
          ctx.globalAlpha = LAND
          ctx.fillStyle = tuerkis
          ctx.beginPath()
          pfad(heimat)
          ctx.fill()
        }
        ctx.globalAlpha = LINIEN
        ctx.lineWidth = 1
        ctx.beginPath()
        pfad({ type: 'Sphere' })
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      // Zeitbasiert statt pro Bild, damit 60 und 120 Hz gleich schnell drehen.
      let laenge = OESTERREICH[0]
      let zuletzt = 0
      let frame = 0
      let sichtbar = true
      const drehen = (now: number) => {
        frame = 0
        if (zuletzt) laenge -= (TEMPO * (now - zuletzt)) / 1000
        zuletzt = now
        zeichnen(laenge)
        if (sichtbar && !document.hidden && !still) frame = requestAnimationFrame(drehen)
      }
      const weiter = () => {
        zuletzt = 0
        if (!frame && !still) frame = requestAnimationFrame(drehen)
      }
      // Schaltet der Nutzer reduzierte Bewegung während des Laufs um: sofort anhalten (auf Österreich) bzw. wieder drehen
      const umschalten = () => {
        still = bewegung.matches
        if (!still) return weiter()
        cancelAnimationFrame(frame)
        frame = 0
        laenge = OESTERREICH[0]
        zeichnen(laenge)
      }
      bewegung.addEventListener('change', umschalten)

      const groesse = new ResizeObserver(() => {
        messen()
        zeichnen(laenge)
      })
      groesse.observe(canvas)
      const sicht = new IntersectionObserver(([e]) => {
        sichtbar = e?.isIntersecting ?? true
        if (sichtbar) weiter()
      })
      sicht.observe(canvas)
      document.addEventListener('visibilitychange', weiter)

      stopp = () => {
        groesse.disconnect()
        sicht.disconnect()
        cancelAnimationFrame(frame)
        document.removeEventListener('visibilitychange', weiter)
        bewegung.removeEventListener('change', umschalten)
      }
    }

    // Erst laden, wenn der Fuß in die Nähe kommt.
    const vorab = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return
        vorab.disconnect()
        starten().catch(() => {})
      },
      { rootMargin: '400px' },
    )
    vorab.observe(canvas)

    return () => {
      aus = true
      vorab.disconnect()
      stopp()
    }
  }, [])

  return <canvas ref={papier} aria-hidden="true" className={`pointer-events-none aspect-square w-full ${className}`} />
}
