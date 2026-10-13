import { copy } from '../content/copy'

// Platzhalter aus Phase 2 (Stand Phase 1): wird vom ui-builder ersetzt.
export function Hero() {
  return (
    <section id="start" className="wrapper py-section">
      <h1 className="text-h1">
        {copy.hero.h1.map((zeile) => (
          <span key={zeile} className="block">
            {zeile}
          </span>
        ))}
      </h1>
      <p className="mt-s4 max-w-[27em] text-lead text-schiefer">{copy.hero.lead}</p>
    </section>
  )
}
