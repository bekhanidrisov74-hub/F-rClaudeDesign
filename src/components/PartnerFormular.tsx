import { useEffect, useRef, useState, useSyncExternalStore, type ChangeEvent, type FocusEvent, type FormEvent, type ReactNode } from 'react'
import { DATENSCHUTZ, fuelle } from '../content/copy'
import { gewerke } from '../content/gewerke'
import { partner } from '../content/partner'
import {
  FELDER,
  MAX_FELD,
  bewerbungZuPayload,
  pruefeBewerbung,
  pruefeFeld,
  sendeBewerbung,
  type Bewerbung,
  type BewerbungFeld,
} from '../lib/bewerbung'
import { ladePlz } from '../lib/plz'
import { zufallsnummer } from '../lib/submitLead'
import { Button } from './ui/Button'
import { CallButton } from './ui/CallButton'
import { Icon } from './ui/Icon'
import { IconKreis } from './ui/IconKreis'

const t = partner.bewerbung
const f = t.felder
const GEWERK_IDS = gewerke.map((g) => g.id)

type Verzeichnis = Readonly<Record<string, string>>
type Fehler = Partial<Record<BewerbungFeld, string>>
type Status = 'bereit' | 'sendend' | 'sendefehler'
type Feldereignis = { currentTarget: { form: HTMLFormElement | null } }

interface Erfolgsdaten {
  nummer: string
  telefon: string
  email: string
}

/**
 * Die Felder sind unkontrolliert, die Werte stehen nur im DOM (wie im AnfrageFormular): Was auf langsamem Netz vor der
 * Hydrierung getippt wurde, bleibt stehen. Die Namen der Felder sind die Schlüssel von Bewerbung.
 */
function lies(form: HTMLFormElement): Bewerbung {
  const daten = new FormData(form)
  const text = (feld: BewerbungFeld) => String(daten.get(feld) ?? '')
  return {
    firma: text('firma'),
    ansprechperson: text('ansprechperson'),
    telefon: text('telefon'),
    email: text('email'),
    gisa: text('gisa'),
    uid: text('uid'),
    gewerke: daten.getAll('gewerke').map(String),
    plz: text('plz'),
    zeiten: daten.getAll('zeiten').map(String),
    notdienst: text('notdienst'),
    reaktionszeit: text('reaktionszeit'),
    richtpreise: text('richtpreise'),
    abweichungen: text('abweichungen'),
    haftpflicht: text('haftpflicht'),
    preisVorab: text('preisVorab'),
    unbar: text('unbar'),
    anmerkungen: text('anmerkungen'),
    einwilligung: daten.has('einwilligung'),
  }
}

/** false beim Vorrendern und Hydrieren, danach true (wie im AnfrageFormular). */
const keinAbo = () => () => {}
const useHydriert = () => useSyncExternalStore(keinAbo, () => true, () => false)

const feldId = (feld: BewerbungFeld) => `bewerbung-${feld}`
const fehlerId = (feld: BewerbungFeld) => `${feldId(feld)}-fehler`
const hinweisId = (feld: BewerbungFeld) => `${feldId(feld)}-hinweis`

/** aria-describedby: Hinweis und Fehler, soweit vorhanden */
const beschreibung = (feld: BewerbungFeld, hinweis: boolean, fehler: Fehler) =>
  [hinweis && hinweisId(feld), fehler[feld] && fehlerId(feld)].filter(Boolean).join(' ') || undefined

const FELD = 'rahmen w-full rounded-chip border-rand bg-weiss px-s4 text-body text-tiefsee transition-[border-color] hover:border-tiefsee aria-invalid:border-tiefsee'
const FELDHOEHE = 'min-h-[54px]'
// Lange Wörter wie „Betriebshaftpflichtversicherung?“ trennen sich, wo der Browser Deutsch trennen kann (hyphens-auto, lang="de-AT");
// sonst bricht wrap-anywhere sie um, bevor sie über die Spalte laufen (wirkt auch auf die Mindestbreite der Legende).
const BESCHRIFTUNG = 'font-display text-text font-semibold hyphens-auto wrap-anywhere'

function Zusaetze({ pflicht, optional }: { pflicht?: boolean; optional?: boolean }) {
  return (
    <>
      {pflicht && (
        <>
          {'\u00a0'}
          <span aria-hidden="true">{t.pflichtZeichen}</span>
        </>
      )}
      {optional && (
        <>
          {' '}
          <span className="font-normal text-schiefer">{t.optional}</span>
        </>
      )}
    </>
  )
}

function Hinweis({ feld, text }: { feld: BewerbungFeld; text?: string }) {
  if (!text) return null
  return (
    <p id={hinweisId(feld)} className="text-small text-schiefer">
      {text}
    </p>
  )
}

/** Das Textelement trägt die id, damit aria-describedby direkt auf den Text zeigt. */
function Fehlertext({ feld, text }: { feld: BewerbungFeld; text?: string }) {
  if (!text) return null
  return (
    <p id={fehlerId(feld)} className="flex items-start gap-s2 text-small font-bold text-tiefsee">
      <Icon name="ui-warnung" className="mt-s1 size-[16px]" />
      {text}
    </p>
  )
}

/** Einzelnes Feld: Beschriftung, Hinweis, Eingabe, Fehler. */
function Feld({
  feld,
  label,
  pflicht,
  optional,
  hinweis,
  fehler,
  breit,
  children,
}: {
  feld: BewerbungFeld
  label: string
  pflicht?: boolean
  optional?: boolean
  hinweis?: string
  fehler?: string
  breit?: boolean
  children: ReactNode
}) {
  return (
    <div className={`flex flex-col gap-s2 ${breit ? 'col-span-full' : ''}`}>
      <label htmlFor={feldId(feld)} className={BESCHRIFTUNG}>
        {label}
        <Zusaetze pflicht={pflicht} optional={optional} />
      </label>
      {children}
      {/* Hinweis unter der Eingabe: so stehen die Eingaben nebeneinander auf einer Höhe, auch wenn nur eine einen Hinweis trägt */}
      <Hinweis feld={feld} text={hinweis} />
      <Fehlertext feld={feld} text={fehler} />
    </div>
  )
}

/**
 * Gruppe aus Radios (role="radiogroup" mit aria-required und aria-invalid) oder Checkboxen (nur aria-describedby).
 * Das fieldset trägt die id, der Fehler steht unter den Auswahlzeilen.
 */
function Gruppe({
  feld,
  art,
  legende,
  pflicht = true,
  optional,
  hinweis,
  fehler,
  breit,
  onBlur,
  onChange,
  children,
}: {
  feld: BewerbungFeld
  art: 'radio' | 'checkbox'
  legende: string
  pflicht?: boolean
  optional?: boolean
  hinweis?: string
  fehler?: string
  breit?: boolean
  onBlur: (e: FocusEvent<HTMLFieldSetElement>) => void
  onChange: (e: ChangeEvent<HTMLFieldSetElement>) => void
  children: ReactNode
}) {
  const radios = art === 'radio'
  return (
    <fieldset
      id={feldId(feld)}
      role={radios ? 'radiogroup' : undefined}
      aria-required={radios && pflicht ? true : undefined}
      aria-invalid={radios && fehler ? true : undefined}
      aria-describedby={[hinweis && hinweisId(feld), fehler && fehlerId(feld)].filter(Boolean).join(' ') || undefined}
      data-fehler={fehler ? '' : undefined}
      onBlur={onBlur}
      onChange={onChange}
      className={`group/g m-0 flex min-w-0 flex-col gap-s2 border-0 p-0 ${breit ? 'col-span-full' : ''}`}
    >
      <legend className={`mb-s1 p-0 ${BESCHRIFTUNG}`}>
        {legende}
        <Zusaetze pflicht={pflicht && !optional} optional={optional} />
      </legend>
      <Hinweis feld={feld} text={hinweis} />
      {children}
      <Fehlertext feld={feld} text={fehler} />
    </fieldset>
  )
}

/**
 * Eine Zeile aus Radio oder Checkbox im Stil der Einwilligung im AnfrageFormular: Die Zeile ist mindestens 44 px hoch, das
 * unsichtbare 44-px-Feld über dem gezeichneten 24-px-Kästchen ist die Trefferfläche. Gewählt ist Tiefsee, Radios sind rund.
 */
function Auswahl({ art, name, id, value, children }: { art: 'radio' | 'checkbox'; name: string; id: string; value: string; children: ReactNode }) {
  const rund = art === 'radio'
  return (
    <label className="group flex min-h-[44px] cursor-pointer items-center gap-s2 text-body">
      <span className="relative -mr-s4 flex size-[44px] shrink-0 items-center justify-start">
        <input
          id={id}
          name={name}
          type={art}
          value={value}
          className="peer absolute inset-0 size-full cursor-pointer appearance-none focus-visible:outline-none"
        />
        {/* Gezeichnetes Kästchen bzw. Kreis; das Innere wird über den Zustand der Eingabe davor sichtbar */}
        <span
          aria-hidden="true"
          className={`rahmen pointer-events-none flex size-[24px] items-center justify-center border-rand bg-weiss transition-[border-color,background-color] group-hover:border-tiefsee group-data-fehler/g:border-tiefsee peer-checked:border-tiefsee peer-checked:bg-tiefsee peer-checked:[&>span]:visible peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-tiefsee ${
            rund ? 'rounded-pill' : 'rounded-ecke'
          }`}
        >
          {rund ? (
            <span className="invisible size-[10px] rounded-pill bg-weiss" />
          ) : (
            <Icon name="ui-haekchen" className="invisible size-[20px] text-weiss" />
          )}
        </span>
      </span>
      <span>{children}</span>
    </label>
  )
}

const RADIOS = 'flex flex-wrap gap-x-s6'
const CHECKBOXEN = 'grid grid-cols-[repeat(auto-fill,minmax(min(100%,13rem),1fr))] gap-x-s5'

/** Gruppe des Formulars mit Zwischenüberschrift; ab der zweiten trennt eine Haarlinie. */
function Abschnitt({ titel, erster = false, children }: { titel: string; erster?: boolean; children: ReactNode }) {
  return (
    <div
      className={`grid grid-cols-1 items-start gap-s4 dialog:grid-cols-2 dialog:gap-x-s5 dialog:gap-y-s5 ${erster ? '' : 'border-t border-linie pt-s6'}`}
    >
      <h3 className="col-span-full font-display text-h4">{titel}</h3>
      {children}
    </div>
  )
}

export function PartnerFormular() {
  const [fehler, setFehler] = useState<Fehler>({})
  const [status, setStatus] = useState<Status>('bereit')
  const [erfolg, setErfolg] = useState<Erfolgsdaten | null>(null)
  /** Hängt davon ab, ob „Welche?“ erscheint; alle anderen Werte stehen nur im DOM */
  const [richtpreise, setRichtpreise] = useState('')
  /** Eine Id je Bewerbung: bleibt beim erneuten Senden gleich, neu nach dem Erfolg */
  const [bewerbungId, setBewerbungId] = useState(() => zufallsnummer('P247'))
  const formular = useRef<HTMLFormElement>(null)
  const verzeichnis = useRef<Verzeichnis | null>(null)
  const beschaeftigt = useRef(false)
  // Vor der Hydrierung sendet der Knopf nicht nativ: Das Formular hat kein Ziel, ein GET schriebe die Angaben in die
  // Adresse und verwürfe die Bewerbung. Die Eingaben bleiben stehen.
  const hydriert = useHydriert()

  // Eine vor der Hydrierung gewählte Antwort bei den Richtpreisen übernehmen, sonst fehlte „Welche?“.
  useEffect(() => {
    const auswahl = formular.current?.elements.namedItem('richtpreise')
    if (auswahl instanceof RadioNodeList && auswahl.value) setRichtpreise(auswahl.value)
  }, [])

  if (erfolg) return <Erfolg daten={erfolg} />

  /** Das PLZ-Verzeichnis (55 KB) lädt erst, wenn jemand ins Einsatzgebiet schreibt. Ohne Verzeichnis prüft leseGebiet nur das Format. */
  const startePlz = () => {
    if (!verzeichnis.current) ladePlz().then((v) => (verzeichnis.current = v), () => {})
  }

  const pruefe = (felder: BewerbungFeld[], form: HTMLFormElement | null) => {
    if (!form) return
    const werte = lies(form)
    setFehler((alt) => {
      const neu = { ...alt }
      for (const feld of felder) {
        const meldung = pruefeFeld(feld, werte, GEWERK_IDS, verzeichnis.current)
        if (meldung) neu[feld] = meldung
        else delete neu[feld]
      }
      return neu
    })
  }

  const steuerung = (feld: BewerbungFeld, hinweis = false) => ({
    id: feldId(feld),
    name: feld,
    onBlur: (e: Feldereignis) => pruefe([feld], e.currentTarget.form),
    // Ein Feld mit Fehler wird beim Tippen sofort neu geprüft, sonst erst beim Verlassen.
    onChange: (e: Feldereignis) => fehler[feld] && pruefe([feld], e.currentTarget.form),
    'aria-invalid': fehler[feld] ? (true as const) : undefined,
    'aria-describedby': beschreibung(feld, hinweis, fehler),
  })

  /** Gruppen werden beim Verlassen der ganzen Gruppe geprüft (nicht beim Wechsel zwischen ihren Zeilen) und bei Änderung, wenn ein Fehler steht. */
  const gruppe = (feld: BewerbungFeld) => ({
    onBlur: (e: FocusEvent<HTMLFieldSetElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget)) pruefe([feld], e.currentTarget.form)
    },
    onChange: (e: ChangeEvent<HTMLFieldSetElement>) => {
      if (fehler[feld]) pruefe([feld], e.currentTarget.form)
    },
  })

  const richtpreiseGruppe = {
    onBlur: gruppe('richtpreise').onBlur,
    onChange: (e: ChangeEvent<HTMLFieldSetElement>) => {
      // Das Fieldset hört auch die Eingabe in „Welche?“; die prüft sich selbst.
      if (!(e.target instanceof HTMLInputElement) || e.target.type !== 'radio') return
      setRichtpreise(e.target.value)
      // Nur neu prüfen, was einen Fehler trägt: Wer „mit Abweichungen“ wählt, bekommt nicht gleich den Fehler für das leere „Welche?“.
      const felder = (['richtpreise', 'abweichungen'] as const).filter((feld) => fehler[feld])
      if (felder.length) pruefe(felder, e.currentTarget.form)
    },
  }

  const absenden = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (beschaeftigt.current) return
    beschaeftigt.current = true
    const form = e.currentTarget
    try {
      // Das Verzeichnis ist da, auch wenn das Einsatzgebiet nie angeklickt wurde (leeres Absenden).
      const tabelle = await ladePlz()
      verzeichnis.current = tabelle
      const werte = lies(form)
      const alle = pruefeBewerbung(werte, GEWERK_IDS, tabelle)
      setFehler(alle)
      const erstes = FELDER.find((feld) => alle[feld])
      if (erstes) {
        form.querySelector<HTMLElement>(`[name="${erstes}"]`)?.focus()
        return
      }
      setStatus('sendend')
      const payload = bewerbungZuPayload(werte, bewerbungId, GEWERK_IDS, tabelle)
      // Honigtopf: Menschen sehen das Feld nicht; was ein Bot hineinschreibt, verwirft der Eingang.
      const fax = String(new FormData(form).get('fax') ?? '')
      if (fax) payload.set('fax', fax)
      await sendeBewerbung(payload)
      setErfolg({
        nummer: bewerbungId,
        // Geschützte Leerzeichen: Die Telefonnummer bricht nicht mitten im Text um.
        telefon: werte.telefon.trim().replaceAll(' ', '\u00a0'),
        email: werte.email.trim(),
      })
      setBewerbungId(zufallsnummer('P247'))
      setFehler({})
      setRichtpreise('')
      setStatus('bereit')
    } catch {
      setStatus('sendefehler')
    } finally {
      beschaeftigt.current = false
    }
  }

  const sendend = status === 'sendend'

  return (
    <form
      ref={formular}
      noValidate
      aria-labelledby="bewerbung-titel"
      onSubmit={absenden}
      className="flex min-w-0 flex-col gap-s6 rounded-card-lg border border-linie bg-weiss px-s4 py-s5 shadow-karte dialog:p-s6"
    >
      <Abschnitt titel={t.gruppen.betrieb} erster>
        <Feld feld="firma" label={f.firma.label} pflicht fehler={fehler.firma}>
          <input {...steuerung('firma')} type="text" autoComplete="organization" aria-required="true" className={`${FELD} ${FELDHOEHE}`} />
        </Feld>
        <Feld feld="ansprechperson" label={f.ansprechperson.label} pflicht fehler={fehler.ansprechperson}>
          <input
            {...steuerung('ansprechperson')}
            type="text"
            autoComplete="name"
            aria-required="true"
            placeholder={f.ansprechperson.platzhalter}
            className={`${FELD} ${FELDHOEHE}`}
          />
        </Feld>
        <Feld feld="telefon" label={f.telefon.label} pflicht fehler={fehler.telefon}>
          <input
            {...steuerung('telefon')}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-required="true"
            placeholder={f.telefon.platzhalter}
            className={`${FELD} ${FELDHOEHE}`}
          />
        </Feld>
        <Feld feld="email" label={f.email.label} pflicht hinweis={f.email.hinweis} fehler={fehler.email}>
          <input
            {...steuerung('email', true)}
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-required="true"
            className={`${FELD} ${FELDHOEHE}`}
          />
        </Feld>
        <Feld feld="gisa" label={f.gisa.label} pflicht hinweis={f.gisa.hinweis} fehler={fehler.gisa}>
          <input
            {...steuerung('gisa', true)}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            aria-required="true"
            className={`${FELD} ${FELDHOEHE}`}
          />
        </Feld>
        <Feld feld="uid" label={f.uid.label} optional fehler={fehler.uid}>
          <input
            {...steuerung('uid')}
            type="text"
            autoComplete="off"
            placeholder={f.uid.platzhalter}
            className={`${FELD} ${FELDHOEHE}`}
          />
        </Feld>
      </Abschnitt>

      <Abschnitt titel={t.gruppen.gebiet}>
        <Gruppe feld="gewerke" art="checkbox" legende={f.gewerke.legende} hinweis={f.gewerke.hinweis} fehler={fehler.gewerke} breit {...gruppe('gewerke')}>
          <div className={CHECKBOXEN}>
            {gewerke.map((g) => (
              <Auswahl key={g.id} art="checkbox" name="gewerke" id={`${feldId('gewerke')}-${g.id}`} value={g.id}>
                {g.name}
              </Auswahl>
            ))}
          </div>
        </Gruppe>
        <Feld feld="plz" label={f.plz.label} pflicht hinweis={f.plz.hinweis} fehler={fehler.plz} breit>
          <input
            {...steuerung('plz', true)}
            type="text"
            autoComplete="off"
            aria-required="true"
            maxLength={MAX_FELD}
            placeholder={f.plz.platzhalter}
            onFocus={startePlz}
            className={`${FELD} ${FELDHOEHE}`}
          />
        </Feld>
      </Abschnitt>

      <Abschnitt titel={t.gruppen.erreichbarkeit}>
        <Gruppe feld="zeiten" art="checkbox" legende={f.zeiten.legende} fehler={fehler.zeiten} breit {...gruppe('zeiten')}>
          <div className={CHECKBOXEN}>
            {f.zeiten.optionen.map((o) => (
              <Auswahl key={o.id} art="checkbox" name="zeiten" id={`${feldId('zeiten')}-${o.id}`} value={o.id}>
                {o.text}
              </Auswahl>
            ))}
          </div>
        </Gruppe>
        <Gruppe feld="notdienst" art="radio" legende={f.notdienst.legende} fehler={fehler.notdienst} {...gruppe('notdienst')}>
          <div className={RADIOS}>
            {f.notdienst.optionen.map((o) => (
              <Auswahl key={o.id} art="radio" name="notdienst" id={`${feldId('notdienst')}-${o.id}`} value={o.id}>
                {o.text}
              </Auswahl>
            ))}
          </div>
        </Gruppe>
        <Feld feld="reaktionszeit" label={f.reaktionszeit.label} optional>
          <div className="relative">
            <select
              id={feldId('reaktionszeit')}
              name="reaktionszeit"
              defaultValue=""
              className={`${FELD} ${FELDHOEHE} cursor-pointer appearance-none pr-s7`}
            >
              <option value="">{f.reaktionszeit.bitteWaehlen}</option>
              {f.reaktionszeit.optionen.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.text}
                </option>
              ))}
            </select>
            <Icon name="ui-aufklappen" className="pointer-events-none absolute top-1/2 right-s3 size-[22px] -translate-y-1/2 text-tiefsee" />
          </div>
        </Feld>
      </Abschnitt>

      <Abschnitt titel={t.gruppen.arbeitsweise}>
        <Gruppe feld="richtpreise" art="radio" legende={f.richtpreise.legende} fehler={fehler.richtpreise} breit {...richtpreiseGruppe}>
          <div className={RADIOS}>
            {f.richtpreise.optionen.map((o) => (
              <Auswahl key={o.id} art="radio" name="richtpreise" id={`${feldId('richtpreise')}-${o.id}`} value={o.id}>
                {o.text}
              </Auswahl>
            ))}
          </div>
          {richtpreise === 'abweichung' && (
            <div className="flex flex-col gap-s2">
              <label htmlFor={feldId('abweichungen')} className={BESCHRIFTUNG}>
                {f.abweichungen.label}
                <Zusaetze pflicht />
              </label>
              <textarea
                {...steuerung('abweichungen')}
                rows={3}
                maxLength={MAX_FELD}
                aria-required="true"
                placeholder={f.abweichungen.platzhalter}
                className={`${FELD} min-h-[104px] resize-y py-s3`}
              />
              <Fehlertext feld="abweichungen" text={fehler.abweichungen} />
            </div>
          )}
        </Gruppe>
        <Gruppe feld="haftpflicht" art="radio" legende={f.haftpflicht.legende} fehler={fehler.haftpflicht} breit {...gruppe('haftpflicht')}>
          <div className={RADIOS}>
            {f.haftpflicht.optionen.map((o) => (
              <Auswahl key={o.id} art="radio" name="haftpflicht" id={`${feldId('haftpflicht')}-${o.id}`} value={o.id}>
                {o.text}
              </Auswahl>
            ))}
          </div>
        </Gruppe>
        <Gruppe feld="preisVorab" art="radio" legende={f.preisVorab.legende} fehler={fehler.preisVorab} breit {...gruppe('preisVorab')}>
          <div className={RADIOS}>
            {f.preisVorab.optionen.map((o) => (
              <Auswahl key={o.id} art="radio" name="preisVorab" id={`${feldId('preisVorab')}-${o.id}`} value={o.id}>
                {o.text}
              </Auswahl>
            ))}
          </div>
        </Gruppe>
        <Gruppe feld="unbar" art="radio" legende={f.unbar.legende} fehler={fehler.unbar} breit {...gruppe('unbar')}>
          <div className={RADIOS}>
            {f.unbar.optionen.map((o) => (
              <Auswahl key={o.id} art="radio" name="unbar" id={`${feldId('unbar')}-${o.id}`} value={o.id}>
                {o.text}
              </Auswahl>
            ))}
          </div>
        </Gruppe>
      </Abschnitt>

      <div className="flex flex-col gap-s5 border-t border-linie pt-s6">
        <Feld feld="anmerkungen" label={f.anmerkungen.label} optional>
          <textarea
            id={feldId('anmerkungen')}
            name="anmerkungen"
            rows={4}
            maxLength={MAX_FELD}
            placeholder={f.anmerkungen.platzhalter}
            className={`${FELD} min-h-[128px] resize-y py-s3`}
          />
        </Feld>

        <div className="flex flex-col gap-s2">
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
              {t.einwilligung.text}{' '}
              <a href={DATENSCHUTZ} className="underline underline-offset-3">
                {t.einwilligung.link}
              </a>
              {t.einwilligung.satzende}
              {' '}
              <span aria-hidden="true">{t.pflichtZeichen}</span>
            </span>
          </label>
          <Fehlertext feld="einwilligung" text={fehler.einwilligung} />
        </div>
      </div>

      {/* Honigtopf: für Menschen und Screenreader verborgen (nicht display:none, sonst füllt ihn mancher Bot nicht aus) */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="bewerbung-fax">{t.honigtopf}</label>
        <input id="bewerbung-fax" name="fax" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {status === 'sendefehler' && (
        <div role="alert" className="flex flex-col gap-s3 rounded-card border-2 border-tiefsee bg-weiss p-s4">
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

      <div className="flex flex-col gap-s4 dialog:flex-row dialog:flex-wrap dialog:items-center dialog:gap-x-s5">
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

/** Ersetzt das Formular nach dem Senden. Aufbau wie die Erfolgskarte der Anfrage. */
function Erfolg({ daten }: { daten: Erfolgsdaten }) {
  const titel = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    titel.current?.focus()
  }, [])

  return (
    <div className="flex min-w-0 flex-col gap-s4 rounded-card-lg border border-linie bg-weiss px-s4 py-s5 shadow-karte dialog:p-s6">
      <div className="flex flex-col gap-s3 dialog:flex-row dialog:items-center dialog:gap-s4">
        <IconKreis name="ui-haekchen" dunkel className="size-[52px]" icon="size-[28px]" />
        <h3 ref={titel} tabIndex={-1} className="font-display text-h3-karte dialog:text-h3">
          {t.erfolg.titel}
        </h3>
      </div>
      <p className="text-body">{fuelle(t.erfolg.text, { telefon: daten.telefon, email: daten.email })}</p>
      <p className="text-small text-schiefer">{fuelle(t.erfolg.nummer, { nummer: daten.nummer })}</p>
      <CallButton variante="block" label={t.erfolg.anrufen} />
    </div>
  )
}
