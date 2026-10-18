import {
  Box3,
  Color,
  DoubleSide,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  ShadowMaterial,
  SpotLight,
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
/** Der weiche Rand des Kegels (Blend 1, große Lampe) reicht so weit über den Kegelwinkel hinaus. */
const HOF = 2.4
/** Höchstens so weit dreht die Kamera um den Blickpunkt (Grad). */
const SCHWENK = { scroll: 7, zeiger: 5, neigung: 3 }

type Optionen = { url: string; bild: HTMLImageElement; bereit: () => void }

export function buehne(huelle: HTMLCanvasElement, { url, bild, bereit }: Optionen) {
  const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const renderer = new WebGLRenderer({ canvas: huelle, antialias: true, alpha: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFShadowMap

  const szene = new Scene()
  const pmrem = new PMREMGenerator(renderer)

  let kamera = new PerspectiveCamera()
  const blick = new Vector3()
  const kegel = new Vector3()
  const kegelRand = new Vector3()
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
  let erstesBild: (() => void) | undefined = bereit

  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(url, (gltf) => {
    if (aus) return
    gltf.scene.updateMatrixWorld(true)
    const cam = gltf.cameras[0] as PerspectiveCamera
    kamera = cam.clone()
    cam.getWorldPosition(basis)
    blick.fromArray(cam.userData.blick as number[])
    kegel.fromArray(cam.userData.kegel as number[])
    gltf.scene.traverse((o) => {
      if (o instanceof Mesh) o.castShadow = o.receiveShadow = true
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
    kegelRand.copy(kegel).addScaledVector(rechts, (cam.userData.kegelradius as number) * HOF)
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
    studio.traverse((o) => {
      if (o instanceof Mesh) o.geometry.dispose()
    })

    // Weicher Schatten der Softbox; der Boden fängt nur den Schatten (die Wand zeichnet die Seite)
    softbox.castShadow = true
    softbox.shadow.mapSize.set(1024, 1024)
    softbox.shadow.radius = 4
    softbox.shadow.bias = -0.0002
    softbox.shadow.normalBias = 0.01
    softbox.shadow.camera.near = 1
    softbox.shadow.camera.far = softbox.position.distanceTo(blick) + radius * 2
    const boden = new Mesh(new PlaneGeometry(radius * 6, radius * 6).rotateX(-Math.PI / 2), new ShadowMaterial({ opacity: 0.35 }))
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
    const [px, py] = getComputedStyle(bild).objectPosition.split(' ').map((w) => (w.endsWith('%') ? parseFloat(w) / 100 : 0.5))
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
      // Türkiser Lichtkegel der Wand hinter der Figur: dort, wo der Kegel im Render die Wand trifft
      const k = kegel.clone().project(kamera)
      const r = kegelRand.clone().project(kamera)
      huelle.style.setProperty('--kx', `${((k.x + 1) / 2) * 100}%`)
      huelle.style.setProperty('--ky', `${((1 - k.y) / 2) * 100}%`)
      huelle.style.setProperty('--kr', `${(Math.hypot(r.x - k.x, r.y - k.y) / 2) * huelle.clientWidth}px`)
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
  const zeigerFlaeche = huelle.parentElement ?? huelle
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
    pmrem.dispose()
    renderer.dispose()
  }
}
