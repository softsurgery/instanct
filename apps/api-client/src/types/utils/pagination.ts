export interface QueryParams {
  page?: string;
  limit?: string;
  sort?: string;
  search?: string;
  filter?: string;
  join?: string;
  select?: string;
  cache?: string;
}

export interface PageMeta {
  page: number;
  take: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}
