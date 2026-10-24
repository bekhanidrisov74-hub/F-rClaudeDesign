import type { ReactNode } from 'react'
import { gewerkseiten } from '../content/gewerkseiten'

/** Sichtbare Brotkrumen „Startseite › {aktuell}“; dieselben Namen stehen als BreadcrumbList im Kopf (App.tsx, brotkrumen). */
export function Brotkrumen({ aktuell }: { aktuell: string }) {
  const { brotkrumen } = gewerkseiten
  return (
    <nav aria-label={brotkrumen.label}>
      <ol role="list" className="flex flex-wrap items-center text-small text-schiefer">
        <li className="flex items-center">
          <a href="/" className="inline-flex min-h-[44px] min-w-[44px] items-center underline underline-offset-4 hover:decoration-tuerkis">
            {brotkrumen.start}
          </a>
          <span aria-hidden="true" className="px-s2">
            ›
          </span>
        </li>
        <li aria-current="page">{aktuell}</li>
      </ol>
    </nav>
  )
}

/** Zweispaltiger Abschnitt (Titel und Lead links, Inhalt rechts) wie „Was wir von Partnern erwarten“; ab 920 px bleibt die linke Spalte stehen. */
export function Abschnitt({
  id,
  flaeche,
  titel,
  lead,
  children,
}: {
  id: string
  flaeche: 'kalk' | 'eis'
  titel: string
  lead: string
  children: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-titel`} className={flaeche === 'eis' ? 'bg-eis text-tiefsee' : 'bg-kalk'}>
      <div className="wrapper grid gap-s6 pt-section pb-section-end nav:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] nav:gap-s8">
        <div className="flex flex-col gap-s4 nav:sticky nav:top-[calc(var(--fx-kopf)+var(--fx-s-6))] nav:gap-s3 nav:self-start">
          <h2 id={`${id}-titel`} className="text-h2 break-words hyphens-auto">
            {titel}
          </h2>
          <p className="text-lead text-schiefer">{lead}</p>
        </div>
        <div className="flex flex-col gap-s5">{children}</div>
      </div>
    </section>
  )
}
