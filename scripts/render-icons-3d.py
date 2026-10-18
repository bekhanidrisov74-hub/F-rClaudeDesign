"""Gewerke-Icons und Symbole als 3D-Renders (weich glänzend, im Stil der Fluent-3D-Emojis).

Aufruf (alle oder einzelne Namen, z. B. gewerk-elektro, ui-anrufen, ui-anrufen-hell):
  "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b --factory-startup --python-exit-code 1 -P scripts/render-icons-3d.py [-- gewerk-elektro ...]
Danach exportiert scripts/export-3d.mjs die Dateien für die Seite und das Kontaktblatt.

Eine Kamera, ein Licht-Aufbau, eine Zielgröße für alle Motive. Farben nur aus design/tokens.json:
Technik Petrol, Handwerk Orange, Akzente Tiefsee, Türkis, Weiß. Ausgabe: design/icons-3d/<name>.png
(RGBA, transparenter Hintergrund, keine Fläche dahinter). Gewerke nach design/ICON-PROMPTS-CHATGPT.md und links
bündig (Kacheltitel), Symbole (scripts/blender/symbole.py) mittig, weil sie in runden Knöpfen und Kacheln sitzen.
"""
import math
import sys
from pathlib import Path

import numpy as np
import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

sys.path.insert(0, str(Path(__file__).resolve().parent / 'blender'))
from fx3d import GEWERKE, ROOT, ziel  # noqa: E402
import symbole  # noqa: E402

MOTIVE = {**GEWERKE, **symbole.alle()}
AUSGABE = ROOT / 'design' / 'icons-3d'
PIXEL = 512
FUELLUNG = 0.92  # längste Seite des Motivs im Bild vor dem optischen Ausgleich (schmaler Rand: bündig zum Kacheltitel)
DECKUNG, OPTIK, GRENZE = 0.40, 0.12, 0.97  # optisch gleich groß: Seite × (DECKUNG / Deckung) ** OPTIK, höchstens GRENZE
HOEHE, SEITE = 22, 24  # Kamera: Grad über der Waagrechten, Grad nach rechts gedreht ("leichte Draufsicht von schräg vorne")


# ── Bühne: einmal aufgebaut, für alle Motive gleich ─────────────────────────────

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


def einpassen(s, cam, wurzel, obs, seite, links_buendig):
    """Längste Seite des Bildumrisses = seite; links bündig (Gewerke, wie Kacheltitel und Liste) oder mittig, senkrecht mittig (Ortho, also exakt)."""
    x0, x1, y0, y1 = umriss(s, cam, obs)
    wurzel.scale = wurzel.scale * (seite / max(x1 - x0, y1 - y0))
    x0, x1, y0, y1 = umriss(s, cam, obs)
    rechts, oben = cam.matrix_world.to_3x3() @ Vector((1, 0, 0)), cam.matrix_world.to_3x3() @ Vector((0, 1, 0))
    dx = (1 - GRENZE) / 2 - x0 if links_buendig else 0.5 - (x0 + x1) / 2
    wurzel.location += (rechts * dx + oben * (0.5 - (y0 + y1) / 2)) * cam.data.ortho_scale


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
    if namen == ['symbole']:  # Kurzform: alle Symbole in beiden Farbstellungen
        namen = [n for n in MOTIVE if n.startswith('ui-')]
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
        links_buendig = name.startswith('gewerk-')
        einpassen(s, cam, wurzel, obs, FUELLUNG, links_buendig)
        # Flächige Motive (Steckdose) wirken bei gleicher Seite größer als luftige (Hahn): nach Deckung ausgleichen.
        einpassen(s, cam, wurzel, obs, min(GRENZE, FUELLUNG * (DECKUNG / deckung(s)) ** OPTIK), links_buendig)
        s.render.filepath = str(AUSGABE / f'{name}.png')
        bpy.ops.render.render(write_still=True)
        for ob in obs + [wurzel]:
            bpy.data.objects.remove(ob)


main()
