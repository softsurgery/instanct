export type ContentPage = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  body: string;
  locale: string;
  unresolvedKeys?: string[];
  hasNotApplied?: boolean;
  updatedAt?: string;
};

const API_BASES = [
  process.env.API_BASE_URL,
  process.env.NEXT_PUBLIC_API_BASE_URL,
  "http://localhost:5000/api",
  "http://localhost:8080/api",
].filter((value, index, all): value is string => {
  return Boolean(value) && all.indexOf(value) === index;
});

export async function findBySlug(slug: string): Promise<ContentPage | null> {
  for (const base of API_BASES) {
    try {
      const response = await fetch(
        `${base}/content-pages/slug/${slug}`,
        { next: { revalidate: 60 } },
      );
      if (!response.ok) continue;
      return (await response.json()) as ContentPage;
    } catch {
      continue;
    }
  }
  return null;
}
