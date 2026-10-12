#!/usr/bin/env python3
"""
Turn a finished `next build` into a relocatable static bundle.

    pnpm build
    python3 scripts/static-preview.py .next out/preview

The bundle contains index.html, print.html, resume.json and assets/_next/static
and can be served from any path on any static host (object store, GitHub Pages,
a Claude artifact). The interactive terminal works; the API routes are
replaced by the static resume.json.

Why this is needed: Next.js emits absolute /_next/ asset paths, and the
Turbopack runtime identifies chunks by stripping a base path from each
script's raw src attribute. Three rewrites make the output relocatable:
  1. script/link attributes get a relative prefix,
  2. the embedded RSC payload's chunk references get the same prefix,
  3. TURBOPACK_CHUNK_BASE_PATH is set to that prefix before any chunk loads.
"""
import json, pathlib, re, shutil, sys

PREFIX = "assets/_next/"


def relocate(html: str) -> str:
    html = re.sub(r'<script src="[^"]*" noModule=""></script>', "", html)  # legacy polyfills
    html = re.sub(r'<link rel="icon"[^>]*/>', "", html)
    html = html.replace('src="/_next/', f'src="{PREFIX}').replace('href="/_next/', f'href="{PREFIX}')
    html = html.replace('\\"/_next/', f'\\"{PREFIX}')  # client-reference chunk paths inside the RSC payload
    html = (
        html.replace('href="/print"', 'href="print.html"')
        .replace('href="/api/resume"', 'href="resume.json"')
        .replace('href="/"', 'href="index.html"')
        .replace('href="/api/health"', 'href="resume.json"')
    )
    boot = (
        f'<script>globalThis.TURBOPACK_CHUNK_BASE_PATH="{PREFIX}";'
        'document.addEventListener("click",function(e){var a=e.target&&e.target.closest&&e.target.closest("a");'
        'if(a&&/\\.(html|json)$/.test(a.getAttribute("href")||""))e.stopPropagation();},true);</script>'
    )
    return html.replace("<head>", "<head>" + boot, 1)


def main(next_dir: str, out_dir: str) -> None:
    root, out = pathlib.Path(next_dir), pathlib.Path(out_dir)
    if out.exists():
        shutil.rmtree(out)
    (out / "assets/_next").mkdir(parents=True)
    shutil.copytree(root / "static", out / "assets/_next/static", ignore=shutil.ignore_patterns("development"))
    for page in ("index.html", "print.html"):
        (out / page).write_text(relocate((root / "server/app" / page).read_text()))
    resume = json.loads(pathlib.Path("content/resume.json").read_text())
    (out / "resume.json").write_text(json.dumps(resume, indent=2) + "\n")
    print(f"wrote {out} ({sum(1 for _ in out.rglob('*') if _.is_file())} files)")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
