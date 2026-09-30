import { describe, expect, it, vi } from 'vitest';
import { getAllPaginatedResults, PaginatedResponse, SearchParams } from '../lib/api/pagination';

interface Row {
  id: number;
}

describe('getAllPaginatedResults', () => {
  it('collects every page while preserving search parameters', async () => {
    const pages: Record<number, PaginatedResponse<Row>> = {
      1: { count: 201, next: '/items/?page=2', previous: null, results: [{ id: 1 }] },
      2: { count: 201, next: '/items/?page=3', previous: '/items/?page=1', results: [{ id: 2 }] },
      3: { count: 201, next: null, previous: '/items/?page=2', results: [{ id: 3 }] },
    };
    const fetchPage = vi.fn(async (params: SearchParams) => pages[Number(params.page)]);

    const result = await getAllPaginatedResults(fetchPage, { search: 'chair' });

    expect(result.map((row) => row.id)).toEqual([1, 2, 3]);
    expect(fetchPage).toHaveBeenNthCalledWith(1, { search: 'chair', page: 1, page_size: 100 });
    expect(fetchPage).toHaveBeenNthCalledWith(3, { search: 'chair', page: 3, page_size: 100 });
  });

  it('fetches only an explicitly requested page and caps page size at the backend maximum', async () => {
    const fetchPage = vi.fn(async () => ({
      count: 300,
      next: '/items/?page=3',
      previous: '/items/?page=1',
      results: [{ id: 2 }],
    }));

    const result = await getAllPaginatedResults(fetchPage, { page: 2, page_size: 500 });

    expect(result).toEqual([{ id: 2 }]);
    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(fetchPage).toHaveBeenCalledWith({ page: 2, page_size: 100 });
  });
});