import { defineConfig } from '@playwright/test'

// PW_PORT erlaubt parallele Läufe in mehreren Worktrees, ohne fremde Server zu treffen.
const PORT = Number(process.env.PW_PORT ?? 4173)

// Prüft den vorgerenderten Build (`npm run build`) über `vite preview`.
export default defineConfig({
  fullyParallel: true,
  forbidOnly: true,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    browserName: 'chromium',
    channel: 'chrome', // installiertes Google Chrome, derselbe Browser wie für Lighthouse
    deviceScaleFactor: 1,
    locale: 'de-AT',
  },
  webServer: {
    command: 'npm run preview',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
  },
  projects: [
    { name: 'm390', testDir: 'tests/e2e', use: { viewport: { width: 390, height: 844 }, hasTouch: true } },
    { name: 't1024', testDir: 'tests/e2e', use: { viewport: { width: 1024, height: 768 } } },
    { name: 'd1440', testDir: 'tests/e2e', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'shots', testDir: 'tests/shots' },
  ],
})
