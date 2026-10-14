import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { lokaleApi } from './tools/lokale-api.ts'

export default defineConfig(({ isPreview }) => ({
  plugins: [react(), tailwindcss(), lokaleApi()],
  // Build-Jahr als Konstante: gleicher Wert beim Vorrendern und Hydrieren.
  define: { __JAHR__: JSON.stringify(new Date().getFullYear()) },
  // In der Vorschau wie auf Vercel: /impressum → impressum.html, unbekannte Pfade → 404.
  appType: isPreview ? 'mpa' : 'spa',
  preview: { port: Number(process.env.PW_PORT ?? 4173), strictPort: true },
  test: {
    include: ['src/**/*.test.{ts,tsx}', 'tests/unit/**/*.test.{ts,tsx}'],
    environment: 'node',
  },
}))
