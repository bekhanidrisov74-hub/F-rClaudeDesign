import { copy } from '../content/copy'

type Rechtsseite = 'impressum' | 'datenschutz' | 'agb'

export function LegalPage({ seite }: { seite: Rechtsseite }) {
  const inhalt = copy.rechtliches[seite]
  return (
    <main className="wrapper py-section">
      <h1 className="m-0 text-h2">{inhalt.titel}</h1>
      <p className="mt-s5 text-body">{inhalt.text}</p>
      <p className="mt-s5">
        <a href="/" className="text-body font-bold underline">
          {copy.rechtliches.zurueck}
        </a>
      </p>
    </main>
  )
}
