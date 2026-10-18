"""Bild 5 (Karte Elektro): Fachkraft mit Handschuhen prüft am offenen Sicherungskasten die Klemme des ausgelösten Automaten.

Der Kasten hängt an einer Wand, die von ihm schräg nach links vorne aus dem Bild läuft: So sieht die Kamera ins
Innere (etwa 53° zur Front) und zugleich das Gesicht der Fachkraft, die rechts davor steht, im Dreiviertelprofil.
Halbnah: Die linke Faust hält den Spannungsprüfer, die rechte Hand liegt offen am unteren rechten Rahmen.
Am Boden rechts Werkzeugtasche und Kabeltrommel, angeschnitten.
Zuschnitte: 16 : 9 zeigt Gesicht, beide Hände, Prüfer und Klemme; 4 : 3 die Figur von der Kappe bis zur Hüfte.
"""
import math

import bmesh
from mathutils import Matrix, Vector

from figur import figur, gerundet, ring
from fx3d import KALK, ORANGE, PETROL, TIEFSEE, TIEFSEE2, TUERKIS, WEISS, material, objekt, rohr

CHROM = material(WEISS, rauheit=0.16, metall=1.0, glanz=0.0)
WAND = material(TIEFSEE, rauheit=1.0, glanz=0.0)
Z = Vector((0, 0, 1))

# Kasten: Rückseite an der Wandfront, Front schaut um WINKEL nach rechts gedreht zur Kamera
WINKEL = 47
KAMERA, BLICK = (-0.684, -1.518, 1.834), (-0.04, 0.68, 1.41)   # Kappe im 16:9-Band, Augenhöhe wie in der Serie
KASTEN = Vector((-0.45, 0.55, 1.32))
N = Vector((math.sin(math.radians(WINKEL)), -math.cos(math.radians(WINKEL)), 0))   # Front (aus dem Kasten heraus)
U = (-N).cross(Z)                                                                    # rechts, von vorne gesehen
ROT = Matrix((U, N, Z)).transposed()

BREITE, HOEHE, TIEFE = 0.54, 0.7, 0.13
MODUL = 0.06
REIHEN = (0.14, -0.14)        # Höhe der Hutschienen (lokal)
AUSGELOEST = (0, 5)           # obere Reihe, sechster Automat


def k(u, n, z):
    """Kasten-Koordinaten → Welt."""
    return KASTEN + U * u + N * n + Z * z


def zylinder(name, a, b, r1, farbe, rundung=0.0, r2=None):
    a, b = Vector(a), Vector(b)
    achse = b - a
    rot = achse.to_track_quat('Z', 'Y').to_matrix().to_4x4()
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=48, radius1=r1, radius2=r1 if r2 is None else r2,
                          depth=achse.length, matrix=Matrix.Translation((a + b) / 2) @ rot)
    return objekt(name, bm, farbe, rundung)


def teil(name, u, n, z, groesse, farbe, rundung):
    return gerundet(name, k(u, n, z), ROT, groesse, farbe, rundung)


# ── Wand und Kasten ────────────────────────────────────────────────────────────

def wand():
    """Wand vom Kasten nach links vorne aus dem Bild: ihre im Softboxlicht helle Stirnseite bleibt außerhalb."""
    links, rechts, tiefe, hoehe = -1.6, 0.39, 0.12, 2.6
    breite, mitte = rechts - links, (links + rechts) / 2
    gerundet('Wand', Vector((*k(mitte, -tiefe / 2, 0)[:2], hoehe / 2)), ROT, (breite, tiefe, hoehe), WAND, 0.02)
    gerundet('Sockelleiste', Vector((*k(mitte, 0.006, 0)[:2], 0.04)), ROT, (breite + 0.004, 0.014, 0.08), TIEFSEE2, 0.004)
    # Kabelkanal vom Kasten nach oben, matt wie die Wand, damit das Bild dunkel bleibt
    oben = HOEHE / 2
    laenge = hoehe - (KASTEN.z + oben)
    teil('Kabelkanal', 0.1, 0.035, oben + laenge / 2, (0.1, 0.07, laenge), WAND, 0.01)


def gehaeuse():
    b, h, t, w = BREITE, HOEHE, TIEFE, 0.022
    teil('Rueckwand', 0, 0.01, 0, (b, 0.02, h), KALK, 0.006)
    teil('Montageplatte', 0, 0.022, 0, (b - 2 * w - 0.01, 0.006, h - 2 * w - 0.01), TIEFSEE, 0.002)
    for s in (1, -1):
        teil(f'Seite{s}', s * (b / 2 - w / 2), t / 2, 0, (w, t, h), KALK, 0.008)
        teil(f'Boden{s}', 0, t / 2, s * (h / 2 - w / 2), (b, t, w), KALK, 0.008)
    # Abdeckrahmen vorne (schmal, damit der Kasten nicht zur hellen Fläche wird)
    for s in (1, -1):
        teil(f'RahmenSeite{s}', s * (b / 2 - 0.02), t + 0.004, 0, (0.04, 0.012, h), KALK, 0.005)
        teil(f'RahmenQuer{s}', 0, t + 0.004, s * (h / 2 - 0.025), (b, 0.012, 0.05), KALK, 0.005)
    # Kabeleinführung oben
    for i, u in enumerate((-0.12, 0.0, 0.12)):
        zylinder(f'Einfuehrung{i}', k(u, 0.06, h / 2 - 0.03), k(u, 0.06, h / 2 + 0.012), 0.018, TIEFSEE2, 0.004)


def automat(name, u, zr, ausgeloest):
    teil(f'{name}Koerper', u, 0.062, zr, (MODUL - 0.004, 0.055, 0.16), WEISS, 0.007)
    teil(f'{name}Hals', u, 0.098, zr, (MODUL - 0.008, 0.022, 0.08), WEISS, 0.006)
    hz = zr - 0.024 if ausgeloest else zr + 0.024
    teil(f'{name}Hebel', u, 0.119, hz, (0.024, 0.026, 0.036), ORANGE if ausgeloest else TIEFSEE2, 0.006)
    for s in (1, -1):
        zylinder(f'{name}Schraube{s}', k(u, 0.088, zr + s * 0.062), k(u, 0.094, zr + s * 0.062), 0.01, CHROM, 0.002)


def fi_schalter(name, u, zr):
    """Fehlerstromschalter, zwei Teilungseinheiten breit, mit Prüftaste."""
    teil(f'{name}Koerper', u, 0.062, zr, (2 * MODUL - 0.004, 0.055, 0.16), WEISS, 0.007)
    teil(f'{name}Hals', u, 0.098, zr, (2 * MODUL - 0.008, 0.022, 0.08), WEISS, 0.006)
    teil(f'{name}Hebel', u - 0.016, 0.119, zr + 0.024, (0.04, 0.026, 0.036), TIEFSEE2, 0.006)
    zylinder(f'{name}Taste', k(u + 0.03, 0.108, zr - 0.024), k(u + 0.03, 0.118, zr - 0.024), 0.009, PETROL, 0.003)
    for du in (-MODUL / 2, MODUL / 2):
        for s in (1, -1):
            zylinder(f'{name}Schraube{du}{s}', k(u + du, 0.088, zr + s * 0.062), k(u + du, 0.094, zr + s * 0.062), 0.01, CHROM, 0.002)


def innenleben():
    """Oben FI-Schalter und fünf Automaten, unten sechs Automaten; rechts unten ein freies Stück Hutschiene."""
    farben = (TIEFSEE2, PETROL)
    def modul(i):
        return -3 * MODUL + i * MODUL
    for r, zr in enumerate(REIHEN):
        teil(f'Hutschiene{r}', 0, 0.031, zr, (BREITE - 0.07, 0.014, 0.035), CHROM, 0.003)
    fi_schalter('FI', modul(0.5), REIHEN[0])
    for i in range(2, 7):
        automat(f'Automat0{i}', modul(i), REIHEN[0], (0, i) == AUSGELOEST)
    for i in range(6):
        automat(f'Automat1{i}', modul(i), REIHEN[1], (1, i) == AUSGELOEST)
    # Leitungen: von oben in die oberen Klemmen, zwischen den Reihen, unten hinaus
    z0, z1 = REIHEN[0] + 0.08, REIHEN[1] - 0.08
    for i in range(7):
        u = modul(i)
        rohr(f'LeitungOben{i}', [tuple(k(-0.12 + 0.12 * (i // 3), 0.05, HOEHE / 2 - 0.02)),
                                 tuple(k(u, 0.05, z0 + 0.05)), tuple(k(u, 0.06, z0))], 0.0055, farben[i % 2])
    for i in range(6):
        u = modul(i)
        rohr(f'Bruecke{i}', [tuple(k(u, 0.06, REIHEN[0] - 0.08)), tuple(k(u, 0.052, 0.0)),
                             tuple(k(u, 0.06, REIHEN[1] + 0.08))], 0.005, farben[i % 2])
        rohr(f'LeitungUnten{i}', [tuple(k(u, 0.06, z1)), tuple(k(u, 0.05, z1 - 0.035)),
                                  tuple(k(u * 0.4, 0.045, -HOEHE / 2 + 0.03))], 0.0055, farben[(i + 1) % 2])


def tuer(oeffnung=148):
    """Tür an der linken Kante (Kamera-Seite), so weit aufgeschwenkt, dass die Kamera fast auf ihre Kante schaut:
    Der Kasten liest sich als offen, die helle Türfläche bleibt schmal."""
    a = math.radians(oeffnung)
    breite_u = math.cos(a) * U + math.sin(a) * N
    dicke_n = -math.sin(a) * U + math.cos(a) * N
    rot = Matrix((breite_u, dicke_n, Z)).transposed()
    angel = k(-BREITE / 2, TIEFE + 0.01, 0)
    mitte = angel + breite_u * (BREITE / 2) + dicke_n * 0.012
    gerundet('Tuer', mitte, rot, (BREITE, 0.024, HOEHE), KALK, 0.01)
    innen = mitte - dicke_n * 0.014
    gerundet('Tuerfutter', innen, rot, (BREITE - 0.08, 0.006, HOEHE - 0.08), TIEFSEE, 0.003)
    gerundet('Plantasche', innen - dicke_n * 0.006 + Z * 0.08, rot, (0.22, 0.008, 0.16), PETROL, 0.004)
    for z in (0.22, -0.22):
        zylinder(f'Scharnier{z}', angel + Z * (z - 0.04), angel + Z * (z + 0.04), 0.01, CHROM, 0.002)


# ── Requisiten am Boden ────────────────────────────────────────────────────────

def boden_z(y):
    """Höhe der Hohlkehle (Rundung ab y = 1,1, Radius 0,9) an der Stelle y."""
    return 0.0 if y <= 1.1 else 0.9 - math.sqrt(0.81 - min(y - 1.1, 0.9) ** 2)


def kabeltrommel(mitte, achse, zur_kamera):
    """Kabeltrommel im Rohrgestell: Flansche Orange, Wicklung Petrol, vorne die Steckdose wie im Elektro-Icon,
    Kurbel am Flansch, Tragebügel oben; das lose Kabelende liegt mit dem Stecker am Boden."""
    a = Vector(achse).normalized()                       # Achse; die Steckdosen-Seite liegt bei -a
    quer = a.cross(Z).normalized()
    quer = quer if quer.dot(Vector(zur_kamera)) > 0 else -quer
    r, fuss = 0.16, 0.025
    boden = boden_z(mitte[1])
    c = Vector((mitte[0], mitte[1], boden + fuss + r))
    for s in (1, -1):
        zylinder(f'Flansch{s}', c + a * s * 0.075, c + a * s * 0.092, r, ORANGE, 0.007)
    zylinder('Wicklung', c - a * 0.075, c + a * 0.075, 0.108, PETROL, 0.0)
    for i in range(6):
        ring(f'Windung{i}', c + a * (-0.0625 + 0.025 * i), a, 0.112, 0.112, 0.0115, PETROL)
    # Steckdose auf der Nabe: weißer Ring, Mulde in Petrol, zwei Buchsen, Erdungsbügel oben und unten
    vorne = c - a * 0.092
    zylinder('Dose', vorne, vorne - a * 0.03, 0.062, WEISS, 0.008)
    zylinder('Mulde', vorne - a * 0.025, vorne - a * 0.034, 0.047, PETROL, 0.003)
    for s in (1, -1):
        zylinder(f'Buchse{s}', vorne - a * 0.03 + quer * s * 0.018, vorne - a * 0.036 + quer * s * 0.018, 0.0085, TIEFSEE, 0.0)
    for s in (1, -1):
        gerundet(f'Erdung{s}', vorne - a * 0.034 + Z * s * 0.04, Matrix((quer, a, quer.cross(a))).transposed(), (0.02, 0.008, 0.008), WEISS, 0.003)
    # Kurbel am vorderen Flansch, oben hinten, damit sie nicht wie ein Mund unter der Dose sitzt
    kurbel = vorne + (Z * 0.7 - quer * 0.7).normalized() * 0.12
    zylinder('Kurbelarm', kurbel, kurbel - a * 0.03, 0.011, TIEFSEE2, 0.003)
    zylinder('Kurbelknauf', kurbel - a * 0.03, kurbel - a * 0.075, 0.016, TIEFSEE2, 0.006)
    # Rohrgestell: je Seite ein Bock mit zwei Füßen, oben ein Tragebügel mit Griff
    oben = c.z + r + 0.06
    for s in (1, -1):
        e = c + a * s * 0.11
        fuesse = [e + quer * 0.14, e - quer * 0.14]
        fuesse = [Vector((f.x, f.y, boden_z(f.y) + 0.012)) for f in fuesse]
        rohr(f'Bock{s}', [tuple(fuesse[0]), tuple(e), tuple(fuesse[1])], 0.011, TIEFSEE2)
        rohr(f'Steher{s}', [tuple(e), tuple(Vector((*e[:2], oben)))], 0.011, TIEFSEE2)
        zylinder(f'Achse{s}', e - a * s * 0.02, e + a * s * 0.012, 0.022, TIEFSEE2, 0.005)
    zylinder('Bügel', Vector((*(c + a * 0.11)[:2], oben)), Vector((*(c - a * 0.11)[:2], oben)), 0.011, TIEFSEE2)
    zylinder('Tragegriff', Vector((*(c + a * 0.06)[:2], oben)), Vector((*(c - a * 0.06)[:2], oben)), 0.019, PETROL, 0.006)
    # loses Kabelende: von der Wicklung zur Kamera hin auf den Boden, Bogen, Stecker
    b = Vector((c.x, c.y, 0))
    pkt = [b + quer * 0.2 - a * 0.03, b + quer * 0.3 - a * 0.1, b + quer * 0.33 - a * 0.22, b + quer * 0.28 - a * 0.33]
    pkt = [c + quer * 0.1 - Z * 0.06 - a * 0.02] + [Vector((q.x, q.y, boden_z(q.y) + 0.011)) for q in pkt]
    rohr('Kabel', [tuple(p) for p in pkt], 0.011, PETROL)
    ende = pkt[-1] + Z * 0.011
    richtung = (pkt[-1] - pkt[-2]).normalized()
    zylinder('Stecker', ende, ende + richtung * 0.06, 0.022, WEISS, 0.006)
    for s in (1, -1):
        seite = richtung.cross(Z).normalized() * s * 0.01
        zylinder(f'Stift{s}', ende + richtung * 0.06 + seite, ende + richtung * 0.085 + seite, 0.004, CHROM)


def werkzeugtasche(mitte, drehung):
    """Offene Werkzeugtasche, Vortasche zur Kamera; Henkel als weiche Bögen, nach außen gekippt."""
    rot = Matrix.Rotation(math.radians(drehung), 3, 'Z')
    m = Vector((mitte[0], mitte[1], 0))

    def p(x, y, z):
        return m + rot @ Vector((x, y, z))
    gerundet('Tasche', p(0, 0, 0.13), rot, (0.42, 0.22, 0.22), TIEFSEE2, 0.05)
    gerundet('Taschenboden', p(0, 0, 0.03), rot, (0.43, 0.23, 0.06), TIEFSEE, 0.022)
    gerundet('Taschenrand', p(0, 0, 0.232), rot, (0.38, 0.19, 0.03), ORANGE, 0.012)
    gerundet('Oeffnung', p(0, 0, 0.24), rot, (0.33, 0.13, 0.02), TIEFSEE, 0.008)
    gerundet('Vortasche', p(0, -0.115, 0.12), rot, (0.26, 0.03, 0.12), PETROL, 0.012)
    gerundet('Vortaschenrand', p(0, -0.13, 0.175), rot, (0.262, 0.012, 0.016), ORANGE, 0.005)
    kipp = math.radians(40)
    for s in (1, -1):
        bogen_pkt = [p(0.12 * math.cos(t), s * (0.085 + 0.11 * math.sin(t) * math.sin(kipp)), 0.235 + 0.11 * math.sin(t) * math.cos(kipp))
                     for t in (math.pi * i / 16 for i in range(17))]
        rohr(f'Henkel{s}', [tuple(q) for q in bogen_pkt], 0.012, ORANGE)
    # Werkzeug ragt heraus: zwei Schraubendreher mit Klinge nach oben, eine Kombizange
    for i, (x, f) in enumerate(((-0.12, PETROL), (-0.05, ORANGE))):
        zylinder(f'Dreher{i}', p(x, 0.01, 0.2), p(x - 0.02, 0.0, 0.36), 0.018, f, 0.007)
        zylinder(f'Klinge{i}', p(x - 0.02, 0.0, 0.36), p(x - 0.028, -0.003, 0.45), 0.0055, CHROM, r2=0.003)
    for i, dx in enumerate((0.06, 0.11)):
        rohr(f'Zangengriff{i}', [tuple(p(dx, 0.0, 0.18)), tuple(p(dx + 0.006, 0.0, 0.32))], 0.012, ORANGE)
        rohr(f'Zangenbacke{i}', [tuple(p(dx + 0.006, 0.0, 0.32)), tuple(p(0.085 + (dx - 0.085) * 0.3, 0.0, 0.37)),
                                 tuple(p(0.085 + (dx - 0.085) * 0.1, 0.0, 0.415))], 0.009, CHROM)


# ── Fachkraft ──────────────────────────────────────────────────────────────────

def pruefer(spitze, achse, griff):
    """Spannungsprüfer: Griff Orange mit türkisem Anzeigering, Chromspitze bis zur Klemme; griff = Mitte der Faust."""
    a = achse.normalized()
    t, g = Vector(spitze), Vector(griff)
    zylinder('PrueferSpitze', t - a * 0.075, t, 0.0055, CHROM, 0.0, r2=0.0025)
    zylinder('PrueferKragen', t - a * 0.095, t - a * 0.075, 0.016, TIEFSEE2, 0.004)
    zylinder('PrueferGriff', g - a * 0.065, t - a * 0.095, 0.017, PETROL, 0.008)
    ring('PrueferAnzeige', t - a * 0.115, a, 0.0175, 0.0175, 0.005, TUERKIS)


def szene():
    wand()
    gehaeuse()
    innenleben()
    tuer()
    werkzeugtasche((0.6, 1.1), -20)
    kabeltrommel((1.2, 1.28), (0.9, 0.42, 0), Vector(KAMERA) - Vector((1.2, 1.28, 0)))

    # Fachkraft rechts vor dem Kasten, zum Kasten gedreht und zugleich der Kamera zugewandt
    becken, richtung, beugung = Vector((*k(0.55, 0.32, 0)[:2], 0.96)), WINKEL - 110, 8
    kamera = Vector(KAMERA)
    # Prüfer in der linken Hand: Spitze an der unteren Klemme des ausgelösten Automaten, leicht abwärts in den Kasten.
    # Der Ellbogen hängt, so steht der Unterarm quer zum Prüfer und die Faust umschließt den Griff (griffpunkt_l),
    # Daumen zur Spitze, Handfläche zur Kamera. Die rechte Hand liegt offen am unteren rechten Rahmen, Finger über
    # der leeren Ecke unter der unteren Reihe. Orange Handschuhe, damit die Hände vor Kasten und Latzhose lesbar sind.
    r, i = AUSGELOEST
    spitze = k(-3 * MODUL + i * MODUL, 0.1, REIHEN[r] - 0.062)
    achse = (-N - Z * 0.2).normalized()
    griff = spitze - achse * 0.23
    pruefer(spitze, achse, griff)
    # Blick auf die Spitze, ein wenig zur Kamera gedreht, damit beide Augen zu sehen sind
    blick = spitze + (kamera - spitze).normalized() * 0.15 + Z * 0.12
    figur('Fachkraft', becken=becken, richtung=richtung, beugung=beugung,
          griffpunkt_l=tuple(griff), griffradius_l=0.017, daumen_l=tuple(achse), griff_l='greifen', pol_ellbogen_l=tuple(-Z),
          hand_r=tuple(k(0.3, 0.162, -0.24)), daumen_r=tuple(-U - Z), griff_r='offen', pol_ellbogen_r=tuple(-Z),
          blick=tuple(blick), haut='hell', haar='braun', kappe=ORANGE, handschuhe=ORANGE, aermel='gekrempelt')
    return {
        'kamera': tuple(kamera),
        'blick': BLICK,
        'kegel': (0.45, 2.0, 1.45),
    }
