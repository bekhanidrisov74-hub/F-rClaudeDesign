import { Icon } from '../components/ui/Icon'
import { copy } from '../content/copy'
import { useOverlays } from '../overlays'

/**
 * Runder Luna-Knopf (SPEC 8). Das Label bleibt immer gleich, nur aria-expanded und das Icon wechseln.
 * Am Handy liegt das Vollbild darüber, dort bleibt das Signet stehen.
 */
export function LunaLauncher() {
  const { lunaOffen, oeffneLuna, schliesseLuna } = useOverlays()
  return (
    <button
      id="luna-knopf"
      type="button"
      aria-label={copy.luna.oeffnen}
      aria-expanded={lunaOffen}
      aria-controls="luna-chat"
      onClick={lunaOffen ? schliesseLuna : oeffneLuna}
      className="fixed right-s4 bottom-s4 z-8 flex size-[58px] cursor-pointer items-center justify-center rounded-pill bg-tiefsee text-kalk shadow-m dialog:right-[28px] dialog:bottom-[28px] dialog:size-[64px]"
    >
      {lunaOffen && <Icon name="ui-schliessen" className="size-[26px] max-dialog:hidden" />}
      <Icon name="luna-signet-glyph" className={`size-[29px] dialog:size-[32px] ${lunaOffen ? 'dialog:hidden' : ''}`} />
    </button>
  )
}
