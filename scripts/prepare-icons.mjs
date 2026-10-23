import sharp from 'sharp'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'

// Geometrische Nachzeichnungen der generierten PNGs; keine eingebetteten Rasterbilder.
// Nur Steuer- und Feldzeichen (X, Pfeile, Plus/Minus, Menü, Häkchen, Warnung) und Luna. Gewerke-Icons und Symbole
// sind 3D-Renders: scripts/render-icons-3d.py und scripts/export-3d.mjs.
const rect = (x, y, w, h, r = 0) => r
  ? `M${x+r} ${y}H${x+w-r}Q${x+w} ${y} ${x+w} ${y+r}V${y+h-r}Q${x+w} ${y+h} ${x+w-r} ${y+h}H${x+r}Q${x} ${y+h} ${x} ${y+h-r}V${y+r}Q${x} ${y} ${x+r} ${y}Z`
  : `M${x} ${y}h${w}v${h}h${-w}Z`
const circle = (x, y, r) => `M${x} ${y-r}a${r} ${r} 0 1 0 0 ${r*2}a${r} ${r} 0 1 0 0 ${-r*2}Z`
const path = d => `<path fill-rule="evenodd" d="${d}"/>`
const moon = '<path fill="#F2F7F9" d="M14.4 7.1A8.9 8.9 0 1 0 24.6 17.8A8 8 0 0 1 14.4 7.1Z"/><circle cx="21.9" cy="10.1" r="1.8" fill="#3AA8B8"/>'
const ui = {
  'ui-aufklappen': path('M5 7.8L12 14.8L19 7.8L20.6 9.4L12 18L3.4 9.4Z'),
  'ui-haekchen': path('M5.2 10.5L9.7 15L18.8 5.9L20.5 7.6L9.7 18.4L3.5 12.2Z'),
  'ui-menue': path([5,10.9,16.8].map(y=>rect(3,y,18,2.2)).join('')),
  'ui-minus': path(rect(5,10.9,14,2.2)),
  'ui-plus': path('M10.9 5H13.1V10.9H19V13.1H13.1V19H10.9V13.1H5V10.9H10.9Z'),
  'ui-schliessen': path('M5 3.4L12 10.4L19 3.4L20.6 5L13.6 12L20.6 19L19 20.6L12 13.6L5 20.6L3.4 19L10.4 12L3.4 5Z'),
  'ui-warnung': path('M12 2L22.5 21H1.5Z'+rect(10.9,8.1,2.2,6.6)+rect(10.9,16.6,2.2,2.2)),
  'ui-weiter': path('M8.1 5L9.7 3.4L18.3 12L9.7 20.6L8.1 19L15.1 12Z'),
}
const entries = [
  {name:'luna-signet',body:`<circle cx="16" cy="16" r="16" fill="#001B2A"/>${moon}`,size:32},
  ...Object.entries(ui).map(([name,body])=>({name,body,size:24})),
  {name:'luna-signet-glyph',body:`<g transform="translate(-5.333 -5.333) scale(1.3333)">${moon}</g>`,size:32},
]
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
