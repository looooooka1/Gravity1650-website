#!/usr/bin/env python3
"""
Render the social share image and raster favicons for a built site.
Run after build.py:   python3 tools/assets.py terrasse piste

Produces in <site>/assets/: og-image.png (1200x630), apple-touch-icon.png (180),
icon-512.png, and <site>/favicon.ico (32px PNG wrapped in an ICO container).
Requires the Playwright venv used for verification.
"""
import struct
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent


def png_to_ico(png_bytes: bytes, size: int) -> bytes:
    header = struct.pack("<HHH", 0, 1, 1)
    entry = struct.pack("<BBBBHHII", size, size, 0, 0, 1, 32, len(png_bytes), 6 + 16)
    return header + entry + png_bytes


def render(site: str, p):
    src = ROOT / "src" / site
    out = ROOT / site
    assets = out / "assets"
    b = p.chromium.launch()

    # OG image
    pg = b.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=1)
    pg.goto((src / "og.html").resolve().as_uri())
    pg.wait_for_timeout(600)
    pg.screenshot(path=str(assets / "og-image.png"), clip={"x": 0, "y": 0, "width": 1200, "height": 630})
    pg.close()

    # Favicons from favicon.svg
    svg = (out / "favicon.svg").read_text(encoding="utf-8")
    for name, size in (("apple-touch-icon.png", 180), ("icon-512.png", 512), ("_fav32.png", 32)):
        pg = b.new_page(viewport={"width": size, "height": size}, device_scale_factor=1)
        sized = svg.replace("<svg ", '<svg width="%d" height="%d" ' % (size, size), 1)
        pg.set_content('<html><body style="margin:0;background:transparent">' + sized + '</body></html>')
        pg.wait_for_timeout(200)
        pg.screenshot(path=str(assets / name), omit_background=True, clip={"x": 0, "y": 0, "width": size, "height": size})
        pg.close()
    fav = assets / "_fav32.png"
    (out / "favicon.ico").write_bytes(png_to_ico(fav.read_bytes(), 32))
    fav.unlink()
    b.close()
    print(f"[{site}] og-image.png, apple-touch-icon.png, icon-512.png, favicon.ico written")


if __name__ == "__main__":
    sites = sys.argv[1:] or ["site"]
    with sync_playwright() as p:
        for s in sites:
            render(s, p)
