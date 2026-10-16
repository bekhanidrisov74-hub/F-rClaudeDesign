import { Ablauf } from './Ablauf'
import { Anfrage } from './Anfrage'
import { Fragen } from './Fragen'
import { Hero } from './Hero'
import { Leistungen } from './Leistungen'
import { Preisrechner } from './Preisrechner'
import { Seitenrahmen } from './Seitenrahmen'
import { Vertrauensleiste } from './Vertrauensleiste'
import { Zusagen } from './Zusagen'

export function Startseite() {
  return (
    <Seitenrahmen>
      <Hero />
      <Vertrauensleiste />
      <Leistungen />
      <Ablauf />
      <Preisrechner />
      <Zusagen />
      <Anfrage />
      <Fragen />
    </Seitenrahmen>
  )
}
