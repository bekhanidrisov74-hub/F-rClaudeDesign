// Befund A2: Konsole während der Hydrierung (Hinweis auf verworfene Hydrierung). Aufruf: node docs/audit/probe-konsole.mjs
import { chromium } from '@playwright/test'
const b = await chromium.launch({ channel: 'chrome' })
const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'de-AT' })).newPage()
page.on('console', (m) => console.log(`[${m.type()}] ${m.text().slice(0, 400)}`))
page.on('pageerror', (e) => console.log(`[pageerror] ${e.message.slice(0, 400)}`))
await page.goto('http://localhost:4173/')
await page.waitForFunction(() => document.documentElement.hasAttribute('data-hydriert'))
await page.waitForTimeout(500)
console.log('fertig')
await b.close()
