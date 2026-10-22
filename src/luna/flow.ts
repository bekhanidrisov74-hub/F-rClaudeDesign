// Luna: Zustandsautomat mit Fragenkatalog je Gewerk (docs/luna-ki/AUFGABE.md). Reine Logik ohne React, in Vitest testbar.
// Der Browser führt das Gespräch: je Schritt genau eine Frage, nie eine, die schon beantwortet ist.
// Gewerk, PLZ und Dringlichkeit erkennen lokale Regeln. Eine optionale KI (`Erfasser`) ergänzt nur Felder;
// ihre Antwort ist fremde Eingabe und wird hier geprüft. Kontaktdaten kommen im Zustand nie vor.
import { copy, dringlichkeit, fuelle, GEFAHR, WEISS_NICHT, type DringlichkeitId } from '../content/copy'
import { fragenZu, katalog, type Frage } from '../content/fragen'
import { gewerke } from '../content/gewerke'
import { ladePlz } from '../lib/plz'
import { zufallsnummer, type Lead, type Match } from '../lib/submitLead'

const t = copy.luna

/**
 * Zustände laut Aufgabe. MATCHING ist `sendend` in LunaChat (nicht gespeichert: Ein Neuladen mitten im Senden kehrt
 * zur Zusammenfassung zurück), MATCH_FOUND und NO_MATCH sind COMPLETED mit `match`. EMERGENCY ist der Hinweis
 * `notruf`, der Ablauf läuft danach weiter.
 */
export type Phase = 'INITIAL' | 'CLASSIFYING' | 'ASKING' | 'LOCATION' | 'SUMMARY' | 'ERROR' | 'COMPLETED'

export interface Nachricht {
  von: 'luna' | 'nutzer' | 'notruf'
  text: string
}

export interface KiNachricht {
  role: 'user' | 'assistant'
  content: string
}

export interface Anfrage {
  gewerk: string | null
  /** Erste Beschreibung in eigenen Worten */
  problem: string
  /** Antwort je Frage-id, '' = übersprungen */
  antworten: Record<string, string>
  dringlichkeit: DringlichkeitId | null
  /** null = noch nicht gefragt, '' = übersprungen */
  wunschtermin: string | null
  plz: string
  ort: string
  /** Ergänzungen nach der Zusammenfassung und sonstige Angaben der KI */
  zusatz: string
}

export interface Zustand {
  phase: Phase
  verlauf: Nachricht[]
  anfrage: Anfrage
  notruf: boolean
  /** Verlauf für die KI: nur die letzten Nachrichten, gekürzt */
  ki: KiNachricht[]
  /** Je Anfrage einmal, beim ersten Senden vergeben */
  anfrageId: string
  match: Match | null
}

export interface Kontakt {
  name: string
  telefon: string
  email: string
}

/** Zustand, den die KI zur letzten Nachricht bekommt (ohne Kontaktdaten) */
export interface KiZustand {
  category: string | null
  urgency: DringlichkeitId | null
  postalCode: string | null
  answers: Record<string, string>
  pending: { id: string; q: string; opts: string[] } | null
  questions: { id: string; q: string }[]
}

/** Liefert die Argumente des Werkzeugs „erfassen“ oder {} – darf nie werfen (siehe ki.ts). */
export type Erfasser = (verlauf: KiNachricht[], zustand: KiZustand) => Promise<unknown>

const KI_NACHRICHTEN = 10
const KI_ZEICHEN = 1000

const DRINGLICHKEIT: Frage = {
  id: 'dringlichkeit',
  frage: t.fragen.dringlichkeit,
  label: t.zusammenfassung.felder.dringlichkeit,
  chips: dringlichkeit.map((d) => d.chip),
  gefahr: [dringlichkeit[0].chip],
}
const WUNSCHTERMIN: Frage = {
  id: 'wunschtermin',
  frage: t.fragen.wunschtermin,
  label: t.zusammenfassung.felder.wunschtermin,
  chips: t.wunschterminChips,
}

// Erkennung im Freitext (Referenz luna.js)
const ACUTE_RE = /läuft stark|überschwemm|steht unter wasser|rohrbruch|sprudelt|läuft voll|wasserschaden/i
/** Brand, Rauch, Funken, Gas, Stromschlag. „brennt nicht“ (Therme zündet nicht) und „brauche“ sind keine Gefahr. */
const DANGER_RE =
  /brandgeruch|\brauch|funken|feuer|\bflammen|brand\b|explo|gasgeruch|gas riech|riecht nach gas|gasaustritt|brenn(t|en)\b(?!\s*(nicht|nimmer|nie|kein))|stromschlag|verbrannt|kokelt/i
const URGENT_RE = /sofort|dringend|notfall|akut|eilig|asap|so schnell wie möglich|schnellstmöglich/i
const NORMAL_RE = /nicht eilig|kein notfall|keine eile|nächste woche|nächsten tagen|irgendwann|nach absprache|kein stress|nicht dringend/i
/** Antworten, die im Freitext nichts über eine Frage aussagen */
const GENERISCH = /^(ja|nein|weiß nicht|etwas anderes|woanders|kein fehlercode|komplett|teilweise)$/i
/** Platzhalter, die ein Modell statt einer echten Angabe liefert */
const LEER_RE = /nicht angegeben|nicht genannt|unbekannt|keine angabe|k\.\s?a\.|^n\/a$|^-+$|^null$|^none$|^leer$/i
const MARKE_RE =
  /\b(vaillant|viessmann|junkers|buderus|wolf|baxi|weishaupt|hoval|de dietrich|bosch|siemens|miele|aeg|samsung|lg|beko|gorenje|whirlpool|bauknecht|electrolux|zanussi|liebherr|neff|constructa|grundig|daikin|mitsubishi|panasonic|toshiba|fujitsu)\b/i
const CODE_RE = /\b([A-Z]{1,2}[.\- ]?\d{1,3})(?!\d)/

const RANG: Record<DringlichkeitId, number> = { NORMAL: 1, URGENT: 2, ACUTE: 3 }
const klein = (s: string) => s.toLocaleLowerCase('de-AT')
const optionRe = (o: string, flags = 'i') =>
  new RegExp(`(^|[^a-zäöüß0-9])${o.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-zäöüß0-9])`, flags)

const LEER: Anfrage = { gewerk: null, problem: '', antworten: {}, dringlichkeit: null, wunschtermin: null, plz: '', ort: '', zusatz: '' }

export function start(): Zustand {
  return { phase: 'INITIAL', verlauf: [{ von: 'luna', text: t.fragen.gewerk }], anfrage: LEER, notruf: false, ki: [], anfrageId: '', match: null }
}

/** Nächste offene Frage: Katalog des Gewerks, dann Dringlichkeit, bei NORMAL der Wunschtermin. */
export function naechsteFrage(a: Anfrage): Frage | null {
  for (const f of fragenZu(a.gewerk)) if (!(f.id in a.antworten) && (f.wenn?.(a.antworten) ?? true)) return f
  if (!a.dringlichkeit) return DRINGLICHKEIT
  if (a.dringlichkeit === 'NORMAL' && a.wunschtermin === null) return WUNSCHTERMIN
  return null
}

export const offeneFrage = (z: Zustand) => (z.phase === 'ASKING' ? naechsteFrage(z.anfrage) : null)

/** Auswahl-Chips des aktuellen Schritts (leer, wenn nur Freitext gefragt ist). */
export function auswahl(z: Zustand): string[] {
  if (z.phase === 'INITIAL') return [...gewerke.map((g) => g.name), WEISS_NICHT]
  if (z.phase === 'CLASSIFYING') return gewerke.map((g) => g.name)
  const f = offeneFrage(z)
  if (!f) return []
  return f === DRINGLICHKEIT ? [...f.chips] : [...f.chips, t.ueberspringen]
}

/** Fortschritt in vier Schritten: Problem → Details → Ort → Prüfen. Nach dem Abschluss kein Balken (null). */
export function fortschritt(z: Zustand): number | null {
  switch (z.phase) {
    case 'INITIAL':
    case 'CLASSIFYING':
      return 1
    case 'ASKING':
      return 2
    case 'LOCATION':
      return 3
    case 'SUMMARY':
    case 'ERROR':
      return 4
    case 'COMPLETED':
      return null
  }
}
export const ANZAHL_SCHRITTE = t.schritte.length

/** Verarbeitet eine Antwort (Chip-Text oder Freitext) und stellt die nächste Frage. */
export async function antworte(alt: Zustand, roh: string, erfasse?: Erfasser): Promise<Zustand> {
  const text = roh.trim()
  if (!text || alt.phase === 'COMPLETED') return alt
  const z = structuredClone(alt)
  const a = z.anfrage
  z.verlauf.push({ von: 'nutzer', text })

  // Nach der Zusammenfassung: Ergänzung zur Anfrage, ohne KI (hier stehen Kontaktdaten in der Nähe).
  if (alt.phase === 'SUMMARY' || alt.phase === 'ERROR') {
    a.zusatz = `${a.zusatz} ${text}`.trim().slice(0, 500)
    sage(z, t.notiert)
    return z
  }

  const erst = alt.phase === 'INITIAL' || alt.phase === 'CLASSIFYING'
  const offen = offeneFrage(alt)
  const chip = auswahl(alt).find((c) => klein(c) === klein(text))

  if (chip === WEISS_NICHT) {
    z.phase = 'CLASSIFYING'
    frage(z, t.fragen.problem)
    return z
  }
  if (chip && erst) {
    a.gewerk = gewerke.find((g) => g.name === chip)?.id ?? null
    if (a.problem) vorbelegen(z, a.problem)
    return weiter(z, alt.phase)
  }
  if (chip && offen) {
    verbuche(z, offen, chip === t.ueberspringen ? '' : chip)
    return weiter(z, alt.phase)
  }

  // Freitext: lokale Regeln zuerst
  if (erst) {
    if (!a.problem) a.problem = text.slice(0, 500)
    a.gewerk ??= katalog.find((k) => k.muster.test(text))?.id ?? null
  }
  gefahr(z, text)
  const plz = await findePlz(text, alt.phase === 'LOCATION')
  if (alt.phase === 'LOCATION' && (plz === null || plz === 'unbekannt')) {
    sage(z, plz === 'unbekannt' ? t.plzUnbekannt : t.plzFehler)
    return z
  }
  if (plz && plz !== 'unbekannt' && !a.plz) Object.assign(a, plz)
  if (offen) {
    if (offen === DRINGLICHKEIT) a.dringlichkeit ??= NORMAL_RE.test(text) ? 'NORMAL' : 'URGENT'
    else if (offen === WUNSCHTERMIN) a.wunschtermin = text.slice(0, 80)
    else verbuche(z, offen, erkenneAntwort(offen, text))
  }
  vorbelegen(z, text)

  // Sehr kurze Eingabe ohne erkennbaren Inhalt: nachfragen statt raten.
  if (erst && !a.gewerk && text.replace(/[^a-zäöüß]/gi, '').length < 4) {
    sage(z, t.kurz)
    return z
  }
  // KI nur dort, wo sie etwas beitragen kann: erste Beschreibung und längere Freitexte.
  if (erfasse && (erst || (offen && text.split(/\s+/).length >= 4))) {
    z.ki = kuerze([...z.ki, { role: 'user', content: ohneKontakt(text) }])
    uebernimm(z, await erfasse(z.ki, kiZustand(z, offen)), await ladePlz())
  }
  return weiter(z, alt.phase)
}

/** Nächster Schritt: Gewerk, offene Frage, Ort, Zusammenfassung. */
function weiter(z: Zustand, vorher: Phase): Zustand {
  const a = z.anfrage
  if (!a.gewerk) {
    z.phase = 'CLASSIFYING'
    frage(z, vorher === 'CLASSIFYING' ? t.gewerkNochmal : t.gewerkUnklar)
    return z
  }
  const f = naechsteFrage(a)
  if (f) {
    z.phase = 'ASKING'
    frage(z, f.frage)
  } else if (!a.plz) {
    z.phase = 'LOCATION'
    const tipp = gewerke.find((g) => g.id === a.gewerk)?.tipp
    frage(z, fuelle(t.fragen.plz, { tipp: tipp ? `${tipp} ` : '' }))
  } else {
    z.phase = 'SUMMARY'
    sage(z, t.zusammenfassungIntro)
  }
  return z
}

const sage = (z: Zustand, text: string) => z.verlauf.push({ von: 'luna', text })

/** Lunas Fragen gehören auch in den KI-Verlauf, sonst fehlt dem Modell der Bezug. */
function frage(z: Zustand, text: string) {
  sage(z, text)
  z.ki = kuerze([...z.ki, { role: 'assistant', content: text }])
}

/**
 * Telefonnummern und E-Mail-Adressen aus Freitext entfernen, bevor er an die KI geht (Aufgabe 5: Kontaktdaten nie an
 * OpenAI; Audit, Befund F1). ponytail: Nummern ab 6 Ziffern mit führender 0 oder +; Namen erkennt das nicht.
 */
export const ohneKontakt = (text: string) =>
  text
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[E-Mail entfernt]')
    .replace(/(?:\+|\b0)[\d /()-]{5,}\d/g, (nummer) => (nummer.replace(/\D/g, '').length >= 6 ? '[Nummer entfernt]' : nummer))

const kuerze = (ki: KiNachricht[]) => ki.slice(-KI_NACHRICHTEN).map((m) => ({ ...m, content: m.content.slice(0, KI_ZEICHEN) }))

function hebe(a: Anfrage, u: DringlichkeitId) {
  if (!a.dringlichkeit || RANG[u] > RANG[a.dringlichkeit]) a.dringlichkeit = u
}

function notruf(z: Zustand) {
  if (z.notruf) return
  z.notruf = true
  z.verlauf.push({ von: 'notruf', text: t.notruf })
}

function gefahr(z: Zustand, text: string) {
  const a = z.anfrage
  if (DANGER_RE.test(text)) {
    hebe(a, 'ACUTE')
    notruf(z)
    // „Steckdose funkt“, „riecht verbrannt“: die Gefahrenfrage des Gewerks gilt als beantwortet.
    const o = /funken/i.test(text) ? 'Funken' : /\brauch/i.test(text) ? 'Rauch' : /verbrannt|brandgeruch|kokelt|brennt/i.test(text) ? 'Brandgeruch' : ''
    for (const f of fragenZu(a.gewerk)) if (o && f.gefahr?.includes(o) && !(f.id in a.antworten)) a.antworten[f.id] = o
  } else if (ACUTE_RE.test(text)) hebe(a, 'ACUTE')
  // Verneinung zuerst: „nicht dringend“ enthält „dringend“.
  if (NORMAL_RE.test(text)) a.dringlichkeit ??= 'NORMAL'
  else if (URGENT_RE.test(text)) hebe(a, 'URGENT')
}

function verbuche(z: Zustand, f: Frage, wert: string) {
  const a = z.anfrage
  if (f === DRINGLICHKEIT) a.dringlichkeit = dringlichkeit.find((d) => d.chip === wert)?.id ?? 'URGENT'
  else if (f === WUNSCHTERMIN) a.wunschtermin = wert
  else a.antworten[f.id] = wert
  if (!wert) return
  if (f.akut?.includes(wert)) hebe(a, 'ACUTE')
  if (f.gefahr?.includes(wert)) {
    hebe(a, 'ACUTE')
    notruf(z)
  }
}

/** Antwort auf die offene Frage aus Freitext: Schnellantwort als ganzes Wort, sonst Ja/Nein, sonst der Text selbst. */
function erkenneAntwort(f: Frage, text: string): string {
  const treffer = f.chips.find((o) => optionRe(o).test(text))
  if (treffer) return treffer
  if (f.chips.includes('Ja')) {
    if (/^\s*(ja|jap|genau|stimmt|schon)\b/i.test(text)) return 'Ja'
    if (/^\s*(nein|nö|nicht|leider nicht)\b/i.test(text)) return 'Nein'
  }
  return text.slice(0, 200)
}

/**
 * Antworten, die der Kunde von sich aus gibt („seit heute“, „Waschmaschine“, „Vaillant zeigt F28“): Jede offene
 * Frage, deren Schnellantwort als ganzes Wort im Text steht, gilt als beantwortet. Generische Antworten zählen nicht.
 */
function vorbelegen(z: Zustand, text: string) {
  const a = z.anfrage
  for (const f of fragenZu(a.gewerk)) {
    if (f.id in a.antworten) continue
    // Kurze Eigennamen (WC, Bad, Herd) nur schreibungsgenau.
    const o = f.chips.find((c) => c.length >= 2 && !GENERISCH.test(c) && optionRe(c, c.length <= 5 && /^[A-ZÄÖÜ]/.test(c) ? '' : 'i').test(text))
    let m: RegExpMatchArray | null
    if (o) verbuche(z, f, o)
    else if ((f.id === 'marke' || f.id === 'hersteller') && (m = text.match(MARKE_RE)))
      a.antworten[f.id] = m[1].length <= 3 ? m[1].toUpperCase() : m[1][0].toUpperCase() + m[1].slice(1).toLowerCase()
    else if (f.id === 'code' && (m = text.match(CODE_RE))) a.antworten[f.id] = m[1].toUpperCase().replace(/[.\- ]/, '')
  }
}

/**
 * Vierstellige Zahl als PLZ-Kandidat: im Ort-Schritt (streng) immer; sonst nur, wenn ein Ortsname folgt („1100 Wien“),
 * „PLZ“ davorsteht oder die Zahl keine Jahreszahl sein kann. „seit 2020“ oder „Therme von 2020“ bleiben Jahre.
 */
export function plzKandidat(text: string, streng: boolean): string | null {
  for (const m of text.matchAll(/(^|[^\d])([1-9]\d{3})(?!\d)/g)) {
    const plz = m[2]
    const davor = klein(text.slice(0, m.index + m[1].length))
    const ort = /^[\s,]*[A-ZÄÖÜ][a-zäöüß]/.test(text.slice(m.index + m[0].length))
    const jahr = Number(plz) >= 1900 && Number(plz) <= 2099
    if (/(seit|von|baujahr|jahr|jahre|um|bis|ca\.?|anno)\s*$/.test(davor) && !ort) continue
    if (streng || ort || /plz\s*:?\s*$/.test(davor) || !jahr) return plz
  }
  return null
}

/** PLZ mit Ort aus dem Verzeichnis; 'unbekannt' = vier Ziffern, aber keine gültige PLZ. */
async function findePlz(text: string, streng: boolean): Promise<{ plz: string; ort: string } | 'unbekannt' | null> {
  const plz = plzKandidat(text, streng)
  if (!plz) return null
  // Sicher nur, weil plzKandidat vier Ziffern liefert; rohe Eingaben vorher so prüfen.
  const ort = (await ladePlz())[plz]
  return ort ? { plz, ort } : 'unbekannt'
}

function kiZustand(z: Zustand, offen: Frage | null): KiZustand {
  const a = z.anfrage
  return {
    category: a.gewerk,
    urgency: a.dringlichkeit,
    postalCode: a.plz || null,
    answers: Object.fromEntries(Object.entries(a.antworten).map(([id, wert]) => [id, ohneKontakt(wert)])),
    pending: offen ? { id: offen.id, q: offen.frage, opts: [...offen.chips] } : null,
    questions: fragenZu(a.gewerk).map((f) => ({ id: f.id, q: f.frage })),
  }
}

/**
 * Wiederholt die KI-Antwort nur den Notruf? Sie beginnt mit dem Kern-Satz GEFAHR (so steht er im Prompt in public/chat.php, die
 * KI setzt ihn evtl. in Anführungszeichen) und hat höchstens so viel Rest wie der lokale Hinweis (GEFAHR plus Zusatz).
 * Eine längere Antwort hat weiteren Inhalt und bleibt.
 */
const wiederholtNotruf = (reply: string) => {
  const glatt = reply.replace(/\s+/g, ' ').replace(/^["'„“”‚‘’»«]+/, '')
  return glatt.startsWith(GEFAHR) && glatt.length <= t.notruf.length
}

/**
 * Felder der KI nur additiv übernehmen: nichts Bekanntes überschreiben, nur gültige ids und Werte.
 * Gewerk nur aus der Liste, PLZ nur aus dem Verzeichnis. reply wird als Text angezeigt (React escapt), höchstens 600 Zeichen.
 */
export function uebernimm(z: Zustand, felder: unknown, plzListe: Readonly<Record<string, string>>) {
  if (!felder || typeof felder !== 'object') return
  const f = felder as Record<string, unknown>
  const a = z.anfrage
  const wert = (v: unknown, max: number) => (typeof v === 'string' && v.trim() && !LEER_RE.test(v.trim()) ? v.trim().slice(0, max) : '')

  if (!a.gewerk && gewerke.some((g) => g.id === f.category)) a.gewerk = f.category as string
  // Object.hasOwn: geerbte Schlüssel wie „constructor“ zählen nicht
  if (typeof f.urgency === 'string' && Object.hasOwn(RANG, f.urgency)) hebe(a, f.urgency as DringlichkeitId)
  const plz = typeof f.postalCode === 'string' || typeof f.postalCode === 'number' ? String(f.postalCode).trim() : ''
  if (!a.plz && /^[1-9]\d{3}$/.test(plz) && Object.hasOwn(plzListe, plz)) Object.assign(a, { plz, ort: plzListe[plz] })
  if (a.wunschtermin === null && wert(f.preferredTime, 80)) a.wunschtermin = wert(f.preferredTime, 80)
  const zusatz = [wert(f.address, 120) && `Adresse: ${wert(f.address, 120)}`, wert(f.additionalInformation, 300)].filter(Boolean).join('. ')
  if (zusatz) a.zusatz = `${a.zusatz} ${zusatz}`.trim().slice(0, 500)
  if (f.answers && typeof f.answers === 'object') {
    const antworten = f.answers as Record<string, unknown>
    for (const frage of fragenZu(a.gewerk)) {
      const v = wert(antworten[frage.id], 200)
      if (v && !(frage.id in a.antworten)) verbuche(z, frage, v)
    }
  }
  // Ohne Platzhalter-Prüfung: „Das ist mir unbekannt …“ ist eine echte Antwort
  const reply = typeof f.reply === 'string' ? f.reply.trim().slice(0, 600) : ''
  // Den Notruf-Satz zeigt schon der lokale Hinweis – eine Antwort, die nur ihn wiederholt, entfällt.
  if (reply && !(z.notruf && wiederholtNotruf(reply))) {
    sage(z, reply)
    z.ki = kuerze([...z.ki, { role: 'assistant', content: reply }])
  }
}

/** „Angaben ändern“: Gewerk und Beschreibung bleiben, die Fragen beginnen von vorn. */
export function aendern(z: Zustand): Zustand {
  const neu: Zustand = { ...z, anfrage: { ...LEER, gewerk: z.anfrage.gewerk, problem: z.anfrage.problem }, verlauf: [...z.verlauf] }
  return weiter(neu, z.phase)
}

/** Vergibt beim ersten Senden die Anfrage-Id; erneutes Senden behält sie. */
export const mitId = (z: Zustand): Zustand => (z.anfrageId ? z : { ...z, anfrageId: zufallsnummer() })

export const gesendet = (z: Zustand, match: Match | null): Zustand =>
  match ? { ...z, phase: 'COMPLETED', match } : { ...z, phase: 'ERROR' }

const gewerkName = (a: Anfrage) => gewerke.find((g) => g.id === a.gewerk)?.name ?? WEISS_NICHT

/** Beschreibung in eigenen Worten, sonst die erste Antwort aus dem Katalog. */
export const problemText = (a: Anfrage) =>
  a.problem || (fragenZu(a.gewerk).map((f) => a.antworten[f.id]).find(Boolean) ?? '')

/** Zeilen der Zusammenfassung: [Label, Wert], leere Werte fehlen. */
export function zeilen(a: Anfrage): [string, string][] {
  const feld = t.zusammenfassung.felder
  const problem = problemText(a)
  const alle: [string, string][] = [
    [feld.gewerk, gewerkName(a)],
    [feld.problem, problem],
    ...fragenZu(a.gewerk)
      .filter((f) => a.antworten[f.id] && a.antworten[f.id] !== problem)
      .map((f): [string, string] => [f.label, a.antworten[f.id]]),
    [feld.dringlichkeit, dringlichkeit.find((d) => d.id === a.dringlichkeit)?.chip ?? ''],
    [feld.wunschtermin, a.wunschtermin ?? ''],
    [feld.ort, [a.plz, a.ort].filter(Boolean).join(' ')],
    [feld.zusatz, a.zusatz],
  ]
  return alle.filter(([, wert]) => wert)
}

/** Kurzfassung „Ihre Anfrage“: „Installateur, 1020 Wien, akut. Unter der Spüle tritt Wasser aus. Maria Huber, 0664 …“ */
export function kurzfassung(a: Anfrage, k: Kontakt): string {
  const ort = [a.plz, a.ort].filter(Boolean).join(' ')
  const dring = dringlichkeit.find((d) => d.id === a.dringlichkeit)?.kurz ?? ''
  const p = problemText(a)
  const problem = !p || /[.!?]$/.test(p) ? p : `${p}.`
  return `${[gewerkName(a), ort, dring].filter(Boolean).join(', ')}. ${problem} ${k.name}, ${k.telefon}`.replace(/\s+/g, ' ')
}

/** Daten für submitLead. Kontaktdaten kommen aus der Zusammenfassungskarte, nicht aus dem Zustand. */
export function zuLead(z: Zustand, k: Kontakt): Lead {
  const a = z.anfrage
  const antworten = fragenZu(a.gewerk)
    .filter((f) => a.antworten[f.id])
    .map((f) => `${f.label}: ${a.antworten[f.id]}`)
  const text = [a.problem, antworten.join('\n'), a.zusatz && `${t.zusammenfassung.felder.zusatz}: ${a.zusatz}`, '(Anfrage über Luna)']
  return {
    anfrageId: z.anfrageId,
    name: k.name.trim(),
    tel: k.telefon.trim(),
    email: k.email.trim(),
    plz: a.plz,
    ort: a.ort,
    kategorie: a.gewerk ?? '',
    bereich: gewerkName(a),
    dringlichkeit: a.dringlichkeit ?? 'URGENT',
    wunschtermin: a.wunschtermin ?? '',
    text: text.filter(Boolean).join('\n\n'),
    antworten: a.antworten,
  }
}
