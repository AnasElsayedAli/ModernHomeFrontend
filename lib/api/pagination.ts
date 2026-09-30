/**
 * Shared shape for Django REST Framework's PageNumberPagination responses.
 * Every list endpoint on the backend returns this envelope; service methods
 * unwrap `.results` so existing call sites can keep working with plain arrays.
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Common query params accepted by search-enabled list endpoints. */
export interface SearchParams extends Record<string, string | number | boolean | undefined> {
  search?: string;
  page?: number;
  page_size?: number;
}

export async function getAllPaginatedResults<T>(
  fetchPage: (params: SearchParams) => Promise<PaginatedResponse<T>>,
  params: SearchParams = {}
): Promise<T[]> {
  const pageSize = Math.max(1, Math.min(params.page_size ?? 100, 100));
  if (params.page !== undefined) {
    const response = await fetchPage({ ...params, page_size: pageSize });
    return response.results;
  }

  const results: T[] = [];
  let page = 1;
  let expectedPageCount = 1;
  let hasNext = true;

  while (hasNext || page < expectedPageCount) {
    const response = await fetchPage({ ...params, page, page_size: pageSize });
    if (!Array.isArray(response.results)) {
      throw new Error("We couldn't load this list. Please try again.");
    }
    results.push(...response.results);
    expectedPageCount = Math.ceil(response.count / pageSize);
    hasNext = Boolean(response.next);

    if (page > 10000) {
      throw new Error("We couldn't load this list. Please try again.");
    }
    page += 1;
  }

  return results;
}
