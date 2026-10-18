"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Icon } from "./Icon";
import { NavLink } from "./NavLink";
import type { SiteConfig } from "@/lib/resume/schema";

/** Hamburger menu shown below the md breakpoint; the desktop link row hides it. */
export function MobileMenu({ nav }: { nav: SiteConfig["nav"] }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="nav-btn !px-2"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name={open ? "close" : "menu"} className="h-5 w-5" />
      </button>
      {open && (
        <div
          id={panelId}
          className="border-border bg-bg-elevated absolute inset-x-0 top-full border-b p-3 shadow-2xl shadow-black/60"
        >
          <ul className="flex flex-col gap-1 font-mono text-base">
            {nav.map((item) => (
              <li key={item.href} className="flex">
                <NavLink href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="border-border mt-3 flex gap-2 border-t pt-3">
            <a href="/api/resume" className="nav-btn flex-1 justify-center">
              <Icon name="json" className="h-4 w-4" /> JSON
            </a>
            <Link
              href="/print"
              prefetch={false}
              onClick={() => setOpen(false)}
              className="nav-btn nav-btn-accent flex-1 justify-center"
            >
              <Icon name="download" className="h-4 w-4" /> PDF
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
