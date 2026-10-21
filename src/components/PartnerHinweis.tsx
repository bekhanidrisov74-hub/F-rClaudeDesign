import { PARTNER_PFAD, partner } from '../content/partner'
import { Button } from './ui/Button'

const t = partner.einstieg.hinweis

/**
 * Einstieg für Fachbetriebe am Ende von „Häufige Fragen“ (Startseite): weiße Karte wie die Fragen-Karten, aber ruhiger
 * (kleinerer Text, nur ein Textlink), damit sie neben „Jetzt anrufen“ nicht auffällt. Kein neues Band, der Flächenplan bleibt.
 */
export function PartnerHinweis() {
  return (
    <div className="mt-s3 flex flex-col gap-s2 rounded-card border border-linie bg-weiss px-s5 py-s4 text-tiefsee shadow-karte kopf:flex-row kopf:items-center kopf:justify-between kopf:gap-s5">
      <div className="flex flex-col gap-s1">
        <h3 className="font-display text-h5 font-semibold">{t.titel}</h3>
        <p className="text-text text-schiefer">{t.text}</p>
      </div>
      <Button art="textlink" href={PARTNER_PFAD} className="min-h-[44px] min-w-[44px] shrink-0 self-start text-text kopf:self-center">
        {t.link}
      </Button>
    </div>
  )
}
