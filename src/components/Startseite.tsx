import { copy } from '../content/copy'

// ponytail: Gerüst aus Phase 1, die Abschnitte kommen in Phase 2.
export function Startseite() {
  return (
    <main id="start" className="wrapper py-section">
      <h1 className="m-0 text-h1">
        {copy.hero.h1.map((zeile) => (
          <span key={zeile} className="block">
            {zeile}
          </span>
        ))}
      </h1>
      <p className="mt-s5 max-w-[27em] text-lead text-schiefer">{copy.hero.lead}</p>
    </main>
  )
}
