"use client";

/**
 * The terminal's Settings tab: a few per-browser preferences. Stored in
 * localStorage as a convenience only (it may be unavailable or cleared, so
 * every read and write is guarded and the defaults always work).
 */
export type TerminalSettings = {
  /** The slow aurora behind the page. */
  aurora: boolean;
  /** Type the intro commands at boot, or run them instantly. */
  bootAnimation: boolean;
  fontSize: "small" | "medium" | "large";
};

export const DEFAULT_SETTINGS: TerminalSettings = {
  aurora: true,
  bootAnimation: true,
  fontSize: "medium",
};

const STORAGE_KEY = "promptfolio.settings";

export function loadSettings(): TerminalSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<TerminalSettings>;
    return {
      aurora: typeof parsed.aurora === "boolean" ? parsed.aurora : DEFAULT_SETTINGS.aurora,
      bootAnimation:
        typeof parsed.bootAnimation === "boolean"
          ? parsed.bootAnimation
          : DEFAULT_SETTINGS.bootAnimation,
      fontSize:
        parsed.fontSize === "small" || parsed.fontSize === "large" ? parsed.fontSize : "medium",
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Persist and apply document-level effects (the aurora lives outside the terminal). */
export function applySettings(s: TerminalSettings): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.aurora = s.aurora ? "on" : "off";
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable: settings still apply for this page view */
  }
}

export function Settings({
  value,
  onChange,
}: {
  value: TerminalSettings;
  onChange: (next: TerminalSettings) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="text-fg-muted">
        Preferences for this browser. They are remembered on this device only.
      </div>
      <Toggle
        label="Aurora background"
        hint="The slow drift of colour behind the page."
        checked={value.aurora}
        onChange={(aurora) => onChange({ ...value, aurora })}
      />
      <Toggle
        label="Boot animation"
        hint="Type the intro commands when the page opens."
        checked={value.bootAnimation}
        onChange={(bootAnimation) => onChange({ ...value, bootAnimation })}
      />
      <fieldset>
        <legend className="text-fg-strong">Terminal font size</legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(["small", "medium", "large"] as const).map((size) => (
            <button
              key={size}
              type="button"
              aria-pressed={value.fontSize === size}
              onClick={() => onChange({ ...value, fontSize: size })}
              className={`chip hover:border-white/30 ${
                value.fontSize === size ? "border-accent text-accent-strong" : ""
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </fieldset>
      <button
        type="button"
        className="text-fg-muted hover:text-fg-strong underline underline-offset-4"
        onClick={() => onChange(DEFAULT_SETTINGS)}
      >
        Reset to defaults
      </button>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        className="accent-accent mt-1 h-4 w-4"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <span className="text-fg-strong block">{label}</span>
        <span className="text-fg-muted block text-[0.9em]">{hint}</span>
      </span>
    </label>
  );
}
