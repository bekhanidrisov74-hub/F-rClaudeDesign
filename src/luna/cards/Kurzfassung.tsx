import { useId } from 'react'
import { copy } from '../../content/copy'
import { kurzfassung, type Anfrage, type Kontakt } from '../flow'

// Screen 10 und 12: „Ihre Anfrage“ in einem Satz (kurzfassung() aus flow.ts), über Erfolg bzw. Sendefehler.
export function Kurzfassung({ anfrage, kontakt }: { anfrage: Anfrage; kontakt: Kontakt }) {
  const titelId = `${useId()}-titel`
  return (
    <section aria-labelledby={titelId} className="flex flex-col gap-s2 rounded-card border border-linie bg-weiss p-s4">
      <h2 id={titelId} className="font-display text-h5 dialog:text-btn-l">
        {copy.luna.zusammenfassung.titel}
      </h2>
      <p className="text-small text-schiefer">{kurzfassung(anfrage, kontakt)}</p>
    </section>
  )
}
