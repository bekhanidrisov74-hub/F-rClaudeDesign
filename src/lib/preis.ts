// Beträge in Cent (Ganzzahlen). Format laut SPEC 5: Komma, zwei Nachkommastellen, Tausenderpunkt, „ €“ nach der Zahl.
// Bewusst ohne Intl: 'de-AT' liefert „€ 219,90“ und je nach ICU andere Leerzeichen.

export const cent = (euro: number) => Math.round(euro * 100)

export function euro(betragCent: number): string {
  const ganz = Math.floor(betragCent / 100)
  const rest = String(betragCent % 100).padStart(2, '0')
  return `${String(ganz).replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${rest} €`
}
