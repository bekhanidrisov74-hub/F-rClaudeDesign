"""Figuren-Baukasten: stilisierte Fachleute bei der Arbeit, im Stil der 3D-Icons (weich, glänzend, rund).

Eine Figur entsteht aus wenigen Zielpunkten in Weltkoordinaten: Becken, Blickrichtung, Rumpfneigung,
Handgelenke, Knöchel und Blickziel. Ellbogen und Knie setzt eine Zwei-Knochen-IK, damit Hände genau am
Werkzeug und Füße genau am Boden sitzen. Rumpf aus Ellipsoiden, Arme, Beine und Finger aus Skin-Ketten.

Details: Hände mit Handfläche, vier dreigliedrigen Fingern, Daumen und Nägeln (greifend oder offen);
Gesicht mit glänzenden Augen, geschwungenen Brauen und leichtem Lächeln; hochgekrempelte Ärmel, Uhr,
Beintasche, Stiefel mit Zehenkappe und Schnürung; Haut leicht durchscheinend, Stoff matt.

Kein Logo, keine Schrift auf der Kleidung: fixit247 vermittelt nur, die Figuren sind Leute der Fachbetriebe.
Hauttöne sind Mischungen der Token-Farben (wie color-mix in tokens.css), siehe HAUT.
"""
import math

import bmesh
import bpy
from mathutils import Matrix, Vector

from fx3d import KALK, ORANGE, PETROL, TIEFSEE, TIEFSEE2, WEISS, glaettung, material, mischung, objekt, rohr, stufen

HAUT = {
    'hell': mischung(ORANGE, 0.30, WEISS),
    'mittel': mischung(ORANGE, 0.55, WEISS),
    'braun': mischung(ORANGE, 0.62, TIEFSEE),
    'dunkel': mischung(ORANGE, 0.42, TIEFSEE),
}
HAAR = {'dunkel': TIEFSEE, 'braun': mischung(ORANGE, 0.35, TIEFSEE), 'grau': mischung(KALK, 0.7, TIEFSEE)}

# Maße (Meter, stilisiert: großer Kopf, kräftige Hände)
KOPF = 0.165
RUMPF = 0.50          # Becken bis Halsansatz
OBERARM, UNTERARM = 0.29, 0.26
OBERSCHENKEL, UNTERSCHENKEL = 0.42, 0.41
KNOECHEL = 0.09       # Knöchel über der Sohle
SCHULTER, HUEFTE = 0.19, 0.095

# Finger: (Versatz quer zur Hand, Längenfaktor) von Zeigefinger bis kleinem Finger; Glieder und Krümmung je Gelenk
FINGER = ((0.0315, 1.0), (0.0105, 1.08), (-0.0105, 1.0), (-0.0315, 0.8))
GLIEDER = (0.034, 0.024, 0.019)
KRUEMMUNG_OFFEN = (14, 12, 8)  # Grad je Gelenk, lockere offene Hand
KNOECHEL_D, FINGER_R = 0.088, 0.012  # Fingeransatz vor dem Handgelenk, Fingerdicke für den Griff


def _v(p):
    return Vector(p)


def stoff(farbe):
    """Kleidung: matter als Lack, damit Haut, Werkzeug und Chrom davor glänzen."""
    return material(farbe, rauheit=0.6, glanz=0.1)


def haut_material(farbe):
    """Haut: weich glänzend und leicht durchscheinend (Subsurface)."""
    m = material(farbe, rauheit=0.45, glanz=0.12)
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Subsurface Weight'].default_value = 0.25
    p.inputs['Subsurface Scale'].default_value = 0.02
    return m


def ik(wurzel, ziel, l1, l2, pol):
    """Zwei-Knochen-IK: Gelenk zwischen wurzel und ziel, zur Seite von pol gebeugt. Gibt (gelenk, ziel) zurück."""
    a, t = _v(wurzel), _v(ziel)
    d = t - a
    dist = min(d.length, l1 + l2 - 1e-4)
    richtung = d.normalized()
    t = a + richtung * dist  # zu weit: Arm oder Bein gestreckt in Richtung Ziel
    x = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist)
    h = math.sqrt(max(l1 * l1 - x * x, 0))
    p = _v(pol)
    p = (p - richtung * p.dot(richtung))
    p = p.normalized() if p.length > 1e-6 else richtung.orthogonal().normalized()
    return a + richtung * x + p * h, t


def achsen(vorne, oben):
    """3×3-Matrix mit Spalten (links, hinten, oben): lokale −Y schaut nach vorne, wie in fx3d."""
    f = _v(vorne).normalized()
    o = (_v(oben) - f * _v(oben).dot(f)).normalized()
    links = o.cross(f).normalized()
    return Matrix((links, -f, o)).transposed()


def ellipsoid(name, mitte, rot, radien, farbe, segmente=48, mindestens=16):
    """mindestens: Segmente, die auch die 3D-Objekte der Seite behalten (fx3d.stufen)."""
    bm = bmesh.new()
    m = Matrix.Translation(mitte) @ rot.to_4x4() @ Matrix.Diagonal((*radien, 1))
    bmesh.ops.create_uvsphere(bm, u_segments=stufen(segmente, mindestens), v_segments=stufen(segmente // 2, mindestens // 2), radius=1, matrix=m)
    return objekt(name, bm, farbe)


def kette(name, punkte, radien, farbe, glatt=2):
    """Glatter Schlauch durch Gelenkpunkte (Skin-Modifier + Subdivision), Radius je Punkt."""
    bm = bmesh.new()
    lage = bm.verts.layers.skin.verify()
    vs = []
    for p, r in zip(punkte, radien):
        v = bm.verts.new(_v(p))
        v[lage].radius = (r, r)
        vs.append(v)
    vs[0][lage].use_root = True
    for a, b in zip(vs, vs[1:]):
        bm.edges.new((a, b))
    ob = objekt(name, bm, farbe)
    haut = ob.modifiers.new('Haut', 'SKIN')
    haut.use_smooth_shade = True
    sub = ob.modifiers.new('Glatt', 'SUBSURF')
    sub.levels = sub.render_levels = glaettung(glatt)
    return ob


def ring(name, mitte, achse, a, b, dicke, farbe, quer=None):
    """Elliptischer Ring (Gürtel, Streifen, Kragen) senkrecht zu achse; a entlang quer, b senkrecht dazu."""
    n = _v(achse).normalized()
    u = (_v(quer) - n * _v(quer).dot(n)).normalized() if quer is not None else n.orthogonal().normalized()
    w = n.cross(u)
    pkt = [tuple(_v(mitte) + u * (a * math.cos(t)) + w * (b * math.sin(t))) for t in (2 * math.pi * i / 64 for i in range(64))]
    return rohr(name, pkt, dicke, farbe, ring=True)


def gerundet(name, mitte, rot, groesse, farbe, rundung):
    """Abgerundeter Quader mit beliebiger Ausrichtung (rot = 3×3)."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1, matrix=Matrix.Translation(mitte) @ rot.to_4x4() @ Matrix.Diagonal((*groesse, 1)))
    return objekt(name, bm, farbe, rundung)


def handachsen(richtung, daumen_seite, seite):
    """(d, s, p): entlang der Finger, zur Daumenseite, zur Handfläche. seite +1 = linke, −1 = rechte Hand."""
    d = _v(richtung).normalized()
    s = (_v(daumen_seite) - d * _v(daumen_seite).dot(d)).normalized()
    return d, s, s.cross(d) * -seite


def griffmitte(handgelenk, d, p, griffradius):
    """Mitte des Griffs, den die greifende Hand umschließt (Gegenstück zu handgelenk_fuer_griff)."""
    return _v(handgelenk) + d * KNOECHEL_D + p * (0.004 + griffradius + FINGER_R)


def hand(name, handgelenk, richtung, daumen_seite, farbe, seite=-1, griff='greifen', naegel=True, griffradius=0.016):
    """Hand mit Handfläche, vier dreigliedrigen Fingern, Daumen und Nägeln.
    griff='greifen': die Finger legen sich genau um einen Griff mit griffradius, dessen Achse quer durch die Hand
    läuft (Mitte siehe griffmitte); der Daumen schließt von der anderen Seite. 'offen': locker gestreckt."""
    d, s, p = handachsen(richtung, daumen_seite, seite)
    w = _v(handgelenk)
    mat = farbe if isinstance(farbe, bpy.types.Material) else haut_material(farbe)
    nagel = material(mischung(farbe, 0.55, WEISS), rauheit=0.2, glanz=0.4) if naegel and isinstance(farbe, str) else None
    obs = [ellipsoid(f'{name}Handflaeche', w + d * 0.05, Matrix((s, p, d)).transposed(), (0.043, 0.021, 0.052), mat, 32)]
    um = griffradius + FINGER_R  # Bahnradius der Fingermitte um die Griffachse
    for i, (quer, faktor) in enumerate(FINGER):
        ansatz = w + d * KNOECHEL_D + s * quer + p * 0.004
        punkte, laenge = [ansatz], 0.0
        if griff == 'offen':
            summe, spreizung = 0.0, s * quer * 0.6
            for glied, krumm in zip(GLIEDER, KRUEMMUNG_OFFEN):
                summe += math.radians(krumm)
                richtung_glied = (d * math.cos(summe) + p * math.sin(summe) + spreizung).normalized()
                punkte.append(punkte[-1] + richtung_glied * glied * faktor)
        else:
            mitte = ansatz + p * um  # Finger laufen auf einem Kreis um die Griffachse
            for glied in GLIEDER:
                laenge += glied * faktor
                winkel = laenge / um
                punkte.append(mitte + (-p * math.cos(winkel) + d * math.sin(winkel)) * um)
                richtung_glied = (d * math.cos(winkel) + p * math.sin(winkel)).normalized()
        obs.append(kette(f'{name}Finger{i}', punkte, (0.0125, 0.0118, 0.011, 0.0098), mat, 2))
        if nagel:
            aussen = (punkte[-1] - (ansatz + p * um)).normalized() if griff != 'offen' else -p
            obs.append(ellipsoid(f'{name}Nagel{i}', punkte[-1] - richtung_glied * 0.006 + aussen * 0.0085,
                                 Matrix((s, aussen, richtung_glied)).transposed(), (0.0075, 0.0028, 0.0085), nagel, 16))
    basis = w + d * 0.02 + s * 0.03 + p * 0.012
    if griff == 'offen':
        t1, t2 = (d * 0.55 + s * 0.8 + p * 0.2).normalized(), (d * 0.85 + s * 0.45).normalized()
        daumen = [basis, basis + t1 * 0.036, basis + t1 * 0.036 + t2 * 0.03]
    else:
        # Daumen legt sich von der Daumenseite über den Griff auf Zeige- und Mittelfinger
        achse = griffmitte(w, d, p, griffradius) + s * 0.022
        spitze = achse + (p * 0.55 + d * 0.75).normalized() * (um + 0.004)
        knick = basis + (achse - basis) * 0.55 - p * 0.004 + s * 0.004
        daumen = [basis, knick, spitze]
        t2 = (spitze - knick).normalized()
    obs.append(kette(f'{name}Daumen', daumen, (0.016, 0.0145, 0.0125), mat, 2))
    if nagel:
        aussen = (daumen[-1] - griffmitte(w, d, p, griffradius)).normalized() if griff != 'offen' else -p
        obs.append(ellipsoid(f'{name}Daumennagel', daumen[-1] - t2 * 0.006 + aussen * 0.009, Matrix((s, aussen, t2)).transposed(),
                             (0.0085, 0.003, 0.0095), nagel, 16))
    return obs


def stiefel(name, knoechel, vorne, farbe, sohle, zehen=False):
    """Stiefel am Knöchel. zehen=True: kniendes Bein steht auf den Zehen (Spitze nach unten, Sohle nach hinten);
    der Knöchel liegt dafür etwa 0.19 über dem Boden."""
    h = _v((vorne[0], vorne[1], 0)).normalized()
    if zehen:
        f, z = (_v((0, 0, -1)) + h * 0.18).normalized(), h
    else:
        f, z = h, _v((0, 0, 1))
    rot = achsen(f, z)
    mitte = _v(knoechel) + f * 0.06 - z * 0.01  # stehend schließt die Sohle bei Knöchelhöhe KNOECHEL mit dem Boden ab
    obs = [gerundet(f'{name}Stiefel', mitte, rot, (0.12, 0.27, 0.13), farbe, 0.05),
           gerundet(f'{name}Sohle', mitte - z * 0.065 + f * 0.005, rot, (0.13, 0.28, 0.035), sohle, 0.015),
           ellipsoid(f'{name}Zehenkappe', mitte + f * 0.09 - z * 0.015, rot, (0.064, 0.055, 0.05), sohle, 32)]
    for i in range(3):  # Schnürung über dem Rist
        q = rot @ _v((1, 0, 0))
        mitte_s = mitte + f * (0.03 - 0.035 * i) + z * (0.066 + 0.008 * i)
        obs.append(rohr(f'{name}Schnur{i}', [tuple(mitte_s - q * 0.035), tuple(mitte_s + q * 0.035)], 0.006, sohle))
    return obs


def figur(name, becken, richtung=0.0, beugung=0.0, hand_l=None, hand_r=None, fuss_l=None, fuss_r=None,
          blick=None, pol_ellbogen_l=None, pol_ellbogen_r=None, pol_knie_l=None, pol_knie_r=None,
          vorne_fuss_l=None, vorne_fuss_r=None, haut='hell', haar='dunkel', kappe=ORANGE, latz=PETROL,
          hemd=KALK, akzent=ORANGE, handschuhe=None, werkzeugtasche=True, griff_l='greifen', griff_r='greifen',
          daumen_l=None, daumen_r=None, aermel='gekrempelt', uhr=True, laecheln=True, griffpunkt_l=None, griffpunkt_r=None,
          zehen_l=False, zehen_r=False, griffradius_l=0.016, griffradius_r=0.016):
    """Fachkraft in Latzhose. richtung: Grad, 0 = schaut zur Kamera (−Y), 90 = schaut nach +X.
    beugung: Rumpf nach vorne geneigt (Grad). hand_*/fuss_*: Handgelenk- bzw. Knöchelziel in Weltkoordinaten.
    griff_*: 'greifen' (Finger um einen Griff ~7 cm vor dem Handgelenk) oder 'offen'. daumen_*: Richtung, in die
    der Daumen zeigt (Standard: nach oben und zur Körpermitte). aermel: 'gekrempelt' oder 'lang'.
    griffpunkt_*: Mitte des Werkzeuggriffs, den die greifende Hand umschließt; ersetzt hand_* und rechnet das
    Handgelenk selbst aus. griffradius_*: Radius dieses Griffs (Standard 16 mm); die Finger legen sich genau darum. zehen_*: kniendes Bein auf den Zehen
    (Knöchelziel dafür ~0.19 über dem Boden).
    Links/rechts aus Sicht der Figur. Gibt alle Teile zurück."""
    obs = []
    P = _v(becken)
    w = math.radians(richtung)
    vorne = _v((math.sin(w), -math.cos(w), 0))
    links = _v((math.cos(w), math.sin(w), 0))
    z = _v((0, 0, 1))
    b = math.radians(beugung)
    oben = (z * math.cos(b) + vorne * math.sin(b)).normalized()
    vorne_r = (vorne * math.cos(b) - z * math.sin(b)).normalized()  # Rumpf-Vorne nach der Neigung
    rumpf = achsen(vorne_r, oben)
    haut_f, haar_f = HAUT.get(haut, haut), HAAR.get(haar, haar)
    haut_m = haut_material(haut_f)
    latz_m, hemd_m = stoff(latz), stoff(hemd)

    # Rumpf: Brust (Hemd unter dem Latz), Bauch und Becken (Hose), runde Schultern
    brust = P + oben * 0.33
    obs.append(ellipsoid(f'{name}Brust', brust, rumpf, (0.2, 0.145, 0.19), hemd_m))
    obs.append(ellipsoid(f'{name}Bauch', P + oben * 0.1, rumpf, (0.185, 0.14, 0.17), latz_m))
    hals = P + oben * RUMPF
    obs.append(kette(f'{name}Hals', [P + oben * 0.42, hals + oben * 0.04], [0.06, 0.055], haut_m, 1))
    obs.append(ring(f'{name}Kragen', P + oben * 0.47, oben, 0.085, 0.075, 0.022, hemd_m, quer=links))
    for seite in (1, -1):
        obs.append(ellipsoid(f'{name}Kragenspitze{seite}', P + oben * 0.455 + vorne_r * 0.07 + links * seite * 0.04,
                             rumpf @ Matrix.Rotation(seite * 0.5, 3, 'Y'), (0.035, 0.012, 0.022), hemd_m, 16))
        obs.append(ellipsoid(f'{name}Schulter{seite}', P + oben * 0.435 + links * seite * (SCHULTER - 0.025), rumpf,
                             (0.07, 0.068, 0.06), hemd_m, 32))

    # Latz, Brusttasche mit Stift, Träger über die Schultern
    latz_mitte = brust + vorne_r * 0.125 - oben * 0.02
    obs.append(gerundet(f'{name}Latz', latz_mitte, rumpf, (0.24, 0.05, 0.22), latz_m, 0.02))
    obs.append(gerundet(f'{name}Tasche', latz_mitte + vorne_r * 0.03 + oben * 0.02 - links * 0.04, rumpf, (0.09, 0.02, 0.08), latz_m, 0.012))
    obs.append(gerundet(f'{name}Taschenrand', latz_mitte + vorne_r * 0.042 + oben * 0.058 - links * 0.04, rumpf, (0.092, 0.012, 0.014), akzent, 0.005))
    stift = latz_mitte + vorne_r * 0.035 + oben * 0.085 - links * 0.065
    obs.append(kette(f'{name}Stift', [stift - oben * 0.02, stift + oben * 0.035], [0.008, 0.008], akzent, 1))
    for seite in (1, -1):
        obs.append(rohr(f'{name}Traeger{seite}', [
            tuple(latz_mitte + oben * 0.1 + links * seite * 0.085 + vorne_r * 0.01),
            tuple(brust + oben * 0.15 + links * seite * 0.12 + vorne_r * 0.06),
            tuple(brust + oben * 0.19 + links * seite * 0.12),
            tuple(brust + oben * 0.12 + links * seite * 0.11 - vorne_r * 0.13),
            tuple(P + oben * 0.18 + links * seite * 0.07 - vorne_r * 0.15),
        ], 0.016, latz_m))
        obs.append(ellipsoid(f'{name}Knopf{seite}', latz_mitte + oben * 0.1 + links * seite * 0.085 + vorne_r * 0.03,
                             rumpf, (0.017, 0.01, 0.017), akzent, 24))

    # Gürtel mit Schnalle und Werkzeugtasche an der rechten Hüfte
    # Gürtel eng am Bauch: Radien aus dem Bauch-Ellipsoid auf Gürtelhöhe, damit er nicht als Reifen absteht
    eng = math.sqrt(1 - (0.08 / 0.17) ** 2)
    ga, gb = 0.185 * eng + 0.008, 0.14 * eng + 0.008
    obs.append(ring(f'{name}Guertel', P + oben * 0.02, oben, ga, gb, 0.02, TIEFSEE2, quer=links))
    obs.append(gerundet(f'{name}Schnalle', P + oben * 0.02 + vorne_r * (gb + 0.012), rumpf, (0.05, 0.02, 0.04), WEISS, 0.008))
    if werkzeugtasche:
        tasche = P - links * (ga + 0.03) - oben * 0.05 + vorne_r * 0.02
        obs.append(gerundet(f'{name}Werkzeugtasche', tasche, rumpf, (0.07, 0.15, 0.15), akzent, 0.025))
        obs.append(kette(f'{name}Schraubendreher', [tasche + oben * 0.05 - vorne_r * 0.03, tasche + oben * 0.13 - vorne_r * 0.03],
                         [0.016, 0.016], TIEFSEE2, 1))
        obs.append(kette(f'{name}Hammerstiel', [tasche + oben * 0.05 + vorne_r * 0.035, tasche + oben * 0.16 + vorne_r * 0.035],
                         [0.012, 0.012], TIEFSEE2, 1))
        obs.append(gerundet(f'{name}Hammerkopf', tasche + oben * 0.17 + vorne_r * 0.035, rumpf, (0.03, 0.09, 0.035),
                            material(WEISS, 0.3, 1.0, 0.0), 0.01))

    # Arme: Ärmel (hochgekrempelt mit Unterarm oder lang), Uhr links, Hände mit Fingern
    for seite, ziel_hand, pol, griff, daumen, griffpunkt, griffradius in (
            (1, hand_l, pol_ellbogen_l, griff_l, daumen_l, griffpunkt_l, griffradius_l),
            (-1, hand_r, pol_ellbogen_r, griff_r, daumen_r, griffpunkt_r, griffradius_r)):
        schulter = P + oben * 0.45 + links * seite * SCHULTER
        ziel_hand = _v(ziel_hand) if ziel_hand is not None else schulter + links * seite * 0.08 - oben * 0.55
        pol = _v(pol) if pol is not None else links * seite * 0.6 - vorne_r * 0.4 - oben * 0.3
        daumen = _v(daumen) if daumen is not None else oben * 0.5 + links * -seite * 0.5 + vorne_r * 0.3
        if griffpunkt is not None:
            # Handgelenk so suchen, dass die gekrümmten Finger den Griffpunkt umschließen (wenige Runden genügen)
            ziel_hand = _v(griffpunkt)
            for _ in range(5):
                ellbogen, gelenk = ik(schulter, ziel_hand, OBERARM, UNTERARM, pol)
                d, s, p = handachsen(gelenk - ellbogen, daumen, seite)
                ziel_hand = _v(griffpunkt) - (griffmitte((0, 0, 0), d, p, griffradius))
        ellbogen, gelenk = ik(schulter, ziel_hand, OBERARM, UNTERARM, pol)
        unterarm = (gelenk - ellbogen).normalized()
        if aermel == 'lang':
            obs.append(kette(f'{name}Arm{seite}', [schulter, ellbogen, gelenk], [0.072, 0.058, 0.048], hemd_m))
            obs.append(ring(f'{name}Manschette{seite}', gelenk - unterarm * 0.03, unterarm, 0.05, 0.05, 0.012, akzent))
        else:
            saum = ellbogen + (gelenk - ellbogen) * 0.32
            obs.append(kette(f'{name}Arm{seite}', [schulter, ellbogen, saum], [0.072, 0.06, 0.058], hemd_m))
            obs.append(ring(f'{name}Aufschlag{seite}', saum, unterarm, 0.05, 0.05, 0.014, hemd_m))
            bauch = saum + (gelenk - saum) * 0.35  # Unterarm etwas kräftiger unterm Ellbogen, schlank zum Handgelenk
            obs.append(kette(f'{name}Unterarm{seite}', [saum - unterarm * 0.02, bauch, gelenk], [0.045, 0.047, 0.035], haut_m))
        d, s, p = handachsen(unterarm, daumen, seite)
        if handschuhe:
            # Unterarm-Schlauch ist nach der Subdivision ~0.032 dick: Stulpe und Uhrband eng anlegen
            obs.append(kette(f'{name}Stulpe{seite}', [gelenk - d * 0.04, gelenk + d * 0.005], [0.036, 0.04], stoff(handschuhe), 1))
        elif uhr and seite == 1:
            obs.append(ring(f'{name}Uhrband', gelenk - d * 0.03, d, 0.033, 0.033, 0.007, TIEFSEE2))
            obs.append(kette(f'{name}Uhr', [gelenk - d * 0.03 - p * 0.033, gelenk - d * 0.03 - p * 0.043], [0.016, 0.016], TIEFSEE2, 1))
            obs.append(ellipsoid(f'{name}Zifferblatt', gelenk - d * 0.03 - p * 0.0435, Matrix((s, -p, d)).transposed(),
                                 (0.013, 0.002, 0.013), material(KALK, 0.15, 0.0, 0.5), 24))
        obs += hand(f'{name}{seite}', gelenk, unterarm, daumen, stoff(handschuhe) if handschuhe else haut_f, seite=seite, griff=griff,
                    naegel=not handschuhe, griffradius=griffradius)

    # Beine: Hose vom Becken bis zum Knöchel, Beintasche, Knieschoner, Reflexstreifen, Stiefel
    for seite, ziel_fuss, pol, fuss_vorne, zehen in ((1, fuss_l, pol_knie_l, vorne_fuss_l, zehen_l),
                                                     (-1, fuss_r, pol_knie_r, vorne_fuss_r, zehen_r)):
        huefte = P + links * seite * HUEFTE - z * 0.05
        ziel_fuss = _v(ziel_fuss) if ziel_fuss is not None else _v((huefte.x, huefte.y, KNOECHEL))
        pol = _v(pol) if pol is not None else vorne
        knie, knoechel = ik(huefte, ziel_fuss, OBERSCHENKEL, UNTERSCHENKEL, pol)
        obs.append(kette(f'{name}Bein{seite}', [P + oben * 0.04 + links * seite * 0.06, huefte, knie, knoechel],
                         [0.12, 0.1, 0.082, 0.07], latz_m))
        oberschenkel = (knie - huefte).normalized()
        aussen = (links * seite - oberschenkel * (links * seite).dot(oberschenkel)).normalized()
        tasche = huefte + (knie - huefte) * 0.5 + aussen * 0.088
        trot = achsen(aussen, -oberschenkel)
        obs.append(gerundet(f'{name}Beintasche{seite}', tasche, trot, (0.1, 0.03, 0.12), latz_m, 0.012))
        obs.append(gerundet(f'{name}Taschenklappe{seite}', tasche + aussen * 0.018 - oberschenkel * 0.045, trot, (0.104, 0.014, 0.04), latz_m, 0.006))
        obs.append(ellipsoid(f'{name}Taschenknopf{seite}', tasche + aussen * 0.027 - oberschenkel * 0.035, trot, (0.01, 0.006, 0.01), akzent, 16))
        schienbein = (knoechel - knie).normalized()
        knie_vorne = (_v(pol) - schienbein * _v(pol).dot(schienbein)).normalized()
        # Die Subdivision macht den Beinschlauch schmaler als seine Skin-Radien: Schoner und Streifen eng anlegen
        obs.append(ellipsoid(f'{name}Knieschoner{seite}', knie + knie_vorne * 0.058, achsen(knie_vorne, -schienbein),
                             (0.058, 0.024, 0.07), TIEFSEE2, 32))
        obs.append(ring(f'{name}Streifen{seite}', knie + (knoechel - knie) * 0.55, schienbein, 0.068, 0.068, 0.012, akzent))
        obs += stiefel(f'{name}{seite}', knoechel, fuss_vorne or vorne, TIEFSEE2, TIEFSEE, zehen)

    # Kopf: Blick zum Ziel; Gesicht mit glänzenden Augen, Brauen, Nase, Ohren und leichtem Lächeln; Kappe mit Schirm
    kopf = hals + oben * (0.03 + KOPF * 0.95)
    blick_v = (_v(blick) - kopf).normalized() if blick is not None else vorne
    krot = achsen(blick_v, oben * 0.6 + z * 0.4)
    rx, ry, rz = KOPF * 0.94, KOPF * 0.98, KOPF * 1.04

    def k(x, y, zz):
        return kopf + krot @ _v((x, y, zz))

    def flaeche(x, zz, aussen=0.0):
        """Punkt auf der Gesichtsfläche (vorne, lokal −Y) über x/z, aussen = Abstand nach außen."""
        y = -ry * math.sqrt(max(1 - (x / rx) ** 2 - (zz / rz) ** 2, 0.0)) - aussen
        return k(x, y, zz)

    obs.append(ellipsoid(f'{name}Kopf', kopf, krot, (rx, ry, rz), haut_m, mindestens=40))   # Haaransatz = Schnittkante mit den Haaren
    auge = material(TIEFSEE, rauheit=0.12, glanz=0.6)
    glanz = material(WEISS, rauheit=0.3, glanz=0.0)
    for seite in (1, -1):
        mitte = flaeche(seite * 0.05, 0.012, 0.004)
        obs.append(ellipsoid(f'{name}Auge{seite}', mitte, krot, (0.018, 0.012, 0.025), auge, 24))
        obs.append(ellipsoid(f'{name}Lichtpunkt{seite}', mitte + krot @ _v((-0.005, -0.011, 0.009)), krot, (0.0055, 0.003, 0.0055), glanz, 12))
        obs.append(kette(f'{name}Braue{seite}', [flaeche(seite * 0.026, 0.05, 0.004), flaeche(seite * 0.05, 0.06, 0.004),
                                                  flaeche(seite * 0.074, 0.052, 0.003)], (0.0065, 0.0075, 0.005), haar_f, 1))
        obs.append(ellipsoid(f'{name}Ohr{seite}', k(seite * rx * 0.99, 0.0, 0.0), krot, (0.022, 0.038, 0.042), haut_m, 24))
        obs.append(ellipsoid(f'{name}Ohrmuschel{seite}', k(seite * (rx * 0.99 + 0.012), -0.004, 0.0), krot, (0.008, 0.022, 0.026),
                             haut_material(mischung(haut_f, 0.8, TIEFSEE)), 16))
    obs.append(ellipsoid(f'{name}Nase', flaeche(0, -0.018, -0.012), krot, (0.022, 0.02, 0.027), haut_m, 24))
    if laecheln:
        mund = [flaeche(x, -0.064 + 0.016 * (x / 0.03) ** 2, 0.002) for x in (-0.03 + 0.06 * i / 10 for i in range(11))]
        obs.append(rohr(f'{name}Mund', [tuple(p) for p in mund], 0.0045, haut_material(mischung(haut_f, 0.45, HAAR['braun']))))
    # Haare wie bei Spielfiguren: geschlossenes Ellipsoid, nach hinten oben versetzt. Wo der Kopf vorsteht, bleibt das
    # Gesicht frei; der Haaransatz ist die weiche Schnittkante, die Ohren schauen seitlich heraus.
    obs.append(ellipsoid(f'{name}Haare', k(0, 0.025, 0.03), krot, (rx * 1.04, ry, rz), haar_f, mindestens=40))
    if kappe:
        obs.append(_schale(f'{name}Kappe', kopf + krot @ _v((0, 0, 0.01)), krot, (KOPF * 1.0, KOPF * 1.04, KOPF * 1.1), kappe, unten=0.05, vorne_bis=-1.1))
        schirm = k(0, -KOPF * 0.95, 0.07)
        obs.append(ellipsoid(f'{name}Schirm', schirm, krot @ Matrix.Rotation(math.radians(-12), 3, 'X'), (0.105, 0.075, 0.012), kappe, 32))
        obs.append(ellipsoid(f'{name}Kappenknopf', k(0, 0, KOPF * 1.1), krot, (0.02, 0.02, 0.012), kappe, 16))
    else:  # ohne Kappe: etwas Volumen oben und eine Tolle über der Stirn
        obs.append(ellipsoid(f'{name}Frisur', k(0, 0.035, 0.07), krot, (rx * 1.0, ry * 0.95, rz * 0.92), haar_f))
        obs.append(ellipsoid(f'{name}Tolle', k(0.02, -ry * 0.55, rz * 0.82), krot @ Matrix.Rotation(0.45, 3, 'X'),
                             (0.07, 0.04, 0.032), haar_f, 32))
    return obs


def _schale(name, mitte, rot, radien, farbe, unten, vorne_bis):
    """Ellipsoid-Schale oberhalb von z=unten (lokal); vorne_bis begrenzt die Stirn (lokal −Y, Anteil des Radius)."""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=stufen(48, 32), v_segments=stufen(24, 16), radius=1)   # Kappenrand bleibt glatt
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, unten / radien[2]), plane_no=(0, 0, -1), clear_outer=True)
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, vorne_bis, 0), plane_no=(0, -1, 0.35), clear_outer=True)
    bmesh.ops.transform(bm, matrix=Matrix.Translation(mitte) @ rot.to_4x4() @ Matrix.Diagonal((*radien, 1)), verts=bm.verts)
    ob = objekt(name, bm, farbe)
    d = ob.modifiers.new('Dicke', 'SOLIDIFY')
    d.thickness, d.offset = 0.012, 1
    ob.modifiers.new('Glatt', 'SUBSURF').levels = 1
    return ob
