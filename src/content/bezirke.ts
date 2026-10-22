// nicht im Design (Bauplan M9, Text wartet auf Freigabe): die 23 Wiener Gemeindebezirke.
// Der Ort „Wien“ selbst steht im PLZ-Verzeichnis (plz.json); hier nur Nummer und Name je Postleitzahl.
export interface Bezirk {
  nummer: number
  name: string
}

export const bezirke: Readonly<Record<string, Bezirk>> = {
  '1010': { nummer: 1, name: 'Innere Stadt' },
  '1020': { nummer: 2, name: 'Leopoldstadt' },
  '1030': { nummer: 3, name: 'Landstraße' },
  '1040': { nummer: 4, name: 'Wieden' },
  '1050': { nummer: 5, name: 'Margareten' },
  '1060': { nummer: 6, name: 'Mariahilf' },
  '1070': { nummer: 7, name: 'Neubau' },
  '1080': { nummer: 8, name: 'Josefstadt' },
  '1090': { nummer: 9, name: 'Alsergrund' },
  '1100': { nummer: 10, name: 'Favoriten' },
  '1110': { nummer: 11, name: 'Simmering' },
  '1120': { nummer: 12, name: 'Meidling' },
  '1130': { nummer: 13, name: 'Hietzing' },
  '1140': { nummer: 14, name: 'Penzing' },
  '1150': { nummer: 15, name: 'Rudolfsheim-Fünfhaus' },
  '1160': { nummer: 16, name: 'Ottakring' },
  '1170': { nummer: 17, name: 'Hernals' },
  '1180': { nummer: 18, name: 'Währing' },
  '1190': { nummer: 19, name: 'Döbling' },
  '1200': { nummer: 20, name: 'Brigittenau' },
  '1210': { nummer: 21, name: 'Floridsdorf' },
  '1220': { nummer: 22, name: 'Donaustadt' },
  '1230': { nummer: 23, name: 'Liesing' },
}
