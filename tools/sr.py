"""Iterative back-projection super-resolution.

The guest portraits exist only inside the event poster, at ~150px. A single
Lanczos upscale of that is soft, because Lanczos only interpolates: it never
asks whether the result, shrunk back down, still matches what we started with.
Back-projection does exactly that — upscale, shrink the guess back to source
size, measure the error, push the error back into the guess — which recovers
edge contrast that interpolation alone leaves flat.
"""
import numpy as np
from PIL import Image, ImageFilter


def to_arr(im):
    return np.asarray(im.convert('RGB'), dtype=np.float64)


def to_img(a):
    return Image.fromarray(np.clip(a, 0, 255).astype('uint8'))


def resize(a, size):
    return to_arr(to_img(a).resize(size, Image.LANCZOS))


def back_project(lr_img, scale, iters=28, gain=1.0):
    lr = to_arr(lr_img)
    lh, lw = lr.shape[:2]
    hw, hh = int(round(lw * scale)), int(round(lh * scale))
    hr = resize(lr, (hw, hh))
    for i in range(iters):
        sim = resize(hr, (lw, lh))
        hr = hr + gain * resize(lr - sim, (hw, hh))
        # Ringing collects around hard edges; a light blur every few passes
        # keeps the correction from turning into halos.
        if i % 6 == 5:
            hr = to_arr(to_img(hr).filter(ImageFilter.GaussianBlur(0.35)))
    return to_img(hr)
