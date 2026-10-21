import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from 'react'
import { DATENSCHUTZ, EINWILLIGUNG, WEISS_NICHT, copy, fuelle } from '../content/copy'
import { gewerke } from '../content/gewerke'
import { submitLead, zufallsnummer, type Match } from '../lib/submitLead'
import { WEISS_NICHT_ID, formularZuLead, pruefeFeld, pruefeFormular, type FormularFeld, type FormularWerte } from '../lib/validate'
import { Button } from './ui/Button'
import { CallButton } from './ui/CallButton'
import { Icon } from './ui/Icon'
import { IconKreis } from './ui/IconKreis'

const t = copy.anfrage
const GEWERK_IDS = gewerke.map((g) => g.id)

type Fehler = Partial<Record<FormularFeld, string>>
type Status = 'bereit' | 'sendend' | 'sendefehler'
type Feldereignis = { currentTarget: { form: HTMLFormElement | null } }

/**
 * Die Felder sind unkontrolliert, die Werte stehen nur im DOM. So bleibt stehen, was auf langsamem Netz
 * schon vor der Hydrierung getippt wurde; kontrollierte Felder setzt React dabei auf leer zurück (Audit, Befund A2).
 */
function lies(form: HTMLFormElement): FormularWerte {
  const daten = new FormData(form)
  const text = (feld: FormularFeld) => String(daten.get(feld) ?? '')
  return {
    name: text('name'),
    telefon: text('telefon'),
    plzOrt: text('plzOrt'),
    gewerk: text('gewerk'),
    email: text('email'),
    beschreibung: text('beschreibung'),
    einwilligung: daten.has('einwilligung'),
  }
}

/** false beim Vorrendern und Hydrieren, danach true (ohne Effekt, ohne Abweichung beim Hydrieren). */
const keinAbo = () => () => {}
const useHydriert = () => useSyncExternalStore(keinAbo, () => true, () => false)

interface Danke {
  match: Match
  anfragenummer: string
  betrieb: string
  telefon: string
  /** getrimmte E-Mail-Adresse oder '' (freiwillig) */
  email: string
  /** Sicherheitstipp des gewählten Gewerks (fehlt bei „Weiß ich nicht“) */
  tipp?: string
}

const feldId = (feld: FormularFeld) => `anfrage-${feld}`
const fehlerId = (feld: FormularFeld) => `${feldId(feld)}-fehler`

const FELD = 'rahmen w-full rounded-chip border-rand bg-weiss px-s4 text-body text-tiefsee transition-[border-color] hover:border-tiefsee aria-invalid:border-tiefsee'
const FELDHOEHE = 'min-h-[54px]'

function Beschriftung({ feld, pflicht = false, optional, children }: { feld: FormularFeld; pflicht?: boolean; optional?: string; children: ReactNode }) {
  return (
    <label htmlFor={feldId(feld)} className="font-display text-text font-semibold">
      {children}
      {pflicht && (
        <>
          {' '}
          <span aria-hidden="true">{t.pflichtZeichen}</span>
        </>
      )}
      {optional && <span className="font-text font-normal text-schiefer"> {optional}</span>}
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
  /** Vorauswahl aus Kachel oder „… anfragen“; Startwert, wenn das Formular nach dem Erfolg neu erscheint */
  const [vorauswahl, setVorauswahl] = useState('')
  const [fehler, setFehler] = useState<Fehler>({})
  const [status, setStatus] = useState<Status>('bereit')
  const [danke, setDanke] = useState<Danke | null>(null)
  /** Eine Id je Anfrage: bleibt beim erneuten Senden gleich, neu nach dem Erfolg */
  const [anfrageId, setAnfrageId] = useState(zufallsnummer)
  const formular = useRef<HTMLFormElement>(null)
  // Vor der Hydrierung sendet der Knopf nicht nativ: Das Formular hat kein Ziel, ein GET schriebe Name und
  // Telefon in die Adresse und verwürfe die Anfrage (Audit, Befund A3). Die Eingaben bleiben stehen.
  const hydriert = useHydriert()

  // Links „… anfragen“ und die Schnellwahl-Kacheln wählen das Gewerk vor. Der Sprung zum Anker bleibt.
  useEffect(() => {
    const beiKlick = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return
      const gewerk = e.target.closest<HTMLElement>('a[href="#anfrage"][data-gewerk]')?.dataset.gewerk
      if (!gewerk || !GEWERK_IDS.includes(gewerk)) return
      setDanke(null)
      setVorauswahl(gewerk)
      const auswahl = formular.current?.elements.namedItem('gewerk')
      if (auswahl instanceof HTMLSelectElement) auswahl.value = gewerk
      setFehler((alt) => ({ ...alt, gewerk: undefined }))
    }
    document.addEventListener('click', beiKlick)
    return () => document.removeEventListener('click', beiKlick)
  }, [])

  if (danke) return <Erfolg danke={danke} />

  const pruefe = (feld: FormularFeld, form: HTMLFormElement | null) => {
    if (!form) return
    const meldung = pruefeFeld(feld, lies(form), GEWERK_IDS) ?? undefined
    setFehler((alt) => ({ ...alt, [feld]: meldung }))
  }

  const steuerung = (feld: FormularFeld) => ({
    id: feldId(feld),
    name: feld,
    onBlur: (e: Feldereignis) => pruefe(feld, e.currentTarget.form),
    // Ein Feld mit Fehler wird beim Tippen sofort neu geprüft, sonst erst beim Verlassen.
    onChange: (e: Feldereignis) => fehler[feld] && pruefe(feld, e.currentTarget.form),
    'aria-invalid': fehler[feld] ? true : undefined,
    'aria-describedby': fehler[feld] ? fehlerId(feld) : undefined,
  })

  const absenden = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'sendend') return
    const werte = lies(e.currentTarget)
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
      const match = await submitLead(formularZuLead(werte, anfrageId))
      const gewerk = gewerke.find((g) => g.id === werte.gewerk)
      setDanke({
        match,
        anfragenummer: anfrageId,
        betrieb: gewerk?.betrieb ?? copy.luna.erfolg.betriebUnbekannt,
        // Geschützte Leerzeichen: Die Telefonnummer bricht nicht mitten im Text um.
        telefon: werte.telefon.trim().replace(/ /g, ' '),
        email: werte.email.trim(),
        tipp: gewerk?.tippErfolg,
      })
      setVorauswahl('')
      setAnfrageId(zufallsnummer())
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
      className="grid min-w-0 grid-cols-1 gap-y-s4 rounded-card-lg border border-linie bg-weiss px-s4 py-s5 shadow-karte dialog:grid-cols-2 dialog:gap-x-s5 dialog:gap-y-s5 dialog:p-s6"
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
            defaultValue={vorauswahl}
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
        <Beschriftung feld="email" optional={t.felder.email.optional}>
          {t.felder.email.label}
        </Beschriftung>
        <input
          {...steuerung('email')}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={t.felder.email.platzhalter}
          className={`${FELD} ${FELDHOEHE}`}
        />
        <Fehlertext feld="email" text={fehler.email} />
      </div>

      <div className="col-span-full flex flex-col gap-s2">
        <Beschriftung feld="beschreibung">{t.felder.beschreibung.label}</Beschriftung>
        <textarea
          {...steuerung('beschreibung')}
          rows={4}
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
              className="peer absolute inset-0 size-full cursor-pointer appearance-none focus-visible:outline-none"
            />
            {/* Gezeichnetes Kästchen mit Häkchen darin; sichtbar wird das Häkchen über den Zustand der Checkbox davor */}
            <span
              aria-hidden="true"
              className="rahmen pointer-events-none flex size-[24px] items-center justify-center rounded-ecke border-rand bg-weiss peer-checked:border-tiefsee peer-checked:bg-tiefsee peer-checked:[&>span]:visible peer-aria-invalid:border-tiefsee peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-tiefsee"
            >
              <Icon name="ui-haekchen" className="invisible size-[20px] text-weiss" />
            </span>
          </span>
          <span>
            {EINWILLIGUNG.text}{' '}
            <a href={DATENSCHUTZ} className="underline underline-offset-3">
              {EINWILLIGUNG.link}
            </a>
            {EINWILLIGUNG.satzende} <span aria-hidden="true">{t.pflichtZeichen}</span>
          </span>
        </label>
        <Fehlertext feld="einwilligung" text={fehler.einwilligung} />
      </div>

      {status === 'sendefehler' && (
        <div role="alert" className="col-span-full flex flex-col gap-s3 rounded-card border-2 border-tiefsee bg-weiss p-s4">
          <div className="flex items-start gap-s3">
            <IconKreis name="ui-warnung" className="size-[44px]" icon="size-[24px]" />
            <div className="flex min-w-0 flex-col gap-s2">
              <h3 className="font-display text-h3 dialog:text-h4">{t.sendefehler.titel}</h3>
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
            type={hydriert ? 'submit' : 'button'}
            aria-disabled={sendend}
            laedt={sendend}
            className="min-h-[58px] w-full rounded-btn-lg px-s6 text-btn-l font-bold aria-disabled:cursor-default dialog:w-auto"
          >
            {sendend ? t.sendend : t.senden}
          </Button>
        </div>
        <p className="text-small text-schiefer">{t.pflicht}</p>
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
    <div className="flex min-w-0 flex-col gap-s4 rounded-card-lg border border-linie bg-weiss px-s4 py-s5 shadow-karte dialog:p-s6">
      <div className="flex flex-col gap-s3 dialog:flex-row dialog:items-center dialog:gap-s4">
        <IconKreis name="ui-haekchen" dunkel className="size-[52px]" icon="size-[28px]" />
        <h3 ref={titel} tabIndex={-1} className="font-display text-h3-karte dialog:text-h3">
          {danke.match === 'FOUND' ? t.erfolg.titel : t.erfolg.keinerTitel}
        </h3>
      </div>
      <p className="text-body">
        {fuelle(danke.match === 'FOUND' ? t.erfolg.text : t.erfolg.keinerText, { betrieb: danke.betrieb, telefon: danke.telefon })}
      </p>
      <p className="text-small text-schiefer">{fuelle(t.erfolg.nummer, { nummer: danke.anfragenummer })}</p>
      {danke.tipp && danke.match === 'FOUND' && (
        <p className="rounded-chip bg-eis p-s4 text-small">
          <strong>{copy.luna.erfolg.tippTitel}</strong> {danke.tipp}
        </p>
      )}
      <CallButton variante="block" label={copy.luna.erfolg.anrufen} />
    </div>
  )
}
