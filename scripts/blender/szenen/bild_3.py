"""Bild 3 (Karte Heizung & Klima): Techniker an der offenen Gastherme, misst mit Fühler und Messgerät.

Halbnah von links vorne: Kopf bis Hüfte füllen den 4:3-Zuschnitt. Die Therme hängt an der Studiowand, ihr
Abgasrohr und die Anschlüsse gehen in die Wand; unten links steht der Heizkörper (Gewerke-Motiv). Wie im
korrigierten Bild (design/bilder-chatgpt/bild-3.png): Die rechte Hand führt die Messsonde in den Prüfanschluss am
Abgasstutzen, ein durchgehender Probenschlauch läuft zum rechteckigen Messgerät, das die linke Hand direkt hält
(ohne Stiel); der Blick geht auf dessen Anzeige. Der türkise Kegel liegt hinter Kopf und Schultern der Figur.
"""
import math

import bpy
from fx3d import KALK, ORANGE, PETROL, TIEFSEE, TIEFSEE2, TUERKIS, WEISS, heizung, material, quader, rohr, walze
from figur import achsen, ellipsoid, figur, gerundet, ring
from mathutils import Matrix, Vector

CHROM = material(WEISS, rauheit=0.16, metall=1.0, glanz=0.0)
WAND_Y = 2.0                     # Studiowand (Hohlkehle senkrecht ab z = 0.9)
TX, TZ = -0.3, 1.0               # Therme: Mitte x, Unterkante z
TB, TH, TT = 0.44, 0.76, 0.38    # Therme: Breite, Höhe, Tiefe
TY = WAND_Y - TT / 2             # Therme: Mitte y
YV = WAND_Y - TT                 # Therme: Vorderkante y
KX, KZ, KF = TX - 0.02, TZ + 0.44, YV + 0.13   # Brennkammer: Mitte x, Mitte z, Vorderseite y

# Messsonde: Prüfanschluss vorne am Abgasstutzen in der offenen Therme (unter dem Deckel); der Griff liegt in der
# rechten Faust, der gerade Stab führt durch die offene Front schräg hinauf in den Anschluss
ABGAS_Z = TZ + 0.7
PRUEF_N = Vector((0.35, -0.94, 0)).normalized()                 # Anschluss schaut nach vorne, leicht zur Figur
SPITZE = Vector((KX, TY, ABGAS_Z)) + PRUEF_N * 0.05
GRIFF_F = Vector((-0.144, 1.56, 1.584))
ACHSE_F = (SPITZE - GRIFF_F).normalized()                        # vom Griff zur Spitze

# Figur: Becken, Drehung, Neigung; Kopfmitte wie in figur() (Hals 0.50 + 0.03 + 0.95 · KOPF über dem Becken)
BECKEN = Vector((0.26, 1.15, 0.965))
RICHTUNG, BEUGUNG = -50, 8
KOPF_HOEHE = 0.687

# Kamera halbnah von links vorne: Blickpunkt, Richtung zur Kamera, Abstand
BLICK = Vector((0.05, 1.3, 1.42))
KAMERA = BLICK + Vector((-0.24, -0.97, 0.1)).normalized() * 2.52


def glatt(punkte, r=0.05, n=8):
    """Polylinie mit runden Ecken (quadratische Bézier an jeder inneren Ecke)."""
    p = [Vector(q) for q in punkte]
    aus = [p[0]]
    for a, b, c in zip(p, p[1:], p[2:]):
        e = b - (b - a).normalized() * min(r, (b - a).length / 2)
        f = b + (c - b).normalized() * min(r, (c - b).length / 2)
        aus += [(1 - t) ** 2 * e + 2 * (1 - t) * t * b + t ** 2 * f for t in (i / n for i in range(n + 1))]
    aus.append(p[-1])
    return [tuple(q) for q in aus]


def koerper():
    """Achsen der Figur wie in figur(), um Requisiten an ihr auszurichten: vorne, links, oben (geneigt)."""
    w, b, z = math.radians(RICHTUNG), math.radians(BEUGUNG), Vector((0, 0, 1))
    vorne = Vector((math.sin(w), -math.cos(w), 0))
    links = Vector((math.cos(w), math.sin(w), 0))
    oben = (z * math.cos(b) + vorne * math.sin(b)).normalized()
    return vorne, links, oben


# ── Therme, Heizkörper ─────────────────────────────────────────────────────────

def therme():
    x0, z0, yv = TX, TZ, YV
    # Gehäuse ohne Front: Rückwand, Seiten, Deckel in Kalk, innen dunkle Dämmung
    quader('TRueckwand', (TB, 0.03, TH), KALK, 0.01, ort=(x0, WAND_Y - 0.015, z0 + TH / 2))
    for s in (-1, 1):
        quader(f'TSeite{s}', (0.024, TT, TH), KALK, 0.01, ort=(x0 + s * (TB / 2 - 0.012), TY, z0 + TH / 2))
    quader('TDeckel', (TB, TT, 0.03), KALK, 0.01, ort=(x0, TY, z0 + TH - 0.015))
    quader('TDaemmung', (TB - 0.05, 0.02, TH - 0.12), TIEFSEE2, 0.004, ort=(x0, WAND_Y - 0.04, z0 + 0.09 + (TH - 0.12) / 2))
    # Bedienblende unten: Manometer ohne Ziffern, zwei Drehknöpfe, Anzeige ohne Ziffern
    quader('TBlende', (TB, TT, 0.09), KALK, 0.015, ort=(x0, TY, z0 + 0.045))
    quader('TAnzeige', (0.1, 0.01, 0.034), TUERKIS, 0.004, ort=(x0 + 0.08, yv - 0.003, z0 + 0.048))
    mano = Vector((x0 - 0.15, yv - 0.004, z0 + 0.047))
    walze('TManometer', 0.023, 0.012, WEISS, 0.003, ort=tuple(mano))
    ring('TManoring', tuple(mano - Vector((0, 0.006, 0))), (0, 1, 0), 0.024, 0.024, 0.004, CHROM, quer=(1, 0, 0))
    rohr('TManozeiger', [tuple(mano - Vector((0, 0.008, 0))), tuple(mano + Vector((0.012, -0.008, 0.012)))], 0.0022, TIEFSEE2)
    for i, dx in enumerate((-0.085, -0.03)):
        walze(f'TKnopf{i}', 0.017, 0.02, TIEFSEE2, 0.005, ort=(x0 + dx, yv - 0.008, z0 + 0.048))
        rohr(f'TKnopfstrich{i}', [(x0 + dx, yv - 0.019, z0 + 0.052), (x0 + dx, yv - 0.019, z0 + 0.062)], 0.003, KALK)

    # Brennkammer mit aufgeschraubter Brennertür, Schauglas links unten, Messstutzen rechts oben (waagrecht, für den Winkelfühler)
    quader('Brennkammer', (0.28, 0.2, 0.22), PETROL, 0.03, ort=(KX, KF + 0.1, KZ))
    quader('Brennertuer', (0.2, 0.02, 0.16), PETROL, 0.012, ort=(KX - 0.03, KF - 0.008, KZ - 0.01))
    for i, (dx, dz) in enumerate(((-0.115, 0.065), (0.055, 0.065), (-0.115, -0.085), (0.055, -0.085))):
        walze(f'Schraube{i}', 0.009, 0.012, CHROM, 0.003, ort=(KX + dx, KF - 0.02, KZ + dz))
    quader('Schauglasrahmen', (0.06, 0.008, 0.042), CHROM, 0.006, ort=(KX - 0.07, KF - 0.019, KZ - 0.045))
    quader('Schauglas', (0.044, 0.008, 0.027), TIEFSEE, 0.004, ort=(KX - 0.07, KF - 0.022, KZ - 0.045))
    rohr('Pruefanschluss', [tuple(SPITZE - PRUEF_N * 0.01), tuple(SPITZE + PRUEF_N * 0.018)], 0.011, CHROM, 0.003)
    ring('Pruefmutter', tuple(SPITZE + PRUEF_N * 0.012), PRUEF_N, 0.016, 0.016, 0.005, CHROM)
    # Zündelektrode rechts unten mit Kabel zur Blende
    quader('Zuender', (0.026, 0.02, 0.03), KALK, 0.006, ort=(KX + 0.105, KF - 0.008, KZ - 0.06))
    rohr('Zuendkabel', glatt([(KX + 0.105, KF - 0.012, KZ - 0.075), (KX + 0.105, KF - 0.012, z0 + 0.25),
                              (x0 + 0.06, yv + 0.05, z0 + 0.12), (x0 + 0.06, yv + 0.05, z0 + 0.09)], 0.04), 0.004, TIEFSEE2)
    # Gebläse liegend über der Brennkammer, Motor links; Gasrohr von der Armatur rechts hoch ins Gebläse
    walze('Geblaese', 0.05, 0.16, PETROL, 0.015, ort=(KX, KF + 0.1, z0 + 0.62), dreh=(0, 90, 0))
    walze('Geblaesemotor', 0.034, 0.05, CHROM, 0.01, ort=(KX - 0.1, KF + 0.1, z0 + 0.62), dreh=(0, 90, 0))
    for i, dx in enumerate((-0.04, 0.0, 0.04)):
        ring(f'Geblaeserippe{i}', (KX + dx, KF + 0.1, z0 + 0.62), (1, 0, 0), 0.051, 0.051, 0.004, TIEFSEE2)
    # Pumpe links unten, Gasarmatur rechts unten
    walze('Pumpe', 0.045, 0.12, PETROL, 0.012, ort=(x0 - 0.14, yv + 0.22, z0 + 0.16))
    walze('Pumpenkopf', 0.03, 0.02, CHROM, 0.006, ort=(x0 - 0.14, yv + 0.152, z0 + 0.16))
    rohr('Ruecklauf', [(x0 - 0.15, yv + 0.24, z0 + 0.2), (x0 - 0.15, yv + 0.24, z0 + 0.34)], 0.014, CHROM)
    quader('Gasarmatur', (0.075, 0.1, 0.09), TIEFSEE2, 0.015, ort=(x0 + 0.12, yv + 0.22, z0 + 0.155))
    walze('Magnetspule', 0.024, 0.04, PETROL, 0.006, ort=(x0 + 0.12, yv + 0.2, z0 + 0.22), dreh=(0, 0, 0))
    rohr('Gasrohr', glatt([(x0 + 0.12, yv + 0.2, z0 + 0.24), (x0 + 0.12, yv + 0.2, z0 + 0.28), (x0 + 0.08, yv + 0.2, z0 + 0.28),
                           (x0 + 0.08, yv + 0.2, KZ - 0.1)], 0.03), 0.011, CHROM)
    rohr('Vorlauf', glatt([(KX - 0.1, yv + 0.3, KZ + 0.06), (x0 - 0.178, yv + 0.3, KZ + 0.06), (x0 - 0.178, yv + 0.3, z0 + 0.09)], 0.04),
         0.013, CHROM)
    # Anschlüsse unten mit Kugelhähnen, Gas mit orangem Hebel, dann in die Wand
    for i, dx in enumerate((-0.15, -0.06, 0.03, 0.12)):
        x = x0 + dx
        rohr(f'Anschluss{i}', glatt([(x, yv + 0.2, z0 + 0.01), (x, yv + 0.2, z0 - 0.15), (x, WAND_Y + 0.02, z0 - 0.15)], 0.06),
             0.013, CHROM)
        walze(f'Hahn{i}', 0.022, 0.05, CHROM, 0.008, ort=(x, yv + 0.2, z0 - 0.06), dreh=(0, 0, 0))
        quader(f'Hebel{i}', (0.018, 0.13, 0.014), ORANGE if i == 1 else TIEFSEE2, 0.006, ort=(x, yv + 0.12, z0 - 0.07))
    # Abgasrohr nach oben und in die Wand, mit Messöffnungen und Rosette
    zt = z0 + TH + 0.2
    rohr('Abgasrohr', glatt([(KX, TY, z0 + 0.64), (KX, TY, zt), (KX, WAND_Y + 0.03, zt)], 0.1), 0.05, KALK)
    ring('Abgasmuffe', (KX, TY, z0 + TH + 0.03), (0, 0, 1), 0.054, 0.054, 0.008, KALK)
    walze('Abgasmessloch', 0.011, 0.02, TIEFSEE2, 0.004, ort=(KX + 0.02, TY - 0.048, z0 + TH + 0.09), dreh=(90, 0, 22))
    walze('Rosette', 0.075, 0.02, KALK, 0.006, ort=(KX, WAND_Y - 0.008, zt))


def heizkoerper():
    """Gewerke-Motiv Heizung, verkleinert, steht auf seinen Füßen vor der Hohlkehle, Thermostat rechts unter der Therme."""
    vorher = set(bpy.data.objects)
    heizung()
    s = 0.5
    ort = Vector((-0.67, 0.99, 0.93 * s))
    m = Matrix.Translation(ort) @ Matrix.Scale(s, 4)
    for ob in set(bpy.data.objects) - vorher:
        ob.matrix_world = m @ ob.matrix_world
    # Anschlüsse: unter dem Thermostatventil und am unteren Sammler je ein Rohr mit Verschraubung in den Boden
    for name, punkte in (('HKVorlauf', [(ort.x + 0.67 * s, ort.y + 0.02, ort.z + 0.03 * s), (ort.x + 0.67 * s, ort.y + 0.02, -0.01)]),
                         ('HKRuecklauf', [(ort.x + 0.3 * s, ort.y + 0.04 * s, ort.z - 0.52 * s), (ort.x + 0.52 * s, ort.y + 0.04 * s, ort.z - 0.52 * s),
                                          (ort.x + 0.52 * s, ort.y + 0.04 * s, -0.01)])):
        rohr(name, glatt(punkte, 0.04), 0.012, CHROM)
        walze(f'{name}Rosette', 0.03, 0.008, CHROM, 0.003, ort=(punkte[-1][0], punkte[-1][1], 0.002), dreh=(0, 0, 0))
    walze('HKVerschraubung', 0.02, 0.04, CHROM, 0.006, ort=(ort.x + 0.42 * s, ort.y + 0.04 * s, ort.z - 0.52 * s), dreh=(0, 90, 0))


# ── Messung ────────────────────────────────────────────────────────────────────

def messung():
    """Sonde im Prüfanschluss (rechte Hand), Messgerät direkt in der linken Hand, dazwischen der Probenschlauch.
    Die Faust umschließt den Sondengriff bzw. den unteren Teil des Geräts. Gibt je Hand (Griffpunkt, Daumenrichtung)
    rechts und links sowie die Anzeige-Mitte zurück."""
    vorne, links, oben = koerper()
    # Sonde: oranger Griff in der Faust, dunkler Kragen, gerader Stab bis in den Anschluss
    g_r, u = GRIFF_F, ACHSE_F
    rohr('Sondengriff', [tuple(g_r - u * 0.075), tuple(g_r + u * 0.065)], 0.016, ORANGE, 0.004)
    rohr('Sondenkragen', [tuple(g_r + u * 0.065), tuple(g_r + u * 0.09)], 0.012, TIEFSEE2)
    rohr('Sonde', [tuple(g_r + u * 0.09), tuple(SPITZE + PRUEF_N * 0.005)], 0.0055, CHROM)

    # Messgerät: aufrecht in der linken Faust vor der Brust, die Faust hält den unteren Teil, darüber Tasten und
    # Anzeige, zum Gesicht und halb zur Kamera gedreht
    g_l = BECKEN + vorne * 0.36 + links * 0.14 + oben * 0.36
    achse = Vector((0.2, 0, 1)).normalized()  # quer zum Unterarm, der leicht ansteigt
    kopf = BECKEN + oben * KOPF_HOEHE
    zur_kamera = (KAMERA - g_l).normalized()
    n = (kopf - g_l).normalized() * 0.55 + zur_kamera * 0.45
    n = (n - achse * n.dot(achse)).normalized()
    rot = achsen(n, achse)
    mitte = g_l + achse * 0.06
    gerundet('Messgeraet', mitte, rot, (0.062, 0.034, 0.21), TIEFSEE2, 0.016)
    gerundet('Messrahmen', mitte - n * 0.004, rot, (0.07, 0.03, 0.218), ORANGE, 0.018)
    anzeige = g_l + n * 0.018 + achse * 0.12
    gerundet('Messanzeige', anzeige, rot, (0.046, 0.006, 0.05), TUERKIS, 0.004)
    for i in (-1, 0, 1):
        ellipsoid(f'Messtaste{i}', g_l + n * 0.018 + achse * 0.068 + rot.col[0] * i * 0.017, rot, (0.0065, 0.005, 0.0065), KALK, 16)

    # Probenschlauch vom Griffende der Sonde zum Fuß des Messgeräts, hängt vor dem Bauch durch
    a = g_r - u * 0.075
    b = mitte - achse * 0.105
    tief = min(a.z, b.z) - 0.12
    rohr('Probenschlauch', glatt([tuple(a), tuple(a - u * 0.06), tuple((a + b) / 2 + Vector((-0.04, -0.14, tief - (a.z + b.z) / 2))),
                                  tuple(b - achse * 0.06), tuple(b)], 0.07), 0.006, TIEFSEE2)
    return (g_r, u), (g_l, achse), anzeige


def szene():
    therme()
    heizkoerper()
    (griff_r, daumen_r), (griff_l, daumen_l), anzeige = messung()
    vorne, links, _ = koerper()
    fuss_l = BECKEN + links * 0.12 + vorne * 0.03
    fuss_r = BECKEN - links * 0.1 - vorne * 0.05
    fuss_l.z = fuss_r.z = 0.09
    figur('Fachkraft', becken=tuple(BECKEN), richtung=RICHTUNG, beugung=BEUGUNG,
          griffpunkt_l=tuple(griff_l), daumen_l=tuple(daumen_l), griffpunkt_r=tuple(griff_r), daumen_r=tuple(daumen_r),
          griffradius_l=0.022, griffradius_r=0.016,
          fuss_l=tuple(fuss_l), fuss_r=tuple(fuss_r), blick=tuple(anzeige + Vector((0, 0, 0.1))), haut='hell', haar='grau', kappe=None)
    return {
        'kamera': tuple(KAMERA),
        'blick': tuple(BLICK),
        'kegel': (0.5, 2.0, 1.35),           # hinter Kopf und Schultern
        'kegel_von': (0.12, 0.45, 4.25),     # weiter weg als üblich: In der Nähe wäre der Fleck zu hell und zu groß
    }
