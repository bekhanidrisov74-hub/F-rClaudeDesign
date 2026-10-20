/** Dekorative Fotoserie laut IMAGE-BRIEFS.md (Quelle 1536 × 1024, 3:2); Maße und Zuschnitt kommen vom Aufrufer. */
export function Bildflaeche({ bild, fokus, className = '' }: { bild: number; fokus?: string; className?: string }) {
  // Kartenbreite wie im Raster der Leistungen (Leistungen.tsx): auto-fill ab 340 px, Abstand 24 px. Inhalt: unter 1280 px
  // Fenster − 32 px, bis 1534 px Fenster − 180 Entwurfs-px (88,27 vw), bis 1586 px Fenster − 180 px, darüber 1406 px.
  // Unter 736 px Wischreihe (app.css, wischreihe): Karte 84 % des Inhalts, höchstens 26rem. Zwei Spalten bis 1099 px, drei ab
  // 1100 px (Karte 453 px bei 1406 px Inhalt).
  // Unter 736 px und ab 920 px schneidet die Karte 4:3 zu: das 3:2-Foto folgt dann der Rahmenhöhe, Bildbreite = Kartenbreite × 9/8.
  // Dazwischen (zwei Spalten) 16:9: das Foto füllt die Breite.
  const sizes = '(min-width: 1586px) 510px, (min-width: 1534px) calc((100vw - 228px) / 3 * 9 / 8), (min-width: 1280px) calc((88.27vw - 48px) / 3 * 9 / 8), (min-width: 1100px) calc((100vw - 80px) / 3 * 9 / 8), (min-width: 920px) calc((100vw - 56px) / 2 * 9 / 8), (min-width: 736px) calc((100vw - 56px) / 2), min(calc((100vw - 32px) * 0.84 * 9 / 8), 468px)'
  const srcSet = (format: string) => [480, 800, 1200, 1536]
    .map(width => `/images/bild-${bild}${width === 1536 ? '' : `-${width}`}.${format} ${width}w`)
    .join(', ')

  return (
    <div aria-hidden="true" data-bild={bild} className={`relative overflow-clip bg-eis ${className}`}>
      <picture>
        <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
        <img
          src={`/images/bild-${bild}.webp`}
          srcSet={srcSet('webp')}
          sizes={sizes}
          width={1536}
          height={1024}
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
