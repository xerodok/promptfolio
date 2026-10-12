import type { Resume } from "@/lib/resume/schema";
import { Section } from "./Section";

const LEVELS: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
  master: 4,
};

export function Skills({ skills }: { skills: Resume["skills"] }) {
  return (
    <Section id="skills" eyebrow="Skills" title="Tools I reach for">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((s) => {
          const level = s.level ? (LEVELS[s.level.toLowerCase()] ?? 0) : 0;
          return (
            <div key={s.name} className="card p-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <h3 className="text-fg-strong font-semibold">{s.name}</h3>
                {level > 0 && (
                  <div className="flex gap-1" title={s.level} aria-label={`${s.level}`}>
                    {[1, 2, 3, 4].map((n) => (
                      <span
                        key={n}
                        className={`h-1.5 w-4 rounded-full ${n <= level ? "bg-accent" : "bg-white/10"}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {s.keywords.map((k) => (
                  <span key={k} className="chip">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
