"""Bild 2 (Karte Installateur): Installateur kniet an der gefliesten Vorwand und zieht die Überwurfmutter am
Chromrohr mit der Rohrzange nach; aus der Dichtung tropft es in den Eimer, die Taschenlampe leuchtet auf die Stelle.

Das Rohr kommt aus der Vorwand auf die Kamera zu, damit die Rohrzange quer dazu steht und von vorne als Umriss zu
lesen ist (Mutter im Maul, oranger Griff steil nach rechts unten). Hinter der Mutter knickt das Rohr nach links und
im zweiten Knie in den Boden. Die Fachkraft kniet rechts davon und schaut nach links auf die Mutter: Die linke Faust
drückt das Griffende nach unten (der Griff liegt quer zum Unterarm), die rechte Hand stützt sich flach an den Fliesen ab.

Die Taschenlampe liegt oben auf der Vorwand und zeigt mit leuchtender Linse auf die Verschraubung; ein eigener Spot
(nur aufs Motiv) hellt die Stelle auf. Mutter und Anschluss sind aus Messing, damit sie sich zwischen den verchromten
Backen abheben. Ein Kugelhahn im senkrechten Rohr, offener Koffer rechts.

Kamera halbnah: Die Figur füllt von der Kappe bis zum aufgestellten Knie den größten Teil des 4 : 3, eine Hand ist
etwa 6–7 % der Bildbreite breit. Zuschnitte: Karte 4 : 3 (Desktop) und 16 : 9 (Handy, mittleres Band): Kappe, Gesicht,
beide Hände, Zange, Mutter, Lampe und Tropfen liegen im Band; Eimerrand, zweites Rohrknie und Koffer kommen im 4 : 3
angeschnitten dazu, Hahn und Stiefel nur im ganzen Bild.
"""
import math

import bmesh
import bpy
from fx3d import (KALK, ORANGE, PETROL, TIEFSEE, TIEFSEE2, TUERKIS, WEISS, farbe, kugel, lage, linear, material, mischung,
                  objekt, quader, rohr, stufen, tropfen, walze)
from figur import figur, gerundet, ring
from mathutils import Matrix, Vector

CHROM = material(WEISS, rauheit=0.16, metall=1.0, glanz=0.0)
FLIESE = material(TIEFSEE, rauheit=0.35, glanz=0.35)
MESSING = material(mischung(ORANGE, 0.55, KALK), rauheit=0.25, metall=1.0, glanz=0.0)
GUMMI = material(TIEFSEE, rauheit=0.6, glanz=0.1)
X, Y, Z = Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))

# Vorwand hinten links, Fliesenfront nach −Y; das Rohr kommt bei (ROHR_X, ROHR_Z) heraus und läuft auf die Kamera zu
WAND_X0, WAND_X1, WAND_Y, WAND_T, WAND_H, RASTER = -1.1, 0.15, 0.55, 0.25, 1.25, 0.25
ROHR_X, ROHR_Z, ROHR_R, KNIE_R = -0.35, 1.0, 0.022, 0.09
KNIE_Y = 0.05                      # hier beginnt das erste Knie (nach links)
LINKS_X = -0.8                     # hier beginnt das zweite Knie (nach unten)
MUTTER = Vector((ROHR_X, 0.315, ROHR_Z))
MUTTER_R, MUTTER_L = 0.05, 0.066
FUGE_Y = MUTTER.y + MUTTER_L / 2 + 0.005   # Dichtfuge zwischen Mutter und Gewinde (orange Dichtung)
ZANGE_W = math.radians(60)        # Griff steil nach rechts unten, damit die Faust ihn quer zum Unterarm fasst
ZANGE_D = Vector((math.cos(ZANGE_W), 0, -math.sin(ZANGE_W)))
ZANGE_S = Vector((math.sin(ZANGE_W), 0, math.cos(ZANGE_W)))    # Schaft über der Mutter
EIMER = (-0.33, 0.36, 0.0)


def kegelstumpf(name, r_unten, r_oben, hoehe, token, ort, offen=False, dicke=0.0, rundung=0.0, segmente=64):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=stufen(segmente, 16), radius1=r_unten, radius2=r_oben, depth=hoehe,
                          matrix=lage((ort[0], ort[1], ort[2] + hoehe / 2)))
    if offen:
        bmesh.ops.delete(bm, geom=[max(bm.faces, key=lambda f: f.calc_center_median().z)], context='FACES_ONLY')
    ob = objekt(name, bm, token, rundung)
    if dicke:
        s = ob.modifiers.new('Wand', 'SOLIDIFY')
        s.thickness, s.offset = dicke, -1
    return ob


def sechskant(name, r, laenge, mitte, achse, flaeche, token=CHROM, rundung=0.005):
    """Sechskant (Mutter, Schraubenkopf) mit Achse achse; zwei Schlüsselflächen stehen senkrecht zu flaeche."""
    a = Vector(achse).normalized()
    f = (Vector(flaeche) - a * Vector(flaeche).dot(a)).normalized()
    rot = Matrix((f.cross(a), f, a)).transposed()   # create_cone: lokale ±Y sind Flächennormalen
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=6, radius1=r, radius2=r, depth=laenge,
                          matrix=Matrix.Translation(mitte) @ rot.to_4x4())
    return objekt(name, bm, token, rundung)


def entlang(name, r, laenge, token, mitte, d, rundung):
    """Walze mit Achse entlang d."""
    o = walze(name, r, laenge, token, rundung, dreh=(0, 0, 0))
    o.matrix_world = Matrix.Translation(mitte) @ Vector(d).to_track_quat('Z', 'Y').to_matrix().to_4x4()
    return o


def flach(name, umriss, dicke, token, rundung, z=0.0):
    """Waagrechte Platte aus einem konvexen 2D-Umriss (x, y), von z nach oben ausgezogen."""
    bm = bmesh.new()
    f = bm.faces.new([bm.verts.new((x, y, z)) for x, y in umriss])
    neu = bmesh.ops.extrude_face_region(bm, geom=[f])['geom']
    bmesh.ops.translate(bm, vec=(0, 0, dicke), verts=[e for e in neu if isinstance(e, bmesh.types.BMVert)])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return objekt(name, bm, token, rundung)


def rundrechteck(b, t, r, schritte=6):
    """Umriss eines abgerundeten Rechtecks (b × t, Eckradius r) um den Ursprung."""
    pkt = []
    for ex, ey, a0 in ((b / 2 - r, t / 2 - r, 0), (-b / 2 + r, t / 2 - r, 90), (-b / 2 + r, -t / 2 + r, 180), (b / 2 - r, -t / 2 + r, 270)):
        pkt += [(ex + r * math.cos(math.radians(a0 + 90 * i / schritte)), ey + r * math.sin(math.radians(a0 + 90 * i / schritte)))
                for i in range(schritte + 1)]
    return pkt


# ── Vorwand und Leitung ────────────────────────────────────────────────────────

def vorwand():
    mx = (WAND_X0 + WAND_X1) / 2
    quader('Vorwand', (WAND_X1 - WAND_X0, WAND_T, WAND_H), TIEFSEE, 0.01, ort=(mx, WAND_Y + WAND_T / 2, WAND_H / 2))
    quader('Abdeckung', (WAND_X1 - WAND_X0 + 0.04, WAND_T + 0.04, 0.04), TIEFSEE2, 0.012,
           ort=(mx, WAND_Y + WAND_T / 2, WAND_H + 0.02))
    f = RASTER - 0.014
    for i in range(round((WAND_X1 - WAND_X0) / RASTER)):
        for j in range(round(WAND_H / RASTER)):
            quader(f'Fliese{i}{j}', (f, 0.012, f), FLIESE, 0.004,
                   ort=(WAND_X0 + RASTER * (i + 0.5), WAND_Y - 0.005, RASTER * (j + 0.5)))


def knie(name, p0, ecke, p1, r_rohr, r_fitting):
    """Rohrknie von p0 über die Ecke nach p1 (Biegeradius KNIE_R), mit dickerem Fitting und zwei Bunden."""
    p0, ecke, p1 = Vector(p0), Vector(ecke), Vector(p1)
    a, b = (p0 - ecke).normalized(), (p1 - ecke).normalized()
    m = ecke + (a + b) * KNIE_R          # Mittelpunkt des Bogens (90°)
    bogen = [tuple(m - b * KNIE_R * math.cos(t) - a * KNIE_R * math.sin(t))
             for t in (math.pi / 2 * i / 16 for i in range(17))]
    s0, s1 = ecke + a * KNIE_R, ecke + b * KNIE_R
    rohr(f'{name}Fitting', [tuple(s0 + a * 0.05)] + bogen + [tuple(s1 + b * 0.05)], r_fitting, CHROM)
    for i, (p, d) in enumerate(((s0 + a * 0.05, a), (s1 + b * 0.05, b))):
        entlang(f'{name}Bund{i}', r_fitting + 0.004, 0.018, CHROM, p, d, 0.005)
    return bogen


def leitung():
    """Chromrohr aus der Vorwand: Anschluss, Gewinde, orange Dichtung, Überwurfmutter, Knie nach links, Knie nach
    unten, Bodenrosette."""
    walze('Rosette', 0.055, 0.014, CHROM, 0.004, ort=(ROHR_X, WAND_Y - 0.012, ROHR_Z))
    e1 = Vector((ROHR_X, KNIE_Y - KNIE_R, ROHR_Z))                 # Ecke des ersten Knies
    e2 = Vector((LINKS_X - KNIE_R, e1.y, ROHR_Z))                  # Ecke des zweiten Knies
    b1 = knie('Knie1', (ROHR_X, WAND_Y, ROHR_Z), e1, (LINKS_X, e1.y, ROHR_Z), ROHR_R, 0.031)
    b2 = knie('Knie2', (LINKS_X, e1.y, ROHR_Z), e2, (e2.x, e1.y, 0.0), ROHR_R, 0.031)
    rohr('Rohr', [(ROHR_X, WAND_Y - 0.005, ROHR_Z)] + b1 + b2 + [(e2.x, e1.y, 0.0)], ROHR_R, CHROM)
    walze('Bodenrosette', 0.055, 0.012, CHROM, 0.004, ort=(e2.x, e1.y, 0.006), dreh=(0, 0, 0))
    kugelhahn(Vector((e2.x, e1.y, 0.56)))
    # Verschraubung von der Wand her: Anschluss-Sechskant, Gewinde, Dichtung in der Fuge, Mutter, Stutzen zum Knie
    sechskant('Anschluss', 0.042, 0.032, (ROHR_X, 0.405, ROHR_Z), Y, ZANGE_D, MESSING)
    for i in range(3):
        ring(f'Gewinde{i}', (ROHR_X, FUGE_Y + 0.012 + 0.01 * i, ROHR_Z), Y, 0.027, 0.027, 0.0045, CHROM)
    ring('Dichtung', (ROHR_X, FUGE_Y, ROHR_Z), Y, 0.032, 0.032, 0.0065, ORANGE)
    sechskant('Mutter', MUTTER_R, MUTTER_L, tuple(MUTTER), Y, ZANGE_D, MESSING)
    vorne = MUTTER.y - MUTTER_L / 2
    walze('Stutzen', 0.03, vorne - (KNIE_Y + 0.05) + 0.004, CHROM, 0.004, ort=(ROHR_X, (vorne + KNIE_Y + 0.05) / 2, ROHR_Z))


def kugelhahn(m):
    """Absperrhahn im senkrechten Rohr: Messingkörper mit zwei Sechskanten, Spindel zur Kamera, oranger Hebel quer
    (zugedreht)."""
    kugel('Hahnkoerper', 0.04, MESSING, ort=tuple(m), mass=(1, 1, 1.15))
    for sz in (-1, 1):
        sechskant(f'Hahnende{sz}', 0.034, 0.026, tuple(m + Z * sz * 0.055), Z, X, MESSING)
    entlang('Spindel', 0.011, 0.04, CHROM, m - Y * 0.045, Y, 0.003)
    gerundet('Hebel', m - Y * 0.068 + X * 0.05, Matrix.Identity(3), (0.13, 0.014, 0.028), ORANGE, 0.007)
    walze('Hebelschraube', 0.009, 0.006, CHROM, 0.002, ort=tuple(m - Y * 0.078))


def tropfen_und_eimer():
    """Aus der Dichtfuge läuft Wasser über die Mutter und tropft in den Eimer; der Aufprall zieht Ringe."""
    x, y = ROHR_X - 0.004, MUTTER.y - 0.012
    tropfen('Tropfen0', 0.042, TUERKIS, (x, y, 0.875))
    tropfen('Tropfen1', 0.038, TUERKIS, (x, y, 0.69))
    tropfen('Tropfen2', 0.034, TUERKIS, (x, y, 0.47))
    eimer(EIMER)
    wasser = EIMER[2] + 0.2
    for i, (r, d) in enumerate(((0.028, 0.004), (0.055, 0.0035), (0.085, 0.003))):
        ring(f'Welle{i}', (x, y, wasser + 0.003), Z, r, r, d, mischung(TUERKIS, 0.6, WEISS))
    kugel('Spritzer', 0.007, TUERKIS, ort=(x, y, wasser + 0.03))


def eimer(m):
    kegelstumpf('Eimer', 0.13, 0.165, 0.3, material(TIEFSEE2, rauheit=0.5, glanz=0.2), m, offen=True, dicke=0.01, rundung=0.01)
    ring('Eimerrand', (m[0], m[1], m[2] + 0.3), Z, 0.165, 0.165, 0.011, PETROL)
    for i, zz in enumerate((0.08, 0.2)):
        r = 0.13 + 0.035 * zz / 0.3
        ring(f'Eimerrippe{i}', (m[0], m[1], m[2] + zz), Z, r + 0.002, r + 0.002, 0.006, TIEFSEE2)
    walze('Wasser', 0.142, 0.004, TUERKIS, 0.0, ort=(m[0], m[1], m[2] + 0.2), dreh=(0, 0, 0))
    # Bügel an zwei Ösen, nach vorne außen umgelegt
    M = Vector(m)
    for sx in (-1, 1):
        walze(f'Oese{sx}', 0.016, 0.012, PETROL, 0.004, ort=tuple(M + Vector((sx * 0.168, 0, 0.275))), dreh=(0, 90, 0))
    kipp = math.radians(118)
    def p(a):
        q = Vector((0.176 * math.cos(a), 0, 0.2 * math.sin(a)))
        return M + Vector((0, 0, 0.275)) + Vector((q.x, -q.z * math.sin(kipp), q.z * math.cos(kipp)))
    rohr('Buegel', [tuple(p(math.pi * i / 32)) for i in range(33)], 0.0045, CHROM)
    entlang('Buegelgriff', 0.012, 0.09, GUMMI, p(math.pi / 2), X, 0.004)


# ── Werkzeug ───────────────────────────────────────────────────────────────────

def rohrzange(n, d, s):
    """Rohrzange senkrecht zum Rohr: Mutter zwischen Hakenbacke (u < 0) und Festbacke (u > 0), Schaft und Griff
    entlang d, um v entlang s versetzt. Gehäuse und Griff orange lackiert, Backen und Stellmutter Chrom.
    Gibt den Griffpunkt der Faust am Griffende zurück (vor dem Aufhängeloch)."""
    d, s = Vector(d).normalized(), Vector(s).normalized()
    w = s.cross(d)
    rot = Matrix((d, w, s)).transposed()
    def L(u, v, t=0.0):
        return n + d * u + s * v + w * t
    flach_ = MUTTER_R * math.cos(math.radians(30))
    gerundet('Hakenbacke', L(-flach_ - 0.022, 0.04), rot, (0.044, 0.05, 0.18), CHROM, 0.012)
    gerundet('Festbacke', L(flach_ + 0.022, 0.04), rot, (0.044, 0.056, 0.18), CHROM, 0.012)
    gerundet('Hakenschaft', L(0.01, 0.13), rot, (0.22, 0.04, 0.042), CHROM, 0.012)
    for i in range(6):     # geriffelte Stellmutter
        entlang(f'Stellmutter{i}', 0.04 if i % 2 else 0.036, 0.0085, CHROM, L(0.0 + 0.0085 * i, 0.13), d, 0.002)
    gerundet('Gehaeuse', L(0.135, 0.128), rot, (0.15, 0.064, 0.092), ORANGE, 0.022)
    gerundet('Zangengriff', L(0.39, 0.13), rot, (0.38, 0.026, 0.03), ORANGE, 0.012)     # schlank, damit die Faust ihn fasst
    ring('Griffloch', L(0.545, 0.13, -0.014), w, 0.013, 0.009, 0.0035, TIEFSEE, quer=d)
    return L(0.45, 0.13)


def werkzeugkoffer(m, winkel):
    """Offener Koffer, Deckel nach hinten aufgeklappt, Werkzeug ragt heraus."""
    rot = Matrix.Rotation(math.radians(winkel), 3, 'Z')
    M = Vector(m)
    def p(x, y, zz):
        return M + rot @ Vector((x, y, zz))
    gerundet('Koffer', p(0, 0, 0.1), rot, (0.42, 0.24, 0.2), TIEFSEE2, 0.03)
    flach('Kofferinneres', [tuple(p(x, y, 0))[:2] for x, y in rundrechteck(0.37, 0.19, 0.02)], 0.004, TIEFSEE, 0.0, z=0.2)
    rohr('Kofferrand', [tuple(p(x, y, 0.203)) for x, y in rundrechteck(0.39, 0.21, 0.025)], 0.011, ORANGE, ring=True)
    u = Vector((0, 0.26, 0.966))
    n = Vector((1, 0, 0)).cross(u)
    deckel = rot @ Matrix((Vector((1, 0, 0)), u, n)).transposed()
    gerundet('Deckel', p(0, 0.125, 0.21) + rot @ (u * 0.12 + n * 0.018), deckel, (0.43, 0.24, 0.035), TIEFSEE2, 0.014)
    gerundet('Deckelrand', p(0, 0.125, 0.21) + rot @ (u * 0.235 + n * 0.018), deckel, (0.43, 0.02, 0.04), ORANGE, 0.008)
    for i, (x, f) in enumerate(((-0.13, ORANGE), (-0.08, TIEFSEE2))):
        rohr(f'Dreher{i}', [tuple(p(x, -0.03, 0.15)), tuple(p(x - 0.02, -0.05, 0.28))], 0.017, f)
        rohr(f'Klinge{i}', [tuple(p(x - 0.02, -0.05, 0.28)), tuple(p(x - 0.03, -0.06, 0.34))], 0.0055, CHROM)
    for i, x in enumerate((0.07, 0.11)):
        rohr(f'Zange{i}', [tuple(p(x, 0.0, 0.15)), tuple(p(x + 0.01, -0.02, 0.29)), tuple(p(0.095, -0.03, 0.35))],
             0.011, CHROM if i else ORANGE)


def taschenlampe(auflage_x, ziel, neigung=32):
    """Taschenlampe liegt auf der Abdeckung der Vorwand: der Kopf ragt über die Vorderkante (Auflage bei auflage_x),
    das Ende liegt auf einer Lappenrolle, so dass sie um neigung (Grad) nach vorne unten in Richtung ziel leuchtet.
    Die Linse leuchtet, ein Spot (nur aufs Motiv) hellt Verschraubung, Zange und Hände auf.
    Gibt (Spot, Griffpunkt am Lampenkörper, Leuchtrichtung) zurück: die rechte Faust hält die Lampe dort."""
    b = math.radians(neigung)
    oben = WAND_H + 0.04
    r_kopf, r_koerper, r_ende = 0.032, 0.022, 0.024
    vor, ende = 0.10, 0.25                                        # Auflage und Ende: Abstand von der Linse
    F = Vector((auflage_x, WAND_Y - 0.02, oben + r_koerper / math.cos(b)))   # Achse über der Vorderkante
    h = Vector((ziel[0] - F.x, ziel[1] - F.y, 0)).normalized()
    a = h * math.cos(b) - Z * math.sin(b)                         # Leuchtrichtung
    K = F + a * vor                                               # Linsenmitte
    hinten = K - a * ende
    r_rolle = (hinten.z - r_ende - oben) / 2
    entlang('Lappenrolle', r_rolle, 0.12, mischung(KALK, 0.3, TIEFSEE2), Vector((hinten.x, hinten.y, oben + r_rolle)),
            h.cross(Z), 0.015)
    entlang('Lampenende', r_ende, 0.03, TIEFSEE2, K - a * (ende - 0.015), a, 0.008)
    entlang('Schalter', 0.011, 0.012, ORANGE, K - a * (ende + 0.004), a, 0.004)
    entlang('Lampenkoerper', r_koerper, 0.15, TIEFSEE2, K - a * 0.145, a, 0.006)
    for i in range(3):
        entlang(f'Griffring{i}', r_koerper + 0.003, 0.008, ORANGE, K - a * (0.2 - 0.025 * i), a, 0.003)
    kegelstumpf_entlang('Lampenhals', r_koerper + 0.002, r_kopf, 0.04, K - a * 0.075, a)
    entlang('Lampenkopf', r_kopf, 0.04, CHROM, K - a * 0.02, a, 0.008)
    linse = bpy.data.materials.new('Linse-leuchtend')
    p = linse.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = linear(farbe(KALK))
    p.inputs['Emission Color'].default_value = linear(farbe(KALK))
    p.inputs['Emission Strength'].default_value = 5.0
    entlang('Linse', 0.026, 0.006, linse, K + a * 0.001, a, 0.002)
    ld = bpy.data.lights.new('Taschenlampe', 'SPOT')
    ld.energy, ld.color = 45, linear(farbe(KALK))[:3]
    ld.spot_size, ld.spot_blend, ld.shadow_soft_size = math.radians(50), 0.6, 0.02
    spot = bpy.data.objects.new('Taschenlampe', ld)
    bpy.context.scene.collection.objects.link(spot)
    spot.location = K + a * 0.01
    spot.rotation_euler = a.to_track_quat('-Z', 'Y').to_euler()
    treffer = K + a * ((Vector(ziel).z - K.z) / a.z)
    print(f'Lampe: Rolle r={r_rolle:.3f}, Strahl auf Zielhöhe bei ({treffer.x:.2f}, {treffer.y:.2f})')
    return spot, K - a * 0.145, a


def kartusche(m, winkel):
    """Silikonkartusche liegt oben auf der Vorwand: Petrol-Hülse, Kolbenboden orange, weiße Spitze."""
    d = Matrix.Rotation(math.radians(winkel), 3, 'Z') @ -X
    M = Vector((m[0], m[1], WAND_H + 0.04 + 0.026))
    entlang('Kartusche', 0.026, 0.2, PETROL, M, d, 0.006)
    entlang('Kolben', 0.027, 0.012, ORANGE, M - d * 0.094, d, 0.004)
    entlang('Kartuschenkopf', 0.018, 0.016, KALK, M + d * 0.108, d, 0.004)
    kegelstumpf_entlang('Spitze', 0.011, 0.004, 0.075, M + d * 0.114, d, KALK)


def kegelstumpf_entlang(name, r0, r1, laenge, p0, d, token=TIEFSEE2):
    """Kegelstumpf von p0 (Radius r0) entlang d (Radius r1 am Ende)."""
    d = Vector(d).normalized()
    bm = bmesh.new()
    rot = d.to_track_quat('Z', 'Y').to_matrix().to_4x4()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=stufen(48, 16), radius1=r0, radius2=r1, depth=laenge,
                          matrix=Matrix.Translation(Vector(p0) + d * laenge / 2) @ rot)
    return objekt(name, bm, token, 0.004)


def nur_aufs_motiv(licht):
    """Licht trifft nur Figur und Requisiten, nicht die Hohlkehle (wie die Bühnenlichter)."""
    c = bpy.data.collections.new('Lampenlicht')
    for ob in bpy.context.scene.objects:
        if ob.type == 'MESH' and ob.name != 'Hohlkehle':
            c.objects.link(ob)
    licht.light_linking.receiver_collection = c


# ── Figur ──────────────────────────────────────────────────────────────────────


def szene():
    vorwand()
    leitung()
    tropfen_und_eimer()
    werkzeugkoffer((0.98, 0.04, 0.0), -24)
    griff = rohrzange(MUTTER, ZANGE_D, ZANGE_S)

    becken, richtung, beugung = Vector((0.52, 0.315, 0.585)), -82, 16
    w = math.radians(richtung)
    vorne, links = Vector((math.sin(w), -math.cos(w), 0)), Vector((math.cos(w), math.sin(w), 0))
    fuss_l = becken + links * 0.095 + vorne * 0.4         # linkes Bein aufgestellt
    fuss_r = becken - links * 0.095 - vorne * 0.38        # rechtes Knie am Boden, Zehen aufgestellt
    # Linke Faust am Griffende drückt die Zange nach unten (Ellbogen zur Kamera, damit der Unterarm quer zum Griff
    # steht); die rechte Faust hält die Taschenlampe auf der Vorwand und leuchtet die Verschraubung aus
    spot, lampe_griff, lampe_a = taschenlampe(0.02, MUTTER + Vector((0, -0.04, 0.03)))
    figur('Fachkraft', becken=tuple(becken), richtung=richtung, beugung=beugung,
          griffpunkt_l=tuple(griff), griffradius_l=0.015, daumen_l=tuple(ZANGE_D), pol_ellbogen_l=(0.4, -1.0, 0.0),
          griffpunkt_r=tuple(lampe_griff), griffradius_r=0.022, daumen_r=tuple(lampe_a), pol_ellbogen_r=(0.2, 0.0, -1.0),
          fuss_l=(fuss_l.x, fuss_l.y, 0.09), fuss_r=(fuss_r.x, fuss_r.y, 0.19), zehen_r=True,
          pol_knie_l=tuple(vorne + Z), pol_knie_r=tuple(vorne - Z),
          blick=tuple(MUTTER + Vector((0.0, -0.3, 0.12))), haut='dunkel', haar='dunkel', kappe=ORANGE)
    kartusche((-0.68, 0.62), 28)
    nur_aufs_motiv(spot)
    return {
        'kamera': (-1.13, -1.85, 1.42),
        'blick': (0.05, 0.3, 0.99),
        'kegel': (1.45, 2.0, 1.2),
    }
