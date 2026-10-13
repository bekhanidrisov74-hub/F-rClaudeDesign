// Prüfregeln für Formular und Luna (SPEC 8 und 9).
import { copy } from '../content/copy'

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
export const istTelefon = (text: string) => /^[+\d][\d\s/()-]*$/.test(text.trim()) && ziffern(text).length >= 6 && ziffern(text).length <= 15

/**
 * „Maria Huber, 0664 1234567“ → { name: 'Maria Huber', telefon: '0664 1234567' }.
 * Die längste Ziffernfolge mit mindestens 6 Ziffern gilt als Telefonnummer, der Rest als Name.
 */
export function teileNameTelefon(eingabe: string): { name: string; telefon: string } {
  const kandidaten = [...eingabe.matchAll(/\+?\d[\d\s/()-]*\d/g)].map((m) => m[0]).filter((t) => ziffern(t).length >= 6)
  const telefon = kandidaten.sort((a, b) => ziffern(b).length - ziffern(a).length)[0] ?? ''
  const name = (telefon ? eingabe.replace(telefon, ' ') : eingabe)
    .replace(/\b(?:tel(?:efon)?|nr|nummer|handy|mobil)\b\.?:?/gi, ' ')
    .replace(/[,;:|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return { name, telefon: telefon.trim() }
}
