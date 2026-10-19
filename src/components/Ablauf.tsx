import { copy } from '../content/copy'

/**
 * So funktioniert's im Stil des Hero: helle Fläche, drei Schritte nebeneinander über einer Haarlinie, die große Ziffer im
 * Orange von „Rund um die Uhr.“. Beim Hinscrollen zieht eine türkise Linie über die Schritte (app.css, schritt).
 */
export function Ablauf() {
  return (
    <section id="ablauf" aria-labelledby="ablauf-titel" className="bg-kalk text-tiefsee">
      <div className="wrapper flex flex-col gap-s6 pt-section pb-section-end nav:gap-s7">
        <h2 id="ablauf-titel" className="text-h2">
          {copy.ablauf.titel}
        </h2>
        {/* role="list": Safari/VoiceOver behält die Listensemantik sonst nicht, wenn list-style entfällt */}
        <ol role="list" className="grid grid-cols-1 gap-y-s6 nav:grid-cols-3 nav:gap-x-s6 nav:gap-y-s7">
          {copy.ablauf.schritte.map((schritt, index) => (
            <li key={schritt.titel} className="schritt relative flex flex-col gap-s3 border-t-2 border-linie pt-s4 nav:pt-s5">
              <span aria-hidden="true" data-ziffer className="font-display text-step-nr font-extrabold leading-[0.9] text-orange">
                {index + 1}
              </span>
              <h3 className="text-h3">{schritt.titel}</h3>
              <p className="text-body text-schiefer">{schritt.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
