# Security

## Reporting a vulnerability

Report privately to the repository owner via GitHub's **Report a
vulnerability** button (Security tab) rather than a public issue. You will
get an acknowledgement within a few days; fixes ship as a normal release.

A running deployment also publishes `/.well-known/security.txt` (RFC 9116)
built from the resume's `basics.email`, so a researcher who finds a site and
not the repository still knows whom to contact.

## Threat model, briefly

Promptfolio serves prerendered pages and a handful of read-only routes (the
JSON Resume document, health and readiness probes, robots, sitemap, an Open
Graph image, `security.txt`). It has
**no authentication, no database, no user input that reaches a server, and no
secrets at runtime**. The interesting risks are therefore the supply chain
(what goes into the image) and the platform it runs on, not the application
logic. The terminal is a client-side toy over data the page already shows.

## What the provided manifests enforce

| Control                        | Compose        | Kubernetes                        | Why                                    |
| ------------------------------ | -------------- | --------------------------------- | -------------------------------------- |
| Non-root user (`app`, uid 100) | yes            | `runAsNonRoot`                    | nothing in the app needs root          |
| Read-only root filesystem      | yes            | yes                               | the app writes nothing                 |
| `/tmp` as tmpfs only           | yes            | emptyDir                          | the single writable path Node may want |
| All capabilities dropped       | yes            | yes                               | an HTTP server on port 3000 needs none |
| `no-new-privileges`            | yes            | `allowPrivilegeEscalation: false` | closes setuid paths                    |
| Memory / PID limits            | 128 Mi / 128   | 256 Mi                            | bounds a runaway                       |
| Seccomp                        | Docker default | `RuntimeDefault`                  |                                        |
| Service account token          | n/a            | not mounted                       | the pod never talks to the API server  |

Keep these when you write your own manifests; none of them costs anything.

## Image

- Runtime stage is bare Alpine plus a stripped Node binary and two libraries:
  no package manager, no curl/wget, no build tools. The health probe is a
  Node script.
- Base images and GitHub Actions are pinned (actions by commit SHA) and bumped
  by Dependabot; the lockfile is frozen in the build.
- `minimumReleaseAge` (three days, `pnpm-workspace.yaml`) keeps a freshly
  published package version out of any resolution until it has been public
  long enough for a compromised release to be noticed and pulled.
- Releases carry an SBOM and SLSA provenance and are signed with cosign
  (keyless, bound to the workflow identity). Verify before you trust a tag:

  ```bash
  cosign verify ghcr.io/<owner>/<repo>:main \
    --certificate-identity-regexp 'https://github.com/<owner>/<repo>/' \
    --certificate-oidc-issuer https://token.actions.githubusercontent.com
  ```

## HTTP headers

Set in `next.config.ts` for every response: `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Permissions-Policy: camera=(), microphone=(), geolocation=()`; `X-Powered-By`
is removed. **HSTS** belongs on whatever terminates TLS in front of the app.

**Content Security Policy** ships report-only. `next.config.ts` sends a
`Content-Security-Policy-Report-Only` header: `default-src 'self'`; inline
scripts and styles allowed, because the prerendered pages carry Next's
hydration script inline and React sets style attributes; images from `self`,
`data:` and any `https:` origin, since the photo and employer logos may be
URLs; fonts, connections and everything else `self`; `object-src 'none'`,
`base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`. Violations
appear in the browser console and block nothing. A deployment that injects a
script, such as a CDN's analytics beacon, adds its origins at build time with
`CSP_EXTRA_HOSTS="https://one.example https://two.example"` (space-separated;
appended to `script-src` and `connect-src`; also a Docker build argument).
Enforcement is the next step and needs the inline scripts hashed at build
time; a nonce-based policy would force per-request rendering. If you enforce
a policy at the proxy instead, note the inline boot script the static export
injects.

## Content and privacy

- The template's committed persona is fictional; CI runs gitleaks on every
  push. gitleaks does **not** recognise a resume, so keeping real content out
  of a public repository is a process rule (see `docs/DEPLOYMENT.md`).
- The site makes **no third-party requests**: fonts and icons are bundled,
  there is no analytics, and the terminal's settings stay in the browser's
  `localStorage`.
- Publishing a resume publishes an email address. If that is a concern, put
  a contact form or a mailto-obfuscation in front of it; the template
  deliberately keeps the plain address because recruiters copy it.

## Dependencies

Dependabot opens grouped update PRs weekly (`.github/dependabot.yml`) and
security updates immediately. Advisories in development-only tooling (ESLint,
Vitest, jsdom) never reach the image, whose runtime dependencies are Next,
React, Zod and two font packages; when a transitive fix is available but its
consumer has not bumped yet, `pnpm.overrides` in `package.json` lifts it (as
with `minimatch`), and the override is dropped once upstream catches up.
`pnpm audit` is not gated in CI on
purpose (it is noisy for a site with no runtime dependencies beyond Next and
React); run it before releases if you care about the number.
