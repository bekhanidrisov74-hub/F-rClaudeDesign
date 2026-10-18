"""Bild 1 (Hero): Installateurin hinter der Küchenzeile zieht die tropfende Armatur mit dem Schlüssel fest.

Halbnah: Kopf, beide Hände, Maulschlüssel und Armatur groß im Bild. Wie im freigegebenen Hero
(design/bilder-chatgpt/bild-1.png): Die rechte Faust führt den verstellbaren Maulschlüssel an der Sechskantmutter
unten am Armaturenfuß, die linke hält den Bogen des Auslaufs gegen; das Gesicht schaut freundlich zur Kamera.
Kamera knapp über der Platte und eine schmale Küchenzeile, damit Gesicht und Armatur in den Handy-Streifen passen und
die Plattenkante über der Schnellwahl bleibt.
Zuschnitte: Handy-Streifen 2 : 1 (y 30–80 %), Desktop hohe rechte Spalte (~0,75 : 1, x 19–94 %); unten liegt am
Desktop die Schnellwahl darüber (untere ~15 %), dort steht nur die Schrankfront.
"""
import math

from fx3d import KALK, ORANGE, PETROL, TIEFSEE, TIEFSEE2, TUERKIS, WEISS, material, quader, rohr, tropfen, walze
from figur import figur, gerundet, ring
from mathutils import Matrix, Vector
from werkzeug import maulschluessel, sechskant

CHROM = material(WEISS, rauheit=0.16, metall=1.0, glanz=0.0)
EDELSTAHL = material(WEISS, rauheit=0.32, metall=1.0, glanz=0.0)
SCHRANK = material(TIEFSEE, rauheit=0.2, glanz=0.0)  # glatter Lack: spiegelt den dunklen Boden, die Front bleibt dunkel
PLATTE_Z = 0.9225
ARMATUR = Vector((0.25, 0.42, PLATTE_Z))
# Verstellbarer Maulschlüssel: Backen an der Sechskantmutter am Armaturenfuß, Griff nach links quer zum rechten
# Unterarm, zur Hand hin leicht angehoben, damit die Kamera knapp über der Platte Kopf und Backen sieht
MUTTER = ARMATUR + Vector((0, 0, 0.07))
SCHLUESSEL_D = Vector((-math.cos(math.radians(20)), -math.sin(math.radians(20)), 0.3)).normalized()
KAMERA, BLICK = Vector((-0.335, -1.565, 1.24)), Vector((0.15, 0.47, 1.36))
SCHLUESSEL_G = 0.8                # Schlüssel kleiner als in Bild 2: Griff 24 cm vor der Mutter
SCHLUESSEL_KIPPUNG = 40           # Grad um den Stiel zur Kamera
MUTTER_R = 0.046                  # Eckmaß der Sechskantmutter um den Armaturenkörper (r = 0,036)


def rundrechteck(cx, cy, b, t, r, z, schritte=8):
    pkt = []
    for ex, ey, a0 in ((cx + b / 2 - r, cy + t / 2 - r, 0), (cx - b / 2 + r, cy + t / 2 - r, 90),
                       (cx - b / 2 + r, cy - t / 2 + r, 180), (cx + b / 2 - r, cy - t / 2 + r, 270)):
        pkt += [(ex + r * math.cos(math.radians(a0 + 90 * i / schritte)), ey + r * math.sin(math.radians(a0 + 90 * i / schritte)), z)
                for i in range(schritte + 1)]
    return pkt


def kueche():
    """Schmale Küchenzeile (Platte y 0 bis 0,5): Vorderkante und Armatur liegen im Bild eng beieinander."""
    quader('Unterschrank', (1.9, 0.44, 0.84), SCHRANK, 0.03, ort=(0, 0.25, 0.46))
    quader('Sockel', (1.84, 0.36, 0.06), SCHRANK, 0.01, ort=(0, 0.3, 0.03))
    quader('Arbeitsplatte', (1.98, 0.5, 0.045), KALK, 0.012, ort=(0, 0.25, PLATTE_Z - 0.0225))
    for i, x in enumerate((-0.62, 0.0, 0.62)):
        quader(f'Tuer{i}', (0.58, 0.025, 0.7), SCHRANK, 0.012, ort=(x, 0.02, 0.46))  # dunkel: mind. zwei Drittel des Bildes
        quader(f'Griff{i}', (0.18, 0.03, 0.022), WEISS, 0.01, ort=(x + (0.12 if i < 2 else -0.12), -0.005, 0.76))
    # Becken: dunkle Mulde mit Chromrand, Wasserring um den Aufprall
    quader('Becken', (0.56, 0.32, 0.004), EDELSTAHL, 0.0, ort=(0.25, 0.2, PLATTE_Z + 0.001))
    rohr('Beckenrand', rundrechteck(0.25, 0.2, 0.58, 0.34, 0.06, PLATTE_Z + 0.004), 0.008, CHROM, ring=True)
    ring('Wasserring', (0.25, 0.18, PLATTE_Z + 0.005), (0, 0, 1), 0.05, 0.035, 0.004, TUERKIS, quer=(1, 0, 0))


def auslauf(a):
    """Punkt und Richtung auf dem Bogen des Auslaufs (a = 0 senkrecht über dem Körper, π an der Spitze)."""
    x, y, z = ARMATUR
    return (Vector((x, y - 0.12 * (1 - math.cos(a)), z + 0.21 + 0.09 * math.sin(a))),
            Vector((0, -0.12 * math.sin(a), 0.09 * math.cos(a))).normalized())


# Linke Faust von rechts hinten um den Bogen des Auslaufs, Daumen den Bogen entlang nach vorne: Die Finger legen
# sich über die Vorderseite, die Kamera sieht sie
AUSLAUF_GRIFF, AUSLAUF_ACHSE = auslauf(math.radians(40))


def armatur():
    x, y, _ = ARMATUR
    walze('Dichtring', 0.052, 0.012, ORANGE, 0.004, ort=(x, y, PLATTE_Z + 0.006), dreh=(0, 0, 0))
    walze('Fuss', 0.046, 0.03, CHROM, 0.008, ort=(x, y, PLATTE_Z + 0.027), dreh=(0, 0, 0))
    walze('Koerper', 0.036, 0.17, CHROM, 0.01, ort=(x, y, PLATTE_Z + 0.125), dreh=(0, 0, 0))
    bogen = [tuple(auslauf(math.pi * i / 24)[0]) for i in range(25)]
    rohr('Auslauf', [(x, y, PLATTE_Z + 0.18)] + bogen + [(x, y - 0.24, PLATTE_Z + 0.17)], 0.015, CHROM, 0.004)
    walze('Strahlregler', 0.022, 0.02, CHROM, 0.005, ort=(x, y - 0.24, PLATTE_Z + 0.165), dreh=(0, 0, 0))
    rohr('Hebel', [(x, y + 0.01, PLATTE_Z + 0.22), (x, y + 0.08, PLATTE_Z + 0.27), (x, y + 0.13, PLATTE_Z + 0.285)], 0.012, CHROM)
    tropfen('Tropfen', 0.05, TUERKIS, (x, y - 0.24, PLATTE_Z + 0.085))


def schluessel():
    """Sechskantmutter am Armaturenfuß, verstellbarer Maulschlüssel mit glatten Backen an zwei ihrer Flächen.
    Gibt den Griffpunkt der Faust zurück."""
    # Wie im freigegebenen Hero um den Stiel zur Kamera gekippt, damit Kopf, Backen und Schnecke von vorne zu lesen
    # sind (die Kamera steht knapp über der Platte und sähe den waagrechten Schlüssel nur als Kante)
    quer = Vector((0, 0, 1)).cross(SCHLUESSEL_D).normalized()
    zur_kamera = (KAMERA - MUTTER).normalized()
    quer = max((Matrix.Rotation(math.radians(w), 3, SCHLUESSEL_D) @ quer for w in (SCHLUESSEL_KIPPUNG, -SCHLUESSEL_KIPPUNG)),
               key=lambda q: q.cross(SCHLUESSEL_D).dot(zur_kamera))
    sechskant('Mutter', MUTTER_R, 0.03, tuple(MUTTER), (0, 0, 1), quer, CHROM)
    return maulschluessel(MUTTER, SCHLUESSEL_D, quer, MUTTER_R * math.cos(math.radians(30)), g=SCHLUESSEL_G)


def werkzeugkiste():
    m = Vector((-0.55, 0.18, PLATTE_Z))
    gerundet('Kiste', m + Vector((0, 0, 0.09)), Matrix.Identity(3), (0.44, 0.24, 0.18), ORANGE, 0.03)
    gerundet('Kistenrand', m + Vector((0, 0, 0.185)), Matrix.Identity(3), (0.45, 0.25, 0.02), TIEFSEE2, 0.008)
    deckel = Matrix.Rotation(math.radians(-62), 3, 'X')
    gerundet('Deckel', m + Vector((0, 0.15, 0.245)), deckel, (0.44, 0.24, 0.035), ORANGE, 0.015)
    rohr('Henkel', [tuple(m + Vector((-0.12, 0.2, 0.33))), tuple(m + Vector((-0.1, 0.2, 0.37))),
                    tuple(m + Vector((0.1, 0.2, 0.37))), tuple(m + Vector((0.12, 0.2, 0.33)))], 0.014, TIEFSEE2)
    # Werkzeug ragt heraus: zwei Schraubendreher, eine Zange
    for i, (dx, f) in enumerate(((-0.12, PETROL), (-0.05, TIEFSEE2))):
        rohr(f'Dreher{i}', [tuple(m + Vector((dx, -0.02, 0.17))), tuple(m + Vector((dx - 0.02, -0.05, 0.27)))], 0.016, f)
        rohr(f'Klinge{i}', [tuple(m + Vector((dx - 0.02, -0.05, 0.27))), tuple(m + Vector((dx - 0.03, -0.065, 0.33)))], 0.005, CHROM)
    for i, dx in enumerate((0.07, 0.11)):
        rohr(f'Zange{i}', [tuple(m + Vector((dx, 0.0, 0.17))), tuple(m + Vector((dx + 0.01, -0.02, 0.3))),
                           tuple(m + Vector((0.095, -0.03, 0.36)))], 0.011, CHROM if i else ORANGE)
    # Ersatzteile auf der Platte: Kartusche und zwei Dichtringe
    walze('Kartusche', 0.028, 0.07, WEISS, 0.006, ort=(-0.18, 0.08, PLATTE_Z + 0.035), dreh=(0, 0, 0))
    walze('Spindel', 0.01, 0.03, CHROM, 0.003, ort=(-0.18, 0.08, PLATTE_Z + 0.085), dreh=(0, 0, 0))
    for i, (x, y) in enumerate(((-0.07, 0.05), (-0.02, 0.1))):
        ring(f'Dichtung{i}', (x, y, PLATTE_Z + 0.006), (0, 0, 1), 0.02, 0.02, 0.006, ORANGE, quer=(1, 0, 0))


def szene():
    kueche()
    armatur()
    werkzeugkiste()
    griff = schluessel()
    figur('Fachkraft', becken=(0.0, 0.8, 0.9), richtung=15, beugung=34,
          griffpunkt_r=tuple(griff), griffradius_r=0.013, daumen_r=tuple(-SCHLUESSEL_D), pol_ellbogen_r=(-0.4, 0.7, 0.3),
          griffpunkt_l=tuple(AUSLAUF_GRIFF), griffradius_l=0.015, daumen_l=tuple(AUSLAUF_ACHSE), pol_ellbogen_l=(0.8, 0.35, 0.25),
          blick=(0.15, -0.5, 1.15), haut='mittel', haar='braun')
    return {
        'kamera': tuple(KAMERA),
        'blick': tuple(BLICK),
        'kegel': (0.3, 2.0, 1.2),
    }
