import { copy } from '../content/copy'
import { Seitenrahmen } from './Seitenrahmen'
import { Button } from './ui/Button'

type Rechtsseite = 'impressum' | 'datenschutz' | 'agb' | 'nichtGefunden'

/**
 * Rechtsseiten und die Seite für unbekannte Adressen: Titel in der Größe von --fx-h1, Kanten im Rahmen (wrapper). Der Text bleibt auf lesbarer Zeilenlänge
 * (höchstens 40 em), auch wenn der Rahmen bis 1586 px breit wird.
 * Die `entwuerfe` in copy.rechtliches (bisher nur Datenschutz: Partner-Bewerbungen, Chat mit Luna) stehen als eigene Abschnitte darunter.
 */
export function LegalPage({ seite }: { seite: Rechtsseite }) {
  const inhalt = copy.rechtliches[seite]
  return (
    <Seitenrahmen aufStartseite={false}>
      <div className="wrapper pt-section pb-section-end">
        <h1 className="text-h1">{inhalt.titel}</h1>
        <p className="mt-s5 max-w-[40em] text-body">{inhalt.text}</p>
        {'entwuerfe' in inhalt &&
          inhalt.entwuerfe.map((entwurf) => (
            <section key={entwurf.titel}>
              <h2 className="mt-s7 max-w-[40em] text-h3">{entwurf.titel}</h2>
              {entwurf.absaetze.map((absatz) => (
                <p key={absatz} className="mt-s4 max-w-[40em] text-body">
                  {absatz}
                </p>
              ))}
            </section>
          ))}
        <p className="mt-s5">
          <Button art="textlink" href="/" className="min-h-[44px] min-w-[44px] text-body">
            {copy.rechtliches.zurueck}
          </Button>
        </p>
      </div>
    </Seitenrahmen>
  )
}
