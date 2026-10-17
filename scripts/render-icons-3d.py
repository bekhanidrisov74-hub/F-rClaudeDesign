"""Gewerke-Icons als 3D-Renders (weich glänzend, im Stil der Fluent-3D-Emojis).

Aufruf (alle fünf oder einzelne Namen):
  "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b --factory-startup --python-exit-code 1 -P scripts/render-icons-3d.py [-- gewerk-elektro ...]
Danach exportiert scripts/icons-3d.mjs die Dateien für die Seite und das Kontaktblatt.

Eine Kamera, ein Licht-Aufbau, eine Zielgröße für alle Motive. Farben nur aus design/tokens.json:
Technik Petrol, Handwerk Orange, Akzente Tiefsee, Türkis, Weiß. Ausgabe: design/icons-3d/<name>.png
(RGBA, transparenter Hintergrund, keine Fläche dahinter). Motive nach design/ICON-PROMPTS-CHATGPT.md.
"""
import json
import math
import sys
from pathlib import Path

import bmesh
import numpy as np
import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Matrix, Vector

ROOT = Path(__file__).resolve().parent.parent
AUSGABE = ROOT / 'design' / 'icons-3d'
PIXEL = 512
FUELLUNG = 0.92  # längste Seite des Motivs im Bild vor dem optischen Ausgleich (schmaler Rand: bündig zum Kacheltitel)
DECKUNG, OPTIK, GRENZE = 0.40, 0.12, 0.97  # optisch gleich groß: Seite × (DECKUNG / Deckung) ** OPTIK, höchstens GRENZE
HOEHE, SEITE = 22, 24  # Kamera: Grad über der Waagrechten, Grad nach rechts gedreht ("leichte Draufsicht von schräg vorne")

TOKENS = json.loads((ROOT / 'design' / 'tokens.json').read_text(encoding='utf-8'))


def linear(hexwert):
    """sRGB-Hex aus den Tokens in Blenders lineare Farbe."""
    def kanal(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    h = hexwert.lstrip('#')
    return tuple(kanal(int(h[i:i + 2], 16) / 255) for i in (0, 2, 4)) + (1.0,)


def material(token, rauheit=0.42):
    name = token
    if name in bpy.data.materials:
        return bpy.data.materials[name]
    m = bpy.data.materials.new(name)
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = linear(TOKENS[token]['value'])
    p.inputs['Roughness'].default_value = rauheit
    p.inputs['Coat Weight'].default_value = 0.35  # weicher Glanz wie lackiertes Spielzeug
    p.inputs['Coat Roughness'].default_value = 0.22
    return m


PETROL, ORANGE = '--fx-icon-technik', '--fx-icon-handwerk'
TIEFSEE, TUERKIS, WEISS = '--fx-tiefsee', '--fx-tuerkis', '--fx-weiss'


# ── Formen ─────────────────────────────────────────────────────────────────────
# Modelliert wird von vorne: X nach rechts, Z nach oben, die Vorderseite schaut nach −Y.

def objekt(name, bm, token, rundung=0.0):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.shade_smooth()
    me.materials.append(material(token))
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    if rundung:
        b = ob.modifiers.new('Rundung', 'BEVEL')
        b.width, b.segments = rundung, 6
        b.limit_method, b.angle_limit = 'ANGLE', math.radians(35)
        b.harden_normals = True
    return ob


def lage(ort=(0, 0, 0), dreh=(0, 0, 0), mass=(1, 1, 1)):
    return (Matrix.Translation(ort)
            @ Matrix.Rotation(math.radians(dreh[2]), 4, 'Z')
            @ Matrix.Rotation(math.radians(dreh[1]), 4, 'Y')
            @ Matrix.Rotation(math.radians(dreh[0]), 4, 'X')
            @ Matrix.Diagonal((*mass, 1)))


def quader(name, groesse, token, rundung, ort=(0, 0, 0), dreh=(0, 0, 0)):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1, matrix=lage(ort, dreh, groesse))
    return objekt(name, bm, token, rundung)


def walze(name, radius, tiefe, token, rundung, ort=(0, 0, 0), dreh=(90, 0, 0)):
    """Zylinder, Achse standardmäßig zur Kamera (−Y)."""
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=96, radius1=radius, radius2=radius, depth=tiefe, matrix=lage(ort, dreh))
    return objekt(name, bm, token, rundung)


def kugel(name, radius, token, ort=(0, 0, 0), mass=(1, 1, 1), dreh=(0, 0, 0)):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=96, v_segments=48, radius=radius, matrix=lage(ort, dreh, mass))
    return objekt(name, bm, token)


def tropfen(name, hoehe, token, ort):
    """Klassischer Tropfen: Kugel, oben zur Spitze gezogen (Radius sin θ · sin(θ/2))."""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=96, v_segments=64, radius=1)
    for v in bm.verts:
        theta = math.acos(max(-1, min(1, v.co.z)))
        r = math.hypot(v.co.x, v.co.y)
        f = math.sin(theta) * math.sin(theta / 2) / r if r > 1e-6 else 0
        v.co = Vector((v.co.x * f, v.co.y * f, v.co.z))
    s = hoehe / 2
    bmesh.ops.transform(bm, matrix=lage(ort, mass=(s * 0.78, s * 0.78, s)), verts=bm.verts)
    return objekt(name, bm, token)


def platte(name, umriss, tiefe, token, rundung, y=0.0):
    """2D-Umriss (x, z) in der Vorderebene, nach hinten ausgezogen; y ist die Vorderseite."""
    bm = bmesh.new()
    vorne = bm.faces.new([bm.verts.new((x, y, z)) for x, z in umriss])
    neu = bmesh.ops.extrude_face_region(bm, geom=[vorne])['geom']
    bmesh.ops.translate(bm, vec=(0, tiefe, 0), verts=[e for e in neu if isinstance(e, bmesh.types.BMVert)])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return objekt(name, bm, token, rundung)


def rohr(name, punkte, radius, token, rundung=0.0, ring=False):
    """Rohr mit rundem Querschnitt entlang einer Punktfolge (Kurve mit Fase, dann Netz)."""
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions, cu.bevel_depth, cu.bevel_resolution, cu.use_fill_caps = '3D', radius, 10, True
    sp = cu.splines.new('POLY')
    sp.points.add(len(punkte) - 1)
    for p, co in zip(sp.points, punkte):
        p.co = (*co, 1)
    sp.use_cyclic_u = ring
    tmp = bpy.data.objects.new(name, cu)
    bpy.context.scene.collection.objects.link(tmp)
    me = bpy.data.meshes.new_from_object(tmp.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    bpy.data.objects.remove(tmp)
    bm = bmesh.new()
    bm.from_mesh(me)
    bpy.data.meshes.remove(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    return objekt(name, bm, token, rundung)


def bogen(mitte, radius, von, bis, schritte=24, y=0.0):
    """Punkte auf einem Kreisbogen in der Vorderebene (Winkel in Grad, 0 = rechts, 90 = oben)."""
    return [(mitte[0] + radius * math.cos(math.radians(von + (bis - von) * i / schritte)), y,
             mitte[1] + radius * math.sin(math.radians(von + (bis - von) * i / schritte))) for i in range(schritte + 1)]


# ── Motive ─────────────────────────────────────────────────────────────────────
# Hauptfarbe trägt die großen Teile (Technik Petrol, Handwerk Orange), Weiß/Tiefsee/Türkis nur die Akzente:
# Weiß für Bedienteile, Tiefsee für Öffnungen, Türkis für Wasser und Anzeigen.

def installateur():
    """Wandhahn mit fallendem Tropfen, von der Seite; die Wandrosette links."""
    walze('Rosette', 0.34, 0.16, ORANGE, 0.05, ort=(-0.92, 0, 0.3), dreh=(0, 90, 0))
    auslauf = [(-0.86, 0, 0.3), (0.2, 0, 0.3)] + bogen((0.2, 0.0), 0.3, 90, 0)[1:] + [(0.5, 0, -0.18)]
    rohr('Auslauf', auslauf, 0.15, ORANGE, 0.06)
    walze('Schaft', 0.08, 0.26, ORANGE, 0.02, ort=(-0.28, 0, 0.5), dreh=(0, 0, 0))
    kugel('Griff', 0.12, ORANGE, ort=(-0.28, 0, 0.68), mass=(3.4, 1.0, 1.15))
    tropfen('Tropfen', 0.42, TUERKIS, ort=(0.5, 0, -0.62))


def heizung():
    """Heizkörper mit Thermostatkopf, von vorne."""
    breite, abstand = 0.26, 0.06
    for i in range(4):
        x = -0.78 + i * (breite + abstand)
        quader(f'Rippe{i}', (breite, 0.34, 1.36), PETROL, 0.12, ort=(x, 0, 0.02))
    links, rechts = -0.78 - breite / 2, -0.78 + 3 * (breite + abstand) + breite / 2
    for z in (0.56, -0.52):
        quader(f'Sammler{z}', (rechts - links, 0.2, 0.12), PETROL, 0.05, ort=((links + rechts) / 2, 0.04, z))
    for x in (links + 0.2, rechts - 0.2):
        quader(f'Fuss{x}', (0.12, 0.14, 0.3), TIEFSEE, 0.05, ort=(x, 0.04, -0.78))
    walze('Stutzen', 0.07, 0.26, PETROL, 0.02, ort=(rechts + 0.1, 0.02, 0.36), dreh=(0, 90, 0))
    quader('Thermostat', (0.32, 0.32, 0.6), PETROL, 0.14, ort=(rechts + 0.36, 0.02, 0.36))
    for z in (0.46, 0.3):
        quader(f'Rille{z}', (0.2, 0.04, 0.05), WEISS, 0.02, ort=(rechts + 0.36, -0.15, z))


def schluesseldienst():
    """Schlüssel schräg vor einem Türschild mit Schlüsselloch."""
    # Schild weit hinter dem Schlüssel, damit dessen Schatten die beiden orangen Teile trennt
    quader('Schild', (0.66, 0.14, 1.62), ORANGE, 0.3, ort=(-0.42, 0.3, 0.08))
    walze('Loch', 0.1, 0.04, TIEFSEE, 0.015, ort=(-0.42, 0.22, 0.66))
    platte('Schlitz', [(-0.47, 0.64), (-0.37, 0.64), (-0.34, 0.42), (-0.5, 0.42)], 0.04, TIEFSEE, 0.012, y=0.21)
    # Schlüssel: Reide links unter dem Schlüsselloch, Bart unten rechts, um 30° geneigt
    winkel = -30
    def k(x, z):
        c, s = math.cos(math.radians(winkel)), math.sin(math.radians(winkel))
        return (0.3 + x * c - z * s, -0.35 + x * s + z * c)
    rohr('Reide', bogen(k(-0.66, 0), 0.27, 0, 360, 96, y=-0.13)[:-1], 0.13, ORANGE, ring=True)
    halm = [k(-0.42, 0.1), k(0.82, 0.1), k(0.82, -0.1), k(-0.42, -0.1)]
    platte('Halm', halm, 0.2, ORANGE, 0.08, y=-0.23)
    for x0 in (0.4, 0.64):
        platte(f'Zahn{x0}', [k(x0, -0.04), k(x0 + 0.15, -0.04), k(x0 + 0.15, -0.3), k(x0, -0.3)], 0.2, ORANGE, 0.06, y=-0.23)


def elektro():
    """Schuko-Steckdose, von vorne, symmetrisch."""
    quader('Abdeckung', (1.7, 0.26, 1.7), PETROL, 0.36)
    walze('Dose', 0.6, 0.12, WEISS, 0.05, ort=(0, -0.16, 0))
    walze('Mulde', 0.47, 0.06, PETROL, 0.03, ort=(0, -0.2, 0))
    for x in (-0.2, 0.2):
        walze(f'Buchse{x}', 0.085, 0.04, TIEFSEE, 0.012, ort=(x, -0.23, 0))
    for z in (0.42, -0.42):
        quader(f'Erdung{z}', (0.2, 0.1, 0.1), WEISS, 0.03, ort=(0, -0.24, z))


def haushaltsgeraete():
    """Frontlader-Waschmaschine mit Wasser hinter dem Bullauge."""
    quader('Gehaeuse', (1.5, 1.0, 1.7), PETROL, 0.26)
    quader('Blende', (1.24, 0.06, 0.2), PETROL, 0.05, ort=(0, -0.5, 0.6))
    walze('Knopf', 0.09, 0.1, WEISS, 0.03, ort=(-0.42, -0.53, 0.6))
    quader('Anzeige', (0.42, 0.06, 0.1), TUERKIS, 0.04, ort=(0.28, -0.53, 0.6))
    rohr('Tuer', bogen((0, -0.16), 0.46, 0, 360, 128, y=-0.56)[:-1], 0.1, WEISS, ring=True)
    walze('Glas', 0.38, 0.04, TIEFSEE, 0.0, ort=(0, -0.51, -0.16))
    welle = [(0.36 * math.cos(math.radians(a)), -0.16 + 0.36 * math.sin(math.radians(a))) for a in range(180, 361, 6)]
    welle += [(0.36 - 0.72 * i / 24, -0.16 + 0.04 * math.sin(i / 24 * 2 * math.pi)) for i in range(1, 24)]
    platte('Wasser', welle, 0.03, TUERKIS, 0.012, y=-0.55)


MOTIVE = {
    'gewerk-installateur': installateur,
    'gewerk-heizung-und-klima': heizung,
    'gewerk-schluesseldienst': schluesseldienst,
    'gewerk-elektro': elektro,
    'gewerk-haushaltsgeraete': haushaltsgeraete,
}


# ── Bühne: einmal aufgebaut, für alle Motive gleich ─────────────────────────────

def ziel(ob, ort, auf=(0, 0, 0)):
    ob.location = ort
    ob.rotation_euler = (Vector(auf) - Vector(ort)).to_track_quat('-Z', 'Y').to_euler()


def buehne():
    s = bpy.context.scene
    for ob in list(s.objects):  # Würfel, Kamera und Licht der Startszene
        bpy.data.objects.remove(ob)
    s.render.engine = 'CYCLES'
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'OPTIX'
    prefs.get_devices()
    for d in prefs.devices:
        d.use = d.type == 'OPTIX'
    s.cycles.device = 'GPU' if any(d.use for d in prefs.devices) else 'CPU'
    s.cycles.samples, s.cycles.seed, s.cycles.use_denoising = 256, 7, True
    s.render.film_transparent = True
    s.render.resolution_x = s.render.resolution_y = PIXEL
    s.render.image_settings.file_format, s.render.image_settings.color_mode = 'PNG', 'RGBA'
    s.view_settings.view_transform, s.view_settings.look = 'Standard', 'None'  # Token-Farben ohne AgX-Verschiebung

    hg = s.world.node_tree.nodes['Background']  # gleichmäßiges Umgebungslicht, unsichtbar dank transparentem Film
    hg.inputs['Color'].default_value = (1, 1, 1, 1)
    hg.inputs['Strength'].default_value = 0.3

    cam = bpy.data.objects.new('Kamera', bpy.data.cameras.new('Kamera'))
    cam.data.type, cam.data.ortho_scale = 'ORTHO', 2.0
    s.collection.objects.link(cam)
    h, w = math.radians(HOEHE), math.radians(SEITE)
    ziel(cam, (10 * math.cos(h) * math.sin(w), -10 * math.cos(h) * math.cos(w), 10 * math.sin(h)))
    s.camera = cam

    for name, ort, staerke, groesse in (
        ('Hauptlicht', (-3, -4, 5), 560, 5),   # oben links vorne
        ('Aufhellung', (5, -3, 0.5), 160, 6),  # rechts, flach
        ('Kante', (1.5, 5, 4), 380, 4),        # hinten oben: helle Kante am Umriss
    ):
        ld = bpy.data.lights.new(name, 'AREA')
        ld.energy, ld.size = staerke, groesse
        ob = bpy.data.objects.new(name, ld)
        s.collection.objects.link(ob)
        ziel(ob, ort)
    return s, cam


def umriss(s, cam, obs):
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    xs, ys = [], []
    for ob in obs:
        ev = ob.evaluated_get(dg)
        for v in ev.to_mesh().vertices:
            p = world_to_camera_view(s, cam, ev.matrix_world @ v.co)
            xs.append(p.x)
            ys.append(p.y)
        ev.to_mesh_clear()
    return min(xs), max(xs), min(ys), max(ys)


def einpassen(s, cam, wurzel, obs, seite):
    """Längste Seite des Bildumrisses = seite; links bündig am Rand (wie Kacheltitel und Liste), senkrecht mittig (Ortho, also exakt)."""
    x0, x1, y0, y1 = umriss(s, cam, obs)
    wurzel.scale = wurzel.scale * (seite / max(x1 - x0, y1 - y0))
    x0, x1, y0, y1 = umriss(s, cam, obs)
    rechts, oben = cam.matrix_world.to_3x3() @ Vector((1, 0, 0)), cam.matrix_world.to_3x3() @ Vector((0, 1, 0))
    wurzel.location += (rechts * ((1 - GRENZE) / 2 - x0) + oben * (0.5 - (y0 + y1) / 2)) * cam.data.ortho_scale


def deckung(s):
    """Anteil deckender Pixel aus einem schnellen Probe-Render (Steckdose ~0,64, Hahn ~0,28)."""
    alt = s.render.resolution_x, s.cycles.samples, s.cycles.use_denoising, s.render.filepath
    s.render.resolution_x = s.render.resolution_y = 96
    s.cycles.samples, s.cycles.use_denoising = 16, False
    s.render.filepath = str(Path(bpy.app.tempdir) / 'deckung.png')
    bpy.ops.render.render(write_still=True)
    bild = bpy.data.images.load(s.render.filepath)
    px = np.empty(len(bild.pixels), dtype=np.float32)
    bild.pixels.foreach_get(px)
    bpy.data.images.remove(bild)
    s.render.resolution_x, s.cycles.samples, s.cycles.use_denoising, s.render.filepath = alt
    s.render.resolution_y = s.render.resolution_x
    return float(px[3::4].mean())


def main():
    namen = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else list(MOTIVE)
    if unbekannt := [n for n in namen if n not in MOTIVE]:
        sys.exit(f'Unbekanntes Motiv: {", ".join(unbekannt)}. Vorhanden: {", ".join(MOTIVE)}')
    AUSGABE.mkdir(exist_ok=True)
    s, cam = buehne()
    for name in namen:
        vorher = set(s.objects)
        MOTIVE[name]()
        obs = [ob for ob in s.objects if ob not in vorher]
        wurzel = bpy.data.objects.new('Wurzel', None)
        s.collection.objects.link(wurzel)
        for ob in obs:
            ob.parent = wurzel
        einpassen(s, cam, wurzel, obs, FUELLUNG)
        # Flächige Motive (Steckdose) wirken bei gleicher Seite größer als luftige (Hahn): nach Deckung ausgleichen.
        einpassen(s, cam, wurzel, obs, min(GRENZE, FUELLUNG * (DECKUNG / deckung(s)) ** OPTIK))
        s.render.filepath = str(AUSGABE / f'{name}.png')
        bpy.ops.render.render(write_still=True)
        for ob in obs + [wurzel]:
            bpy.data.objects.remove(ob)


main()
