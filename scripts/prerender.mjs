// Rendert alle Seiten in dist/*.html, schreibt sitemap.xml und robots.txt
// und warnt im Build-Log vor Platzhaltern und fehlendem Anfrage-Endpunkt.
import fs from 'node:fs'
import path from 'node:path'
import { loadEnv } from 'vite'
import { DOMAIN, pfade, render } from '../dist-ssr/entry-server.js'

const dist = path.resolve('dist')
const roh = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
if (!roh.includes('<!--app-html-->')) throw new Error('dist/index.html ist schon vorgerendert. Bitte `npm run build` ausführen.')

// Das App-Bundle erst nach dem ersten gezeichneten Frame laden: Der vorgerenderte Text steht sofort (LCP),
// React übernimmt danach. Eigene Datei statt Inline-Skript (eine spätere CSP braucht kein 'unsafe-inline');
// der Name trägt den Hash des Bundles, damit nach einem Deploy kein alter Starter aus dem Cache auf ein
// gelöschtes Bundle zeigt.
const [skriptTag, bundle] = roh.match(/<script type="module" crossorigin src="(\/assets\/[^"]+\.js)"><\/script>/) ?? []
if (!skriptTag) throw new Error('App-Skript in dist/index.html nicht gefunden.')
const starter = bundle.replace(/\/([^/]+)\.js$/, '/start-$1.js')
fs.writeFileSync(path.join(dist, starter), `requestAnimationFrame(() => setTimeout(() => import('${bundle}')))\n`)
const vorlage = roh.replace(skriptTag, `<script type="module" src="${starter}"></script>`)

// Die lateinischen Schriftdateien vorladen (Namen enthalten einen Hash); Inter trägt Kopf und Hero.
const schriften = fs
  .readdirSync(path.join(dist, 'assets'))
  .filter((f) => /^(bricolage-grotesque-latin-standard|atkinson-hyperlegible-next-latin-wght|inter-latin-wght)-normal.*\.woff2$/.test(f))
const preload = schriften
  .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`)
  .join('\n    ')

// Unterseiten als ordner/index.html: /impressum findet so jeder Webserver ohne Umschreibregeln (Audit, Befund H2).
for (const pfad of pfade) {
  const { html, head } = render(pfad)
  const seite = vorlage.replace('<!--app-head-->', `${head}\n    ${preload}`).replace('<!--app-html-->', html)
  const ordner = path.join(dist, pfad.slice(1))
  fs.mkdirSync(ordner, { recursive: true })
  fs.writeFileSync(path.join(ordner, 'index.html'), seite)
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
const umgebung = loadEnv('production', process.cwd(), 'VITE_')
if (!umgebung.VITE_FORM_ENDPOINT) warn('VITE_FORM_ENDPOINT ist nicht gesetzt: Live schlägt jedes Senden fehl (Formular und Luna zeigen den Sendefehler).')
if (!umgebung.VITE_CHAT_ENDPOINT) warn('VITE_CHAT_ENDPOINT ist nicht gesetzt: Luna läuft live nur mit den lokalen Regeln, ohne KI.')

console.log(`Vorgerendert: ${pfade.join(', ')}`)
