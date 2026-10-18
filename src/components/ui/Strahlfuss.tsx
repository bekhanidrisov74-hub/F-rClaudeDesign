import type { PointerEvent, ReactNode } from 'react'

/**
 * Fuß mit Lichtstrahl und großer Wortmarke, nach „Beam Wordmark Footer“ von 21st.dev, in Tokens und Stil der Seite.
 * Das Licht steckt in app.css (strahlfuss, strahl, wortmarke): ein türkiser Strahl im Hintergrund und in den
 * Buchstaben, der beim Hinscrollen mitwandert, und ein weicher Schein, den die Maus durch die Buchstaben trägt.
 * Strahl und Wortmarke sind reine Dekoration (aria-hidden), das Logo steht schon im Fuß. Die Wortmarke bleibt das
 * letzte Element: ihr Licht ist an der Ecke unten rechts verankert, wie das des Hintergrunds.
 */
export function Strahlfuss({ wort, children }: { wort: string; children: ReactNode }) {
  // Nur die Maus: am Handy würde der Schein bei jedem Tippen aufblitzen. y zählt vom unteren Rand (siehe app.css).
  const zeiger = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return
    const fuss = e.currentTarget
    const r = fuss.getBoundingClientRect()
    fuss.style.setProperty('--zeiger-x', `${e.clientX - r.left}px`)
    fuss.style.setProperty('--zeiger-y', `${e.clientY - r.bottom}px`)
    fuss.style.setProperty('--schein', e.type === 'pointerleave' ? '0' : '1')
  }

  return (
    <footer onPointerMove={zeiger} onPointerLeave={zeiger} className="strahlfuss relative overflow-clip bg-tiefsee text-kalk">
      <div aria-hidden="true" className="strahl pointer-events-none absolute inset-0" />
      {children}
      <div aria-hidden="true" className="wortmarke">
        <div className="wrapper">{wort}</div>
      </div>
    </footer>
  )
}
