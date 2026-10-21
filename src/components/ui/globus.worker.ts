import { geoGraticule10, geoOrthographic, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import welt from 'world-atlas/countries-110m.json'

/**
 * Zeichnet den Fuß-Globus (Globus.tsx) außerhalb des Hauptthreads: d3-geo projiziert je Bild rund 10 000 Punkte, auf dem
 * Hauptthread blockierte das auf kurzen Seiten (Fuß sofort im Bild) die Eingaben. Nachrichten: einmal { leinwand, tinte, tuerkis },
 * dann { breite, dpr } bei jeder Größenänderung und { lauf, still } bei Sichtbarkeit bzw. reduzierter Bewegung.
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

const laender = feature(welt as never, welt.objects.countries as never) as unknown as GeoJSON.FeatureCollection
const heimat = laender.features.find((f) => f.id === OESTERREICH_ID)
const raster = geoGraticule10()
const projektion = geoOrthographic().precision(0.3).clipAngle(90)

let ctx: OffscreenCanvasRenderingContext2D
let pfad: ReturnType<typeof geoPath>
let tinte = ''
let tuerkis = ''
let breite = 0
let laenge = OESTERREICH[0]
let still = false
let lauf = false
let zuletzt = 0
let frame = 0
let gemeldet = false

const zeichnen = () => {
  if (!breite) return
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
  // Für die Tests: Der Globus steht im Bild (Globus.tsx setzt data-gezeichnet).
  if (!gemeldet) postMessage(true)
  gemeldet = true
}

// Zeitbasiert statt pro Bild, damit 60 und 120 Hz gleich schnell drehen.
const drehen = (now: number) => {
  frame = 0
  if (zuletzt) laenge -= (TEMPO * (now - zuletzt)) / 1000
  zuletzt = now
  zeichnen()
  if (lauf) frame = requestAnimationFrame(drehen)
}

onmessage = ({ data }) => {
  if (data.leinwand) {
    ctx = (data.leinwand as OffscreenCanvas).getContext('2d')!
    pfad = geoPath(projektion, ctx)
    tinte = data.tinte
    tuerkis = data.tuerkis
  } else if (data.breite !== undefined) {
    breite = data.breite
    ctx.canvas.width = Math.round(breite * data.dpr)
    ctx.canvas.height = Math.round(breite * data.dpr)
    ctx.setTransform(data.dpr, 0, 0, data.dpr, 0, 0)
    projektion.scale(breite / 2 - 1).translate([breite / 2, breite / 2])
    zeichnen()
  } else {
    // Schaltet der Nutzer reduzierte Bewegung während des Laufs um: sofort anhalten (auf Österreich) bzw. wieder drehen
    if (data.still && !still) {
      laenge = OESTERREICH[0]
      zeichnen()
    }
    still = data.still
    lauf = data.lauf && !still
    if (!lauf) {
      cancelAnimationFrame(frame)
      frame = 0
    } else if (!frame) {
      zuletzt = 0
      frame = requestAnimationFrame(drehen)
    }
  }
}
