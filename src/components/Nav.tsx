import Link from "next/link";
import { Icon } from "./Icon";
import { MobileMenu } from "./MobileMenu";
import { NavLink } from "./NavLink";
import type { SiteConfig } from "@/lib/resume/schema";

/**
 * Flat, full-width bar in the terminal's own idiom: monospace links with a
 * prompt marker, square bordered actions, a hairline under the bar.
 */
export function Nav({
  name,
  image,
  nav,
}: {
  name: string;
  image?: string;
  nav: SiteConfig["nav"];
}) {
  return (
    <header className="no-print border-border bg-bg/55 fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md">
      <div className="relative mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="text-fg-strong flex items-center gap-2.5">
          {image ? (
            // Plain <img>: the photo is a static asset or an external URL and needs no optimization pipeline.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover ring-1 ring-white/20"
            />
          ) : (
            <span className="bg-accent grid h-8 w-8 place-items-center rounded-sm font-mono text-xs font-bold text-white">
              {initials(name)}
            </span>
          )}
          <span className="hidden font-semibold sm:inline">{name}</span>
        </Link>
        <ul className="ml-4 hidden items-center gap-1 font-mono text-sm md:flex">
          {nav.map((item) => (
            <li key={item.href}>
              <NavLink href={item.href}>{item.label}</NavLink>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-2">
          <a
            href="/api/resume"
            className="nav-btn hidden sm:inline-flex"
            title="JSON Resume document"
          >
            <Icon name="json" className="h-4 w-4" /> JSON
          </a>
          <Link href="/print" className="nav-btn nav-btn-accent">
            <Icon name="download" className="h-4 w-4" /> PDF
          </Link>
          <MobileMenu nav={nav} />
        </div>
      </div>
    </header>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
