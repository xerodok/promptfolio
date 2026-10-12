# Customizing

Everything a fork needs to change lives in two files and one constant.

## 1. `content/resume.json` (facts)

Standard [JSON Resume](https://jsonresume.org/schema). Fields the site renders:

| Field                           | Where it shows                                |
| ------------------------------- | --------------------------------------------- |
| `basics.name`                   | hero, nav, print, footer                      |
| `basics.label`                  | italic line under the name (when no tagline)  |
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
  "tagline": "", // optional italic line; empty shows basics.label
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

## 3. Attribution

`src/lib/template.ts` holds the template name, author and URL shown in the
footer. Forks keep it; your own name comes from the resume.

## Photo

Put `photo.jpg` in `public/` and set `"image": "/photo.jpg"`, or use a full
URL. The nav shows it as a 28px circle; initials are the fallback.

## Terminal

Commands live in `src/components/terminal/commands.ts`. The boot sequence
types `whoami` then `help`; change `INTRO` in `Terminal.tsx`. Quick-command
chips come from `quickCommands`.

## Theme

Colour tokens, radii and the hero band are in `src/app/globals.css`. Change the
accent and the four glow colours to re-skin the whole site.
