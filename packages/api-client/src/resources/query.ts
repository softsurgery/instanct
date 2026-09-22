import type { QueryParams } from "../types";

export function listParams(
  query: QueryParams = {},
  defaults: { page?: string; limit?: string; join?: string } = {},
) {
  const page = query.page ?? defaults.page ?? "1";
  const limit = query.limit ?? defaults.limit ?? "5";
  const sort = query.sort;
  const search = query.search ?? "";
  const filter = query.filter ?? "";
  const join = query.join ?? defaults.join ?? "";

  const params: { [key: string]: string | undefined } = {
    page,
    limit,
    sort,
  };

  if (search) params.search = search;
  if (filter) params.filter = filter;
  if (join) params.join = join;

  return params;
}
