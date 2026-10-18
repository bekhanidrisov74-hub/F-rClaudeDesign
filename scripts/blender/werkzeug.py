"""Werkzeug und Normteile, die mehrere Szenen brauchen (Bild 1 und 2): Sechskantmutter und verstellbarer
Maulschlüssel wie in den korrigierten Bildern (design/bilder-chatgpt/README.md)."""
import math

import bmesh
from fx3d import ORANGE, TIEFSEE, WEISS, material, objekt, walze
from figur import gerundet, ring
from mathutils import Matrix, Vector

CHROM = material(WEISS, rauheit=0.16, metall=1.0, glanz=0.0)


def entlang(name, r, laenge, token, mitte, d, rundung):
    """Walze mit Achse entlang d."""
    o = walze(name, r, laenge, token, rundung, dreh=(0, 0, 0))
    o.matrix_world = Matrix.Translation(mitte) @ Vector(d).to_track_quat('Z', 'Y').to_matrix().to_4x4()
    return o


def sechskant(name, r, laenge, mitte, achse, flaeche, token=CHROM, rundung=0.005):
    """Sechskant (Mutter, Schraubenkopf) mit Achse achse; zwei Schlüsselflächen stehen senkrecht zu flaeche."""
    a = Vector(achse).normalized()
    f = (Vector(flaeche) - a * Vector(flaeche).dot(a)).normalized()
    rot = Matrix((f.cross(a), f, a)).transposed()   # create_cone: lokale ±Y sind Flächennormalen
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=6, radius1=r, radius2=r, depth=laenge,
                          matrix=Matrix.Translation(mitte) @ rot.to_4x4())
    return objekt(name, bm, token, rundung)


def maulschluessel(n, d, s, weite, g=1.0):
    """Verstellbarer Maulschlüssel um die Mutter bei n. u läuft entlang d vom Maul zum Griffende, v entlang s quer
    dazu. Die glatten Backen liegen bei v = ±weite (Mitte bis Schlüsselfläche) an zwei Flächen der Mutter, das Maul
    öffnet nach −d; dahinter Kopf mit Rändelschnecke unter der beweglichen Backe, Hals, oranger Griff mit
    Aufhängeloch. g skaliert alles außer der Schlüsselweite. Gibt den Griffpunkt der Faust zurück."""
    d, s = Vector(d).normalized(), Vector(s).normalized()
    w = s.cross(d)
    rot = Matrix((d, w, s)).transposed()
    def L(u, v, t=0.0):
        return n + d * u * g + s * v + w * t * g
    gerundet('Festbacke', L(-0.004, weite + 0.014 * g), rot, tuple(x * g for x in (0.11, 0.026, 0.028)), CHROM, 0.009 * g)
    gerundet('Stellbacke', L(0.004, -weite - 0.013 * g), rot, tuple(x * g for x in (0.09, 0.024, 0.026)), CHROM, 0.008 * g)
    gerundet('Kopf', L(0.085, 0.006 * g), rot, (0.075 * g, 0.028 * g, 2 * weite + 0.075 * g), CHROM, 0.016 * g)
    for i in range(7):     # Rändelschnecke: abwechselnd dicke und dünne Scheiben entlang s
        entlang(f'Schnecke{i}', (0.0135 if i % 2 else 0.0115) * g, 0.0045 * g, CHROM,
                L(0.07, -weite - (0.012 - 0.0045 * (i - 3)) * g, -0.012), s, 0.001 * g)
    gerundet('Hals', L(0.15, 0.0), rot, tuple(x * g for x in (0.07, 0.024, 0.05)), CHROM, 0.01 * g)
    gerundet('Schluesselgriff', L(0.29, 0.0), rot, tuple(x * g for x in (0.24, 0.026, 0.036)), ORANGE, 0.012 * g)
    ring('Griffloch', L(0.385, 0.0, -0.014), w, 0.011 * g, 0.008 * g, 0.003 * g, TIEFSEE, quer=d)
    return L(0.3, 0.0)
