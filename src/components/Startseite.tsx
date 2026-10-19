import { Ablauf } from './Ablauf'
import { Anfrage } from './Anfrage'
import { Fragen } from './Fragen'
import { Hero } from './Hero'
import { Leistungen } from './Leistungen'
import { Preisrechner } from './Preisrechner'
import { Schnellwahl } from './Schnellwahl'
import { Seitenrahmen } from './Seitenrahmen'
import { Zusagen } from './Zusagen'

export function Startseite() {
  return (
    <Seitenrahmen>
      <Hero />
      <Schnellwahl />
      <Leistungen />
      <Ablauf />
      <Preisrechner />
      <Zusagen />
      <Anfrage />
      <Fragen />
    </Seitenrahmen>
  )
}
