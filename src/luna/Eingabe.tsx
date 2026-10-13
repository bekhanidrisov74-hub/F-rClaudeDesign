import type { FormEvent } from 'react'
import { Icon } from '../components/ui/Icon'
import { copy } from '../content/copy'

const t = copy.luna.eingabe

interface Props {
  wert: string
  onWert: (wert: string) => void
  onSenden: () => void
  /** Chips vorhanden: „Oder selbst schreiben“, sonst „Nachricht schreiben“ */
  mitAuswahl: boolean
  /** Nach dem Senden der Anfrage */
  deaktiviert: boolean
}

/** Eingabezeile unten (Screen 07, 11). Freitext ist immer erlaubt. */
export function Eingabe({ wert, onWert, onSenden, mitAuswahl, deaktiviert }: Props) {
  const absenden = (e: FormEvent) => {
    e.preventDefault()
    onSenden()
  }
  return (
    <form onSubmit={absenden} className="flex flex-none items-center gap-s2 border-t border-linie bg-weiss px-s3 pt-s3 pb-s4 dialog:pb-s3">
      <label htmlFor="luna-eingabe" className="sr-only">
        {t.label}
      </label>
      <input
        id="luna-eingabe"
        type="text"
        autoComplete="off"
        value={wert}
        disabled={deaktiviert}
        onChange={(e) => onWert(e.target.value)}
        placeholder={mitAuswahl ? t.mitAuswahl : t.ohneAuswahl}
        className="rahmen h-[48px] min-w-0 flex-1 rounded-btn border-rand bg-weiss px-s4 text-text text-tiefsee disabled:bg-kalk"
      />
      <button
        type="submit"
        aria-label={t.senden}
        disabled={deaktiviert}
        className="flex size-[48px] shrink-0 cursor-pointer items-center justify-center rounded-btn bg-tiefsee text-kalk disabled:cursor-default"
      >
        <Icon name="ui-senden" className="size-[22px]" />
      </button>
    </form>
  )
}
