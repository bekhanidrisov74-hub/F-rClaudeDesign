import { createRequire } from 'node:module'
import { mkdir, readdir, readFile } from 'node:fs/promises'

// Alle 3D-Renders für die Seite aufbereiten (SPEC 3, IMAGE-BRIEFS.md), danach Kontaktblätter zur Kontrolle:
// - Gewerke-Icons design/icons-3d/gewerk-*.png → public/icons, doppelte Anzeigegröße 80/112/128 px (GewerkIcon.tsx)
// - Symbole design/icons-3d/ui-*.png (zwei Farbstellungen) → public/icons, 96 px (Symbol3D.tsx)
// - Bilder design/bilder-chatgpt/bild-N.png (mit ChatGPT erzeugt, 1254 px) → public/images, 480/800/1200/1254 px (Bildflaeche.tsx)
// Die Icons und Symbole werden mit scripts/render-icons-3d.py gerendert, die Bilder mit ChatGPT erzeugt (design/BILD-PROMPTS-3D-CHATGPT.md).
// Aufruf: SHARP_MODULE_PATH=… node scripts/export-3d.mjs (Sharp ist keine Projektabhängigkeit)
const require = createRequire(import.meta.url)
const sharp = require(process.env.SHARP_MODULE_PATH || 'sharp')

const tokens = JSON.parse(await readFile('design/tokens.json', 'utf8'))
const farbe = (token) => tokens[token].value
const GEWERKE = ['gewerk-installateur', 'gewerk-heizung-und-klima', 'gewerk-schluesseldienst', 'gewerk-elektro', 'gewerk-haushaltsgeraete']
const GEWERK_BREITEN = [80, 112, 128] // 2 × Preisübersicht 40, Schnellwahl 56 (Handy) und 64 px (ab 920 px)
const SYMBOL_BREITE = 96 // deckt 32 px bei dreifacher Pixeldichte; wie SYMBOL_BREITE in Symbol3D.tsx
const BILD_BREITEN = [480, 800, 1200, 1254] // wie in Bildflaeche.tsx

const symbole = (await readdir('design/icons-3d')).filter((f) => f.startsWith('ui-')).map((f) => f.slice(0, -'.png'.length))

await mkdir('public/icons', { recursive: true })
const icon = (quelle, ziel, breite) => {
  const bild = sharp(quelle).resize(breite, breite)
  return Promise.all([
    bild.clone().avif({ quality: 70, effort: 6 }).toFile(`${ziel}.avif`),
    bild.clone().webp({ quality: 90, alphaQuality: 100 }).toFile(`${ziel}.webp`),
  ])
}
for (const name of GEWERKE) {
  for (const breite of GEWERK_BREITEN) await icon(`design/icons-3d/${name}.png`, `public/icons/${name}-${breite}`, breite)
}
for (const name of symbole) await icon(`design/icons-3d/${name}.png`, `public/icons/${name}-${SYMBOL_BREITE}`, SYMBOL_BREITE)

await mkdir('public/images', { recursive: true })
// Das Schwarz der Bilder (≈ #010304) wird auf Tiefsee angehoben, damit Bildecken und Vignette in derselben Farbe
// auslaufen wie die dunklen Abschnitte und Karten der Seite. Gewichtet nach Helligkeit: unter SCHWELLE weich bis voll,
// darüber gar nicht, sodass Haut, Orange und Chrom unverändert bleiben.
const TIEFSEE_RGB = farbe('--fx-tiefsee').slice(1).match(/../g).map((h) => parseInt(h, 16))
const SCHWELLE = 0.14 // Helligkeit (0–1), ab der nichts mehr angehoben wird; der Lichtkegel (≈ 0,16) bleibt unberührt
function tiefseeAnheben(daten) {
  for (let i = 0; i < daten.length; i += 3) {
    const hell = (0.2126 * daten[i] + 0.7152 * daten[i + 1] + 0.0722 * daten[i + 2]) / 255
    if (hell >= SCHWELLE) continue
    const x = 1 - hell / SCHWELLE
    const gewicht = x * x * (3 - 2 * x)
    for (let k = 0; k < 3; k++) daten[i + k] += gewicht * Math.max(0, TIEFSEE_RGB[k] - daten[i + k])
  }
}
for (let n = 1; n <= 6; n++) {
  const { data, info } = await sharp(`design/bilder-chatgpt/bild-${n}.png`).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  tiefseeAnheben(data)
  for (const breite of BILD_BREITEN) {
    const ziel = `public/images/bild-${n}${breite === 1254 ? '' : `-${breite}`}`
    const bild = sharp(data, { raw: info }).resize(breite, breite)
    await bild.clone().webp({ quality: 85 }).toFile(`${ziel}.webp`)
    await bild.clone().avif({ quality: 60, effort: 4 }).toFile(`${ziel}.avif`)
  }
}

// Kontaktblatt: je Zeile ein Untergrund, Motive groß und darunter in Anzeigegröße
async function kontaktblatt(datei, zeilen, gross, klein) {
  const RAND = 24
  const spalten = Math.max(...zeilen.map((z) => z.namen.length))
  const breite = RAND + spalten * (gross + RAND)
  const zeilenhoehe = gross + klein + 3 * RAND
  const ebenen = []
  for (const [j, { grund, namen }] of zeilen.entries()) {
    ebenen.push({ input: { create: { width: breite, height: zeilenhoehe, channels: 4, background: grund } }, left: 0, top: j * zeilenhoehe })
    for (const [i, name] of namen.entries()) {
      const links = RAND + i * (gross + RAND)
      ebenen.push({ input: await sharp(`design/icons-3d/${name}.png`).resize(gross, gross).toBuffer(), left: links, top: j * zeilenhoehe + RAND })
      ebenen.push({ input: await sharp(`design/icons-3d/${name}.png`).resize(klein, klein).toBuffer(), left: links + (gross - klein) / 2, top: j * zeilenhoehe + 2 * RAND + gross })
    }
  }
  await sharp({ create: { width: breite, height: zeilen.length * zeilenhoehe, channels: 4, background: '#ffffff' } }).composite(ebenen).png().toFile(datei)
}
await kontaktblatt('design/ICON-3D-KONTAKTBLATT.png', [
  { grund: farbe('--fx-weiss'), namen: GEWERKE },
  { grund: farbe('--fx-tiefsee'), namen: GEWERKE },
], 220, 56)
const dunkel = symbole.filter((n) => !n.endsWith('-hell'))
await kontaktblatt('design/SYMBOLE-3D-KONTAKTBLATT.png', [
  { grund: farbe('--fx-tuerkis'), namen: dunkel },
  { grund: farbe('--fx-kalk'), namen: dunkel },
  { grund: farbe('--fx-tiefsee'), namen: dunkel.map((n) => `${n}-hell`) },
], 120, 24)
console.log(`${GEWERKE.length} Gewerke-Icons, ${symbole.length} Symbole und 6 Bilder exportiert, zwei Kontaktblätter erstellt.`)
