import { Icon } from "@/components/Icon";
import type { SiteConfig } from "@/lib/resume/schema";
import { Section } from "./Section";

export function Highlights({
  items,
  heading,
}: {
  items: SiteConfig["highlights"];
  heading: SiteConfig["sections"]["highlights"];
}) {
  return (
    <Section id="highlights" eyebrow={heading.eyebrow} title={heading.title}>
      <div className="flex flex-wrap justify-center gap-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="card flex w-full flex-col items-center p-6 text-center sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.7rem)]"
          >
            <div className="bg-accent/15 text-accent-strong mb-4 grid h-12 w-12 place-items-center rounded-lg">
              <Icon name={item.icon} className="h-6 w-6" />
            </div>
            <h3 className="text-fg-strong text-xl font-semibold">{item.title}</h3>
            <p className="text-fg-muted mt-2 text-[0.95rem]">{item.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
