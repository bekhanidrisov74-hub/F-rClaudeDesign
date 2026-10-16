import { whatsappHref } from '../content/contact'
import { copy } from '../content/copy'
import { Button } from './ui/Button'
import { CallButton } from './ui/CallButton'
import { Icon } from './ui/Icon'

const t = copy.anfrage.seitenkasten

/**
 * Seitenkasten „Lieber sofort sprechen?“ (Screen 01/02): Handy ohne Nummer im Anruf-Knopf,
 * ab 920 px mit Kreis und Nummer (Entscheidung 5). Beide Varianten stehen im Markup, eine ist ausgeblendet.
 */
export function Seitenkasten() {
  return (
    <aside
      aria-labelledby="sofort-titel"
      className="kante flex flex-col gap-s3 rounded-card-lg bg-tiefsee px-s4 py-s5 text-kalk nav:gap-s4 nav:p-s6"
    >
      <h3 id="sofort-titel" className="text-h3-karte nav:text-h2-s">
        {t.titel}
      </h3>
      <p className="text-text text-nebel">{t.text}</p>
      <CallButton variante="karte" nummer className="max-nav:hidden" />
      <CallButton variante="block" className="nav:hidden" />
      <Button art="dunkel" href={whatsappHref} className="min-h-[54px] w-full px-s2 text-body">
        <Icon name="ui-chat" className="size-[20px] nav:size-[22px]" />
        <span>{t.whatsapp}</span>
      </Button>
      <p className="text-note text-nebel">{t.hinweis}</p>
    </aside>
  )
}
