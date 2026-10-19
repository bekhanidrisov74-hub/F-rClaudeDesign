import { copy, fuelle } from '../content/copy'
import { EMAIL, FIRMA, TELEFON, WHATSAPP, mailHref, telHref, whatsappHref } from '../content/contact'
import { Globus } from './ui/Globus'
import { Icon } from './ui/Icon'
import { IconKreis } from './ui/IconKreis'

// Links: sichtbar so dicht wie im Entwurf, die Trefferfläche ist 44 px hoch
// (die Kästen überlappen dafür je 4 px, deshalb -my-s1).
const LINK = 'flex min-h-[44px] min-w-[44px] -my-s1 items-center gap-s2 wrap-anywhere text-small text-schiefer no-underline transition-colors hover:text-tiefsee motion-reduce:transition-none nav:gap-s3 nav:text-text'
const LISTE = '-mb-s2 flex list-none flex-col p-0'
const SPALTENTITEL = 'titellinie mb-s3 font-display text-h5 font-bold text-tiefsee'
const KONTAKT_KREIS = 'size-[28px] nav:size-[32px]'
/* gleiche optische Größe: Der Hörer füllt seine Box, Sprechblase und Papierflieger haben Luft im 48er-Raster */
const KONTAKT_ICON = 'size-[14px] nav:size-[16px]'
const KONTAKT_ICON_WEIT = 'size-[17px] nav:size-[20px]'

/**
 * Fuß im Stil des Kopfs („Hero – Desktop 1586“): helle Fläche mit Haarlinie oben, Logo in Farbe, Spalten mit Titeln über
 * einer türkisen Linie, Kontakt mit Icons im Lagune-Kreis. Unten die große Wortmarke als helles Wasserzeichen (app.css).
 */
export function Footer() {
  const { fuss } = copy
  return (
    <footer className="relative overflow-clip border-t border-linie bg-kalk-2 text-tiefsee">
      <div className="wrapper relative flex flex-col gap-s7 pt-s7 pb-s6 nav:gap-s8 nav:pt-s9">
        <div className="grid gap-s7 nav:grid-cols-[minmax(0,1fr)_auto] nav:gap-s9">
          <div className="flex flex-col gap-s4">
            <span role="img" aria-label={copy.kopf.logoBild} className="flex text-tiefsee">
              <Icon name="logo" className="aspect-[188/33.57] w-[205px] max-w-full nav:w-[240px]" />
            </span>
            <p className="m-0 max-w-[32em] text-small leading-[1.6] text-schiefer nav:text-text nav:leading-[1.6]">
              {fuss.text}
            </p>
            {/* Oberer Teil des Globus, unten weich ausgeblendet. */}
            <div className="h-[208px] max-w-[320px] overflow-hidden mask-b-from-30%">
              <Globus />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-s4 gap-y-s6 kopf:grid-cols-3 nav:grid-cols-[repeat(3,max-content)] nav:gap-x-s8">
            <nav aria-label={fuss.seiten}>
              <h2 className={SPALTENTITEL}>{fuss.seiten}</h2>
              <ul className={LISTE}>
                {copy.kopf.nav.map((link) => (
                  <li key={link.href} className="flex">
                    {/* ponytail: „/#…“ trifft auf der Startseite und auf den Rechtsseiten */}
                    <a href={`/${link.href}`} className={LINK}>
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className={SPALTENTITEL}>{fuss.kontakt}</h2>
              <ul className={LISTE}>
                <li className="flex">
                  <a href={telHref} className={LINK}>
                    <IconKreis name="telefon" className={KONTAKT_KREIS} icon={KONTAKT_ICON} />
                    <span className="nav:hidden">{TELEFON}</span>
                    <span className="max-nav:hidden">
                      {fuss.telefon} {TELEFON}
                    </span>
                  </a>
                </li>
                <li className="flex">
                  <a href={whatsappHref} className={LINK}>
                    <IconKreis name="ui-chat" className={KONTAKT_KREIS} icon={KONTAKT_ICON_WEIT} />
                    <span className="nav:hidden">{fuss.whatsapp}</span>
                    <span className="max-nav:hidden">
                      {fuss.whatsapp} {WHATSAPP}
                    </span>
                  </a>
                </li>
                <li className="flex">
                  <a href={mailHref} className={LINK}>
                    <IconKreis name="ui-senden" className={KONTAKT_KREIS} icon={KONTAKT_ICON_WEIT} />
                    {EMAIL}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className={SPALTENTITEL}>{fuss.rechtliches}</h2>
              <ul className={LISTE}>
                {fuss.links.map((link) => (
                  <li key={link.href} className="flex">
                    <a href={link.href} className={LINK}>
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-s2 border-t border-linie pt-s5 text-small text-schiefer nav:flex-row nav:flex-wrap nav:justify-between nav:gap-x-s5">
          <span>{fuelle(fuss.copyright, { jahr: __JAHR__, firma: FIRMA })}</span>
          <span>{fuss.preise}</span>
        </div>
      </div>

      {/* Große Wortmarke, reine Dekoration (das Logo steht oben im Fuß) */}
      <div aria-hidden="true" className="wortmarke">
        <div className="wrapper">{copy.kopf.logo}</div>
      </div>
    </footer>
  )
}
