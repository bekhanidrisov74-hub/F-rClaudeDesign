import { Icon } from '../components/ui/Icon'
import { telHref } from '../content/contact'
import { copy, fuelle } from '../content/copy'
import { useOverlays } from '../overlays'
import { ANZAHL_SCHRITTE, fortschritt, type Zustand } from './flow'

const t = copy.luna

/**
 * Kopf des Chats (Screen 07, 11). Ein <div>, kein <header>: Der Seitenkopf bleibt der einzige Seitenbereich dieser Art.
 * Fenster (ab 640 px): Signet, Name, rechts „Chat minimieren“.
 * Vollbild (darunter): links „Chat schließen“, rechts ein kleiner Anruf-Knopf.
 */
export function Kopf() {
  const { schliesseLuna } = useOverlays()
  return (
    <div className="flex h-[72px] flex-none items-center gap-s3 border-b border-linie bg-weiss pr-s3 pl-s2 dialog:h-[68px] dialog:pr-s2 dialog:pl-s4">
      <button
        type="button"
        aria-label={t.schliessen}
        onClick={schliesseLuna}
        className="flex size-[44px] shrink-0 cursor-pointer items-center justify-center rounded-chip text-tiefsee dialog:hidden"
      >
        <Icon name="ui-schliessen" className="size-[22px]" />
      </button>

      <span aria-hidden="true" className="flex size-[40px] shrink-0 items-center justify-center rounded-pill bg-tiefsee">
        <Icon name="luna-signet-glyph" className="size-[24px]" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="font-display text-h5 font-[750] [font-stretch:100%]">{t.name}</span>
        <span className="text-note text-schiefer">{t.rolle}</span>
      </span>

      <a
        href={telHref}
        className="ml-auto flex min-h-[44px] shrink-0 items-center gap-s2 rounded-pill bg-tuerkis pr-s4 pl-s3 font-display text-small font-extrabold text-tiefsee no-underline transition-colors hover:bg-tuerkis-tief selection:bg-tiefsee selection:text-tuerkis dialog:hidden"
      >
        <Icon name="ui-anrufen" className="size-[16px]" />
        <span>{copy.kopf.anrufen}</span>
      </a>
      <button
        type="button"
        aria-label={t.minimieren}
        onClick={schliesseLuna}
        className="ml-auto flex size-[44px] shrink-0 cursor-pointer items-center justify-center rounded-chip text-tiefsee max-dialog:hidden"
      >
        <Icon name="ui-aufklappen" className="size-[22px]" />
      </button>
    </div>
  )
}

/** Fortschrittsbalken unter dem Kopf: Problem → Details → Ort → Prüfen. Nach dem Abschluss (null) gibt es keinen Balken. */
export function Fortschritt({ luna }: { luna: Zustand }) {
  const x = fortschritt(luna)
  if (x === null) return null
  const text = fuelle(t.fortschritt, { x, n: ANZAHL_SCHRITTE, schritt: t.schritte[x - 1] })
  return (
    <div
      role="progressbar"
      aria-label={text}
      aria-valuemin={1}
      aria-valuemax={ANZAHL_SCHRITTE}
      aria-valuenow={x}
      aria-valuetext={text}
      className="h-[4px] flex-none bg-linie"
    >
      <div
        className="h-full bg-tiefsee transition-[width] duration-(--fx-dur-chat) ease-fx"
        style={{ width: `${(x / ANZAHL_SCHRITTE) * 100}%` }}
      />
    </div>
  )
}
