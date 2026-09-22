type LegalSection = {
  title: string;
  description: string;
  bullets: readonly string[];
};

type LegalPageProps = {
  title: string;
  subtitle: string;
  updatedLabel: string;
  sections: readonly LegalSection[];
};

export function LegalPage({
  title,
  subtitle,
  updatedLabel,
  sections,
}: LegalPageProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm text-muted-foreground">{updatedLabel}</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>

      <div className="mt-12 space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="mt-2 text-muted-foreground">{section.description}</p>
            <ul className="mt-4 list-disc space-y-2 ps-5 text-sm text-muted-foreground">
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}
