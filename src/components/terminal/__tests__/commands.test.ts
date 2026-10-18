import { describe, expect, it } from "vitest";
import { getAbout, getResume, getSite } from "@/lib/resume/load";
import { commandNames, completeCommand, quickCommands, runCommand } from "../commands";

const ctx = {
  resume: getResume(),
  site: getSite(),
  about: getAbout(),
  history: ["whoami", "skills"],
  now: () => new Date(Date.UTC(2026, 0, 2, 3, 4, 5)),
};

describe("runCommand", () => {
  it("returns nothing for empty input", () => {
    expect(runCommand("   ", ctx).lines).toEqual([]);
  });
  it("reports unknown commands", () => {
    const { lines } = runCommand("rm -rf /", ctx);
    expect(lines[0]).toMatchObject({ kind: "err", text: "command not found: rm" });
  });
  it("help lists every registered command", () => {
    const text = runCommand("help", ctx)
      .lines.map((l) => l.text)
      .join("\n");
    for (const name of commandNames) expect(text).toContain(name);
  });
  it("renders tabular output as two columns with a plain-text fallback", () => {
    const line = runCommand("help", ctx).lines[1];
    expect(line.cols?.[0]).toBe("whoami");
    expect(line.text).toBe("whoami  who this is");
    for (const l of runCommand("skills", ctx).lines) expect(l.cols?.[0]).toBeTruthy();
  });
  it("quick commands are all real commands", () => {
    for (const q of quickCommands) expect(commandNames).toContain(q);
  });
  it("whoami prints the name from the resume", () => {
    expect(runCommand("whoami", ctx).lines[0].text).toBe(ctx.resume.basics.name);
  });
  it("experience <n> shows one role and validates the index", () => {
    expect(runCommand("experience 1", ctx).lines[0].text).toContain(ctx.resume.work[0].position);
    expect(runCommand("experience 99", ctx).lines[0].kind).toBe("err");
  });
  it("open validates the section and emits a navigate action", () => {
    expect(runCommand("open skills", ctx).action).toEqual({ type: "navigate", href: "#skills" });
    expect(runCommand("open nope", ctx).lines[0].kind).toBe("err");
  });
  it("about emits a goto action for the about page", () => {
    expect(runCommand("about", ctx).action).toEqual({ type: "goto", href: "/about" });
  });
  it("clear emits a clear action", () => {
    expect(runCommand("clear", ctx)).toEqual({ lines: [], action: { type: "clear" } });
  });
  it("is case-insensitive on the command name", () => {
    expect(runCommand("WHOAMI", ctx).lines[0].kind).toBe("ok");
  });
});

describe("shell features", () => {
  it("ls lists the sections and files; ls <section> runs that section", () => {
    const top = runCommand("ls", ctx).lines[0].text;
    expect(top).toContain("experience/");
    expect(top).toContain("resume.json");
    expect(runCommand("ls -l", ctx).lines[0].cols?.[0]).toBe("drwxr-xr-x");
    expect(runCommand("ls skills", ctx).lines).toEqual(runCommand("skills", ctx).lines);
    expect(runCommand("ls nope", ctx).lines[0].kind).toBe("err");
  });
  it("cat prints the two files and refuses directories", () => {
    expect(runCommand("cat resume.json", ctx).lines[0].text).toBe("{");
    expect(runCommand("cat about.txt", ctx).lines[0].text).toBe(ctx.about.title);
    expect(runCommand("cat skills", ctx).lines[0].text).toContain("Is a directory");
    expect(runCommand("cat", ctx).lines[0].kind).toBe("err");
  });
  it("cd jumps to a section, and plain cd goes to the top", () => {
    expect(runCommand("cd experience", ctx).action).toEqual({
      type: "navigate",
      href: "#experience",
    });
    expect(runCommand("cd", ctx).action).toEqual({ type: "navigate", href: "#" });
    expect(runCommand("cd nope", ctx).lines[0].kind).toBe("err");
  });
  it("pwd, echo, hostname and uname use the prompt from site.json", () => {
    const [u, h] = ctx.site.prompt.split("@");
    expect(runCommand("pwd", ctx).lines[0].text).toBe(`/home/${u}`);
    expect(runCommand("echo hi $USER", ctx).lines[0].text).toBe(`hi ${u}`);
    expect(runCommand("hostname", ctx).lines[0].text).toBe(h);
    expect(runCommand("uname -a", ctx).lines[0].text).toContain(h);
  });
  it("date uses the injected clock", () => {
    expect(runCommand("date", ctx).lines[0].text).toContain("2026");
  });
  it("history lists what was typed", () => {
    const lines = runCommand("history", ctx).lines;
    expect(lines).toHaveLength(2);
    expect(lines[1].cols?.[1]).toBe("skills");
  });
  it("man and --help explain one command", () => {
    expect(runCommand("man ls", ctx).lines[0].text).toBe("ls [dir]");
    expect(runCommand("ls --help", ctx).lines[0].text).toBe("ls [dir]");
    expect(runCommand("man nope", ctx).lines[0].kind).toBe("err");
  });
  it("sudo is refused and exit is a joke", () => {
    expect(runCommand("sudo reboot", ctx).lines[0].kind).toBe("err");
    expect(runCommand("exit", ctx).lines[0].kind).toBe("muted");
  });
  it("chains with ; always and with && only on success", () => {
    expect(runCommand("pwd ; hostname", ctx).lines.map((l) => l.text)).toHaveLength(2);
    expect(runCommand("pwd && hostname", ctx).lines).toHaveLength(2);
    const stopped = runCommand("nope && hostname", ctx).lines;
    expect(stopped[0].kind).toBe("err");
    expect(stopped.map((l) => l.text)).not.toContain(ctx.site.prompt.split("@")[1]);
    expect(runCommand("pwd && open skills", ctx).action).toEqual({
      type: "navigate",
      href: "#skills",
    });
  });
});

describe("completeCommand", () => {
  it("completes command names", () => {
    expect(completeCommand("exp")).toEqual(["experience"]);
    expect(completeCommand("ex")).toEqual(["experience", "exit"]);
    expect(completeCommand("")).toEqual([]);
  });
  it("completes the argument of cat, ls, cd, open and man", () => {
    expect(completeCommand("cat ab")).toEqual(["cat about.txt"]);
    expect(completeCommand("cd ex")).toEqual(["cd experience"]);
    expect(completeCommand("man wh")).toEqual(["man whoami"]);
    expect(completeCommand("echo x")).toEqual([]);
  });
});
