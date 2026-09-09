#!/usr/bin/env python3
"""
Assemble the two static Gravity 1650 sites from src/<site>/ into <site>/.

Usage:  python3 build.py            # builds both sites
        python3 build.py terrasse   # builds one site

Each page in src/<site>/pages/*.html starts with a JSON block:

    <!--META
    { "title": "...", "description": "...", "path": "/carte.html", ... }
    -->

The rest of the file is the page body. Partials live in src/<site>/partials/
(head.html, nav.html, footer.html). {{key}} tokens are replaced from the
page meta, merged over the site defaults in src/<site>/site.json.
No dependencies beyond the Python 3 standard library.
"""
import json
import re
import shutil
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
SITES = ["site"]
TOKEN = re.compile(r"{{\s*([a-zA-Z0-9_]+)\s*}}")


def read(p: Path) -> str:
    return p.read_text(encoding="utf-8")


def split_meta(text: str):
    m = re.match(r"\s*<!--META\s*(\{.*?\})\s*-->\s*", text, re.S)
    if not m:
        raise SystemExit("Missing <!--META {...} --> block")
    return json.loads(m.group(1)), text[m.end():]


def render(template: str, ctx: dict) -> str:
    def sub(m):
        key = m.group(1)
        if key not in ctx:
            raise SystemExit(f"Unknown token {{{{{key}}}}}")
        return str(ctx[key])
    return TOKEN.sub(sub, template)


def breadcrumb_html(items, site):
    """items: list of [label, path]. Last item is the current page."""
    if not items:
        return ""
    lis = []
    for i, (label, path) in enumerate(items):
        last = i == len(items) - 1
        if last:
            lis.append(f'<li aria-current="page">{label}</li>')
        else:
            lis.append(f'<li><a href="{path}">{label}</a></li>')
    return (
        '<nav class="breadcrumb" aria-label="Fil d\'Ariane"><ol>'
        + "".join(lis)
        + "</ol></nav>"
    )


def breadcrumb_schema(items, origin):
    if not items:
        return ""
    els = []
    for i, (label, path) in enumerate(items, start=1):
        els.append({
            "@type": "ListItem",
            "position": i,
            "name": label,
            "item": origin + path,
        })
    data = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": els}
    return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False) + "</script>"


def build_site(site: str):
    src = SRC / site
    out = ROOT / site
    cfg = json.loads(read(src / "site.json"))
    origin = cfg["origin"].rstrip("/")

    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)

    # static assets and root files
    shutil.copytree(src / "assets", out / "assets")
    for f in (src / "static").glob("*"):
        if f.is_file():
            shutil.copy2(f, out / f.name)

    head = read(src / "partials" / "head.html")
    nav = read(src / "partials" / "nav.html")
    footer = read(src / "partials" / "footer.html")

    pages = []
    for page_file in sorted((src / "pages").glob("*.html")):
        meta, body = split_meta(read(page_file))
        ctx = dict(cfg)
        ctx.update(meta)
        ctx.setdefault("robots", "index, follow")
        ctx.setdefault("body_class", "")
        ctx.setdefault("og_type", "website")
        ctx.setdefault("extra_schema", "")
        ctx.setdefault("extra_head", "")
        ctx.setdefault("extra_scripts", "")
        ctx.setdefault("home", "/")
        ctx.setdefault("nav_current", "")
        ctx["canonical"] = origin + ctx["path"]
        ctx["full_title"] = ctx["title"] if ctx.get("title_is_full") else f'{ctx["title"]} | {cfg["site_name"]}'
        ctx["breadcrumb"] = breadcrumb_html(ctx.get("breadcrumbs", []), site)
        ctx["breadcrumb_schema"] = breadcrumb_schema(ctx.get("breadcrumbs", []), origin)
        ctx["year"] = str(date.today().year)

        html = (
            render(head, ctx)
            + render(nav, ctx)
            + render(body, ctx)
            + render(footer, ctx)
        )
        # final pass for tokens introduced by partials of partials
        html = render(html, ctx)
        target = out / page_file.name
        target.write_text(html, encoding="utf-8")
        if "noindex" not in ctx["robots"]:
            pages.append((ctx["path"], ctx.get("priority", "0.6"), ctx.get("changefreq", "monthly")))

    # sitemap.xml
    today = date.today().isoformat()
    urls = "".join(
        f"  <url><loc>{origin}{p}</loc><lastmod>{today}</lastmod>"
        f"<changefreq>{cf}</changefreq><priority>{pr}</priority></url>\n"
        for p, pr, cf in pages
    )
    (out / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + urls
        + "</urlset>\n",
        encoding="utf-8",
    )
    print(f"[{site}] built {len(pages)} indexable pages + sitemap -> {out}")


if __name__ == "__main__":
    targets = sys.argv[1:] or SITES
    for s in targets:
        build_site(s)
