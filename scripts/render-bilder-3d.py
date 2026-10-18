"""Bilder 1–6 als 3D-Renders: Fachleute bei der Arbeit im Tiefsee-Studio (design/IMAGE-BRIEFS.md).

Aufruf (alle oder einzelne Bilder; --vorschau rendert 600 px schnell, --pruefen 1200 px für Details wie Hände,
beide in den Temp-Ordner fixit247-vorschau):
  "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b --factory-startup --python-exit-code 1 -P scripts/render-bilder-3d.py [-- --vorschau bild-1 ...]
Danach exportiert scripts/export-3d.mjs die Dateien für die Seite.

Bühne für alle gleich: dunkle Hohlkehle in Tiefsee, ein gedämpfter türkiser Lichtkegel hinter der Figur,
Softbox von links oben, schmales türkises Streiflicht von rechts hinten, 50-mm-Objektiv.
Jede Szene (scripts/blender/szenen/bild_N.py) baut nur Figur und Requisiten und nennt Kamera und Kegel.
Ausgabe: design/bilder-3d/bild-N.png, 2400 × 2400, Motiv mittig mit Luft für die Zuschnitte.
Mit --glb statt Render die Szenen als 3D-Objekte für die Seite: public/modelle/bild-N.glb (three.js, Szene3D.tsx).
"""
import importlib
import math
import subprocess
import sys
import tempfile
from pathlib import Path

import bmesh
import bpy
from mathutils import Vector

sys.path.insert(0, str(Path(__file__).resolve().parent / 'blender'))
from fx3d import ROOT, TIEFSEE, TUERKIS, farbe, linear, material, objekt, ziel  # noqa: E402

BILDER = [f'bild-{n}' for n in range(1, 7)]
AUSGABE = ROOT / 'design' / 'bilder-3d'
PIXEL, PROBEN = 2400, 256
VORSCHAU_PIXEL, VORSCHAU_PROBEN = 600, 64
PRUEF_PIXEL, PRUEF_PROBEN = 1200, 128
WAND_PIXEL, WAND_PROBEN = 1200, 64
OBJEKTIV = 50
AO_WEITE, AO_STAERKE, AO_PROBEN = 0.2, 0.6, 64   # Umgebungsverdeckung für die GLB: Reichweite (m), Anteil, Proben
AO_HAUT = 0.3                                     # Haut schwächer: Subsurface hellt in Cycles die Schattenseiten auf
GLB_FEIN = 1 / 3  # Rundungen mit einem Drittel der Segmente: ~200–300 KB je Szene


def hohlkehle(wand_y=2.0, radius=0.9):
    """Boden, Rundung und Rückwand in einem Stück: matt, Tiefsee, ohne Kante."""
    profil = [(y, 0.0) for y in (-12, wand_y - radius)]
    profil += [(wand_y - radius + radius * math.sin(a), radius - radius * math.cos(a))
               for a in (math.pi / 2 * i / 16 for i in range(1, 17))]
    profil += [(wand_y, 9.0)]
    bm = bmesh.new()
    links = [bm.verts.new((-14, y, z)) for y, z in profil]
    rechts = [bm.verts.new((14, y, z)) for y, z in profil]
    for i in range(len(profil) - 1):
        bm.faces.new((links[i], rechts[i], rechts[i + 1], links[i + 1]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return objekt('Hohlkehle', bm, material(TIEFSEE, rauheit=0.85, glanz=0.0))


def licht(name, art, ort, auf, staerke, groesse=1.0, farbe_hex='#FFFFFF', kegel=None):
    ld = bpy.data.lights.new(name, art)
    ld.energy = staerke
    ld.color = linear(farbe_hex)[:3]
    if art == 'AREA':
        ld.size = groesse
    if art == 'SPOT':
        ld.spot_size, ld.spot_blend, ld.shadow_soft_size = math.radians(kegel), 1.0, groesse
    ob = bpy.data.objects.new(name, ld)
    bpy.context.scene.collection.objects.link(ob)
    ziel(ob, ort, auf)
    return ob


def buehne(pixel, proben):
    s = bpy.context.scene
    for ob in list(s.objects):
        bpy.data.objects.remove(ob)
    s.render.engine = 'CYCLES'
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'OPTIX'
    prefs.get_devices()
    for d in prefs.devices:
        d.use = d.type == 'OPTIX'
    s.cycles.device = 'GPU' if any(d.use for d in prefs.devices) else 'CPU'
    s.cycles.samples = proben
    s.cycles.seed, s.cycles.use_denoising = 7, True
    s.render.resolution_x = s.render.resolution_y = pixel
    s.render.film_transparent = False
    s.render.image_settings.file_format, s.render.image_settings.color_mode = 'PNG', 'RGB'
    s.view_settings.view_transform, s.view_settings.look = 'Standard', 'None'  # Token-Farben ohne AgX-Verschiebung
    hg = s.world.node_tree.nodes['Background']
    hg.inputs['Color'].default_value = linear(farbe(TIEFSEE))
    hg.inputs['Strength'].default_value = 1.0
    cam = bpy.data.objects.new('Kamera', bpy.data.cameras.new('Kamera'))
    cam.data.lens = OBJEKTIV
    s.collection.objects.link(cam)
    s.camera = cam
    return s, cam


def lichter(cam_ort, blick, kegel_auf, motiv, kegel_von=None):
    """Licht relativ zur Kamera, damit alle Szenen gleich ausgeleuchtet sind. Softbox, Aufhellung und Streiflicht
    treffen nur das Motiv (Light-Linking): Die Hohlkehle bleibt Tiefsee und bekommt nur den türkisen Kegel."""
    c, z = Vector(cam_ort), Vector((0, 0, 1))
    f = (Vector(blick) - c)
    f.z = 0
    f.normalize()
    rechts = f.cross(z)
    mitte = Vector(blick)
    for ob in (licht('Softbox', 'AREA', mitte - f * 3.5 - rechts * 3.2 + z * 4.2, mitte, 1300, 4.5),
               licht('Aufhellung', 'AREA', mitte - f * 4 + rechts * 3.5 + z * 1.2, mitte, 260, 5),
               licht('Streiflicht', 'AREA', mitte + f * 2.5 + rechts * 2.4 + z * 2.6, mitte + z * 0.4, 700, 1.2, farbe(TUERKIS))):
        ob.light_linking.receiver_collection = motiv
    # Kegel von oben dicht vor der Wand: kleiner, weicher Lichtfleck hinter der Figur (höchstens ein Fünftel des Bildes)
    von = Vector(kegel_von) if kegel_von else Vector(kegel_auf) - f * 1.2 + z * 2.2
    licht('Kegel', 'SPOT', von, kegel_auf, 2600, 0.8, farbe(TUERKIS), kegel=38)  # Wand ist fast schwarz: viel Leistung


def main():
    argumente = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    pruefen = '--pruefen' in argumente
    vorschau = pruefen or '--vorschau' in argumente
    pixel, proben = (PRUEF_PIXEL, PRUEF_PROBEN) if pruefen else (VORSCHAU_PIXEL, VORSCHAU_PROBEN) if vorschau else (PIXEL, PROBEN)
    namen = [a for a in argumente if not a.startswith('--')] or BILDER
    if unbekannt := [n for n in namen if n not in BILDER]:
        sys.exit(f'Unbekanntes Bild: {", ".join(unbekannt)}. Vorhanden: {", ".join(BILDER)}')
    if '--glb' in argumente:
        return glb(namen)
    nur_wand = '--wand' in argumente
    ziel_ordner = Path(tempfile.gettempdir()) / 'fixit247-vorschau' if vorschau else AUSGABE
    ziel_ordner.mkdir(parents=True, exist_ok=True)
    for name in namen:
        s, cam = buehne(pixel, proben)
        kehle = hohlkehle()
        szene = importlib.import_module(f'szenen.{name.replace("-", "_")}').szene()
        motiv = bpy.data.collections.new(f'Motiv-{name}')
        for ob in s.objects:
            if ob.type == 'MESH' and ob is not kehle:
                motiv.objects.link(ob)
        ziel(cam, szene['kamera'], szene['blick'])
        lichter(szene['kamera'], szene['blick'], szene['kegel'], motiv, szene.get('kegel_von'))
        if not nur_wand:
            s.render.filepath = str(ziel_ordner / f'{name}{"-pruefen" if pruefen else ""}.png')
            bpy.ops.render.render(write_still=True)
            print(f'GESPEICHERT {s.render.filepath}')
        if not vorschau:
            wand(s, motiv, name)


def wand(s, motiv, name):
    """Dieselbe Bühne ohne Motiv: Hohlkehle mit dem türkisen Kegel als Hintergrund der 3D-Szene (Szene3D.tsx), damit
    Wand und Kegel genau wie im Standbild liegen. design/bilder-3d/wand-N.png, 1200 px."""
    for ob in motiv.objects:
        ob.hide_render = True
    s.render.resolution_x = s.render.resolution_y = WAND_PIXEL
    s.cycles.samples = WAND_PROBEN
    s.render.filepath = str(AUSGABE / name.replace('bild', 'wand'))
    bpy.ops.render.render(write_still=True)
    print(f'GESPEICHERT {s.render.filepath}.png')


def verdeckung_backen(s):
    """Umgebungsverdeckung (AO) als Vertex-Farbe „AO“, die three.js mit der Grundfarbe multipliziert: Ohne indirekte
    Verschattung wirken Kasteninnenraum, Fugen und Achseln heller als im Render. Modifier werden dafür angewendet."""
    netze = [ob for ob in s.objects if ob.type == 'MESH']
    for ob in s.objects:
        ob.select_set(ob in netze)
    bpy.context.view_layer.objects.active = netze[0]
    bpy.ops.object.convert(target='MESH')
    for ob in netze:
        ob.data.color_attributes.active_color = ob.data.color_attributes.new('AO', 'FLOAT_COLOR', 'POINT')
    s.render.bake.target = 'VERTEX_COLORS'
    s.world.light_settings.distance = AO_WEITE
    s.cycles.samples = AO_PROBEN
    bpy.ops.object.bake(type='AO')
    for ob in netze:
        anteil = AO_HAUT if any(m and m.get('haut') for m in ob.data.materials) else AO_STAERKE
        for w in ob.data.color_attributes['AO'].data:
            v = 1 - anteil * (1 - w.color[0])
            w.color = (v, v, v, 1)


def glb(namen):
    """Dieselben Szenen als 3D-Objekte für three.js (Szene3D.tsx): Motiv, Kamera und die Lampen der Szene
    (Taschenlampen, in Blender-Watt), ohne Hohlkehle und Bühnenlicht. Das Bühnenlicht setzt buehne3d.ts relativ zur
    Kamera, Wand und Kegel kommen als Bild aus wand(). Der Blickpunkt steht als extras an der Kamera, in glTF-Achsen
    (Y oben, Z zur Kamera)."""
    import fx3d
    fx3d.FEIN = GLB_FEIN
    roh_ordner = Path(tempfile.gettempdir()) / 'fixit247-glb'
    roh_ordner.mkdir(parents=True, exist_ok=True)
    (ROOT / 'public' / 'modelle').mkdir(exist_ok=True)
    gltf = lambda p: [round(p[0], 4), round(p[2], 4), round(-p[1], 4)]  # noqa: E731
    for name in namen:
        s, cam = buehne(VORSCHAU_PIXEL, VORSCHAU_PROBEN)
        szene = importlib.import_module(f'szenen.{name.replace("-", "_")}').szene()
        ziel(cam, szene['kamera'], szene['blick'])
        cam['blick'] = gltf(szene['blick'])
        verdeckung_backen(s)
        roh, datei = roh_ordner / f'{name}.glb', ROOT / 'public' / 'modelle' / f'{name}.glb'
        bpy.ops.export_scene.gltf(filepath=str(roh), export_format='GLB', export_apply=True, export_cameras=True,
                                  export_lights=True, export_import_convert_lighting_mode='RAW', export_extras=True,
                                  export_texcoords=False,
                                  export_vertex_color='NAME', export_vertex_color_name='AO')
        # Quantisieren und mit Meshopt packen. Nicht automatisch vereinfachen: Das verbiegt die Normalen der Rundungen
        # (flache Teile glänzen dann wie Kissen); weniger Segmente kommen schon aus fx3d.stufen().
        subprocess.run(f'npx gltf-transform optimize "{roh}" "{datei}" --palette false --texture-compress false --simplify false',
                       shell=True, check=True, cwd=ROOT, stdout=subprocess.DEVNULL)
        print(f'GESPEICHERT {datei} ({roh.stat().st_size // 1024} KB roh, {datei.stat().st_size // 1024} KB gepackt)')


main()
