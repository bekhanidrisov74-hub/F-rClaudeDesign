// nicht im Design (Bauplan B7, Text von Beks freigegeben am 24.10.2026, rechtlich prüfen: Aussagen zu Verbraucherrechten, docs/livegang.md)
// Texte der Ratgeber-Seite „Seriöse Notdienste erkennen“. Für diese Seite gibt es keinen Entwurf in design/.
// Wortgleich aus anderen Dateien übernommen: GEFAHR und GEPRUEFT (copy.ts), dazu die Knöpfe aus copy.hero, copy.leistungen und copy.preisuebersicht.
// fixit247 vermittelt nur: Kein Text sagt, fixit247 repariere selbst, sei ein Notdienst oder garantiere Preise. Keine Preise im Inhalt (nur die Preisübersicht aus Seitenrahmen).

/** Listenpunkt: Text oder Text mit Link in der Mitte („… (<a>gisa.gv.at</a>).“) */
export type RatgeberPunkt = string | { vor: string; link: { text: string; href: string }; nach: string }

export const RATGEBER_PFAD = '/serioese-notdienste-erkennen/'

export const ratgeber = {
  meta: {
    titel: 'Seriösen Handwerker-Notdienst erkennen: Checkliste – fixit247',
    beschreibung:
      'Woran Sie einen seriösen Handwerker-Notdienst erkennen: was Sie am Telefon fragen, worauf Sie vor Ort achten und wie Sie richtig bezahlen.',
  },
  /** Name in den Brotkrumen und Link im Fuß */
  name: 'Seriöse Notdienste erkennen',
  h1: 'Seriöse Notdienste erkennen',
  lead: 'Im Notfall bleibt wenig Zeit zum Vergleichen. Mit diesen Fragen und Hinweisen erkennen Sie einen seriösen Fachbetrieb, ob Sie ihn selbst finden oder über fixit247.',

  vorAnruf: {
    titel: 'Vor dem Anruf kurz prüfen',
    lead: 'Dafür reichen ein paar Sekunden am Handy.',
    punkte: [
      'Die Website hat ein Impressum mit Firmenname und Adresse.',
      {
        vor: 'Die Gewerbeberechtigung können Sie im GISA nachsehen, dem öffentlichen Gewerberegister (',
        link: { text: 'gisa.gv.at', href: 'https://www.gisa.gv.at/' },
        nach: ').',
      },
      'Eine Wiener Telefonnummer allein sagt nichts darüber, wo der Betrieb sitzt.',
    ] as readonly RatgeberPunkt[],
    notruf: 'Wann der Notruf gilt',
  },

  telefon: {
    titel: 'Am Telefon fragen',
    lead: 'Diese Antworten sollten Sie haben, bevor jemand losfährt.',
    punkte: [
      'Wie heißt der Betrieb, und wo hat er seinen Sitz?',
      'Was kosten Anfahrt und Arbeit, pro Stunde oder pro Einsatz?',
      'Welche Zuschläge gelten jetzt, etwa nachts oder am Sonntag?',
      'Wie wird bezahlt, und bekomme ich eine Rechnung?',
      'Wann kann ungefähr jemand da sein?',
    ] as readonly RatgeberPunkt[],
    hinweis: 'Nennt Ihnen der Betrieb keinen Preis, nicht einmal für Anfahrt und Stunde, rufen Sie lieber den nächsten an.',
  },

  vorOrt: {
    titel: 'Vor Ort, bevor die Arbeit beginnt',
    lead: 'Lassen Sie sich sagen, was gemacht wird und was es kostet, bevor jemand anfängt.',
    punkte: [
      // rechtlich prüfen: § 5 KSchG
      'Fragen Sie nach einem Kostenvoranschlag. Er ist verbindlich, außer der Betrieb sagt ausdrücklich, dass er unverbindlich ist.',
      'Will der Betrieb für den Kostenvoranschlag Geld, muss er das vorher sagen.',
      'Sollen teure Teile getauscht werden, etwa ein ganzes Schloss statt einer Öffnung, fragen Sie nach Grund und Preis.',
      'Unterschreiben Sie nichts, was Sie nicht gelesen haben.',
    ] as readonly RatgeberPunkt[],
  },

  bezahlen: {
    titel: 'Bezahlen und Rechnung',
    lead: 'Zahlen Sie nie unter Druck.',
    punkte: [
      // rechtlich prüfen: Rechnungsangaben (§ 11 UStG), Belegerteilungspflicht (§ 132a BAO), Zahlung unter Vorbehalt
      'Verlangen Sie eine Rechnung mit Firmenname, Adresse, Datum, den einzelnen Leistungen und der Umsatzsteuer.',
      'Zahlen Sie bar, muss Ihnen der Betrieb einen Beleg geben.',
      'Lassen Sie sich nicht zum Bankomaten begleiten.',
      'Erscheint Ihnen der Betrag stark überhöht, zahlen Sie ausdrücklich unter Vorbehalt, halten Sie das schriftlich fest und holen Sie sich danach Rat.',
    ] as readonly RatgeberPunkt[],
  },

  rechte: {
    titel: 'Ihre Rechte in Kürze',
    lead: 'Allgemeine Hinweise, keine Rechtsberatung.',
    punkte: [
      // rechtlich prüfen: § 18 Abs. 1 Z 10 FAGG
      'Haben Sie den Betrieb ausdrücklich für eine dringende Reparatur gerufen, können Sie davon nicht zurücktreten. Für zusätzliche Leistungen oder Waren, die Ihnen erst vor Ort angeboten werden, gilt in der Regel ein Rücktrittsrecht von 14 Tagen.',
      'Rat bekommen Sie zum Beispiel bei der Konsumentenberatung der Arbeiterkammer oder beim Verein für Konsumenteninformation (VKI).',
      'Werden Sie bedroht oder stark bedrängt, rufen Sie die Polizei 133.',
    ] as readonly RatgeberPunkt[],
  },

  pruefung: {
    titel: 'So prüft fixit247 die Betriebe',
    // Lead ist GEPRUEFT aus copy.ts
    richtpreise: 'Die Richtpreise der Fachbetriebe sehen Sie vorab auf unserer Seite. Den genauen Preis vereinbaren Sie mit dem Betrieb.',
  },
} as const
