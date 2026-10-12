import type { SiteConfig } from "@/lib/resume/schema";
import { Section } from "./Section";

export function Leadership({ block }: { block: NonNullable<SiteConfig["leadership"]> }) {
  return (
    <Section id="leadership" eyebrow={block.eyebrow} title={block.title}>
      <p className="text-fg mx-auto max-w-3xl text-center text-lg leading-relaxed sm:text-xl">
        {block.summary}
      </p>
      {block.points.length > 0 && (
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {block.points.map((pt) => (
            <div
              key={pt.title}
              className="card w-full p-6 text-center sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.7rem)]"
            >
              <h3 className="text-fg-strong text-lg font-semibold">{pt.title}</h3>
              <p className="text-fg-muted mt-2 text-[0.95rem]">{pt.body}</p>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
