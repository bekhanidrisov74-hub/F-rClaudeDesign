"""Bild 4 (Karte Schlüsseldienst): Fachkraft kniet vor einer Wohnungstür und öffnet den Profilzylinder mit
Spanner und Pick; auf der Matte die ausgerollte Werkzeugrolle, ein Schlüsselbund, ein Ersatzzylinder und der offene
Koffer mit Vorratszylindern, im Deckel Schraubendreher und Taschenlampe (halbnah ist davon nur der Kofferdeckel im Bild).

Halbnah: Kopf bis Knie füllen den 4:3-Zuschnitt, Gesicht, Hände und Zylinder liegen im mittleren Band (16:9).
Die Tür steht links und zeigt schräg nach rechts vorne, die Fachkraft kniet rechts neben dem Schloss, fast frontal
zur Kamera, und schaut auf den Zylinder. Die linke Faust führt den Pick (Ellbogen vor der Brust, Unterarm quer zum
Schaft), die rechte Hand liegt offen am Spanner und hält die Spannung. Tür und Matte werden im Tür-System gebaut
(Schlüsselkanal bei x = 0, Türfront bei y = 0, −Y schaut aus der Tür) und mit TUER gedreht.
"""
import math

import bpy
from fx3d import KALK, ORANGE, PETROL, TIEFSEE, TIEFSEE2, WEISS, material, mischung, platte, quader, rohr, walze
from figur import achsen, ellipsoid, figur, gerundet, ring, stoff
from mathutils import Matrix, Vector

CHROM = material(WEISS, rauheit=0.16, metall=1.0, glanz=0.0)
EDELSTAHL = material(WEISS, rauheit=0.32, metall=1.0, glanz=0.0)
LEDER = mischung(ORANGE, 0.5, TIEFSEE2)
ZARGE = TIEFSEE

DREHUNG = 72                      # Türfront schaut nach rechts vorne
TUER = Matrix.Translation((-0.25, 0.55, 0)) @ Matrix.Rotation(math.radians(DREHUNG), 4, 'Z')
ZC, ZD = 1.0, 1.15                # Zylindermitte, Drückerachse
MATTE = 0.016                     # Höhe der Fußmatte
KANAL_Y = -0.036                  # Vorderseite des Zylinders


def welt(p):
    return TUER @ Vector(p)


def gruppe(bauen, matrix):
    """Baut mit bauen() und setzt alle neuen Teile mit matrix an ihren Platz (Tür-System, liegende Teile)."""
    vorher = set(bpy.data.objects)
    bauen()
    for ob in set(bpy.data.objects) - vorher:
        ob.matrix_world = matrix @ ob.matrix_world


# ── Tür ────────────────────────────────────────────────────────────────────────

def rundrechteck(x0, x1, z0, z1, r, y, schritte=6):
    pkt = []
    for ex, ez, a0 in ((x1 - r, z1 - r, 0), (x0 + r, z1 - r, 90), (x0 + r, z0 + r, 180), (x1 - r, z0 + r, 270)):
        pkt += [(ex + r * math.cos(math.radians(a0 + 90 * i / schritte)), y, ez + r * math.sin(math.radians(a0 + 90 * i / schritte)))
                for i in range(schritte + 1)]
    return pkt


def tuer():
    xl, xr, h = -0.83, 0.075, 2.04
    quader('Tuerblatt', (xr - xl, 0.05, h), TIEFSEE2, 0.012, ort=((xl + xr) / 2, 0.025, h / 2 + 0.006))
    for i, (z0, z1) in enumerate(((0.16, 0.86), (1.0, 1.88))):
        rohr(f'Kassette{i}', rundrechteck(xl + 0.13, xr - 0.19, z0, z1, 0.04, -0.004), 0.009, TIEFSEE2, ring=True)
    zb, zt = 0.09, 0.16
    for name, x in (('ZargeL', xl - 0.004 - zb / 2), ('ZargeR', xr + 0.004 + zb / 2)):
        quader(name, (zb, zt, h + 0.1), ZARGE, 0.014, ort=(x, 0.06, (h + 0.1) / 2))
    quader('ZargeOben', (xr - xl + 2 * zb + 0.008, zt, zb), ZARGE, 0.014, ort=((xl + xr) / 2, 0.06, h + 0.055))
    quader('Schwelle', (xr - xl + 0.18, 0.2, 0.02), EDELSTAHL, 0.006, ort=((xl + xr) / 2, 0.02, 0.01))
    # Bänder an der Bandseite: Rolle im Spalt zwischen Türblatt und Zarge
    for i, z in enumerate((0.3, 1.02, 1.76)):
        walze(f'Band{i}', 0.013, 0.13, EDELSTAHL, 0.004, ort=(xl - 0.004, -0.012, z), dreh=(0, 0, 0))
        for j, dz in enumerate((-0.072, 0.072)):
            walze(f'Bandkappe{i}{j}', 0.01, 0.014, EDELSTAHL, 0.004, ort=(xl - 0.004, -0.012, z + dz), dreh=(0, 0, 0))
    # Türspion
    walze('Spion', 0.018, 0.02, CHROM, 0.005, ort=((xl + xr) / 2, -0.006, 1.55))
    walze('Linse', 0.009, 0.006, TIEFSEE, 0.002, ort=((xl + xr) / 2, -0.016, 1.55))


def beschlag():
    quader('Langschild', (0.1, 0.02, 0.37), EDELSTAHL, 0.012, ort=(0, -0.01, ZC + 0.07))
    # Profilzylinder: Kreis mit Steg nach unten, steht 1,6 cm vor dem Schild
    r, s, unten = 0.025, 0.014, -0.068
    a0 = math.degrees(math.atan2(-math.sqrt(r * r - s * s), s))
    umriss = [(r * math.cos(math.radians(a0 + (180 - 2 * a0) * i / 40)), ZC + r * math.sin(math.radians(a0 + (180 - 2 * a0) * i / 40)))
              for i in range(41)]
    umriss += [(s * math.cos(math.radians(180 + 180 * i / 16)), ZC + unten + s + s * math.sin(math.radians(180 + 180 * i / 16)))
               for i in range(17)]
    platte('Zylinder', umriss, 0.03, CHROM, 0.004, y=KANAL_Y)
    ring('Kernspalt', (0, KANAL_Y - 0.0005, ZC), (0, 1, 0), 0.017, 0.017, 0.0016, TIEFSEE2, quer=(1, 0, 0))
    quader('Kanal', (0.008, 0.004, 0.056), TIEFSEE, 0.002, ort=(0, KANAL_Y - 0.001, ZC - 0.018))
    # Drücker: Hals und Hebel Richtung Bandseite
    walze('Drueckerhals', 0.021, 0.045, EDELSTAHL, 0.006, ort=(0, -0.04, ZD))
    rohr('Druecker', [(0, -0.058, ZD), (-0.025, -0.07, ZD), (-0.13, -0.07, ZD - 0.004), (-0.155, -0.064, ZD - 0.014)],
         0.013, EDELSTAHL, 0.004)


def matte():
    x0, x1, y0, y1 = -0.625, 1.0, -1.12, -0.11
    gerundet('Matte', Vector(((x0 + x1) / 2, (y0 + y1) / 2, MATTE / 2)), Matrix.Identity(3), (x1 - x0, y1 - y0, MATTE), TIEFSEE, 0.006)
    rohr('Mattenrand', [(x, y, z) for x, z, y in rundrechteck(x0 + 0.025, x1 - 0.025, y0 + 0.05, y1 - 0.05, 0.04, MATTE)], 0.006,
         ORANGE, ring=True)


# ── Bodenteile ─────────────────────────────────────────────────────────────────

def werkzeugrolle():
    """Ausgerollte Ledertasche mit Steckfächern, darin Picks mit bunten Griffen; hinten die Rolle."""
    gerundet('Rolle', Vector((0, 0, 0.005)), Matrix.Identity(3), (0.44, 0.24, 0.01), LEDER, 0.004)
    walze('Rollenende', 0.03, 0.24, LEDER, 0.006, ort=(0.25, 0, 0.03), dreh=(90, 0, 0))
    gerundet('Fachstreifen', Vector((0, -0.05, 0.014)), Matrix.Identity(3), (0.42, 0.11, 0.008), mischung(ORANGE, 0.62, TIEFSEE2), 0.003)
    for i in range(7):
        x = -0.18 + i * 0.06
        rohr(f'Naht{i}', [(x, -0.105, 0.019), (x, 0.005, 0.019)], 0.0018, KALK)
    griffe = (ORANGE, KALK, PETROL, ORANGE, KALK, PETROL)
    for i, f in enumerate(griffe):
        x = -0.15 + i * 0.06
        rohr(f'Pickgriff{i}', [(x, -0.09, 0.03), (x, 0.0, 0.03)], 0.011, f, 0.004)
        rohr(f'Pickschaft{i}', [(x, 0.0, 0.03), (x, 0.085, 0.0135)], 0.003, CHROM)
        rohr(f'Pickhaken{i}', [(x, 0.085, 0.0135), (x + 0.008, 0.095, 0.0135)], 0.003, CHROM)


def zylinder_profil(name, r=0.02, s=0.011, unten=-0.054, laenge=0.11, token=CHROM):
    """Liegender Zylinder (Vorrat im Koffer, Ersatz auf der Matte): Profil (Kreis mit Steg) entlang −Y ausgezogen, Schließbart in der Mitte."""
    a0 = math.degrees(math.atan2(-math.sqrt(r * r - s * s), s))
    umriss = [(r * math.cos(math.radians(a0 + (180 - 2 * a0) * i / 40)), r * math.sin(math.radians(a0 + (180 - 2 * a0) * i / 40)))
              for i in range(41)]
    umriss += [(s * math.cos(math.radians(180 + 180 * i / 16)), unten + s + s * math.sin(math.radians(180 + 180 * i / 16)))
               for i in range(17)]
    for teil, (y0, l) in (('A', (-laenge / 2, laenge / 2 - 0.008)), ('B', (0.008, laenge / 2 - 0.008))):
        platte(f'{name}{teil}', umriss, l, token, 0.003, y=y0)
    walze(f'{name}Bart', 0.017, 0.014, ORANGE, 0.003, ort=(0, 0, -0.012), dreh=(90, 0, 0))
    quader(f'{name}Kanal', (0.006, 0.003, 0.04), TIEFSEE, 0.0015, ort=(0, -laenge / 2 - 0.001, -0.012))


def schluesselbund():
    ring('Bundring', (0, 0, 0.006), (0, 0, 1), 0.032, 0.032, 0.004, CHROM, quer=(1, 0, 0))
    for i, (winkel, kopf) in enumerate(((-20, ORANGE), (25, KALK), (70, PETROL))):
        d = Vector((math.cos(math.radians(winkel)), math.sin(math.radians(winkel)), 0))
        q = Vector((-d.y, d.x, 0))
        rot = Matrix((d, q, Vector((0, 0, 1)))).transposed()
        mitte = d * 0.06
        gerundet(f'Reide{i}', mitte + Vector((0, 0, 0.007)), rot, (0.05, 0.04, 0.012), kopf, 0.006)
        gerundet(f'Halm{i}', mitte + d * 0.06 + Vector((0, 0, 0.004)), rot, (0.07, 0.014, 0.004), CHROM, 0.0015)
        for j in range(3):
            gerundet(f'Zahn{i}{j}', mitte + d * (0.045 + j * 0.016) + q * 0.009 + Vector((0, 0, 0.004)), rot,
             (0.008, 0.008, 0.004), CHROM, 0.001)


def koffer():
    """Offener Werkzeugkoffer: Schaumeinlage mit zwei Vorratszylindern, Deckel nach hinten aufgeklappt, innen Werkzeug."""
    gerundet('Koffer', Vector((0, 0, 0.055)), Matrix.Identity(3), (0.38, 0.2, 0.11), ORANGE, 0.025)
    gerundet('Schaum', Vector((0, 0, 0.104)), Matrix.Identity(3), (0.35, 0.17, 0.014), TIEFSEE, 0.004)
    for i, y in enumerate((-0.06, 0.03)):
        gruppe(lambda i=i: zylinder_profil(f'Vorrat{i}', laenge=0.1),
               Matrix.Translation((0, y, 0.118)) @ Matrix.Rotation(math.radians(90), 4, 'Z') @ Matrix.Rotation(math.radians(-90), 4, 'Y'))
    for x in (-0.12, 0.12):
        gerundet(f'Schnapper{x}', Vector((x, -0.104, 0.09)), Matrix.Identity(3), (0.04, 0.012, 0.035), CHROM, 0.006)

    def deckel():
        gerundet('Deckel', Vector((0, -0.1, 0.022)), Matrix.Identity(3), (0.38, 0.2, 0.044), ORANGE, 0.02)
        gerundet('Deckelschaum', Vector((0, -0.1, -0.001)), Matrix.Identity(3), (0.34, 0.16, 0.008), TIEFSEE, 0.003)
        rohr('Koffergriff', [(-0.07, -0.1, 0.044), (-0.06, -0.1, 0.075), (0.06, -0.1, 0.075), (0.07, -0.1, 0.044)], 0.011, TIEFSEE2)
        # Innen im Deckel unter Gummibändern: zwei Schraubendreher und die Taschenlampe
        for i, (y, griff) in enumerate(((-0.05, ORANGE), (-0.095, PETROL))):
            z = -0.017
            rohr(f'Dreher{i}', [(-0.13, y, z), (-0.04, y, z)], 0.012, griff, 0.004)
            rohr(f'Dreherschaft{i}', [(-0.04, y, z), (0.1, y, z)], 0.0045, CHROM)
            quader(f'Dreherspitze{i}', (0.012, 0.009, 0.003), CHROM, 0.001, ort=(0.104, y, z))
            for x, dz in ((-0.1, 0.013), (0.04, 0.0065)):  # Band über dem Griff und über dem Schaft
                gerundet(f'Gummiband{i}{x}', Vector((x, y, z - dz)), Matrix.Identity(3), (0.016, 0.032, 0.005), TIEFSEE2, 0.002)
        gruppe(taschenlampe, Matrix.Translation((-0.02, -0.145, -0.005)) @ Matrix.Rotation(math.radians(180), 4, 'X'))
        for x in (-0.06, 0.02):
            gerundet(f'Lampenband{x}', Vector((x, -0.145, -0.04)), Matrix.Identity(3), (0.016, 0.04, 0.005), TIEFSEE2, 0.002)
    gruppe(deckel, Matrix.Translation((0, 0.1, 0.11)) @ Matrix.Rotation(math.radians(-100), 4, 'X'))


def taschenlampe():
    walze('Lampenkoerper', 0.017, 0.13, TIEFSEE2, 0.005, ort=(0, 0, 0.017), dreh=(0, 90, 0))
    walze('Lampenkopf', 0.024, 0.045, CHROM, 0.006, ort=(0.085, 0, 0.024), dreh=(0, 90, 0))
    walze('Lampenglas', 0.018, 0.006, KALK, 0.002, ort=(0.108, 0, 0.024), dreh=(0, 90, 0))
    walze('Schalter', 0.006, 0.006, ORANGE, 0.002, ort=(0.0, 0, 0.035), dreh=(0, 0, 0))


def boden(bauen, x, y, winkel, z=MATTE, kippen=None):
    """Legt ein Bodenteil in Weltkoordinaten auf die Matte (die Kamera schaut entlang +Y)."""
    m = Matrix.Translation((x, y, z)) @ Matrix.Rotation(math.radians(winkel), 4, 'Z')
    gruppe(bauen, m @ kippen if kippen else m)


def bodenteile():
    """Rechts hinter dem knienden Bein. Bei der halbnahen Kamera ragt nur der Kofferdeckel mit Schraubendrehern und
    Taschenlampe von unten in den 4:3-Zuschnitt; Werkzeugrolle, Schlüsselbund und Ersatzzylinder liegen unter dem
    unteren Bildrand."""
    boden(koffer, 0.72, 1.14, 8)
    boden(werkzeugrolle, 0.465, 0.79, -5)
    boden(schluesselbund, 0.8, 0.86, -40)
    boden(lambda: zylinder_profil('Ersatzzylinder'), 0.4, 1.0, 75, z=MATTE + 0.02, kippen=Matrix.Rotation(math.radians(78), 4, 'Y'))


# ── Fachkraft und Werkzeug in der Hand ─────────────────────────────────────────

def rumpfachsen(richtung, beugung):
    w, b = math.radians(richtung), math.radians(beugung)
    vorne = Vector((math.sin(w), -math.cos(w), 0))
    links = Vector((math.cos(w), math.sin(w), 0))
    z = Vector((0, 0, 1))
    oben = (z * math.cos(b) + vorne * math.sin(b)).normalized()
    vorne_r = (vorne * math.cos(b) - z * math.sin(b)).normalized()
    return links, oben, vorne_r


def stab(name, a, b, breite, dicke, token, quer):
    """Flacher Stab von a nach b, breite entlang quer."""
    l = Vector(b) - Vector(a)
    y = l.normalized()
    x = (Vector(quer) - y * Vector(quer).dot(y)).normalized()
    rot = Matrix((x, y, x.cross(y))).transposed()
    return gerundet(name, (Vector(a) + Vector(b)) / 2, rot, (breite, l.length, dicke), token, min(breite, dicke) * 0.4)


def pick(spitze, richtung, laenge):
    """Pick: Schaft aus dem Kanal nach richtung, oranger Griff in der Faust. Gibt den Griffpunkt zurück."""
    k, r = Vector(spitze), Vector(richtung).normalized()
    punkt = k + r * laenge
    rohr('Pickschaft', [tuple(k), tuple(punkt - r * 0.06)], 0.0035, CHROM)
    rohr('Pickzwinge', [tuple(punkt - r * 0.07), tuple(punkt - r * 0.05)], 0.009, CHROM, 0.002)
    rohr('Pickgriff', [tuple(punkt - r * 0.055), tuple(punkt + r * 0.06)], 0.013, ORANGE, 0.005)
    return punkt


def spanner(innen, knick, richtung, laenge, quer):
    """Spanner: kurzer Schenkel unten im Kanal, flacher langer Schenkel nach richtung, am Ende der orange Griff."""
    k, r = Vector(knick), Vector(richtung).normalized()
    punkt = k + r * laenge
    stab('SpannerKurz', innen, k, 0.007, 0.0035, CHROM, quer)
    stab('SpannerLang', k, punkt + r * 0.06, 0.012, 0.0035, CHROM, quer)
    rohr('Spannergriff', [tuple(punkt - r * 0.035), tuple(punkt + r * 0.075)], 0.011, ORANGE, 0.004)
    return punkt


def kegel_hinter(kamera, punkt, hoehe=0.0):
    """Punkt an der Wand (y = 2), den die Kamera hinter punkt sieht."""
    k, p = Vector(kamera), Vector(punkt)
    t = (2.0 - k.y) / (p.y - k.y)
    return Vector((k.x + (p.x - k.x) * t, 2.0, k.z + (p.z - k.z) * t + hoehe))


def szene():
    gruppe(lambda: (tuer(), beschlag(), matte()), TUER)
    bodenteile()

    # Halbnah: Kamera schaut entlang +Y auf die Mitte zwischen Händen und Gesicht
    ziel = Vector((0.02, 0.6, 0.97))
    kamera = ziel + Vector((0, -2.0, 0.12))

    richtung_l, beugung = -85, 10
    richtung = richtung_l + DREHUNG
    vorne = TUER.to_3x3() @ Vector((math.sin(math.radians(richtung_l)), -math.cos(math.radians(richtung_l)), 0))
    becken = welt((0.54, -0.21, 0.46))
    # Pick oben gerade aus dem Kanal, Spanner unten im Kanal, langer Schenkel an der Türfront schräg nach unten.
    # Beide Werkzeuge liegen quer zum Unterarm, der Daumen zeigt zur Werkzeugspitze.
    dreh = TUER.to_3x3()
    pick_r = dreh @ Vector((-0.1, -0.98, -0.1))
    spanner_r = dreh @ Vector((-0.55, -0.18, -0.82))
    punkt_l = pick(welt((0.0, KANAL_Y + 0.006, ZC + 0.006)), pick_r, 0.17)
    punkt_r = spanner(welt((0.0, KANAL_Y + 0.014, ZC - 0.042)), welt((0.0, KANAL_Y - 0.006, ZC - 0.042)), spanner_r, 0.1,
                      dreh @ Vector((1, 0, 0)))
    pol_r = dreh @ Vector((0.3, -0.5, -1.0))  # Ellbogen tief und von der Tür weg: Unterarm bleibt vor der Zarge
    links, oben, vorne_r = rumpfachsen(richtung, beugung)
    pol_l = vorne * 0.6 - links * 0.5 - Vector((0, 0, 0.6))  # Ellbogen vor der Brust: Unterarm quer zum Pick

    # Blick auf den Zylinder, etwas zur Kamera gedreht, damit das Gesicht unter dem Schirm frei bleibt
    zylinder = welt((0.0, KANAL_Y, ZC))
    blick = zylinder + (kamera - zylinder).normalized() * 0.12
    # Linkes Bein kniet auf den Zehen (Knöchel hinter dem Knie), rechtes steht flach vor dem Körper
    fuss_l, fuss_r = welt((0.645, -0.295, MATTE + 0.19)), welt((0.1, -0.2, MATTE + 0.09))
    figur('Fachkraft', becken=becken, richtung=richtung, beugung=beugung,
          griffpunkt_l=punkt_l, griffpunkt_r=punkt_r, griffradius_l=0.013, griffradius_r=0.011, daumen_l=-pick_r, daumen_r=-spanner_r,
          griff_r='offen',  # rechte Hand liegt offen am Spannergriff und hält die Spannung
          pol_ellbogen_l=pol_l, pol_ellbogen_r=pol_r, fuss_l=fuss_l, fuss_r=fuss_r, zehen_l=True,
          pol_knie_l=vorne * 0.3 - Vector((0, 0, 1)),  # kniendes Bein: Knieschoner zeigt auf die Matte
          blick=tuple(blick), haut='braun', haar='dunkel', kappe=PETROL)
    # Gesäß und Schritt unter dem Gürtel: Im Knien klafft sonst unter der Schnalle eine dunkle Lücke zwischen den Beinen
    ellipsoid('FachkraftGesaess', becken - oben * 0.03, achsen(vorne_r, oben), (0.184, 0.135, 0.13), stoff(PETROL))

    kegel = kegel_hinter(kamera, welt((0.5, -0.2, 0.95)))
    return {
        'kamera': tuple(kamera),
        'blick': tuple(ziel),
        'kegel': tuple(kegel),
        'kegel_von': tuple(kegel + Vector((0, -0.7, 0.7))),
    }
