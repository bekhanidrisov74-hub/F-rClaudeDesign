import { useId } from 'react'
import { Button } from '../../components/ui/Button'
import { CallButton } from '../../components/ui/CallButton'
import { IconKreis } from '../../components/ui/IconKreis'
import { GefahrHinweis, SoGehtEsWeiter } from '../../components/ui/SoGehtEsWeiter'
import { copy, fuelle } from '../../content/copy'
import { gewerke } from '../../content/gewerke'
import type { Kontakt, Zustand } from '../flow'

export interface ErfolgProps {
  luna: Zustand
  kontakt: Kontakt
  /** „Neue Anfrage starten“ */
  onNeu: () => void
  /** „Chat schließen“ (nur im Vollbild unter 640 px sichtbar) */
  onSchliessen: () => void
}

const t = copy.luna.erfolg

// Screen 09 (Handy: Kreis über der Überschrift) und Screen 12 Mitte (Fenster: Kreis links daneben).
// Betrieb gefunden (match FOUND) wie im Design; kein Betrieb (NONE): die Anfrage ist trotzdem aufgenommen.
export function Erfolg({ luna, kontakt, onNeu, onSchliessen }: ErfolgProps) {
  const titelId = `${useId()}-titel`
  const gewerk = gewerke.find((g) => g.id === luna.anfrage.gewerk)
  const gefunden = luna.match === 'FOUND'
  // Geschützte Leerzeichen: Die Telefonnummer bricht nicht mitten im Text um.
  const werte = { name: kontakt.name, telefon: kontakt.telefon.replace(/ /g, ' '), betrieb: gewerk?.betrieb ?? t.betriebUnbekannt }

  return (
    <section data-karte aria-labelledby={titelId} className="flex flex-col gap-s3 rounded-card border border-linie bg-weiss p-s4">
      <div className="flex flex-col gap-s3 dialog:flex-row dialog:items-start">
        <IconKreis name="ui-haekchen" dunkel className="size-[52px] dialog:size-[44px]" icon="size-[28px] dialog:size-[24px]" />
        <h2 id={titelId} className="font-display text-h3-karte dialog:text-h4">
          {fuelle(gefunden ? t.titel : t.keinerTitel, werte)}
        </h2>
      </div>

      <p className="text-text">{fuelle(gefunden ? t.text : t.keinerText, werte)}</p>
      {/* Anruf-Knopf gleich unter dem Text, wie in der Erfolgskarte des Formulars (Funnel, 22.10.2026) */}
      <CallButton variante="block" label={t.anrufen} />

      <p className="text-small text-schiefer">{fuelle(t.nummer, { nummer: luna.anfrageId })}</p>

      <SoGehtEsWeiter ebene={3} email={kontakt.email.trim()} mitSchritten={gefunden} />

      {gewerk && gefunden && (
        <p className="rounded-chip bg-eis px-s3 py-s3 text-small">
          <span className="font-bold">{t.tippTitel}</span> {gewerk.tippErfolg}
        </p>
      )}

      <GefahrHinweis />

      <Button art="hell" onClick={onNeu} className="min-h-[52px] w-full rounded-btn-lg px-s4 text-btn">
        {t.neu}
      </Button>
      <Button art="textlink" onClick={onSchliessen} className="min-h-[44px] px-s4 text-btn dialog:hidden">
        {t.schliessen}
      </Button>
    </section>
  )
}
