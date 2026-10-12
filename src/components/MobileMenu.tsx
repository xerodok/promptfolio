"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Icon } from "./Icon";
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
        className="btn btn-ghost !px-2.5 !py-1.5"
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
          className="border-border bg-bg-elevated absolute inset-x-4 top-full mt-2 rounded-lg border p-2 shadow-2xl shadow-black/60"
        >
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-fg-strong block rounded-md px-3 py-2.5 hover:bg-white/5"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="border-border mt-2 flex gap-2 border-t pt-2">
            <a href="/api/resume" className="btn btn-ghost flex-1 justify-center !py-2 text-sm">
              <Icon name="json" className="h-4 w-4" /> JSON
            </a>
            <Link
              href="/print"
              onClick={() => setOpen(false)}
              className="btn btn-primary flex-1 justify-center !py-2 text-sm"
            >
              <Icon name="download" className="h-4 w-4" /> PDF
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
