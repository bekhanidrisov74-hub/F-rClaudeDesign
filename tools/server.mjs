// Vorschau des Builds mit lokaler API (tools/lokale-api.ts): node tools/server.mjs [port]
// Mit Schlüssel: node --env-file=.env tools/server.mjs 8080 (leitet /api/chat echt an OpenAI weiter).
import { preview } from 'vite'

const server = await preview({ preview: { port: Number(process.argv[2] ?? 8080), strictPort: true } })
server.printUrls()
