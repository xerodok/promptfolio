import Link from "next/link";

/**
 * A menu item in the terminal idiom: prompt marker + label, underlined in the
 * accent on hover. Anchor links (`#section`) stay plain <a>s so the browser
 * handles the scroll; page links (`/about`) go through next/link.
 */
export function NavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const className =
    "text-fg hover:text-fg-strong hover:border-accent inline-flex items-center gap-1.5 border-b-2 border-transparent px-2 py-1 transition-colors";
  const label = (
    <>
      <span aria-hidden="true" className="text-accent">
        &gt;
      </span>
      {children}
    </>
  );
  return href.startsWith("/") ? (
    <Link href={href} onClick={onClick} className={className} prefetch={false}>
      {label}
    </Link>
  ) : (
    <a href={href} onClick={onClick} className={className}>
      {label}
    </a>
  );
}
