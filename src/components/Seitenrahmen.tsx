import type { ReactNode } from 'react'
import { Luna } from '../luna/Luna'
import { useOverlays } from '../overlays'
import { Footer } from './Footer'
import { Header } from './Header'
import { MobileMenu } from './MobileMenu'
import { Preisuebersicht } from './Preisuebersicht'

/**
 * Gemeinsame Hülle aller Seiten: Kopf, Handy-Menü, Inhalt, Fuß und die Überlagerungen.
 * Bei offenem Menü ist alles außer Kopf und Menü `inert` (Fokusfalle, SPEC 7), auch Luna.
 * Der Fuß liegt auch auf kurzen Seiten unten an.
 */
export function Seitenrahmen({ aufStartseite = true, children }: { aufStartseite?: boolean; children: ReactNode }) {
  const { menueOffen } = useOverlays()
  return (
    <div className="flex min-h-dvh flex-col">
      <Header aufStartseite={aufStartseite} />
      <MobileMenu aufStartseite={aufStartseite} />
      <div inert={menueOffen} className="flex grow flex-col">
        <main className="grow">{children}</main>
        <Footer />
        <Luna />
      </div>
      <Preisuebersicht aufStartseite={aufStartseite} />
    </div>
  )
}
