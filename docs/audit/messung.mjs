// Messungen für docs/audit/BEFUND.md (Abschnitte a, b, c). Gleiches Skript für „vorher“ und „nachher“.
// Voraussetzung: npm run build && npx vite preview --port 4173
// Aufruf: node docs/audit/messung.mjs <lauf> [basis]   z. B. node docs/audit/messung.mjs vorher
// Ergebnis: docs/audit/belege/<lauf>/*.json, *.har, *.png, *.yml
import AxeBuilder from '@axe-core/playwright'
import { chromium } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const lauf = process.argv[2] ?? 'lauf'
const BASIS = process.argv[3] ?? 'http://localhost:4173'
const aus = path.resolve('docs/audit/belege', lauf)
fs.mkdirSync(aus, { recursive: true })
const schreibe = (datei, inhalt) =>
  fs.writeFileSync(path.join(aus, datei), typeof inhalt === 'string' ? inhalt : JSON.stringify(inhalt, null, 2))

// Lighthouse „Slow 4G“ mit DevTools-Drosselung: 562,5 ms Latenz, 1474,56 kbit/s runter, 675 kbit/s rauf, CPU 4×
const NETZ = { offline: false, latency: 562.5, downloadThroughput: (1474.56 * 1024) / 8, uploadThroughput: (675 * 1024) / 8 }
const M390 = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'de-AT' }

const browser = await chromium.launch({ channel: 'chrome' })

async function seite({ gedrosselt = false, kontext = {}, har } = {}) {
  const ctx = await browser.newContext({ ...M390, ...kontext, ...(har ? { recordHar: { path: har, content: 'omit' } } : {}) })
  const page = await ctx.newPage()
  await page.addInitScript(() => {
    window.__mess = { anrufe: [], hydriert: null, lcp: null }
    new MutationObserver(() => {
      if (window.__mess.hydriert === null && document.documentElement.hasAttribute('data-hydriert')) window.__mess.hydriert = performance.now()
    }).observe(document, { attributes: true, subtree: true, attributeFilter: ['data-hydriert'] })
    // tel:- und wa.me-Klicks abfangen (keine externe App öffnen), Zeitpunkt und Ziel merken
    document.addEventListener(
      'click',
      (e) => {
        const a = e.target instanceof Element && e.target.closest('a[href^="tel:"], a[href*="wa.me"]')
        if (!a) return
        e.preventDefault()
        window.__mess.anrufe.push({ href: a.getAttribute('href'), t: Math.round(performance.now()) })
      },
      true,
    )
    new PerformanceObserver((l) => (window.__mess.lcp = l.getEntries().at(-1).startTime)).observe({ type: 'largest-contentful-paint', buffered: true })
  })
  if (gedrosselt) {
    const cdp = await ctx.newCDPSession(page)
    await cdp.send('Network.enable')
    await cdp.send('Network.emulateNetworkConditions', NETZ)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  }
  const anfragen = []
  page.on('requestfinished', async (r) => {
    const s = await r.sizes().catch(() => null)
    const t = r.timing()
    anfragen.push({
      url: r.url().replace(BASIS, ''),
      methode: r.method(),
      typ: r.resourceType(),
      status: (await r.response())?.status() ?? null,
      bytes: s ? s.responseBodySize + s.responseHeadersSize : null,
      ende_ms: Math.round(t.responseEnd),
    })
  })
  page.on('requestfailed', (r) => anfragen.push({ url: r.url().replace(BASIS, ''), typ: r.resourceType(), fehler: r.failure()?.errorText }))
  return { ctx, page, anfragen }
}

/** Zählt Berührungen, getippte Zeichen und nötige Wischgesten (grob: je 600 px Abstand eine). */
function zaehler(page) {
  const z = { beruehrungen: 0, zeichen: 0, wischen: 0, schritte: [] }
  const sichtbarMachen = async (loc) => {
    const box = await loc.boundingBox()
    const h = page.viewportSize().height
    if (box && (box.y < 0 || box.y + box.height > h)) z.wischen += Math.max(1, Math.ceil(Math.abs(box.y - h / 2) / 600))
  }
  z.tippe = async (loc, was) => {
    await loc.waitFor({ state: 'visible', timeout: 60_000 })
    await sichtbarMachen(loc)
    await loc.tap({ timeout: 60_000 })
    z.beruehrungen++
    z.schritte.push({ was, t: Math.round(await page.evaluate(() => performance.now())) })
  }
  z.schreibe = async (loc, text, was) => {
    const fokus = await loc.evaluate((el) => el === document.activeElement).catch(() => false)
    if (!fokus) await z.tippe(loc, was)
    await page.keyboard.type(text)
    z.zeichen += text.length
  }
  return z
}

const metriken = (page) =>
  page.evaluate(() => ({
    fcp_ms: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? -1),
    lcp_ms: window.__mess.lcp === null ? null : Math.round(window.__mess.lcp),
    hydriert_ms: window.__mess.hydriert === null ? null : Math.round(window.__mess.hydriert),
    anrufe: window.__mess.anrufe,
  }))

const imErstenBild = async (loc) => {
  const b = await loc.boundingBox()
  return b ? { oben: Math.round(b.y), unten: Math.round(b.y + b.height), sichtbar: b.y >= 0 && b.y + b.height <= 844 } : null
}

// ── a) Notfall-Szenarien ──
const SZENARIEN = {
  async s1_aussperrung_anruf(page, z) {
    await page.goto(`${BASIS}/`, { waitUntil: 'commit' })
    const knopf = page.locator('#start a[href^="tel:"]')
    await z.tippe(knopf, 'Hero „Jetzt anrufen“')
    return { ziel: 'Anruf', knopf: await imErstenBild(knopf), href: await knopf.getAttribute('href') }
  },

  async s2_rohrbruch_formular(page, z) {
    await page.goto(`${BASIS}/`, { waitUntil: 'commit' })
    await z.tippe(page.locator('section[aria-labelledby="schnellwahl-titel"] a[data-gewerk="installateur"]'), 'Schnellwahl „Installateur“')
    const a = page.locator('#anfrage')
    const gewerk = a.getByLabel(/^Gewerk/)
    const vorgewaehlt = await gewerk.inputValue()
    await z.schreibe(a.getByLabel(/^Name/), 'Maria Huber', 'Feld Name')
    await z.schreibe(a.getByLabel(/^Telefon/), '0664 1234567', 'Feld Telefon')
    await z.schreibe(a.getByLabel(/^PLZ und Ort/), '1020 Wien', 'Feld PLZ und Ort')
    if ((await gewerk.inputValue()) !== 'installateur') {
      await z.tippe(gewerk, 'Auswahl Gewerk öffnen')
      await gewerk.selectOption('installateur')
      z.beruehrungen++
    }
    await z.tippe(a.getByRole('checkbox'), 'Einwilligung')
    const post = page.waitForRequest((r) => r.url().includes('/api/anfrage'), { timeout: 30_000 }).catch(() => null)
    const nav = page.waitForURL(/\?/, { timeout: 30_000 }).catch(() => null)
    await z.tippe(a.getByRole('button', { name: 'Anfrage senden' }), 'Anfrage senden')
    const ergebnis = await Promise.race([post.then((r) => r && 'POST'), nav.then((r) => r !== null && 'Seitenwechsel')])
    const erfolg = await a.getByText(/Anfragenummer/).waitFor({ timeout: 30_000 }).then(() => true, () => false)
    return { ziel: 'Formular', vorgewaehlt: vorgewaehlt || '(leer)', ergebnis, erfolg, url: page.url().replace(BASIS, '') }
  },

  async s3_stromausfall_luna(page, z) {
    await page.goto(`${BASIS}/`, { waitUntil: 'commit' })
    const c = page.getByRole('dialog', { name: 'Chat mit Luna' })
    // Seit 19.10.2026 erscheint der schwebende Knopf erst nach dem Hero; die Karte „Nicht sicher? Luna fragen“ ist der frühere Einstieg.
    const knopf = page.getByRole('link', { name: /Luna fragen/ }).first()
    let tote = 0
    for (;;) {
      await z.tippe(knopf, 'Luna-Knopf')
      if (await c.waitFor({ timeout: 1500 }).then(() => true, () => false)) break
      tote++ // vor der Hydrierung geht die Berührung ins Leere
    }
    const plan = [
      [/Worum geht es\?/, 'Elektro'],
      [/Was ist passiert\?/, 'text:Strom ist in der ganzen Wohnung weg.'],
      [/Was funktioniert nicht\?/, 'Kein Strom'],
      [/ganze Wohnung oder das ganze Haus\?/, 'Ganze Wohnung'],
      [/Sicherung oder der FI-Schalter gefallen\?/, 'Ja'],
      [/Funken, Rauch oder Brandgeruch\?/, 'Nein'],
      [/Wie dringend ist es\?/, 'So schnell wie möglich'],
      [/Postleitzahl\?/, 'text:8010'],
    ]
    for (let runde = 0; runde < 15; runde++) {
      if (await c.getByRole('heading', { name: 'Ihre Anfrage' }).isVisible()) break
      const text = await c.innerText()
      const [, antwort] = plan.map(([re, a]) => [Math.max(...[...text.matchAll(new RegExp(re, 'g'))].map((m) => m.index), -1), a]).sort((x, y) => y[0] - x[0])[0]
      if (antwort.startsWith('text:')) {
        await z.schreibe(c.getByRole('textbox', { name: 'Nachricht an Luna' }), antwort.slice(5), 'Luna Freitext')
        await z.tippe(c.getByRole('button', { name: 'Nachricht senden' }), 'Senden')
      } else await z.tippe(c.getByRole('button', { name: antwort, exact: true }).last(), `Chip „${antwort}“`)
      await page.waitForTimeout(300)
    }
    await z.schreibe(c.getByLabel('Name'), 'Maria Huber', 'Feld Name')
    await z.schreibe(c.getByLabel('Telefon'), '0664 1234567', 'Feld Telefon')
    await z.tippe(c.getByRole('checkbox'), 'Einwilligung')
    await z.tippe(c.getByRole('button', { name: 'Auftrag aufgeben' }), 'Auftrag aufgeben')
    const erfolg = await c.getByText(/Anfragenummer/).waitFor({ timeout: 30_000 }).then(() => true, () => false)
    return { ziel: 'Luna', tote_beruehrungen: tote, erfolg }
  },

  async s4_therme_unten_anruf_kopf(page, z) {
    await page.goto(`${BASIS}/#preisrechner`, { waitUntil: 'commit' })
    await page.locator('#preisrechner').waitFor()
    await page.locator('#preisrechner').scrollIntoViewIfNeeded()
    const knopf = page.locator('header a[href^="tel:"]')
    await z.tippe(knopf, 'Kopf „Anrufen“')
    return { ziel: 'Anruf', knopf: await imErstenBild(knopf), href: await knopf.getAttribute('href') }
  },

  async s5_rohrbruch_ohne_js(page, z) {
    // JavaScript kommt nicht an (Verbindungsabbruch nach dem HTML)
    await page.route('**/*.js', (r) => r.abort())
    await page.goto(`${BASIS}/`, { waitUntil: 'commit' })
    const knopf = page.locator('#start a[href^="tel:"]')
    const href = await knopf.getAttribute('href', { timeout: 60_000 })
    await z.tippe(page.locator('#start a[href="#anfrage"]'), 'Hero „Anfrage senden“')
    const a = page.locator('#anfrage')
    await z.schreibe(a.getByLabel(/^Name/), 'Maria Huber', 'Feld Name')
    await z.schreibe(a.getByLabel(/^Telefon/), '0664 1234567', 'Feld Telefon')
    await z.schreibe(a.getByLabel(/^PLZ und Ort/), '1020 Wien', 'Feld PLZ und Ort')
    await z.tippe(a.getByLabel(/^Gewerk/), 'Auswahl Gewerk öffnen')
    await a.getByLabel(/^Gewerk/).selectOption('installateur')
    z.beruehrungen++
    await z.tippe(a.getByRole('checkbox'), 'Einwilligung')
    const anfragen = []
    page.on('request', (r) => r.resourceType() === 'document' && anfragen.push(`${r.method()} ${r.url().replace(BASIS, '')}`))
    await z.tippe(a.getByRole('button', { name: 'Anfrage senden' }), 'Anfrage senden')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1500)
    return { ziel: 'Anruf + Formular ohne JS', anruf_href: href, dokument_anfragen_nach_senden: anfragen, url_danach: page.url().replace(BASIS, '') }
  },
}

const szenarien = []
for (const gedrosselt of [false, true]) {
  for (const [name, fn] of Object.entries(SZENARIEN)) {
    if (process.env.NUR && name !== process.env.NUR) continue
    const har = gedrosselt && name === 's1_aussperrung_anruf' ? path.join(aus, 's1-gedrosselt.har') : undefined
    const { ctx, page, anfragen } = await seite({ gedrosselt, har })
    const z = zaehler(page)
    let ergebnis
    try {
      ergebnis = await fn(page, z)
    } catch (fehler) {
      ergebnis = { fehler: String(fehler).slice(0, 300) }
    }
    await page.waitForLoadState('load').catch(() => {})
    const m = await metriken(page).catch(() => ({}))
    szenarien.push({
      szenario: name,
      netz: gedrosselt ? 'Slow 4G + CPU 4×' : 'ungedrosselt',
      ...ergebnis,
      beruehrungen: z.beruehrungen,
      zeichen: z.zeichen,
      wischen_geschaetzt: z.wischen,
      ziel_erreicht_ms: z.schritte.at(-1)?.t ?? null,
      schritte: z.schritte,
      ...m,
      anfragen: name === 's1_aussperrung_anruf' ? anfragen : anfragen.length,
    })
    await ctx.close()
    console.log(`a) ${name} (${gedrosselt ? 'gedrosselt' : 'frei'}) fertig`)
  }
}
schreibe('a-szenarien.json', szenarien)

// ── b1) Ohne JavaScript: erster Bildschirm und Links ──
{
  const { ctx, page } = await seite({ kontext: { javaScriptEnabled: false } })
  await page.goto(`${BASIS}/`)
  await page.screenshot({ path: path.join(aus, 'b1-ohne-js-390.png') })
  const links = await page.$$eval('a[href^="tel:"], a[href*="wa.me"], a[href^="mailto:"]', (as) => as.map((a) => a.getAttribute('href')))
  const formular = await page.$eval('#anfrage form', (f) => ({ action: f.getAttribute('action'), method: f.getAttribute('method') }))
  const knoepfe = await page.$$eval('button', (bs) => bs.map((b) => b.textContent.trim() || b.getAttribute('aria-label')))
  schreibe('b1-ohne-js.json', { links: [...new Set(links)], formular, knoepfe_ohne_wirkung_ohne_js: knoepfe })
  await ctx.close()
}

// ── c) Tastatur, Zielgrößen, Umbruch, Textabstände, Zugänglichkeitsbaum, axe ──
async function tastatur(kontext, name) {
  const ctx = await browser.newContext({ locale: 'de-AT', ...kontext })
  const page = await ctx.newPage()
  await page.goto(`${BASIS}/`)
  await page.waitForFunction(() => document.documentElement.hasAttribute('data-hydriert'))
  const weg = []
  for (let i = 0; i < 150; i++) {
    await page.keyboard.press('Tab')
    const f = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      const kopf = document.querySelector('header')?.getBoundingClientRect()
      const imKopf = !!el.closest('header')
      const verdecktVomKopf = !imKopf && kopf && r.top < kopf.bottom && r.bottom > kopf.top
      const mitte = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      const verdecktVon = mitte && !el.contains(mitte) && !mitte.contains(el) ? mitte.closest('[aria-label],[role],button,a,header,aside,div')?.outerHTML.slice(0, 80) : null
      return {
        el: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}`,
        name: (el.getAttribute('aria-label') || el.innerText || el.getAttribute('placeholder') || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 50),
        rahmen: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor} +${cs.outlineOffset}`,
        box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
        verdeckt: verdecktVomKopf ? 'vom Kopf' : verdecktVon,
      }
    })
    if (!f) continue
    if (weg.length && f.el === weg[0].el && f.name === weg[0].name) break
    weg.push(f)
  }
  schreibe(`c-tastatur-${name}.json`, weg)
  await ctx.close()
  return weg
}
const tasten = {
  m390: await tastatur({ viewport: { width: 390, height: 844 } }, 'm390'),
  d1440: await tastatur({ viewport: { width: 1440, height: 900 } }, 'd1440'),
}

{
  const { ctx, page } = await seite()
  await page.goto(`${BASIS}/`)
  await page.waitForFunction(() => document.documentElement.hasAttribute('data-hydriert'))
  const ziele = await page.$$eval('a, button, input, select, textarea, summary, [role="button"]', (els) =>
    els
      .filter((el) => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden')
      .map((el) => {
        const r = el.getBoundingClientRect()
        return {
          el: el.tagName.toLowerCase(),
          name: (el.getAttribute('aria-label') || el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40),
          b: Math.round(r.width),
          h: Math.round(r.height),
          imText: !!el.closest('p') && el.tagName === 'A',
        }
      })
      .filter((z) => z.b < 44 || z.h < 44),
  )
  schreibe('c-zielgroessen-390.json', ziele)
  fs.writeFileSync(path.join(aus, 'c-zugaenglichkeitsbaum-390.yml'), await page.locator('body').ariaSnapshot())
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
  schreibe('c-axe-start-390.json', {
    verstoesse: axe.violations.map((v) => ({ id: v.id, impact: v.impact, knoten: v.nodes.length, beispiel: v.nodes[0]?.target })),
    zu_pruefen: axe.incomplete.map((v) => ({ id: v.id, knoten: v.nodes.length, beispiel: v.nodes[0]?.target, grund: v.nodes[0]?.any?.[0]?.message })),
    bestanden: axe.passes.length,
  })
  await ctx.close()
}

const umbruch = []
for (const breite of [320, 640]) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: 800 }, locale: 'de-AT' })
  const page = await ctx.newPage()
  await page.goto(`${BASIS}/`)
  umbruch.push({ breite, scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth) })
  await ctx.close()
}
for (const breite of [390, 1440]) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: 900 }, locale: 'de-AT' })
  const page = await ctx.newPage()
  await page.goto(`${BASIS}/`)
  await page.addStyleTag({
    content: '*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}',
  })
  const r = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    abgeschnitten: [...document.querySelectorAll('body *')]
      .filter((el) => {
        const cs = getComputedStyle(el)
        return (cs.overflow.includes('hidden') || cs.overflow.includes('clip')) && el.innerText?.trim() && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)
      })
      .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 3).join('.')}: ${el.innerText.trim().slice(0, 40)}`),
  }))
  umbruch.push({ breite, textabstaende: true, ...r })
  await ctx.close()
}
schreibe('c-umbruch-textabstaende.json', umbruch)

await browser.close()
console.log(`Fertig: ${aus}`)
console.log(JSON.stringify(szenarien.map((s) => [s.szenario, s.netz, s.beruehrungen, s.zeichen, s.ziel_erreicht_ms, s.hydriert_ms, s.fehler ?? s.ergebnis ?? s.href ?? s.anruf_href])))
console.log(`Tastatur: m390 ${tasten.m390.length} Stopps, d1440 ${tasten.d1440.length} Stopps`)
