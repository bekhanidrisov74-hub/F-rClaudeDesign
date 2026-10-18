"""Bild 6 (Karte Haushaltsgeräte): Fachkraft kniet vor der Frontlader-Waschmaschine.

Tür offen, Sockelblende abgenommen und an den Wäschekorb gelehnt. Wie im korrigierten Bild
(design/bilder-chatgpt/bild-6.png): Die Fachkraft hält das herausgedrehte, kurze Pumpensieb mit Schraubdeckel und
Dichtung in der linken Faust vor sich hoch, die Taschenlampe in der rechten zeigt in die freie Pumpenöffnung unten
rechts an der Maschine. Daneben fängt eine flache Schale auf dem Handtuch das Restwasser aus dem separaten
Notentleerungsschlauch am festen Gehäuse auf. Die Kamera steht weiter zurück: Kopf bis Knie und die Pumpenöffnung
liegen im 4 : 3-Zuschnitt (Karte Desktop), Gesicht, Hände, Sieb, Lampe und Öffnung im Band für 16 : 9 (Handy).
"""
import math

import bpy
from fx3d import KALK, ORANGE, PETROL, TIEFSEE, TIEFSEE2, TUERKIS, WEISS, farbe, kugel, linear, material, mischung, platte, quader, rohr, tropfen, walze
from figur import HUEFTE, OBERSCHENKEL, UNTERSCHENKEL, ellipsoid, figur, gerundet, ring
from mathutils import Matrix, Vector

CHROM = material(WEISS, rauheit=0.16, metall=1.0, glanz=0.0)
GLAS = material(TIEFSEE, rauheit=0.05, glanz=0.9)
GUMMI = material(mischung(KALK, 0.22, TIEFSEE2), rauheit=0.6, glanz=0.1)
MATT = material(TIEFSEE2, rauheit=0.6, glanz=0.0)
KORB = mischung(PETROL, 0.55, TIEFSEE2)

BLICK = Vector((-0.05, -0.6, 0.66))
KAMERA = BLICK + Vector((-0.6, -2.3, 0.34)) * 1.12        # zurückgesetzt, damit die Pumpenöffnung im Bild bleibt
MX, FY, H = -0.45, 0.0, 0.85                      # Maschine: Mitte x, Vorderseite y, Höhe (0,6 × 0,6 × 0,85 m)
SOCKEL = 0.13                                     # Höhe der abgenommenen Sockelblende
SIEB = Vector((MX + 0.17, FY + 0.05, 0.066))      # Sieböffnung unten rechts
TUER = Vector((MX, FY, 0.45))                     # Mitte des Bullauges
SCHALE = Vector((MX - 0.03, FY - 0.22, 0.0))       # unter dem Notentleerungsschlauch links neben dem Sieb
TUCH = 0.012                                      # Handtuchdicke

# Fachkraft: kniet rechts vor der Maschine auf beiden Knien, Zehen aufgestellt, zur Kamera und etwas nach links gedreht.
# Hände in Körperlage (vor, links, hoch ab Becken): links das Sieb waagrecht wie am Lenker (Handrücken oben, Sieb ragt
# am Daumen zur Körpermitte), rechts tiefer die Lampe, zeigt schräg hinab in die Pumpenöffnung.
BECKEN, RICHTUNG, BEUGUNG = Vector((0.2, -0.4, 0.42)), -35.0, 15.0
KNIE_Z = 0.095                                    # Kniemitte über dem Boden
SIEB_LAGE = (0.58, 0.19, 0.5)
LAMPE_LAGE = (0.15, -0.25, 0.05)                   # neben der rechten Hüfte, nah an der Maschine


def koerper():
    """Vorne und links der Figur (waagrecht)."""
    w = math.radians(RICHTUNG)
    return Vector((math.sin(w), -math.cos(w), 0)), Vector((math.cos(w), math.sin(w), 0))


def ort(vor, seit, hoch):
    """Punkt in Körperlage: vor, seitlich nach links und hoch ab dem Becken."""
    vorne, links = koerper()
    return BECKEN + vorne * vor + links * seit + Vector((0, 0, hoch))


def kniend(seite):
    """Knöchelziel für ein kniendes Bein auf den Zehen: Knie am Boden vor der Hüfte, Knöchel 0.19 hoch dahinter."""
    vorne, links = koerper()
    huefte = BECKEN + links * seite * HUEFTE - Vector((0, 0, 0.05))
    dz = huefte.z - KNIE_Z
    knie = huefte + vorne * math.sqrt(OBERSCHENKEL ** 2 - dz ** 2) - Vector((0, 0, dz))
    knoechel = knie - vorne * math.sqrt(UNTERSCHENKEL ** 2 - (0.19 - KNIE_Z) ** 2)
    knoechel.z = 0.19
    return knoechel


def faustachse(teile, seite, gewuenscht):
    """Achse quer durch die greifende Faust (vom kleinen Finger zum Zeigefinger), aus den Fingeransätzen der Figur
    gelesen: Der Baukasten stellt sie senkrecht zum Unterarm, Werkzeug entlang dieser Achse liegt genau in der Hand."""
    t = {ob.name: ob.data.vertices for ob in teile}
    a = (t[f'Fachkraft{seite}Finger0'][0].co - t[f'Fachkraft{seite}Finger3'][0].co).normalized()
    print(f'FAUST {seite}: Achse {tuple(round(v, 2) for v in a)}, {math.degrees(a.angle(gewuenscht)):.0f}° neben dem Ziel')
    return a


def leuchtend(token, staerke):
    """Selbstleuchtend in einer Token-Farbe (Anzeige, Lampenglas)."""
    m = bpy.data.materials.new(f'leuchtend|{token}|{staerke}')
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = linear(farbe(token))
    p.inputs['Emission Color'].default_value = linear(farbe(token))
    p.inputs['Emission Strength'].default_value = staerke
    return m


def walze_achse(name, radius, laenge, token, rundung, mitte, achse):
    """Zylinder mit beliebiger Achse."""
    e = Vector(achse).to_track_quat('Z', 'Y').to_euler()
    return walze(name, radius, laenge, token, rundung, ort=tuple(mitte), dreh=tuple(math.degrees(v) for v in e))


def nur_aufs_motiv(licht):
    """Licht trifft nur Figur und Requisiten, nicht die Hohlkehle (wie die Bühnenlichter)."""
    c = bpy.data.collections.new('Lampenlicht')
    for ob in bpy.context.scene.objects:
        if ob.type == 'MESH' and ob.name != 'Hohlkehle':
            c.objects.link(ob)
    licht.light_linking.receiver_collection = c


# ── Waschmaschine ──────────────────────────────────────────────────────────────

def waschmaschine():
    l, r = MX - 0.3, MX + 0.3
    umriss = [(l, 0), (l + 0.035, 0), (l + 0.035, SOCKEL), (r - 0.035, SOCKEL), (r - 0.035, 0), (r, 0), (r, H), (l, H)]
    platte('Gehaeuse', umriss, 0.6, TIEFSEE2, 0.03, y=FY)
    quader('Sockelraum', (0.53, 0.55, SOCKEL + 0.01), TIEFSEE, 0.01, ort=(MX, FY + 0.05 + 0.275, SOCKEL / 2))
    # Bedienblende: Waschmittelschublade, Drehknopf, Anzeige, Tasten
    quader('Blende', (0.56, 0.025, 0.12), TIEFSEE, 0.012, ort=(MX, FY - 0.008, H - 0.09))
    quader('Schublade', (0.17, 0.02, 0.085), TIEFSEE2, 0.01, ort=(MX - 0.17, FY - 0.024, H - 0.09))
    quader('Griffmulde', (0.08, 0.01, 0.014), KALK, 0.004, ort=(MX - 0.17, FY - 0.035, H - 0.115))
    walze('Knopf', 0.042, 0.035, WEISS, 0.012, ort=(MX + 0.03, FY - 0.035, H - 0.09))
    quader('Knopfmarke', (0.008, 0.01, 0.03), ORANGE, 0.003, ort=(MX + 0.03, FY - 0.054, H - 0.07))
    quader('Anzeige', (0.11, 0.01, 0.034), leuchtend(TUERKIS, 1.5), 0.006, ort=(MX + 0.175, FY - 0.022, H - 0.072))
    for i, x in enumerate((0.135, 0.175, 0.215)):
        walze(f'Taste{i}', 0.009, 0.012, WEISS, 0.003, ort=(MX + x, FY - 0.024, H - 0.118))
    # Bullauge ohne Tür: Rahmen, Manschette, dunkle Trommel mit Rand und Mitnehmern
    ring('Rahmen', TUER + Vector((0, -0.003, 0)), (0, 1, 0), 0.232, 0.232, 0.007, CHROM, quer=(1, 0, 0))
    ring('Manschette', TUER + Vector((0, -0.012, 0)), (0, 1, 0), 0.198, 0.198, 0.026, GUMMI, quer=(1, 0, 0))
    walze('Trommel', 0.19, 0.012, TIEFSEE, 0.0, ort=tuple(TUER + Vector((0, -0.001, 0))))
    ring('Trommelrand', TUER + Vector((0, -0.008, 0)), (0, 1, 0), 0.15, 0.15, 0.005, CHROM, quer=(1, 0, 0))
    for i in range(3):
        a = math.radians(-90 + 120 * i)
        gerundet(f'Mitnehmer{i}', TUER + Vector((0.11 * math.cos(a), -0.008, 0.11 * math.sin(a))),
                 Matrix.Rotation(-a, 3, 'Y'), (0.05, 0.012, 0.018), TIEFSEE2, 0.005)
    # Die zweite orange Socke hängt aus der Trommel über die Manschette
    x = MX + 0.06
    rohr('Trommelsocke', [tuple(TUER + Vector(p)) for p in ((x - MX - 0.035, -0.03, -0.14), (x - MX, -0.045, -0.17), (x - MX, -0.057, -0.205),
                                                            (x - MX + 0.005, -0.06, -0.25), (x - MX + 0.018, -0.05, -0.29))], 0.018, ORANGE)
    # Waschmittelflasche mit Griff obenauf
    f = Vector((MX - 0.15, FY + 0.32, H))
    gerundet('Flasche', f + Vector((0, 0, 0.085)), Matrix.Identity(3), (0.12, 0.075, 0.17), PETROL, 0.03)
    walze('Flaschendeckel', 0.024, 0.035, ORANGE, 0.008, ort=tuple(f + Vector((-0.03, 0, 0.18))), dreh=(0, 0, 0))
    rohr('Flaschengriff', [tuple(f + Vector(p)) for p in ((0.03, 0, 0.165), (0.06, 0, 0.17), (0.075, 0, 0.13), (0.06, 0, 0.1))],
         0.013, PETROL)


def tuer(winkel):
    """Bullauge-Tür, links angeschlagen, um winkel nach vorne aufgeschwenkt."""
    mitte = TUER + Vector((0, -0.05, 0))
    scharnier = Vector((MX - 0.25, FY - 0.04, TUER.z))
    teile = [
        ring('Tuerring', mitte, (0, 1, 0), 0.212, 0.212, 0.036, WEISS, quer=(1, 0, 0)),
        walze('Tuerglas', 0.185, 0.026, GLAS, 0.008, ort=tuple(mitte)),
        kugel('Glasschale', 0.16, GLAS, ort=tuple(mitte + Vector((0, 0.03, 0))), mass=(1, 0.42, 1)),
        gerundet('Tuergriff', mitte + Vector((0.215, -0.018, 0)), Matrix.Identity(3), (0.04, 0.045, 0.13), WEISS, 0.016),
    ]
    for z in (0.11, -0.11):
        teile.append(gerundet(f'Scharnier{z}', Vector((MX - 0.235, FY - 0.035, TUER.z + z)), Matrix.Identity(3),
                              (0.05, 0.04, 0.05), CHROM, 0.01))
    m = Matrix.Translation(scharnier) @ Matrix.Rotation(math.radians(-winkel), 4, 'Z') @ Matrix.Translation(-scharnier)
    for ob in teile:
        ob.matrix_world = m @ ob.matrix_world


def sieboeffnung():
    ring('Siebrand', SIEB + Vector((0, -0.004, 0)), (0, 1, 0), 0.046, 0.046, 0.01, KALK, quer=(1, 0, 0))
    walze('Siebloch', 0.038, 0.01, TIEFSEE, 0.0, ort=tuple(SIEB + Vector((0, -0.001, 0))))
    ring('Gewinde', SIEB + Vector((0, -0.006, 0)), (0, 1, 0), 0.028, 0.028, 0.004, TIEFSEE2, quer=(1, 0, 0))
    # Notentleerung: kurzer Schlauch links neben dem Sieb, hängt in die Schale; der Stopfen liegt daneben
    p = Vector((MX + 0.05, FY + 0.05, 0.085))
    rand = SCHALE + Vector((0.043, 0.149, TUCH + 0.066))
    rohr('Notschlauch', [tuple(p), tuple(p + Vector((0.0, -0.06, -0.006))), tuple(p + Vector((-0.02, -0.105, -0.012))),
                         tuple(rand), tuple(rand + Vector((-0.012, -0.035, -0.006)))], 0.011, TIEFSEE2)
    walze('Stutzen', 0.016, 0.03, KALK, 0.005, ort=tuple(p + Vector((0, -0.005, 0))))
    walze('Schlauchstopfen', 0.013, 0.022, ORANGE, 0.005, ort=tuple(SCHALE + Vector((0.2, 0.0, TUCH + 0.011))), dreh=(0, 0, 0))
    # Was im Sieb steckte, liegt schon auf dem Handtuch: eine Münze und ein Knopf
    walze('Fundmuenze', 0.014, 0.003, CHROM, 0.001, ort=tuple(SCHALE + Vector((0.2, -0.1, TUCH + 0.0015))), dreh=(0, 0, 0))
    walze('Fundknopf', 0.011, 0.004, KALK, 0.0015, ort=tuple(SCHALE + Vector((0.24, -0.075, TUCH + 0.002))), dreh=(0, 0, 0))


def schale():
    rot = Matrix.Rotation(math.radians(-4), 3, 'Z')
    m = SCHALE + Vector((0.25, -0.06, TUCH / 2))
    gerundet('Handtuch', m, rot, (0.86, 0.4, TUCH), PETROL, 0.005)
    for dx in (-0.36, 0.36):
        gerundet(f'Tuchstreifen{dx}', m + rot @ Vector((dx, 0, TUCH / 2)), rot, (0.03, 0.4, 0.003), KALK, 0.001)
    walze('Schale', 0.16, 0.045, TIEFSEE2, 0.016, ort=tuple(SCHALE + Vector((0, 0, TUCH + 0.0225))), dreh=(0, 0, 0))
    ring('Schalenrand', SCHALE + Vector((0, 0, TUCH + 0.045)), (0, 0, 1), 0.155, 0.155, 0.009, KALK, quer=(1, 0, 0))
    walze('Wasser', 0.146, 0.004, TUERKIS, 0.0, ort=tuple(SCHALE + Vector((0, 0, TUCH + 0.044))), dreh=(0, 0, 0))
    # Restwasser tropft aus dem Schlauchende: Tropfen und Wellenringe auf dem Wasser
    unter = SCHALE + Vector((0.031, 0.105, TUCH + 0.0465))
    for i, r in enumerate((0.016, 0.03)):
        ring(f'Welle{i}', unter, (0, 0, 1), r, r, 0.0022, mischung(TUERKIS, 0.55, WEISS), quer=(1, 0, 0))
    tropfen('Tropfen', 0.016, TUERKIS, tuple(unter + Vector((0, 0, 0.004))))


def waeschekorb():
    m = Vector((MX - 0.71, FY + 0.2, 0.0))
    gerundet('Korb', m + Vector((0, 0, 0.15)), Matrix.Identity(3), (0.5, 0.36, 0.3), KORB, 0.04)
    gerundet('Korbrand', m + Vector((0, 0, 0.3)), Matrix.Identity(3), (0.53, 0.39, 0.035), KORB, 0.015)
    for i in range(4):  # Lüftungsschlitze vorne
        gerundet(f'Korbschlitz{i}', m + Vector((-0.15 + 0.1 * i, -0.181, 0.17)), Matrix.Identity(3), (0.05, 0.01, 0.14), TIEFSEE, 0.004)
    # Wäsche: flache, zerknautschte Stücke über dem Rand, ein Ärmel und eine Socke hängen vorne über
    for i, (dx, dy, dz, r, dreh, kipp, f) in enumerate((
            (-0.13, 0.04, 0.32, (0.14, 0.1, 0.045), 0.3, 0.2, KALK),
            (0.08, 0.06, 0.33, (0.13, 0.11, 0.05), -0.4, -0.25, mischung(PETROL, 0.6, WEISS)),
            (0.1, -0.06, 0.34, (0.11, 0.08, 0.045), 0.8, 0.15, mischung(PETROL, 0.6, WEISS)),
            (-0.06, -0.05, 0.355, (0.12, 0.09, 0.04), -0.2, -0.3, WEISS),
            (-0.02, 0.08, 0.375, (0.1, 0.08, 0.04), 1.2, 0.25, mischung(KALK, 0.6, TIEFSEE2)),
            (0.15, 0.03, 0.37, (0.1, 0.07, 0.035), 0.5, -0.35, mischung(PETROL, 0.4, TIEFSEE)))):
        ellipsoid(f'Waesche{i}', m + Vector((dx, dy, dz)), Matrix.Rotation(dreh, 3, 'Z') @ Matrix.Rotation(kipp, 3, 'X'), r, f)
    rohr('Aermel', [tuple(m + Vector(p)) for p in ((0.04, -0.08, 0.36), (0.06, -0.18, 0.345), (0.075, -0.215, 0.29),
                                                     (0.07, -0.222, 0.21))], 0.03, mischung(PETROL, 0.6, WEISS))
    rohr('Socke', [tuple(m + Vector((-0.12, -0.12, 0.35))), tuple(m + Vector((-0.14, -0.2, 0.33))),
                   tuple(m + Vector((-0.15, -0.21, 0.25))), tuple(m + Vector((-0.19, -0.22, 0.22)))], 0.022, ORANGE)
    # Sockelblende, mit der Langseite am Boden an den Korb gelehnt
    neigung = 22
    mitte = m + Vector((0.0, -0.18 - 0.012 - 0.065 * math.sin(math.radians(neigung)), 0.065 * math.cos(math.radians(neigung))))
    rot = Matrix.Rotation(math.radians(-neigung), 3, 'X')
    gerundet('Sockelblende', mitte, rot, (0.53, 0.016, 0.13), MATT, 0.006)
    for i in range(6):
        gerundet(f'Blendenschlitz{i}', mitte + rot @ Vector((-0.15 + 0.06 * i, -0.009, 0.0)), rot, (0.035, 0.004, 0.06), TIEFSEE, 0.002)
    for x in (-0.22, 0.22):
        gerundet(f'Blendenclip{x}', mitte + rot @ Vector((x, -0.01, 0.03)), rot, (0.03, 0.01, 0.025), KALK, 0.004)


# ── Werkzeug in den Händen ─────────────────────────────────────────────────────

def taschenlampe(mitte, a):
    """Stablampe quer durch die Faust (mitte, Achse a): Ende am kleinen Finger, Kopf ragt am Daumen heraus.
    Gibt den Spot zurück."""
    rohr('Lampenkoerper', [tuple(mitte - a * 0.07), tuple(mitte + a * 0.1)], 0.014, ORANGE)
    for i, t in enumerate((0.066, 0.082)):
        ring(f'Lampenrille{i}', mitte + a * t, a, 0.0145, 0.0145, 0.003, TIEFSEE2)
    walze_achse('Lampenhals', 0.022, 0.03, TIEFSEE2, 0.008, mitte + a * 0.11, a)
    walze_achse('Lampenkopf', 0.028, 0.045, TIEFSEE2, 0.01, mitte + a * 0.14, a)
    walze_achse('Lampenglas', 0.022, 0.005, leuchtend(WEISS, 8), 0.002, mitte + a * 0.163, a)
    walze_achse('Lampenende', 0.015, 0.014, CHROM, 0.004, mitte - a * 0.075, a)
    ld = bpy.data.lights.new('Lampenlicht', 'SPOT')
    ld.energy, ld.color = 4, linear(farbe(WEISS))[:3]
    ld.spot_size, ld.spot_blend, ld.shadow_soft_size = math.radians(30), 0.4, 0.01
    ob = bpy.data.objects.new('Lampenlicht', ld)
    bpy.context.scene.collection.objects.link(ob)
    ob.location = mitte + a * 0.17
    ob.rotation_euler = a.to_track_quat('-Z', 'Y').to_euler()
    return ob


def pumpensieb(mitte, a, g=1.2):
    """Herausgedrehtes Pumpensieb waagrecht in der Faust: Griffsteg des Schraubdeckels quer durch die Faust (mitte,
    Achse a), am Daumen der Deckel mit Gewinde und dunkler Dichtung, dahinter der kurze Siebkorb mit Schlitzen.
    g vergrößert das Sieb etwas über die echte Größe, damit es neben den kräftigen Händen lesbar bleibt."""
    rohr('Siebgriff', [tuple(mitte - a * 0.062), tuple(mitte + a * 0.06)], 0.013, KALK)
    walze_achse('Griffende', 0.017, 0.012, KALK, 0.004, mitte - a * 0.062, a)
    deckel = mitte + a * 0.06
    walze_achse('Schraubdeckel', 0.05 * g, 0.024 * g, KALK, 0.01, deckel + a * 0.012 * g, a)
    ring('Deckelgriffrand', deckel + a * 0.004 * g, a, 0.05 * g, 0.05 * g, 0.004 * g, ORANGE)
    walze_achse('Gewinde', 0.04 * g, 0.014 * g, KALK, 0.003, deckel + a * 0.031 * g, a)
    ring('Dichtung', deckel + a * 0.026 * g, a, 0.041 * g, 0.041 * g, 0.0055 * g, TIEFSEE2)
    unten = deckel + a * 0.038 * g                # Ende des Gewindes, dort beginnt der Siebkorb
    walze_achse('Siebkorb', 0.033 * g, 0.07 * g, KALK, 0.008, unten + a * 0.035 * g, a)
    walze_achse('Siebboden', 0.024 * g, 0.012 * g, KALK, 0.005, unten + a * 0.074 * g, a)
    ring('Siebrippe', unten + a * 0.035 * g, a, 0.0335 * g, 0.0335 * g, 0.0045 * g, KALK)
    zur_kamera = KAMERA - mitte
    q = (zur_kamera - a * zur_kamera.dot(a)).normalized()
    for i in range(8):
        s = Matrix.Rotation(math.radians(22.5 + 45 * i), 3, a) @ q
        for t0, t1 in ((0.008, 0.03), (0.04, 0.062)):
            rohr(f'Siebschlitz{i}{t0}', [tuple(unten + (a * t0 + s * 0.032) * g), tuple(unten + (a * t1 + s * 0.032) * g)],
                 0.0042 * g, TIEFSEE2)


def schraubendreher(mitte, winkel):
    d = Matrix.Rotation(math.radians(winkel), 3, 'Z') @ Vector((1, 0, 0))
    z = Vector((0, 0, TUCH + 0.017))
    rohr('Dreherheft', [tuple(mitte + z - d * 0.06), tuple(mitte + z + d * 0.04)], 0.017, ORANGE)
    rohr('Dreherklinge', [tuple(mitte + z + d * 0.04), tuple(mitte + z + d * 0.15)], 0.005, CHROM)
    walze_achse('Dreherspitze', 0.009, 0.012, CHROM, 0.003, mitte + z + d * 0.152, d)


def werkzeugkiste(m, winkel):
    """Offene Werkzeugkiste hinter der Fachkraft wie in Bild 1: Orange mit dunklem Rand, Deckel nach hinten aufgeklappt."""
    rot = Matrix.Rotation(math.radians(winkel), 3, 'Z')

    def p(x, y, z):
        return m + rot @ Vector((x, y, z))
    gerundet('Kiste', p(0, 0, 0.09), rot, (0.42, 0.22, 0.18), ORANGE, 0.03)
    gerundet('Kistenrand', p(0, 0, 0.185), rot, (0.43, 0.23, 0.02), TIEFSEE2, 0.008)
    gerundet('Kisteninneres', p(0, 0, 0.19), rot, (0.39, 0.19, 0.012), TIEFSEE, 0.004)
    auf = math.radians(78)  # Deckel um 102° geöffnet, lehnt leicht nach hinten
    gerundet('Deckel', p(0, 0.115 + 0.11 * math.cos(auf) + 0.018, 0.195 + 0.11 * math.sin(auf)),
             rot @ Matrix.Rotation(auf, 3, 'X'), (0.42, 0.22, 0.035), ORANGE, 0.015)
    for x in (-0.15, 0.15):
        gerundet(f'Verschluss{x}', p(x, -0.117, 0.165), rot, (0.04, 0.012, 0.05), TIEFSEE2, 0.005)
    # Werkzeug ragt heraus: zwei Schraubendreher, Zange, Wasserpumpenzange
    for i, (dx, dy, f, h) in enumerate(((-0.14, 0.02, PETROL, 0.12), (-0.09, -0.03, TIEFSEE2, 0.1))):
        a, b = p(dx, dy, 0.17), p(dx - 0.015, dy - 0.03, 0.17 + h)
        rohr(f'Kistendreher{i}', [tuple(a), tuple(b)], 0.016, f)
        rohr(f'Kistenklinge{i}', [tuple(b), tuple(b + (b - a).normalized() * 0.06)], 0.005, CHROM)
    for i, dx in enumerate((0.07, 0.11)):
        rohr(f'Kistenzange{i}', [tuple(p(dx, 0.0, 0.17)), tuple(p(dx + 0.01, -0.02, 0.29)), tuple(p(0.095, -0.03, 0.35))],
             0.011, CHROM if i else ORANGE)


def zange(mitte, winkel):
    """Kleine Zange flach auf dem Handtuch: orange Griffe, Chrom-Maul."""
    d = Matrix.Rotation(math.radians(winkel), 3, 'Z') @ Vector((1, 0, 0))
    q = Vector((-d.y, d.x, 0))
    z = Vector((0, 0, TUCH + 0.009))
    for sg in (1, -1):
        rohr(f'Zangengriff{sg}', [tuple(mitte + z - d * 0.015), tuple(mitte + z - d * 0.07 + q * sg * 0.016),
                                  tuple(mitte + z - d * 0.14 + q * sg * 0.026)], 0.009, ORANGE)
        rohr(f'Zangenmaul{sg}', [tuple(mitte + z - d * 0.015), tuple(mitte + z + d * 0.02 + q * sg * 0.006),
                                 tuple(mitte + z + d * 0.055 + q * sg * 0.002)], 0.006, CHROM)
    walze('Zangengelenk', 0.012, 0.012, CHROM, 0.003, ort=tuple(mitte + z - d * 0.012), dreh=(0, 0, 0))


def szene():
    waschmaschine()
    tuer(105)
    sieboeffnung()
    schale()
    waeschekorb()
    schraubendreher(Vector((-0.3, -0.4, 0)), 15)
    werkzeugkiste(Vector((0.68, 0.3, 0)), -18)
    zange(Vector((-0.5, -0.42, 0)), -25)

    vorne, links = koerper()
    sieb_griff, sieb_a = ort(*SIEB_LAGE), -links
    lampe_griff = ort(*LAMPE_LAGE)
    lampe_a = (SIEB - lampe_griff).normalized()          # Lampe zeigt in die Pumpenöffnung
    ellbogen = tuple(vorne * -0.3 - Vector((0, 0, 1)))  # Ellbogen unter dem Unterarm: der linke Unterarm zeigt nach vorne
    # Rechter Ellbogen nach hinten außen: So steht die Faustachse (und mit ihr die Lampe) schräg hinab zur Pumpenöffnung
    ellbogen_r = tuple(-links * 0.5 - vorne * 0.6)
    teile = figur('Fachkraft', becken=tuple(BECKEN), richtung=RICHTUNG, beugung=BEUGUNG,
                  griffpunkt_l=tuple(sieb_griff), daumen_l=tuple(sieb_a), griffpunkt_r=tuple(lampe_griff), daumen_r=tuple(lampe_a),
                  griffradius_l=0.013, griffradius_r=0.014,
                  fuss_l=tuple(kniend(1)), fuss_r=tuple(kniend(-1)), zehen_l=True, zehen_r=True,
                  pol_knie_l=tuple(vorne), pol_knie_r=tuple(vorne), pol_ellbogen_l=ellbogen, pol_ellbogen_r=ellbogen_r,
                  blick=tuple(sieb_griff + sieb_a * 0.16 + Vector((0, 0, 0.06))), haut='mittel', haar='dunkel', kappe=None,
                  uhr=False)
    pumpensieb(sieb_griff, faustachse(teile, 1, sieb_a))
    nur_aufs_motiv(taschenlampe(lampe_griff, faustachse(teile, -1, lampe_a)))
    return {
        'kamera': tuple(KAMERA),
        'blick': tuple(BLICK),
        'kegel': (0.0, 2.0, 0.95),
    }
