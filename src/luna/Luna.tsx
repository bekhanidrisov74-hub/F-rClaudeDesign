import { Anstupser } from './Anstupser'
import { LunaChat } from './LunaChat'
import { LunaLauncher } from './LunaLauncher'

/**
 * Luna (SPEC 8): Anstupser, Chat (Fenster ab 640 px, Vollbild darunter) und Knopf. Der Zustand lebt in overlays.tsx.
 * Der Knopf steht zuletzt: Per Tab folgt er auf den Chat, den er öffnet und schließt.
 */
export function Luna() {
  return (
    <>
      <Anstupser />
      <LunaChat />
      <LunaLauncher />
    </>
  )
}
