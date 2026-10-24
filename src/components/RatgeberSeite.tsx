import { GEFAHR, GEPRUEFT, copy } from '../content/copy'
import { ratgeber, type RatgeberPunkt } from '../content/ratgeber'
import { Seitenrahmen } from './Seitenrahmen'
import { Abschnitt, Brotkrumen } from './Unterseite'
import { Button } from './ui/Button'
import { CallButton } from './ui/CallButton'
import { Icon } from './ui/Icon'
import { IconKreis } from './ui/IconKreis'

const KARTE = 'rounded-card-lg border border-linie bg-weiss shadow-karte'

/** Punkte als Liste in einer weißen Karte, wie „Diese Angaben helfen dem Betrieb“ auf den Gewerk-Seiten */
function Liste({ punkte }: { punkte: readonly RatgeberPunkt[] }) {
  return (
    <ul role="list" className={`flex flex-col divide-y divide-linie px-s5 ${KARTE}`}>
      {punkte.map((p) =>
        typeof p === 'string' ? (
          <li key={p} className="py-s4 text-body">
            {p}
          </li>
        ) : (
          <li key={p.vor} className="py-s4 text-body">
            {p.vor}
            <a href={p.link.href} className="underline underline-offset-4 hover:decoration-tuerkis">
              {p.link.text}
            </a>
            {p.nach}
          </li>
        ),
      )}
    </ul>
  )
}

/**
 * Ratgeber „Seriöse Notdienste erkennen“ (Bauplan B7). Kein Entwurf in design/; Raster und Bausteine wie die Gewerk-Seiten.
 * Flächen von oben: Kalk (Einstieg mit Anruf), dann Eis und Kalk im Wechsel, zuletzt Kalk (Prüfung mit zweitem Anruf), Fuß Tiefsee.
 */
export function RatgeberSeite() {
  const { vorAnruf, telefon, vorOrt, bezahlen, rechte, pruefung } = ratgeber
  return (
    <Seitenrahmen aufStartseite={false}>
      <section id="einstieg" aria-labelledby="einstieg-titel" className="bg-kalk">
        <div className="wrapper pt-s4 pb-section-end nav:pt-s5">
          <Brotkrumen aktuell={ratgeber.name} />
          <div className="mt-s4 flex max-w-[680px] flex-col gap-s4 nav:mt-s5 nav:gap-s5">
            <h1 id="einstieg-titel" className="text-h1 break-words hyphens-auto">
              {ratgeber.h1}
            </h1>
            <p className="text-lead text-schiefer">{ratgeber.lead}</p>
          </div>
          {/* Knöpfe wie auf den Gewerk-Seiten: Anruf vorn und am größten */}
          <div className="hd-ctas max-w-[480px] hd:max-w-none">
            <CallButton variante="hero" nummer />
            <a href="/#anfrage" className="hd-anfrage">
              <Icon name="anfrage" className="hd-anfrage-icon" />
              <span className="hd-anfrage-label">{copy.hero.anfrage}</span>
            </a>
            <Button art="hell" href="#luna" className="min-h-[56px] rounded-btn-lg px-s5 text-btn-l">
              {copy.leistungen.hilfe.luna}
            </Button>
          </div>
        </div>
      </section>

      <Abschnitt id="vor-anruf" flaeche="eis" titel={vorAnruf.titel} lead={vorAnruf.lead}>
        <Liste punkte={vorAnruf.punkte} />
        <div className={`flex items-start gap-s4 p-s5 ${KARTE}`}>
          <IconKreis name="ui-warnung" className="size-[48px]" icon="size-[28px]" />
          <div className="flex min-w-0 flex-col gap-s2">
            <h3 className="font-display text-h5 font-semibold">{vorAnruf.notruf}</h3>
            <p className="text-body text-schiefer">{GEFAHR}</p>
          </div>
        </div>
      </Abschnitt>

      <Abschnitt id="am-telefon" flaeche="kalk" titel={telefon.titel} lead={telefon.lead}>
        <Liste punkte={telefon.punkte} />
        {/* Hinweiskasten wie im Hero (hero-stil.md): Eis, Radius 20, ohne Rand, weißer Icon-Kreis */}
        <div className="flex items-start gap-s4 rounded-card-lg bg-eis p-s5 text-tiefsee">
          <IconKreis name="ui-info" weiss className="size-[44px]" icon="size-[26px]" />
          <p className="pt-s2 text-body">{telefon.hinweis}</p>
        </div>
      </Abschnitt>

      <Abschnitt id="vor-ort" flaeche="eis" titel={vorOrt.titel} lead={vorOrt.lead}>
        <Liste punkte={vorOrt.punkte} />
      </Abschnitt>

      <Abschnitt id="bezahlen" flaeche="kalk" titel={bezahlen.titel} lead={bezahlen.lead}>
        <Liste punkte={bezahlen.punkte} />
      </Abschnitt>

      <Abschnitt id="rechte" flaeche="eis" titel={rechte.titel} lead={rechte.lead}>
        <Liste punkte={rechte.punkte} />
      </Abschnitt>

      <Abschnitt id="pruefung" flaeche="kalk" titel={pruefung.titel} lead={GEPRUEFT}>
        <div className={`flex flex-col gap-s4 p-s5 nav:p-s6 ${KARTE}`}>
          <p className="text-body">{pruefung.richtpreise}</p>
          <CallButton variante="karte" nummer className="self-start" />
        </div>
        <div className="flex items-start">
          <Button art="textlink" href="/#preisrechner" className="min-h-[44px] min-w-[44px] text-body">
            {copy.preisuebersicht.zumRechner}
          </Button>
        </div>
      </Abschnitt>
    </Seitenrahmen>
  )
}
