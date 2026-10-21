import { copy, fuelle, GEFAHR } from '../../content/copy'

const t = copy.weiter

/**
 * „So geht es weiter“ in beiden Erfolgskarten (Formular und Luna): drei Schritte, auf Wunsch die Zeile zur Bestätigungsmail.
 * `ebene` ist die Überschrift-Ebene unter dem Kartentitel (Formular-Karte h3, darunter 4; Luna-Karte h2, darunter 3).
 * `email` nur, wenn die Adresse angegeben wurde; sie darf umbrechen, damit nichts über das Luna-Fenster hinausläuft.
 * `mitSchritten` nur, wenn ein Betrieb gefunden wurde (match FOUND): Sonst sprächen die Schritte von einem vermittelten
 * Betrieb, den es noch nicht gibt; dann bleibt nur die Zeile zur Bestätigungsmail.
 */
export function SoGehtEsWeiter({ ebene, email, mitSchritten }: { ebene: 3 | 4; email?: string; mitSchritten: boolean }) {
  const Titel = `h${ebene}` as const
  const bestaetigung = email && <p className="break-words text-small">{fuelle(t.email, { email })}</p>
  if (!mitSchritten) return bestaetigung || null
  return (
    <div className="flex min-w-0 flex-col gap-s3 border-t border-linie pt-s4">
      <Titel className="font-display text-h5">{t.titel}</Titel>
      {/* role="list": Safari/VoiceOver behält die Listensemantik sonst nicht, wenn list-style entfällt */}
      <ol role="list" className="flex flex-col gap-s3">
        {t.schritte.map((schritt, index) => (
          <li key={schritt.titel} className="flex items-start gap-s3">
            <span aria-hidden="true" className="flex size-[28px] shrink-0 items-center justify-center rounded-pill bg-lagune text-small font-bold text-tiefsee">
              {index + 1}
            </span>
            <div className="flex min-w-0 flex-col">
              <p className="text-text font-bold">{schritt.titel}</p>
              <p className="text-small text-schiefer">{schritt.text}</p>
            </div>
          </li>
        ))}
      </ol>
      {bestaetigung}
    </div>
  )
}

/** Gefahr-Hinweis unter den Schritten, nach dem Tipp und vor den Knöpfen; derselbe Wortlaut wie in den häufigen Fragen. */
export function GefahrHinweis() {
  return <p className="text-small text-schiefer">{GEFAHR}</p>
}
