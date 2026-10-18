#!/usr/bin/env node
/**
 * Turn a finished `next build` into a relocatable static site.
 *
 *   pnpm build
 *   pnpm export:static            # writes out/static
 *
 * The result is plain files — index.html, about.html, print.html, resume.json,
 * the photo and logos, and assets/_next/static — that work from any path on
 * any static host: GitHub Pages, Cloudflare Pages, S3 + CloudFront, Netlify,
 * a $0 bucket. It is the smallest possible deployment: no server at all.
 *
 * What changes versus the container: the interactive terminal, About page and
 * print view all work; `/api/resume` becomes the static resume.json; the
 * `/api/health` and `/api/ready` probes do not exist (nothing to probe).
 *
 * Why rewriting is needed: Next.js emits absolute /_next/ asset paths, and the
 * Turbopack runtime identifies chunks by stripping a base path from each
 * script's raw src attribute. Three rewrites make the output relocatable:
 *   1. script/link attributes get a relative prefix,
 *   2. the embedded RSC payload's chunk references get the same prefix,
 *   3. TURBOPACK_CHUNK_BASE_PATH is set to that prefix before any chunk loads.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PREFIX = "assets/_next/";
const [nextDir = ".next", outDir = "out/static"] = process.argv.slice(2);

// Prerendered pages and the file name each becomes.
const PAGES = [
  ["index.html", "index.html"],
  ["about.html", "about.html"],
  ["print.html", "print.html"],
];

function relocate(html) {
  html = html.replace(/<script src="[^"]*" noModule=""><\/script>/g, ""); // legacy polyfills
  html = html
    .replaceAll('src="/_next/', `src="${PREFIX}`)
    .replaceAll('href="/_next/', `href="${PREFIX}`);
  html = html.replaceAll('\\"/_next/', `\\"${PREFIX}`); // client-reference chunk paths inside the RSC payload
  html = html
    .replaceAll('href="/print"', 'href="print.html"')
    .replaceAll('href="/about"', 'href="about.html"')
    .replaceAll('href="/api/resume"', 'href="resume.json"')
    .replaceAll('href="/api/health"', 'href="resume.json"')
    .replaceAll('href="/"', 'href="index.html"')
    // Content assets from public/ (photo, logos, favicon) become relative too —
    // in the HTML and in the embedded RSC payload React hydrates from.
    .replace(/(src="|href="|\\")\/(logos\/|photo\.|favicon\.)/g, "$1$2");
  // Set the chunk base path before any chunk loads, and let plain .html/.json
  // links navigate normally instead of being intercepted by the client router.
  const boot =
    `<script>globalThis.TURBOPACK_CHUNK_BASE_PATH="${PREFIX}";` +
    'document.addEventListener("click",function(e){var a=e.target&&e.target.closest&&e.target.closest("a");' +
    'if(a&&/\\.(html|json)$/.test(a.getAttribute("href")||""))e.stopPropagation();},true);</script>';
  return html.replace("<head>", "<head>" + boot);
}

const serverApp = join(nextDir, "server", "app");
if (!existsSync(join(serverApp, "index.html"))) {
  console.error(`No prerendered pages in ${serverApp}. Run \`pnpm build\` first.`);
  process.exit(1);
}
rmSync(outDir, { recursive: true, force: true });
mkdirSync(join(outDir, "assets", "_next"), { recursive: true });
cpSync(join(nextDir, "static"), join(outDir, "assets", "_next", "static"), {
  recursive: true,
  filter: (src) => !src.includes(`${join("static", "development")}`),
});
for (const [src, dest] of PAGES) {
  const file = join(serverApp, src);
  if (existsSync(file)) writeFileSync(join(outDir, dest), relocate(readFileSync(file, "utf8")));
}
// public/ as-is (photo, logos, favicon) and the resume as the API's stand-in.
if (existsSync("public")) cpSync("public", outDir, { recursive: true });
if (existsSync("src/app/favicon.ico")) cpSync("src/app/favicon.ico", join(outDir, "favicon.ico"));
const resume = JSON.parse(readFileSync("content/resume.json", "utf8"));
writeFileSync(join(outDir, "resume.json"), JSON.stringify(resume, null, 2) + "\n");
console.log(`wrote ${outDir}`);
