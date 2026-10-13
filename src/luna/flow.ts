// Luna: geführter Ablauf ohne KI (SPEC 8). Reine Logik ohne React, in Vitest ohne DOM testbar.
// Die Oberfläche spricht nur über `Responder` mit dem Ablauf. Eine KI-Anbindung ersetzt später
// `gefuehrt` durch eine eigene Umsetzung, die über eine Server-Funktion läuft (Schlüssel nie im Browser).
import { AUFTRAG_AUFGEGEBEN, copy, dringlichkeit, fuelle, WEISS_NICHT } from '../content/copy'
import { gewerke, type Gewerk } from '../content/gewerke'
import type { Dringlichkeit, LeadDaten } from '../lib/submitLead'
import { ortZuPlz, teileNameTelefon, teilePlzOrt } from '../lib/validate'

const t = copy.luna

export type Schritt = 'gewerk' | 'problem' | 'plz' | 'dringlichkeit' | 'kontakt' | 'zusammenfassung' | 'erfolg' | 'fehler'

export interface Nachricht {
  von: 'luna' | 'nutzer'
  text: string
}

export interface Angaben {
  gewerk: Gewerk | null
  /** Anzeige: Name des Gewerks, „Weiß ich nicht“ oder der Freitext */
  gewerkText: string
  problem: string
  plz: string
  ort: string
  dringlichkeit: Dringlichkeit | null
  /** Anzeige in der Zusammenfassung: „Sofort, Notfall“ oder der Freitext */
  dringlichkeitText: string
  name: string
  telefon: string
}

export interface Zustand {
  schritt: Schritt
  verlauf: Nachricht[]
  angaben: Angaben
  anfragenummer: string
}

/** Fragen 1–5 */
const FRAGEN: Schritt[] = ['gewerk', 'problem', 'plz', 'dringlichkeit', 'kontakt']
export const ANZAHL_FRAGEN = FRAGEN.length

const LEER: Angaben = {
  gewerk: null,
  gewerkText: '',
  problem: '',
  plz: '',
  ort: '',
  dringlichkeit: null,
  dringlichkeitText: '',
  name: '',
  telefon: '',
}

export function start(): Zustand {
  return { schritt: 'gewerk', verlauf: [{ von: 'luna', text: t.fragen.gewerk }], angaben: LEER, anfragenummer: '' }
}

/** Auswahl-Chips der aktuellen Frage (leer, wenn nur Freitext gefragt ist). */
export function auswahl(z: Zustand): string[] {
  if (z.schritt === 'gewerk') return [...gewerke.map((g) => g.name), WEISS_NICHT]
  if (z.schritt === 'dringlichkeit') return dringlichkeit.map((d) => d.chip)
  return []
}

/** Fortschritt 1–5 (Frage x von 5). Zusammenfassung = 5, nach dem Senden kein Balken (null). */
export function fortschritt(z: Zustand): number | null {
  if (z.schritt === 'zusammenfassung') return ANZAHL_FRAGEN
  const i = FRAGEN.indexOf(z.schritt)
  return i < 0 ? null : i + 1
}

/** Bisherige Antwort auf die aktuelle Frage, zum Vorbelegen nach „Angaben ändern“. */
export function vorschlag(z: Zustand): string {
  const a = z.angaben
  if (z.schritt === 'problem') return a.problem
  if (z.schritt === 'plz') return a.plz ? `${a.plz}${a.ort ? ` ${a.ort}` : ''}` : ''
  if (z.schritt === 'kontakt') return [a.name, a.telefon].filter(Boolean).join(', ')
  return ''
}

const mit = (z: Zustand, eingabe: string, antworten: string[], schritt: Schritt, angaben: Partial<Angaben> = {}): Zustand => ({
  ...z,
  schritt,
  angaben: { ...z.angaben, ...angaben },
  verlauf: [...z.verlauf, { von: 'nutzer', text: eingabe }, ...antworten.map((text) => ({ von: 'luna' as const, text }))],
})

function frageZu(schritt: 'plz', a: Angaben): string {
  return fuelle(t.fragen[schritt], { tipp: a.gewerk ? `${a.gewerk.tipp} ` : '' })
}

/** Verarbeitet eine Antwort (Chip-Text oder Freitext) und stellt die nächste Frage. */
export function antworte(z: Zustand, roh: string): Zustand {
  const eingabe = roh.trim()
  if (!eingabe) return z
  const klein = eingabe.toLocaleLowerCase('de-AT')

  switch (z.schritt) {
    case 'gewerk': {
      const gewerk = gewerke.find((g) => g.name.toLocaleLowerCase('de-AT') === klein || g.id === klein) ?? null
      const angaben = { gewerk, gewerkText: gewerk?.name ?? eingabe }
      return mit(z, eingabe, [t.fragen.problem], 'problem', angaben)
    }
    case 'problem':
      return mit(z, eingabe, [frageZu('plz', z.angaben)], 'plz', { problem: eingabe })
    case 'plz': {
      const geteilt = teilePlzOrt(eingabe)
      if (!geteilt) return mit(z, eingabe, [t.plzFehler], 'plz')
      return mit(z, eingabe, [t.fragen.dringlichkeit], 'dringlichkeit', { plz: geteilt.plz, ort: geteilt.ort || ortZuPlz(geteilt.plz) })
    }
    case 'dringlichkeit': {
      const d = dringlichkeit.find((x) => x.chip.toLocaleLowerCase('de-AT') === klein) ?? null
      return mit(z, eingabe, [t.fragen.kontakt], 'kontakt', {
        dringlichkeit: d?.id ?? null,
        dringlichkeitText: d?.zusammenfassung ?? eingabe,
      })
    }
    case 'kontakt': {
      const { name, telefon } = teileNameTelefon(eingabe)
      const angaben = { name: name || z.angaben.name, telefon: telefon || z.angaben.telefon }
      if (!angaben.telefon) return mit(z, eingabe, [t.telefonFehlt], 'kontakt', angaben)
      if (!angaben.name) return mit(z, eingabe, [t.nameFehlt], 'kontakt', angaben)
      return mit(z, eingabe, [], 'zusammenfassung', angaben)
    }
    case 'zusammenfassung':
    case 'fehler':
      // Freitext nach der letzten Frage ergänzt die Problembeschreibung (nicht im Design festgelegt).
      return mit(z, eingabe, [], z.schritt, { problem: `${z.angaben.problem} ${eingabe}`.trim() })
    case 'erfolg':
      return z
  }
}

/** „Angaben ändern“: zurück zu Frage 2, alle Angaben bleiben erhalten (SPEC 8). */
export function aendern(z: Zustand): Zustand {
  return { ...z, schritt: 'problem', verlauf: [...z.verlauf, { von: 'luna', text: t.fragen.problem }] }
}

/** Daten für submitLead. Freitext statt Chip landet in der Beschreibung (PLAN.md, Payload-Regeln). */
export function zuLead(z: Zustand): LeadDaten {
  const a = z.angaben
  const feld = t.zusammenfassung.felder
  const zusatz = [
    !a.gewerk && a.gewerkText && a.gewerkText !== WEISS_NICHT ? `${feld.gewerk}: ${a.gewerkText}` : '',
    !a.dringlichkeit && a.dringlichkeitText ? `${feld.dringlichkeit}: ${a.dringlichkeitText}` : '',
  ].filter(Boolean)
  return {
    quelle: 'luna',
    gewerk: a.gewerk?.id ?? null,
    beschreibung: [a.problem, ...zusatz].join('\n'),
    plz: a.plz,
    ort: a.ort,
    dringlichkeit: a.dringlichkeit,
    name: a.name,
    telefon: a.telefon,
    einwilligung: true,
  }
}

/** Nach dem Absenden: Echo „Auftrag aufgegeben“ und Erfolg bzw. Fehler. */
export function gesendet(z: Zustand, ergebnis: { anfragenummer: string } | null): Zustand {
  const echo = z.schritt === 'fehler' ? [] : [{ von: 'nutzer' as const, text: AUFTRAG_AUFGEGEBEN }]
  return ergebnis
    ? { ...z, schritt: 'erfolg', anfragenummer: ergebnis.anfragenummer, verlauf: [...z.verlauf, ...echo] }
    : { ...z, schritt: 'fehler', verlauf: [...z.verlauf, ...echo] }
}

/** Kurzfassung „Ihre Anfrage“: „Installateur, 1020 Wien, sofort. Unter der Spüle tritt Wasser aus. Maria Huber, 0664 …“ */
export function kurzfassung(a: Angaben): string {
  const ort = [a.plz, a.ort].filter(Boolean).join(' ')
  const dring = dringlichkeit.find((d) => d.id === a.dringlichkeit)?.kurz ?? a.dringlichkeitText
  const problem = /[.!?]$/.test(a.problem) ? a.problem : `${a.problem}.`
  return `${[a.gewerkText, ort, dring].filter(Boolean).join(', ')}. ${problem} ${a.name}, ${a.telefon}`
}

/** Schnittstelle der Oberfläche zum Ablauf. Asynchron, damit später eine KI-Antwort passt. */
export interface Responder {
  start: () => Zustand
  antworte: (z: Zustand, eingabe: string) => Promise<Zustand>
}

export const gefuehrt: Responder = { start, antworte: async (z, eingabe) => antworte(z, eingabe) }
