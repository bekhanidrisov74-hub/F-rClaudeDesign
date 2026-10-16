import { copy } from '../content/copy'
import { Button } from './ui/Button'
import { CallButton } from './ui/CallButton'
import { Icon } from './ui/Icon'

/** Letzte Zelle im Leistungsraster: „Ihr Problem ist nicht dabei?“ mit Anruf und Luna. */
export function Hilfekarte() {
  return (
    <article className="kante flex flex-col justify-between gap-s4 rounded-card-lg bg-tiefsee p-s5 text-kalk nav:gap-s5 nav:p-s6">
      <div className="flex flex-col gap-s4 nav:gap-s3">
        <span
          aria-hidden="true"
          className="flex size-[52px] items-center justify-center rounded-icon bg-tiefsee-2 nav:size-[56px]"
        >
          <Icon name="luna-signet-glyph" className="size-[30px] nav:size-[32px]" />
        </span>
        <h3 className="text-h3-karte">{copy.leistungen.hilfe.titel}</h3>
        <p className="text-text text-nebel">{copy.leistungen.hilfe.text}</p>
      </div>
      <div className="flex flex-col gap-s3">
        <CallButton variante="block" />
        <Button art="dunkel" href="#luna" className="min-h-[52px] w-full px-s4 text-btn">
          {copy.leistungen.hilfe.luna}
        </Button>
      </div>
    </article>
  )
}
