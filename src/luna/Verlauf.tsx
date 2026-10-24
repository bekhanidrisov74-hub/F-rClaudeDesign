import type { ReactNode, Ref } from 'react'
import { Chip } from '../components/ui/Chip'
import { Icon } from '../components/ui/Icon'
import { Loader } from '../components/ui/Loader'
import { AUFTRAG_AUFGEGEBEN, copy } from '../content/copy'
import { Erfolg } from './cards/Erfolg'
import { Kurzfassung } from './cards/Kurzfassung'
import { Sendefehler } from './cards/Sendefehler'
import { Zusammenfassung, type ZusammenfassungProps } from './cards/Zusammenfassung'
import { auswahl, offeneFrage, type Kontakt, type Nachricht, type Zustand } from './flow'

const t = copy.luna

const BLASE = 'max-w-[86%] break-words text-pretty rounded-card px-s4 py-s3 text-text'
const VON: Record<Nachricht['von'], string> = {
  luna: 'self-start rounded-bl-ecke bg-eis text-tiefsee',
  nutzer: 'self-end rounded-br-ecke bg-tiefsee text-weiss',
  notruf: 'self-start rounded-bl-ecke border-2 border-tiefsee bg-weiss font-bold text-tiefsee',
}

/** data-von: LunaChat zeigt nach einer Antwort die erste Luna-Blase hinter der letzten Kundenblase ab der ersten Zeile. */
function Blase({ von, children }: { von: Nachricht['von']; children: ReactNode }) {
  if (von === 'notruf')
    return (
      // Notruf-Hinweis (Aufgabe, EMERGENCY): wird sofort vorgelesen, der Ablauf läuft danach weiter.
      <div role="alert" data-von={von} className={`${BLASE} ${VON.notruf} flex items-start gap-s2`}>
        <Icon name="ui-warnung" className="mt-px size-[22px]" />
        <span>{children}</span>
      </div>
    )
  return (
    <div data-von={von} className={`${BLASE} ${VON[von]}`}>
      {children}
    </div>
  )
}

/** Geschützte Leerzeichen: Telefonnummern und Angaben wie „140 €“, „100 %“, „8 Uhr“ brechen nicht mitten drin um. */
const ungetrennt = (text: string) => text.replace(/(?<=\d) (?=\d|€|%|Uhr\b)/g, ' ')

/** Nachrichten als Text: Modell- und Nutzertext sind fremd, React setzt sie nur als Text (nie als HTML). */
function Nachrichten({ verlauf }: { verlauf: Nachricht[] }) {
  return verlauf.map((n, i) => (
    <Blase key={i} von={n.von}>
      {ungetrennt(n.text)}
    </Blase>
  ))
}

/** Luna verarbeitet gerade eine Antwort: die Kundennachricht steht schon da (die KI braucht ein paar Sekunden), darunter die Ladeblase. */
function Laden({ wartet }: { wartet: string | null }) {
  return (
    <>
      {/* aria-hidden: Die Live-Region liest die Kundennachricht mit der Antwort vor, nicht zweimal */}
      {wartet && (
        <div aria-hidden="true" className="contents">
          <Blase von="nutzer">{ungetrennt(wartet)}</Blase>
        </div>
      )}
      <div aria-hidden="true" className={`${BLASE} ${VON.luna} flex`}>
        <Loader groesse={40} />
      </div>
    </>
  )
}

interface Props {
  luna: Zustand
  /** Luna verarbeitet gerade eine Antwort */
  denkt: boolean
  /** Die Nachricht, auf die Luna gerade antwortet (steht schon da, bevor die Antwort kommt) */
  wartet: string | null
  /** Der scrollende Bereich; LunaChat hält ihn unten */
  ref: Ref<HTMLDivElement>
  /** Chip oder Freitext als Antwort */
  onAntwort: (text: string) => void
  kontakt: Kontakt
  zusammenfassung: Omit<ZusammenfassungProps, 'anfrage'>
  sendend: boolean
  onErneut: () => void
  onNeu: () => void
  onSchliessen: () => void
}

/**
 * Verlauf (Screen 07–12): helle Fläche, Luna in Eis-Blasen wie der Hinweiskasten des Hero, scrollt, unten ausgerichtet.
 * Der innere Block mit `mt-auto` richtet unten aus, ohne bei langem Inhalt oben abzuschneiden.
 * Die Region aria-live="polite" ist dauerhaft da; Chips stehen außerhalb, damit sie nicht mitgesprochen werden.
 * Nach dem Senden ersetzt der Erfolg den Verlauf (Screen 09, 12 Mitte). Beim Fehler bleibt er im Fenster
 * sichtbar (Screen 12 rechts), am Handy nicht (Screen 10).
 * Fragen in der Zusammenfassung und nach dem Senden stehen unter der Karte (luna.vorKarte), dort, wo man gerade liest.
 */
export function Verlauf({ luna, denkt, wartet, ref, onAntwort, kontakt, zusammenfassung, sendend, onErneut, onNeu, onSchliessen }: Props) {
  const chips = denkt ? [] : auswahl(luna)
  const frage = offeneFrage(luna)
  const gruppe =
    luna.phase === 'INITIAL' || luna.phase === 'CLASSIFYING'
      ? t.auswahlGewerk
      : frage?.id === 'dringlichkeit'
        ? t.auswahlDringlichkeit
        : t.auswahlAntwort

  return (
    <div
      ref={ref}
      className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-kalk p-s4 duenner-balken"
    >
      <div className="mt-auto flex flex-col gap-s3">
        <div aria-live="polite" aria-busy={denkt} className="flex flex-col gap-s3">
          {luna.phase === 'COMPLETED' ? (
            <>
              {/* Am Handy zeigt Screen 09 nur Echo und Erfolg */}
              <div className="max-dialog:hidden">
                <Kurzfassung anfrage={luna.anfrage} kontakt={kontakt} />
              </div>
              <Blase von="nutzer">{AUFTRAG_AUFGEGEBEN}</Blase>
              <Erfolg luna={luna} kontakt={kontakt} onNeu={onNeu} onSchliessen={onSchliessen} />
              <Nachrichten verlauf={luna.verlauf} />
              {denkt && <Laden wartet={wartet} />}
            </>
          ) : (
            luna.phase !== 'ERROR' && (
              <>
                <Nachrichten verlauf={luna.phase === 'SUMMARY' ? luna.verlauf.slice(0, luna.vorKarte) : luna.verlauf} />
                {luna.phase === 'SUMMARY' && (
                  <>
                    <Zusammenfassung anfrage={luna.anfrage} {...zusammenfassung} />
                    <Nachrichten verlauf={luna.verlauf.slice(luna.vorKarte)} />
                  </>
                )}
                {denkt && <Laden wartet={wartet} />}
              </>
            )
          )}
        </div>

        {/* Der Fehler meldet sich selbst per role="alert", deshalb steht er außerhalb der höflichen Region */}
        {luna.phase === 'ERROR' && (
          <>
            {/* Bisheriger Verlauf, nicht in der Live-Region (wird nicht noch einmal angesagt) */}
            <div className="flex flex-col gap-s3 max-dialog:hidden">
              <Nachrichten verlauf={luna.verlauf} />
            </div>
            <div data-karte className="flex flex-col gap-s3">
              <Kurzfassung anfrage={luna.anfrage} kontakt={kontakt} />
              <Sendefehler sendend={sendend} onErneut={onErneut} />
            </div>
          </>
        )}

        {chips.length > 0 && (
          <div role="group" data-auswahl aria-label={gruppe} className="flex flex-wrap gap-s2">
            {chips.map((chip) => (
              <Chip key={chip} onClick={() => onAntwort(chip)}>
                {chip}
              </Chip>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
