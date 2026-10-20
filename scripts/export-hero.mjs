import { createRequire } from 'node:module'

// Hero-Foto aus dem Entwurf „Hero – Desktop 1586“ (public/images/hero-wien.jpg, 1006 × 724) für Breiten unter 1280 px
// als AVIF und WebP in 480/800/1006 px (Hero.tsx). Ab 1280 px zeigt die Seite das Original-JPG, damit der Desktop
// pixelgleich mit dem Entwurf bleibt. Qualität wie die Bilder in scripts/export-bilder.mjs.
// Aufruf: SHARP_MODULE_PATH=… node scripts/export-hero.mjs (Sharp ist keine Projektabhängigkeit)
const require = createRequire(import.meta.url)
const sharp = require(process.env.SHARP_MODULE_PATH || 'sharp')

const QUELLE = 'public/images/hero-wien.jpg'
const BREITEN = [480, 800, 1006] // wie HERO_BREITEN in Hero.tsx; 1006 ist die Originalbreite und steht ohne Zusatz im Namen

for (const breite of BREITEN) {
  const ziel = `public/images/hero-wien${breite === 1006 ? '' : `-${breite}`}`
  const bild = sharp(QUELLE).resize({ width: breite })
  await bild.clone().webp({ quality: 85 }).toFile(`${ziel}.webp`)
  await bild.clone().avif({ quality: 60, effort: 4 }).toFile(`${ziel}.avif`)
}
