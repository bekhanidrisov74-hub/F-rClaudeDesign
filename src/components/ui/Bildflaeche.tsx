/** Dekorative Bildserie laut IMAGE-BRIEFS.md; Maße und Zuschnitt kommen vom Aufrufer. */
export function Bildflaeche({ bild, className = '' }: { bild: number; className?: string }) {
  const hero = bild === 1
  const sizes = hero
    ? '(min-width: 1440px) calc(50vw - 50px), (min-width: 920px) 50vw, 100vw'
    : '(min-width: 1200px) 365px, (min-width: 920px) 33vw, 100vw'
  const srcSet = (format: string) => [480, 800, 1200, 2400]
    .map(width => `/images/bild-${bild}${width === 2400 ? '' : `-${width}`}.${format} ${width}w`)
    .join(', ')

  return (
    <div aria-hidden="true" data-bild={bild} className={`relative overflow-hidden bg-tuerkis ${className}`}>
      <picture>
        <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
        <img
          src={`/images/bild-${bild}.webp`}
          srcSet={srcSet('webp')}
          sizes={sizes}
          width={2400}
          height={2400}
          alt=""
          loading={hero ? 'eager' : 'lazy'}
          fetchPriority={hero ? 'high' : 'auto'}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>
    </div>
  )
}
