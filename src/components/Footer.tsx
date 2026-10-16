import { copy, fuelle } from '../content/copy'
import { EMAIL, FIRMA, TELEFON, WHATSAPP, mailHref, telHref, whatsappHref } from '../content/contact'
import { Icon } from './ui/Icon'

// Links: sichtbar so dicht wie im Entwurf, die Trefferfläche ist 44 px hoch
// (die Kästen überlappen dafür je 4 px, deshalb -my-s1).
const LINK = 'flex min-h-[44px] min-w-[44px] -my-s1 items-center gap-s2 wrap-anywhere text-small no-underline nav:text-text'
const SPALTENTITEL = 'mb-s2 font-display text-h5 font-[750] [font-stretch:100%] text-tuerkis'
const KONTAKT_ICON = 'size-s5 text-tuerkis'
// Weiches Leuchten in den Markenfarben, ohne Bewegung; gedämpft, damit der Anruf-Knopf das Auffälligste bleibt.
const LEUCHTEN = 'pointer-events-none absolute aspect-square rounded-pill bg-radial to-transparent to-70%'

export function Footer() {
  const { fuss } = copy
  return (
    <footer className="relative overflow-hidden bg-tiefsee text-kalk">
      <div aria-hidden="true" className={`${LEUCHTEN} -top-1/2 left-0 w-2/3 from-tuerkis/20 nav:w-1/3`} />
      <div aria-hidden="true" className={`${LEUCHTEN} -bottom-1/2 right-0 w-2/3 from-icon-technik/25 nav:w-1/3`} />

      <div className="wrapper relative flex flex-col gap-s6 pb-s6 pt-s7 nav:gap-s7 nav:pt-s9">
        <div className="grid gap-s6 rounded-card-lg border border-tiefsee-2 bg-tiefsee-2/60 px-s5 py-s6 nav:grid-cols-[3fr_4fr] nav:gap-s8 nav:px-s8 nav:py-s8">
          <div className="flex flex-col gap-s3">
            <span className="flex items-center gap-s3">
              <span className="flex size-s7 shrink-0 items-center justify-center rounded-pill bg-tiefsee text-tuerkis">
                <Icon name="ui-rund-um-die-uhr" className="size-s5" />
              </span>
              <span className="font-display text-logo-fuss font-extrabold tracking-[-0.035em] [font-stretch:100%]">
                {copy.kopf.logo}
              </span>
            </span>
            <p className="m-0 max-w-[32em] text-small leading-[1.6] text-nebel nav:text-text nav:leading-[1.6]">
              {fuss.text}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-s4 nav:grid-cols-[minmax(max-content,1fr)_minmax(max-content,1fr)] nav:gap-x-s6">
            <div>
              <h2 className={SPALTENTITEL}>{fuss.kontakt}</h2>
              <ul className="-mb-s2 flex list-none flex-col p-0">
                <li className="flex">
                  <a href={telHref} className={LINK}>
                    <Icon name="ui-anrufen" className={KONTAKT_ICON} />
                    <span className="nav:hidden">{TELEFON}</span>
                    <span className="max-nav:hidden">
                      {fuss.telefon} {TELEFON}
                    </span>
                  </a>
                </li>
                <li className="flex">
                  <a href={whatsappHref} className={LINK}>
                    <Icon name="ui-chat" className={KONTAKT_ICON} />
                    <span className="nav:hidden">{fuss.whatsapp}</span>
                    <span className="max-nav:hidden">
                      {fuss.whatsapp} {WHATSAPP}
                    </span>
                  </a>
                </li>
                <li className="flex">
                  <a href={mailHref} className={LINK}>
                    <Icon name="ui-senden" className={KONTAKT_ICON} />
                    {EMAIL}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className={SPALTENTITEL}>{fuss.rechtliches}</h2>
              <ul className="-mb-s2 flex list-none flex-col p-0">
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

        <div className="flex flex-col gap-s2 text-note text-nebel nav:flex-row nav:flex-wrap nav:justify-between nav:gap-x-s5">
          <span>{fuelle(fuss.copyright, { jahr: __JAHR__, firma: FIRMA })}</span>
          <span>{fuss.preise}</span>
        </div>
      </div>
    </footer>
  )
}
