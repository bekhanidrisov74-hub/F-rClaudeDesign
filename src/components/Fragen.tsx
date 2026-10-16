import { copy } from '../content/copy'
import { Icon } from './ui/Icon'

/** Abschnitt „Häufige Fragen“ (nicht im Design). Natives <details>; gleicher name = immer nur eine Antwort offen. */
export function Fragen() {
  return (
    <section id="fragen" aria-labelledby="fragen-titel" className="border-t border-linie bg-weiss">
      <div className="wrapper grid gap-s5 pt-section pb-section-end nav:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] nav:gap-s8">
        <div className="flex flex-col gap-s4 nav:gap-s3">
          <h2 id="fragen-titel" className="text-h2">
            {copy.fragen.titel}
          </h2>
          <p className="text-lead text-schiefer">{copy.fragen.lead}</p>
        </div>
        <div className="flex flex-col gap-s3">
          {copy.fragen.liste.map((f) => (
            <details
              key={f.frage}
              name="fragen"
              className="frage group rounded-card border border-linie bg-kalk transition-colors duration-[var(--fx-dur-fast)] open:border-rand"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-s4 rounded-card px-s5 py-s4 [&::-webkit-details-marker]:hidden">
                <span className="font-display text-h5 font-bold [font-stretch:96%]">{f.frage}</span>
                <span className="flex size-s7 shrink-0 items-center justify-center rounded-icon bg-weiss text-tiefsee transition-colors duration-[var(--fx-dur-fast)] group-open:bg-tiefsee group-open:text-kalk">
                  <Icon
                    name="ui-aufklappen"
                    className="size-[22px] transition-transform duration-[var(--fx-dur-chat)] ease-fx group-open:rotate-180"
                  />
                </span>
              </summary>
              <p className="px-s5 pb-s5 text-body text-schiefer">{f.antwort}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
