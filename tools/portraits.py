"""Lift the two guest portraits out of the event poster and set them on a plate
that matches the site: near-black ground, a warm glow behind the subject, a gold
hairline around the photo.

The source crops are ~150px, so the upscale is the whole job. Lanczos alone is
soft; `sr.back_project` re-derives the detail Lanczos cannot, and only a light
unsharp is needed afterwards. No median filter before the upscale — at 150px
that removes real detail along with the compression noise."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from PIL import Image, ImageFilter, ImageDraw
from sr import back_project

SRC = '/tmp/claude-0/-home-user-Event-design/6b15921e-a719-5b3a-8c7d-26860e1c3788/images/3.webp'
OUT = '/home/user/Event-design/assets/images/'
W, H = 800, 600            # 4:3, matching the guest card
PH = 438                   # photo height on the plate

VOID, PIT = (0x07, 0x06, 0x0A), (0x14, 0x11, 0x1A)
GOLD = (0xB0, 0x8A, 0x36)

poster = Image.open(SRC).convert('RGB')

def plate(box, name):
    src = poster.crop(box)
    photo = back_project(src, PH / src.height)
    photo = photo.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
    tw = photo.width

    # Ground: a vertical fade with a warm pool of light behind the subject.
    plate = Image.new('RGB', (W, H), VOID)
    d = ImageDraw.Draw(plate)
    for y in range(H):
        t = y / (H - 1)
        d.line([(0, y), (W, y)], fill=tuple(round(PIT[i] + (VOID[i] - PIT[i]) * t) for i in range(3)))
    glow = Image.new('RGB', (W, H), VOID)
    ImageDraw.Draw(glow).ellipse([W//2 - 300, 40, W//2 + 300, H - 40], fill=(0x3A, 0x2A, 0x0D))
    plate = Image.blend(plate, glow.filter(ImageFilter.GaussianBlur(90)), 0.55)

    x, y = (W - tw) // 2, (H - PH) // 2
    plate.paste(photo, (x, y))
    ImageDraw.Draw(plate).rectangle([x - 1, y - 1, x + tw, y + PH], outline=GOLD, width=1)
    plate.save(OUT + name, quality=94, subsampling=0, optimize=True)
    print(name, 'source', src.size, '-> photo', photo.size, 'on', plate.size)

plate((98,  299,  247, 449), 'guest-malla-reddy.jpg')
plate((1039, 299, 1219, 449), 'guest-shekar-master.jpg')
