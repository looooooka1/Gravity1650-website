#!/usr/bin/env python3
"""
Découpe la photo du hero en DEUX plans pour le parallaxe épinglé :

  hero-back   : tout le reste (ciel, massif, mer de nuages), falaise retouchée
  hero-front  : le bas de l'image (neige du premier plan, sapins, falaise droite)

Le logo GRAVITY 1650 vient se placer entre les deux. Au défilement, le plan
avant remonte plus vite que le fond et recouvre progressivement le logo.

Les polygones sont tracés dans un espace de référence 900x502 puis mis à
l'échelle. Les masques sont adoucis pour que la coupe reste invisible.

Sorties : format paysage (desktop) et recadrage portrait (mobile).
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

SRC = Path.home() / "Downloads" / "Generated Image September 09, 2026 - 2_02PM.jpg"
OUT = Path(__file__).resolve().parent.parent / "src" / "site" / "assets" / "img"
PW, PH = 1000.0, 1000.0

# crête de la neige du premier plan, avec des bosses au-dessus des sapins
LINE_B = [(0, 848), (25, 846), (50, 850), (75, 856), (100, 856), (130, 862), (160, 866),
          (200, 872), (250, 874), (280, 870), (300, 862), (320, 858),
          (332, 846), (340, 800), (350, 774), (362, 778), (372, 800), (380, 830),
          (388, 848), (400, 852), (420, 856), (440, 858),
          (452, 856), (462, 846), (472, 858), (480, 870),
          (500, 876), (550, 880), (600, 880), (650, 878), (700, 876), (750, 872),
          (770, 866), (780, 846), (790, 852), (800, 858), (812, 850), (822, 844)]

# silhouette de la falaise de droite, du bas vers le haut
CLIFF = [(755, 895), (775, 862), (790, 842), (805, 822), (814, 802), (822, 782),
         (842, 762), (849, 742), (854, 722), (858, 702), (860, 682), (862, 662),
         (866, 642), (870, 622), (874, 602), (876, 582), (877, 562), (884, 540),
         (896, 520), (920, 500), (935, 480), (957, 442), (975, 428), (1000, 415)]

# recadrage portrait : fenêtre 9:16 centrée sur la face éclairée du massif
PORTRAIT_X = 0.22          # bord gauche, en fraction de la largeur
PORTRAIT_RATIO = 9 / 16


def scaled(pts, w, h):
    return [(x * w / PW, y * h / PH) for x, y in pts]


def poly_below(line, w, h):
    return scaled(line, w, h) + [(w, h), (0, h)]


def cliff_poly(w, h, grow=0.0):
    pts = [(x - grow, y - grow) for x, y in CLIFF]
    return scaled(pts, w, h) + [(w, h)]


def mask_from(polys, size, feather):
    m = Image.new("L", size, 0)
    d = ImageDraw.Draw(m)
    for poly in polys:
        d.polygon(poly, fill=255)
    return m.filter(ImageFilter.GaussianBlur(feather))


def inpaint(img, mask):
    """Efface la zone du masque en étirant horizontalement le pixel voisin de gauche."""
    w, h = img.size
    px, mp = img.load(), mask.load()
    for y in range(h):
        x0 = next((x for x in range(w) if mp[x, y] > 8), None)
        if x0 is None:
            continue
        src = px[max(0, x0 - 3), y]
        for x in range(x0, w):
            px[x, y] = src
    return img.filter(ImageFilter.GaussianBlur(9))


def layers(width):
    """Renvoie (fond, avant) en RGBA, à la largeur demandée."""
    img = Image.open(SRC).convert("RGB")
    h = round(width * img.height / img.width)
    img = img.resize((width, h), Image.LANCZOS)
    size = (width, h)
    k = width / 2400.0

    erase = mask_from([cliff_poly(width, h, grow=9)], size, 2 * k)
    clean = inpaint(img.copy(), erase)
    soft = mask_from([cliff_poly(width, h, grow=7)], size, 10 * k)
    back = Image.composite(clean, img, soft).convert("RGBA")

    front = img.convert("RGBA")
    front.putalpha(mask_from(
        [poly_below(LINE_B, width, h), cliff_poly(width, h)], size, 7 * k))
    return back, front


EXT = 2.0   # le plan avant est prolonge vers le bas pour ne jamais laisser de vide


def extend_front(front):
    """Prolonge la neige sous la photo par miroirs successifs, puis floute.

    Un premier plan aussi proche serait hors profondeur de champ : le flou est
    photographiquement juste et masque entierement la repetition."""
    w, h = front.size
    tail = round(h * (EXT - 1))
    block = front.crop((0, round(h * 0.55), w, h)).convert("RGB")
    bh = block.height

    ext = Image.new("RGB", (w, tail))
    y, flip = 0, True
    while y < tail:
        tile = block.transpose(Image.FLIP_TOP_BOTTOM) if flip else block
        ext.paste(tile, (0, y))
        y += bh
        flip = not flip

    ext = ext.filter(ImageFilter.GaussianBlur(w / 52.0))

    # la neige s'enfonce doucement dans l'ombre en descendant
    shade = Image.new("L", (1, tail))
    for i in range(tail):
        shade.putpixel((0, i), int(255 - 120 * (i / max(1, tail - 1)) ** 1.15))
    ext = Image.composite(ext, Image.new("RGB", (w, tail), (0, 0, 0)), shade.resize((w, tail)))

    out = Image.new("RGBA", (w, h + tail), (0, 0, 0, 0))
    ext_rgba = ext.convert("RGBA")
    out.paste(ext_rgba, (0, h))
    out.paste(front, (0, 0), front)
    return out


def save(im, name, quality=85):
    p = OUT / name
    im.save(p, quality=quality, method=6)
    print(f"  {name:26s} {im.width}x{im.height}  {p.stat().st_size / 1024:.0f} Ko")


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    # --- paysage, pour les écrans larges ---
    back, front = layers(2048)
    front = extend_front(front)
    save(back.convert("RGB"), "hero-back.webp")
    save(front, "hero-front.webp", 86)
    save(back.resize((1200, 1200), Image.LANCZOS).convert("RGB"), "hero-back-1200.webp")
    save(front.resize((1200, round(1200 * front.height / front.width)), Image.LANCZOS),
         "hero-front-1200.webp", 86)

    # --- portrait, pour les téléphones ---
    back, front = layers(3200)
    cw = round(back.height * PORTRAIT_RATIO)
    x0 = round(back.width * PORTRAIT_X)
    box = (x0, 0, x0 + cw, back.height)
    save(back.crop(box).resize((1080, 1920), Image.LANCZOS).convert("RGB"), "hero-back-p.webp")
    fp = extend_front(front.crop(box).resize((1080, 1920), Image.LANCZOS))
    save(fp, "hero-front-p.webp", 86)


def build_place():
    """Portrait 3:4 pour la section « Le lieu », depuis la variante froide."""
    src = Path.home() / "Downloads" / "Generated Image September 09, 2026 - 11_46AM.jpg"
    img = Image.open(src).convert("RGB")
    w, h = img.size
    cw = int(h * 3 / 4)
    x0 = int(w * 0.30)
    img.crop((x0, 0, x0 + cw, h)).resize((1200, 1600), Image.LANCZOS) \
       .save(OUT / "le-lieu.webp", quality=84, method=6)
    print("  le-lieu.webp 1200x1600 %.0f Ko" % ((OUT / "le-lieu.webp").stat().st_size / 1024))


if __name__ == "__main__":
    main()
    build_place()
