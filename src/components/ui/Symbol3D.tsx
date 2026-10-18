/** Symbole mit 3D-Render (scripts/render-icons-3d.py, SPEC 3). Steuer- und Feldzeichen bleiben SVG (Icon.tsx). */
export const SYMBOLE_3D = [
  'ui-anrufen', 'ui-chat', 'ui-formular', 'ui-senden', 'ui-region', 'ui-rund-um-die-uhr',
  'ui-richtpreis', 'ui-vermittlung', 'ui-info', 'ui-haekchen', 'ui-warnung',
]

/** Breite der Dateien in public/icons: deckt 32 px bei dreifacher Pixeldichte; wie in scripts/export-3d.mjs. */
export const SYMBOL_BREITE = 96

/**
 * Dekoratives 3D-Symbol. Ein Bild erbt keine Textfarbe, darum zwei Farbstellungen:
 * Tiefsee für helle und türkise Flächen, `hell` (Türkis) für dunkle Flächen.
 * Die Bedeutung trägt immer der Text daneben oder ein aria-label am Elternelement.
 * Lädt sofort (Anruf-Knopf, Luna: sonst erscheint das Zeichen erst nach dem ersten Bildaufbau); `trage` nur weit
 * unter dem Falz (Zusagen, Fuß).
 */
export function Symbol3D({ name, hell = false, trage = false, className = '' }: { name: string; hell?: boolean; trage?: boolean; className?: string }) {
  if (!SYMBOLE_3D.includes(name)) throw new Error(`Symbol fehlt: ${name}`)
  const datei = `/icons/${name}${hell ? '-hell' : ''}-${SYMBOL_BREITE}`
  return (
    <picture className={`block shrink-0 ${className}`}>
      <source type="image/avif" srcSet={`${datei}.avif`} />
      <img src={`${datei}.webp`} width={SYMBOL_BREITE} height={SYMBOL_BREITE} alt="" loading={trage ? 'lazy' : undefined} decoding="async" className="block size-full" />
    </picture>
  )
}
