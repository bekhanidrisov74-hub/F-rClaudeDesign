import { copy } from '../content/copy'
import { Button } from './ui/Button'
import { CallButton } from './ui/CallButton'
import { IconKreis } from './ui/IconKreis'

/** Letzte Zelle im Leistungsraster: „Ihr Problem ist nicht dabei?“ mit Anruf und Luna, als Hinweiskasten wie im Hero. */
export function Hilfekarte() {
  return (
    <article className="flex flex-col justify-between gap-s4 rounded-card-lg bg-eis p-s5 text-tiefsee nav:gap-s5 nav:p-s6">
      <div className="flex flex-col gap-s4 nav:gap-s3">
        <IconKreis name="luna-signet-glyph" dunkel className="size-[56px] nav:size-[60px]" icon="size-[30px] nav:size-[32px]" />
        <h3 className="text-h3-karte">{copy.leistungen.hilfe.titel}</h3>
        <p className="text-text text-schiefer">{copy.leistungen.hilfe.text}</p>
      </div>
      <div className="flex flex-col gap-s3">
        <CallButton variante="block" />
        <Button art="hell" href="#luna" className="min-h-[54px] w-full rounded-btn-lg px-s4 text-btn">
          {copy.leistungen.hilfe.luna}
        </Button>
      </div>
    </article>
  )
}
