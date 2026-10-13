import type { ReactNode, Ref } from 'react'
import { Chip } from '../components/ui/Chip'
import { AUFTRAG_AUFGEGEBEN, copy } from '../content/copy'
import { Erfolg } from './cards/Erfolg'
import { Kurzfassung } from './cards/Kurzfassung'
import { Sendefehler } from './cards/Sendefehler'
import { Zusammenfassung, type ZusammenfassungProps } from './cards/Zusammenfassung'
import { auswahl, type Nachricht, type Zustand } from './flow'

const t = copy.luna

const BLASE = 'max-w-[86%] break-words rounded-card px-s4 py-s3 text-text'
const VON: Record<Nachricht['von'], string> = {
  luna: 'self-start rounded-bl-ecke border border-linie bg-weiss text-tiefsee',
  nutzer: 'self-end rounded-br-ecke bg-tiefsee text-kalk',
}

function Blase({ von, children }: { von: Nachricht['von']; children: ReactNode }) {
  return <div className={`${BLASE} ${VON[von]}`}>{children}</div>
}

interface Props {
  luna: Zustand
  /** Der scrollende Bereich; LunaChat hält ihn unten */
  ref: Ref<HTMLDivElement>
  /** Chip oder Freitext als Antwort */
  onAntwort: (text: string) => void
  zusammenfassung: Omit<ZusammenfassungProps, 'angaben'>
  sendend: boolean
  onErneut: () => void
  onSchliessen: () => void
}

/**
 * Verlauf (Screen 07–12): Kalk-Fläche, scrollt, unten ausgerichtet.
 * Der innere Block mit `mt-auto` richtet unten aus, ohne bei langem Inhalt oben abzuschneiden.
 * Die Region aria-live="polite" ist dauerhaft da; Chips stehen außerhalb, damit sie nicht mitgesprochen werden.
 * Nach dem Senden ersetzen Erfolg bzw. Fehler den Verlauf (Screen 09, 10, 12).
 */
export function Verlauf({ luna, ref, onAntwort, zusammenfassung, sendend, onErneut, onSchliessen }: Props) {
  const chips = auswahl(luna)

  return (
    <div ref={ref} className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-kalk p-s4">
      <div className="mt-auto flex flex-col gap-s3">
        <div aria-live="polite" className="flex flex-col gap-s3">
          {luna.schritt === 'erfolg' ? (
            <>
              {/* Am Handy zeigt Screen 09 nur Echo und Erfolg */}
              <div className="max-dialog:hidden">
                <Kurzfassung angaben={luna.angaben} />
              </div>
              <Blase von="nutzer">{AUFTRAG_AUFGEGEBEN}</Blase>
              <Erfolg angaben={luna.angaben} anfragenummer={luna.anfragenummer} onSchliessen={onSchliessen} />
            </>
          ) : (
            luna.schritt !== 'fehler' && (
              <>
                {luna.verlauf.map((n, i) => (
                  <Blase key={i} von={n.von}>
                    {n.text}
                  </Blase>
                ))}
                {luna.schritt === 'zusammenfassung' && <Zusammenfassung angaben={luna.angaben} {...zusammenfassung} />}
              </>
            )
          )}
        </div>

        {/* Der Fehler meldet sich selbst per role="alert", deshalb steht er außerhalb der höflichen Region */}
        {luna.schritt === 'fehler' && (
          <>
            <Kurzfassung angaben={luna.angaben} />
            <Sendefehler sendend={sendend} onErneut={onErneut} />
          </>
        )}

        {chips.length > 0 && (
          <div
            role="group"
            data-auswahl
            aria-label={luna.schritt === 'gewerk' ? t.auswahlGewerk : t.auswahlDringlichkeit}
            className="flex flex-wrap gap-s2"
          >
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
