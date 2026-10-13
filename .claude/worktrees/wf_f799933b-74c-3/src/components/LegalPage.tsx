import { copy } from '../content/copy'
import { Seitenrahmen } from './Seitenrahmen'
import { Button } from './ui/Button'

type Rechtsseite = 'impressum' | 'datenschutz' | 'agb'

export function LegalPage({ seite }: { seite: Rechtsseite }) {
  const inhalt = copy.rechtliches[seite]
  return (
    <Seitenrahmen aufStartseite={false}>
      <div className="wrapper pt-section pb-section-end">
        <h1 className="text-h2">{inhalt.titel}</h1>
        <p className="mt-s5 text-body">{inhalt.text}</p>
        <p className="mt-s5">
          <Button art="textlink" href="/" className="min-h-[44px] min-w-[44px] text-body">
            {copy.rechtliches.zurueck}
          </Button>
        </p>
      </div>
    </Seitenrahmen>
  )
}
