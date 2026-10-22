// Zeiten, zu denen der Zuschlag von +100 % gilt (Bauplan M6). Maschinenlesbar, an einer Stelle.
// nicht im Design (Bauplan M6, Text von Beks freigegeben am 22.10.2026, rechtlich prüfen: Preisangaben)
// Nur Zahlen und interne Namen, nichts davon steht auf der Seite. Wer die Zuschlagszeiten ändert, ändert sie hier;
// public/chat.php und public/anfrage.php (ausserhalb) führen die Nachtzeit und die Feiertage getrennt.

/** Nacht: ab 18:00 bis vor 08:00 Uhr (Wiener Zeit). Daraus entsteht NACHTZEIT in copy.ts. */
export const NACHT = { beginn: 18, ende: 8 } as const

/**
 * Gesetzliche Feiertage in Österreich (Arbeitsruhegesetz § 7), feste Tage. Landesfeiertage (z. B. Leopoldi am 15.11.)
 * und freie Tage ohne gesetzlichen Feiertag (Karfreitag, Silvester, Heiliger Abend) zählen nicht.
 */
export const FESTE_FEIERTAGE = [
  { monat: 1, tag: 1, name: 'Neujahr' },
  { monat: 1, tag: 6, name: 'Heilige Drei Könige' },
  { monat: 5, tag: 1, name: 'Staatsfeiertag' },
  { monat: 8, tag: 15, name: 'Mariä Himmelfahrt' },
  { monat: 10, tag: 26, name: 'Nationalfeiertag' },
  { monat: 11, tag: 1, name: 'Allerheiligen' },
  { monat: 12, tag: 8, name: 'Mariä Empfängnis' },
  { monat: 12, tag: 25, name: 'Christtag' },
  { monat: 12, tag: 26, name: 'Stefanitag' },
] as const

/** Bewegliche Feiertage als Abstand in Tagen zum Ostersonntag. */
export const BEWEGLICHE_FEIERTAGE = [
  { tageNachOstern: 1, name: 'Ostermontag' },
  { tageNachOstern: 39, name: 'Christi Himmelfahrt' },
  { tageNachOstern: 50, name: 'Pfingstmontag' },
  { tageNachOstern: 60, name: 'Fronleichnam' },
] as const
