import { copy, fuelle } from '../content/copy'
import { EMAIL, FIRMA, TELEFON, WHATSAPP, mailHref, telHref, whatsappHref } from '../content/contact'
import { Globus } from './ui/Globus'
import { Icon } from './ui/Icon'
import { Symbol3D } from './ui/Symbol3D'

// Links: sichtbar so dicht wie im Entwurf, die Trefferfläche ist 44 px hoch
// (die Kästen überlappen dafür je 4 px, deshalb -my-s1).
const LINK = 'flex min-h-[44px] min-w-[44px] -my-s1 items-center gap-s2 wrap-anywhere text-small text-kalk no-underline transition-colors hover:text-tuerkis motion-reduce:transition-none nav:text-text'
const LISTE = '-mb-s2 flex list-none flex-col p-0'
const SPALTENTITEL = 'mb-s3 font-display text-h5 font-[750] [font-stretch:100%] text-tuerkis'
const KONTAKT_ICON = 'size-s5 shrink-0 text-tuerkis'
// Weiches Leuchten in den Markenfarben, ohne Bewegung; gedämpft, damit der Anruf-Knopf das Auffälligste bleibt.
const LEUCHTEN = 'pointer-events-none absolute aspect-square rounded-pill bg-radial to-transparent to-70%'

export function Footer() {
  const { fuss } = copy
  return (
    <footer className="relative overflow-hidden border-t border-tiefsee-2 bg-tiefsee text-kalk">
      <div aria-hidden="true" className={`${LEUCHTEN} -top-1/2 -left-1/4 w-full from-tuerkis/20 nav:w-1/2`} />
      <div aria-hidden="true" className={`${LEUCHTEN} -right-1/4 -bottom-1/2 w-full from-icon-technik/25 nav:w-1/2`} />

      <div className="wrapper relative flex flex-col gap-s7 pt-s7 pb-s6 nav:gap-s8 nav:pt-s9">
        <div className="grid gap-s7 nav:grid-cols-[minmax(0,1fr)_auto] nav:gap-s9">
          <div className="flex flex-col gap-s4">
            <span role="img" aria-label={copy.kopf.logo} className="flex [--logo-zeile:var(--fx-nebel)]">
              <Icon name="logo" className="aspect-[188/33.57] w-[200px] max-w-full nav:w-[226px]" />
            </span>
            <p className="m-0 max-w-[32em] text-small leading-[1.6] text-nebel nav:text-text nav:leading-[1.6]">
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
                    <Symbol3D name="ui-anrufen" hell trage className={KONTAKT_ICON} />
                    <span className="nav:hidden">{TELEFON}</span>
                    <span className="max-nav:hidden">
                      {fuss.telefon} {TELEFON}
                    </span>
                  </a>
                </li>
                <li className="flex">
                  <a href={whatsappHref} className={LINK}>
                    <Symbol3D name="ui-chat" hell trage className={KONTAKT_ICON} />
                    <span className="nav:hidden">{fuss.whatsapp}</span>
                    <span className="max-nav:hidden">
                      {fuss.whatsapp} {WHATSAPP}
                    </span>
                  </a>
                </li>
                <li className="flex">
                  <a href={mailHref} className={LINK}>
                    <Symbol3D name="ui-senden" hell trage className={KONTAKT_ICON} />
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

        <div className="flex flex-col gap-s2 border-t border-tiefsee-2 pt-s5 text-note text-nebel nav:flex-row nav:flex-wrap nav:justify-between nav:gap-x-s5">
          <span>{fuelle(fuss.copyright, { jahr: __JAHR__, firma: FIRMA })}</span>
          <span>{fuss.preise}</span>
        </div>
      </div>
    </footer>
  )
}
