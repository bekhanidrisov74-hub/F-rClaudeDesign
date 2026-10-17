import { createRequire } from 'node:module'
import { mkdir, readFile } from 'node:fs/promises'

// 3D-Gewerke-Icons aus design/icons-3d (gerendert mit scripts/render-icons-3d.py) für die Seite aufbereiten:
// AVIF und WebP in doppelter Anzeigegröße nach public/icons (SPEC 3), dazu ein Kontaktblatt
// oben auf Weiß (Kacheln, Preisübersicht), unten auf Tiefsee, je groß und in Anzeigegröße.
// Aufruf wie prepare-images.mjs: SHARP_MODULE_PATH=… node scripts/icons-3d.mjs
const require = createRequire(import.meta.url)
const sharp = require(process.env.SHARP_MODULE_PATH || 'sharp')

const tokens = JSON.parse(await readFile('design/tokens.json', 'utf8'))
const NAMEN = ['gewerk-installateur', 'gewerk-heizung-und-klima', 'gewerk-schluesseldienst', 'gewerk-elektro', 'gewerk-haushaltsgeraete']
const BREITEN = [80, 112, 128] // 2 × Preisübersicht 40, Schnellwahl 56 (Handy) und 64 px (ab 920 px); wie in GewerkIcon.tsx

await mkdir('public/icons', { recursive: true })
for (const name of NAMEN) {
  for (const breite of BREITEN) {
    const bild = sharp(`design/icons-3d/${name}.png`).resize(breite, breite)
    await bild.clone().avif({ quality: 70, effort: 6 }).toFile(`public/icons/${name}-${breite}.avif`)
    await bild.clone().webp({ quality: 90, alphaQuality: 100 }).toFile(`public/icons/${name}-${breite}.webp`)
  }
}

const GROSS = 220, KLEIN = 56, RAND = 28
const zeilen = []
for (const grund of ['--fx-weiss', '--fx-tiefsee']) {
  for (const groesse of [GROSS, KLEIN]) zeilen.push({ grund: tokens[grund].value, groesse })
}
const breite = RAND + NAMEN.length * (GROSS + RAND)
const hoehe = zeilen.reduce((h, z) => h + z.groesse + 2 * RAND, 0)

const ebenen = []
let y = 0
for (const { grund, groesse } of zeilen) {
  const zeilenhoehe = groesse + 2 * RAND
  ebenen.push({ input: { create: { width: breite, height: zeilenhoehe, channels: 4, background: grund } }, left: 0, top: y })
  for (const [i, name] of NAMEN.entries()) {
    const bild = await sharp(`design/icons-3d/${name}.png`).resize(groesse, groesse).toBuffer()
    ebenen.push({ input: bild, left: RAND + i * (GROSS + RAND) + (GROSS - groesse) / 2, top: y + RAND })
  }
  y += zeilenhoehe
}
await sharp({ create: { width: breite, height: hoehe, channels: 4, background: '#ffffff' } })
  .composite(ebenen)
  .png()
  .toFile('design/ICON-3D-KONTAKTBLATT.png')
console.log(`${NAMEN.length} Icons in ${BREITEN.join('/')} px als AVIF und WebP exportiert, Kontaktblatt erstellt.`)
