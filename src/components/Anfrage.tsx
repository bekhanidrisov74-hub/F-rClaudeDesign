import { copy } from '../content/copy'
import { AnfrageFormular } from './AnfrageFormular'
import { Seitenkasten } from './Seitenkasten'

/** Abschnitt „Anfrage senden“ (Screen 01/02): Formular und Seitenkasten, ab 920 px nebeneinander (Kasten 320 px, ab 1280 px 380 px). */
export function Anfrage() {
  return (
    <section id="anfrage" aria-labelledby="anfrage-titel" className="bg-kalk">
      <div className="wrapper pt-section pb-section-end">
        <div className="mb-s5 flex max-w-[680px] flex-col gap-s4 nav:mb-s7 nav:gap-s3">
          <h2 id="anfrage-titel" className="text-h2">
            {copy.anfrage.titel}
          </h2>
          <p className="text-lead text-schiefer">{copy.anfrage.lead}</p>
        </div>

        <div className="grid items-start gap-s5 nav:grid-cols-[minmax(0,1fr)_320px] hd:grid-cols-[minmax(0,1fr)_380px]">
          <AnfrageFormular />
          <Seitenkasten />
        </div>
      </div>
    </section>
  )
}
