import { describe, expect, it } from "vitest";
import { formatDate, formatDuration, formatRange, monthsBetween, parseDate } from "../format";

describe("parseDate", () => {
  it("parses year-only and year-month values", () => {
    expect(parseDate("2022")).toEqual({ year: 2022, month: undefined });
    expect(parseDate("2022-03")).toEqual({ year: 2022, month: 3 });
    expect(parseDate("2022-03-15")).toEqual({ year: 2022, month: 3 });
  });
  it("rejects nonsense", () => {
    expect(() => parseDate("2022-13")).toThrow();
    expect(() => parseDate("soon")).toThrow();
  });
});

describe("formatDate / formatRange", () => {
  it("formats month names", () => {
    expect(formatDate("2022-03")).toBe("Mar 2022");
    expect(formatDate("2019")).toBe("2019");
  });
  it("uses Present for open-ended ranges", () => {
    expect(formatRange("2022-03")).toBe("Mar 2022 – Present");
    expect(formatRange("2019-06", "2022-02")).toBe("Jun 2019 – Feb 2022");
  });
});

describe("monthsBetween / formatDuration", () => {
  const now = new Date(Date.UTC(2026, 9, 8)); // 2026-10-08
  it("counts inclusive months", () => {
    expect(monthsBetween("2019-06", "2022-02", now)).toBe(33);
    expect(monthsBetween("2022-03", undefined, now)).toBe(56);
    expect(monthsBetween("2022", "2022", now)).toBe(1);
  });
  it("never goes negative", () => {
    expect(monthsBetween("2030-01", "2020-01", now)).toBe(0);
  });
  it("formats durations", () => {
    expect(formatDuration(33)).toBe("2 yrs 9 mos");
    expect(formatDuration(24)).toBe("2 yrs");
    expect(formatDuration(1)).toBe("1 mo");
    expect(formatDuration(0)).toBe("0 mos");
  });
});
