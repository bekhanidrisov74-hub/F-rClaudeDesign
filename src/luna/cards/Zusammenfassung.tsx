import { Fragment, useId, type RefObject } from 'react'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { AUFTRAG_AUFGEBEN, copy, DATENSCHUTZ, EINWILLIGUNG } from '../../content/copy'
import { anfahrtText, einheit, gewerke, spanne } from '../../content/gewerke'
import { zeilen, type Anfrage, type Kontakt } from '../flow'

export interface ZusammenfassungProps {
  anfrage: Anfrage
  kontakt: Kontakt
  onKontakt: (feld: keyof Kontakt, wert: string) => void
  kontaktFehler: Partial<Record<keyof Kontakt, string>>
  einwilligung: boolean
  onEinwilligung: (an: boolean) => void
  /** Fehlertext anzeigen (SPEC 9: „Bitte stimmen Sie der Weitergabe zu …“) */
  einwilligungFehlt: boolean
  /** Die Checkbox; LunaChat fokussiert sie, wenn die Einwilligung fehlt */
  einwilligungRef: RefObject<HTMLInputElement | null>
  sendend: boolean
  onAbsenden: () => void
  onAendern: () => void
}

const t = copy.luna.zusammenfassung

/** Primärknopf: Screen 08 volle Breite, Screen 12 neben „Angaben ändern“. */
const PRIMAER =
  'min-h-[52px] w-full px-s4 text-btn-l font-[750] aria-disabled:cursor-default dialog:min-h-[50px] dialog:flex-1 dialog:px-s2 dialog:text-btn dialog:whitespace-nowrap'

const FELD = 'rahmen min-h-[48px] w-full rounded-chip border-rand bg-weiss px-s4 text-text text-tiefsee aria-invalid:border-tiefsee'

/** Kontaktfelder (Aufgabe): erst hier erfasst, gehen nur an den Anfrage-Eingang. */
const KONTAKTFELDER = [
  { feld: 'name', type: 'text', autoComplete: 'name', inputMode: undefined, pflicht: true },
  { feld: 'telefon', type: 'tel', autoComplete: 'tel', inputMode: 'tel', pflicht: true },
  { feld: 'email', type: 'email', autoComplete: 'email', inputMode: 'email', pflicht: false },
] as const

// Screen 08 (Handy) und Screen 12 (Fenster) von Luna: Überblick über alle Angaben vor dem Absenden.
export function Zusammenfassung({
  anfrage,
  kontakt,
  onKontakt,
  kontaktFehler,
  einwilligung,
  onEinwilligung,
  einwilligungFehlt,
  einwilligungRef,
  sendend,
  onAbsenden,
  onAendern,
}: ZusammenfassungProps) {
  const id = useId()
  const titelId = `${id}-titel`
  const checkboxId = `${id}-einwilligung`
  const fehlerId = `${id}-einwilligung-fehlt`
  const gewerk = gewerke.find((g) => g.id === anfrage.gewerk)

  // aria-disabled statt disabled: Der Fokus bleibt auf dem Knopf, solange gesendet wird.
  const absenden = () => {
    if (!sendend) onAbsenden()
  }

  return (
    <section data-karte aria-labelledby={titelId} className="flex flex-col gap-s3 rounded-card border border-linie bg-weiss p-s4">
      <h2 id={titelId} className="font-display text-h4">
        {t.titel}
      </h2>

      <dl className="grid grid-cols-[104px_minmax(0,1fr)] gap-x-s3 gap-y-s1 text-small dialog:grid-cols-[96px_minmax(0,1fr)]">
        {zeilen(anfrage).map(([label, wert]) => (
          <Fragment key={label}>
            <dt className="text-schiefer">{label}</dt>
            <dd className="min-w-0 font-bold break-words">{wert}</dd>
          </Fragment>
        ))}
      </dl>

      <div className="flex flex-col gap-s3 border-t border-linie pt-s3">
        {KONTAKTFELDER.map(({ feld, type, autoComplete, inputMode, pflicht }) => {
          const fehler = kontaktFehler[feld]
          return (
            <div key={feld} className="flex flex-col gap-s1">
              <label htmlFor={`luna-${feld}`} className="font-display text-small font-bold">
                {t.kontakt[feld]}
                {!pflicht && <span className="font-text font-normal text-schiefer"> {t.kontakt.optional}</span>}
              </label>
              <input
                id={`luna-${feld}`}
                type={type}
                autoComplete={autoComplete}
                inputMode={inputMode}
                maxLength={120}
                aria-required={pflicht || undefined}
                aria-invalid={fehler ? true : undefined}
                aria-describedby={fehler ? `luna-${feld}-fehler` : undefined}
                value={kontakt[feld]}
                onChange={(e) => onKontakt(feld, e.target.value)}
                className={FELD}
              />
              {fehler && (
                <p id={`luna-${feld}-fehler`} className="flex items-start gap-s2 text-note font-bold">
                  <Icon name="ui-warnung" className="mt-px size-[16px] shrink-0" />
                  {fehler}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {gewerk && (
        <p className="rounded-chip bg-kalk px-s3 py-s2 text-small">
          <span className="block">
            {t.richtpreis}{' '}
            <span className="font-bold">
              {spanne(gewerk)} {einheit(gewerk)}
            </span>
          </span>
          <span className="block">
            {t.anfahrt} {anfahrtText(gewerk)}
          </span>
        </p>
      )}

      <div className="flex flex-col gap-s2">
        <label htmlFor={checkboxId} className="flex min-h-[44px] cursor-pointer items-start gap-s3 text-note">
          <input
            ref={einwilligungRef}
            id={checkboxId}
            type="checkbox"
            checked={einwilligung}
            onChange={(e) => onEinwilligung(e.target.checked)}
            aria-invalid={einwilligungFehlt || undefined}
            aria-describedby={einwilligungFehlt ? fehlerId : undefined}
            className="mt-px size-[22px] shrink-0 cursor-pointer accent-tiefsee"
          />
          <span>
            {EINWILLIGUNG.text}{' '}
            <a href={DATENSCHUTZ} className="underline underline-offset-4">
              {EINWILLIGUNG.link}
            </a>
            {EINWILLIGUNG.satzende}
          </span>
        </label>
        {einwilligungFehlt && (
          <p id={fehlerId} className="flex items-start gap-s2 text-note font-bold">
            <Icon name="ui-warnung" className="mt-px size-[16px] shrink-0" />
            {t.einwilligungFehlt}
          </p>
        )}
      </div>

      <p className="text-note text-schiefer">{t.hinweis}</p>

      {/* Die Reihenfolge im Quelltext folgt der sichtbaren: Handy Auftrag, dann Textlink; Fenster Ändern, dann Auftrag. */}
      <div className="flex flex-col gap-s3 dialog:flex-row dialog:gap-s2">
        <Button art="hell" onClick={onAendern} className="min-h-[50px] flex-1 px-s2 text-btn whitespace-nowrap max-dialog:hidden">
          {t.aendern}
        </Button>
        <Button art="primaer" onClick={absenden} aria-disabled={sendend} className={PRIMAER}>
          {sendend ? t.sendend : AUFTRAG_AUFGEBEN}
        </Button>
        <Button art="textlink" onClick={onAendern} className="-mt-s1 min-h-[44px] px-s4 text-btn dialog:hidden">
          {t.aendern}
        </Button>
      </div>
    </section>
  )
}
