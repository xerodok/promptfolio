import { describe, expect, it } from "vitest";
import { getResume, getSite } from "@/lib/resume/load";
import { commandNames, completeCommand, runCommand } from "../commands";

const ctx = { resume: getResume(), site: getSite() };

describe("runCommand", () => {
  it("returns nothing for empty input", () => {
    expect(runCommand("   ", ctx).lines).toEqual([]);
  });
  it("reports unknown commands", () => {
    const { lines } = runCommand("sudo rm -rf /", ctx);
    expect(lines[0]).toMatchObject({ kind: "err", text: "command not found: sudo" });
  });
  it("help lists every registered command", () => {
    const text = runCommand("help", ctx)
      .lines.map((l) => l.text)
      .join("\n");
    for (const name of commandNames) expect(text).toContain(name);
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
  it("clear emits a clear action", () => {
    expect(runCommand("clear", ctx)).toEqual({ lines: [], action: { type: "clear" } });
  });
  it("is case-insensitive on the command name", () => {
    expect(runCommand("WHOAMI", ctx).lines[0].kind).toBe("ok");
  });
});

describe("completeCommand", () => {
  it("completes prefixes", () => {
    expect(completeCommand("ex")).toEqual(["experience"]);
    expect(completeCommand("")).toEqual([]);
  });
});
