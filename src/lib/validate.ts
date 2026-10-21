// Prüfregeln für Formular und Luna (SPEC 8 und 9).
import { WEISS_NICHT, copy } from '../content/copy'
import { gewerke } from '../content/gewerke'
import type { Lead } from './submitLead'

const PLZ = { min: 1010, max: 9992 }

/** „1020“ oder „1020 Wien“ → { plz, ort }. null, wenn keine österreichische PLZ am Anfang steht. */
export function teilePlzOrt(eingabe: string): { plz: string; ort: string } | null {
  const treffer = eingabe.trim().match(/^(?:A-?\s*)?(\d{4})(?!\d)[\s,]*(.*)$/i)
  if (!treffer) return null
  const zahl = Number(treffer[1])
  if (zahl < PLZ.min || zahl > PLZ.max) return null
  return { plz: treffer[1], ort: treffer[2].trim() }
}

/**
 * Ort zur PLZ, wenn er sicher ist. Wien: 1010–1239 (Entscheidung 2 vom 13.10.2026).
 * ponytail: nur Wien. Für ganz Österreich die PLZ-Liste der Post einbinden (rund 2.500 Einträge).
 */
export const ortZuPlz = (plz: string) => (Number(plz) >= 1010 && Number(plz) <= 1239 ? copy.orte.wien : '')

const ziffern = (text: string) => text.replace(/\D/g, '')

/** Telefonnummer plausibel: 6 bis 15 Ziffern, nur Ziffern, Leerzeichen, + / ( ) - */
export const istTelefon = (text: string) => /^[+(\d][\d\s/()-]*$/.test(text.trim()) && ziffern(text).length >= 6 && ziffern(text).length <= 15

/** E-Mail plausibel (freiwillig in Formular und Luna). Dieselben Zeichen wie EMAIL_RE in public/anfrage.php, sonst käme keine Bestätigung. */
export const istEmail = (text: string) => /^[^@\s,;<>"()]+@[^@\s,;<>"()]+\.[a-zA-Z]{2,}$/.test(text.trim())

// ── Anfrage-Formular (SPEC 9) ──

/** Wert der Gewerk-Auswahl für „Weiß ich nicht“ */
export const WEISS_NICHT_ID = 'weiss-nicht'

export interface FormularWerte {
  name: string
  telefon: string
  plzOrt: string
  /** id aus gewerke.ts, WEISS_NICHT_ID oder '' (noch nicht gewählt) */
  gewerk: string
  /** freiwillig: leer oder eine gültige Adresse (dann geht eine Bestätigungsmail an die Kundin oder den Kunden) */
  email: string
  beschreibung: string
  einwilligung: boolean
}

export type FormularFeld = keyof FormularWerte
export const LEERES_FORMULAR: FormularWerte = { name: '', telefon: '', plzOrt: '', gewerk: '', email: '', beschreibung: '', einwilligung: false }

/** PLZ und Ort; fehlt der Ort, wird er aus der PLZ abgeleitet, wenn das sicher geht (Wien). */
function plzUndOrt(eingabe: string) {
  const geteilt = teilePlzOrt(eingabe)
  if (!geteilt) return null
  const ort = geteilt.ort || ortZuPlz(geteilt.plz)
  return ort ? { plz: geteilt.plz, ort } : null
}

/** Fehlertext für ein Feld oder null. */
export function pruefeFeld(feld: FormularFeld, w: FormularWerte, gewerkIds: readonly string[]): string | null {
  const f = copy.anfrage.fehler
  switch (feld) {
    case 'name':
      return w.name.trim() ? null : f.name
    case 'telefon':
      return istTelefon(w.telefon) ? null : f.telefon
    case 'plzOrt':
      return plzUndOrt(w.plzOrt) ? null : f.plzOrt
    case 'gewerk':
      return w.gewerk === WEISS_NICHT_ID || gewerkIds.includes(w.gewerk) ? null : f.gewerk
    case 'email':
      return !w.email.trim() || istEmail(w.email) ? null : f.email
    case 'einwilligung':
      return w.einwilligung ? null : f.einwilligung
    case 'beschreibung':
      return null
  }
}

/** Alle Fehler in Formular-Reihenfolge (der erste bekommt beim Absenden den Fokus). */
export function pruefeFormular(w: FormularWerte, gewerkIds: readonly string[]): Partial<Record<FormularFeld, string>> {
  const felder: FormularFeld[] = ['name', 'telefon', 'plzOrt', 'gewerk', 'email', 'beschreibung', 'einwilligung']
  return Object.fromEntries(felder.flatMap((feld) => {
    const fehler = pruefeFeld(feld, w, gewerkIds)
    return fehler ? [[feld, fehler]] : []
  }))
}

/** Daten für submitLead. Nur aufrufen, wenn pruefeFormular keine Fehler meldet. */
export function formularZuLead(w: FormularWerte, anfrageId: string): Lead {
  const ort = plzUndOrt(w.plzOrt)
  if (!ort || !w.einwilligung) throw new Error('Formular ist nicht vollständig')
  const gewerk = gewerke.find((g) => g.id === w.gewerk)
  return {
    anfrageId,
    name: w.name.trim(),
    tel: w.telefon.trim(),
    email: w.email.trim(),
    plz: ort.plz,
    ort: ort.ort,
    kategorie: gewerk?.id ?? '',
    bereich: gewerk?.name ?? WEISS_NICHT,
    dringlichkeit: '',
    wunschtermin: '',
    text: [w.beschreibung.trim(), '(Anfrage über das Formular)'].filter(Boolean).join('\n\n'),
    antworten: {},
  }
}
