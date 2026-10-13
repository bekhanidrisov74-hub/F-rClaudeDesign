import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ isPreview }) => ({
  plugins: [react(), tailwindcss()],
  // In der Vorschau wie auf Vercel: /impressum → impressum.html, unbekannte Pfade → 404.
  appType: isPreview ? 'mpa' : 'spa',
  preview: { port: 4173, strictPort: true },
  test: {
    include: ['src/**/*.test.{ts,tsx}', 'tests/unit/**/*.test.{ts,tsx}'],
    environment: 'node',
  },
}))
