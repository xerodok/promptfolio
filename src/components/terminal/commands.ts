import type { Resume, SiteConfig } from "@/lib/resume/schema";
import { formatRange } from "@/lib/resume/format";

/**
 * One line of terminal output. `cols` is an optional two-column form of the
 * same text; the UI renders it as a grid so it wraps cleanly on narrow screens
 * while `text` stays a plain, single-string fallback.
 */
export type Line = {
  kind: "out" | "err" | "muted" | "ok";
  text: string;
  cols?: [string, string];
};

export type CommandContext = { resume: Resume; site: SiteConfig };

type Command = {
  name: string;
  usage: string;
  run: (ctx: CommandContext, args: string[]) => Line[] | { lines: Line[]; action?: Action };
};

export type Action =
  { type: "clear" } | { type: "navigate"; href: string } | { type: "open"; url: string };

export type CommandResult = { lines: Line[]; action?: Action };

const out = (text: string): Line => ({ kind: "out", text });
const muted = (text: string): Line => ({ kind: "muted", text });
const ok = (text: string): Line => ({ kind: "ok", text });
const err = (text: string): Line => ({ kind: "err", text });
const cols = (kind: Line["kind"], a: string, b: string): Line => ({
  kind,
  text: `${a}  ${b}`,
  cols: [a, b],
});

const SECTIONS = ["experience", "skills", "projects", "education", "contact"] as const;

const commands: Command[] = [
  {
    name: "help",
    usage: "help",
    run: () => [
      out("Available commands:"),
      ...commands.map((c) => cols("muted", c.usage, describe(c.name))),
      muted(""),
      muted("Tip: ↑/↓ for history, Tab to complete, or tap a command below."),
    ],
  },
  {
    name: "whoami",
    usage: "whoami",
    run: ({ resume, site }) => [
      ok(resume.basics.name),
      out(resume.basics.label ?? ""),
      muted(site.tagline),
      ...(resume.basics.location?.city
        ? [muted(`${resume.basics.location.city}, ${resume.basics.location.region ?? ""}`.trim())]
        : []),
    ],
  },
  {
    name: "summary",
    usage: "summary",
    run: ({ resume }) => [out(resume.basics.summary ?? "No summary provided.")],
  },
  {
    name: "experience",
    usage: "experience [n]",
    run: ({ resume }, args) => {
      const n = args[0] ? Number(args[0]) : undefined;
      if (n !== undefined) {
        const job = resume.work[n - 1];
        if (!job) return [err(`No role #${args[0]}. Try 1–${resume.work.length}.`)];
        return [
          ok(`${job.position} @ ${job.name}`),
          muted(formatRange(job.startDate, job.endDate)),
          ...(job.summary ? [out(job.summary)] : []),
          ...job.highlights.map((h) => out(`  • ${h}`)),
        ];
      }
      return resume.work.flatMap((job, i) => [
        ok(`${i + 1}. ${job.position} @ ${job.name}`),
        muted(`   ${formatRange(job.startDate, job.endDate)}`),
      ]);
    },
  },
  {
    name: "skills",
    usage: "skills",
    run: ({ resume }) =>
      resume.skills.map((s) =>
        cols("out", s.name, `${s.keywords.join(", ")}${s.level ? `  [${s.level}]` : ""}`),
      ),
  },
  {
    name: "repos",
    usage: "repos",
    run: ({ resume }) =>
      resume.projects.flatMap((p) => [
        ok(p.name + (p.url ? `  ${p.url}` : "")),
        ...(p.description ? [muted(`   ${p.description}`)] : []),
      ]),
  },
  {
    name: "education",
    usage: "education",
    run: ({ resume }) => [
      ...resume.education.map((e) =>
        out(`${[e.studyType, e.area].filter(Boolean).join(" ")} — ${e.institution}`),
      ),
      ...resume.certificates.map((c) => muted(`  ✓ ${c.name}${c.issuer ? ` (${c.issuer})` : ""}`)),
    ],
  },
  {
    name: "contact",
    usage: "contact",
    run: ({ resume }) => [
      ...(resume.basics.email ? [cols("out", "email", resume.basics.email)] : []),
      ...(resume.basics.url ? [cols("out", "web", resume.basics.url)] : []),
      ...resume.basics.profiles.map((p) =>
        cols("out", p.network.toLowerCase(), p.url ?? p.username ?? ""),
      ),
    ],
  },
  {
    name: "open",
    usage: "open <section>",
    run: (_ctx, args) => {
      const target = args[0];
      if (!target || !(SECTIONS as readonly string[]).includes(target)) {
        return [err(`Usage: open <${SECTIONS.join("|")}>`)];
      }
      return {
        lines: [muted(`Scrolling to #${target}…`)],
        action: { type: "navigate", href: `#${target}` },
      };
    },
  },
  {
    name: "json",
    usage: "json",
    run: () => ({
      lines: [muted("Opening /api/resume (JSON Resume format)…")],
      action: { type: "open", url: "/api/resume" },
    }),
  },
  {
    name: "pdf",
    usage: "pdf",
    run: () => ({
      lines: [muted("Opening the print view…")],
      action: { type: "open", url: "/print" },
    }),
  },
  {
    name: "clear",
    usage: "clear",
    run: () => ({ lines: [], action: { type: "clear" } }),
  },
];

function describe(name: string): string {
  return (
    {
      help: "list commands",
      whoami: "who this is",
      summary: "the short version",
      experience: "work history, or one role in detail",
      skills: "skills by category",
      repos: "repositories and projects",
      education: "degrees and certifications",
      contact: "how to reach me",
      open: "jump to a section of the page",
      json: "download the JSON Resume document",
      pdf: "open the print-friendly resume",
      clear: "clear the screen",
    }[name] ?? ""
  );
}

export const commandNames = commands.map((c) => c.name);

/** Commands surfaced as tappable shortcuts under the terminal, for touch screens. */
export const quickCommands = ["help", "experience", "skills", "repos", "contact"] as const;

export function completeCommand(partial: string): string[] {
  if (!partial) return [];
  return commandNames.filter((n) => n.startsWith(partial.toLowerCase()));
}

export function runCommand(input: string, ctx: CommandContext): CommandResult {
  const [name, ...args] = input.trim().split(/\s+/);
  if (!name) return { lines: [] };
  const cmd = commands.find((c) => c.name === name.toLowerCase());
  if (!cmd) {
    return {
      lines: [err(`command not found: ${name}`), muted("Type `help` to see what is available.")],
    };
  }
  const result = cmd.run(ctx, args);
  return Array.isArray(result) ? { lines: result } : result;
}
