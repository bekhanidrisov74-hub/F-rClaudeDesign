/** Dekorative Bildserie laut IMAGE-BRIEFS.md; Maße und Zuschnitt kommen vom Aufrufer. `quer`: 16:9-Quelle (1254 × 703). */
export function Bildflaeche({ bild, fokus, quer = false, className = '' }: { bild: number; fokus?: string; quer?: boolean; className?: string }) {
  const sizes = quer
    // Karten wie unten; ab 920 px (4:3-Zuschnitt) folgt die Bildbreite der Rahmenhöhe: Rahmenbreite × 4/3
    ? '(min-width: 1188px) 486px, (min-width: 1116px) calc((100vw - 96px) / 3 * 4 / 3), (min-width: 920px) calc((100vw - 72px) / 2 * 4 / 3), (min-width: 752px) calc((100vw - 72px) / 2), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)'
    // Karten wie das Raster in Leistungen.tsx: auto-fill ab 340 px, Abstand 24 px, Rand 16/24 px, Inhalt höchstens 1140 px
    : '(min-width: 1188px) 364px, (min-width: 1116px) calc((100vw - 96px) / 3), (min-width: 752px) calc((100vw - 72px) / 2), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)'
  const srcSet = (format: string) => [480, 800, 1200, 1254]
    .map(width => `/images/bild-${bild}${width === 1254 ? '' : `-${width}`}.${format} ${width}w`)
    .join(', ')

  return (
    <div aria-hidden="true" data-bild={bild} className={`relative overflow-clip bg-tuerkis ${className}`}>
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
