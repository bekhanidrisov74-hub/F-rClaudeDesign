// PLZ-Verzeichnis (src/content/plz.json, erzeugt mit scripts/plz.mjs). Rund 18 KB gzip: wird erst geladen,
// wenn Luna es braucht (eigener Chunk), nicht mit der Startseite.
let liste: Promise<Readonly<Record<string, string>>> | undefined

export const ladePlz = () => (liste ??= import('../content/plz.json').then((m) => m.default as Record<string, string>))
