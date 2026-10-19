import { copy, fuelle } from '../content/copy'
import { useOverlays } from '../overlays'
import { gewerke, zahlwort } from '../content/gewerke'
import { Hilfekarte } from './Hilfekarte'
import { LeistungKarte } from './LeistungKarte'
import { Button } from './ui/Button'
import { Icon } from './ui/Icon'

export function Leistungen() {
  const { oeffnePreise } = useOverlays()
  return (
    <section id="leistungen" aria-labelledby="leistungen-titel" className="bg-kalk-2">
      <div className="wrapper pt-section pb-section-end">
        <div className="mb-s5 flex flex-col gap-s4 nav:mb-s7 nav:flex-row nav:items-end nav:justify-between nav:gap-x-s7">
          <div className="flex max-w-[680px] flex-col gap-s4 nav:gap-s3">
            <h2 id="leistungen-titel" className="text-h2">
              {copy.leistungen.titel}
            </h2>
            <p className="text-lead text-schiefer">
              {fuelle(copy.leistungen.lead, { anzahl: zahlwort(gewerke.length) })}
            </p>
          </div>
          <Button
            art="hell"
            onClick={(e) => oeffnePreise(e.currentTarget)}
            className="min-h-[56px] w-full gap-s3 rounded-btn-lg px-s3 text-btn dialog:px-s5 nav:w-auto nav:shrink-0 nav:whitespace-nowrap"
          >
            <Icon name="ui-richtpreis" className="size-[22px]" />
            <span>{copy.leistungen.ueberblick}</span>
          </Button>
        </div>
        {/* @container: das Glanzlicht der Karten richtet seinen Versatz nach der echten Spaltenzahl (app.css, glanz) */}
        <div className="@container grid grid-cols-[repeat(auto-fill,minmax(min(340px,100%),1fr))] gap-s5">
          {gewerke.map((g) => (
            <LeistungKarte key={g.id} gewerk={g} />
          ))}
          <Hilfekarte />
        </div>
      </div>
    </section>
  )
}
