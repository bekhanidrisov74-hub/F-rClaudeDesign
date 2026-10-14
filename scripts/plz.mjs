// Schreibt src/content/plz.json (PLZ → Ort) aus dem offiziellen PLZ-Verzeichnis.
// Quelle: RTR Open Data (data.gv.at), monatlich aktualisiert, Lizenz CC BY 4.0. Neu laden: node scripts/plz.mjs
import fs from 'node:fs'

const antwort = await fetch('https://data.rtr.at/api/v1/tables/plz.json')
if (!antwort.ok) throw new Error(`RTR antwortet mit HTTP ${antwort.status}`)
const { data } = await antwort.json()
const plz = {}
// Mehrere Zeilen je PLZ (Wiener Bezirke, Ortsteile): der erste Ort zählt.
for (const z of data) if (!z.gueltigbis && z.adressierbar === 'Ja') plz[String(z.plz)] ??= z.ort
fs.writeFileSync('src/content/plz.json', `${JSON.stringify(plz)}\n`)
console.log(`${Object.keys(plz).length} PLZ geschrieben`)
