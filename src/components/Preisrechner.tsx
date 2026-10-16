import { useState, type CSSProperties, type ReactNode } from 'react'
import { copy, fuelle } from '../content/copy'
import { gewerke } from '../content/gewerke'
import { useOverlays } from '../overlays'
import {
  STUNDEN,
  aufzaehlung,
  euro,
  rechne,
  spanneGesamt,
  spanneZeile,
  stundenText,
  type Ergebnis,
  type ZuschlagId,
} from '../lib/preis'
import { Button } from './ui/Button'
import { CallButton } from './ui/CallButton'
import { Chip } from './ui/Chip'
import { Icon } from './ui/Icon'

const START_GEWERK = (gewerke.find((g) => g.id === 'installateur') ?? gewerke[0]).id

const LEGENDE = 'mb-s3 p-0 font-display text-h5 font-[750] [font-stretch:100%]'
const FELDGRUPPE = 'm-0 flex min-w-0 flex-col gap-s3 border-0 p-0'
const REIHE = 'flex flex-wrap gap-s2 dialog:gap-s3'
/** Stepper-Knopf 52 × 52, an der Grenze aria-disabled statt disabled, damit der Fokus bleibt. */
const STEPPER_KNOPF =
  'size-[52px] shrink-0 rounded-chip aria-disabled:cursor-default aria-disabled:border-linie aria-disabled:text-rand'

export function Preisrechner() {
  const [gewerkId, setGewerkId] = useState(START_GEWERK)
  const [stunden, setStunden] = useState<number>(STUNDEN.start)
  const [zuschlaege, setZuschlaege] = useState<ZuschlagId[]>([])

  const gewerk = gewerke.find((g) => g.id === gewerkId) ?? gewerke[0]
  const ergebnis = rechne(gewerk, stunden, zuschlaege)

  const umschalten = (id: ZuschlagId) =>
    setZuschlaege((alt) => (alt.includes(id) ? alt.filter((x) => x !== id) : [...alt, id]))

  return (
    <section id="preisrechner" aria-labelledby="rechner-titel" className="bg-weiss">
      <div className="wrapper pt-section pb-section-end">
        <div className="mb-s5 flex max-w-[680px] flex-col gap-s4 nav:mb-s7 nav:gap-s3">
          <h2 id="rechner-titel" className="text-h2">
            {copy.rechner.titel}
          </h2>
          <p className="text-lead text-schiefer">{copy.rechner.lead}</p>
        </div>

        <div className="grid gap-s5 nav:grid-cols-[minmax(0,1fr)_420px]">
          <div className="flex min-w-0 flex-col gap-s5 rounded-card-lg border border-linie bg-kalk px-s4 py-s5 dialog:gap-s6 dialog:p-s6">
            <fieldset className={FELDGRUPPE}>
              <legend className={LEGENDE}>{copy.rechner.gewerk}</legend>
              <div className={REIHE}>
                {gewerke.map((g) => (
                  <Chip key={g.id} pressed={g.id === gewerk.id} onClick={() => setGewerkId(g.id)}>
                    {g.name}
                  </Chip>
                ))}
              </div>
            </fieldset>

            {ergebnis.einsatz ? (
              <EinsatzHinweis />
            ) : (
              <fieldset className={FELDGRUPPE}>
                <legend className={LEGENDE}>{copy.rechner.arbeitszeit}</legend>
                <div className="flex items-center justify-between gap-s3 dialog:justify-start">
                  <Button
                    art="hell"
                    aria-label={copy.rechner.weniger}
                    aria-disabled={stunden <= STUNDEN.min}
                    onClick={() => setStunden((n) => Math.max(STUNDEN.min, n - 1))}
                    className={STEPPER_KNOPF}
                  >
                    <Icon name="ui-minus" className="size-[22px]" />
                  </Button>
                  <output
                    aria-live="polite"
                    className="min-w-0 flex-1 text-center font-display text-h3 font-extrabold [font-stretch:100%] dialog:min-w-[128px] dialog:flex-none"
                  >
                    {stundenText(stunden)}
                  </output>
                  <Button
                    art="hell"
                    aria-label={copy.rechner.mehr}
                    aria-disabled={stunden >= STUNDEN.max}
                    onClick={() => setStunden((n) => Math.min(STUNDEN.max, n + 1))}
                    className={STEPPER_KNOPF}
                  >
                    <Icon name="ui-plus" className="size-[22px]" />
                  </Button>
                </div>
                <p className="text-small text-schiefer">{copy.rechner.stundenHinweis}</p>
              </fieldset>
            )}

            <fieldset className={FELDGRUPPE}>
              <legend className={LEGENDE}>{copy.rechner.zuschlag}</legend>
              <div className={REIHE}>
                {copy.rechner.zuschlaege.map((z) => (
                  <Chip
                    key={z.id}
                    pressed={zuschlaege.includes(z.id)}
                    zusatz={copy.rechner.plus100}
                    onClick={() => umschalten(z.id)}
                  >
                    {z.name}
                  </Chip>
                ))}
              </div>
              <div role="status">
                <ZuschlagHinweis gewaehlt={ergebnis.gewaehlt} />
              </div>
            </fieldset>
          </div>

          <Ergebniskarte ergebnis={ergebnis} />
        </div>
      </div>
    </section>
  )
}

/** Schlüsseldienst: statt des Steppers der Hinweis „Preis pro Einsatz“ (Screen 13 oben). */
function EinsatzHinweis() {
  return (
    <div className="flex items-start gap-s3 rounded-btn-lg border border-linie bg-weiss px-s4 py-s4">
      <span
        aria-hidden="true"
        className="flex size-[40px] shrink-0 items-center justify-center rounded-icon bg-tuerkis text-tiefsee"
      >
        <Icon name="ui-richtpreis" className="size-[24px]" />
      </span>
      <div className="flex min-w-0 flex-col gap-s1">
        <p className="font-display text-h5 font-[750] [font-stretch:100%]">{copy.rechner.einsatz.titel}</p>
        <p className="text-small text-schiefer">{copy.rechner.einsatz.text}</p>
      </div>
    </div>
  )
}

/** Inhalt des dauerhaften Status-Elements: ein Satz bei 0–1 Zuschlägen, ab 2 der Kasten aus Screen 13 unten. */
function ZuschlagHinweis({ gewaehlt }: { gewaehlt: string[] }) {
  if (gewaehlt.length < 2) return <p className="text-small text-schiefer">{copy.rechner.hinweisEiner}</p>
  const text = gewaehlt.length > 2 ? copy.rechner.hinweisAlle : copy.rechner.hinweisMehrere
  return (
    <div className="rahmen flex items-start gap-s3 rounded-btn border-tiefsee bg-weiss px-s4 py-s3">
      <Icon name="ui-info" className="size-[24px]" />
      <p className="min-w-0 text-text">
        <span className="font-bold">{copy.rechner.hinweisMehrereFett}</span> {fuelle(text, { namen: aufzaehlung(gewaehlt) })}
      </p>
    </div>
  )
}

/** Zeile der Ergebnisliste. Der Wert bleibt einzeilig und rutscht bei Platzmangel rechtsbündig unter das Label. */
function Zeile({ label, unter, children }: { label: string; unter?: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-s4 gap-y-s1">
      <dt className="min-w-0 text-nebel">
        {unter ? (
          <>
            <span className="block">{label}</span>
            <span className="block text-note">{unter}</span>
          </>
        ) : (
          label
        )}
      </dt>
      <dd className="betrag ml-auto font-bold whitespace-nowrap">{children}</dd>
    </div>
  )
}

function Ergebniskarte({ ergebnis: e }: { ergebnis: Ergebnis }) {
  const { ergebnis: t } = copy.rechner
  const { oeffnePreise } = useOverlays()
  const gesamt = spanneGesamt(e.gesamt.min, e.gesamt.max)

  return (
    <div
      aria-live="polite"
      className="kante @container flex min-w-0 flex-col gap-s4 rounded-card-lg bg-tiefsee px-s4 py-s5 text-kalk dialog:gap-s5 dialog:p-s6"
    >
      <div className="flex flex-col gap-s1">
        <h3 className="text-h4 font-[750] [font-stretch:100%]">{t.titel}</h3>
        <p className="text-note text-nebel">{e.unterzeile}</p>
      </div>

      <dl className="flex flex-col gap-s3 text-body">
        <Zeile label={e.einsatz ? t.einsatz : t.arbeit}>{spanneZeile(e.arbeit.min, e.arbeit.max)}</Zeile>
        <Zeile label={t.anfahrt}>{euro(e.anfahrt)}</Zeile>
        {e.zuschlag ? (
          <Zeile label={t.zuschlagAktiv} unter={t.zuschlagUnterzeile}>
            {spanneZeile(e.zuschlag.min, e.zuschlag.max)}
          </Zeile>
        ) : (
          <Zeile label={t.zuschlag}>{t.keiner}</Zeile>
        )}
        <div className="flex flex-col gap-s1 border-t border-tiefsee-2 pt-s4">
          <dt className="text-nebel">{t.gesamt}</dt>
          {/* Einzeilig: Die Schrift schrumpft mit der Kartenbreite (cqi) und der Zeichenzahl, höchstens --fx-total.
              Faktor 2: Die breiteste Summe misst gut 0,47 em je Zeichen (Bricolage 700, 96 %, 16–30 px), dazu etwas Reserve. */}
          <dd
            style={{ '--zeichen': gesamt.length } as CSSProperties}
            className="font-display leading-[1.1] font-bold whitespace-nowrap [font-size:min(var(--fx-total),calc(100cqi/var(--zeichen)*2))] [font-stretch:96%]"
          >
            {gesamt}
          </dd>
        </div>
      </dl>

      <p className="text-note text-nebel">{t.hinweis}</p>

      <div className="mt-auto flex flex-col gap-s3">
        <CallButton variante="block" />
        <Button art="textlink" onClick={(ev) => oeffnePreise(ev.currentTarget)} className="min-h-[48px] text-btn">
          {t.preisuebersicht}
        </Button>
      </div>
    </div>
  )
}
