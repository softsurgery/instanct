export interface ResponseContentPageDto {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  body: string;
  locale: string;
  unresolvedKeys?: string[];
  hasNotApplied?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
