import type { ReactNode, Ref } from 'react'
import { Chip } from '../components/ui/Chip'
import { Icon } from '../components/ui/Icon'
import { AUFTRAG_AUFGEGEBEN, copy } from '../content/copy'
import { Erfolg } from './cards/Erfolg'
import { Kurzfassung } from './cards/Kurzfassung'
import { Sendefehler } from './cards/Sendefehler'
import { Zusammenfassung, type ZusammenfassungProps } from './cards/Zusammenfassung'
import { auswahl, offeneFrage, type Kontakt, type Nachricht, type Zustand } from './flow'

const t = copy.luna

const BLASE = 'max-w-[86%] break-words rounded-card px-s4 py-s3 text-text'
const VON: Record<Nachricht['von'], string> = {
  luna: 'self-start rounded-bl-ecke border border-linie bg-weiss text-tiefsee',
  nutzer: 'self-end rounded-br-ecke bg-tiefsee text-kalk',
  notruf: 'self-start rounded-bl-ecke border-2 border-tiefsee bg-weiss font-bold text-tiefsee',
}

function Blase({ von, children }: { von: Nachricht['von']; children: ReactNode }) {
  if (von === 'notruf')
    return (
      // Notruf-Hinweis (Aufgabe, EMERGENCY): wird sofort vorgelesen, der Ablauf läuft danach weiter.
      <div role="alert" className={`${BLASE} ${VON.notruf} flex items-start gap-s2`}>
        <Icon name="ui-warnung" className="mt-px size-[22px] shrink-0" />
        <span>{children}</span>
      </div>
    )
  return <div className={`${BLASE} ${VON[von]}`}>{children}</div>
}

/** Nachrichten als Text: Modell- und Nutzertext sind fremd, React setzt sie nur als Text (nie als HTML). */
function Nachrichten({ verlauf }: { verlauf: Nachricht[] }) {
  return verlauf.map((n, i) => (
    <Blase key={i} von={n.von}>
      {n.text}
    </Blase>
  ))
}

interface Props {
  luna: Zustand
  /** Luna verarbeitet gerade eine Antwort */
  denkt: boolean
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
 * Verlauf (Screen 07–12): Kalk-Fläche, scrollt, unten ausgerichtet.
 * Der innere Block mit `mt-auto` richtet unten aus, ohne bei langem Inhalt oben abzuschneiden.
 * Die Region aria-live="polite" ist dauerhaft da; Chips stehen außerhalb, damit sie nicht mitgesprochen werden.
 * Nach dem Senden ersetzt der Erfolg den Verlauf (Screen 09, 12 Mitte). Beim Fehler bleibt er im Fenster
 * sichtbar (Screen 12 rechts), am Handy nicht (Screen 10).
 */
export function Verlauf({ luna, denkt, ref, onAntwort, kontakt, zusammenfassung, sendend, onErneut, onNeu, onSchliessen }: Props) {
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
            </>
          ) : (
            luna.phase !== 'ERROR' && (
              <>
                <Nachrichten verlauf={luna.verlauf} />
                {denkt && (
                  <div aria-hidden="true" className={`${BLASE} ${VON.luna}`}>
                    …
                  </div>
                )}
                {luna.phase === 'SUMMARY' && <Zusammenfassung anfrage={luna.anfrage} {...zusammenfassung} />}
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
