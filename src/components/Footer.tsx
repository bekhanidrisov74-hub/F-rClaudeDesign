import { copy, fuelle } from '../content/copy'
import { EMAIL, FIRMA, TELEFON, WHATSAPP, mailHref, telHref, whatsappHref } from '../content/contact'

// Links: sichtbar so dicht wie im Entwurf, die Trefferfläche ist 44 px hoch
// (die Kästen überlappen dafür je 4 px, deshalb -my-s1).
const LINK = 'flex min-h-[44px] min-w-[44px] -my-s1 items-center wrap-anywhere text-small no-underline nav:text-text'
const SPALTENTITEL = 'mb-s1 nav:mb-s2 font-display text-h5 font-[750] [font-stretch:100%]'

export function Footer() {
  const { fuss } = copy
  return (
    <footer className="bg-tiefsee text-kalk">
      <div className="wrapper flex flex-col gap-s6 pb-s6 pt-s7 nav:gap-s8 nav:pt-s9">
        <div className="flex flex-col gap-s6 nav:grid nav:grid-cols-2">
          <div className="flex flex-col gap-s3">
            <span className="font-display text-logo-fuss font-extrabold tracking-[-0.035em] [font-stretch:100%]">
              {copy.kopf.logo}
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
                    <span className="nav:hidden">{TELEFON}</span>
                    <span className="max-nav:hidden">
                      {fuss.telefon} {TELEFON}
                    </span>
                  </a>
                </li>
                <li className="flex">
                  <a href={whatsappHref} className={LINK}>
                    <span className="nav:hidden">{fuss.whatsapp}</span>
                    <span className="max-nav:hidden">
                      {fuss.whatsapp} {WHATSAPP}
                    </span>
                  </a>
                </li>
                <li className="flex">
                  <a href={mailHref} className={LINK}>
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

        <div className="flex flex-col gap-s2 border-t border-tiefsee-2 pt-s5 text-note text-nebel nav:flex-row nav:flex-wrap nav:justify-between nav:gap-x-s5">
          <span>{fuelle(fuss.copyright, { jahr: __JAHR__, firma: FIRMA })}</span>
          <span>{fuss.preise}</span>
        </div>
      </div>
    </footer>
  )
}
