"""Build the two guest portrait plates from the supplied photographs.

The guest cards are 4:3, but neither photograph is: Malla Reddy's is square and
Shekar Master's is 1.24:1. Cropping them to fill the card takes the top of one
head and all of the other's shoulders, so instead each portrait is set on a
plate the card's shape — near-black ground, a warm pool of light behind the
subject, a gold hairline around the photo. Nothing is cropped, both are framed
the same way, and the treatment matches the event poster's own.

Run from anywhere:  python3 tools/portraits.py
"""
import pathlib
from PIL import Image, ImageFilter, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'tools' / 'source'
OUT = ROOT / 'assets' / 'images'

W, H = 800, 600      # the guest card's 4:3
PH = 520             # portrait height on the plate

VOID, PIT = (0x07, 0x06, 0x0A), (0x14, 0x11, 0x1A)
GOLD = (0xB0, 0x8A, 0x36)


def plate(src, name):
    photo = src.resize((round(src.width * PH / src.height), PH), Image.LANCZOS)
    # Only Malla Reddy's photo is smaller than the plate; a downscale needs no
    # help, an upscale does.
    if PH > src.height:
        photo = photo.filter(ImageFilter.UnsharpMask(radius=1.1, percent=55, threshold=2))

    ground = Image.new('RGB', (W, H), VOID)
    d = ImageDraw.Draw(ground)
    for y in range(H):
        t = y / (H - 1)
        d.line([(0, y), (W, y)], fill=tuple(round(PIT[i] + (VOID[i] - PIT[i]) * t) for i in range(3)))
    glow = Image.new('RGB', (W, H), VOID)
    ImageDraw.Draw(glow).ellipse([W // 2 - 300, 40, W // 2 + 300, H - 40], fill=(0x3A, 0x2A, 0x0D))
    ground = Image.blend(ground, glow.filter(ImageFilter.GaussianBlur(90)), 0.55)

    x, y = (W - photo.width) // 2, (H - PH) // 2
    ground.paste(photo, (x, y))
    ImageDraw.Draw(ground).rectangle([x - 1, y - 1, x + photo.width, y + PH], outline=GOLD, width=1)
    ground.save(OUT / name, quality=94, subsampling=0, optimize=True)
    print(name, src.size, '-> portrait', photo.size, 'on', ground.size)


plate(Image.open(SRC / 'malla-reddy.png').convert('RGB'), 'guest-malla-reddy.jpg')
# Shekar Master's file carries the poster's gold frame and rounded corners
# baked into its edges; trim them off before it goes on a plate of its own.
plate(Image.open(SRC / 'shekar-master.webp').convert('RGB').crop((15, 19, 1377, 1117)),
      'guest-shekar-master.jpg')
