import { copy, fuelle } from '../content/copy'
import { EMAIL, FIRMA, TELEFON, WHATSAPP, mailHref, telHref, whatsappHref } from '../content/contact'
import { PARTNER_PFAD, partner } from '../content/partner'
import { Globus } from './ui/Globus'
import { Icon } from './ui/Icon'
import { IconKreis } from './ui/IconKreis'

// Links: sichtbar so dicht wie im Entwurf, die Trefferfläche ist 44 px hoch
// (die Kästen überlappen dafür je 4 px, deshalb -my-s1).
const LINK = 'flex min-h-[44px] min-w-[44px] -my-s1 items-center gap-s2 wrap-anywhere text-small text-nebel no-underline transition-colors hover:text-weiss motion-reduce:transition-none nav:gap-s3 nav:text-text'
const LISTE = '-mb-s2 flex list-none flex-col p-0'
const SPALTENTITEL = 'titellinie mb-s3 font-display text-h5 font-bold text-weiss'
const KONTAKT_KREIS = 'size-[28px] nav:size-[32px]'
/* gleiche optische Größe: Der Hörer füllt seine Box, Sprechblase und Papierflieger haben Luft im 48er-Raster */
const KONTAKT_ICON = 'size-[14px] nav:size-[16px]'
const KONTAKT_ICON_WEIT = 'size-[17px] nav:size-[20px]'
/* Ein Raster für alles ab 560 px: drei Spalten, Marke über zwei, Globus über der dritten, darunter Seiten | Kontakt | Rechtliches.
   Ab 920 px ist Kontakt breiter (die WhatsApp-Zeile mit Nummer darf nicht umbrechen); die Links-Zeile übernimmt dasselbe Raster,
   damit der Globus auf der Textkante von „Rechtliches“ steht. */
const SPALTEN = 'kopf:grid-cols-3 kopf:gap-x-s4 nav:grid-cols-[1fr_1.25fr_1fr] nav:gap-x-s6 hd:gap-x-s8'

/**
 * Fuß als dunkles Tiefsee-Band (app.css, dunkel): Logo mit weißem „Fixit“, orangem „247“ und Nebel-Zeile, Spalten mit weißen
 * Titeln über einer türkisen Linie, Kontakt mit Icons im Lagune-Kreis. Unten die große Wortmarke, die aus Lagune in die Fläche
 * ausläuft (app.css, wortmarke).
 */
export function Footer() {
  const { fuss } = copy
  return (
    <footer className="dunkel relative overflow-clip">
      <div className="wrapper relative flex flex-col gap-s7 pt-s7 pb-s6 nav:gap-s8 nav:pt-s9">
        <div className={`grid gap-y-s7 nav:gap-y-s9 ${SPALTEN}`}>
          <div className="flex flex-col gap-s4 kopf:col-span-2">
            {/* „Fixit“ in der Schriftfarbe (Weiß), „247“ bleibt Orange; die Zeile darunter ist Nebel (design/icons/logo.svg) */}
            <span role="img" aria-label={copy.kopf.logoBild} className="flex text-weiss [--logo-zeile:var(--fx-nebel)]">
              <Icon name="logo" className="aspect-[188/33.57] w-[205px] max-w-full nav:w-[240px]" />
            </span>
            <p className="m-0 max-w-[32em] text-small leading-[1.6] text-nebel nav:text-text nav:leading-[1.6]">
              {fuss.text}
            </p>
          </div>

          {/* Oberer Teil des Globus (gleiches Seitenverhältnis bei jeder Breite), unten weich ausgeblendet. */}
          <div className="aspect-[320/208] w-full max-w-[320px] self-start overflow-hidden mask-b-from-30%">
            <Globus className="text-nebel" />
          </div>

          <div className={`grid grid-cols-2 gap-x-s4 gap-y-s6 kopf:col-span-3 ${SPALTEN}`}>
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
                <li className="flex">
                  <a href={PARTNER_PFAD} className={LINK}>
                    {partner.einstieg.fuss}
                  </a>
                </li>
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

        <div className="flex flex-col gap-s2 border-t border-tiefsee-2 pt-s5 text-small text-nebel nav:flex-row nav:flex-wrap nav:justify-between nav:gap-x-s5">
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
