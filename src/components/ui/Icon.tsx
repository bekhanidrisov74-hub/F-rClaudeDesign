// Alle Icons der Seite als flache SVGs direkt aus design/icons (eine Quelle, keine Kopien), in currentColor, im Stil des Hero.
const dateien = import.meta.glob<string>('/design/icons/*.svg', { query: '?raw', import: 'default', eager: true })

export const icons: Record<string, string> = Object.fromEntries(
  Object.entries(dateien).map(([pfad, svg]) => [pfad.slice(pfad.lastIndexOf('/') + 1, -'.svg'.length), svg]),
)

/** Dekoratives Icon. Die Bedeutung trägt immer der Text daneben oder ein aria-label am Elternelement. */
export function Icon({ name, className = '' }: { name: string; className?: string }) {
  const svg = icons[name]
  if (!svg) throw new Error(`Icon fehlt: ${name}`)
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 [&>svg]:block [&>svg]:size-full ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
