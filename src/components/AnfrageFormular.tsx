import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { DATENSCHUTZ, WEISS_NICHT, copy, fuelle } from '../content/copy'
import { gewerke } from '../content/gewerke'
import { submitLead } from '../lib/submitLead'
import {
  LEERES_FORMULAR,
  WEISS_NICHT_ID,
  formularZuLead,
  pruefeFeld,
  pruefeFormular,
  type FormularFeld,
  type FormularWerte,
} from '../lib/validate'
import { Button } from './ui/Button'
import { CallButton } from './ui/CallButton'
import { Icon } from './ui/Icon'

const t = copy.anfrage
const GEWERK_IDS = gewerke.map((g) => g.id)

type Fehler = Partial<Record<FormularFeld, string>>
type Status = 'bereit' | 'sendend' | 'sendefehler'
type Eingabe = ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>

interface Danke {
  anfragenummer: string
  betrieb: string
  telefon: string
  /** Sicherheitstipp des gewählten Gewerks (fehlt bei „Weiß ich nicht“) */
  tipp?: string
}

const feldId = (feld: FormularFeld) => `anfrage-${feld}`
const fehlerId = (feld: FormularFeld) => `${feldId(feld)}-fehler`

const FELD = 'rahmen w-full rounded-chip border-rand bg-weiss px-s4 text-body text-tiefsee aria-invalid:border-tiefsee'
const FELDHOEHE = 'min-h-[54px]'

function Beschriftung({ feld, pflicht = false, children }: { feld: FormularFeld; pflicht?: boolean; children: ReactNode }) {
  return (
    <label htmlFor={feldId(feld)} className="font-display text-text font-bold">
      {children}
      {pflicht && (
        <>
          {' '}
          <span aria-hidden="true">{t.pflichtZeichen}</span>
        </>
      )}
    </label>
  )
}

/** Das Textelement trägt die id, damit aria-describedby direkt auf den Text zeigt. */
function Fehlertext({ feld, text }: { feld: FormularFeld; text?: string }) {
  if (!text) return null
  return (
    <p id={fehlerId(feld)} className="flex items-start gap-s2 text-small font-bold text-tiefsee">
      <Icon name="ui-warnung" className="mt-s1 size-[16px]" />
      {text}
    </p>
  )
}

export function AnfrageFormular() {
  const [werte, setWerte] = useState<FormularWerte>(LEERES_FORMULAR)
  const [fehler, setFehler] = useState<Fehler>({})
  const [status, setStatus] = useState<Status>('bereit')
  const [danke, setDanke] = useState<Danke | null>(null)
  const formular = useRef<HTMLFormElement>(null)

  // Links „… anfragen“ und die Schnellwahl-Kacheln wählen das Gewerk vor. Der Sprung zum Anker bleibt.
  useEffect(() => {
    const beiKlick = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return
      const gewerk = e.target.closest<HTMLElement>('a[href="#anfrage"][data-gewerk]')?.dataset.gewerk
      if (!gewerk || !GEWERK_IDS.includes(gewerk)) return
      setDanke(null)
      setWerte((alt) => ({ ...alt, gewerk }))
      setFehler((alt) => ({ ...alt, gewerk: undefined }))
    }
    document.addEventListener('click', beiKlick)
    return () => document.removeEventListener('click', beiKlick)
  }, [])

  if (danke) return <Erfolg danke={danke} />

  const pruefe = (feld: FormularFeld, w: FormularWerte) => {
    const meldung = pruefeFeld(feld, w, GEWERK_IDS) ?? undefined
    setFehler((alt) => ({ ...alt, [feld]: meldung }))
  }

  // Ein Feld mit Fehler wird beim Tippen sofort neu geprüft, sonst erst beim Verlassen.
  const setze = (feld: FormularFeld, wert: string | boolean) => {
    const neu = { ...werte, [feld]: wert }
    setWerte(neu)
    if (fehler[feld]) pruefe(feld, neu)
  }
  const aendern = (feld: FormularFeld) => (e: Eingabe) => setze(feld, e.target.value)

  const steuerung = (feld: FormularFeld) => ({
    id: feldId(feld),
    name: feld,
    onBlur: () => pruefe(feld, werte),
    'aria-invalid': fehler[feld] ? true : undefined,
    'aria-describedby': fehler[feld] ? fehlerId(feld) : undefined,
  })

  const absenden = async (e: FormEvent) => {
    e.preventDefault()
    if (status === 'sendend') return
    const alle = pruefeFormular(werte, GEWERK_IDS)
    setFehler(alle)
    const erstes = Object.keys(alle)[0]
    if (erstes) {
      const feld = formular.current?.elements.namedItem(erstes)
      if (feld instanceof HTMLElement) feld.focus()
      return
    }
    setStatus('sendend')
    try {
      const { anfragenummer } = await submitLead(formularZuLead(werte))
      const gewerk = gewerke.find((g) => g.id === werte.gewerk)
      setDanke({
        anfragenummer,
        betrieb: gewerk?.betrieb ?? copy.luna.erfolg.betriebUnbekannt,
        telefon: werte.telefon.trim(),
        tipp: gewerk?.tippErfolg,
      })
      setWerte(LEERES_FORMULAR)
      setFehler({})
      setStatus('bereit')
    } catch {
      setStatus('sendefehler')
    }
  }

  const sendend = status === 'sendend'

  return (
    <form
      ref={formular}
      noValidate
      onSubmit={absenden}
      className="grid min-w-0 grid-cols-1 gap-y-s4 rounded-card-lg border border-linie bg-weiss px-s4 py-s5 dialog:grid-cols-2 dialog:gap-x-s5 dialog:gap-y-s5 dialog:p-s6"
    >
      <div className="flex flex-col gap-s2">
        <Beschriftung feld="name" pflicht>
          {t.felder.name.label}
        </Beschriftung>
        <input
          {...steuerung('name')}
          type="text"
          autoComplete="name"
          aria-required="true"
          value={werte.name}
          onChange={aendern('name')}
          placeholder={t.felder.name.platzhalter}
          className={`${FELD} ${FELDHOEHE}`}
        />
        <Fehlertext feld="name" text={fehler.name} />
      </div>

      <div className="flex flex-col gap-s2">
        <Beschriftung feld="telefon" pflicht>
          {t.felder.telefon.label}
        </Beschriftung>
        <input
          {...steuerung('telefon')}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          aria-required="true"
          value={werte.telefon}
          onChange={aendern('telefon')}
          placeholder={t.felder.telefon.platzhalter}
          className={`${FELD} ${FELDHOEHE}`}
        />
        <Fehlertext feld="telefon" text={fehler.telefon} />
      </div>

      <div className="flex flex-col gap-s2">
        <Beschriftung feld="plzOrt" pflicht>
          {t.felder.plzOrt.label}
        </Beschriftung>
        {/* autocomplete="postal-code" wäre falsch: Das Feld enthält auch den Ort. */}
        <input
          {...steuerung('plzOrt')}
          type="text"
          autoComplete="off"
          aria-required="true"
          value={werte.plzOrt}
          onChange={aendern('plzOrt')}
          placeholder={t.felder.plzOrt.platzhalter}
          className={`${FELD} ${FELDHOEHE}`}
        />
        <Fehlertext feld="plzOrt" text={fehler.plzOrt} />
      </div>

      <div className="flex flex-col gap-s2">
        <Beschriftung feld="gewerk" pflicht>
          {t.felder.gewerk.label}
        </Beschriftung>
        <div className="relative">
          <select
            {...steuerung('gewerk')}
            aria-required="true"
            value={werte.gewerk}
            onChange={aendern('gewerk')}
            className={`${FELD} ${FELDHOEHE} cursor-pointer appearance-none pr-s7`}
          >
            <option value="">{t.felder.gewerk.bitteWaehlen}</option>
            {gewerke.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
            <option value={WEISS_NICHT_ID}>{WEISS_NICHT}</option>
          </select>
          <Icon name="ui-aufklappen" className="pointer-events-none absolute top-1/2 right-s3 size-[22px] -translate-y-1/2 text-tiefsee" />
        </div>
        <Fehlertext feld="gewerk" text={fehler.gewerk} />
      </div>

      <div className="col-span-full flex flex-col gap-s2">
        <Beschriftung feld="beschreibung">{t.felder.beschreibung.label}</Beschriftung>
        <textarea
          {...steuerung('beschreibung')}
          rows={4}
          value={werte.beschreibung}
          onChange={aendern('beschreibung')}
          placeholder={t.felder.beschreibung.platzhalter}
          className={`${FELD} min-h-[128px] resize-y py-s3`}
        />
      </div>

      <div className="col-span-full flex flex-col gap-s2">
        <label className="flex min-h-[44px] cursor-pointer items-start gap-s2 text-small">
          {/* Die Checkbox ist ein unsichtbares 44-px-Feld über dem gezeichneten 24-px-Kästchen (Trefferfläche). */}
          <span className="relative -mt-s2 -mr-s4 flex size-[44px] shrink-0 items-center justify-start">
            <input
              {...steuerung('einwilligung')}
              type="checkbox"
              aria-required="true"
              checked={werte.einwilligung}
              onChange={(e) => setze('einwilligung', e.target.checked)}
              className="peer absolute inset-0 size-full cursor-pointer appearance-none focus-visible:outline-none"
            />
            {/* Gezeichnetes Kästchen mit Häkchen darin; sichtbar wird das Häkchen über den Zustand der Checkbox davor */}
            <span
              aria-hidden="true"
              className="rahmen pointer-events-none flex size-[24px] items-center justify-center rounded-ecke border-rand bg-weiss peer-checked:border-tiefsee peer-checked:bg-tiefsee peer-checked:[&>span]:visible peer-aria-invalid:border-tiefsee peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-tuerkis"
            >
              <Icon name="ui-haekchen" className="invisible size-[20px] text-weiss" />
            </span>
          </span>
          <span>
            {t.einwilligung.text}{' '}
            <a href={DATENSCHUTZ} className="underline underline-offset-3">
              {t.einwilligung.link}
            </a>
            {t.einwilligung.satzende} <span aria-hidden="true">{t.pflichtZeichen}</span>
          </span>
        </label>
        <Fehlertext feld="einwilligung" text={fehler.einwilligung} />
      </div>

      {status === 'sendefehler' && (
        <div role="alert" className="col-span-full flex flex-col gap-s3 rounded-card border-2 border-tiefsee bg-weiss p-s4">
          <div className="flex items-start gap-s3">
            <Icon name="ui-warnung" className="size-[28px] text-tiefsee" />
            <div className="flex min-w-0 flex-col gap-s2">
              <h3 className="font-display text-h3 font-[750] [font-stretch:100%] dialog:text-h4">{t.sendefehler.titel}</h3>
              <p className="text-small">{t.sendefehler.text}</p>
            </div>
          </div>
          <CallButton variante="block" label={t.sendefehler.anrufen} />
        </div>
      )}

      <div className="col-span-full flex flex-col gap-s4 dialog:flex-row dialog:flex-wrap dialog:items-center dialog:gap-x-s5">
        {/* Kein Fokuswechsel beim Drücken: Sonst prüft das Verlassen des Feldes zuerst, der Fehlertext verschiebt den Knopf und der Klick geht ins Leere. Geprüft wird beim Absenden ohnehin. */}
        <div onMouseDown={(e) => e.preventDefault()} className="contents">
          <Button
            art="primaer"
            type="submit"
            aria-disabled={sendend}
            className="min-h-[56px] w-full px-s6 text-btn-l font-[750] aria-disabled:cursor-default dialog:w-auto"
          >
            {sendend ? t.sendend : t.senden}
          </Button>
        </div>
        <p className="text-note text-schiefer">{t.pflicht}</p>
      </div>
    </form>
  )
}

/** Ersetzt das Formular nach dem Senden. Aufbau und Texte wie die Luna-Erfolgskarte (Entscheidung 2). */
function Erfolg({ danke }: { danke: Danke }) {
  const titel = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    titel.current?.focus()
  }, [])

  return (
    <div className="flex min-w-0 flex-col gap-s4 rounded-card-lg border border-linie bg-weiss px-s4 py-s5 dialog:p-s6">
      <div className="flex flex-col gap-s3 dialog:flex-row dialog:items-center dialog:gap-s4">
        <div className="flex size-[52px] shrink-0 items-center justify-center rounded-pill bg-tiefsee text-weiss">
          <Icon name="ui-haekchen" className="size-[28px]" />
        </div>
        <h3 ref={titel} tabIndex={-1} className="font-display text-h3-karte font-[750] [font-stretch:100%] dialog:text-h3">
          {t.erfolg.titel}
        </h3>
      </div>
      <p className="text-body">{fuelle(t.erfolg.text, { betrieb: danke.betrieb, telefon: danke.telefon })}</p>
      <p className="text-note text-schiefer">{fuelle(t.erfolg.nummer, { nummer: danke.anfragenummer })}</p>
      {danke.tipp && (
        <p className="rounded-chip bg-kalk p-s4 text-small">
          <strong>{copy.luna.erfolg.tippTitel}</strong> {danke.tipp}
        </p>
      )}
      <CallButton variante="block" label={copy.luna.erfolg.anrufen} />
    </div>
  )
}
