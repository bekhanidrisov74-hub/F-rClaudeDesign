import { copy } from '../content/copy'
import { Vertrauensleiste } from './Vertrauensleiste'
import { CallButton } from './ui/CallButton'
import { Icon } from './ui/Icon'

/** Breiten der AVIF/WebP-Fassungen des Fotos, wie in scripts/export-hero.mjs; 1006 ist die Originalbreite */
const HERO_BREITEN = [480, 800, 1006]
const fassungen = (format: string) =>
  HERO_BREITEN.map((breite) => `/images/hero-wien${breite === 1006 ? '' : `-${breite}`}.${format} ${breite}w`).join(', ')

/**
 * Hero nach dem Entwurf „Hero – Desktop 1586“ (styles/hero.css): Text links, Wien mit dem Stephansdom rechts,
 * darunter die vier Vorteile auf derselben Fläche (das Foto reicht 27 px in sie hinein).
 * Unter 1280 px untereinander: Text, Foto, Vorteile.
 * Foto: ab 1280 px das Original-JPG aus dem Entwurf (pixelgleich), darunter in voller Breite als AVIF/WebP, damit es am
 * Handy schnell lädt (dort ist es beim Laden das größte sichtbare Element).
 */
export function Hero() {
  const zeilen = copy.hero.h1
  return (
    <div className="hd">
      <section id="start" aria-labelledby="hero-titel" className="hd-hero">
        <div aria-hidden="true" className="hd-raster" />
        <div className="hd-foto">
          <picture>
            <source media="(min-width: 80rem)" srcSet="/images/hero-wien.jpg" />
            <source type="image/avif" srcSet={fassungen('avif')} sizes="100vw" />
            <source type="image/webp" srcSet={fassungen('webp')} sizes="100vw" />
            <img src="/images/hero-wien.jpg" alt={copy.hero.foto} width={1006} height={724} fetchPriority="high" decoding="async" />
          </picture>
        </div>

        <div className="hd-text">
          <h1 id="hero-titel" className="hd-titel">
            {zeilen.map((zeile, i) => (
              <span key={zeile} className={i === zeilen.length - 1 ? 'hd-akzent' : undefined}>
                {zeile}
              </span>
            ))}
          </h1>
          <p className="hd-lead">{copy.hero.lead}</p>

          <div className="hd-ctas">
            <CallButton variante="hero" nummer />
            <a href="#anfrage" className="hd-anfrage">
              <Icon name="anfrage" className="hd-anfrage-icon" />
              <span className="hd-anfrage-label">{copy.hero.anfrage}</span>
            </a>
          </div>

          <div className="hd-info">
            <Icon name="hilfe" className="hd-info-icon" />
            <p>
              {/* Leerzeichen vor dem Umbruch: Am Handy blendet hero.css den Umbruch aus, dann fließt der Satz weiter */}
              {copy.hero.hinweis[0]}{' '}
              <br />
              <strong>{copy.hero.hinweis[1]}</strong>
            </p>
          </div>
        </div>
      </section>

      <Vertrauensleiste />
    </div>
  )
}
