import { useEffect, useRef, type MouseEvent } from 'react'
import { copy } from '../content/copy'
import { anfahrtText, einheit, gewerke, spanne } from '../content/gewerke'
import { useOverlays } from '../overlays'
import { Button } from './ui/Button'
import { CallButton } from './ui/CallButton'
import { GewerkIcon } from './ui/GewerkIcon'
import { Icon } from './ui/Icon'

const t = copy.preisuebersicht

/**
 * Das <dialog> ist selbst die Karte (Anzeige bleibt dem Browser überlassen, sonst wäre das geschlossene Fenster sichtbar).
 * Das innere Element füllt es ganz aus und scrollt. So trifft ein Klick nur dann `event.target === dialog`,
 * wenn er auf die Abdunklung geht.
 * Unter 640 px: Bottom-Sheet, unten angedockt. Ab 640 px: zentrierter Dialog mit 680 px.
 */
const DIALOG = [
  // UA-Stile zurücksetzen
  'm-0 border-0 bg-transparent p-0 text-tiefsee',
  // Sheet
  'fixed inset-x-0 top-auto bottom-0 h-fit max-h-[92dvh] w-full max-w-none rounded-t-dialog shadow-up',
  // Dialog
  'dialog:inset-0 dialog:m-auto dialog:max-h-[calc(100dvh_-_48px)] dialog:w-[680px] dialog:max-w-[calc(100%_-_48px)] dialog:rounded-dialog dialog:shadow-l',
  // Einblenden: Sheet gleitet herein, Dialog blendet ein, die Abdunklung läuft gleichzeitig mit
  'max-dialog:transition-transform max-dialog:duration-(--fx-dur-sheet) max-dialog:ease-fx max-dialog:starting:translate-y-full',
  'dialog:transition-opacity dialog:duration-(--fx-dur-dialog) dialog:ease-fx dialog:starting:opacity-0',
  'backdrop:bg-abdunklung backdrop:transition-colors backdrop:ease-fx backdrop:starting:bg-transparent',
  'max-dialog:backdrop:duration-(--fx-dur-sheet) dialog:backdrop:duration-(--fx-dur-dialog) motion-reduce:backdrop:transition-none',
].join(' ')

export function Preisuebersicht({ aufStartseite = true }: { aufStartseite?: boolean }) {
  const { preiseOffen, schliessePreise } = useOverlays()
  const dialog = useRef<HTMLDialogElement>(null)
  const schliessen = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (preiseOffen && !d.open) {
      d.showModal()
      schliessen.current?.focus()
    } else if (!preiseOffen && d.open) d.close()
  }, [preiseOffen])

  const abdunklung = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) schliessePreise()
  }

  const zumRechner = (e: MouseEvent<HTMLElement>) => {
    schliessePreise()
    if (!aufStartseite) return // Rechtsseiten: der Link geht zu „/#preisrechner“
    e.preventDefault()
    // Erst nach dem Rückfokus springen: Der Fokus auf den Auslöser scrollt diesen sonst wieder ins Bild.
    requestAnimationFrame(() => requestAnimationFrame(() => window.location.assign('#preisrechner')))
  }
  const ziel = aufStartseite ? '#preisrechner' : '/#preisrechner'

  return (
    <dialog ref={dialog} aria-labelledby="preise-titel" onClose={schliessePreise} onClick={abdunklung} className={DIALOG}>
      <div className="flex max-h-[inherit] flex-col gap-s3 overflow-y-auto overscroll-contain rounded-t-dialog bg-weiss px-s4 pt-s3 pb-s5 dialog:gap-s5 dialog:rounded-dialog dialog:p-s6">
        <span aria-hidden="true" className="h-[5px] w-[44px] self-center rounded-pill bg-rand dialog:hidden" />

        <div className="grid grid-cols-[1fr_auto] items-start gap-x-s3 dialog:gap-x-s4">
          <h2
            id="preise-titel"
            className="col-start-1 row-start-1 mt-s1 text-h2-s tracking-[-0.01em] dialog:mt-0 dialog:text-h2-dialog"
          >
            {t.titel}
          </h2>
          <button
            ref={schliessen}
            type="button"
            autoFocus
            aria-label={t.schliessen}
            onClick={schliessePreise}
            className="rahmen col-start-2 row-start-1 flex size-[44px] cursor-pointer items-center justify-center rounded-chip border-rand bg-weiss text-tiefsee dialog:row-end-3"
          >
            <Icon name="ui-schliessen" className="size-[20px]" />
          </button>
          <p className="col-span-2 mt-s3 text-small text-schiefer dialog:col-span-1 dialog:mt-s2 dialog:text-text">{t.lead}</p>
        </div>

        {/* ab 640 px: Tabelle */}
        <table className="w-full table-fixed border-collapse text-text max-dialog:hidden">
          <thead>
            <tr className="text-note text-schiefer">
              <th scope="col" className="w-[47%] pb-s3 text-left font-bold">
                {t.spalten.gewerk}
              </th>
              <th scope="col" className="w-[34%] pb-s3 text-left font-bold">
                {t.spalten.richtpreis}
              </th>
              <th scope="col" className="pb-s3 text-right font-bold">
                {t.spalten.anfahrt}
              </th>
            </tr>
          </thead>
          <tbody>
            {gewerke.map((g) => (
              <tr key={g.id} className="border-t border-linie last:border-b">
                <th scope="row" className="py-s3 text-left font-normal">
                  <span className="flex items-center gap-s3">
                    <GewerkIcon gewerk={g} sizes="40px" className="size-[40px]" />
                    <span className="font-display text-body font-[750]">{g.name}</span>
                  </span>
                </th>
                <td className="py-s3">
                  <span className="betrag font-bold">{spanne(g)}</span> {einheit(g)}
                </td>
                <td className="betrag py-s3 text-right">{anfahrtText(g)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* unter 640 px: Liste */}
        <ul className="border-t border-linie dialog:hidden">
          {gewerke.map((g) => (
            <li key={g.id} className="flex items-center gap-s3 border-b border-linie py-s2">
              <GewerkIcon gewerk={g} sizes="40px" className="mr-s1 size-[40px]" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-display text-text leading-tight font-[750]">{g.name}</span>
                <span className="text-note text-schiefer">
                  {t.anfahrt} {anfahrtText(g)}
                </span>
              </span>
              <span className="flex flex-col items-end whitespace-nowrap">
                <span className="betrag text-text font-bold">{spanne(g)}</span>
                <span className="text-note text-schiefer">{einheit(g)}</span>
              </span>
            </li>
          ))}
        </ul>

        <ul className="flex flex-col gap-s2 text-small text-schiefer max-dialog:hidden">
          {t.hinweiseDialog.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
        <p className="text-note text-schiefer dialog:hidden">{t.hinweisSheet}</p>

        <div className="flex items-center gap-s3 max-dialog:hidden">
          <Button art="hell" href={ziel} onClick={zumRechner} className="min-h-[54px] px-s5 text-btn">
            {t.zumRechner}
          </Button>
          <CallButton variante="block" nummer className="flex-1" />
        </div>
        <div className="flex flex-col gap-s3 dialog:hidden">
          <CallButton variante="block" />
          <Button art="textlink" href={ziel} onClick={zumRechner} className="min-h-[44px] w-full text-btn">
            {t.zumRechner}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
