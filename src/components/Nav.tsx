import Link from "next/link";
import { Icon } from "./Icon";
import { MobileMenu } from "./MobileMenu";
import type { SiteConfig } from "@/lib/resume/schema";

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
    <header className="no-print fixed inset-x-0 top-0 z-50">
      <div className="relative mx-auto mt-3 flex max-w-6xl items-center gap-4 px-4">
        <nav className="glass flex w-full items-center gap-2 rounded-full px-3 py-2">
          <Link href="/" className="text-fg-strong flex items-center gap-2 pr-2 pl-1">
            {image ? (
              // Plain <img>: the photo is a static asset or an external URL and needs no optimization pipeline.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-white/20"
              />
            ) : (
              <span className="bg-accent grid h-7 w-7 place-items-center rounded-md font-mono text-xs font-bold text-white">
                {initials(name)}
              </span>
            )}
            <span className="hidden font-semibold sm:inline">{name}</span>
          </Link>
          <ul className="ml-2 hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-fg hover:text-fg-strong rounded-full px-3 py-1.5 text-sm hover:bg-white/5"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="/api/resume"
              className="btn btn-ghost hidden !px-3 !py-1.5 text-sm sm:inline-flex"
              title="JSON Resume document"
            >
              <Icon name="json" className="h-4 w-4" /> JSON
            </a>
            <Link href="/print" className="btn btn-primary !px-3 !py-1.5 text-sm">
              <Icon name="download" className="h-4 w-4" /> PDF
            </Link>
            <MobileMenu nav={nav} />
          </div>
        </nav>
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
