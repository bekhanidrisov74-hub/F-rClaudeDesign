import { copy } from '../content/copy'

export function Ablauf() {
  return (
    <section id="ablauf" aria-labelledby="ablauf-titel" className="relative isolate overflow-clip bg-tiefsee text-kalk">
      {/* Weiches Leuchten hinter den Schritten, wie im Fuß; gedämpft, damit Anrufen das Auffälligste bleibt */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-1/2 -right-1/4 -z-1 aspect-square w-full rounded-pill bg-radial from-leuchten to-transparent to-70% nav:w-3/5"
      />
      <div className="wrapper flex flex-col gap-s6 pt-section pb-section-end nav:gap-s7">
        <h2 id="ablauf-titel" className="text-h2">
          {copy.ablauf.titel}
        </h2>
        {/* role="list": Safari/VoiceOver behält die Listensemantik sonst nicht, wenn list-style entfällt */}
        <ol role="list" className="grid grid-cols-1 gap-y-s5 nav:grid-cols-3 nav:gap-x-s6 nav:gap-y-s7">
          {copy.ablauf.schritte.map((schritt, index) => (
            <li key={schritt.titel} className="schritt relative flex flex-col gap-s3 border-t-2 border-tiefsee-2 pt-s4 nav:pt-s5">
              <span
                aria-hidden="true"
                data-ziffer
                className="font-display text-step-nr font-bold leading-[0.9] text-tuerkis [font-stretch:96%]"
              >
                {index + 1}
              </span>
              <h3 className="text-h3 font-[750] [font-stretch:100%]">{schritt.titel}</h3>
              <p className="text-body text-nebel">{schritt.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
