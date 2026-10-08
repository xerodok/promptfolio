"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Resume, SiteConfig } from "@/lib/resume/schema";
import { completeCommand, runCommand, type Line } from "./commands";

type Entry = { id: number; input?: string; lines: Line[] };

const INTRO = ["whoami", "help"];

const LINE_CLASS: Record<Line["kind"], string> = {
  out: "text-fg",
  ok: "text-cyan",
  muted: "text-fg-muted",
  err: "text-magenta",
};

export function Terminal({ resume, site }: { resume: Resume; site: SiteConfig }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [booted, setBooted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  const execute = useCallback(
    (raw: string) => {
      const input = raw.trim();
      const { lines, action } = runCommand(input, { resume, site });
      if (action?.type === "clear") {
        setEntries([]);
      } else {
        setEntries((prev) => [...prev, { id: nextId.current++, input, lines }]);
      }
      if (input) setHistory((prev) => (prev[prev.length - 1] === input ? prev : [...prev, input]));
      setCursor(null);
      if (action?.type === "navigate") {
        document.querySelector(action.href)?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (action?.type === "open") {
        window.open(action.url, "_blank", "noopener");
      }
    },
    [resume, site],
  );

  // Boot sequence: type the intro commands as if someone were at the keyboard.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, reduced ? 0 : ms));
      });

    (async () => {
      await wait(400);
      for (const cmd of INTRO) {
        for (let i = 1; i <= cmd.length; i++) {
          if (cancelled) return;
          setValue(cmd.slice(0, i));
          await wait(45 + Math.random() * 60);
        }
        await wait(250);
        if (cancelled) return;
        setValue("");
        execute(cmd);
        await wait(500);
      }
      if (!cancelled) setBooted(true);
    })();

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [execute]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries, value]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      execute(value);
      setValue("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const next = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setValue(history[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cursor === null) return;
      const next = cursor + 1;
      if (next >= history.length) {
        setCursor(null);
        setValue("");
      } else {
        setCursor(next);
        setValue(history[next]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const matches = completeCommand(value);
      if (matches.length === 1) setValue(matches[0] + " ");
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setEntries([]);
    }
  }

  return (
    <div
      className="glass flex flex-col overflow-hidden rounded-lg font-mono text-[13.5px] leading-relaxed sm:text-sm"
      onClick={() => inputRef.current?.focus()}
      data-testid="terminal"
    >
      {/* Title bar with tabs, in the style of Tabby. */}
      <div className="border-border flex items-stretch border-b bg-black/30 text-[13px] select-none">
        <div className="flex items-center gap-2 px-4" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="border-border text-fg-strong flex items-center gap-3 border-x bg-white/5 px-4 py-2.5">
          <span className="text-fg-muted">1</span>
          <span>{site.prompt}</span>
        </div>
        <div className="text-fg-muted hidden items-center gap-3 px-4 sm:flex">
          <span>2</span>
          <span>Settings</span>
        </div>
        <div className="text-fg-muted flex items-center px-4">+</div>
        <div className="text-fg-muted ml-auto flex items-center px-4 text-xs">bash</div>
      </div>

      <div ref={scrollRef} className="term-scroll h-[22rem] overflow-y-auto px-4 py-3 sm:h-[24rem]">
        <div className="text-fg-muted">
          Welcome to the living resume. Type <span className="text-fg-strong">help</span> to get
          started.
        </div>
        {entries.map((entry) => (
          <div key={entry.id} className="mt-2">
            {entry.input !== undefined && (
              <div>
                <Prompt prompt={site.prompt} />
                <span className="text-fg-strong">{entry.input}</span>
              </div>
            )}
            {entry.lines.map((line, i) => (
              <div key={i} className={`whitespace-pre-wrap ${LINE_CLASS[line.kind]}`}>
                {line.text || " "}
              </div>
            ))}
          </div>
        ))}
        <div className="mt-2 flex items-center">
          <Prompt prompt={site.prompt} />
          <span className="text-fg-strong">{value}</span>
          <span className="term-caret" />
          <input
            ref={inputRef}
            aria-label="Terminal input"
            className="absolute h-0 w-0 opacity-0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            disabled={!booted}
          />
        </div>
      </div>
    </div>
  );
}

function Prompt({ prompt }: { prompt: string }) {
  return (
    <span className="mr-2 inline-flex items-stretch" aria-hidden="true">
      <span className="text-cyan rounded-l-sm bg-[#1f3a4d] px-2">{prompt}</span>
      <span className="bg-accent px-2 text-white">~</span>
      <span className="text-accent">▶</span>
    </span>
  );
}
