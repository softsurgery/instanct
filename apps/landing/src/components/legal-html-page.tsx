import { prepareLegalHtml } from "@instanct/lib";
import "@instanct/lib/legal-html.css";
import type { ContentPage } from "@/lib/content";


type LegalHtmlPageProps = {
  page: ContentPage;
};

function formatUpdatedAt(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function LegalHtmlPage({ page }: LegalHtmlPageProps) {
  const updated = formatUpdatedAt(page.updatedAt);
  const showNotice =
    page.hasNotApplied || (page.unresolvedKeys?.length ?? 0) > 0;
  const htmlContent = prepareLegalHtml(page.body || "");

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      {updated ? (
        <p className="text-sm text-muted-foreground">Mis à jour le {updated}</p>
      ) : null}
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">{page.title}</h1>
      {page.subtitle ? (
        <p className="mt-4 text-lg text-muted-foreground">{page.subtitle}</p>
      ) : null}

      {showNotice ? (
        <aside className="mt-8 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-950 dark:text-amber-100">
          Les passages surlignés en ambre ne sont pas encore appliqués ou restent
          à confirmer (identité de la société, hébergeur, prestataire de carte,
          ou fonctionnalités non ouvertes).
        </aside>
      ) : null}

      <div
        className="legal-html mt-10"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </article>
  );
}

export function LegalUnavailable({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
    </article>
  );
}
