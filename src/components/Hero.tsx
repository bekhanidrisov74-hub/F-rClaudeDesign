import { whatsappHref } from '../content/contact'
import { copy } from '../content/copy'
import { Schnellwahl } from './Schnellwahl'
import { Bildflaeche } from './ui/Bildflaeche'
import { Button } from './ui/Button'
import { CallButton } from './ui/CallButton'
import { GridPulse } from './ui/GridPulse'
import { Symbol3D } from './ui/Symbol3D'

/**
 * Ab 920 px vier Spalten: Randabstand bis zum Inhalt (max. 1140 px breit), Text (höchstens 560 px),
 * Abstand 56 px, Bild bis zum rechten Fensterrand (über 1920 px wächst rechts ein Rand bis zur Breite des linken, damit der Hero mittig wirkt). Darunter gilt die Reihenfolge der DOM-Knoten:
 * Text, Schnellwahl, Bild 1 (Screen 01).
 */
const SPALTEN =
  'nav:grid nav:grid-cols-[max(var(--fx-gutter),calc((100%_-_var(--fx-container))_/_2))_minmax(0,560px)_var(--fx-s-8)_minmax(0,1fr)_clamp(0px,calc(100%_-_var(--fx-hero-max)),calc((100%_-_var(--fx-container))_/_2))]'

const ZWEITKNOPF = 'min-h-[54px] rounded-btn-lg px-s2 text-center text-btn nav:min-h-[58px] nav:px-s4'
const ZWEITICON = 'size-[20px] nav:size-[22px]'

export function Hero() {
  return (
    <div className={`relative isolate ${SPALTEN}`}>
      <GridPulse />
      <section
        id="start"
        aria-labelledby="hero-titel"
        className="px-gutter py-s5 nav:col-start-2 nav:row-start-1 nav:px-0 nav:pt-s9 nav:pb-s10"
      >
        <div className="flex max-w-[560px] flex-col gap-s4 nav:gap-s6 nav:pb-s7">
          <h1 id="hero-titel" data-grid-avoid className="text-h1">
            {copy.hero.h1.map((zeile) => (
              <span key={zeile} className="block">
                {zeile}
              </span>
            ))}
          </h1>
          <p data-grid-avoid className="max-w-[27em] text-lead text-schiefer">{copy.hero.lead}</p>

          <div className="mt-s1 flex flex-col gap-s3 nav:mt-s2 nav:max-w-[470px]">
            <CallButton variante="hero" nummer />
            <div className="grid grid-cols-2 gap-s3">
              <Button art="hell" href={whatsappHref} className={ZWEITKNOPF}>
                <Symbol3D name="ui-chat" className={ZWEITICON} />
                <span>{copy.hero.whatsapp}</span>
              </Button>
              <Button art="hell" href="#anfrage" className={ZWEITKNOPF}>
                <Symbol3D name="ui-formular" className={ZWEITICON} />
                <span>{copy.hero.anfrage}</span>
              </Button>
            </div>
          </div>

          <p data-grid-avoid className="max-w-[34em] text-small text-balance text-schiefer">{copy.hero.hinweis}</p>
        </div>
      </section>

      {/* Ab 920 px überlappt die Schnellwahl die Bildfläche um 96 px nach oben */}
      <div className="relative z-2 nav:col-span-full nav:row-start-2 nav:-mt-s10">
        <Schnellwahl />
      </div>

      {/* Unter 920 px mindestens 300 px hoch, darüber 62 % der Breite: So bleibt von Helm bis Schlüssel an der Armatur alles im Streifen (Bildhöhe 11–73 %). Desktop: Figur und Armatur in der Spalte */}
      <Bildflaeche
        bild={1}
        className="tiefe h-[max(300px,62vw)] [&_img]:object-[50%_30%] nav:col-start-4 nav:row-start-1 nav:h-auto nav:min-h-[640px] nav:[&_img]:object-[50%_50%]"
      />
    </div>
  )
}
