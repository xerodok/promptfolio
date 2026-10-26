# Deploy: static hosting ($0)

The site is fully prerendered, so it can be served as plain files with no
server at all. The terminal, About page and print view all work; `/api/resume`
becomes a static `resume.json`; the health probes do not exist (nothing to
probe). This is the smallest possible deployment: about 1 MB.

## Prerequisites

- Node 22 and pnpm (`corepack enable`), a clone of your fork.
- An account on one static host: GitHub Pages, Cloudflare Pages, Netlify,
  or an S3 bucket.

## Build the folder

```bash
pnpm install
pnpm build
pnpm export:static          # -> out/static
```

`out/static` is relocatable: it works at a domain root **or** under a path
such as `https://you.github.io/resume/`. Test it locally:

```bash
npx serve out/static        # or: python3 -m http.server -d out/static 8080
```

## GitHub Pages (automatic on push)

The template ships `.github/workflows/pages.yml`. It is **manual by default**
so that forking does not publish anything by surprise.
The template itself is published this way at
<https://xerodok.github.io/promptfolio/> — the sample persona, served from a
sub-path, which is the hardest case for a static export.

1. Repository → Settings → Pages → _Build and deployment_ → Source: **GitHub Actions**.
2. Actions → _Deploy static site to GitHub Pages_ → **Run workflow**.
3. The run prints the URL (`https://<you>.github.io/<repo>/`). To publish on
   every push, uncomment the `push:` trigger at the top of the workflow.

Custom domain: Settings → Pages → Custom domain (GitHub creates the `CNAME`
file and the certificate).

## Cloudflare Pages

1. Dashboard → Workers & Pages → Create → Pages → connect the repository.
2. Build command: `pnpm build && pnpm export:static`. Output directory: `out/static`.
   Set the environment variable `NODE_VERSION=22`.
3. Deploy. Every push to `main` redeploys; preview URLs for branches are
   automatic. Custom domain under the project's _Custom domains_ tab.

## Netlify

Build command `pnpm build && pnpm export:static`, publish directory
`out/static`, environment `NODE_VERSION=22`. Add a `_redirects` file with
`/about /about.html 200` if you want the extension-less URL.

## S3 + CloudFront (AWS)

See [aws.md](aws.md#s3--cloudfront-static) — same folder, uploaded with
`aws s3 sync`, ~$0.50/month.

## Verify

- Open the URL: the hero renders, the terminal types `whoami`, `ls` works.
- `/about.html` and `/print.html` load; `/resume.json` returns the document.
- No requests fail in the browser console (the export rewrites every asset
  path to be relative).

## Update

Rebuild and redeploy the folder — on Pages/Netlify that is a push; on S3 a
`sync`. Invalidate the CDN cache if you use one.

## Remove

Delete the Pages project / site / bucket. Nothing else exists.

## Limits

- `/api/health` and `/api/ready` are not available (there is no process).
- The terminal's `about` command navigates to `/about`; GitHub Pages, Netlify
  and Cloudflare Pages serve `about.html` for it automatically, S3 needs a
  CloudFront function or a redirect rule (shown in aws.md).
