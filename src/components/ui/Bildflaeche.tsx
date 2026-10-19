/** Dekorative Bildserie laut IMAGE-BRIEFS.md; Maße und Zuschnitt kommen vom Aufrufer. `quer`: 16:9-Quelle (1254 × 703). */
export function Bildflaeche({ bild, fokus, quer = false, className = '' }: { bild: number; fokus?: string; quer?: boolean; className?: string }) {
  // Kartenbreite wie im Raster der Leistungen (Leistungen.tsx): auto-fill ab 340 px, Abstand 24 px. Inhalt: unter 1280 px
  // Fenster − 32 px, bis 1534 px Fenster − 180 Entwurfs-px (88,27 vw), bis 1586 px Fenster − 180 px, darüber 1406 px.
  // Eine Spalte unter 736 px, zwei bis 1099 px, drei ab 1100 px (Karte 453 px bei 1406 px Inhalt).
  // `quer`: ab 920 px (4:3-Zuschnitt) folgt die Bildbreite der Rahmenhöhe: Kartenbreite × 4/3.
  const sizes = quer
    ? '(min-width: 1586px) 604px, (min-width: 1534px) calc((100vw - 228px) / 3 * 4 / 3), (min-width: 1280px) calc((88.27vw - 48px) / 3 * 4 / 3), (min-width: 1100px) calc((100vw - 80px) / 3 * 4 / 3), (min-width: 920px) calc((100vw - 56px) / 2 * 4 / 3), (min-width: 736px) calc((100vw - 56px) / 2), calc(100vw - 32px)'
    : '(min-width: 1586px) 453px, (min-width: 1534px) calc((100vw - 228px) / 3), (min-width: 1280px) calc((88.27vw - 48px) / 3), (min-width: 1100px) calc((100vw - 80px) / 3), (min-width: 736px) calc((100vw - 56px) / 2), calc(100vw - 32px)'
  const srcSet = (format: string) => [480, 800, 1200, 1254]
    .map(width => `/images/bild-${bild}${width === 1254 ? '' : `-${width}`}.${format} ${width}w`)
    .join(', ')

  return (
    <div aria-hidden="true" data-bild={bild} className={`relative overflow-clip bg-eis ${className}`}>
      <picture>
        <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
        <img
          src={`/images/bild-${bild}.webp`}
          srcSet={srcSet('webp')}
          sizes={sizes}
          width={1254}
          height={quer ? 703 : 1254}
          alt=""
          loading="lazy"
          decoding="async"
          style={fokus ? { objectPosition: fokus } : undefined}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>
    </div>
  )
}
