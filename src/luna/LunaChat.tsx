import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { copy } from '../content/copy'
import { submitLead } from '../lib/submitLead'
import { useOverlays } from '../overlays'
import { aendern, auswahl, gefuehrt, gesendet, vorschlag, zuLead } from './flow'
import { Eingabe } from './Eingabe'
import { Fortschritt, Kopf } from './Kopf'
import { Verlauf } from './Verlauf'

// Wie --breakpoint-dialog in app.css (640 px): ab hier schwebt der Chat als Fenster, darunter ist er Vollbild.
const AB_DIALOG = '(min-width: 40rem)'

/**
 * EIN natives <dialog> für beide Formen (Screen 07 und 11):
 * - ab 640 px nicht modal (show), Fenster 380 px, unter dem Seitenkopf (Entscheidung 3), Esc minimiert per eigenem Listener
 * - darunter modal (showModal), Vollbild, Esc schließt nativ
 * UA-Stile zurücksetzen: Der Browser setzt bei Dialogen Rand, Innenabstand, Außenabstand und Maximalmaße.
 * `open:flex` statt `flex`, sonst wäre der geschlossene Dialog sichtbar.
 */
const DIALOG = [
  'fixed inset-0 z-8 m-0 h-dvh max-h-none w-dvw max-w-none flex-col overflow-hidden border-0 bg-weiss p-0 text-tiefsee open:flex',
  'dialog:inset-auto dialog:right-[28px] dialog:bottom-[108px] dialog:h-[min(680px,calc(100dvh_-_136px),calc(100dvh_-_var(--fx-kopf)_-_124px))] dialog:w-[380px] dialog:rounded-card-lg dialog:border dialog:border-linie dialog:shadow-l',
  // Ein- und Ausblenden (nur Deckkraft, die Maße bleiben von der ersten Bildzeile an stabil); die Dauer kommt aus tokens.css
  'transition-[opacity,overlay,display] transition-discrete duration-(--fx-dur-chat) ease-fx',
  'starting:opacity-0 not-open:opacity-0',
  'backdrop:bg-transparent',
].join(' ')

/** Fokus auf die erste Auswahl (Chip), sonst in die Eingabe. */
function fokussiereStart(dialog: HTMLElement) {
  dialog.querySelector<HTMLElement>('[data-auswahl] button, input:not(:disabled)')?.focus()
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

  const [eingabe, setEingabe] = useState('')
  const [einwilligung, setEinwilligung] = useState(false)
  const [einwilligungFehlt, setEinwilligungFehlt] = useState(false)
  const [sendend, setSendend] = useState(false)

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

  // Verlauf unten halten: bei neuen Nachrichten, nach dem Öffnen (der Dialog war ausgeblendet) und bei Hinweisen.
  useEffect(() => {
    const el = verlauf.current
    if (el) el.scrollTop = el.scrollHeight
  }, [luna, sendend, einwilligungFehlt, lunaOffen])

  useEffect(() => {
    if (!fokusNachAntwort.current) return
    fokusNachAntwort.current = false
    if (dialog.current) fokussiereStart(dialog.current)
  }, [luna])

  // Jedes Schließen läuft über das close-Ereignis: Esc (Vollbild), Minimieren, Schließen, Knopf und Erfolg.
  const beiClose = () => {
    if (wechsel.current) {
      wechsel.current = false
      return
    }
    schliesseLuna()
    document.getElementById('luna-knopf')?.focus()
  }

  // show() kennt kein Esc: im Fenster minimiert ein eigener Listener (im Vollbild übernimmt das cancel-Ereignis).
  const beiTaste = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === 'Escape' && !e.currentTarget.matches(':modal')) schliesseLuna()
  }

  const nimmAn = (neu: typeof luna) => {
    fokusNachAntwort.current = true
    setLuna(neu)
    setEingabe(vorschlag(neu))
  }

  const antworte = async (text: string) => {
    if (!text.trim()) return
    nimmAn(await gefuehrt.antworte(luna, text))
  }

  const aendereAngaben = () => {
    setEinwilligung(false)
    setEinwilligungFehlt(false)
    nimmAn(aendern(luna))
  }

  const sende = async () => {
    setSendend(true)
    try {
      setLuna(gesendet(luna, await submitLead(zuLead(luna))))
    } catch {
      setLuna(gesendet(luna, null))
    } finally {
      setSendend(false)
    }
  }

  const absenden = () => {
    if (!einwilligung) {
      setEinwilligungFehlt(true)
      einwilligungRef.current?.focus()
      return
    }
    void sende()
  }

  return (
    <dialog ref={dialog} id="luna-chat" aria-label={copy.luna.dialogLabel} onClose={beiClose} onKeyDown={beiTaste} className={DIALOG}>
      <Kopf />
      <Fortschritt luna={luna} />
      <Verlauf
        ref={verlauf}
        luna={luna}
        onAntwort={(text) => void antworte(text)}
        zusammenfassung={{
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
        onSchliessen={schliesseLuna}
      />
      <Eingabe
        wert={eingabe}
        onWert={setEingabe}
        onSenden={() => void antworte(eingabe)}
        mitAuswahl={auswahl(luna).length > 0}
        deaktiviert={luna.schritt === 'erfolg'}
      />
    </dialog>
  )
}
