import { useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react'
import { copy, fuelle } from '../content/copy'
import { gewerke, PREISE_STAND } from '../content/gewerke'
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
import { zuschlaegeJetzt } from '../lib/zuschlagJetzt'
import { Button } from './ui/Button'
import { CallButton } from './ui/CallButton'
import { Chip } from './ui/Chip'
import { Icon } from './ui/Icon'
import { IconKreis } from './ui/IconKreis'

const START_GEWERK = (gewerke.find((g) => g.id === 'installateur') ?? gewerke[0]).id

const LEGENDE = 'mb-s3 p-0 font-display text-h5 font-bold hd:mb-s4'
const FELDGRUPPE = 'm-0 flex min-w-0 flex-col gap-s3 border-0 p-0'
const REIHE = 'flex flex-wrap gap-s2 dialog:gap-s3'
/** Stepper-Knopf 52 × 52, an der Grenze aria-disabled statt disabled, damit der Fokus bleibt. */
const STEPPER_KNOPF =
  'size-[52px] shrink-0 rounded-chip aria-disabled:cursor-default aria-disabled:border-linie aria-disabled:text-rand'

const MINUTE = 60_000
const jedeMinute = (aenderung: () => void) => {
  const timer = setInterval(aenderung, MINUTE)
  return () => clearInterval(timer)
}
/** Aktuelle Minute (Unix-Zeit / 60 000), einmal pro Minute neu; null beim Vorrendern und Hydrieren, damit das HTML gleich bleibt. */
const useMinute = () => useSyncExternalStore<number | null>(jedeMinute, () => Math.floor(Date.now() / MINUTE), () => null)

export function Preisrechner() {
  const [gewerkId, setGewerkId] = useState(START_GEWERK)
  const [stunden, setStunden] = useState<number>(STUNDEN.start)
  const [zuschlaege, setZuschlaege] = useState<ZuschlagId[]>([])

  const gewerk = gewerke.find((g) => g.id === gewerkId) ?? gewerke[0]
  const ergebnis = rechne(gewerk, stunden, zuschlaege)

  const umschalten = (id: ZuschlagId) =>
    setZuschlaege((alt) => (alt.includes(id) ? alt.filter((x) => x !== id) : [...alt, id]))

  // Gilt jetzt in Wien ein Zuschlag, nennt ihn der Rechner und schaltet ihn auf Knopfdruck ein (Bauplan M6). Gelten mehrere, zählt der erste.
  const minute = useMinute()
  const gilt = minute === null ? undefined : zuschlaegeJetzt(new Date(minute * MINUTE))[0]
  const reihe = useRef<HTMLDivElement>(null)
  const uebernehmen = (id: ZuschlagId) => {
    setZuschlaege((alt) => (alt.includes(id) ? alt : [...alt, id]))
    // Der Knopf verschwindet: Der Fokus geht auf den Umschalter, der jetzt an ist.
    reihe.current?.querySelectorAll('button')[copy.rechner.zuschlaege.findIndex((z) => z.id === id)]?.focus()
  }

  return (
    <section id="preisrechner" aria-labelledby="rechner-titel" className="bg-kalk">
      <div className="wrapper pt-section pb-section-end">
        <div className="mb-s5 flex max-w-[680px] flex-col gap-s4 nav:mb-s7 nav:gap-s3">
          <h2 id="rechner-titel" className="text-h2">
            {copy.rechner.titel}
          </h2>
          <p className="text-lead text-schiefer">{copy.rechner.lead}</p>
        </div>

        {/* Ab 1120 zweispaltig mit gleich hohen Karten. Reicht der Inhalt einer Karte nicht, verteilt sie den Rest
            gleichmäßig auf Ränder und Gruppenabstände (justify-evenly; die Ergebnis-Karte zwischen ihren Blöcken).
            Das hält bei 1120–2560 px jeden Abstand bei höchstens --fx-s-8, auch bei mehreren Zuschlägen. Darunter
            stehen die Karten untereinander: Bis 1119 px wäre die linke Karte nur 444–643 px breit, die Chips liefen
            in zwei bis drei Zeilen, und die Ergebnis-Karte risse ihre Blöcke bis 97 px auseinander. */}
        <div className="grid gap-s5 spalten:grid-cols-[minmax(0,1fr)_420px] hd:grid-cols-[minmax(0,1fr)_440px]">
          <div className="flex min-w-0 flex-col justify-evenly gap-s5 rounded-card-lg border border-linie bg-weiss px-s4 py-s5 shadow-karte dialog:gap-s6 dialog:p-s6">
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
                    onClick={() => setStunden((n) => Math.max(STUNDEN.min, n - STUNDEN.schritt))}
                    className={STEPPER_KNOPF}
                  >
                    <Icon name="ui-minus" className="size-[22px]" />
                  </Button>
                  {/* Ab 640 px so breit wie die längste Anzeige „10,5 Stunden“ (gemessen 6,19 em), damit der Plus-Knopf nicht wandert. */}
                  <output
                    aria-live="polite"
                    className="min-w-0 flex-1 text-center font-display text-h3 font-extrabold dialog:min-w-[6.3em] dialog:flex-none"
                  >
                    {stundenText(stunden)}
                  </output>
                  <Button
                    art="hell"
                    aria-label={copy.rechner.mehr}
                    aria-disabled={stunden >= STUNDEN.max}
                    onClick={() => setStunden((n) => Math.min(STUNDEN.max, n + STUNDEN.schritt))}
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
              <div ref={reihe} className={REIHE}>
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
              <div>
                {/* Immer im Dokument, leer ohne Zuschlag (ohne Höhe, ohne Abstand), damit der Hinweis angesagt wird. */}
                <div aria-live="polite">
                  {gilt && <JetztGilt id={gilt} an={zuschlaege.includes(gilt)} onUebernehmen={() => uebernehmen(gilt)} />}
                </div>
                <div role="status">
                  <ZuschlagHinweis gewaehlt={ergebnis.gewaehlt} />
                </div>
              </div>
            </fieldset>
          </div>

          <Ergebniskarte ergebnis={ergebnis} />
        </div>
      </div>
    </section>
  )
}

/**
 * Schlüsseldienst: statt des Steppers der Hinweis „Preis pro Einsatz“ (Screen 13 oben).
 * Ab 1280 px etwas höher (py-s6), damit die kürzere linke Karte neben der Ergebnis-Karte nicht über --fx-s-8 auseinandergezogen wird.
 */
function EinsatzHinweis() {
  return (
    <div className="flex items-start gap-s3 rounded-btn-lg bg-eis px-s4 py-s4 hd:py-s6">
      <IconKreis name="ui-richtpreis" weiss className="size-[44px]" icon="size-[22px]" />
      <div className="flex min-w-0 flex-col gap-s1">
        <p className="font-display text-h5 font-bold">{copy.rechner.einsatz.titel}</p>
        <p className="text-small text-schiefer">{copy.rechner.einsatz.text}</p>
      </div>
    </div>
  )
}

/** „Jetzt gilt in Wien: Sonntag (+100 %).“ Der Knopf entfällt, sobald dieser Zuschlag eingeschaltet ist. */
function JetztGilt({ id, an, onUebernehmen }: { id: ZuschlagId; an: boolean; onUebernehmen: () => void }) {
  const name = copy.rechner.zuschlaege.find((z) => z.id === id)?.name ?? ''
  return (
    <div className="mb-s3 flex flex-wrap items-center gap-x-s4 rounded-btn-lg bg-eis px-s4 py-s1">
      <p className="min-w-0 py-s2 text-text">{fuelle(copy.rechner.jetztGilt, { zuschlag: name })}</p>
      {!an && (
        <Button art="textlink" onClick={onUebernehmen} className="min-h-[48px] min-w-[44px] text-btn">
          {copy.rechner.uebernehmen}
        </Button>
      )}
    </div>
  )
}

/**
 * Inhalt des dauerhaften Status-Elements: ein Satz bei 0–1 Zuschlägen, ab 2 der Kasten aus Screen 13 unten.
 * Der Kasten ist gebaut wie „Preis pro Einsatz“ (Icon im weißen Kreis) und hält 24 px Abstand zu den Chips.
 */
function ZuschlagHinweis({ gewaehlt }: { gewaehlt: string[] }) {
  if (gewaehlt.length < 2) return <p className="text-small text-schiefer">{copy.rechner.hinweisEiner}</p>
  const text = gewaehlt.length > 2 ? copy.rechner.hinweisAlle : copy.rechner.hinweisMehrere
  return (
    <div className="mt-s3 flex items-start gap-s3 rounded-btn-lg bg-eis px-s4 py-s4">
      <IconKreis name="ui-info" weiss className="size-[36px]" icon="size-[20px]" />
      <p className="min-w-0 self-center text-text">
        <span className="font-bold">{copy.rechner.hinweisMehrereFett}</span> {fuelle(text, { namen: aufzaehlung(gewaehlt) })}
      </p>
    </div>
  )
}

/** Zeile der Ergebnisliste. Der Wert bleibt einzeilig und rutscht bei Platzmangel rechtsbündig unter das Label. */
function Zeile({ label, unter, children }: { label: string; unter?: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-s4 gap-y-s1">
      <dt className="min-w-0 text-schiefer">
        {unter ? (
          <>
            <span className="block">{label}</span>
            <span className="block text-small">{unter}</span>
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
      className="@container flex min-w-0 flex-col justify-between gap-s4 rounded-card-lg bg-eis px-s4 py-s5 text-tiefsee dialog:p-s6"
    >
      <div className="flex flex-col gap-s1">
        <h3 className="text-h4">{t.titel}</h3>
        <p className="text-small text-schiefer">{e.unterzeile}</p>
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
        <div className="flex flex-col gap-s1 border-t border-tiefsee/10 pt-s4">
          <dt className="text-schiefer">{t.gesamt}</dt>
          {/* Einzeilig: Die Schrift schrumpft mit der Kartenbreite (cqi) und der Zeichenzahl, höchstens --fx-total.
              Faktor 1,8: Die breiteste Summe misst gut 0,52 em je Zeichen (Inter 800, Ziffern gleich breit), dazu etwas Reserve.
              Kein nowrap: Mit größerem Textabstand (WCAG 1.4.12) bricht die Spanne um, statt über den Rand zu laufen. */}
          <dd
            style={{ '--zeichen': gesamt.length } as CSSProperties}
            className="betrag leading-[1.1] font-extrabold tracking-[-0.03em] [font-size:min(var(--fx-total),calc(100cqi/var(--zeichen)*1.8))]"
          >
            {gesamt}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-s1">
        <p className="text-small text-schiefer">{t.hinweis}</p>
        <p className="text-small text-schiefer">{fuelle(copy.preisStand, { stand: PREISE_STAND })}</p>
      </div>

      <div className="flex flex-col gap-s3">
        <CallButton variante="block" />
        <Button art="textlink" onClick={(ev) => oeffnePreise(ev.currentTarget)} className="min-h-[48px] text-btn">
          {t.preisuebersicht}
        </Button>
      </div>
    </div>
  )
}
