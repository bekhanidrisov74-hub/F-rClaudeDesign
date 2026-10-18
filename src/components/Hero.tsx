import { copy } from '../content/copy'
import { Button } from './ui/Button'
import { CallButton } from './ui/CallButton'
import { GridPulse } from './ui/GridPulse'
import { Symbol3D } from './ui/Symbol3D'

/**
 * Hero nach dem Entwurfsbild vom 18.10.2026 (Wien-Panorama rechts).
 * Ab 920 px vier Spalten: Randabstand bis zum Inhalt (max. 1140 px breit), Text (höchstens 600 px),
 * Abstand 56 px, Bild bis zum rechten Fensterrand (über 1920 px wächst rechts ein Rand bis zur Breite des linken, damit der Hero mittig wirkt).
 * Darunter erst der Text, dann das Bild.
 */
const SPALTEN =
  'nav:grid nav:grid-cols-[max(var(--fx-gutter),calc((100%_-_var(--fx-container))_/_2))_minmax(0,600px)_var(--fx-s-8)_minmax(0,1fr)_clamp(0px,calc(100%_-_var(--fx-hero-max)),calc((100%_-_var(--fx-container))_/_2))]'

export function Hero() {
  const zeilen = copy.hero.h1
  return (
    <div className={`relative isolate ${SPALTEN}`}>
      <GridPulse />
      <section
        id="start"
        aria-labelledby="hero-titel"
        className="relative z-1 px-gutter py-s5 nav:col-start-2 nav:row-start-1 nav:px-0 nav:pt-s8 nav:pb-s6"
      >
        <div className="flex max-w-[600px] flex-col gap-s4 nav:gap-s5">
          <h1 id="hero-titel" data-grid-avoid className="text-h1 nav:leading-[0.86]">
            {zeilen.map((zeile, i) => (
              <span key={zeile} className={`block ${i === zeilen.length - 1 ? 'text-handwerk-text' : ''}`}>
                {zeile}
              </span>
            ))}
          </h1>
          <p data-grid-avoid className="max-w-[28.5em] text-lead text-schiefer">{copy.hero.lead}</p>

          <div className="mt-s1 flex flex-col gap-s3 kopf:flex-row kopf:items-center">
            <CallButton variante="hero" nummer className="kopf:grow" />
            <Button art="hell" href="#anfrage" className="min-h-[54px] gap-s3 rounded-btn-lg px-s5 text-btn-l kopf:grow nav:min-h-[64px] nav:px-s6">
              <Symbol3D name="ui-chat" className="size-[22px] nav:size-[24px]" />
              <span>{copy.hero.anfrage}</span>
            </Button>
          </div>

          <p data-grid-avoid className="flex items-center gap-s4 rounded-card bg-weiss p-s4 nav:px-s6 nav:text-lead">
            <Symbol3D name="ui-anrufen" gross className="size-[40px] nav:size-[48px]" />
            <span>
              <span className="block">{copy.hero.info[0]}</span>
              <span className="block font-bold">{copy.hero.info[1]}</span>
            </span>
          </p>
        </div>
      </section>

      {/* ponytail: freie Stelle für das Wien-Panorama aus ChatGPT (design/IMAGE-PROMPTS-CHATGPT.md, Bild 1); kommt das Bild, ersetzt <Bildflaeche bild={1}> dieses div.
          Desktop: ab der Lücke unter die Textspalte gezogen und links ausgeblendet; Handy: unter dem Text, oben ausgeblendet. */}
      <div
        aria-hidden="true"
        data-bild="1"
        className="tiefe aspect-[3/2] bg-linie max-nav:mask-t-from-70% nav:col-start-3 nav:col-end-5 nav:row-start-1 nav:-ml-s10 nav:aspect-auto nav:min-h-[640px] nav:mask-l-from-85%"
      />
    </div>
  )
}
