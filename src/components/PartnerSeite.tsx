import { gewerke } from '../content/gewerke'
import { partner } from '../content/partner'
import { useOverlays } from '../overlays'
import { Ablauf } from './Ablauf'
import { Fragen } from './Fragen'
import { PartnerFormular } from './PartnerFormular'
import { Seitenrahmen } from './Seitenrahmen'
import { Button } from './ui/Button'
import { CallButton } from './ui/CallButton'
import { Icon } from './ui/Icon'
import { IconKreis } from './ui/IconKreis'

/**
 * Seite „Partner werden“ (/partner-werden/), Flächen von oben: Kalk (Einstieg), Eis (Nutzen), Tiefsee (Schritte), Eis (Erwartungen),
 * Kalk (Bewerbung), Eis (Fragen). Für diese Seite gibt es keinen Entwurf in design/; Raster und Bausteine folgen docs/hero-stil.md.
 * Der einzige Primärknopf ist „Bewerbung senden“; „Zur Bewerbung“ ist ein Zweitknopf, damit der Anruf-Knopf im Kopf das
 * auffälligste Element bleibt.
 */
export function PartnerSeite() {
  const { oeffnePreise } = useOverlays()
  const { intro, nutzen, erwartungen, bewerbung } = partner

  return (
    <Seitenrahmen aufStartseite={false}>
      <section id="partner" aria-labelledby="partner-titel" className="bg-kalk">
        <div className="wrapper pt-section pb-section-end">
          <div className="flex max-w-[680px] flex-col gap-s4 nav:gap-s5">
            <h1 id="partner-titel" className="text-h1">
              {intro.titel}
            </h1>
            <p className="text-lead text-schiefer">{intro.lead}</p>
            {/* Gleich unter dem Lead, damit der Weg zur Bewerbung auf dem ersten Bildschirm steht; Zweitknopf, Anrufen bleibt vorn. */}
            <div className="mt-s2">
              <Button art="hell" href="#bewerbung" className="min-h-[56px] w-full rounded-btn-lg px-s6 text-btn-l dialog:w-auto">
                {intro.knopf}
              </Button>
            </div>
          </div>

          <div className="mt-s7 flex flex-col gap-s4 nav:mt-s8">
            <p id="partner-gewerke" className="font-display text-h5 font-semibold">
              {intro.gewerke}
            </p>
            <ul role="list" aria-labelledby="partner-gewerke" className="grid grid-cols-1 gap-y-s3 dialog:flex dialog:flex-wrap dialog:gap-x-s6 dialog:gap-y-s4">
              {gewerke.map((g) => (
                <li key={g.id} className="flex items-center gap-s3">
                  <IconKreis name={g.icon} className="size-[48px]" icon="size-[28px]" />
                  <span className="text-body font-semibold">{g.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Eigener Abschnitt auf Eis wie „Was ist passiert?“ unter dem Hero: Titel in Abschnittsgröße, weiße Karten mit Schatten.
          Ab 920 px teilen sich die Karten die Zeilen (subgrid), damit die Texte auf gleicher Höhe beginnen. */}
      <section id="nutzen" aria-labelledby="nutzen-titel" className="bg-eis text-tiefsee">
        <div className="wrapper flex flex-col gap-s5 pt-section pb-section-end nav:gap-s7">
          <h2 id="nutzen-titel" className="text-h2 hyphens-auto">
            {nutzen.titel}
          </h2>
          <ul role="list" className="grid gap-s4 nav:grid-cols-3 nav:gap-x-s5 nav:gap-y-s3">
            {nutzen.punkte.map((punkt) => (
              <li
                key={punkt.titel}
                className="flex flex-col gap-s3 rounded-card-lg border border-linie bg-weiss p-s5 shadow-karte nav:row-span-3 nav:grid nav:grid-rows-subgrid"
              >
                <IconKreis name={punkt.icon} className="size-[56px]" icon="size-[34px]" />
                <h3 className="font-display text-h4">{punkt.titel}</h3>
                <p className="text-body text-schiefer">{punkt.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Ablauf id="partner-schritte" titel={partner.schritte.titel} schritte={partner.schritte.liste} />

      <section id="erwartungen" aria-labelledby="erwartungen-titel" className="bg-eis text-tiefsee">
        <div className="wrapper grid gap-s6 pt-section pb-section-end nav:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] nav:gap-s8">
          <div className="flex flex-col gap-s4 nav:sticky nav:top-[calc(var(--fx-kopf)+var(--fx-s-6))] nav:gap-s3 nav:self-start">
            <h2 id="erwartungen-titel" className="text-h2 hyphens-auto">
              {erwartungen.titel}
            </h2>
            <p className="text-lead text-schiefer">{erwartungen.lead}</p>
          </div>
          <div className="flex flex-col gap-s6">
            {/* role="list": Safari/VoiceOver behält die Listensemantik sonst nicht, wenn list-style entfällt */}
            <ul role="list" className="flex flex-col gap-s4">
              {erwartungen.punkte.map((punkt) => (
                <li key={punkt} className="flex items-start gap-s3">
                  <IconKreis name="ui-haekchen" weiss className="size-[36px]" icon="size-[20px]" />
                  <span className="pt-s1 text-body">{punkt}</span>
                </li>
              ))}
            </ul>
            <p className="rounded-card-lg border border-linie bg-weiss p-s5 text-lead font-semibold shadow-karte">{erwartungen.pruefung}</p>
            <div className="flex flex-col items-start gap-s2">
              <p className="text-body text-schiefer">{erwartungen.richtpreise}</p>
              <Button
                art="textlink"
                aria-haspopup="dialog"
                onClick={(e) => oeffnePreise(e.currentTarget)}
                className="min-h-[44px] min-w-[44px] text-body"
              >
                {erwartungen.richtpreiseLink}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="bewerbung" aria-labelledby="bewerbung-titel" className="bg-kalk">
        <div className="wrapper pt-section pb-section-end">
          <div className="mb-s5 flex max-w-[680px] flex-col gap-s4 nav:mb-s7 nav:gap-s3">
            <h2 id="bewerbung-titel" className="text-h2">
              {bewerbung.titel}
            </h2>
            <p className="text-lead text-schiefer">{bewerbung.lead}</p>
          </div>

          <div className="grid items-start gap-s5 nav:grid-cols-[minmax(0,1fr)_320px] hd:grid-cols-[minmax(0,1fr)_380px]">
            <PartnerFormular />
            {/* Hinweiskasten wie im Hero und Seitenkasten der Anfrage: Eis, Radius 20, ohne sichtbaren Rand. Bleibt neben dem langen Formular stehen. */}
            <aside
              aria-labelledby="bewerbung-hilfe-titel"
              className="flex flex-col gap-s3 rounded-card-lg border border-transparent bg-eis px-s4 py-s5 text-tiefsee dialog:p-s6 nav:sticky nav:top-[calc(var(--fx-kopf)+var(--fx-s-6))] nav:gap-s4"
            >
              <Icon name="hilfe" className="h-[49px] w-[44px] nav:h-[61px] nav:w-[55px]" />
              <h3 id="bewerbung-hilfe-titel" className="text-h3-karte nav:text-h2-s">
                {bewerbung.seitenkasten.titel}
              </h3>
              <p className="text-text text-schiefer">{bewerbung.seitenkasten.text}</p>
              <CallButton variante="karte" nummer className="max-nav:hidden" />
              <CallButton variante="block" className="nav:hidden" />
            </aside>
          </div>
        </div>
      </section>

      <Fragen id="partner-fragen" titel={partner.fragen.titel} lead={partner.fragen.lead} liste={partner.fragen.liste} />
    </Seitenrahmen>
  )
}
