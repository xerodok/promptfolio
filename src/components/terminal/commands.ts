import type { About, Resume, SiteConfig } from "@/lib/resume/schema";
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

export type CommandContext = {
  resume: Resume;
  site: SiteConfig;
  /** The About page document, for `cat about.txt`. */
  about?: About;
  /** Commands entered so far in this session, for `history`. */
  history?: string[];
  /** Injectable clock for `date` (tests); defaults to the wall clock. */
  now?: () => Date;
};

type Command = {
  name: string;
  usage: string;
  /** Which `help` group the command is listed under. */
  group: "resume" | "shell";
  run: (ctx: CommandContext, args: string[]) => Line[] | { lines: Line[]; action?: Action };
};

export type Action =
  | { type: "clear" }
  | { type: "navigate"; href: string }
  | { type: "goto"; href: string }
  | { type: "open"; url: string };

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

/** The pretend home directory: the sections as folders, two files. */
const FILES = ["resume.json", "about.txt"] as const;
const DIRS = ["leadership", ...SECTIONS] as const;

const user = (site: SiteConfig) => site.prompt.split("@")[0] || "guest";
const host = (site: SiteConfig) => site.prompt.split("@")[1] || "resume";

const commands: Command[] = [
  {
    name: "help",
    usage: "help",
    group: "shell",
    run: () => {
      const list = (group: Command["group"]) =>
        commands
          .filter((c) => c.group === group)
          .map((c) => cols("muted", c.usage, describe(c.name)));
      return [
        out("Resume:"),
        ...list("resume"),
        muted(""),
        out("Shell:"),
        ...list("shell"),
        muted(""),
        muted(
          "Tip: ↑/↓ for history, Tab to complete, `cmd --help` for one command, `a && b` to chain.",
        ),
      ];
    },
  },
  {
    name: "whoami",
    usage: "whoami",
    group: "resume",
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
    group: "resume",
    run: ({ resume }) => [out(resume.basics.summary ?? "No summary provided.")],
  },
  {
    name: "experience",
    usage: "experience [n]",
    group: "resume",
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
    group: "resume",
    run: ({ resume }) =>
      resume.skills.map((s) =>
        cols("out", s.name, `${s.keywords.join(", ")}${s.level ? `  [${s.level}]` : ""}`),
      ),
  },
  {
    name: "repos",
    usage: "repos",
    group: "resume",
    run: ({ resume }) =>
      resume.projects.flatMap((p) => [
        ok(p.name + (p.url ? `  ${p.url}` : "")),
        ...(p.description ? [muted(`   ${p.description}`)] : []),
      ]),
  },
  {
    name: "education",
    usage: "education",
    group: "resume",
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
    group: "resume",
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
    group: "resume",
    run: (_ctx, args) => goToSection(args[0], "open"),
  },
  {
    name: "about",
    usage: "about",
    group: "resume",
    run: () => ({
      lines: [muted("Opening /about…")],
      action: { type: "goto", href: "/about" },
    }),
  },
  {
    name: "json",
    usage: "json",
    group: "resume",
    run: () => ({
      lines: [muted("Opening /api/resume (JSON Resume format)…")],
      action: { type: "open", url: "/api/resume" },
    }),
  },
  {
    name: "pdf",
    usage: "pdf",
    group: "resume",
    run: () => ({
      lines: [muted("Opening the print view…")],
      action: { type: "open", url: "/print" },
    }),
  },
  // --- shell -----------------------------------------------------------------
  {
    name: "ls",
    usage: "ls [dir]",
    group: "shell",
    run: (ctx, args) => {
      const target = args.find((a) => !a.startsWith("-"));
      const long = args.includes("-l") || args.includes("-la") || args.includes("-al");
      if (!target || target === "~" || target === "." || target === "/") {
        const names = [...DIRS.map((d) => `${d}/`), ...FILES];
        return long
          ? names.map((n) => cols("out", n.endsWith("/") ? "drwxr-xr-x" : "-rw-r--r--", n))
          : [out(names.join("  "))];
      }
      const dir = target.replace(/\/$/, "");
      if ((SECTIONS as readonly string[]).includes(dir)) return run(dir, ctx).lines;
      if (dir === "leadership") {
        const block = ctx.site.leadership;
        return block ? [ok(block.title), out(block.summary)] : [muted("(empty)")];
      }
      return [err(`ls: cannot access '${target}': No such file or directory`)];
    },
  },
  {
    name: "cat",
    usage: "cat <file>",
    group: "shell",
    run: ({ resume, about }, args) => {
      const file = args[0];
      if (!file) return [err("Usage: cat <resume.json|about.txt>")];
      if (file === "resume.json") {
        return [
          ...JSON.stringify(resume.basics, null, 2)
            .split("\n")
            .map((l) => out(l)),
          muted(`… plus ${resume.work.length} work entries. Full document: \`json\`.`),
        ];
      }
      if (file === "about.txt") {
        if (!about) return [muted("(no about page)")];
        return [
          ok(about.title),
          ...(about.intro ? [out(about.intro), muted("")] : []),
          ...about.sections.flatMap((s) => [
            ok(`# ${s.heading}`),
            ...s.paragraphs.map((p) => out(p)),
            ...s.bullets.map((b) => out(`  • ${b}`)),
            muted(""),
          ]),
          muted("Full page: `about`."),
        ];
      }
      if ((DIRS as readonly string[]).includes(file.replace(/\/$/, ""))) {
        return [err(`cat: ${file}: Is a directory`)];
      }
      return [err(`cat: ${file}: No such file or directory`)];
    },
  },
  {
    name: "cd",
    usage: "cd [section]",
    group: "shell",
    run: (_ctx, args) => {
      const target = args[0];
      if (!target || target === "~" || target === "/") {
        return { lines: [], action: { type: "navigate", href: "#" } };
      }
      return goToSection(target.replace(/\/$/, ""), "cd");
    },
  },
  {
    name: "pwd",
    usage: "pwd",
    group: "shell",
    run: ({ site }) => [out(`/home/${user(site)}`)],
  },
  {
    name: "echo",
    usage: "echo <text>",
    group: "shell",
    run: ({ site }, args) => [
      out(
        args
          .map((a) => (a === "$USER" ? user(site) : a === "$HOME" ? `/home/${user(site)}` : a))
          .join(" "),
      ),
    ],
  },
  {
    name: "date",
    usage: "date",
    group: "shell",
    run: ({ now }) => [out((now ?? (() => new Date()))().toString())],
  },
  {
    name: "history",
    usage: "history",
    group: "shell",
    run: ({ history = [] }) =>
      history.length
        ? history.map((h, i) => cols("muted", String(i + 1).padStart(3), h))
        : [muted("(empty)")],
  },
  {
    name: "uname",
    usage: "uname [-a]",
    group: "shell",
    run: ({ site }, args) =>
      args.includes("-a")
        ? [out(`Promptfolio ${host(site)} Next.js/React · one container · no root, no secrets`)]
        : [out("Promptfolio")],
  },
  {
    name: "hostname",
    usage: "hostname",
    group: "shell",
    run: ({ site }) => [out(host(site))],
  },
  {
    name: "man",
    usage: "man <cmd>",
    group: "shell",
    run: (_ctx, args) => manual(args[0]),
  },
  {
    name: "sudo",
    usage: "sudo <cmd>",
    group: "shell",
    run: ({ site }) => [
      err(`${user(site)} is not in the sudoers file. This incident will be reported.`),
    ],
  },
  {
    name: "exit",
    usage: "exit",
    group: "shell",
    run: () => [muted("There is no exit; this is a resume. Try `pdf` to take it with you.")],
  },
  {
    name: "clear",
    usage: "clear",
    group: "shell",
    run: () => ({ lines: [], action: { type: "clear" } }),
  },
];

function goToSection(target: string | undefined, verb: string): CommandResult {
  if (!target || !(SECTIONS as readonly string[]).includes(target)) {
    return { lines: [err(`Usage: ${verb} <${SECTIONS.join("|")}>`)] };
  }
  return {
    lines: [muted(`Scrolling to #${target}…`)],
    action: { type: "navigate", href: `#${target}` },
  };
}

function manual(name: string | undefined): Line[] {
  const cmd = name && commands.find((c) => c.name === name.toLowerCase());
  if (!cmd) return [err(name ? `No manual entry for ${name}` : "What manual page do you want?")];
  return [ok(cmd.usage), out(describe(cmd.name))];
}

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
      about: "the longer version, on its own page",
      json: "download the JSON Resume document",
      pdf: "open the print-friendly resume",
      ls: "list the sections and files; ls <section> shows one",
      cat: "print a file: resume.json or about.txt",
      cd: "jump to a section; plain cd goes back to the top",
      pwd: "where you are",
      echo: "print text ($USER and $HOME expand)",
      date: "the time where you are",
      history: "what you have typed",
      uname: "what this is running on",
      hostname: "the machine's name",
      man: "one command, explained",
      sudo: "no",
      exit: "there is no exit",
      clear: "clear the screen",
    }[name] ?? ""
  );
}

export const commandNames = commands.map((c) => c.name);

/** Commands surfaced as tappable shortcuts under the terminal, for touch screens. */
export const quickCommands = ["help", "experience", "skills", "about", "contact"] as const;

/**
 * Tab completion for the whole input: the command name, or the first
 * argument of commands that take a section or a file.
 */
export function completeCommand(partial: string): string[] {
  if (!partial) return [];
  const [name, arg, ...rest] = partial.toLowerCase().split(/\s+/);
  if (arg === undefined) return commandNames.filter((n) => n.startsWith(name));
  if (rest.length) return [];
  const choices =
    name === "cat"
      ? [...FILES]
      : name === "ls"
        ? [...DIRS, ...FILES]
        : name === "cd" || name === "open"
          ? [...SECTIONS]
          : name === "man"
            ? commandNames
            : [];
  return choices.filter((c) => c.startsWith(arg)).map((c) => `${name} ${c}`);
}

/** Run one command (no chaining); `--help` on any command shows its manual entry. */
function run(input: string, ctx: CommandContext): CommandResult {
  const [name, ...args] = input.trim().split(/\s+/);
  if (!name) return { lines: [] };
  const cmd = commands.find((c) => c.name === name.toLowerCase());
  if (!cmd) {
    return {
      lines: [err(`command not found: ${name}`), muted("Type `help` to see what is available.")],
    };
  }
  if (args.includes("--help") || args.includes("-h")) return { lines: manual(cmd.name) };
  const result = cmd.run(ctx, args);
  return Array.isArray(result) ? { lines: result } : result;
}

/**
 * Run a command line. `a && b` runs b only if a produced no error; `a ; b`
 * runs both. The last action wins (a `clear` discards earlier output).
 */
export function runCommand(input: string, ctx: CommandContext): CommandResult {
  const parts = input.split(/\s*(&&|;)\s*/).filter((p) => p.length);
  let lines: Line[] = [];
  let action: Action | undefined;
  let skipNext = false;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part === "&&" || part === ";") continue;
    const conditional = i > 0 && parts[i - 1] === "&&";
    if (conditional && skipNext) continue;
    const result = run(part, ctx);
    if (result.action?.type === "clear") lines = [];
    else lines = [...lines, ...result.lines];
    if (result.action) action = result.action;
    skipNext = result.lines.some((l) => l.kind === "err");
  }
  return action ? { lines, action } : { lines };
}
