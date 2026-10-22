// nicht im Design (Bauplan M7, Text von Beks freigegeben am 22.10.2026, rechtlich prüfen: Preisangaben und Sicherheitshinweise)
// Texte der Notfall-Seiten je Gewerk (/installateur/, /heizung-klima/ …). Für diese Seiten gibt es keinen Entwurf in design/.
// Wortgleich aus anderen Dateien übernommen: GEFAHR, copy.ablauf, copy.preisStand, copy.preisuebersicht.hinweiseDialog,
// copy.rechner.lead, copy.hero.anfrage, copy.leistungen.hilfe.luna und copy.preisuebersicht.zumRechner. Aus gewerke.ts: Name,
// Richtpreis, Anfahrt, tipp und tippErfolg. Aus fragen.ts: die Fragen des Gewerks.
// fixit247 vermittelt nur: Kein Text sagt, fixit247 repariere selbst, sei ein Notdienst oder garantiere Preise, Ankunfts- oder Reaktionszeiten.
// Zu jedem Gewerk in gewerke.ts gehört hier ein Eintrag mit derselben id.

export interface GewerkSeitenText {
  /** Überschrift der Seite mit dem Suchbegriff */
  h1: string
  /** <title>: Wichtigstes vorn, Marke am Ende */
  titel: string
  /** <meta name="description"> */
  beschreibung: string
  /** Absatz unter der Überschrift: sagt, dass fixit247 vermittelt */
  lead: string
  notfall: {
    /** Einordnung: wann ist das ein Fall für dieses Gewerk, wann gilt der Notruf */
    lead: string
    /** Typische Fälle, passend zu den Antworten in fragen.ts */
    faelle: readonly string[]
  }
}

export const gewerkseiten = {
  brotkrumen: {
    /** Name der Brotkrumen-Navigation (aria-label) */
    label: 'Seitenpfad',
    start: 'Startseite',
  },

  notfall: {
    titel: 'Ist das ein Notfall?',
    faelle: 'Typische Fälle',
    notruf: 'Wann der Notruf gilt',
  },

  bis: {
    titel: 'Bis der Betrieb kommt',
    lead: 'Tun Sie nur, was Sie sicher können, und reparieren Sie nichts selbst.',
  },

  fragen: {
    titel: 'Diese Angaben helfen dem Betrieb',
    lead: 'Damit kann sich der Betrieb auf den Einsatz vorbereiten, ob Sie anrufen, schreiben oder Luna fragen. Sie müssen nicht alles wissen.',
  },

  preis: {
    titel: 'Richtpreis und Zuschläge',
  },

  ablauf: {
    titel: 'So läuft die Vermittlung',
  },

  /** Link auf der Leistungskarte; {name} = Name des Gewerks */
  karte: { mehr: '{name} im Notfall' },

  /** Titel der Liste im Fuß */
  fuss: { titel: 'Gewerke' },
} as const

/** Seitentexte je Gewerk, Schlüssel = id aus gewerke.ts */
const texte: Record<string, GewerkSeitenText> = {
  installateur: {
    h1: 'Installateur im Notfall',
    titel: 'Installateur im Notfall in Wien: Fachbetrieb vermitteln – fixit247',
    beschreibung:
      'Rohrbruch, Abfluss verstopft, Armatur tropft? fixit247 vermittelt kostenlos einen geprüften Installateur aus Wien. Mit Richtpreis und Zuschlägen.',
    lead: 'Rohrbruch, verstopfter Abfluss, tropfende Armatur: fixit247 vermittelt Ihnen einen geprüften Installateur aus Wien. Die Vermittlung ist kostenlos, der Betrieb ruft Sie zurück.',
    notfall: {
      lead: 'Ein Fall für den Installateur ist es, wenn Wasser austritt oder etwas verstopft ist. Dringend wird es, wenn das Wasser stark ausläuft.',
      faelle: ['Rohrbruch, Wasser tritt aus', 'WC oder Abfluss verstopft', 'Wasserhahn oder WC-Spülung defekt', 'Kein Wasser in der Wohnung'],
    },
  },
  shk: {
    h1: 'Heizung und Klima im Notfall',
    titel: 'Heizung und Klima im Notfall in Wien: Fachbetrieb vermitteln – fixit247',
    beschreibung:
      'Therme aus, kein Warmwasser, Klimaanlage defekt? fixit247 vermittelt kostenlos einen geprüften Fachbetrieb für Heizung und Klima aus Wien. Mit Richtpreis.',
    lead: 'Therme ausgefallen, kein Warmwasser oder die Klimaanlage defekt: fixit247 vermittelt Ihnen einen geprüften Fachbetrieb für Heizung und Klima aus Wien. Die Vermittlung ist kostenlos, der Betrieb ruft Sie zurück.',
    notfall: {
      lead: 'Ein Fall für Heizung und Klima ist es, wenn Heizung, Warmwasser oder Klimaanlage nicht mehr funktionieren. Kühlt nur die Klimaanlage nicht, ist es meist kein Notfall. Bei Gasgeruch rufen Sie zuerst den Gasnotruf 128.',
      faelle: ['Therme fällt aus', 'Kein Warmwasser', 'Heizung bleibt kalt', 'Klimaanlage kühlt nicht'],
    },
  },
  schluessel: {
    h1: 'Schlüsseldienst im Notfall',
    titel: 'Schlüsseldienst im Notfall in Wien: Fachbetrieb vermitteln – fixit247',
    beschreibung:
      'Ausgesperrt, Schlüssel abgebrochen, Schloss defekt? fixit247 vermittelt kostenlos einen geprüften Schlüsseldienst aus Wien. Mit Richtpreis pro Einsatz.',
    lead: 'Ausgesperrt, Schlüssel abgebrochen oder Schloss defekt: fixit247 vermittelt Ihnen einen geprüften Schlüsseldienst oder Aufsperrdienst aus Wien. Die Vermittlung ist kostenlos, der Betrieb ruft Sie zurück.',
    notfall: {
      lead: 'Ein Fall für den Schlüsseldienst ist es, wenn Sie nicht mehr in Ihre Wohnung, Ihr Haus oder Ihr Geschäft kommen oder ein Schloss nicht mehr funktioniert.',
      faelle: ['Ausgesperrt, Tür zugefallen oder abgesperrt', 'Schlüssel abgebrochen oder verloren', 'Schlüssel steckt innen', 'Schloss defekt oder zu tauschen'],
    },
  },
  elektro: {
    h1: 'Elektriker im Notfall',
    titel: 'Elektriker im Notfall in Wien: Fachbetrieb vermitteln – fixit247',
    beschreibung:
      'Stromausfall, FI-Schalter fliegt, Steckdose defekt? fixit247 vermittelt kostenlos einen geprüften Elektriker aus Wien. Mit Richtpreis und Zuschlägen.',
    lead: 'Stromausfall, FI-Schalter fliegt, Steckdose defekt: fixit247 vermittelt Ihnen einen geprüften Elektriker aus Wien. Die Vermittlung ist kostenlos, der Betrieb ruft Sie zurück.',
    notfall: {
      lead: 'Ein Fall für den Elektriker ist es, wenn Strom ausfällt oder eine Sicherung immer wieder auslöst. Bei Funken, Rauch oder Brandgeruch rufen Sie zuerst die Feuerwehr 122.',
      faelle: ['Kein Strom in der Wohnung', 'Licht ausgefallen', 'FI-Schalter oder Sicherung fällt', 'Steckdose defekt'],
    },
  },
  geraete: {
    h1: 'Haushaltsgeräte defekt',
    titel: 'Haushaltsgeräte defekt in Wien: Fachbetrieb vermitteln – fixit247',
    beschreibung:
      'Waschmaschine, Herd oder Kühlschrank defekt? fixit247 vermittelt kostenlos einen geprüften Fachbetrieb für Haushaltsgeräte aus Wien. Mit Richtpreis.',
    lead: 'Waschmaschine, Geschirrspüler, Herd oder Kühlschrank defekt: fixit247 vermittelt Ihnen einen geprüften Fachbetrieb für Haushaltsgeräte aus Wien. Die Vermittlung ist kostenlos, der Betrieb ruft Sie zurück.',
    notfall: {
      lead: 'Ein defektes Gerät ist meist ärgerlich, aber kein Notfall. Dringend wird es, wenn Wasser ausläuft oder Lebensmittel zu verderben drohen. Bei Rauch, Brandgeruch oder Funken rufen Sie zuerst die Feuerwehr 122.',
      faelle: ['Gerät startet nicht', 'Kühlschrank kühlt nicht, Herd heizt nicht', 'Wasser läuft aus dem Gerät', 'Laute Geräusche oder ein Fehlercode'],
    },
  },
}

/** Texte der Seite eines Gewerks (Schlüssel = id aus gewerke.ts); ein Gewerk ohne Eintrag bricht den Build mit einer klaren Meldung. */
export function gewerkText(id: string): GewerkSeitenText {
  const text = texte[id]
  if (!text) throw new Error(`gewerkseiten.ts: Für das Gewerk „${id}“ fehlen die Texte der Seite.`)
  return text
}
