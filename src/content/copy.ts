// Alle sichtbaren Texte. Quelle: design/reference-html (02 für Desktop, 01 für Handy-Varianten) und design/SPEC.md.
// Texte, die nicht im Design stehen, sind mit „nicht im Design“ markiert und stehen im Bericht.
// Gewerke-Texte (Namen, Kacheln, Karten, Preise, Tipps) stehen in gewerke.ts.

/** SPEC 11, offen: widerspricht dem Vermittlungsmodell, bleibt bis zur Entscheidung so. */
export const AUFTRAG_AUFGEBEN = 'Auftrag aufgeben'
/** Echo-Blase in Luna nach dem Absenden, ändert sich mit AUFTRAG_AUFGEBEN. */
export const AUFTRAG_AUFGEGEBEN = 'Auftrag aufgegeben'
/** SPEC 11, offen: Brutto/netto */
export const UST_HINWEIS = '[inkl. 20 % USt.]'
/** Bauplan B6 (22.10.2026): Nacht-Zuschlag gilt wie in public/chat.php und im Matching (anfrage.php ausserhalb) von 18 bis 8 Uhr. */
export const NACHTZEIT = '18 bis 8 Uhr'
export const WEISS_NICHT = 'Weiß ich nicht'
/** Pfad der Datenschutzerklärung (Fuß, Formular, Luna) */
export const DATENSCHUTZ = '/datenschutz/'
/** Gefahr-Hinweis: Antwort in den häufigen Fragen und eigener Absatz in den Erfolgskarten (Formular und Luna), ein Wortlaut. */
export const GEFAHR = 'Bei akuter Gefahr wie Rauch, Funken oder Gasgeruch kontaktieren Sie bitte sofort 122 bzw. 112.'
/** nicht im Design (Bauplan B3, Text wartet auf Freigabe): Abschnitt Anfrage und Luna-Zusammenfassung, ein Wortlaut. */
export const OHNE_KONTO = 'Ein Konto oder eine Anmeldung brauchen Sie nicht.'

/**
 * Einwilligung zur Weitergabe, gleich in Formular und Luna (Entscheidung vom 14.10.2026: ein Text für dieselbe Weitergabe,
 * wie auf österreichischen Seiten üblich mit Verantwortlichem, Zweck, Empfänger, Widerruf und Link zur Datenschutzerklärung).
 * Ersetzt den Text aus dem Design (Screen 08) und den aus der Aufgabe. Mit der Datenschutzerklärung rechtlich prüfen lassen.
 */
export const EINWILLIGUNG = {
  text: 'Ich stimme zu, dass fixit247 meine Angaben zur Bearbeitung meiner Anfrage verwendet und dafür an einen passenden Fachbetrieb weitergibt. Ich kann diese Einwilligung jederzeit widerrufen. Mehr dazu in der',
  link: 'Datenschutzerklärung',
  satzende: '.',
} as const

/**
 * Dringlichkeit in Luna: Chip (auch Zeile der Zusammenfassung) und Kurzfassung (Screen 10).
 * Chips laut Aufgabe (docs/luna-ki/AUFGABE.md, Entscheidung vom 14.10.2026: Texte der Aufgabe gelten in Luna).
 */
export const dringlichkeit = [
  { id: 'ACUTE', chip: 'Akut/Gefahr', kurz: 'akut' },
  { id: 'URGENT', chip: 'So schnell wie möglich', kurz: 'so schnell wie möglich' },
  { id: 'NORMAL', chip: 'In den nächsten Tagen', kurz: 'in den nächsten Tagen' },
] as const
export type DringlichkeitId = (typeof dringlichkeit)[number]['id']

export const copy = {
  meta: {
    // nicht im Design: Titel und Beschreibung aus Sätzen der Startseite zusammengesetzt
    titel: 'fixit247 – Vermittlung von Handwerker-Notdiensten rund um die Uhr',
    /** nicht im Design: Titel der Unterseiten, „Impressum – fixit247“ */
    unterseite: '{seite} – fixit247',
    beschreibung:
      'Rohrbruch, ausgesperrt, Strom weg? Wir vermitteln Ihnen einen geprüften Fachbetrieb aus Ihrer Region. Die Vermittlung ist kostenlos.',
  },

  kopf: {
    logo: 'fixit247',
    /** Text im Logo (design/icons/logo.svg), für Screenreader */
    logoBild: 'fixit247 – Ihr Partner im Notfall',
    logoLabel: 'fixit247, zur Startseite',
    navLabel: 'Hauptnavigation',
    nav: [
      { text: 'Leistungen', href: '#leistungen' },
      { text: 'So funktioniert’s', href: '#ablauf' },
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
  /** Ort, den Luna aus der PLZ ableitet (Entscheidung 2: nur Wien) */
  orte: { wien: 'Wien' },

  /**
   * Hero, Kopf und Vorteile laut Entwurf „Hero – Desktop 1586“ (19.10.2026). Lead und dritter Vorteil nicht im Design
   * (Bauplan B8, 22.10.2026): Das Design versprach „Wir sind sofort für Sie da“ und „eigene“ Fachkräfte, fixit247 vermittelt nur.
   */
  hero: {
    h1: ['Handwerker-', 'Notdienst.', 'Rund um die Uhr.'],
    lead: 'Rohrbruch, ausgesperrt, Strom weg? Wir vermitteln Ihnen einen geprüften Fachbetrieb aus Ihrer Region. Die Vermittlung ist kostenlos. Direkt hier in Wien.',
    anfrage: 'Anfrage senden',
    /** Hinweiskasten, zwei Zeilen; die zweite fett */
    hinweis: ['Sie rufen an oder kontaktieren uns', 'und wir vermitteln Ihnen einen Fachbetrieb.'],
    foto: 'Blick über die Dächer Wiens mit dem Stephansdom im Abendlicht',
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

  /** Die vier Vorteile unter dem Hero, Text je in zwei Zeilen wie im Entwurf; icon = design/icons */
  vertrauen: {
    label: 'Ihre Vorteile',
    punkte: [
      { icon: 'vorteil-schild', titel: 'Einzigartig in Wien', text: ['Schneller, zuverlässiger', 'und persönlicher als andere.'] },
      { icon: 'vorteil-uhr', titel: '24/7 für Sie da', text: ['Tag und Nacht', 'auch an Feiertagen.'] },
      { icon: 'vorteil-team', titel: 'Lokale Fachbetriebe', text: ['Geprüfte Betriebe', 'aus Ihrer Region.'] },
      { icon: 'vorteil-auszeichnung', titel: 'Faire & transparente Preise', text: ['Keine versteckten Kosten –', 'Ehrlich und verlässlich.'] },
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
    seiten: 'Seiten', // nicht im Design: Spalte mit den Abschnitten aus copy.kopf.nav
    kontakt: 'Kontakt',
    /** Desktop (02): „Telefon [Telefonnummer]“, „WhatsApp [WhatsApp-Nummer]“; Handy (01): ohne Präfix bzw. ohne Nummer */
    telefon: 'Telefon',
    whatsapp: 'WhatsApp',
    rechtliches: 'Rechtliches',
    links: [
      { text: 'Impressum', href: '/impressum/' },
      { text: 'Datenschutz', href: DATENSCHUTZ },
      { text: 'AGB', href: '/agb/' },
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
    stunde: 'Stunde', // nicht im Design: Einzahl bei 1 Stunde
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
    hinweisEiner: `Nacht gilt von ${NACHTZEIT}. Es zählt höchstens ein Zuschlag, auch wenn mehrere zutreffen.`,
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
      `Zuschlag am Sonntag, an Feiertagen und nachts (${NACHTZEIT}): +100 % auf die Arbeit. Es zählt höchstens ein Zuschlag.`,
      `Die Vermittlung ist kostenlos. Alle Preise ${UST_HINWEIS}, Richtpreise der Betriebe.`,
    ],
    /** Bottom-Sheet unter 640 px (Screen 04) */
    hinweisSheet: `Zuschlag am Sonntag, an Feiertagen und nachts (${NACHTZEIT}): +100 % auf die Arbeit, höchstens einer. Alle Preise ${UST_HINWEIS}. Die Vermittlung ist kostenlos.`,
    zumRechner: 'Zum Preisrechner',
  },

  anfrage: {
    titel: 'Anfrage senden',
    // Satz 3 nicht im Design (Bauplan B3, Text wartet auf Freigabe): gleicher Satz in der Luna-Zusammenfassung
    lead: `Wir geben Ihre Anfrage sofort an einen passenden Fachbetrieb in Ihrer Region weiter. Der Betrieb ruft Sie zurück. ${OHNE_KONTO}`,
    felder: {
      name: { label: 'Name', platzhalter: 'Vor- und Nachname' },
      telefon: { label: 'Telefon', platzhalter: 'Für den Rückruf' },
      plzOrt: { label: 'PLZ und Ort', platzhalter: 'z. B. 1020 Wien' },
      gewerk: { label: 'Gewerk', bitteWaehlen: 'Bitte wählen' },
      // nicht im Design (Bauplan B1, Text wartet auf Freigabe)
      email: { label: 'E-Mail', optional: '(optional)', platzhalter: 'Für die Bestätigung' },
      beschreibung: { label: 'Kurze Beschreibung', platzhalter: 'Was ist passiert? Zum Beispiel: Unter der Spüle tritt Wasser aus.' },
    },
    /** Sternchen hinter Pflichtfeldern */
    pflichtZeichen: '*',
    senden: 'Anfrage senden',
    sendend: 'Wird gesendet …',
    pflicht: '* Pflichtfeld. Die Vermittlung ist kostenlos.',
    fehler: {
      name: 'Bitte geben Sie Ihren Namen ein.',
      telefon: 'Bitte geben Sie eine Telefonnummer für den Rückruf ein.',
      plzOrt: 'Bitte geben Sie Postleitzahl und Ort ein, zum Beispiel 1020 Wien.',
      gewerk: 'Bitte wählen Sie ein Gewerk.',
      email: 'Bitte prüfen Sie die E-Mail-Adresse.', // nicht im Design (Bauplan B1, Text wartet auf Freigabe): wie Luna
      einwilligung: 'Bitte stimmen Sie der Weitergabe zu, sonst können wir keinen Betrieb vermitteln.',
    },
    erfolg: {
      titel: 'Danke. Ihre Anfrage ist unterwegs.',
      // nicht im Design: Text wie in der Luna-Erfolgskarte (Entscheidung 2)
      text: 'Wir geben sie jetzt an einen passenden {betrieb} in Ihrer Nähe weiter. Der Betrieb ruft Sie unter {telefon} zurück.',
      nummer: 'Anfragenummer: {nummer}', // nicht im Design: wie Luna 09
      // nicht im Design: Eingang meldet „kein Betrieb gefunden“ (match NONE), Text wie in Luna
      keinerTitel: 'Danke. Ihre Anfrage ist eingegangen.',
      keinerText: 'Wir haben gerade keinen passenden {betrieb} in Ihrer Nähe gefunden. Ihre Anfrage ist trotzdem aufgenommen: Wir suchen weiter und melden uns unter {telefon}. Ist es dringend, rufen Sie uns bitte gleich an.',
    },
    // nicht im Design: Texte wie in der Luna-Fehlerkarte (Entscheidung 2)
    sendefehler: {
      titel: 'Die Anfrage wurde nicht gesendet.',
      text: 'Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es noch einmal. Ihre Angaben bleiben erhalten.',
      anrufen: 'Stattdessen anrufen',
    },
    seitenkasten: {
      titel: 'Lieber sofort sprechen?',
      text: 'Wir sind rund um die Uhr erreichbar, auch an Sonn- und Feiertagen.',
      whatsapp: 'Per WhatsApp schreiben',
      hinweis: 'Per WhatsApp können Sie gleich ein Foto vom Schaden mitschicken.',
    },
  },

  // nicht im Design: Abschnitt „Häufige Fragen“, Antworten aus Sätzen der Startseite zusammengesetzt
  /** nicht im Design: Abschnitt „Zusagen“ (Bento-Raster) zwischen Preisrechner und Anfrage. Sätze aus Vertrauensleiste, So funktioniert's und Häufigen Fragen. */
  zusagen: {
    titel: 'Darauf können Sie sich verlassen',
    lead: 'So arbeiten wir: ruhig, klar und ohne Überraschungen.',
    karten: [
      {
        icon: 'ui-vermittlung',
        text: 'Wir reparieren nicht selbst. Wir geben Ihre Anfrage an einen geprüften Fachbetrieb aus Ihrer Region weiter.',
        titel: 'Vermittlung statt Reparatur',
        zusatz: 'Der Vertrag kommt direkt mit dem Betrieb zustande',
      },
      {
        icon: 'ui-kostenlos',
        text: 'Die Vermittlung ist kostenlos. Sie zahlen nur den Betrieb.',
        titel: 'Kostenlos für Sie',
        zusatz: 'Keine Gebühr für die Vermittlung',
      },
      {
        icon: 'vorteil-uhr',
        text: 'Auch nachts, an Sonn- und Feiertagen sind wir erreichbar.',
        titel: 'Rund um die Uhr',
        zusatz: 'Anruf, WhatsApp oder Formular',
      },
      {
        icon: 'ui-region',
        text: 'Geprüfte Fachbetriebe in Ihrer Nähe.',
        titel: 'Aus Ihrer Region',
        zusatz: 'Passend zu Ihrer Postleitzahl',
      },
      {
        icon: 'ui-richtpreis',
        text: 'Sie kennen die Preisspanne, bevor jemand kommt.',
        titel: 'Richtpreise vorab',
        zusatz: 'Im Preisrechner und in den Leistungen',
      },
      {
        icon: 'telefon',
        text: 'Der Betrieb ruft Sie zurück, nennt den Preis und kommt zu Ihnen.',
        titel: 'Direkt zum Betrieb',
        zusatz: 'Rückruf nach Ihrer Anfrage',
      },
      {
        icon: 'ui-info',
        text: 'Alle Preise sind Richtpreise der Betriebe. Den genauen Preis vereinbaren Sie mit dem Betrieb.',
        titel: 'Richtpreise, keine Festpreise',
        zusatz: 'Der Betrieb nennt Ihnen den Preis',
      },
    ],
  },

  fragen: {
    titel: 'Häufige Fragen',
    lead: 'Kurz beantwortet. Ihre Frage ist nicht dabei? Rufen Sie uns an, wir sind rund um die Uhr erreichbar.',
    liste: [
      {
        frage: 'Repariert fixit247 selbst?',
        antwort:
          'Nein. fixit247 repariert nicht selbst, sondern gibt Ihre Anfrage an geprüfte Fachbetriebe aus Ihrer Region weiter. Der Vertrag kommt direkt mit dem Betrieb zustande.',
      },
      {
        // nicht im Design (Bauplan B5, Inhalt von Beks vom 21.10.2026, nichts darüber hinaus; rechtlich prüfen, docs/livegang.md)
        frage: 'Was heißt „geprüft“?',
        antwort:
          'Vor der Aufnahme eines Betriebs prüfen wir seine Gewerbeberechtigung für jedes Gewerk im GISA (Gewerbeinformationssystem Austria), lassen uns die Betriebshaftpflichtversicherung nachweisen und führen ein persönliches Gespräch. Bei Beschwerden pausieren wir die Vermittlung an diesen Betrieb.',
      },
      {
        // nicht im Design (Bauplan B4, 22.10.2026): die Kriterien aus passenderPartner() und GEWICHTE in public/anfrage.php,
        // in derselben Reihenfolge; rechtlich prüfen, docs/livegang.md
        frage: 'Wie wählen Sie den Betrieb aus?',
        antwort:
          'Wir vermitteln nur an geprüfte Betriebe mit dem passenden Gewerk, die in Ihrer Gegend arbeiten. Am meisten zählen die Nähe zu Ihrer Postleitzahl und, nachts und am Sonntag, ob der Betrieb einen Notdienst anbietet oder rund um die Uhr erreichbar ist. Danach folgen Spezialisierung, Reaktionszeit, Zuverlässigkeit, Preisniveau und Bewertungen.',
      },
      {
        frage: 'Was kostet die Vermittlung?',
        antwort: 'Die Vermittlung ist kostenlos. Sie zahlen nur den Betrieb.',
      },
      {
        frage: 'Wie verbindlich sind die Preise auf der Seite?',
        antwort:
          `Alle Preise sind Richtpreise der Fachbetriebe. Den genauen Preis vereinbaren Sie mit dem Betrieb. Am Sonntag, an Feiertagen und nachts (${NACHTZEIT}) gilt ein Zuschlag von +100 % auf die Arbeit, höchstens einer.`,
      },
      {
        frage: 'Wann sind Sie erreichbar?',
        antwort: 'Wir sind rund um die Uhr erreichbar, auch nachts, an Sonn- und Feiertagen.',
      },
      {
        frage: 'Wie geht es nach meiner Anfrage weiter?',
        antwort:
          'Wir geben Ihre Anfrage an einen geprüften Fachbetrieb aus Ihrer Region weiter. Der Betrieb ruft Sie zurück, nennt den Preis und kommt zu Ihnen.',
      },
      {
        frage: 'Was tue ich bei akuter Gefahr?',
        antwort: GEFAHR,
      },
    ],
  },

  // nicht im Design (Bauplan B2, Text wartet auf Freigabe): Schritte wie in der Bestätigungsmail in public/anfrage.php
  // (dort „Rückruf“ als erster Schritt, mit der Telefonnummer und „für Sie kostenlos“). Nur bei gefundenem Betrieb (FOUND).
  weiter: {
    titel: 'So geht es weiter',
    schritte: [
      { titel: 'Passender Fachbetrieb', text: 'Wir vermitteln Ihre Anfrage an einen passenden Fachbetrieb in Ihrer Nähe.' },
      { titel: 'Rückruf', text: 'fixit247 oder der vermittelte Fachbetrieb meldet sich telefonisch bei Ihnen.' },
      {
        titel: 'Direkt mit dem Fachbetrieb',
        text: 'Termin, Preis, Durchführung und Rechnung stimmen Sie direkt mit dem Fachbetrieb ab. Die Vermittlung ist kostenlos.',
      },
    ],
    email: 'Eine Bestätigung schicken wir an {email}.',
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
    dialogLabel: 'Chat mit Luna',
    name: 'Luna',
    rolle: 'Digitale Assistentin',
    schliessen: 'Chat schließen',
    minimieren: 'Chat minimieren',
    anstupser: { fett: 'Notfall?', text: 'Ich helfe Ihnen in einer Minute.', schliessen: 'Hinweis schließen' },
    /** {x}, {n}, {schritt}; vier Schritte laut Aufgabe */
    fortschritt: 'Schritt {x} von {n}: {schritt}',
    schritte: ['Problem', 'Details', 'Ort', 'Prüfen'],
    fragen: {
      gewerk:
        'Hallo, ich bin Luna, die digitale Assistentin von fixit247. Ich gebe Ihre Anfrage an einen Fachbetrieb in Ihrer Nähe weiter. Worum geht es?',
      problem: 'Verstanden. Was ist passiert?',
      /** {tipp} = Sicherheitstipp des Gewerks mit Leerzeichen dahinter, sonst leer */
      plz: 'Danke. {tipp}Wie lautet Ihre Postleitzahl?',
      dringlichkeit: 'Wie dringend ist es?',
      // Aufgabe: Wunschtermin nur bei „In den nächsten Tagen“; Frage und Chips nicht im Design und nicht in der Aufgabe
      wunschtermin: 'Wann passt es Ihnen am besten?',
    },
    // nicht im Design (Aufgabe bzw. Referenz): Gewerk unklar, sehr kurze Eingabe, Notruf, Zusammenfassung, Ergänzung
    gewerkUnklar: 'Verstanden. Um welches Gewerk geht es?',
    gewerkNochmal:
      'Das kann ich noch keinem Gewerk zuordnen. Bitte wählen Sie das passende Gewerk oder beschreiben Sie genauer, was nicht funktioniert.',
    kurz: 'Können Sie das Problem in ein paar Worten beschreiben? Zum Beispiel: Unter der Spüle tritt Wasser aus.',
    notruf: 'Bei akuter Gefahr bitte sofort 122 bzw. 112 kontaktieren. Ich nehme Ihre Anfrage parallel weiter auf.',
    zusammenfassungIntro: 'Danke. Bitte prüfen Sie Ihre Anfrage und ergänzen Sie, wie der Betrieb Sie erreicht.',
    notiert: 'Notiert. Das nehme ich in die Anfrage auf.',
    ueberspringen: 'Überspringen',
    wunschterminChips: ['Morgen', 'Diese Woche', 'Nächste Woche', 'Nach Absprache'],
    plzFehler: 'Bitte geben Sie eine österreichische Postleitzahl mit vier Ziffern ein, zum Beispiel 1020.',
    plzUnbekannt: 'Zu dieser Postleitzahl finde ich keinen Ort. Bitte prüfen Sie die vier Ziffern, zum Beispiel 1020.', // nicht im Design
    // nicht im Design: Namen der Chip-Gruppen
    auswahlGewerk: 'Gewerk wählen',
    auswahlDringlichkeit: 'Dringlichkeit wählen',
    auswahlAntwort: 'Antwort wählen',
    eingabe: {
      label: 'Nachricht an Luna',
      mitAuswahl: 'Oder selbst schreiben',
      ohneAuswahl: 'Nachricht schreiben',
      senden: 'Nachricht senden',
    },
    zusammenfassung: {
      titel: 'Ihre Anfrage',
      felder: {
        gewerk: 'Gewerk',
        problem: 'Problem',
        ort: 'Ort',
        dringlichkeit: 'Dringlichkeit',
        wunschtermin: 'Wunschtermin', // nicht im Design
        zusatz: 'Ergänzung', // nicht im Design
      },
      // Aufgabe: Kontaktdaten erst hier, nie im Chat (gehen nie an die KI)
      kontakt: {
        name: 'Name',
        telefon: 'Telefon',
        email: 'E-Mail',
        optional: '(optional)',
      },
      fehler: {
        name: 'Bitte geben Sie Ihren Namen ein.',
        telefon: 'Bitte geben Sie eine Telefonnummer für den Rückruf ein.',
        email: 'Bitte prüfen Sie die E-Mail-Adresse.', // nicht im Design
      },
      richtpreis: 'Richtpreis',
      anfahrt: 'Anfahrt',
      einwilligungFehlt: 'Bitte stimmen Sie der Weitergabe zu, sonst können wir keinen Betrieb vermitteln.', // nicht im Design (SPEC 9)
      // Satz 2 nicht im Design (Bauplan B3, Text wartet auf Freigabe)
      hinweis: `Die Vermittlung ist kostenlos. ${OHNE_KONTO} Der Vertrag kommt direkt mit dem Betrieb zustande.`,
      aendern: 'Angaben ändern',
      sendend: 'Wird gesendet …', // nicht im Design (SPEC 9)
    },
    erfolg: {
      /** Entscheidung 2: voller Name statt „Frau Huber“ (Luna fragt kein Geschlecht ab) */
      titel: 'Danke, {name}. Ihre Anfrage ist unterwegs.',
      text: 'Wir geben sie jetzt an einen passenden {betrieb} in Ihrer Nähe weiter. Der Betrieb ruft Sie unter {telefon} zurück.',
      // nicht im Design: Eingang meldet „kein Betrieb gefunden“ (match NONE), die Anfrage ist trotzdem aufgenommen
      keinerTitel: 'Danke, {name}. Ihre Anfrage ist eingegangen.',
      keinerText: 'Wir haben gerade keinen passenden {betrieb} in Ihrer Nähe gefunden. Ihre Anfrage ist trotzdem aufgenommen: Wir suchen weiter und melden uns unter {telefon}. Ist es dringend, rufen Sie uns bitte gleich an.',
      betriebUnbekannt: 'Fachbetrieb', // nicht im Design: bei „Weiß ich nicht“
      nummer: 'Anfragenummer: {nummer}',
      tippTitel: 'Bis der Betrieb kommt:',
      anrufen: 'Fragen? Jetzt anrufen',
      neu: 'Neue Anfrage starten', // Aufgabe
      schliessen: 'Chat schließen',
    },
    fehler: {
      titel: 'Die Anfrage wurde nicht gesendet.',
      text: 'Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es noch einmal. Ihre Angaben bleiben erhalten.',
      anrufen: 'Stattdessen anrufen',
      erneut: 'Erneut versuchen', // Aufgabe (Design: „Erneut senden“)
    },
  },

  rechtliches: {
    // nicht im Design: Platzhalterseiten bis die Rechtstexte da sind
    impressum: { titel: 'Impressum', text: '[Impressum folgt]' },
    datenschutz: {
      titel: 'Datenschutz',
      text: '[Datenschutzerklärung folgt]',
      // nicht im Design: Entwurf für die Bewerbung über /partner-werden/ (21.10.2026), rechtlich prüfen lassen
      entwurf: {
        titel: 'Partner-Bewerbungen (Entwurf, rechtlich zu prüfen)',
        absaetze: [
          'Zweck: Mit den Angaben aus dem Formular „Partner werden“ prüfen wir Ihre Bewerbung und nehmen Kontakt mit Ihnen auf. Grundlage ist Ihre Einwilligung.',
          'Daten: Firmenname, Ansprechperson, Telefon, E-Mail, GISA-Zahl, UID-Nummer, Gewerke, Einsatzgebiet, Erreichbarkeit, Ihre Angaben zum Notdienst und zur Zeit bis vor Ort, Ihre Antworten zu Preisen, Versicherung und Zahlungsarten, Ihre Anmerkungen sowie Bewerbungsnummer und Zeitpunkt der Bewerbung.',
          'Nach der Aufnahme: Nehmen wir Ihren Betrieb auf, nutzen wir Firmenname, Ansprechperson, Telefon, E-Mail, Gewerke, Einsatzgebiet, Erreichbarkeit und Ihre Angaben zum Notdienst, um passende Anfragen von Kundinnen und Kunden an Sie weiterzugeben.',
          'Speicherort: als Datei auf dem Server unseres Anbieters ALL-INKL.COM in Deutschland und im E-Mail-Postfach von fixit247. ALL-INKL.COM verarbeitet die Angaben nur in unserem Auftrag.',
          'Speicherdauer: Offene Bewerbungen, bis wir über sie entschieden haben. Angaben von aufgenommenen Betrieben, solange die Partnerschaft besteht. Abgelehnte Bewerbungen löschen wir nach [Frist folgt].',
          'Widerruf: Sie können Ihre Einwilligung jederzeit widerrufen, per E-Mail oder Telefon. Dann löschen wir Ihre Angaben.',
        ],
      },
    },
    agb: { titel: 'AGB', text: '[AGB folgen]' },
    zurueck: 'Zur Startseite', // nicht im Design
  },
} as const

/** Ersetzt {schluessel} in einem Text. */
export const fuelle = (text: string, werte: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, k: string) => String(werte[k] ?? `{${k}}`))
