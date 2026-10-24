// Schreibt public/_wissen.php (Wissen der KI-Luna) aus src/luna/wissen.ts: npm run wissen. Vite lädt die TypeScript-Quellen.
import fs from 'node:fs'
import { createServer } from 'vite'

const vite = await createServer({ configFile: false, appType: 'custom', server: { middlewareMode: true }, logLevel: 'error' })
try {
  const { wissenPhp } = await vite.ssrLoadModule('/src/luna/wissen.ts')
  fs.writeFileSync('public/_wissen.php', wissenPhp())
  console.log('public/_wissen.php geschrieben')
} finally {
  await vite.close()
}
