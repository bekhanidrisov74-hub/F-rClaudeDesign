import type { ReactNode } from 'react'
import { copy } from '../content/copy'
import { Button } from './ui/Button'
import { Icon } from './ui/Icon'

/**
 * Abschnitt „Häufige Fragen“ (nicht im Design) im Stil des Hero: weiße Karten mit weichem Schatten auf dem Eis-Band
 * (die Haarlinie allein ist gegen Eis kaum zu sehen), der Pfeil im Lagune-Kreis.
 * Natives <details>; gleicher name = immer nur eine Antwort offen.
 * Ab 920 px bleibt die linke Spalte (Titel + Lead) unter dem Kopf stehen, solange rechts die Liste läuft; sonst bliebe sie leer.
 * Ohne Props die Fragen der Startseite; „Partner werden“ gibt eigene mit. `zusatz` steht unter der Liste.
 * Ein Eintrag kann unter der Antwort einen Link tragen (`link`, z. B. mailto bei „Beschwerde“).
 */
export function Fragen({
  id = 'fragen',
  titel = copy.fragen.titel,
  lead = copy.fragen.lead,
  liste = copy.fragen.liste,
  zusatz,
}: {
  id?: string
  titel?: string
  lead?: string
  liste?: readonly { frage: string; antwort: string; link?: { text: string; href: string } }[]
  zusatz?: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-titel`} className="bg-eis text-tiefsee">
      <div className="wrapper grid gap-s5 pt-section pb-section-end nav:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] nav:gap-s8">
        <div className="flex flex-col gap-s4 nav:sticky nav:top-[calc(var(--fx-kopf)+var(--fx-s-6))] nav:gap-s3 nav:self-start">
          <h2 id={`${id}-titel`} className="text-h2">
            {titel}
          </h2>
          <p className="text-lead text-schiefer">{lead}</p>
        </div>
        <div className="flex flex-col gap-s3">
          {liste.map((f) => (
            <details
              key={f.frage}
              name={id}
              className="frage group rounded-card border border-linie bg-weiss shadow-karte transition-[border-color] duration-(--fx-dur-fast) hover:border-rand open:border-rand"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-s4 rounded-card px-s5 py-s4 [&::-webkit-details-marker]:hidden">
                <span className="font-display text-h5 font-semibold">{f.frage}</span>
                <span className="flex size-s7 shrink-0 items-center justify-center rounded-pill bg-lagune text-tiefsee transition-colors duration-(--fx-dur-fast) group-open:bg-tiefsee group-open:text-weiss">
                  <Icon
                    name="ui-aufklappen"
                    className="size-[22px] transition-transform duration-(--fx-dur-chat) ease-fx group-open:rotate-180"
                  />
                </span>
              </summary>
              <p className={`px-s5 text-body text-schiefer ${f.link ? '' : 'pb-s5'}`}>{f.antwort}</p>
              {f.link && (
                <div className="px-s5 pb-s4">
                  <Button art="textlink" href={f.link.href} className="min-h-[44px] min-w-[44px] text-body text-tiefsee">
                    {f.link.text}
                  </Button>
                </div>
              )}
            </details>
          ))}
          {zusatz}
        </div>
      </div>
    </section>
  )
}
