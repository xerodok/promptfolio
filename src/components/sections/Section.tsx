export function Section({
  id,
  eyebrow,
  title,
  children,
  className = "",
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`mx-auto w-full max-w-6xl px-4 py-16 sm:py-24 ${className}`}>
      <div className="mb-10">
        <div className="text-accent mb-2 font-mono text-xs tracking-[0.2em] uppercase">
          {eyebrow}
        </div>
        <h2 className="display text-3xl sm:text-4xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}
