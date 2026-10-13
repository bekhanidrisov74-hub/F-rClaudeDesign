import { copy } from '../content/copy'
import { Footer } from './Footer'
import { Header } from './Header'
import { MobileMenu } from './MobileMenu'
import { Button } from './ui/Button'

type Rechtsseite = 'impressum' | 'datenschutz' | 'agb'

export function LegalPage({ seite }: { seite: Rechtsseite }) {
  const inhalt = copy.rechtliches[seite]
  return (
    <>
      <Header aufStartseite={false} />
      <MobileMenu />
      <main className="wrapper pb-section-end pt-section">
        <h1 className="m-0 text-h2">{inhalt.titel}</h1>
        <p className="mt-s5 text-body">{inhalt.text}</p>
        <p className="mt-s5">
          <Button art="textlink" href="/" className="min-h-[44px] min-w-[44px] text-body">
            {copy.rechtliches.zurueck}
          </Button>
        </p>
      </main>
      <Footer />
    </>
  )
}
