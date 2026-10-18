# FAQ

**Do I need to know Next.js to use this?**
No. Edit three JSON files, drop in a photo, run `pnpm dev`. The code only
matters if you want to change how it looks.

**Can I keep my real resume out of GitHub?**
Yes, two ways. (1) Fork privately and commit your content; the template's
release workflow can be switched to manual so no image of your data is ever
published. (2) Keep the public fork and store real content outside the repo
(`private/` is gitignored), swapping it in with `pnpm content:private` before
you build. See `docs/DEPLOYMENT.md`.

**What is the cheapest way to host it?**
`pnpm build && pnpm export:static` and upload `out/static` to GitHub Pages,
Cloudflare Pages or an S3 bucket: $0. The terminal and all pages work; only
the `/api/*` routes are replaced by a static `resume.json`. If you want the
API and health probes, the container on Cloud Run scales to zero and costs
cents.

**How big is it?**
Image ~257 MB (Node is ~190 MB of that), ~40 MB RSS at rest, ~1 MB as static
files. `docs/DEPLOYMENT.md` has the measurements.

**Does it need a database or any secrets?**
No. Nothing is written at runtime; the only writable path is `/tmp`.

**Why JSON Resume instead of Markdown or YAML?**
Because it already exists: themes, CLIs and ATS importers understand it, and
`/api/resume` serves it unchanged. Site-only things (hero stats, logos, the
nav) live in `site.json` so the resume document stays portable.

**Can I change the colours / fonts / layout?**
Tokens are at the top of `src/app/globals.css`; the aurora palette is four
`--glow-*` variables. Fonts come from `@fontsource-variable`; swap the
imports. The look is deliberately specific (Tabby), so changing it is a code
change, not a config switch.

**How do I add a section?**
Add a typed field (with a default) to the schema, a component under
`src/components/sections/`, wire it in `page.tsx` behind an emptiness check,
add it to `nav`. `AGENTS.md` has the checklist; it is written so a coding
agent can do it.

**The terminal typed `whoami` by itself. Can I turn that off?**
Yes: the terminal's Settings tab (per browser), or change `INTRO` in
`Terminal.tsx` for everyone.

**What does `/api/ready` returning 503 mean?**
The content baked into that build failed schema validation; the body names the
field. It should never happen in practice because the same validation fails
the build first — it exists so an orchestrator can tell "up" from "correct".

**Can it run on a Raspberry Pi?**
Yes. Releases are multi-arch (`linux/arm64`), and 40 MB of RAM is nothing.

**Why no analytics?**
A resume site does not need them, and adding a third-party script is the one
thing that would make the privacy story worse. Your reverse proxy or CDN logs
already tell you if anyone visits.

**Is there a dark/light toggle?**
No; the design is dark. The print view is light and ink-friendly.

**Where is the roadmap?**
`PLAN.md`.
