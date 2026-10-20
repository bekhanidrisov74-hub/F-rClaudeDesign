import { whatsappHref } from '../content/contact'
import { copy } from '../content/copy'
import { Button } from './ui/Button'
import { CallButton } from './ui/CallButton'
import { Icon } from './ui/Icon'

const t = copy.anfrage.seitenkasten

/**
 * Seitenkasten „Lieber sofort sprechen?“ (Screen 01/02) als Hinweiskasten wie im Hero: Eis, Headset, Anruf-Knopf.
 * Innenabstand wie die Formularkarte (ab 640 px s6); der unsichtbare Rand ersetzt deren 1 px Linie, damit die Inhaltskanten
 * untereinander stimmen.
 * Handy ohne Nummer im Anruf-Knopf, ab 920 px mit Kreis und Nummer (Entscheidung 5). Beide Varianten stehen im Markup,
 * eine ist ausgeblendet.
 */
export function Seitenkasten() {
  return (
    <aside
      aria-labelledby="sofort-titel"
      className="flex flex-col gap-s3 rounded-card-lg border border-transparent bg-eis px-s4 py-s5 text-tiefsee dialog:p-s6 nav:gap-s4"
    >
      <Icon name="hilfe" className="h-[49px] w-[44px] nav:h-[61px] nav:w-[55px]" />
      <h3 id="sofort-titel" className="text-h3-karte nav:text-h2-s">
        {t.titel}
      </h3>
      <p className="text-text text-schiefer">{t.text}</p>
      <CallButton variante="karte" nummer className="max-nav:hidden" />
      <CallButton variante="block" className="nav:hidden" />
      <Button art="hell" href={whatsappHref} className="min-h-[56px] w-full rounded-btn-lg px-s2 text-btn">
        <Icon name="ui-chat" className="size-[22px]" />
        <span>{t.whatsapp}</span>
      </Button>
      <p className="text-small text-schiefer">{t.hinweis}</p>
    </aside>
  )
}
