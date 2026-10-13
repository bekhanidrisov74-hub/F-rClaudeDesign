/**
 * Bildfläche: bis die Bilder da sind eine ruhige Türkis-Fläche ohne Text (IMAGE-BRIEFS.md).
 * ponytail: später hier <picture> mit public/images/bild-{bild}.avif/.webp, Seitenverhältnis kommt vom Aufrufer.
 */
export function Bildflaeche({ bild, className = '' }: { bild: number; className?: string }) {
  return <div aria-hidden="true" data-bild={bild} className={`bg-tuerkis ${className}`} />
}
