import type { Gewerk } from '../../content/gewerke'

/** Exportbreiten aus scripts/export-3d.mjs: doppelte Anzeigegröße von 40, 56 und 64 px (SPEC 3). */
export const BREITEN = [80, 112, 128]

/**
 * Gewerke-Icon als 3D-Render ohne Fläche dahinter (SPEC 3). Dekorativ: den Namen trägt der Text daneben.
 * `sizes` nennt die Anzeigegröße, damit der Browser die passende Breite lädt; die Größe selbst setzt `className` am <picture>
 * (ein Block, kein `contents`: sonst würde <source> ein eigenes Flex-Kind und belegte einen Abstand).
 * Lädt sofort (Schnellwahl über dem Falz); `trage` nur im geschlossenen Dialog der Preisübersicht.
 */
export function GewerkIcon({ gewerk, sizes, trage = false, className = '' }: { gewerk: Gewerk; sizes: string; trage?: boolean; className?: string }) {
  const srcSet = (format: string) => BREITEN.map((b) => `/icons/${gewerk.icon}-${b}.${format} ${b}w`).join(', ')
  return (
    <picture className={`block shrink-0 ${className}`}>
      <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
      <img
        src={`/icons/${gewerk.icon}-128.webp`}
        srcSet={srcSet('webp')}
        sizes={sizes}
        width={128}
        height={128}
        alt=""
        loading={trage ? 'lazy' : undefined}
        decoding="async"
        className="block size-full"
      />
    </picture>
  )
}
