import { copy } from '../content/copy'

/**
 * So funktioniert's als kräftiger Tiefsee-Anker zwischen den hellen Abschnitten: drei Schritte nebeneinander über einer
 * Grundlinie, die große Ziffer im Orange von „Rund um die Uhr.“ (auf Tiefsee 5,3:1). Beim Hinscrollen zieht eine türkise
 * Linie über die Grundlinie (app.css, schritt). Weiß und Nebel kommen aus der Fläche (app.css, dunkel).
 * Ohne Props die Schritte der Startseite; die Seite „Partner werden“ gibt eigene Schritte mit.
 */
export function Ablauf({
  id = 'ablauf',
  titel = copy.ablauf.titel,
  schritte = copy.ablauf.schritte,
}: {
  id?: string
  titel?: string
  schritte?: readonly { titel: string; text: string }[]
}) {
  return (
    <section id={id} aria-labelledby={`${id}-titel`} className="dunkel">
      <div className="wrapper flex flex-col gap-s6 pt-section pb-section-end nav:gap-s7">
        <h2 id={`${id}-titel`} className="text-h2">
          {titel}
        </h2>
        {/* role="list": Safari/VoiceOver behält die Listensemantik sonst nicht, wenn list-style entfällt */}
        <ol role="list" className="grid grid-cols-1 gap-y-s6 nav:grid-cols-3 nav:gap-x-s6 nav:gap-y-s7">
          {schritte.map((schritt, index) => (
            <li key={schritt.titel} className="schritt relative flex flex-col gap-s3 border-t-2 border-linie-dunkel pt-s4 nav:pt-s5">
              <span aria-hidden="true" data-ziffer className="font-display text-step-nr font-extrabold leading-[0.9] text-orange">
                {index + 1}
              </span>
              <h3 className="text-h3">{schritt.titel}</h3>
              <p className="text-body text-nebel">{schritt.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
