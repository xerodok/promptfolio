/**
 * A logo on a light tile (most logos are drawn for a light background), or a
 * two-letter monogram tile when none is configured. Shared by the experience
 * timeline (employers) and the education cards (institutions); both read
 * `site.json` -> `logos`, keyed by the exact name from resume.json.
 */
export function LogoMark({ name, logo }: { name: string; logo?: string }) {
  return logo ? (
    // One square tile for every name; the logo fits inside, whatever its shape.
    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-white p-1.5 ring-1 ring-white/20">
      {/* Plain <img>: logos are small static assets and need no optimization pipeline. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} alt="" width={44} height={44} className="max-h-11 max-w-11 object-contain" />
    </span>
  ) : (
    <span
      aria-hidden="true"
      className="bg-surface-hover text-fg-strong grid h-14 w-14 shrink-0 place-items-center rounded-lg font-mono text-lg font-bold ring-1 ring-white/10"
    >
      {monogram(name)}
    </span>
  );
}

/** "Henry Ford College (Cisco Network Academy)" -> "HF": parentheticals are ignored. */
export function monogram(name: string): string {
  return name
    .replace(/\(.*?\)/g, "")
    .split(/\s+/)
    .filter((w) => /^[A-Za-z0-9]/.test(w))
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
