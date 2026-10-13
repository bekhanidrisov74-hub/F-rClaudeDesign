import { defineConfig } from '@playwright/test'

// Prüft den vorgerenderten Build (`npm run build`) über `vite preview`.
export default defineConfig({
  fullyParallel: true,
  forbidOnly: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    browserName: 'chromium',
    channel: 'chrome', // installiertes Google Chrome, derselbe Browser wie für Lighthouse
    deviceScaleFactor: 1,
    locale: 'de-AT',
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
  },
  projects: [
    { name: 'm390', testDir: 'tests/e2e', use: { viewport: { width: 390, height: 844 }, hasTouch: true } },
    { name: 't1024', testDir: 'tests/e2e', use: { viewport: { width: 1024, height: 768 } } },
    { name: 'd1440', testDir: 'tests/e2e', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'shots', testDir: 'tests/shots' },
  ],
})
