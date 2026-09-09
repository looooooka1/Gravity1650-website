#!/usr/bin/env python3
"""
Verify a built site: serves <site>/ locally, opens every HTML page in
Chromium at desktop (1440x900) and mobile (390x844) sizes, and checks:

  - console errors and failed network requests
  - horizontal overflow (page wider than viewport) at both sizes
  - leftover template tokens ({{ }}) and TODO markers
  - every internal link / asset href resolves to a file on disk
  - exactly one <h1>, <title>, meta description, canonical per page
  - reveal elements actually become visible after scrolling

Writes screenshots to screenshots/<site>/ and prints a report.
Exit code 1 if any hard failure.
"""
import http.server
import json
import re
import socketserver
import sys
import threading
from functools import partial
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "screenshots"


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def serve(directory: Path):
    handler = partial(Quiet, directory=str(directory))
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    port = httpd.server_address[1]
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    return httpd, port


def check_links(site_dir: Path, html: str, page: str, problems: list):
    for m in re.finditer(r'(?:href|src)="([^"]+)"', html):
        u = m.group(1)
        if u.startswith(("http", "mailto:", "tel:", "#", "data:")):
            continue
        path = urlsplit(u).path
        if not path:
            continue
        if path.endswith("/"):
            path += "index.html"
        target = site_dir / path.lstrip("/")
        if not target.exists():
            problems.append(f"{page}: broken internal link {u}")


def verify(site: str, p) -> dict:
    site_dir = ROOT / site
    httpd, port = serve(site_dir)
    base = f"http://127.0.0.1:{port}"
    out_dir = SHOTS / site
    out_dir.mkdir(parents=True, exist_ok=True)
    pages = sorted(x.name for x in site_dir.glob("*.html"))
    report = {"site": site, "pages": {}, "hard": [], "soft": []}
    browser = p.chromium.launch()

    for name in pages:
        entry = {"console": [], "failed": [], "overflow": {}, "h1": None}
        html = (site_dir / name).read_text(encoding="utf-8")
        if "{{" in html:
            report["hard"].append(f"{name}: unreplaced template token")
        if "todo" in html:
            report["soft"].append(f"{name}: contains TODO marker for the owner to complete")
        check_links(site_dir, html, name, report["hard"])
        for tag, pat in (("title", r"<title>[^<]+</title>"), ("description", r'name="description" content="[^"]+"'), ("canonical", r'rel="canonical"')):
            if not re.search(pat, html):
                report["hard"].append(f"{name}: missing {tag}")
        h1s = len(re.findall(r"<h1[\s>]", html))
        entry["h1"] = h1s
        if h1s != 1:
            report["hard"].append(f"{name}: {h1s} <h1> elements (expected 1)")
        for img in re.findall(r"<img[^>]*>", html):
            if 'alt="' not in img:
                report["hard"].append(f"{name}: <img> without alt")

        for label, vp in (("desktop", {"width": 1440, "height": 900}), ("mobile", {"width": 390, "height": 844})):
            ctx = browser.new_context(viewport=vp, device_scale_factor=1, is_mobile=(label == "mobile"), has_touch=(label == "mobile"))
            pg = ctx.new_page()
            pg.on("console", lambda m, e=entry: e["console"].append(m.text) if m.type in ("error",) else None)
            pg.on("pageerror", lambda err, e=entry: e["console"].append(str(err)))
            pg.on("requestfailed", lambda r, e=entry: e["failed"].append(r.url))
            pg.on("response", lambda r, e=entry: e["failed"].append(f"{r.status} {r.url}") if r.status >= 400 else None)
            pg.goto(f"{base}/{name}", wait_until="networkidle")
            pg.wait_for_timeout(400)
            # scroll through the page so reveals and scroll effects run
            height = pg.evaluate("document.documentElement.scrollHeight")
            y = 0
            while y < height:
                pg.evaluate(f"window.scrollTo({{top:{y},behavior:'instant'}})")
                pg.wait_for_timeout(120)
                y += vp["height"] * 0.6
            pg.evaluate("window.scrollTo({top:0,behavior:'instant'})")
            pg.wait_for_timeout(900)
            overflow = pg.evaluate("Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth")
            entry["overflow"][label] = overflow
            if overflow > 1:
                report["hard"].append(f"{name} [{label}]: horizontal overflow of {overflow}px")
            hidden = pg.evaluate("Array.from(document.querySelectorAll('.reveal,.reveal-lines,.reveal-scale,.rv')).filter(e=>!e.classList.contains('is-in')).length")
            if hidden:
                report["soft"].append(f"{name} [{label}]: {hidden} reveal elements never entered view (offscreen or hidden)")
            pg.screenshot(path=str(out_dir / f"{name[:-5]}-{label}.png"), full_page=True)
            if name == "index.html":
                pg.screenshot(path=str(out_dir / f"index-{label}-hero.png"), full_page=False)
            ctx.close()

        if entry["console"]:
            report["hard"].append(f"{name}: console errors {entry['console'][:3]}")
        if entry["failed"]:
            report["hard"].append(f"{name}: failed requests {entry['failed'][:3]}")
        report["pages"][name] = entry

    browser.close()
    httpd.shutdown()
    return report


if __name__ == "__main__":
    sites = sys.argv[1:] or ["site"]
    ok = True
    with sync_playwright() as p:
        for s in sites:
            r = verify(s, p)
            print(f"\n=== {s}: {len(r['pages'])} pages ===")
            for name, e in r["pages"].items():
                print(f"  {name:24s} h1={e['h1']} overflow={e['overflow']} console={len(e['console'])} failed={len(e['failed'])}")
            for x in r["soft"]:
                print("  SOFT:", x)
            for x in r["hard"]:
                print("  FAIL:", x)
            if r["hard"]:
                ok = False
            (SHOTS / f"{s}-report.json").write_text(json.dumps(r, indent=2, ensure_ascii=False), encoding="utf-8")
    sys.exit(0 if ok else 1)
