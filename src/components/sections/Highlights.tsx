import { Icon } from "@/components/Icon";
import type { SiteConfig } from "@/lib/resume/schema";
import { Section } from "./Section";

export function Highlights({ items }: { items: SiteConfig["highlights"] }) {
  return (
    <Section id="highlights" eyebrow="What I do" title="Platform engineering, end to end">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="card p-6">
            <div className="bg-accent/15 text-accent-strong mb-4 inline-grid h-10 w-10 place-items-center rounded-md">
              <Icon name={item.icon} />
            </div>
            <h3 className="text-fg-strong text-lg font-semibold">{item.title}</h3>
            <p className="text-fg-muted mt-2 text-[0.95rem]">{item.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
