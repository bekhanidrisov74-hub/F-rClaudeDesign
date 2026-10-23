import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

// Fotos der Leistungskarten design/bilder-foto/bild-N.png (Bild 2–6, mit ChatGPT erzeugt, 1536 × 1024)
// → public/images, AVIF und WebP bei 480/800/1200/1536 px (wie in ui/Bildflaeche.tsx).
// Der Hero zeigt public/images/hero-wien.jpg aus dem Entwurf „Hero – Desktop 1586“.
// Aufruf: node scripts/export-bilder.mjs

const BILD_BREITEN = [480, 800, 1200, 1536]

await mkdir('public/images', { recursive: true })
for (let n = 2; n <= 6; n++) {
  for (const breite of BILD_BREITEN) {
    const ziel = `public/images/bild-${n}${breite === 1536 ? '' : `-${breite}`}`
    const bild = sharp(`design/bilder-foto/bild-${n}.png`).removeAlpha().resize({ width: breite })
    await bild.clone().webp({ quality: 85 }).toFile(`${ziel}.webp`)
    await bild.clone().avif({ quality: 60, effort: 4 }).toFile(`${ziel}.avif`)
  }
}
console.log('5 Bilder exportiert.')
