// Wissen der KI-Luna: die Fakten der Website als Text, nur aus src/content (CLAUDE.md: Daten nur dort).
// scripts/luna-wissen.mjs schreibt wissenPhp() nach public/_wissen.php, public/chat.php setzt den Text in den Systemprompt.
// src/luna/backend.test.ts schlägt an, wenn die Datei veraltet ist: dann `npm run wissen`.
// Bewusst nicht darin: die Vorteile unter dem Hero („Einzigartig in Wien“, „schneller … als andere“) und die Umsatzsteuer
// (UST_HINWEIS), beides ist bei Beks offen (Audit N1, SPEC 1 und 11).
import { AUFTRAG_AUFGEBEN, copy, EINWILLIGUNG, OHNE_KONTO, WOHIN } from '../content/copy'
import { EMAIL, TELEFON, WHATSAPP } from '../content/contact'
import { anfahrtText, einheit, gewerke, PREISE_STAND, spanne } from '../content/gewerke'
import { gewerkText } from '../content/gewerkseiten'
import { partner, PARTNER_PFAD } from '../content/partner'

const punkte = (zeilen: readonly string[]) => zeilen.map((z) => `- ${z}`)
const schritte = (liste: readonly { titel: string; text: string }[]) => liste.map((s, i) => `${i + 1}. ${s.titel}: ${s.text}`)
const fragen = (liste: readonly { frage: string; antwort: string }[]) => liste.map((f) => `F: ${f.frage}\nA: ${f.antwort}`)

export function lunaWissen(): string {
  return [
    'FIXIT247:',
    copy.fuss.text,
    copy.hero.lead,
    '',
    `GEWERKE UND RICHTPREISE der Fachbetriebe (Stand ${PREISE_STAND}):`,
    ...gewerke.flatMap((g) => {
      const s = gewerkText(g.id)
      return [
        `- ${g.name} (Seite /${g.seite}/): ${spanne(g)} ${einheit(g)}, Anfahrt ${anfahrtText(g)}. ${g.karte}.`,
        `  Typische Fälle: ${s.notfall.faelle.join('; ')}. ${s.notfall.lead}`,
        `  Sicherheitstipp: ${g.tipp} Bis der Betrieb kommt: ${g.tippErfolg}`,
      ]
    }),
    '',
    'PREISRECHNER (Startseite, Abschnitt „Preisrechner“):',
    ...punkte([copy.rechner.lead, copy.rechner.stundenHinweis, copy.rechner.einsatz.text, copy.preisuebersicht.hinweiseDialog[0]]),
    '',
    `SO FUNKTIONIERT'S:`,
    ...schritte(copy.ablauf.schritte),
    '',
    `NACH DER ANFRAGE (${copy.weiter.titel}):`,
    ...schritte(copy.weiter.schritte),
    '',
    'ANFRAGE IM CHAT:',
    ...punkte([
      `Schritte: ${copy.luna.schritte.join(', ')}`,
      `Zusammenfassung: ${copy.luna.zusammenfassungIntro} Knopf zum Senden: „${AUFTRAG_AUFGEBEN}“`,
      copy.luna.zusammenfassung.hinweis,
      WOHIN,
      `Einwilligung: ${EINWILLIGUNG.text} ${EINWILLIGUNG.link}${EINWILLIGUNG.satzende}`,
    ]),
    '',
    'ZUSAGEN:',
    ...punkte(copy.zusagen.karten.map((k) => `${k.titel}: ${k.text} ${k.zusatz}.`)),
    '',
    'HÄUFIGE FRAGEN:',
    ...fragen(copy.fragen.liste),
    '',
    'KONTAKT:',
    ...punkte([`Telefon ${TELEFON}`, `WhatsApp ${WHATSAPP}`, `E-Mail ${EMAIL}`, copy.anfrage.seitenkasten.text, copy.anfrage.seitenkasten.hinweis, OHNE_KONTO]),
    '',
    `PARTNER WERDEN (für Fachbetriebe, Seite ${PARTNER_PFAD}):`,
    partner.intro.lead,
    ...punkte(partner.nutzen.punkte.map((n) => `${n.titel}: ${n.text}`)),
    ...schritte(partner.schritte.liste),
    `${partner.erwartungen.titel}: ${partner.erwartungen.punkte.join(' ')} ${partner.erwartungen.pruefung}`,
    ...fragen(partner.fragen.liste),
  ].join('\n')
}

/** Ende des Nowdoc in public/_wissen.php; steht es am Zeilenanfang im Text, endete PHP dort. */
const ENDE = 'LUNA_WISSEN_ENDE'

/** Inhalt von public/_wissen.php */
export function wissenPhp(): string {
  const text = lunaWissen()
  if (new RegExp(`^\\s*${ENDE}`, 'm').test(text)) throw new Error(`wissen.ts: Der Text enthält ${ENDE} am Zeilenanfang.`)
  return `<?php
/* Wissen der KI-Luna für public/chat.php, erzeugt aus src/content über src/luna/wissen.ts. Nicht von Hand ändern,
   sondern npm run wissen; src/luna/backend.test.ts schlägt an, wenn die Datei veraltet ist. Direkt aufgerufen gibt sie nichts aus. */
return <<<'${ENDE}'
${text}
${ENDE};
`
}
