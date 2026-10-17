import { cent, euro } from '../lib/preis'
import { copy } from './copy'

// Gewerke: eine Quelle für Schnellwahl, Leistungen, Rechner, Preisübersicht, Formular und Luna.
// Ein neuer Eintrag erscheint überall. Preise in Euro wie im Briefing (SPEC 2); gerechnet wird in Cent.

export type Kategorie = 'technik' | 'handwerk'
export type Abrechnung = 'stunde' | 'einsatz'

export interface Gewerk {
  id: string
  name: string
  /** Hauptfarbe des 3D-Icons: technik = Petrol, handwerk = Orange (SPEC 3) */
  kategorie: Kategorie
  abrechnung: Abrechnung
  min: number
  max: number
  anfahrt: number
  /** Unterzeile der Schnellwahl-Kachel */
  schnellwahl: string
  /** Text der Leistungskarte */
  karte: string
  /** Bildnummer laut IMAGE-BRIEFS.md (public/images/bild-N.webp) */
  bild: number
  /** 3D-Icon: design/icons-3d/{icon}.png, auf der Seite public/icons/{icon}-{Breite}.avif|webp */
  icon: string
  /** Luna-Erfolg: „Wir geben sie jetzt an einen passenden {betrieb} in Ihrer Nähe weiter.“ (nicht im Design, Frage 2) */
  betrieb: string
  /** Sicherheitstipp in Luna Schritt 3 (SPEC 8, Vorschlag) */
  tipp: string
  /** Sicherheitstipp in der Luna-Erfolgskarte „Bis der Betrieb kommt:“ (SPEC 8, Vorschlag) */
  tippErfolg: string
}

const GASNOTRUF = 'Riecht es nach Gas, öffnen Sie die Fenster, betätigen Sie keine Schalter und rufen Sie den Gasnotruf 128.'

export const gewerke: Gewerk[] = [
  {
    id: 'installateur',
    name: 'Installateur',
    kategorie: 'handwerk',
    abrechnung: 'stunde',
    min: 95,
    max: 140,
    anfahrt: 29.9,
    schnellwahl: 'Rohrbruch, WC verstopft',
    karte: 'Rohrbruch, WC oder Abfluss verstopft, tropfende Armatur',
    bild: 2,
    icon: 'gewerk-installateur',
    betrieb: 'Installateur',
    tipp: 'Falls möglich, drehen Sie den Hauptwasserhahn zu.',
    tippErfolg: 'Drehen Sie, wenn möglich, den Hauptwasserhahn zu und halten Sie Abstand zu nassen Steckdosen.',
  },
  {
    id: 'shk',
    name: 'Heizung & Klima',
    kategorie: 'technik',
    abrechnung: 'stunde',
    min: 95,
    max: 140,
    anfahrt: 29.9,
    schnellwahl: 'Therme aus, kein Warmwasser',
    karte: 'Therme fällt aus, kein Warmwasser, Klimaanlage',
    bild: 3,
    icon: 'gewerk-heizung-und-klima',
    betrieb: 'Fachbetrieb für Heizung und Klima',
    tipp: GASNOTRUF,
    tippErfolg: GASNOTRUF,
  },
  {
    id: 'schluessel',
    name: 'Schlüsseldienst',
    kategorie: 'handwerk',
    abrechnung: 'einsatz',
    min: 80,
    max: 180,
    anfahrt: 19.9,
    schnellwahl: 'Ausgesperrt, Schloss defekt',
    karte: 'Ausgesperrt, Schlüssel abgebrochen, Schloss tauschen',
    bild: 4,
    icon: 'gewerk-schluesseldienst',
    betrieb: 'Schlüsseldienst',
    tipp: 'Halten Sie, wenn möglich, einen Ausweis bereit.',
    tippErfolg: 'Der Betrieb fragt nach einem Nachweis, dass Sie dort wohnen.',
  },
  {
    id: 'elektro',
    name: 'Elektro',
    kategorie: 'technik',
    abrechnung: 'stunde',
    min: 90,
    max: 140,
    anfahrt: 29.9,
    schnellwahl: 'Strom weg, FI-Schalter fliegt',
    karte: 'Stromausfall, FI-Schalter fliegt, Steckdose defekt',
    bild: 5,
    icon: 'gewerk-elektro',
    betrieb: 'Elektriker',
    tipp: 'Berühren Sie keine beschädigten Kabel oder nassen Geräte.',
    tippErfolg: 'Schalten Sie, wenn möglich, die betroffene Sicherung aus.',
  },
  {
    id: 'geraete',
    name: 'Haushaltsgeräte',
    kategorie: 'technik',
    abrechnung: 'stunde',
    min: 90,
    max: 130,
    anfahrt: 29.9,
    schnellwahl: 'Waschmaschine, Herd, Kühlschrank',
    karte: 'Waschmaschine, Geschirrspüler, Herd, Kühlschrank',
    bild: 6,
    icon: 'gewerk-haushaltsgeraete',
    betrieb: 'Fachbetrieb für Haushaltsgeräte',
    tipp: 'Trennen Sie das Gerät, wenn möglich, vom Strom.',
    tippErfolg: 'Bei Waschmaschine oder Geschirrspüler auch den Wasserhahn zudrehen.',
  },
]

/** Anzeige der Richtpreis-Spanne in ganzen Euro, z. B. „95–140 €“ (Leistungen, Preisübersicht, Luna). */
export const spanne = (g: Gewerk) => `${g.min}–${g.max} €`
/** „pro Stunde“ bzw. „pro Einsatz“ */
export const einheit = (g: Gewerk) => copy.einheit[g.abrechnung]
/** Anfahrt mit zwei Nachkommastellen, z. B. „29,90 €“ */
export const anfahrtText = (g: Gewerk) => euro(cent(g.anfahrt))

const ZAHLWOERTER = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf']
/** „diese fünf Bereiche“ zählt mit, wenn ein Gewerk dazukommt. */
export const zahlwort = (n: number) => ZAHLWOERTER[n] ?? String(n)
