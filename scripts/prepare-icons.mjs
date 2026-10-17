import { createRequire } from 'node:module'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'

// Geometrische Nachzeichnungen der generierten PNGs; keine eingebetteten Rasterbilder.
// Nur Bedien-Icons und Luna. Die Gewerke-Icons sind 3D-Renders: scripts/render-icons-3d.py und scripts/icons-3d.mjs.
const rect = (x, y, w, h, r = 0) => r
  ? `M${x+r} ${y}H${x+w-r}Q${x+w} ${y} ${x+w} ${y+r}V${y+h-r}Q${x+w} ${y+h} ${x+w-r} ${y+h}H${x+r}Q${x} ${y+h} ${x} ${y+h-r}V${y+r}Q${x} ${y} ${x+r} ${y}Z`
  : `M${x} ${y}h${w}v${h}h${-w}Z`
const circle = (x, y, r) => `M${x} ${y-r}a${r} ${r} 0 1 0 0 ${r*2}a${r} ${r} 0 1 0 0 ${-r*2}Z`
const path = d => `<path fill-rule="evenodd" d="${d}"/>`
const moon = '<path fill="#F2F7F9" d="M14.4 7.1A8.9 8.9 0 1 0 24.6 17.8A8 8 0 0 1 14.4 7.1Z"/><circle cx="21.9" cy="10.1" r="1.8" fill="#3AA8B8"/>'
const ui = {
  'ui-anrufen': path('M6.1 2.3A1.6 1.6 0 0 1 8.4 2.6L10.4 5.3A1.5 1.5 0 0 1 10.1 7.4L8.6 8.6A13.8 13.8 0 0 0 15.4 15.4L16.6 13.9A1.5 1.5 0 0 1 18.7 13.6L21.4 15.6A1.6 1.6 0 0 1 21.7 17.9L19.9 20.1A3.4 3.4 0 0 1 16.3 21.2A20.5 20.5 0 0 1 2.8 7.7A3.4 3.4 0 0 1 3.9 4.1Z'),
  'ui-aufklappen': path('M5 7.8L12 14.8L19 7.8L20.6 9.4L12 18L3.4 9.4Z'),
  'ui-chat': path('M4.7 3H19.3A2.7 2.7 0 0 1 22 5.7V14.3A2.7 2.7 0 0 1 19.3 17H10.3L6.4 20.2Q5.5 20.9 5.5 19.7V17H4.7A2.7 2.7 0 0 1 2 14.3V5.7A2.7 2.7 0 0 1 4.7 3Z'+[7.2,12,16.8].map(x=>circle(x,10,1.5)).join('')),
  'ui-formular': path('M6 2H14.7L20 7.3V20A2 2 0 0 1 18 22H6A2 2 0 0 1 4 20V4A2 2 0 0 1 6 2Z'+rect(7,10.5,10,1.8,.4)+rect(7,14,10,1.8,.4)+rect(7,17.5,6.5,1.8,.4)),
  'ui-haekchen': path('M5.2 10.5L9.7 15L18.8 5.9L20.5 7.6L9.7 18.4L3.5 12.2Z'),
  'ui-info': path(circle(12,12,10)+rect(10.8,6,2.4,2.4)+rect(10.8,10,2.4,8)),
  'ui-menue': path([5,10.9,16.8].map(y=>rect(3,y,18,2.2)).join('')),
  'ui-minus': path(rect(5,10.9,14,2.2)),
  'ui-plus': path('M10.9 5H13.1V10.9H19V13.1H13.1V19H10.9V13.1H5V10.9H10.9Z'),
  'ui-region': path('M12 2A7.2 7.2 0 0 0 4.8 9.2C4.8 12.5 8 17 12 22C16 17 19.2 12.5 19.2 9.2A7.2 7.2 0 0 0 12 2Z'+circle(12,8.8,2.8)),
  'ui-richtpreis': path('M3.9 2.5H11.4Q12.2 2.5 12.8 3.1L21 11.3Q22.4 12.7 21 14.1L14.1 21Q12.7 22.4 11.3 21L3.1 12.8Q2.5 12.2 2.5 11.4V3.9A1.4 1.4 0 0 1 3.9 2.5Z'+circle(7.3,6.7,1.6)),
  'ui-rund-um-die-uhr': path(circle(12,12,10)+'M10.8 5.5V13.2H18V10.8H13.2V5.5Z'),
  'ui-schliessen': path('M5 3.4L12 10.4L19 3.4L20.6 5L13.6 12L20.6 19L19 20.6L12 13.6L5 20.6L3.4 19L10.4 12L3.4 5Z'),
  'ui-senden': path('M2.5 3.5L21.5 12L2.5 20.5V14.2L12.5 12L2.5 9.8Z'),
  'ui-vermittlung': [8.5,15.5].map(x=>path(circle(x,12,6.5)+circle(x,12,4.1))).join(''),
  'ui-warnung': path('M12 2L22.5 21H1.5Z'+rect(10.9,8.1,2.2,6.6)+rect(10.9,16.6,2.2,2.2)),
  'ui-weiter': path('M8.1 5L9.7 3.4L18.3 12L9.7 20.6L8.1 19L15.1 12Z'),
}
const entries = [
  {name:'luna-signet',body:`<circle cx="16" cy="16" r="16" fill="#001B2A"/>${moon}`,size:32},
  ...Object.entries(ui).map(([name,body])=>({name,body,size:24})),
  {name:'luna-signet-glyph',body:`<g transform="translate(-5.333 -5.333) scale(1.3333)">${moon}</g>`,size:32},
]
const require = createRequire(import.meta.url)
const sharp = require(process.env.SHARP_MODULE_PATH || 'sharp')
await mkdir('design/icons', {recursive:true})
const large = []
const raw = []
for (const [i, {name,body,size}] of entries.entries()) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" fill="currentColor">${body}</svg>\n`
  await writeFile(`design/icons/${name}.svg`,svg)
  const color = '#001B2A'
  const render = Buffer.from(svg.replace('fill="currentColor"',`fill="${color}"`))
  const tile = name.endsWith('-glyph') ? '#001B2A' : '#FFFFFF'
  const big = await sharp(render).resize(120,120).flatten({background:tile}).png().toBuffer()
  const small = await sharp(render).resize(24,24).flatten({background:tile}).png().toBuffer()
  // Smoke check: every SVG must rasterize visibly even at its smallest target size.
  const alpha = await sharp(render).resize(24,24).ensureAlpha().raw().toBuffer()
  assert(alpha.some((v,k)=>k%4===3 && v>128),`${name}: leeres Icon`)
  const left=(i%6)*200
  const top=Math.floor(i/6)*200
  large.push({input:big,left:left+40,top:top+24},{input:small,left:left+88,top:top+164})
  if (!name.endsWith('-glyph')) {
    const png = await readFile(`design/icons-roh/${name}.png`)
    raw.push({input:await sharp(png).resize(160,160).png().toBuffer(),left:left+20,top:top+20})
  }
}
await sharp({create:{width:1200,height:800,channels:3,background:'#FFFFFF'}}).composite(large).png().toFile('design/ICON-KONTAKTBLATT.png')
await sharp({create:{width:1200,height:800,channels:3,background:'#FFFFFF'}}).composite(raw).png().toFile('design/ICON-KONTAKTBLATT-ROH.png')
console.log(`${entries.length} SVGs nachgezeichnet, bei 24 px geprüft; zwei Kontaktblätter erstellt.`)
