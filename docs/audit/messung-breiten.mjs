// Ergänzung zu messung.mjs für das Raster seit 19.10.2026: axe, Überlauf, Zielgrößen, scrollbare Bereiche und Bewegung
// auf 390, 768, 1024, 1440, 1920 und 2560 px. Aufruf: node docs/audit/messung-breiten.mjs <lauf> [basis]
import AxeBuilder from '@axe-core/playwright'
import { chromium } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const lauf = process.argv[2] ?? 'lauf'
const BASIS = process.argv[3] ?? 'http://localhost:4173'
const aus = path.resolve('docs/audit/belege', lauf)
fs.mkdirSync(aus, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const ergebnis = []

for (const breite of [390, 768, 1024, 1440, 1920, 2560]) {
  for (const seite of ['/', '/impressum/']) {
    const ctx = await browser.newContext({ viewport: { width: breite, height: breite < 800 ? 844 : 900 }, hasTouch: breite < 800, locale: 'de-AT' })
    const page = await ctx.newPage()
    await page.goto(BASIS + seite, { waitUntil: 'load' })
    await page.locator('html[data-hydriert]').waitFor({ timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(800)
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze()
    const seiten = await page.evaluate(() => {
      const de = document.documentElement
      const klein = []
      for (const e of document.querySelectorAll('a[href], button, input, select, textarea, [role=button]')) {
        const b = e.getBoundingClientRect()
        const s = getComputedStyle(e)
        if (!b.width || !b.height || s.visibility === 'hidden' || s.display === 'none') continue
        const imText = e.tagName === 'A' && getComputedStyle(e).display === 'inline' && e.parentElement && /\S/.test([...e.parentElement.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(''))
        if ((b.width < 24 || b.height < 24) && !imText && e.type !== 'hidden') klein.push({ el: e.tagName.toLowerCase(), name: (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 40), b: [Math.round(b.width), Math.round(b.height)], y: Math.round(b.y + scrollY) })
      }
      const scroll = [...document.querySelectorAll('*')].filter((e) => { const o = getComputedStyle(e).overflowX; return (o === 'auto' || o === 'scroll') && e.scrollWidth > e.clientWidth + 1 }).map((e) => ({ el: e.tagName.toLowerCase() + '.' + String(e.className).slice(0, 30), tabindex: e.getAttribute('tabindex'), role: e.getAttribute('role'), label: e.getAttribute('aria-label'), fokussierbareKinder: e.querySelectorAll('a[href],button,input,select,textarea').length }))
      return { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, klein, scroll }
    })
    // Bewegung: laufende Endlosanimationen und Canvas
    const bew = await page.evaluate(() => ({
      endlos: document.getAnimations().filter((a) => a.effect?.getComputedTiming().iterations === Infinity && a.playState === 'running').length,
      canvas: document.querySelectorAll('canvas').length,
      video: document.querySelectorAll('video').length,
    }))
    ergebnis.push({
      breite, seite,
      axe_verstoesse: axe.violations.map((v) => ({ id: v.id, impact: v.impact, knoten: v.nodes.length, bsp: v.nodes[0]?.target.join(' ') })),
      axe_pruefen: axe.incomplete.map((v) => ({ id: v.id, knoten: v.nodes.length })),
      ueberlauf_px: seiten.scrollWidth - seiten.clientWidth,
      kleine_ziele: seiten.klein,
      scrollbare_bereiche: seiten.scroll,
      bewegung: bew,
    })
    await ctx.close()
    console.log(breite, seite, 'fertig')
  }
}
// Bewegung mit prefers-reduced-motion
for (const breite of [390, 1440]) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: 900 }, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.goto(BASIS + '/', { waitUntil: 'load' })
  await page.waitForTimeout(1500)
  const bew = await page.evaluate(() => ({ endlos: document.getAnimations().filter((a) => a.effect?.getComputedTiming().iterations === Infinity && a.playState === 'running').length, canvas: document.querySelectorAll('canvas').length }))
  ergebnis.push({ reduziert: breite, bewegung: bew })
  await ctx.close()
}
fs.writeFileSync(path.join(aus, 'c-breiten.json'), JSON.stringify(ergebnis, null, 2))
await browser.close()
for (const e of ergebnis) console.log(JSON.stringify({ b: e.breite ?? 'reduziert ' + e.reduziert, s: e.seite, axe: e.axe_verstoesse?.map((v) => v.id + '×' + v.knoten), pruefen: e.axe_pruefen?.map((v) => v.id), ue: e.ueberlauf_px, klein: e.kleine_ziele?.length, scroll: e.scrollbare_bereiche?.length, bew: e.bewegung }))
