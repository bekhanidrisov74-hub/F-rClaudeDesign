import { Ablauf } from './Ablauf'
import { Footer } from './Footer'
import { Header } from './Header'
import { Hero } from './Hero'
import { Leistungen } from './Leistungen'
import { MobileMenu } from './MobileMenu'
import { Vertrauensleiste } from './Vertrauensleiste'

export function Startseite() {
  return (
    <>
      <Header />
      <MobileMenu />
      <main>
        <Hero />
        <Vertrauensleiste />
        <Leistungen />
        <Ablauf />
      </main>
      <Footer />
    </>
  )
}
