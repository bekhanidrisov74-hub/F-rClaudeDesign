// Prüfregeln und Versand der Partner-Bewerbung (/partner-werden/) an public/anfrage.php mit art=partner.
// Die Felder entsprechen dem Eintrag in der Partnerliste (docs/analyse/partner-werden-bestand.md, Abschnitt 3);
// die Aufnahme in die Liste macht Beks von Hand.
import { fuelle } from '../content/copy'
import { partner } from '../content/partner'
import { posteAnEingang } from './submitLead'
import { istTelefon } from './validate'

const f = partner.bewerbung.felder
const fehler = partner.bewerbung.fehler

/** Höchstens so viele Postleitzahlen je Bewerbung; public/anfrage.php prüft dieselbe Grenze (400 × 5 Zeichen < 2000 je Feld). */
export const MAX_PLZ = 400
/** Längste Eingabe je Textfeld, wie MAX_FELD in public/anfrage.php */
export const MAX_FELD = 2000

/** Wie EMAIL_RE in public/anfrage.php: ohne , ; < > " ( ), weil die Adresse in mail() landet. Sonst lehnt der Server ab. */
export const istBetriebsEmail = (text: string) => /^[^@\s,;<>"()]+@[^@\s,;<>"()]+\.[a-zA-Z]{2,}$/.test(text.trim())

export const ZEIT_IDS: readonly string[] = f.zeiten.optionen.map((o) => o.id)
export const REAKTION_IDS: readonly string[] = f.reaktionszeit.optionen.map((o) => o.id)

export interface Bewerbung {
  firma: string
  ansprechperson: string
  telefon: string
  email: string
  /** eine oder mehrere GISA-Zahlen, getrennt durch Komma */
  gisa: string
  uid: string
  /** ids aus gewerke.ts */
  gewerke: string[]
  /** Eingabe wie getippt: Postleitzahlen und Bereiche (1010–1230) */
  plz: string
  /** ids aus partner.bewerbung.felder.zeiten */
  zeiten: string[]
  notdienst: string
  /** Minuten oder '' */
  reaktionszeit: string
  richtpreise: string
  abweichungen: string
  haftpflicht: string
  preisVorab: string
  unbar: string
  anmerkungen: string
  einwilligung: boolean
}

export type BewerbungFeld = keyof Bewerbung

export const LEERE_BEWERBUNG: Bewerbung = {
  firma: '',
  ansprechperson: '',
  telefon: '',
  email: '',
  gisa: '',
  uid: '',
  gewerke: [],
  plz: '',
  zeiten: [],
  notdienst: '',
  reaktionszeit: '',
  richtpreise: '',
  abweichungen: '',
  haftpflicht: '',
  preisVorab: '',
  unbar: '',
  anmerkungen: '',
  einwilligung: false,
}

/** Felder in Formular-Reihenfolge (der erste Fehler bekommt beim Absenden den Fokus) */
export const FELDER: BewerbungFeld[] = [
  'firma',
  'ansprechperson',
  'telefon',
  'email',
  'gisa',
  'uid',
  'gewerke',
  'plz',
  'zeiten',
  'notdienst',
  'reaktionszeit',
  'richtpreise',
  'abweichungen',
  'haftpflicht',
  'preisVorab',
  'unbar',
  'anmerkungen',
  'einwilligung',
]

/** „123 456 78, 98765432“ → ['12345678', '98765432']; null, wenn eine Zahl nicht 5 bis 10 Ziffern hat. */
export function gisaZahlen(eingabe: string): string[] | null {
  const zahlen = eingabe
    .split(/[,;]/)
    .map((z) => z.replace(/\s/g, ''))
    .filter(Boolean)
  return zahlen.length && zahlen.every((z) => /^\d{5,10}$/.test(z)) ? zahlen : null
}

/** UID-Nummer in der Schreibweise ATU12345678; '' bleibt '' (optional); null, wenn das Format nicht stimmt. */
export function uidNummer(eingabe: string): string | null {
  const uid = eingabe.replace(/\s/g, '').toUpperCase()
  return uid === '' || /^ATU\d{8}$/.test(uid) ? uid : null
}

/**
 * Einsatzgebiet: „1100, 1110 1120“ und Bereiche wie „1010–1230“ (alle bekannten PLZ dazwischen).
 * `verzeichnis` ist src/content/plz.json; ohne Verzeichnis (noch nicht geladen) wird nur das Format geprüft.
 * null, wenn etwas anderes als vierstellige Zahlen und Bereiche drinsteht.
 */
export function leseGebiet(eingabe: string, verzeichnis: Readonly<Record<string, string>> | null): { plz: string[]; unbekannt: string[] } | null {
  const teile = eingabe
    .replace(/\s*[-–]\s*/g, '-')
    .split(/[\s,;]+/)
    .filter(Boolean)
  if (!teile.length) return null
  const plz = new Set<string>()
  const unbekannt: string[] = []
  for (const teil of teile) {
    const bereich = teil.match(/^(\d{4})-(\d{4})$/)
    if (bereich) {
      const [von, bis] = [Number(bereich[1]), Number(bereich[2])].sort((a, b) => a - b)
      if (!verzeichnis) {
        plz.add(bereich[1])
        continue
      }
      const treffer = Object.keys(verzeichnis).filter((p) => Number(p) >= von && Number(p) <= bis)
      if (treffer.length) treffer.forEach((p) => plz.add(p))
      else unbekannt.push(teil.replace('-', '–'))
    } else if (/^\d{4}$/.test(teil)) {
      if (!verzeichnis || teil in verzeichnis) plz.add(teil)
      else unbekannt.push(teil)
    } else return null
  }
  return { plz: [...plz].sort(), unbekannt }
}

/** Fehlertext für ein Feld oder null. */
export function pruefeFeld(
  feld: BewerbungFeld,
  w: Bewerbung,
  gewerkIds: readonly string[],
  verzeichnis: Readonly<Record<string, string>> | null,
): string | null {
  const auswahl = (wert: string, ids: readonly string[]) => (ids.includes(wert) ? null : fehler.auswahl)
  switch (feld) {
    case 'firma':
      return w.firma.trim() ? null : fehler.firma
    case 'ansprechperson':
      return w.ansprechperson.trim() ? null : fehler.ansprechperson
    case 'telefon':
      return istTelefon(w.telefon) ? null : fehler.telefon
    case 'email':
      return istBetriebsEmail(w.email) ? null : fehler.email
    case 'gisa':
      return gisaZahlen(w.gisa) ? null : fehler.gisa
    case 'uid':
      return uidNummer(w.uid) === null ? fehler.uid : null
    case 'gewerke':
      return w.gewerke.some((g) => gewerkIds.includes(g)) ? null : fehler.gewerke
    case 'plz': {
      const gebiet = leseGebiet(w.plz, verzeichnis)
      if (!gebiet) return fehler.plz
      if (gebiet.unbekannt.length) return fuelle(fehler.plzUnbekannt, { liste: gebiet.unbekannt.join(', ') })
      if (gebiet.plz.length > MAX_PLZ) return fuelle(fehler.plzZuViele, { max: MAX_PLZ })
      return gebiet.plz.length ? null : fehler.plz
    }
    case 'zeiten':
      return w.zeiten.some((z) => ZEIT_IDS.includes(z)) ? null : fehler.zeiten
    case 'notdienst':
      return auswahl(w.notdienst, ['ja', 'nein'])
    case 'reaktionszeit':
      return null
    case 'richtpreise':
      return auswahl(w.richtpreise, ['ja', 'abweichung', 'nein'])
    case 'abweichungen':
      return w.richtpreise !== 'abweichung' || w.abweichungen.trim() ? null : fehler.abweichungen
    case 'haftpflicht':
      return auswahl(w.haftpflicht, ['ja', 'nein'])
    case 'preisVorab':
      return auswahl(w.preisVorab, ['ja', 'nein'])
    case 'unbar':
      return auswahl(w.unbar, ['ja', 'nein'])
    case 'anmerkungen':
      return null
    case 'einwilligung':
      return w.einwilligung ? null : fehler.einwilligung
  }
}

/** Alle Fehler in Formular-Reihenfolge. */
export function pruefeBewerbung(
  w: Bewerbung,
  gewerkIds: readonly string[],
  verzeichnis: Readonly<Record<string, string>> | null,
): Partial<Record<BewerbungFeld, string>> {
  return Object.fromEntries(
    FELDER.flatMap((feld) => {
      const meldung = pruefeFeld(feld, w, gewerkIds, verzeichnis)
      return meldung ? [[feld, meldung]] : []
    }),
  )
}

/**
 * Daten für public/anfrage.php (art=partner). Nur aufrufen, wenn pruefeBewerbung keine Fehler meldet.
 * Listen gehen als Komma-Liste, Antworten als ids (ja/nein, abweichung, Minuten).
 */
export function bewerbungZuPayload(
  w: Bewerbung,
  bewerbungId: string,
  gewerkIds: readonly string[],
  verzeichnis: Readonly<Record<string, string>>,
): URLSearchParams {
  const gebiet = leseGebiet(w.plz, verzeichnis)
  const gisa = gisaZahlen(w.gisa)
  const uid = uidNummer(w.uid)
  if (!gebiet || !gisa || uid === null || !w.einwilligung) throw new Error('Bewerbung ist nicht vollständig')
  return new URLSearchParams({
    art: 'partner',
    bewerbungId,
    firma: w.firma.trim(),
    ansprechperson: w.ansprechperson.trim(),
    tel: w.telefon.trim(),
    email: w.email.trim(),
    gisa: gisa.join(','),
    uid,
    gewerke: w.gewerke.filter((g) => gewerkIds.includes(g)).join(','),
    plz: gebiet.plz.join(','),
    zeiten: w.zeiten.filter((z) => ZEIT_IDS.includes(z)).join(','),
    notdienst: w.notdienst,
    reaktionszeit: REAKTION_IDS.includes(w.reaktionszeit) ? w.reaktionszeit : '',
    richtpreise: w.richtpreise,
    abweichungen: w.richtpreise === 'abweichung' ? w.abweichungen.trim() : '',
    haftpflicht: w.haftpflicht,
    preisVorab: w.preisVorab,
    unbar: w.unbar,
    anmerkungen: w.anmerkungen.trim(),
    dsgvo: 'on',
  })
}

/** Senden; Erfolg ist nur JSON { ok: true }. Alles andere und ein Timeout werfen. */
export async function sendeBewerbung(payload: URLSearchParams): Promise<void> {
  const inhalt = await posteAnEingang(payload)
  if (inhalt?.ok !== true) throw new Error('Bewerbung nicht angenommen')
}
