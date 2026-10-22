import type { ReactNode } from 'react'
import { Icon } from './Icon'

/**
 * Eine Zeile aus Radio oder Checkbox im Stil der Einwilligung im AnfrageFormular: Die Zeile ist mindestens 44 px hoch, das
 * unsichtbare 44-px-Feld über dem gezeichneten 24-px-Kästchen ist die Trefferfläche. Gewählt ist Tiefsee, Radios sind rund.
 */
export function Auswahl({
  art,
  name,
  id,
  value,
  defaultChecked,
  children,
}: {
  art: 'radio' | 'checkbox'
  name: string
  id: string
  value: string
  defaultChecked?: boolean
  children: ReactNode
}) {
  const rund = art === 'radio'
  return (
    <label className="group flex min-h-[44px] cursor-pointer items-center gap-s2 text-body">
      <span className="relative -mr-s4 flex size-[44px] shrink-0 items-center justify-start">
        <input
          id={id}
          name={name}
          type={art}
          value={value}
          defaultChecked={defaultChecked}
          className="peer absolute inset-0 size-full cursor-pointer appearance-none focus-visible:outline-none"
        />
        {/* Gezeichnetes Kästchen bzw. Kreis; das Innere wird über den Zustand der Eingabe davor sichtbar */}
        <span
          aria-hidden="true"
          className={`rahmen pointer-events-none flex size-[24px] items-center justify-center border-rand bg-weiss transition-[border-color,background-color] group-hover:border-tiefsee group-data-fehler/g:border-tiefsee peer-checked:border-tiefsee peer-checked:bg-tiefsee peer-checked:[&>span]:visible peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-tiefsee ${
            rund ? 'rounded-pill' : 'rounded-ecke'
          }`}
        >
          {rund ? (
            <span className="invisible size-[10px] rounded-pill bg-weiss" />
          ) : (
            <Icon name="ui-haekchen" className="invisible size-[20px] text-weiss" />
          )}
        </span>
      </span>
      <span>{children}</span>
    </label>
  )
}
