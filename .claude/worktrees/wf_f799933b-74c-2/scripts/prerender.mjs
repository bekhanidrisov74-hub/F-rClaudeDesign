// Rendert alle Seiten in dist/*.html, schreibt sitemap.xml und robots.txt
// und warnt im Build-Log vor Platzhaltern und fehlendem Anfrage-Endpunkt.
import fs from 'node:fs'
import path from 'node:path'
import { loadEnv } from 'vite'
import { DOMAIN, pfade, render } from '../dist-ssr/entry-server.js'

const dist = path.resolve('dist')
const vorlage = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
if (!vorlage.includes('<!--app-html-->')) throw new Error('dist/index.html ist schon vorgerendert. Bitte `npm run build` ausführen.')

// Die beiden lateinischen Schriftdateien vorladen (Namen enthalten einen Hash).
const schriften = fs
  .readdirSync(path.join(dist, 'assets'))
  .filter((f) => /^(bricolage-grotesque-latin-standard|atkinson-hyperlegible-next-latin-wght)-normal.*\.woff2$/.test(f))
const preload = schriften
  .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`)
  .join('\n    ')

for (const pfad of pfade) {
  const { html, head } = render(pfad)
  const seite = vorlage.replace('<!--app-head-->', `${head}\n    ${preload}`).replace('<!--app-html-->', html)
  fs.writeFileSync(path.join(dist, pfad === '/' ? 'index.html' : `${pfad.slice(1)}.html`), seite)
}

const domainPlatzhalter = /^\[.*\]$/.test(DOMAIN)
// Nur die Startseite: Die Rechtsseiten tragen noindex.
fs.writeFileSync(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${DOMAIN}/</loc></url>\n</urlset>\n`,
)
fs.writeFileSync(
  path.join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\n${domainPlatzhalter ? '' : `Sitemap: ${DOMAIN}/sitemap.xml\n`}`,
)

const warn = (text) => console.warn(`\x1b[33m⚠ ${text}\x1b[0m`)
const platzhalter = new Set()
for (const datei of fs.readdirSync('src/content')) {
  const quelle = fs.readFileSync(path.join('src/content', datei), 'utf8')
  for (const [treffer] of quelle.matchAll(/'\[[^\]'\n]+\]'|\[[A-ZÄÖÜ][^\]'\n]*\]/g)) platzhalter.add(treffer.replace(/'/g, ''))
}
if (platzhalter.size) warn(`Platzhalter noch nicht ersetzt (${platzhalter.size}): ${[...platzhalter].join(', ')}`)
if (domainPlatzhalter) warn('DOMAIN ist ein Platzhalter: sitemap.xml ohne echte URL, robots.txt ohne Sitemap-Zeile, kein og:url.')
if (!loadEnv('production', process.cwd(), 'VITE_').VITE_LEAD_ENDPOINT)
  warn('VITE_LEAD_ENDPOINT ist nicht gesetzt: Formular und Luna nutzen den lokalen Ersatz. Live gehen Anfragen verloren.')

console.log(`Vorgerendert: ${pfade.join(', ')}`)
