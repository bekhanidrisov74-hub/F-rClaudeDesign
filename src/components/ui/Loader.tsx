import { useId } from 'react'

/**
 * Ladeanzeige mit drei verschmelzenden Punkten (Goo-Filter) in den fixit247-Farben, rein dekorativ.
 * `groesse` in px; Wege der Punkte stehen in app.css relativ zur Punktgröße, die Unschärfe wächst mit.
 * Bei prefers-reduced-motion steht sie still (tokens.css): ein ruhender Punkt.
 */
const PUNKTE = [
  { farbe: 'bg-tuerkis', animation: 'loader-punkt-1 2s ease infinite, loader-ebene 6s ease infinite' },
  { farbe: 'bg-tiefsee', animation: 'loader-punkt-2 2s ease infinite, loader-ebene 6s -2s ease infinite' },
  { farbe: 'bg-icon-handwerk', animation: 'loader-punkt-3 2s ease infinite, loader-ebene 6s -4s ease infinite' },
]

export function Loader({ groesse = 32 }: { groesse?: number }) {
  const filter = useId()
  return (
    <span aria-hidden="true" className="relative inline-block shrink-0" style={{ width: groesse, height: groesse }}>
      <span
        className="absolute inset-0"
        style={{ filter: `url(#${filter})`, animation: 'loader-drehen 2s ease-in-out infinite' }}
      >
        {PUNKTE.map((p) => (
          <span
            key={p.farbe}
            className={`absolute inset-0 m-auto size-[35%] rounded-pill ${p.farbe}`}
            style={{ animation: p.animation }}
          />
        ))}
      </span>
      <svg className="absolute size-0" focusable="false">
        <filter id={filter}>
          <feGaussianBlur in="SourceGraphic" stdDeviation={groesse / 20} result="unscharf" />
          <feColorMatrix in="unscharf" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 21 -7" />
        </filter>
      </svg>
    </span>
  )
}
