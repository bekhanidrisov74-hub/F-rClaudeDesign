import { whatsappHref } from '../content/contact'
import { copy } from '../content/copy'
import { Schnellwahl } from './Schnellwahl'
import { Bildflaeche } from './ui/Bildflaeche'
import { Button } from './ui/Button'
import { CallButton } from './ui/CallButton'
import { Icon } from './ui/Icon'

/**
 * Ab 920 px vier Spalten: Randabstand bis zum Inhalt (max. 1140 px breit), Text (höchstens 560 px),
 * Abstand 56 px, Bild bis zum rechten Fensterrand. Darunter gilt die Reihenfolge der DOM-Knoten:
 * Text, Schnellwahl, Bild 1 (Screen 01).
 */
const SPALTEN =
  'nav:grid nav:grid-cols-[max(var(--fx-gutter),calc((100%_-_var(--fx-container))_/_2))_minmax(0,560px)_var(--fx-s-8)_minmax(0,1fr)]'

const ZWEITKNOPF = 'min-h-[54px] rounded-btn-lg px-s2 text-center text-btn nav:min-h-[58px] nav:px-s4'
const ZWEITICON = 'size-[20px] nav:size-[22px]'

export function Hero() {
  return (
    <div className={SPALTEN}>
      <section
        id="start"
        aria-labelledby="hero-titel"
        className="px-gutter py-s5 nav:col-start-2 nav:row-start-1 nav:px-0 nav:pt-s9 nav:pb-s10"
      >
        <div className="flex max-w-[560px] flex-col gap-s4 nav:gap-s6 nav:pb-s7">
          <h1 id="hero-titel" className="text-h1">
            {copy.hero.h1.map((zeile) => (
              <span key={zeile} className="block">
                {zeile}
              </span>
            ))}
          </h1>
          <p className="max-w-[27em] text-lead text-schiefer">{copy.hero.lead}</p>

          <div className="mt-s1 flex flex-col gap-s3 nav:mt-s2 nav:max-w-[470px]">
            <CallButton variante="hero" nummer />
            <div className="grid grid-cols-2 gap-s3">
              <Button art="hell" href={whatsappHref} className={ZWEITKNOPF}>
                <Icon name="ui-chat" className={ZWEITICON} />
                <span>{copy.hero.whatsapp}</span>
              </Button>
              <Button art="hell" href="#anfrage" className={ZWEITKNOPF}>
                <Icon name="ui-formular" className={ZWEITICON} />
                <span>{copy.hero.anfrage}</span>
              </Button>
            </div>
          </div>

          <p className="max-w-[34em] text-small text-balance text-schiefer">{copy.hero.hinweis}</p>
        </div>
      </section>

      {/* Ab 920 px überlappt die Schnellwahl die Bildfläche um 96 px nach oben */}
      <div className="relative z-2 nav:col-span-full nav:row-start-2 nav:-mt-s10">
        <Schnellwahl />
      </div>

      <Bildflaeche bild={1} className="h-[300px] nav:col-start-4 nav:row-start-1 nav:h-auto nav:min-h-[640px]" />
    </div>
  )
}
