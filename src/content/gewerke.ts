import { cent, euro } from '../lib/preis'
import { copy } from './copy'

// Gewerke: eine Quelle für Schnellwahl, Leistungen, Rechner, Preisübersicht, Formular und Luna.
// Ein neuer Eintrag erscheint überall. Preise in Euro wie im Briefing (SPEC 2); gerechnet wird in Cent.

export type Kategorie = 'technik' | 'handwerk'
export type Abrechnung = 'stunde' | 'einsatz'

export interface Gewerk {
  id: string
  name: string
  /**
   * Pfad der Notfall-Seite ohne Schrägstriche (Bauplan M7): /{seite}/. Klein, mit Bindestrich, ohne Umlaute (.claude/rules/seo.md, Punkt 3).
   * Zu jeder Seite gehören Texte in gewerkseiten.ts (Schlüssel = id).
   */
  seite: string
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
  /** Bildausschnitt der Karte (object-position): hält Hände und Werkzeug im Zuschnitt 16:9 (Handy) und 4:3 (ab 920 px) */
  bildFokus: string
  /** Flaches Icon im Stil des Hero: design/icons/{icon}.svg (im Lagune-Kreis, ui/IconKreis) */
  icon: string
  /** Luna-Erfolg: „Wir geben sie jetzt an einen passenden {betrieb} in Ihrer Nähe weiter.“ (nicht im Design, Frage 2) */
  betrieb: string
  /** Sicherheitstipp in Luna Schritt 3 (SPEC 8, Vorschlag) */
  tipp: string
  /** Sicherheitstipp in der Luna-Erfolgskarte „Bis der Betrieb kommt:“ (SPEC 8, Vorschlag) */
  tippErfolg: string
}

const GASNOTRUF = 'Riecht es nach Gas, öffnen Sie die Fenster, betätigen Sie keine Schalter und rufen Sie den Gasnotruf 128.'

/**
 * Stand der Richtpreise (Werte aus dem Briefing, zuletzt geändert am 13.10.2026). Bei jeder Preisänderung anpassen.
 * Bauplan M5, von Beks bestätigt am 22.10.2026.
 */
export const PREISE_STAND = 'Oktober 2026'

export const gewerke: Gewerk[] = [
  {
    id: 'installateur',
    name: 'Installateur',
    seite: 'installateur',
    kategorie: 'handwerk',
    abrechnung: 'stunde',
    min: 95,
    max: 140,
    anfahrt: 29.9,
    schnellwahl: 'Rohrbruch, WC verstopft',
    karte: 'Rohrbruch, WC oder Abfluss verstopft, tropfende Armatur',
    bild: 2,
    bildFokus: '50% 40%',
    icon: 'gewerk-installateur',
    betrieb: 'Installateur',
    tipp: 'Falls möglich, drehen Sie den Hauptwasserhahn zu.',
    tippErfolg: 'Drehen Sie, wenn möglich, den Hauptwasserhahn zu und halten Sie Abstand zu nassen Steckdosen.',
  },
  {
    id: 'shk',
    name: 'Heizung & Klima',
    seite: 'heizung-klima',
    kategorie: 'technik',
    abrechnung: 'stunde',
    min: 95,
    max: 140,
    anfahrt: 29.9,
    schnellwahl: 'Therme aus, kein Warmwasser',
    karte: 'Therme fällt aus, kein Warmwasser, Klimaanlage',
    bild: 3,
    bildFokus: '65% 25%',
    icon: 'gewerk-heizung-und-klima',
    betrieb: 'Fachbetrieb für Heizung und Klima',
    tipp: GASNOTRUF,
    tippErfolg: GASNOTRUF,
  },
  {
    id: 'schluessel',
    name: 'Schlüsseldienst',
    seite: 'schluesseldienst',
    kategorie: 'handwerk',
    abrechnung: 'einsatz',
    min: 80,
    max: 180,
    anfahrt: 19.9,
    schnellwahl: 'Ausgesperrt, Schloss defekt',
    karte: 'Ausgesperrt, Schlüssel abgebrochen, Schloss tauschen',
    bild: 4,
    bildFokus: '50% 50%',
    icon: 'gewerk-schluesseldienst',
    betrieb: 'Schlüsseldienst',
    tipp: 'Halten Sie, wenn möglich, einen Ausweis bereit.',
    tippErfolg: 'Der Betrieb fragt nach einem Nachweis, dass Sie dort wohnen.',
  },
  {
    id: 'elektro',
    name: 'Elektro',
    seite: 'elektriker',
    kategorie: 'technik',
    abrechnung: 'stunde',
    min: 90,
    max: 140,
    anfahrt: 29.9,
    schnellwahl: 'Strom weg, FI-Schalter fliegt',
    karte: 'Stromausfall, FI-Schalter fliegt, Steckdose defekt',
    bild: 5,
    bildFokus: '50% 22%',
    icon: 'gewerk-elektro',
    betrieb: 'Elektriker',
    tipp: 'Berühren Sie keine beschädigten Kabel oder nassen Geräte.',
    tippErfolg: 'Schalten Sie, wenn möglich, die betroffene Sicherung aus.',
  },
  {
    id: 'geraete',
    name: 'Haushaltsgeräte',
    seite: 'haushaltsgeraete',
    kategorie: 'technik',
    abrechnung: 'stunde',
    min: 90,
    max: 130,
    anfahrt: 29.9,
    schnellwahl: 'Waschmaschine, Herd, Kühlschrank',
    karte: 'Waschmaschine, Geschirrspüler, Herd, Kühlschrank',
    bild: 6,
    bildFokus: '50% 56%',
    icon: 'gewerk-haushaltsgeraete',
    betrieb: 'Fachbetrieb für Haushaltsgeräte',
    tipp: 'Trennen Sie das Gerät, wenn möglich, vom Strom.',
    tippErfolg: 'Bei Waschmaschine oder Geschirrspüler auch den Wasserhahn zudrehen.',
  },
]

/** Anzeige der Richtpreis-Spanne in ganzen Euro, z. B. „95–140 €“ (Leistungen, Preisübersicht, Luna). */
/**
 * Sprungziel im Abschnitt Anfrage je Gewerk (Schnellwahl, „… anfragen“). Das Gewerk steht so in der Adresse: Wer tippt, bevor
 * JavaScript geladen ist, landet trotzdem am Formular, und es wählt das Gewerk beim Hydrieren vor (Audit-Befund A4).
 */
export const anfrageAnker = (id: string) => `anfrage-${id}`

export const spanne = (g: Gewerk) => `${g.min}–${g.max} €`
/** „pro Stunde“ bzw. „pro Einsatz“ */
export const einheit = (g: Gewerk) => copy.einheit[g.abrechnung]
/** Anfahrt mit zwei Nachkommastellen, z. B. „29,90 €“ */
export const anfahrtText = (g: Gewerk) => euro(cent(g.anfahrt))

const ZAHLWOERTER = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf']
/** „diese fünf Bereiche“ zählt mit, wenn ein Gewerk dazukommt. */
export const zahlwort = (n: number) => ZAHLWOERTER[n] ?? String(n)
