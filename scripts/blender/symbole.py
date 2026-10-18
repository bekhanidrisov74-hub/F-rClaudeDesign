"""Symbole (Telefon, Chat, Formular …) als 3D-Motive für render-icons-3d.py, im Stil der Gewerke-Icons.

Jedes Motiv gibt es in zwei Farbstellungen, weil das Bild seine Farbe nicht wie ein SVG aus currentColor erbt:
- dunkel: Körper Tiefsee, Akzent Türkis, für helle und türkise Flächen (Anruf-Knopf, Kacheln in Kalk, weiße Karten)
- hell:   Körper Türkis, Akzent Weiß, für dunkle Flächen (Fuß, Kreis im großen Anruf-Knopf, dunkle Zusagen-Karten)
Details in Weiß; was auf einer weißen Fläche liegt (Zeilen, Ziffern), trägt die Körperfarbe. Die Warnung bleibt in
beiden Stellungen Orange mit Tiefsee.
"""
import math

import bmesh
from mathutils import Vector

from fx3d import ORANGE, TIEFSEE, TUERKIS, WEISS, bogen, kugel, lage, objekt, platte, quader, rohr, walze

FARBEN = {'dunkel': (TIEFSEE, WEISS, TUERKIS), 'hell': (TUERKIS, WEISS, WEISS)}


def anrufen(haupt, detail, akzent):
    """Telefonhörer, schräg wie im Bedien-Icon: gebogener Griff, Hör- und Sprechmuschel."""
    w = math.radians(-38)
    def d(x, z):
        return (x * math.cos(w) - z * math.sin(w), 0, x * math.sin(w) + z * math.cos(w))
    griff = [d(*p[0::2]) for p in bogen((0, -0.55), 0.95, 150, 30, 32)]
    rohr('Griff', griff, 0.25, haupt, 0.06)
    for name, winkel in (('Hoermuschel', 150), ('Sprechmuschel', 30)):
        a = math.radians(winkel)
        rand = Vector(d(0.95 * math.cos(a), -0.55 + 0.95 * math.sin(a)))
        innen = (Vector(d(0, -0.55)) - rand).normalized()
        mitte = rand + innen * 0.12
        neigung = math.degrees(math.atan2(innen.x, innen.z))
        walze(name, 0.36, 0.32, haupt, 0.11, ort=tuple(mitte + innen * 0.04), dreh=(0, neigung, 0))
        walze(f'{name}Rand', 0.24, 0.06, akzent, 0.02, ort=tuple(mitte + innen * 0.21), dreh=(0, neigung, 0))


def chat(haupt, detail, akzent):
    """Sprechblase mit drei Punkten."""
    r, b, h = 0.32, 1.7, 1.2
    umriss = []
    for cx, cz, a0 in ((b / 2 - r, h / 2 - r, 0), (-b / 2 + r, h / 2 - r, 90), (-b / 2 + r, -h / 2 + r, 180)):
        umriss += [(cx + r * math.cos(math.radians(a0 + 90 * i / 8)), cz + r * math.sin(math.radians(a0 + 90 * i / 8))) for i in range(9)]
    umriss += [(-0.35, -h / 2), (-0.62, -h / 2 - 0.36), (-0.05, -h / 2)]
    umriss += [(b / 2 - r + r * math.cos(math.radians(270 + 90 * i / 8)), -h / 2 + r + r * math.sin(math.radians(270 + 90 * i / 8))) for i in range(9)]
    platte('Blase', umriss, 0.42, haupt, 0.16, y=-0.21)
    for x in (-0.42, 0, 0.42):
        kugel(f'Punkt{x}', 0.13, detail, ort=(x, -0.27, 0.02), mass=(1, 0.6, 1))


def formular(haupt, detail, akzent):
    """Klemmbrett mit Blatt, drei Zeilen und Klammer."""
    quader('Brett', (1.3, 0.14, 1.72), haupt, 0.14)
    quader('Blatt', (1.06, 0.04, 1.36), detail, 0.03, ort=(0, -0.09, -0.08))
    for i, (z, b) in enumerate(((0.28, 0.72), (0.0, 0.72), (-0.28, 0.46))):
        quader(f'Zeile{i}', (b, 0.03, 0.1), haupt, 0.02, ort=(-0.15 + b / 2 - 0.36 + 0.15, -0.115, z))
    quader('Klammer', (0.56, 0.16, 0.26), akzent, 0.07, ort=(0, -0.06, 0.86))
    quader('Klammerbuegel', (0.3, 0.14, 0.12), detail, 0.04, ort=(0, -0.08, 0.98))


def dreieck(name, a, b, c, dicke, farbe, rundung):
    """Dünnes Dreieck im Raum, entlang seiner Normalen ausgezogen."""
    a, b, c = Vector(a), Vector(b), Vector(c)
    n = (b - a).cross(c - a).normalized()
    bm = bmesh.new()
    vorne = [bm.verts.new(p) for p in (a, b, c)]
    hinten = [bm.verts.new(p + n * dicke) for p in (a, b, c)]
    bm.faces.new(vorne)
    bm.faces.new(hinten[::-1])
    for i in range(3):
        bm.faces.new((vorne[i], vorne[i - 1], hinten[i - 1], hinten[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return objekt(name, bm, farbe, rundung)


def senden(haupt, detail, akzent):
    """Papierflieger: Nase rechts oben, Flügel zur Kamera gekippt, damit er auch klein als Flieger lesbar ist."""
    nase, heck = (1.0, -0.1, 0.55), (-0.78, 0.05, -0.32)
    dreieck('FluegelVorne', nase, heck, (-0.72, -0.85, 0.12), 0.07, detail, 0.025)
    dreieck('FluegelHinten', nase, (-0.98, 0.55, 0.45), heck, 0.07, haupt, 0.025)
    dreieck('Kiel', nase, (-0.55, 0.02, -0.72), heck, 0.07, akzent, 0.025)


def region(haupt, detail, akzent):
    """Standort-Nadel mit Loch, darunter ein flacher Ring am Boden."""
    kugel('Kopf', 0.62, haupt, ort=(0, 0, 0.3))
    bm = bmesh.new()  # Spitze: Kegel vom Kugelbauch nach unten
    bmesh.ops.create_cone(bm, cap_ends=True, segments=96, radius1=0.02, radius2=0.5, depth=0.85, matrix=lage((0, 0, -0.32)))
    objekt('Spitze', bm, haupt, 0.0)
    walze('Loch', 0.25, 0.12, detail, 0.04, ort=(0, -0.56, 0.36))
    rohr('Bodenring', [(x, z * 0.35, -0.82) for x, _, z in bogen((0, 0), 0.5, 0, 360, 64)][:-1], 0.06, akzent, ring=True)


def rund_um_die_uhr(haupt, detail, akzent):
    """Wecker: Gehäuse, Zifferblatt, Zeiger, zwei Glocken und Füße."""
    walze('Gehaeuse', 0.8, 0.42, haupt, 0.14)
    walze('Zifferblatt', 0.62, 0.06, detail, 0.02, ort=(0, -0.2, 0))
    for winkel in range(0, 360, 90):
        a = math.radians(winkel)
        kugel(f'Strich{winkel}', 0.05, haupt, ort=(0.48 * math.cos(a), -0.24, 0.48 * math.sin(a)), mass=(1, 0.5, 1))
    rohr('Stundenzeiger', [(0, -0.25, 0), (0, -0.25, 0.32)], 0.05, haupt)
    rohr('Minutenzeiger', [(0, -0.25, 0), (0.36, -0.25, -0.14)], 0.04, haupt)
    kugel('Achse', 0.07, haupt, ort=(0, -0.27, 0), mass=(1, 0.6, 1))
    for seite in (1, -1):
        kugel(f'Glocke{seite}', 0.28, haupt, ort=(0.52 * seite, 0.04, 0.78), mass=(1, 0.8, 0.75), dreh=(0, -32 * seite, 0))
        rohr(f'Fuss{seite}', [(0.4 * seite, 0, -0.62), (0.58 * seite, -0.02, -0.92)], 0.07, haupt)
    rohr('Buegel', bogen((0, 0.62), 0.3, 160, 20, 16, y=0.04), 0.05, akzent)


def richtpreis(haupt, detail, akzent):
    """Preisschild mit Öse und Schnur, schräg."""
    w = math.radians(-35)
    def d(x, z):
        return (x * math.cos(w) - z * math.sin(w), x * math.sin(w) + z * math.cos(w))
    umriss = [d(-0.95, 0), d(-0.45, 0.5), d(0.85, 0.5), d(0.95, 0.42), d(0.95, -0.42), d(0.85, -0.5), d(-0.45, -0.5)]
    platte('Schild', umriss, 0.26, haupt, 0.1, y=-0.13)
    loch = d(-0.42, 0)
    walze('Oese', 0.13, 0.08, detail, 0.03, ort=(loch[0], -0.15, loch[1]))
    schnur = [(loch[0], -0.2, loch[1]), (loch[0] - 0.25, -0.22, loch[1] + 0.25), (loch[0] - 0.2, -0.18, loch[1] + 0.55),
              (loch[0] + 0.1, -0.12, loch[1] + 0.7)]
    rohr('Schnur', schnur, 0.035, akzent)
    for i, x in enumerate((0.0, 0.42)):
        p = d(x, 0.12 - 0.24 * i)
        quader(f'Strich{i}', (0.5 - 0.15 * i, 0.04, 0.09), detail, 0.03, ort=(p[0] + 0.1, -0.15, p[1]), dreh=(0, 35, 0))


def vermittlung(haupt, detail, akzent):
    """Zwei ineinander greifende Ringe: zwei Seiten, eine Verbindung."""
    rohr('RingA', [(x - 0.42, y, z) for x, y, z in bogen((0, 0), 0.62, 0, 360, 96)][:-1], 0.17, haupt, ring=True)
    # zweiter Ring gekippt: schneidet die Ebene des ersten innerhalb und außerhalb, die Ringe greifen ineinander
    rohr('RingB', [(0.42 + x, z * 0.45, z * 0.89) for x, _, z in bogen((0, 0), 0.62, 0, 360, 96)][:-1], 0.17, akzent, ring=True)


def info(haupt, detail, akzent):
    """Runde Plakette mit „i“ aus Punkt und Balken."""
    walze('Scheibe', 0.92, 0.36, haupt, 0.14)
    kugel('Punkt', 0.13, detail, ort=(0, -0.2, 0.42), mass=(1, 0.6, 1))
    quader('Balken', (0.24, 0.12, 0.66), detail, 0.08, ort=(0, -0.17, -0.18))


def haekchen(haupt, detail, akzent):
    """Runde Plakette mit dickem Häkchen."""
    walze('Scheibe', 0.92, 0.36, haupt, 0.14)
    rohr('Haken', [(-0.42, -0.24, 0.02), (-0.12, -0.24, -0.3), (0.45, -0.24, 0.36)], 0.13, detail)


def warnung(haupt, detail, akzent):
    """Warndreieck in Orange mit Ausrufezeichen in Tiefsee (beide Stellungen gleich)."""
    h = 1.6
    platte('Dreieck', [(0, h * 0.62), (-0.95, -h * 0.38), (0.95, -h * 0.38)], 0.3, ORANGE, 0.16, y=-0.15)
    quader('Strich', (0.2, 0.1, 0.62), TIEFSEE, 0.08, ort=(0, -0.17, 0.08))
    kugel('Punkt', 0.12, TIEFSEE, ort=(0, -0.18, -0.42), mass=(1, 0.6, 1))


MOTIVE = {
    'ui-anrufen': anrufen, 'ui-chat': chat, 'ui-formular': formular, 'ui-senden': senden, 'ui-region': region,
    'ui-rund-um-die-uhr': rund_um_die_uhr, 'ui-richtpreis': richtpreis, 'ui-vermittlung': vermittlung,
    'ui-info': info, 'ui-haekchen': haekchen, 'ui-warnung': warnung,
}


def alle():
    """Name → Bau-Funktion für beide Farbstellungen: ui-anrufen (dunkel) und ui-anrufen-hell."""
    return {f'{name}{"" if stellung == "dunkel" else "-hell"}': (lambda f=f, farben=farben: f(*farben))
            for name, f in MOTIVE.items() for stellung, farben in FARBEN.items()}
