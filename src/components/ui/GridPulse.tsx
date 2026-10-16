import { useEffect, useRef } from 'react'

/**
 * Feines Raster, das unter dem Zeiger kurz in den fixit247-Farben aufleuchtet; ein paar Zellen
 * leuchten von selbst. Reine Dekoration: aria-hidden, ohne Zeiger-Ereignisse, ein Canvas, das schläft,
 * wenn nichts leuchtet, außerhalb des Bildes pausiert und bei prefers-reduced-motion still bleibt.
 * Liegt absolut im nächsten positionierten Elternteil; Zeilen von [data-grid-avoid] darin bleiben blass.
 */

/** Muss zu --fx-s-5 im Raster (app.css) passen. */
const ZELLE = 24
const REICHWEITE = 2.6
const VON_SELBST = 2
const HOECHSTENS = 140
/** Farben aus tokens.css, Türkis am häufigsten, Orange nur als Akzent. */
const FARBEN = ['--fx-tuerkis', '--fx-tuerkis', '--fx-icon-technik', '--fx-nebel', '--fx-icon-handwerk']
/** Deckkraft je Zelle: gedämpft, damit der Anruf-Knopf das Auffälligste bleibt. */
const STUFEN = [0.5, 0.42, 0.34, 0.26, 0.18]
/** So blass wird eine Zelle direkt hinter Text, und nach so vielen Zellen ist sie wieder voll. */
const BLASS = 0.13
const ANSTIEG = 2.2
const RAND = 5
const EIN = 160
const AUS = 750

type Zelle = { col: number; row: number; farbe: string; alpha: number; born: number; until: number }

const easeOut = (t: number) => 1 - (1 - t) ** 2
const easeIn = (t: number) => t * t
const zufall = <T,>(liste: T[]) => liste[Math.floor(Math.random() * liste.length)]

export function GridPulse() {
  const box = useRef<HTMLDivElement>(null)
  const papier = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = box.current
    const canvas = papier.current
    const ctx = canvas?.getContext('2d')
    if (!el || !canvas || !ctx) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const stil = getComputedStyle(el)
    const farben = FARBEN.map((name) => stil.getPropertyValue(name).trim())
    const zellen = new Map<string, Zelle>()
    let cols = 1
    let rows = 1
    let width = 0
    let height = 0
    let frei: DOMRect[] = []

    // Die Textzeilen schützen, nicht ihre Kästen: die kurze letzte Zeile lässt rechts Platz.
    const textMessen = () => {
      const b = el.getBoundingClientRect()
      const scope = el.parentElement ?? document
      frei = [...scope.querySelectorAll('[data-grid-avoid]')].flatMap((node) => {
        const range = document.createRange()
        range.selectNodeContents(node)
        const zeilen = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0)
        return (zeilen.length > 0 ? zeilen : [node.getBoundingClientRect()]).map(
          (r) => new DOMRect(r.left - b.left - RAND, r.top - b.top - RAND, r.width + RAND * 2, r.height + RAND * 2),
        )
      })
    }

    const messen = () => {
      width = el.clientWidth
      height = el.clientHeight
      cols = Math.max(1, Math.ceil(width / ZELLE))
      rows = Math.max(1, Math.ceil(height / ZELLE))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      textMessen()
      wecken()
    }

    // Hinter Text blass statt dunkel: ein Loch im Raster wirkt wie ein Fehler.
    const helligkeit = (col: number, row: number) => {
      const x = col * ZELLE + ZELLE / 2
      const y = row * ZELLE + ZELLE / 2
      let naechste = Number.POSITIVE_INFINITY
      for (const r of frei) {
        const dx = Math.max(r.left - x, 0, x - r.right)
        const dy = Math.max(r.top - y, 0, y - r.bottom)
        naechste = Math.min(naechste, Math.hypot(dx, dy))
        if (naechste === 0) break
      }
      if (naechste === Number.POSITIVE_INFINITY) return 1
      return BLASS + (1 - BLASS) * Math.min(1, naechste / (ANSTIEG * ZELLE))
    }

    let frame = 0
    const zeichnen = (now: number) => {
      frame = 0
      ctx.clearRect(0, 0, width, height)
      for (const [key, z] of zellen) {
        let a: number
        if (now < z.until) {
          a = easeOut(Math.min(1, (now - z.born) / EIN))
        } else {
          const t = (now - z.until) / AUS
          if (t >= 1) {
            zellen.delete(key)
            continue
          }
          a = 1 - easeIn(t)
        }
        ctx.globalAlpha = a * z.alpha
        ctx.fillStyle = z.farbe
        // Um die Haarlinie eingerückt, damit das Raster zwischen leuchtenden Zellen sichtbar bleibt.
        ctx.fillRect(z.col * ZELLE + 1, z.row * ZELLE + 1, ZELLE - 1, ZELLE - 1)
      }
      ctx.globalAlpha = 1
      if (zellen.size > 0) frame = requestAnimationFrame(zeichnen)
    }
    const wecken = () => {
      if (!frame) frame = requestAnimationFrame(zeichnen)
    }

    const leuchten = (col: number, row: number, halten: number) => {
      if (col < 0 || row < 0 || col >= cols || row >= rows || zellen.size >= HOECHSTENS) return
      const key = `${col},${row}`
      const now = performance.now()
      const alt = zellen.get(key)
      if (alt && now < alt.until) return
      // Beim Verblassen erneut getroffen: setzt dort fort, statt aus- und wieder einzublenden.
      let born = now
      if (alt) {
        const rest = 1 - easeIn(Math.min(1, (now - alt.until) / AUS))
        born = now - (1 - Math.sqrt(1 - rest)) * EIN
      }
      zellen.set(key, {
        col,
        row,
        farbe: alt?.farbe ?? zufall(farben),
        alpha: alt?.alpha ?? zufall(STUFEN) * helligkeit(col, row),
        born,
        until: now + halten,
      })
      wecken()
    }

    // Der Zeiger malt; weiter entfernte Zellen treffen seltener, damit der Rand der Spur ausfranst.
    let pending = 0
    let at: { x: number; y: number } | null = null
    const malen = () => {
      pending = 0
      if (!at) return
      const cx = Math.floor(at.x / ZELLE)
      const cy = Math.floor(at.y / ZELLE)
      const span = Math.ceil(REICHWEITE)
      for (let dy = -span; dy <= span; dy++) {
        for (let dx = -span; dx <= span; dx++) {
          const weg = Math.hypot(dx, dy)
          if (weg > REICHWEITE || Math.random() > 1 - weg / (REICHWEITE + 0.6)) continue
          leuchten(cx + dx, cy + dy, 260 + Math.random() * 900)
        }
      }
    }
    // Am Fenster, weil das Raster unter dem Inhalt liegt und den Zeiger selbst nie bekommt.
    const onMove = (event: PointerEvent) => {
      const b = el.getBoundingClientRect()
      at = { x: event.clientX - b.left, y: event.clientY - b.top }
      if (!pending) pending = requestAnimationFrame(malen)
    }

    let sichtbar = true
    let takt = 0
    const treiben = () => {
      takt = window.setTimeout(treiben, 1400 + Math.random() * 1800)
      if (!sichtbar || document.hidden) return
      for (let i = 0; i < VON_SELBST; i++) {
        leuchten(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows), 900 + Math.random() * 1600)
      }
    }
    takt = window.setTimeout(treiben, 500)

    const sicht = new IntersectionObserver(([e]) => {
      sichtbar = e?.isIntersecting ?? true
    })
    sicht.observe(el)
    const groesse = new ResizeObserver(messen)
    groesse.observe(el)
    let nachmessen = 0
    const text = new MutationObserver(() => {
      if (!nachmessen) {
        nachmessen = requestAnimationFrame(() => {
          nachmessen = 0
          textMessen()
        })
      }
    })
    text.observe(el.parentElement ?? document.body, { childList: true, subtree: true, characterData: true })
    messen()
    // Zeilen verschieben sich, sobald die Schriften geladen sind.
    document.fonts?.ready.then(textMessen).catch(() => {})
    window.addEventListener('pointermove', onMove, { passive: true })

    return () => {
      sicht.disconnect()
      groesse.disconnect()
      text.disconnect()
      cancelAnimationFrame(nachmessen)
      cancelAnimationFrame(frame)
      cancelAnimationFrame(pending)
      clearTimeout(takt)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <div ref={box} aria-hidden="true" className="raster pointer-events-none absolute inset-0 -z-1 overflow-hidden">
      <canvas ref={papier} className="absolute inset-0 size-full" />
    </div>
  )
}
