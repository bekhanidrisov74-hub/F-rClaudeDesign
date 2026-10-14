import { Fragment, useId, type RefObject } from 'react'
import { Button } from '../../components/ui/Button'
import { AUFTRAG_AUFGEBEN, copy, DATENSCHUTZ } from '../../content/copy'
import { anfahrtText, einheit, spanne } from '../../content/gewerke'
import type { Angaben } from '../flow'

export interface ZusammenfassungProps {
  angaben: Angaben
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

// Screen 08 (Handy) und Screen 12 (Fenster) von Luna: Überblick über alle Angaben vor dem Absenden.
export function Zusammenfassung({
  angaben,
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
  const gewerk = angaben.gewerk

  const felder = [
    [t.felder.gewerk, angaben.gewerkText],
    [t.felder.problem, angaben.problem],
    [t.felder.ort, [angaben.plz, angaben.ort].filter(Boolean).join(' ')],
    [t.felder.dringlichkeit, angaben.dringlichkeitText],
    [t.felder.name, angaben.name],
    [t.felder.telefon, angaben.telefon],
  ]

  // aria-disabled statt disabled: Der Fokus bleibt auf dem Knopf, solange gesendet wird.
  const absenden = () => {
    if (!sendend) onAbsenden()
  }

  return (
    <section aria-labelledby={titelId} className="flex flex-col gap-s3 rounded-card border border-linie bg-weiss p-s4">
      <h2 id={titelId} className="font-display text-h4">
        {t.titel}
      </h2>

      <dl className="grid grid-cols-[104px_minmax(0,1fr)] gap-x-s3 gap-y-s1 text-small dialog:grid-cols-[96px_minmax(0,1fr)]">
        {felder.map(([label, wert]) => (
          <Fragment key={label}>
            <dt className="text-schiefer">{label}</dt>
            <dd className="min-w-0 font-bold break-words">{wert}</dd>
          </Fragment>
        ))}
      </dl>

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
            {t.einwilligung}{' '}
            <a href={DATENSCHUTZ} className="underline underline-offset-4">
              {t.datenschutz}
            </a>
          </span>
        </label>
        {einwilligungFehlt && (
          <p id={fehlerId} className="text-note font-bold">
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
