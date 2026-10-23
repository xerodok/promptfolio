# Customizing

Everything a fork needs to change lives in two files and one constant.

## 1. `content/resume.json` (facts)

Standard [JSON Resume](https://jsonresume.org/schema). Fields the site renders:

| Field                           | Where it shows                                |
| ------------------------------- | --------------------------------------------- |
| `basics.name`                   | hero, nav, print, footer                      |
| `basics.label`                  | line under the name (when no tagline)         |
| `basics.image`                  | nav avatar (URL or `/photo.jpg` in `public/`) |
| `basics.email`, `url`           | contact buttons, print header                 |
| `basics.profiles[]`             | hero icon buttons and contact buttons         |
| `basics.summary`                | terminal `summary`, print view                |
| `work[]`                        | experience timeline, terminal `experience`    |
| `skills[]`                      | skills cards, terminal `skills`               |
| `projects[]`                    | repositories cards, terminal `repos`          |
| `education[]`, `certificates[]` | education section, terminal `education`       |
| `meta.version`, `lastModified`  | footer, `/api/ready`                          |

Dates are `YYYY`, `YYYY-MM` or `YYYY-MM-DD`. Leave `endDate` out for a current
role. Empty arrays hide their section.

## 2. `content/site.json` (presentation)

```jsonc
{
  "tagline": "", // optional line; empty shows basics.label
  "prompt": "you@homelab", // terminal prompt
  "sections": {
    // every heading is overridable
    "highlights": { "eyebrow": "Skill Portfolio", "title": "..." },
    "experience": { "eyebrow": "Experience", "title": "..." },
    "skills": { "eyebrow": "Skills", "title": "..." },
    "projects": { "eyebrow": "Repositories", "title": "..." },
    "education": { "eyebrow": "Education", "title": "..." },
    "contact": { "eyebrow": "Contact", "title": "...", "blurb": "..." },
  },
  "leadership": {
    // optional block above the skill portfolio
    "eyebrow": "Leadership",
    "title": "How I lead",
    "summary": "Your LinkedIn About text works well here.",
    "points": [{ "title": "Teams", "body": "..." }],
  },
  "stats": [{ "label": "...", "value": "..." }], // up to 6; empty hides the row
  "highlights": [{ "icon": "cluster", "title": "...", "body": "..." }],
  "nav": [{ "label": "Experience", "href": "#experience" }],
}
```

Highlight icons: `cluster`, `git`, `pulse`, `shield`, `code`, `terminal`.
Add more in `src/components/Icon.tsx` and the `highlightIcons` list in the schema.

### Employer logos

`site.json` → `"logos": { "<work[].name>": "/logos/acme.svg" }` puts a logo tile
beside that employer in the experience timeline (the key must match the
employer name in `resume.json` exactly; a unit test checks it). Files go in
`public/logos/` — or `private/logos/`, which `pnpm content:private` copies
there. Employers without an entry get a two-letter monogram tile. Logos are
shown on a white tile, so transparent or light-background artwork works best.

### Background

`site.json` → `"background"`: `"ascii"` (default — a diagonal brush-stroke of
colour rendered as a grid of monospace glyphs, drifting slowly), `"aurora"`
(soft curtains of colour) or `"none"`. Both animations use the `--glow-*`
tokens, pause when the tab is hidden, paint once under `prefers-reduced-motion`,
and can be switched off by a visitor in the terminal's Settings tab.

## 3. `content/about.json` (the About page)

`/about` is a longer-form page that lives apart from the resume so it can
change on its own schedule. It is a typed document (`aboutSchema`):
`eyebrow`, `title`, `intro`, optional `updated`, and `sections` of
`{ heading, paragraphs[], bullets[] }`. Link it from `nav` with
`{ "label": "About", "href": "/about" }`; the terminal's `about` command opens
it too. A private copy goes in `private/about.json`.

## 4. Attribution

`src/lib/template.ts` holds the template name, author and URL shown in the
footer. Forks keep it; your own name comes from the resume.

## Photo

Put `photo.jpg` in `public/` and set `"image": "/photo.jpg"`, or use a full
URL. The hero shows it as a large portrait above the name and the nav as a
32px circle; initials are the nav fallback and the hero simply omits it.

## Terminal

Besides the resume commands, the terminal understands a few shell basics:
`ls` (sections as folders, `resume.json` and `about.txt` as files), `cat`,
`cd`, `pwd`, `echo`, `date`, `history`, `man`, `uname`, `hostname`, `clear`,
`cmd --help`, Tab completion of commands and their arguments, and chaining
with `;` or `&&`. All of it is pure and unit-tested in `commands.ts`.

Commands live in `src/components/terminal/commands.ts`. The boot sequence
types `whoami` then `help`; change `INTRO` in `Terminal.tsx`. Quick-command
chips come from `quickCommands`.

## Theme

Colour tokens, radii and the hero band are in `src/app/globals.css`. Change the
accent and the four glow colours to re-skin the whole site.
