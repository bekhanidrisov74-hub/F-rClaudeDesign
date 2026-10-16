import { createRequire } from 'node:module'
import { mkdir, readFile } from 'node:fs/promises'

// SHARP_MODULE_PATH erlaubt die gebündelte Codex-Laufzeit ohne neue Projektabhängigkeit.
const require = createRequire(import.meta.url)
const sharp = require(process.env.SHARP_MODULE_PATH || 'sharp')

// Farbabgleich: Die Rohbilder haben leuchtendes Cyan und Royalblau. Alle blau-türkisen Pixel (Hintergrund,
// Spiegelungen im Chrom, Wasser) werden auf eine Rampe Tiefsee → Türkis → Kalk aus den Tokens umgefärbt.
// Die Ecken landen auf Tiefsee, die Lichtmitte auf Türkis. Weiß, Grau, Orange und Schwarz bleiben unberührt.
const tokens = JSON.parse(await readFile('design/tokens.json', 'utf8'))
const [TIEFSEE, TUERKIS, KALK] = ['--fx-tiefsee', '--fx-tuerkis', '--fx-kalk']
  .map((name) => [1, 3, 5].map((i) => parseInt(tokens[name].value.slice(i, i + 2), 16)))
const HELL = 0.58 // HSL-Helligkeit der Lichtmitte in den Rohbildern (Messung über alle sechs Bilder)
const KURVE = 1.7 // über 1 hebt die Mitteltöne, damit der Verlauf nicht trüb wird
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const mix = (a, b, t) => a + (b - a) * t
const helligkeit = (data, i) => (Math.max(data[i], data[i + 1], data[i + 2]) + Math.min(data[i], data[i + 1], data[i + 2])) / 510

function farbabgleich(data, breite) {
  // Die Ecken der Rohbilder sind reiner Hintergrund: ihre Helligkeit wird zu Tiefsee.
  let summe = 0
  for (const [x0, y0] of [[0, 0], [breite - 40, 0], [0, breite - 40], [breite - 40, breite - 40]])
    for (let y = y0; y < y0 + 40; y++) for (let x = x0; x < x0 + 40; x++) summe += helligkeit(data, (y * breite + x) * 3)
  const dunkel = summe / 6400
  let seed = 1 // festes Rauschen gegen Streifen im Verlauf, damit der Export reproduzierbar bleibt
  const rauschen = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32 - 0.5
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255
    const hoch = Math.max(r, g, b), c = hoch - Math.min(r, g, b), l = helligkeit(data, i)
    if (c < 0.06) continue
    const h = (hoch === r ? ((g - b) / c + 6) % 6 : hoch === g ? (b - r) / c + 2 : (r - g) / c + 4) * 60
    const gewicht = smooth(0.06, 0.16, c) * smooth(165, 180, h) * (1 - smooth(235, 250, h))
    if (!gewicht) continue
    const t = (l - dunkel) / (HELL - dunkel)
    const ziel = t <= 0
      ? TIEFSEE.map((v) => v * (l / dunkel))
      : t <= 1
        ? TIEFSEE.map((v, k) => mix(v, TUERKIS[k], 1 - (1 - t) ** KURVE))
        : TUERKIS.map((v, k) => mix(v, KALK[k], Math.min(1, (l - HELL) / (0.95 - HELL))))
    for (let k = 0; k < 3; k++) data[i + k] = Math.round(mix(data[i + k], ziel[k], gewicht) + rauschen())
  }
}

await mkdir('design/bilder-final', { recursive: true })
await mkdir('public/images', { recursive: true })

for (let n = 1; n <= 6; n++) {
  const source = `design/bilder-final/bild-${n}.png`
  const { data, info } = await sharp(`design/bilder-roh/bild-${n}.png`).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  farbabgleich(data, info.width)
  await sharp(data, { raw: info }).resize(2400, 2400).png().toFile(source)
  for (const size of [480, 800, 1200, 2400]) {
    const stem = `public/images/bild-${n}${size === 2400 ? '' : `-${size}`}`
    await sharp(source).resize(size, size).webp({ quality: 85 }).toFile(`${stem}.webp`)
    await sharp(source).resize(size, size).avif({ quality: 60, effort: 4 }).toFile(`${stem}.avif`)
  }
  console.log(`Bild ${n}: Farben angeglichen, Quelle 2400 × 2400, 8 Webdateien`)
}
