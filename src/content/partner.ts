// Texte der Seite „Partner werden“ (/partner-werden/). Für diese Seite gibt es keinen Entwurf in design/: geschrieben am
// 21.10.2026 nach docs/analyse/partner-werden-plan.md und den Vorgaben von Beks (Kosten, Pflichtfragen, Erwartungen).
// Von Beks freigegeben am 21.10.2026. fixit247 vermittelt nur: kein Text verspricht Aufträge, Fristen oder ein Abzeichen.

/** Pfad der Seite, mit Schrägstrich am Ende wie alle Unterseiten (.claude/rules/seo.md, Punkt 3) */
export const PARTNER_PFAD = '/partner-werden/'

/** Vorgabe von Beks (21.10.2026): kein Enddatum, kein „für immer kostenlos“ */
const KOSTEN =
  'Die Partnerschaft ist zum Start kostenlos. Bevor sich daran etwas ändert, informieren wir Sie rechtzeitig, und Sie entscheiden dann, ob Sie dabei bleiben.'

/** Antworten der Ja/Nein-Fragen; die ids gehen so an public/anfrage.php */
const JA_NEIN = [
  { id: 'ja', text: 'Ja' },
  { id: 'nein', text: 'Nein' },
] as const

export const partner = {
  meta: {
    titel: 'Partner werden: Anfragen für Fachbetriebe – fixit247',
    beschreibung:
      'Sie sind Fachbetrieb und auch bei Notfällen erreichbar? Bewerben Sie sich als Partner: fixit247 gibt Anfragen aus Ihrer Region an passende Betriebe weiter. Zum Start kostenlos.',
  },

  /** Einstiege auf anderen Seiten */
  einstieg: {
    /** Fuß, Spalte „Seiten“ */
    fuss: 'Partner werden',
    /** Handy-Menü, kleiner Link unter der Kontaktkarte (SPEC 7 nennt fünf große Links) */
    menue: 'Für Fachbetriebe: Partner werden',
    /** Startseite, Karte am Ende von „Häufige Fragen“ */
    hinweis: {
      titel: 'Sie sind Fachbetrieb?',
      text: 'Bewerben Sie sich als Partner. Wir vermitteln Anfragen aus Ihrer Region an passende Betriebe.',
      link: 'Partner werden',
    },
  },

  intro: {
    titel: 'Partner werden',
    lead: 'fixit247 nimmt Anfragen von Kundinnen und Kunden entgegen, etwa bei Rohrbruch, Stromausfall oder zugefallener Tür, und gibt sie an Fachbetriebe aus der Region weiter. Wir reparieren nicht selbst. Dafür suchen wir verlässliche Betriebe.',
    /** vor der Liste der Gewerke aus gewerke.ts */
    gewerke: 'Wir vermitteln Anfragen für',
    knopf: 'Zur Bewerbung',
  },

  nutzen: {
    titel: 'Was Sie davon haben',
    punkte: [
      {
        icon: 'ui-region',
        titel: 'Anfragen aus Ihrer Region',
        text: 'Wir vermitteln nach Gewerk, Postleitzahl und Erreichbarkeit, also nur Anfragen, die zu Ihrem Betrieb passen.',
      },
      {
        icon: 'telefon',
        titel: 'Direkter Kontakt',
        text: 'Sie bekommen Name, Telefonnummer, Ort und eine kurze Beschreibung. Den Auftrag vereinbaren Sie direkt mit dem Kunden.',
      },
      { icon: 'ui-kostenlos', titel: 'Zum Start kostenlos', text: KOSTEN },
    ],
  },

  schritte: {
    titel: 'So werden Sie Partner',
    liste: [
      { titel: 'Bewerbung senden', text: 'Füllen Sie das Formular unten aus. Dokumente brauchen Sie dafür nicht.' },
      {
        titel: 'Wir prüfen und rufen an',
        text: 'Wir prüfen Ihre Gewerbeberechtigung im GISA, sprechen persönlich mit Ihnen und lassen uns Ihre Betriebshaftpflicht nachweisen.',
      },
      {
        titel: 'Aufnahme in die Vermittlung',
        text: 'Passt alles, nehmen wir Ihren Betrieb auf. Ab dann geben wir passende Anfragen an Sie weiter.',
      },
    ],
  },

  erwartungen: {
    titel: 'Was wir von Partnern erwarten',
    lead: 'Wer uns anruft, ist oft in einer Notlage. Darum gelten diese Punkte für jeden Betrieb, den wir aufnehmen.',
    punkte: [
      'Eine gültige Gewerbeberechtigung für jedes Gewerk, das Sie angeben.',
      'Eine Betriebshaftpflichtversicherung.',
      'Sie nennen den Preis oder einen Höchstpreis, bevor Sie mit der Arbeit beginnen.',
      'Sie stellen eine ordentliche Rechnung mit Ihren Firmendaten aus.',
      'Sie bestehen nicht auf Barzahlung.',
      'Sie treten erkennbar auf: mit Ihrem Firmennamen und auf Nachfrage mit Ausweis.',
      'Sie sind so erreichbar, wie Sie es in Ihrer Bewerbung angeben.',
    ],
    /** Vorgabe von Beks (21.10.2026), wörtlich */
    pruefung: 'Wir nehmen nur Betriebe auf, die wir vorher persönlich geprüft haben. Bei Beschwerden pausieren wir die Vermittlung.',
    richtpreise: 'Auf fixit247 sehen Kundinnen und Kunden Richtpreise und Zuschläge für jedes Gewerk.',
    /** öffnet die Preisübersicht */
    richtpreiseLink: 'Richtpreise ansehen',
  },

  bewerbung: {
    titel: 'Bewerbung als Partnerbetrieb',
    lead: 'Wir nutzen Ihre Angaben nur, um Ihre Bewerbung zu prüfen, und melden uns persönlich bei Ihnen.',
    gruppen: {
      betrieb: 'Ihr Betrieb',
      gebiet: 'Gewerke und Einsatzgebiet',
      erreichbarkeit: 'Erreichbarkeit',
      arbeitsweise: 'Preise und Arbeitsweise',
    },
    felder: {
      firma: { label: 'Firmenname' },
      ansprechperson: { label: 'Ansprechperson', platzhalter: 'Vor- und Nachname' },
      telefon: { label: 'Telefon', platzhalter: 'Für unseren Rückruf' },
      email: { label: 'E-Mail', hinweis: 'Nach der Aufnahme schicken wir Anfragen an diese Adresse.' },
      gisa: {
        label: 'GISA-Zahl',
        hinweis:
          'Die Nummer Ihrer Gewerbeberechtigung im Gewerbeinformationssystem Austria. Haben Sie mehrere, nennen Sie die weiteren unter „Schwerpunkte und Anmerkungen“.',
      },
      uid: { label: 'UID-Nummer', platzhalter: 'ATU12345678' },
      gewerke: { legende: 'Gewerke', hinweis: 'Wählen Sie alle Gewerke, für die Sie eine Gewerbeberechtigung haben.' },
      plz: {
        label: 'Einsatzgebiet (Postleitzahlen)',
        // \u2060 (Wortverbinder): der Bereich „1010–1230“ bricht nicht am Strich um
        hinweis: 'Getrennt durch Komma oder Leerzeichen. Für einen Bereich zum Beispiel 1010\u2060–\u20601230 (ganz Wien).',
        platzhalter: 'z. B. 1100, 1110, 1120',
      },
      zeiten: {
        legende: 'Wann sind Sie für Anfragen erreichbar?',
        optionen: [
          { id: 'werktags', text: 'Werktags tagsüber' },
          { id: 'abends', text: 'Werktags abends' },
          { id: 'nachts', text: 'Nachts' },
          { id: 'wochenende', text: 'Am Wochenende' },
          { id: 'feiertag', text: 'An Feiertagen' },
        ],
      },
      notdienst: { legende: 'Rücken Sie bei Notfällen sofort aus?', optionen: JA_NEIN },
      reaktionszeit: {
        label: 'Bei Notfällen vor Ort in',
        bitteWaehlen: 'Bitte wählen',
        /** Minuten, gehen als responseTime in die Partnerliste */
        optionen: [
          { id: '30', text: 'etwa 30 Minuten' },
          { id: '60', text: 'etwa 1 Stunde' },
          { id: '90', text: 'etwa 1,5 Stunden' },
          { id: '120', text: 'etwa 2 Stunden oder länger' },
        ],
      },
      richtpreise: {
        legende: 'Arbeiten Sie nach den Richtpreisen auf fixit247?',
        optionen: [
          { id: 'ja', text: 'Ja' },
          { id: 'abweichung', text: 'Ja, mit Abweichungen' },
          { id: 'nein', text: 'Nein' },
        ],
      },
      /** erscheint nur bei „Ja, mit Abweichungen“ und ist dann Pflicht */
      abweichungen: { label: 'Welche?', platzhalter: 'z. B. andere Anfahrt außerhalb Wiens' },
      haftpflicht: { legende: 'Haben Sie eine Betriebshaftpflichtversicherung?', optionen: JA_NEIN },
      preisVorab: { legende: 'Nennen Sie Kunden den Preis bzw. Höchstpreis vor Arbeitsbeginn?', optionen: JA_NEIN },
      unbar: { legende: 'Können Kunden per Karte oder Überweisung zahlen (nicht nur bar)?', optionen: JA_NEIN },
      anmerkungen: { label: 'Schwerpunkte und Anmerkungen', platzhalter: 'z. B. Gasthermen, Rohrreinigung, Sicherheitsschlösser' },
    },
    optional: '(optional)',
    pflichtZeichen: '*',
    /** Honigtopf-Feld „fax“: für Menschen und Screenreader verborgen, Bots füllen es aus */
    honigtopf: 'Fax, bitte leer lassen',
    einwilligung: {
      text: 'Ich stimme zu, dass fixit247 meine Angaben zur Prüfung meiner Bewerbung verwendet und speichert. Ich kann diese Einwilligung jederzeit widerrufen. Mehr dazu in der',
      link: 'Datenschutzerklärung',
      satzende: '.',
    },
    senden: 'Bewerbung senden',
    sendend: 'Wird gesendet …',
    pflicht: '* Pflichtfeld. Die Bewerbung ist kostenlos und unverbindlich.',
    fehler: {
      firma: 'Bitte geben Sie den Namen Ihres Betriebs ein.',
      ansprechperson: 'Bitte geben Sie eine Ansprechperson an.',
      telefon: 'Bitte geben Sie eine Telefonnummer ein, unter der wir Sie erreichen.',
      email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein, zum Beispiel office@betrieb.at.',
      gisa: 'Bitte geben Sie Ihre GISA-Zahl ein. Sie besteht nur aus Ziffern.',
      uid: 'Die UID-Nummer beginnt mit ATU, danach folgen 8 Ziffern, zum Beispiel ATU12345678.',
      gewerke: 'Bitte wählen Sie mindestens ein Gewerk.',
      plz: 'Bitte geben Sie mindestens eine österreichische Postleitzahl mit vier Ziffern ein, zum Beispiel 1100.',
      /** {liste} = die unbekannten Eingaben */
      plzUnbekannt: 'Diese Postleitzahlen kennen wir nicht: {liste}. Bitte prüfen Sie die vier Ziffern.',
      /** {max} = MAX_PLZ in src/lib/bewerbung.ts */
      plzZuViele: 'Bitte grenzen Sie Ihr Einsatzgebiet auf höchstens {max} Postleitzahlen ein.',
      zeiten: 'Bitte wählen Sie mindestens eine Zeit.',
      auswahl: 'Bitte wählen Sie eine Antwort.',
      abweichungen: 'Bitte beschreiben Sie kurz, wo Sie abweichen.',
      einwilligung: 'Bitte stimmen Sie zu, damit wir Ihre Bewerbung prüfen können.',
    },
    erfolg: {
      titel: 'Danke. Ihre Bewerbung ist angekommen.',
      /** {telefon}, {email} */
      text: 'Wir sehen uns Ihre Angaben an und melden uns persönlich unter {telefon} oder {email}.',
      nummer: 'Bewerbungsnummer: {nummer}',
      anrufen: 'Fragen? Jetzt anrufen',
    },
    sendefehler: {
      titel: 'Die Bewerbung wurde nicht gesendet.',
      text: 'Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es noch einmal. Ihre Angaben bleiben erhalten.',
      anrufen: 'Stattdessen anrufen',
    },
    seitenkasten: {
      titel: 'Fragen zur Bewerbung?',
      text: 'Rufen Sie uns an. Wir beantworten Ihre Fragen gern schon vorab.',
    },
  },

  fragen: {
    titel: 'Fragen von Betrieben',
    lead: 'Ihre Frage ist nicht dabei? Rufen Sie uns an.',
    liste: [
      { frage: 'Was kostet die Partnerschaft?', antwort: KOSTEN },
      {
        frage: 'Muss ich Dokumente hochladen?',
        antwort:
          'Nein. Ihre Gewerbeberechtigung prüfen wir mit Ihrer GISA-Zahl selbst. Wie Sie uns Ihre Betriebshaftpflicht nachweisen, besprechen wir im persönlichen Gespräch.',
      },
      {
        frage: 'Wie kommen die Anfragen zu mir?',
        antwort:
          'Per E-Mail an die Adresse aus Ihrer Bewerbung, mit Name, Telefonnummer und Ort des Kunden und einer kurzen Beschreibung. Sie melden sich direkt beim Kunden.',
      },
      {
        frage: 'Wer schließt den Vertrag mit dem Kunden?',
        antwort: 'Sie. fixit247 vermittelt nur. Termin, Preis, Durchführung und Rechnung vereinbaren Sie direkt mit dem Kunden.',
      },
      {
        frage: 'Muss ich mich an die Richtpreise halten?',
        antwort:
          'Kundinnen und Kunden sehen auf fixit247 vorab Richtpreise für jedes Gewerk. In der Bewerbung fragen wir, ob Sie danach arbeiten oder wo Sie abweichen. Den genauen Preis nennen Sie dem Kunden vor Arbeitsbeginn.',
      },
    ],
  },
} as const
