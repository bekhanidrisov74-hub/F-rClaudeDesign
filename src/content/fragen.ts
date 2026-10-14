// Luna: Fragenkatalog und Schlüsselwörter je Gewerk (docs/luna-ki/AUFGABE.md, Abschnitt 3).
// Reihenfolge = Priorität der Erkennung: spezifische Gewerke vor dem Installateur. Haushaltsgeräte stehen vor
// Heizung & Klima, sonst landet „Kühlschrank kühlt nicht“ wegen „kühlt nicht“ bei der Klimaanlage.
// Frage-ids: nur a–z (das Backend prüft ^[a-z]{1,20}$), Fragen höchstens 160 Zeichen.

export interface Frage {
  id: string
  frage: string
  /** Kurzes Label in der Zusammenfassung und im Anfragetext */
  label: string
  /** Schnellantworten; „Überspringen“ ergänzt der Ablauf */
  chips: readonly string[]
  /** Antworten, die die Dringlichkeit auf ACUTE setzen */
  akut?: readonly string[]
  /** Antworten mit Notruf-Hinweis (setzen ebenfalls ACUTE) */
  gefahr?: readonly string[]
  /** Frage nur stellen, wenn das für die bisherigen Antworten zutrifft */
  wenn?: (antworten: Readonly<Record<string, string>>) => boolean
}

export interface Katalog {
  id: string
  muster: RegExp
  fragen: Frage[]
}

const JN = ['Ja', 'Nein', 'Weiß nicht']

export const katalog: Katalog[] = [
  {
    id: 'geraete',
    muster: /waschmaschine|geschirrspül|spülmaschine|trockner|kühlschrank|gefrier|backofen|\bherd\b|kochfeld|haushaltsgerät/i,
    fragen: [
      { id: 'geraet', frage: 'Um welches Gerät geht es?', label: 'Gerät', chips: ['Waschmaschine', 'Geschirrspüler', 'Trockner', 'Kühlschrank', 'Backofen', 'Herd'] },
      { id: 'hersteller', frage: 'Welcher Hersteller und welches Modell?', label: 'Hersteller', chips: ['Weiß nicht'] },
      { id: 'problem', frage: 'Was ist das Problem?', label: 'Problem', chips: ['Startet nicht', 'Kühlt oder heizt nicht', 'Wasser läuft aus', 'Laute Geräusche', 'Etwas anderes'] },
      { id: 'code', frage: 'Wird ein Fehlercode angezeigt? Falls ja, bitte nennen.', label: 'Fehlercode', chips: ['Kein Fehlercode'] },
      { id: 'alter', frage: 'Wie alt ist das Gerät ungefähr?', label: 'Alter', chips: ['Unter 2 Jahre', '2 bis 5 Jahre', 'Über 5 Jahre', 'Weiß nicht'] },
    ],
  },
  {
    id: 'shk',
    muster: /heiz|therme|warmwasser|warmes wasser|kein warm|kessel|fernwärme|heizkörper|brenner|\bshk\b|wärmepumpe|klima|kühlt nicht|split-?gerät/i,
    fragen: [
      { id: 'was', frage: 'Geht es um die Heizung, das Warmwasser oder die Klimaanlage?', label: 'Bereich', chips: ['Heizung', 'Warmwasser', 'Klimaanlage'] },
      {
        id: 'art',
        frage: 'Welche Heizungsart haben Sie?',
        label: 'Heizungsart',
        chips: ['Gastherme', 'Fernwärme', 'Ölheizung', 'Wärmepumpe', 'Weiß nicht'],
        wenn: (a) => a.was !== 'Klimaanlage',
      },
      { id: 'code', frage: 'Zeigt das Gerät einen Fehlercode? Falls ja, bitte nennen.', label: 'Fehlercode', chips: ['Kein Fehlercode', 'Weiß nicht'] },
      { id: 'marke', frage: 'Welche Marke und welches Modell hat das Gerät?', label: 'Marke', chips: ['Weiß nicht'] },
      { id: 'ganz', frage: 'Ist die Anlage komplett oder teilweise ausgefallen?', label: 'Ausfall', chips: ['Komplett', 'Teilweise'] },
      { id: 'seit', frage: 'Seit wann besteht das Problem?', label: 'Seit', chips: ['Seit heute', 'Seit gestern', 'Seit mehreren Tagen'] },
    ],
  },
  {
    id: 'schluessel',
    muster: /ausgesperrt|schlüssel|schloss|zugefallen|abgesperrt|komme nicht (in|rein|hinein)|aufsperr|zylinder|tür (geht|ist) (nicht auf|zu)/i,
    fragen: [
      { id: 'lage', frage: 'Was ist passiert?', label: 'Lage', chips: ['Ausgesperrt', 'Schlüssel verloren', 'Schlüssel steckt innen', 'Schloss defekt'] },
      { id: 'tuer', frage: 'Ist die Tür nur zugefallen oder abgesperrt?', label: 'Tür', chips: ['Zugefallen', 'Abgesperrt', 'Weiß nicht'] },
      { id: 'objekt', frage: 'Wohnung, Haus oder Geschäft?', label: 'Objekt', chips: ['Wohnung', 'Haus', 'Geschäft'] },
      { id: 'berechtigt', frage: 'Sind Sie zur Öffnung berechtigt, z. B. als Mieter oder Eigentümer?', label: 'Berechtigt', chips: ['Ja', 'Nein'] },
    ],
  },
  {
    id: 'elektro',
    muster: /strom|sicherung|\bfi\b|steckdose|licht|kurzschluss|funken|elektr|schalter|verteiler/i,
    fragen: [
      { id: 'was', frage: 'Was funktioniert nicht?', label: 'Problem', chips: ['Kein Strom', 'Licht ausgefallen', 'Steckdose defekt', 'Sicherung fällt', 'Etwas anderes'] },
      { id: 'umfang', frage: 'Betrifft es einen Raum, die ganze Wohnung oder das ganze Haus?', label: 'Umfang', chips: ['Ein Raum', 'Ganze Wohnung', 'Ganzes Haus'] },
      { id: 'fi', frage: 'Ist eine Sicherung oder der FI-Schalter gefallen?', label: 'Sicherung/FI', chips: JN },
      {
        id: 'gefahr',
        frage: 'Gibt es Funken, Rauch oder Brandgeruch?',
        label: 'Gefahr',
        chips: ['Nein', 'Funken', 'Rauch', 'Brandgeruch'],
        gefahr: ['Funken', 'Rauch', 'Brandgeruch'],
      },
    ],
  },
  {
    id: 'installateur',
    muster: /wasser|rohrbruch|\brohr|tropf|leck|undicht|verstopf|abfluss|armatur|spülung|\bwc\b|toilette|\bklo|boiler|dusche|badewanne|siphon|installateur|sanit|rückstau/i,
    fragen: [
      {
        id: 'was',
        frage: 'Was ist das Problem?',
        label: 'Problem',
        chips: ['Wasser tritt aus', 'Abfluss/WC verstopft', 'Wasserhahn defekt', 'WC-Spülung defekt', 'Kein Wasser', 'Etwas anderes'],
      },
      { id: 'wo', frage: 'Wo tritt das Problem auf?', label: 'Wo', chips: ['Küche', 'Bad', 'WC', 'Keller', 'Woanders'] },
      { id: 'menge', frage: 'Läuft Wasser aus oder tropft es?', label: 'Wasser', chips: ['Läuft stark aus', 'Tropft nur', 'Kein Austritt'], akut: ['Läuft stark aus'] },
      { id: 'abgestellt', frage: 'Ist das Wasser bereits abgestellt?', label: 'Abgestellt', chips: JN },
    ],
  },
]

/** Fragen des Gewerks (leer bei unbekanntem Gewerk) */
export const fragenZu = (gewerk: string | null) => katalog.find((k) => k.id === gewerk)?.fragen ?? []
