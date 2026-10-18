import {
  Box3,
  Color,
  DoubleSide,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  ShadowMaterial,
  SpotLight,
  Texture,
  PCFShadowMap,
  Vector3,
  WebGLRenderer,
  type Material,
} from 'three'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

/**
 * Live-Bühne für eine Szene aus public/modelle (scripts/render-bilder-3d.py --glb): dieselbe Kamera und dasselbe
 * Licht wie im Blender-Render, damit das erste Bild dem Standbild darunter gleicht. Danach dreht sich die Kamera
 * beim Scrollen und unter dem Zeiger ein paar Grad um den Blickpunkt. Gezeichnet wird nur, wenn sich etwas ändert.
 */

/** Anteil der Softbox, der als leuchtende Fläche in der Umgebung wirkt (weich, ohne Schatten); der Rest ist ein Spot mit
 * Schatten. */
const WEICH = 0.4
/** Subsurface der Haut (Cycles) als etwas Eigenleuchten: hellt Kinn und Schattenseite des Gesichts auf. */
const HAUT_STREU = 0.12
/** Glanzpunkte der Lackschicht nie härter als diese Rauheit: in Cycles sind sie Spiegelbilder der 4,5-m-Softbox. */
const LACK_RAUHEIT = 0.35
/** Höchstens so weit dreht die Kamera um den Blickpunkt (Grad). */
const SCHWENK = { scroll: 7, zeiger: 5, neigung: 3 }

/** wand: Bild der Wand mit Lichtkegel; es liegt auf wandFlaeche hinter der Zeichenfläche. Als Hintergrund des Canvas
 * selbst malt Chrome es nach dem Anlegen des WebGL-Kontexts nicht mehr neu. */
type Optionen = { url: string; wand: string; wandFlaeche: HTMLElement; bild: HTMLImageElement; bereit: () => void }

export function buehne(huelle: HTMLCanvasElement, { url, wand, wandFlaeche, bild, bereit }: Optionen) {
  const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const renderer = new WebGLRenderer({ canvas: huelle, antialias: true, alpha: true, powerPreference: 'low-power' })
  // Immer doppelt gerechnet: glättet auf einfachen Bildschirmen die Kanten, mehr bringt auf Handys nichts
  renderer.setPixelRatio(2)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFShadowMap

  const szene = new Scene()
  const pmrem = new PMREMGenerator(renderer)

  let kamera = new PerspectiveCamera()
  const blick = new Vector3()
  const basis = new Vector3()
  let geladen = false
  let aus = false
  let sichtbar = false

  // Schwenk: Ziel aus Scroll und Zeiger, Ist folgt weich. Das erste Bild steht wie das Standbild (0°), danach gleitet
  // die Kamera zum Ziel.
  const ziel = { gier: 0, neigung: 0 }
  const ist = { gier: 0, neigung: 0 }
  let zeiger = { x: 0, y: 0 }
  let rahmen = 0
  let spiegel: Texture | undefined
  let erstesBild: (() => void) | undefined = bereit

  // Wand und Kegel ohne Motiv aus derselben Blender-Szene; geladen, bevor das erste Bild erscheint
  const wandBild = new Image()
  wandBild.src = wand
  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(url, async (gltf) => {
    await wandBild.decode().catch(() => undefined)
    if (aus) return
    wandFlaeche.style.backgroundImage = `url("${wand}")`
    gltf.scene.updateMatrixWorld(true)
    const cam = gltf.cameras[0] as PerspectiveCamera
    kamera = cam.clone()
    cam.getWorldPosition(basis)
    blick.fromArray(cam.userData.blick as number[])
    gltf.scene.traverse((o) => {
      if (o instanceof Mesh) {
        o.castShadow = o.receiveShadow = true
        for (const m of [o.material].flat() as Material[]) {
          if (m instanceof MeshPhysicalMaterial && m.clearcoat) m.clearcoatRoughness = Math.max(m.clearcoatRoughness, LACK_RAUHEIT)
          if (m instanceof MeshStandardMaterial && m.userData.haut) m.emissive.copy(m.color).multiplyScalar(HAUT_STREU)
        }
      }
      // Lampen der Szene (Taschenlampen) kommen in Blender-Watt: Ein Spot strahlt P / (4π) je Raumwinkel
      if (o instanceof SpotLight) o.intensity /= 4 * Math.PI
    })
    szene.add(gltf.scene)

    // Licht wie in Blender: Softbox links oben vorne, Aufhellung rechts, Welt Tiefsee. Das türkise Streiflicht aus
    // lichter() fehlt: Es steht dort hinter der Hohlkehle und kommt im Render nicht an.
    // Jede Lampe ist ein Spot am selben Ort wie in Cycles (Glanz und Schatten bleiben dort, wo sie im Render sind).
    // Die große Softbox leuchtet zusätzlich als Fläche in der Umgebung: weiche Schattenseiten und ihr Spiegelbild im Chrom.
    const box = new Box3().setFromObject(gltf.scene)
    const radius = box.getSize(new Vector3()).length() / 2
    const oben = new Vector3(0, 1, 0)
    const vorne = blick.clone().sub(basis).setY(0).normalize()
    const rechts = vorne.clone().cross(oben)
    const ort = (f: number, r: number, o: number) => blick.clone().addScaledVector(vorne, f).addScaledVector(rechts, r).addScaledVector(oben, o)
    const weiss = new Color(token('--fx-weiss'))
    const studio = new Scene()
    studio.background = new Color(token('--fx-tiefsee'))
    // Flächenlampe aus Cycles mit Leistung watt und Kantenlänge groesse: Leuchtdichte P / (π A), Lichtstärke P / π
    const licht = (farbe: Color, watt: number, groesse: number, pos: Vector3, auf = blick, weich = 0) => {
      if (weich) {
        const flaeche = new Mesh(new PlaneGeometry(groesse, groesse), new MeshBasicMaterial({ side: DoubleSide }))
        flaeche.material.color.copy(farbe).multiplyScalar((weich * watt) / (Math.PI * groesse ** 2))
        flaeche.position.copy(pos).sub(auf)
        flaeche.lookAt(0, 0, 0)
        studio.add(flaeche)
      }
      const winkel = Math.min(Math.atan(radius / pos.distanceTo(auf)) * 1.6, Math.PI / 3)
      const l = new SpotLight(farbe, ((1 - weich) * watt) / Math.PI, 0, winkel, 0.5, 2)
      l.position.copy(pos)
      l.target.position.copy(auf)
      szene.add(l, l.target)
      return l
    }
    const softbox = licht(weiss, 1300, 4.5, ort(-3.5, -3.2, 4.2), blick, WEICH)
    licht(weiss, 260, 5, ort(-4, 3.5, 1.2))
    szene.environment = pmrem.fromScene(studio).texture
    // Shader im Hintergrund übersetzen (KHR_parallel_shader_compile), damit das erste Bild das Scrollen nicht blockiert
    await renderer.compileAsync(szene, kamera)
    if (aus) return
    // Chrom wie in Cycles: Die beleuchtete Szene samt Softbox einmal dort aufnehmen, wo das Metall ist (Schwerpunkt der
    // Metallteile, nach Größe gewichtet), und nur den Metallen als Umgebung geben. So spiegeln sie Hemd, Arbeitsplatte
    // und Softbox wie im Render. Alles andere bleibt bei der Studio-Umgebung, sonst hellt die nahe Figur sich selbst auf.
    const flaeche = studio.children[0] as Mesh<PlaneGeometry, MeshBasicMaterial>
    flaeche.position.copy(softbox.position)
    flaeche.lookAt(blick)
    szene.add(flaeche)
    szene.background = studio.background
    const metalle: Mesh[] = []
    gltf.scene.traverse((o) => {
      if (o instanceof Mesh && o.material instanceof MeshStandardMaterial && o.material.metalness >= 0.5) metalle.push(o)
    })
    const metall = new Vector3()
    let gewicht = 0
    for (const o of metalle) {
      const b = new Box3().setFromObject(o)
      const g = b.getSize(new Vector3()).length()
      metall.addScaledVector(b.getCenter(new Vector3()), g)
      gewicht += g
    }
    if (gewicht) metall.divideScalar(gewicht)
    else metall.copy(blick)
    const gespiegelt = pmrem.fromScene(szene, 0, 0.05, 50, { position: metall }).texture
    spiegel = gespiegelt
    szene.background = null
    szene.remove(flaeche)
    flaeche.geometry.dispose()
    flaeche.material.dispose()
    for (const o of metalle) (o.material as MeshStandardMaterial).envMap = gespiegelt

    // Weicher Schatten der Softbox; der Boden fängt nur den Schatten (die Wand zeichnet die Seite)
    softbox.castShadow = true
    softbox.shadow.mapSize.set(1024, 1024)
    softbox.shadow.radius = 10   // weich wie die große Softbox
    softbox.shadow.intensity = 0.7   // die 4,5-m-Softbox und Subsurface der Haut lassen in Cycles kaum harte Schatten
    softbox.shadow.bias = -0.0005
    softbox.shadow.normalBias = 0.03   // sonst Schattenakne als Punktraster auf Haut, Hemd und Kappe
    softbox.shadow.camera.near = 1
    softbox.shadow.camera.far = softbox.position.distanceTo(blick) + radius * 2
    const boden = new Mesh(new PlaneGeometry(radius * 6, radius * 6).rotateX(-Math.PI / 2), new ShadowMaterial({ opacity: 0.25 }))
    boden.position.set(blick.x, box.min.y + 0.001, blick.z)
    boden.receiveShadow = true
    szene.add(boden)

    geladen = true
    groesse()
    zeichnen()
  })

  /** Wie object-fit: cover mit der object-position des Standbilds: das Quadrat füllt die Fläche, der Rest ragt hinaus. */
  function groesse() {
    const b = huelle.clientWidth
    const h = huelle.clientHeight
    if (!b || !h) return
    renderer.setSize(b, h, false)
    const s = Math.max(b, h)
    const lage = getComputedStyle(bild).objectPosition
    wandFlaeche.style.backgroundPosition = lage   // Wandbild wie das Standbild zugeschnitten
    const [px, py] = lage.split(' ').map((w) => (w.endsWith('%') ? parseFloat(w) / 100 : 0.5))
    kamera.aspect = 1
    kamera.setViewOffset(s, s, (s - b) * (px ?? 0.5), (s - h) * (py ?? 0.5), b, h)
    kamera.updateProjectionMatrix()
  }

  function scrollZiel() {
    const r = huelle.getBoundingClientRect()
    const t = MathUtils.clamp(((r.top + r.height / 2) / innerHeight) * 2 - 1, -1, 1)
    ziel.gier = -t * SCHWENK.scroll + zeiger.x * SCHWENK.zeiger
    ziel.neigung = zeiger.y * SCHWENK.neigung
  }

  function zeichnen() {
    if (rahmen || !geladen || !sichtbar) return
    rahmen = requestAnimationFrame(() => {
      rahmen = 0
      ist.gier += (ziel.gier - ist.gier) * 0.12
      ist.neigung += (ziel.neigung - ist.neigung) * 0.12
      const versatz = basis.clone().sub(blick)
      const quer = versatz.clone().cross(new Vector3(0, 1, 0)).normalize()
      versatz.applyAxisAngle(quer, MathUtils.degToRad(ist.neigung)).applyAxisAngle(new Vector3(0, 1, 0), MathUtils.degToRad(ist.gier))
      kamera.position.copy(blick).add(versatz)
      kamera.lookAt(blick)
      kamera.updateMatrixWorld()
      renderer.render(szene, kamera)
      erstesBild?.()
      erstesBild = undefined
      if (Math.abs(ziel.gier - ist.gier) > 0.01 || Math.abs(ziel.neigung - ist.neigung) > 0.01) zeichnen()
    })
  }

  const beimScrollen = () => {
    scrollZiel()
    zeichnen()
  }
  const beimZeiger = (e: PointerEvent) => {
    const r = huelle.getBoundingClientRect()
    zeiger = e.type === 'pointerleave' ? { x: 0, y: 0 } : { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: ((e.clientY - r.top) / r.height) * 2 - 1 }
    beimScrollen()
  }
  const sicht = new IntersectionObserver(([e]) => {
    sichtbar = !!e?.isIntersecting
    beimScrollen()
  })
  sicht.observe(huelle)
  const masse = new ResizeObserver(() => {
    groesse()
    zeichnen()
  })
  masse.observe(huelle)
  const zeigerFlaeche = wandFlaeche
  addEventListener('scroll', beimScrollen, { passive: true })
  if (matchMedia('(hover: hover)').matches) {
    zeigerFlaeche.addEventListener('pointermove', beimZeiger)
    zeigerFlaeche.addEventListener('pointerleave', beimZeiger)
  }

  return () => {
    aus = true
    cancelAnimationFrame(rahmen)
    sicht.disconnect()
    masse.disconnect()
    removeEventListener('scroll', beimScrollen)
    zeigerFlaeche.removeEventListener('pointermove', beimZeiger)
    zeigerFlaeche.removeEventListener('pointerleave', beimZeiger)
    szene.traverse((o) => {
      if (!(o instanceof Mesh)) return
      o.geometry.dispose()
      for (const m of [o.material].flat() as Material[]) m.dispose()
    })
    szene.environment?.dispose()
    spiegel?.dispose()
    pmrem.dispose()
    renderer.dispose()
  }
}
