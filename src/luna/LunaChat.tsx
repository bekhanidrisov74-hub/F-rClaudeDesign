import { useEffect, useRef, useState } from 'react'
import { copy } from '../content/copy'
import { ladePlz } from '../lib/plz'
import { submitLead, type Match } from '../lib/submitLead'
import { istEmail, istTelefon } from '../lib/validate'
import { useOverlays } from '../overlays'
import { aendern, antworte, auswahl, gesendet, mitId, start, zuLead, type Kontakt } from './flow'
import { Eingabe } from './Eingabe'
import { Fortschritt, Kopf } from './Kopf'
import { erfasseUeberApi } from './ki'
import { Verlauf } from './Verlauf'

// Wie --breakpoint-dialog in app.css (640 px): ab hier schwebt der Chat als Fenster, darunter ist er Vollbild.
const AB_DIALOG = '(min-width: 40rem)'

const t = copy.luna
const KEIN_KONTAKT: Kontakt = { name: '', telefon: '', email: '' }
export type KontaktFehler = Partial<Record<keyof Kontakt, string>>

/**
 * EIN natives <dialog> für beide Formen (Screen 07 und 11):
 * - ab 640 px nicht modal (show), Fenster 380 px, unter dem Seitenkopf (Entscheidung 3), Esc minimiert per eigenem Listener
 * - darunter modal (showModal), Vollbild, Esc schließt nativ
 * UA-Stile zurücksetzen: Der Browser setzt bei Dialogen Rand, Innenabstand, Außenabstand und Maximalmaße.
 * `open:flex` statt `flex`, sonst wäre der geschlossene Dialog sichtbar.
 */
const DIALOG = [
  'fixed inset-0 z-8 m-0 h-dvh max-h-none w-dvw max-w-none flex-col overflow-hidden border-0 bg-weiss p-0 text-tiefsee open:flex',
  'dialog:inset-auto dialog:right-(--fx-schwebe-r) dialog:bottom-[108px] dialog:h-[min(680px,calc(100dvh_-_136px),calc(100dvh_-_var(--fx-kopf)_-_124px))] dialog:w-[380px] dialog:rounded-card-lg dialog:border dialog:border-linie dialog:shadow-l',
  // Ein- und Ausblenden (nur Deckkraft, die Maße bleiben von der ersten Bildzeile an stabil); die Dauer kommt aus tokens.css
  'transition-[opacity,overlay,display] transition-discrete duration-(--fx-dur-chat) ease-fx',
  'starting:opacity-0 not-open:opacity-0',
  'backdrop:bg-transparent',
].join(' ')

/**
 * Fokus auf die erste Auswahl (Chip), sonst in die Eingabe, zuletzt (Eingabe gesperrt) auf den ersten sichtbaren Knopf.
 * Elemente, die ausgeblendet sind (Kopf-Knöpfe der anderen Form), nehmen den Fokus nicht an und werden übersprungen.
 * Nach dem Senden ohne Eingabe: Sonst ginge am Handy die Tastatur über der Erfolgskarte auf.
 * Ohne Rollen: Wo der Verlauf steht, entscheidet der Scroll-Effekt (neueste Antwort, Notruf-Hinweis ab der ersten Zeile).
 */
function fokussiereStart(dialog: HTMLElement, mitEingabe = true) {
  for (const selektor of ['[data-auswahl] button', ...(mitEingabe ? ['#luna-eingabe:not(:disabled)'] : []), 'button'])
    for (const el of dialog.querySelectorAll<HTMLElement>(selektor)) {
      el.focus({ preventScroll: true })
      if (document.activeElement === el) return
    }
}

export function LunaChat() {
  const { lunaOffen, schliesseLuna, luna, setLuna } = useOverlays()
  const dialog = useRef<HTMLDialogElement>(null)
  const verlauf = useRef<HTMLDivElement>(null)
  const einwilligungRef = useRef<HTMLInputElement>(null)
  /** Beim Wechsel zwischen Fenster und Vollbild schließt und öffnet der Dialog sich neu; das ist kein Schließen. */
  const wechsel = useRef(false)
  /** Nach der nächsten Zustandsänderung den Fokus auf Auswahl bzw. Eingabe setzen (die gedrückte Auswahl verschwindet). */
  const fokusNachAntwort = useRef(false)
  /** Die nächste Zustandsänderung ist der Erfolg nach dem Senden: Fokus nicht in die Eingabe */
  const fokusOhneEingabe = useRef(false)

  const [eingabe, setEingabe] = useState('')
  /** Kontaktdaten nur hier im Speicher: nie im Gesprächszustand, nie in sessionStorage, nie an die KI */
  const [kontakt, setKontakt] = useState<Kontakt>(KEIN_KONTAKT)
  const [kontaktFehler, setKontaktFehler] = useState<KontaktFehler>({})
  const [einwilligung, setEinwilligung] = useState(false)
  const [einwilligungFehlt, setEinwilligungFehlt] = useState(false)
  const [sendend, setSendend] = useState(false)
  /** Luna verarbeitet gerade eine Antwort (PLZ-Verzeichnis, KI) */
  const [denkt, setDenkt] = useState(false)
  /** Die Nachricht, auf die Luna gerade antwortet: steht sofort im Verlauf, nicht erst mit der Antwort */
  const [wartet, setWartet] = useState<string | null>(null)
  /** Sperre gegen Doppelklick: wirkt sofort, nicht erst nach dem nächsten Rendern */
  const sperre = useRef(false)

  // Das PLZ-Verzeichnis laden, sobald der Chat offen ist, damit die Ortsfrage ohne Wartezeit antwortet.
  useEffect(() => {
    if (lunaOffen) void ladePlz()
  }, [lunaOffen])

  // Öffnen und Schließen. Bei einem Wechsel der Breite über 640 px den Dialog ohne Zustandsverlust im anderen Modus öffnen.
  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (!lunaOffen) {
      if (d.open) d.close()
      return
    }

    const mq = window.matchMedia(AB_DIALOG)
    const oeffne = () => {
      if (mq.matches) d.show()
      else d.showModal()
      fokussiereStart(d)
    }
    if (!d.open) oeffne()

    const beiBreite = () => {
      if (!d.open) return
      wechsel.current = true
      d.close()
      oeffne()
    }
    mq.addEventListener('change', beiBreite)
    return () => mq.removeEventListener('change', beiBreite)
  }, [lunaOffen])

  // Verlauf unten halten: bei neuen Nachrichten und nach dem Öffnen (der Dialog war ausgeblendet).
  // Zusammenfassung und Erfolg mit ihrem Anfang zeigen: Sie sind oft höher als der Verlauf, der Erfolg hat seinen
  // Anruf-Knopf gleich unter dem Text (tests/accepted-deviations.md). Der Sendefehler steht unten (Screen 12), damit
  // „Erneut versuchen“ auch in niedrigen Fenstern sichtbar bleibt.
  // Nicht beim Senden und nicht bei Fehlertexten neu ausrichten, sonst springt der gedrückte Knopf bzw. das Feld weg.
  // Fragt jemand unter der Karte etwas, geht es zur Antwort.
  // Die neueste Antwort ab der ersten Zeile: Passen sie, die erneute Frage und die Chips nicht ganz ins Bild (niedriges
  // Fenster, viele Chips), steht sie oben. Ohne Kundennachricht gilt das für die Begrüßung.
  useEffect(() => {
    const el = verlauf.current
    if (!el) return
    // Mit dem Blasenabstand statt dem Innenabstand: sonst ragt die vorige Blase 4 px unter den Fortschrittsbalken.
    const oben = (ziel: HTMLElement) =>
      el.scrollTop + ziel.getBoundingClientRect().top - el.getBoundingClientRect().top - (parseFloat(getComputedStyle(ziel.parentElement ?? el).rowGap) || 0)
    const unterKarte = denkt || luna.verlauf.length > luna.vorKarte
    const karte = (luna.phase === 'SUMMARY' || luna.phase === 'COMPLETED') && !unterKarte ? el.querySelector<HTMLElement>('[data-karte]') : null
    if (karte) {
      el.scrollTop = oben(karte)
      return
    }
    el.scrollTop = el.scrollHeight
    if (denkt || luna.phase === 'ERROR') return
    const blasen = [...el.querySelectorAll<HTMLElement>('[data-von]')]
    const letzte = blasen.findLastIndex((b) => b.dataset.von === 'nutzer')
    const antwort = blasen.slice(letzte + 1).find((b) => b.dataset.von !== 'nutzer')
    if (antwort && oben(antwort) < el.scrollTop) el.scrollTop = oben(antwort)
  }, [luna.phase, luna.verlauf.length, luna.vorKarte, denkt, lunaOffen])

  useEffect(() => {
    if (!fokusNachAntwort.current) return
    fokusNachAntwort.current = false
    if (dialog.current) fokussiereStart(dialog.current, !fokusOhneEingabe.current)
    fokusOhneEingabe.current = false
  }, [luna])

  /** Esc auf der Seite minimiert, der Fokus bleibt dort (WCAG 2.4.11: verdeckter Fokus lässt sich ohne Fokuswechsel freilegen). */
  const fokusBleibt = useRef(false)

  // Jedes Schließen läuft über das close-Ereignis: Esc, Minimieren, Schließen, Knopf und Erfolg.
  const beiClose = () => {
    if (wechsel.current) {
      wechsel.current = false
      return
    }
    schliesseLuna()
    if (fokusBleibt.current) fokusBleibt.current = false
    else document.getElementById('luna-knopf')?.focus()
  }

  // show() kennt kein Esc: Im Fenster minimiert Esc überall auf der Seite, solange kein modaler Dialog darüber liegt.
  // Im Vollbild übernimmt das native cancel-Ereignis.
  useEffect(() => {
    if (!lunaOffen) return
    const beiTaste = (e: globalThis.KeyboardEvent) => {
      const d = dialog.current
      if (e.key !== 'Escape' || !d?.open || d.matches(':modal') || document.querySelector('dialog:modal')) return
      // Liegt der Fokus nirgends (body, etwa während Luna denkt und die Eingabe gesperrt ist), geht er zum Knopf.
      fokusBleibt.current = !d.contains(document.activeElement) && document.activeElement !== document.body
      schliesseLuna()
    }
    document.addEventListener('keydown', beiTaste)
    return () => document.removeEventListener('keydown', beiTaste)
  }, [lunaOffen, schliesseLuna])

  const nimmAn = (neu: typeof luna) => {
    fokusNachAntwort.current = true
    setLuna(neu)
  }

  const beantworte = async (text: string) => {
    if (!text.trim() || sperre.current) return
    sperre.current = true
    setDenkt(true)
    setWartet(text.trim())
    setEingabe('')
    try {
      nimmAn(await antworte(luna, text, erfasseUeberApi))
    } finally {
      sperre.current = false
      setDenkt(false)
      setWartet(null)
    }
  }

  const aendereAngaben = () => {
    setEinwilligung(false)
    setEinwilligungFehlt(false)
    nimmAn(aendern(luna))
  }

  const neueAnfrage = () => {
    setKontakt(KEIN_KONTAKT)
    setKontaktFehler({})
    setEinwilligung(false)
    setEinwilligungFehlt(false)
    nimmAn(start())
  }

  const sende = async () => {
    if (sperre.current) return
    sperre.current = true
    setSendend(true)
    const z = mitId(luna)
    setLuna(z)
    let match: Match | null = null
    try {
      match = await submitLead(zuLead(z, kontakt))
    } catch {
      // Der Fehler wird als Karte „Anfrage nicht gesendet“ gezeigt, die Angaben bleiben erhalten.
    }
    // Der gedrückte Knopf verschwindet mit der Zusammenfassung bzw. der Fehlerkarte: Fokus nicht verlieren.
    fokusNachAntwort.current = true
    fokusOhneEingabe.current = match !== null
    setLuna(gesendet(z, match))
    setSendend(false)
    sperre.current = false
  }

  /** Prüft Kontaktdaten und Einwilligung; der erste Fehler bekommt den Fokus. */
  const absenden = () => {
    const fehler: KontaktFehler = {
      name: kontakt.name.trim() ? undefined : t.zusammenfassung.fehler.name,
      telefon: istTelefon(kontakt.telefon) ? undefined : t.zusammenfassung.fehler.telefon,
      email: !kontakt.email.trim() || istEmail(kontakt.email) ? undefined : t.zusammenfassung.fehler.email,
    }
    setKontaktFehler(fehler)
    setEinwilligungFehlt(!einwilligung)
    const erstes = (['name', 'telefon', 'email'] as const).find((f) => fehler[f])
    if (erstes) document.getElementById(`luna-${erstes}`)?.focus()
    else if (!einwilligung) einwilligungRef.current?.focus()
    else void sende()
  }

  return (
    <dialog ref={dialog} id="luna-chat" aria-label={copy.luna.dialogLabel} onClose={beiClose} className={DIALOG}>
      <Kopf />
      <Fortschritt luna={luna} />
      <Verlauf
        ref={verlauf}
        luna={luna}
        denkt={denkt}
        wartet={wartet}
        onAntwort={(text) => void beantworte(text)}
        kontakt={kontakt}
        zusammenfassung={{
          kontakt,
          onKontakt: (feld, wert) => {
            setKontakt((alt) => ({ ...alt, [feld]: wert }))
            setKontaktFehler((alt) => ({ ...alt, [feld]: undefined }))
          },
          kontaktFehler,
          einwilligung,
          onEinwilligung: (an) => {
            setEinwilligung(an)
            if (an) setEinwilligungFehlt(false)
          },
          einwilligungFehlt,
          einwilligungRef,
          sendend,
          onAbsenden: absenden,
          onAendern: aendereAngaben,
        }}
        sendend={sendend}
        onErneut={() => void sende()}
        onNeu={neueAnfrage}
        onSchliessen={schliesseLuna}
      />
      <Eingabe
        wert={eingabe}
        onWert={setEingabe}
        onSenden={() => void beantworte(eingabe)}
        mitAuswahl={auswahl(luna).length > 0}
        deaktiviert={denkt}
      />
    </dialog>
  )
}
