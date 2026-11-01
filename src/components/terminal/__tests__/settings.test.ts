// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, applySettings, loadSettings, saveSettings } from "../Settings";

const KEY = "promptfolio.settings";

describe("terminal settings storage", () => {
  beforeEach(() => window.localStorage.clear());

  it("returns the defaults when nothing is stored", () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });
  it("ignores garbage and unknown values", () => {
    window.localStorage.setItem(KEY, "not json");
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
    window.localStorage.setItem(KEY, JSON.stringify({ fontSize: "huge", aurora: "yes" }));
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });
  it("round-trips a saved preference and applies it to the document", () => {
    const prefs = { aurora: false, bootAnimation: false, fontSize: "large" } as const;
    saveSettings(prefs);
    expect(loadSettings()).toEqual(prefs);
    applySettings(prefs);
    expect(document.documentElement.dataset.aurora).toBe("off");
  });
  it("applying the defaults on load does not touch storage", () => {
    saveSettings({ aurora: false, bootAnimation: true, fontSize: "small" });
    applySettings(DEFAULT_SETTINGS);
    expect(loadSettings().aurora).toBe(false);
  });
});
