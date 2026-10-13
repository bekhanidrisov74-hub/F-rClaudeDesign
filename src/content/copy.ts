// Alle sichtbaren Texte. Quelle: design/reference-html und design/SPEC.md.
// Texte, die nicht im Design stehen, sind mit „nicht im Design“ markiert und stehen im Bericht.

export const copy = {
  meta: {
    // nicht im Design: Titel und Beschreibung aus Sätzen der Startseite zusammengesetzt
    titel: 'fixit247 – Handwerker-Notdienst rund um die Uhr',
    beschreibung:
      'Rohrbruch, ausgesperrt, Strom weg? Wir vermitteln Ihnen sofort einen geprüften Fachbetrieb aus Ihrer Region. Die Vermittlung ist kostenlos.',
  },
  hero: {
    h1: ['Handwerker-', 'Notdienst.', 'Rund um die Uhr.'],
    lead: 'Rohrbruch, ausgesperrt, Strom weg? Wir vermitteln Ihnen sofort einen geprüften Fachbetrieb aus Ihrer Region.',
  },
  rechtliches: {
    // nicht im Design: Platzhalterseiten bis die Rechtstexte da sind
    impressum: { titel: 'Impressum', text: '[Impressum folgt]' },
    datenschutz: { titel: 'Datenschutz', text: '[Datenschutzerklärung folgt]' },
    agb: { titel: 'AGB', text: '[AGB folgen]' },
    zurueck: 'Zur Startseite',
  },
} as const
