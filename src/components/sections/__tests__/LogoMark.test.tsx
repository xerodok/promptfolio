import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LogoMark, monogram } from "../LogoMark";

describe("monogram", () => {
  it("takes the first letters of the first two words", () => {
    expect(monogram("Michigan State University")).toBe("MS");
    expect(monogram("Acme")).toBe("A");
  });
  it("ignores parentheticals and punctuation-only words", () => {
    expect(monogram("Henry Ford College (Cisco Network Academy)")).toBe("HF");
    expect(monogram("YOOX NET-A-PORTER GROUP")).toBe("YN");
    expect(monogram("- Northwind")).toBe("N");
  });
});

describe("LogoMark", () => {
  it("renders the configured logo as a decorative image", () => {
    const html = renderToStaticMarkup(<LogoMark name="Acme" logo="/logos/acme.svg" />);
    expect(html).toContain('src="/logos/acme.svg"');
    expect(html).toContain('alt=""');
    expect(html).not.toContain("A<");
  });
  it("falls back to a monogram tile", () => {
    const html = renderToStaticMarkup(<LogoMark name="State University (sample)" />);
    expect(html).not.toContain("<img");
    expect(html).toContain(">SU<");
    expect(html).toContain('aria-hidden="true"');
  });
});
