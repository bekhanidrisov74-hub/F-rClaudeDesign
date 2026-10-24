import { GEFAHR, copy, fuelle } from '../content/copy'
import { fragenZu } from '../content/fragen'
import { PREISE_STAND, anfahrtText, anfrageAnker, einheit, spanne, type Gewerk } from '../content/gewerke'
import { gewerkText, gewerkseiten } from '../content/gewerkseiten'
import { Ablauf } from './Ablauf'
import { Seitenrahmen } from './Seitenrahmen'
import { Abschnitt, Brotkrumen } from './Unterseite'
import { Button } from './ui/Button'
import { CallButton } from './ui/CallButton'
import { Icon } from './ui/Icon'
import { IconKreis } from './ui/IconKreis'

/**
 * Notfall-Seite eines Gewerks (/installateur/ …, Bauplan M7). Für diese Seiten gibt es keinen Entwurf in design/; Raster und Bausteine
 * folgen docs/hero-stil.md. Flächen von oben: Kalk (Einstieg mit Anruf), Eis (Notfall), Kalk (Tipps), Eis (Fragen), Tiefsee (Ablauf),
 * Kalk (Richtpreis), Fuß Tiefsee. Der Anruf-Knopf ist das erste Handlungselement nach den Brotkrumen, „Anfrage senden“ und „Luna fragen“
 * stehen als Zweitknöpfe daneben. Die Zahlen kommen aus gewerke.ts, dieselben wie in Leistungen und Rechner.
 */
export function GewerkSeite({ gewerk: g }: { gewerk: Gewerk }) {
  const t = gewerkText(g.id)
  const { notfall, bis, fragen, preis, ablauf } = gewerkseiten
  // Bei Heizung und Klima sind beide Tipps derselbe Satz
  const tipps = [...new Set([g.tipp, g.tippErfolg])]
  // Ein Gewerk ohne Fragenkatalog (fragen.ts) bekommt keinen leeren Abschnitt
  const betriebFragt = fragenZu(g.id)

  return (
    <Seitenrahmen aufStartseite={false}>
      <section id="einstieg" aria-labelledby="einstieg-titel" className="bg-kalk">
        <div className="wrapper pt-s4 pb-section-end nav:pt-s5">
          <Brotkrumen aktuell={g.name} />

          <div className="mt-s4 flex max-w-[680px] flex-col gap-s4 nav:mt-s5 nav:gap-s5">
            <h1 id="einstieg-titel" className="text-h1 break-words hyphens-auto">
              {t.h1}
            </h1>
            <p className="text-lead text-schiefer">{t.lead}</p>
          </div>

          {/* Wie im Hero: Anruf-Knopf vorn und am größten, „Anfrage senden“ als Zweitknopf (hero.css), „Luna fragen“ ruhiger daneben.
              Unter 1280 px stehen sie untereinander und füllen die Breite, deshalb hier höchstens 480 px. */}
          <div className="hd-ctas max-w-[480px] hd:max-w-none">
            <CallButton variante="hero" nummer />
            {/* /#anfrage-<id>: Die Startseite wählt das Gewerk über den Anker vor (AnfrageFormular, anfrageAnker) */}
            <a href={`/#${anfrageAnker(g.id)}`} className="hd-anfrage">
              <Icon name="anfrage" className="hd-anfrage-icon" />
              <span className="hd-anfrage-label">{copy.hero.anfrage}</span>
            </a>
            <Button art="hell" href="#luna" className="min-h-[56px] rounded-btn-lg px-s5 text-btn-l">
              {copy.leistungen.hilfe.luna}
            </Button>
          </div>
        </div>
      </section>

      <Abschnitt id="notfall" flaeche="eis" titel={notfall.titel} lead={t.notfall.lead}>
        <div className="flex flex-col gap-s3">
          <h3 id="notfall-faelle" className="font-display text-h5 font-semibold">
            {notfall.faelle}
          </h3>
          {/* role="list": Safari/VoiceOver behält die Listensemantik sonst nicht, wenn list-style entfällt */}
          <ul role="list" aria-labelledby="notfall-faelle" className="flex flex-col gap-s3">
            {t.notfall.faelle.map((fall) => (
              <li key={fall} className="flex items-center gap-s3">
                <IconKreis name={g.icon} weiss className="size-[44px]" icon="size-[26px]" />
                <span className="text-body">{fall}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-start gap-s4 rounded-card-lg border border-linie bg-weiss p-s5 shadow-karte">
          <IconKreis name="ui-warnung" className="size-[48px]" icon="size-[28px]" />
          <div className="flex min-w-0 flex-col gap-s2">
            <h3 className="font-display text-h5 font-semibold">{notfall.notruf}</h3>
            <p className="text-body text-schiefer">{GEFAHR}</p>
          </div>
        </div>
      </Abschnitt>

      <Abschnitt id="bis-betrieb" flaeche="kalk" titel={bis.titel} lead={bis.lead}>
        <ul role="list" className="flex flex-col gap-s4">
          {tipps.map((tipp) => (
            <li key={tipp} className="flex items-start gap-s4 rounded-card-lg border border-linie bg-weiss p-s5 shadow-karte">
              <IconKreis name="ui-info" className="size-[44px]" icon="size-[26px]" />
              <span className="pt-s2 text-body">{tipp}</span>
            </li>
          ))}
        </ul>
      </Abschnitt>

      {betriebFragt.length > 0 && (
        <Abschnitt id="betrieb-fragt" flaeche="eis" titel={fragen.titel} lead={fragen.lead}>
          {/* Die Fragen, die Luna in der Anfrage zu diesem Gewerk stellt (fragen.ts); bewusst kein Aufklapp-Feld */}
          <ul role="list" className="flex flex-col divide-y divide-linie rounded-card-lg border border-linie bg-weiss px-s5 shadow-karte">
            {betriebFragt.map((f) => (
              <li key={f.id} className="py-s4 text-body">
                {f.frage}
              </li>
            ))}
          </ul>
        </Abschnitt>
      )}

      <Ablauf id="gewerk-ablauf" titel={ablauf.titel} />

      <Abschnitt id="richtpreis" flaeche="kalk" titel={preis.titel} lead={copy.rechner.lead}>
        <div className="flex flex-col gap-s4 rounded-card-lg border border-linie bg-weiss p-s5 shadow-karte nav:p-s6">
          <p className="flex flex-wrap items-baseline gap-x-s3 gap-y-s1">
            <span className="betrag text-h2-s font-extrabold">{spanne(g)}</span>
            <span className="text-body text-schiefer">{einheit(g)}</span>
          </p>
          <p className="text-body">{`${copy.leistungen.anfahrt} ${anfahrtText(g)}`}</p>
          <p className="text-body">{copy.preisuebersicht.hinweiseDialog[0]}</p>
          <p className="text-small text-schiefer">{fuelle(copy.preisStand, { stand: PREISE_STAND })}</p>
          {/* Zweiter Anruf am Seitenende: Wer bis zum Preis liest, muss nicht zurück nach oben. */}
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
