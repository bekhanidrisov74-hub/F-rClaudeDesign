/**
 * Ladeanzeige: zwölf Striche in der Schriftfarbe des Knopfs, rein dekorativ (der Text nennt den Zustand).
 * Größe über className, z. B. size-[20px]. Bei prefers-reduced-motion steht sie still (tokens.css).
 */
const STRICHE = Array.from({ length: 12 }, (_, i) => i)

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`relative inline-block shrink-0 ${className}`}>
      {STRICHE.map((i) => (
        <span
          key={i}
          className="absolute top-[46%] left-[38%] h-[8%] w-[24%] rounded-pill bg-current"
          style={{
            transform: `rotate(${i * 30}deg) translate(146%)`,
            animation: 'spinner-strich 1.2s linear infinite',
            animationDelay: `${(i - 12) / 10}s`,
          }}
        />
      ))}
    </span>
  )
}
