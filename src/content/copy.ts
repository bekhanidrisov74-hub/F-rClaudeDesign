// Alle sichtbaren Texte. Quelle: design/reference-html (02 für Desktop, 01 für Handy-Varianten) und design/SPEC.md.
// Texte, die nicht im Design stehen, sind mit „nicht im Design“ markiert und stehen im Bericht.
// Gewerke-Texte (Namen, Kacheln, Karten, Preise, Tipps) stehen in gewerke.ts.

/** SPEC 11, offen: widerspricht dem Vermittlungsmodell, bleibt bis zur Entscheidung so. */
export const AUFTRAG_AUFGEBEN = 'Auftrag aufgeben'
/** Echo-Blase in Luna nach dem Absenden, ändert sich mit AUFTRAG_AUFGEBEN. */
export const AUFTRAG_AUFGEGEBEN = 'Auftrag aufgegeben'
/** SPEC 11, offen: Brutto/netto */
export const UST_HINWEIS = '[inkl. 20 % USt.]'
export const WEISS_NICHT = 'Weiß ich nicht'

export const copy = {
  meta: {
    // nicht im Design: Titel und Beschreibung aus Sätzen der Startseite zusammengesetzt
    titel: 'fixit247 – Handwerker-Notdienst rund um die Uhr',
    /** Titel der Unterseiten: „Impressum – fixit247“ */
    unterseite: '{seite} – fixit247',
    beschreibung:
      'Rohrbruch, ausgesperrt, Strom weg? Wir vermitteln Ihnen sofort einen geprüften Fachbetrieb aus Ihrer Region. Die Vermittlung ist kostenlos.',
  },

  kopf: {
    logo: 'fixit247',
    logoLabel: 'fixit247, zur Startseite',
    navLabel: 'Hauptnavigation',
    nav: [
      { text: 'Leistungen', href: '#leistungen' },
      { text: "So funktioniert's", href: '#ablauf' },
      { text: 'Preisrechner', href: '#preisrechner' },
      { text: 'Anfrage', href: '#anfrage' },
    ],
    anrufen: 'Anrufen',
    menueOeffnen: 'Menü öffnen',
    menueSchliessen: 'Menü schließen', // Screen 05
  },

  anruf: {
    jetzt: 'Jetzt anrufen',
  },

  /** Abrechnungseinheiten (Leistungen, Preisübersicht, Rechner, Luna) */
  einheit: { stunde: 'pro Stunde', einsatz: 'pro Einsatz' },
  /** Bindewort für Aufzählungen: „Sonntag und Nacht“ */
  und: 'und',

  hero: {
    h1: ['Handwerker-', 'Notdienst.', 'Rund um die Uhr.'],
    lead: 'Rohrbruch, ausgesperrt, Strom weg? Wir vermitteln Ihnen sofort einen geprüften Fachbetrieb aus Ihrer Region.',
    whatsapp: 'WhatsApp',
    anfrage: 'Anfrage senden',
    hinweis: 'Die Vermittlung ist kostenlos. Der Vertrag kommt direkt mit dem Betrieb zustande.',
  },

  schnellwahl: {
    titel: 'Was ist passiert?',
    luna: {
      titel: 'Nicht sicher?',
      unterzeile: 'Luna hilft beim Zuordnen',
      /** Handy (Screen 01): ein Label ohne Unterzeile */
      handy: 'Nicht sicher? Luna fragen',
    },
  },

  vertrauen: {
    label: 'Warum fixit247',
    punkte: [
      { icon: 'ui-rund-um-die-uhr', titel: 'Rund um die Uhr', text: 'Auch nachts, an Sonn- und Feiertagen' },
      { icon: 'ui-region', titel: 'Fachbetriebe aus Ihrer Region', text: 'Geprüft und in Ihrer Nähe' },
      { icon: 'ui-richtpreis', titel: 'Richtpreise vorab', text: 'Sie kennen die Spanne, bevor jemand kommt' },
      { icon: 'ui-vermittlung', titel: 'Vermittlung kostenlos', text: 'Sie zahlen nur den Betrieb' },
    ],
  },

  leistungen: {
    titel: 'Leistungen',
    /** {anzahl} = zahlwort(gewerke.length) */
    lead: 'Wir vermitteln geprüfte Fachbetriebe für diese {anzahl} Bereiche. Alle Preise sind Richtpreise der Betriebe.',
    ueberblick: 'Alle Richtpreise im Überblick',
    anfahrt: 'Anfahrt',
    /** {name} = Gewerk */
    anfragen: '{name} anfragen',
    hilfe: {
      titel: 'Ihr Problem ist nicht dabei?',
      text: 'Luna, unsere digitale Assistentin, fragt kurz nach und sagt Ihnen, welcher Betrieb passt. Oder Sie rufen uns direkt an.',
      luna: 'Luna fragen',
    },
  },

  ablauf: {
    titel: "So funktioniert's",
    schritte: [
      {
        titel: 'Anfrage senden',
        text: 'Rufen Sie an, schreiben Sie per WhatsApp oder füllen Sie das Formular aus. Ein Foto vom Schaden hilft.',
      },
      {
        titel: 'Wir vermitteln einen Betrieb in der Nähe',
        text: 'Wir geben Ihre Anfrage an einen geprüften Fachbetrieb aus Ihrer Region weiter. Die Vermittlung ist kostenlos.',
      },
      {
        titel: 'Der Betrieb meldet sich und kommt',
        text: 'Der Betrieb ruft Sie zurück, nennt den Preis und kommt zu Ihnen. Der Vertrag kommt direkt mit dem Betrieb zustande.',
      },
    ],
  },

  fuss: {
    text: 'Vermittlung von Handwerker-Notdiensten in Österreich. fixit247 repariert nicht selbst, sondern gibt Ihre Anfrage an geprüfte Fachbetriebe aus Ihrer Region weiter. Die Vermittlung ist kostenlos. Der Vertrag kommt direkt mit dem Betrieb zustande.',
    kontakt: 'Kontakt',
    /** Desktop (02): „Telefon [Telefonnummer]“, „WhatsApp [WhatsApp-Nummer]“; Handy (01): ohne Präfix bzw. ohne Nummer */
    telefon: 'Telefon',
    whatsapp: 'WhatsApp',
    rechtliches: 'Rechtliches',
    links: [
      { text: 'Impressum', href: '/impressum' },
      { text: 'Datenschutz', href: '/datenschutz' },
      { text: 'AGB', href: '/agb' },
    ],
    /** {jahr}, {firma} */
    copyright: '© {jahr} {firma}',
    preise: 'Alle Preise sind Richtpreise der Fachbetriebe.',
  },

  rechner: {
    titel: 'Was kostet der Einsatz ungefähr?',
    lead: 'Richtpreise der Fachbetriebe. Den genauen Preis vereinbaren Sie mit dem Betrieb.',
    gewerk: 'Gewerk',
    arbeitszeit: 'Arbeitszeit',
    weniger: 'Eine Stunde weniger',
    mehr: 'Eine Stunde mehr',
    stundenHinweis: '1 bis 12 Stunden. Beim Schlüsseldienst gilt ein Preis pro Einsatz.',
    stunde: 'Stunde',
    stunden: 'Stunden',
    /** vor dem Gesamtpreis: „ca. 219,90 € – 309,90 €“ */
    ca: 'ca.',
    einsatz: {
      titel: 'Preis pro Einsatz',
      text: 'Der Schlüsseldienst rechnet nicht nach Stunden ab. Die Arbeitszeit entfällt deshalb.',
    },
    zuschlag: 'Zuschlag',
    zuschlaege: [
      { id: 'sonntag', name: 'Sonntag' },
      { id: 'feiertag', name: 'Feiertag' },
      { id: 'nacht', name: 'Nacht' },
    ],
    plus100: '+100 %',
    hinweisEiner: 'Es zählt höchstens ein Zuschlag, auch wenn mehrere zutreffen.',
    hinweisMehrereFett: 'Es zählt nur ein Zuschlag.',
    /** {namen} = „Sonntag und Nacht“ */
    hinweisMehrere: '{namen} treffen beide zu, berechnet wird trotzdem nur einmal +100 %.',
    // nicht im Design: drei Zuschläge gleichzeitig
    hinweisAlle: '{namen} treffen alle zu, berechnet wird trotzdem nur einmal +100 %.',
    ergebnis: {
      titel: 'Ihre Richtpreis-Spanne',
      arbeit: 'Arbeit',
      einsatz: 'Einsatz',
      anfahrt: 'Anfahrt',
      zuschlag: 'Zuschlag',
      keiner: 'keiner',
      zuschlagAktiv: 'Zuschlag +100 %',
      zuschlagUnterzeile: 'auf die Arbeit, nur einmal',
      gesamt: 'Gesamt',
      hinweis: 'Richtpreis. Den genauen Preis vereinbaren Sie mit dem Betrieb.',
      keinZuschlag: 'kein Zuschlag',
      preisuebersicht: 'Preisübersicht öffnen',
    },
  },

  preisuebersicht: {
    titel: 'Richtpreise im Überblick',
    lead: 'Richtpreise der Fachbetriebe. Den genauen Preis vereinbaren Sie mit dem Betrieb.',
    schliessen: 'Preisübersicht schließen',
    spalten: { gewerk: 'Gewerk', richtpreis: 'Richtpreis', anfahrt: 'Anfahrt' },
    anfahrt: 'Anfahrt',
    /** Dialog ab 640 px (Screen 03) */
    hinweiseDialog: [
      'Zuschlag für Sonntag, Feiertag oder Nacht: +100 % auf die Arbeit. Es zählt höchstens ein Zuschlag.',
      `Die Vermittlung ist kostenlos. Alle Preise ${UST_HINWEIS}, Richtpreise der Betriebe.`,
    ],
    /** Bottom-Sheet unter 640 px (Screen 04) */
    hinweisSheet: `Zuschlag für Sonntag, Feiertag oder Nacht: +100 % auf die Arbeit, höchstens einer. Alle Preise ${UST_HINWEIS}. Die Vermittlung ist kostenlos.`,
    zumRechner: 'Zum Preisrechner',
  },

  menue: {
    label: 'Menü', // nicht im Design: Name der Menü-Fläche (aria-label)
    links: [
      { text: 'Leistungen', href: '#leistungen' },
      { text: "So funktioniert's", href: '#ablauf' },
      { text: 'Preisrechner', href: '#preisrechner' },
      { text: 'Preisübersicht', href: null },
      { text: 'Anfrage senden', href: '#anfrage' },
    ],
    kontaktTitel: 'Rund um die Uhr erreichbar',
    whatsapp: 'Per WhatsApp schreiben',
  },

  luna: {
    oeffnen: 'Chat mit Luna öffnen',
  },

  rechtliches: {
    // nicht im Design: Platzhalterseiten bis die Rechtstexte da sind
    impressum: { titel: 'Impressum', text: '[Impressum folgt]' },
    datenschutz: { titel: 'Datenschutz', text: '[Datenschutzerklärung folgt]' },
    agb: { titel: 'AGB', text: '[AGB folgen]' },
    zurueck: 'Zur Startseite', // nicht im Design
  },
} as const

/** Ersetzt {schluessel} in einem Text. */
export const fuelle = (text: string, werte: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, k: string) => String(werte[k] ?? `{${k}}`))
