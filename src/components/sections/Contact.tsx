import { Icon, profileIcon } from "@/components/Icon";
import type { Resume } from "@/lib/resume/schema";
import { Section } from "./Section";

export function Contact({ basics }: { basics: Resume["basics"] }) {
  const links = [
    ...(basics.email
      ? [{ label: basics.email, href: `mailto:${basics.email}`, icon: "mail" as const }]
      : []),
    ...(basics.url
      ? [
          {
            label: basics.url.replace(/^https?:\/\//, ""),
            href: basics.url,
            icon: "globe" as const,
          },
        ]
      : []),
    ...basics.profiles
      .filter((p) => p.url)
      .map((p) => ({ label: p.network, href: p.url!, icon: profileIcon(p.network) })),
  ];
  return (
    <Section id="contact" eyebrow="Contact" title="Let's talk">
      <div className="card flex flex-col items-center gap-6 p-8 text-center">
        <p className="text-fg-muted max-w-xl text-lg">
          Open to platform, SRE and infrastructure roles. The fastest way to reach me is email.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="btn btn-ghost"
              target={l.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noopener noreferrer"
            >
              <Icon name={l.icon} className="h-4 w-4" /> {l.label}
            </a>
          ))}
        </div>
      </div>
    </Section>
  );
}
