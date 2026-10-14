import { Button } from '../../components/ui/Button'
import { CallButton } from '../../components/ui/CallButton'
import { Icon } from '../../components/ui/Icon'
import { copy } from '../../content/copy'

export interface SendefehlerProps {
  sendend: boolean
  onErneut: () => void
}

const t = copy.luna.fehler

// Screen 10 (Handy) und Screen 12 rechts (Fenster). role="alert": wird beim Erscheinen vorgelesen.
export function Sendefehler({ sendend, onErneut }: SendefehlerProps) {
  // aria-disabled statt disabled: Der Fokus bleibt auf dem Knopf, solange gesendet wird.
  const erneut = () => {
    if (!sendend) onErneut()
  }

  return (
    <div role="alert" className="flex flex-col gap-s3 rounded-card border-2 border-tiefsee bg-weiss p-s4">
      <div className="flex items-start gap-s3">
        <Icon name="ui-warnung" className="size-[28px] text-tiefsee" />
        <div className="flex min-w-0 flex-col gap-s2">
          <h2 className="font-display text-h3 dialog:text-h4">{t.titel}</h2>
          <p className="text-small">{t.text}</p>
        </div>
      </div>

      <CallButton variante="block" label={t.anrufen} />
      <Button
        art="primaer"
        onClick={erneut}
        aria-disabled={sendend}
        className="min-h-[52px] w-full px-s4 text-btn-l font-[750] aria-disabled:cursor-default dialog:min-h-[50px] dialog:text-btn"
      >
        {sendend ? copy.luna.zusammenfassung.sendend : t.erneut}
      </Button>
    </div>
  )
}
