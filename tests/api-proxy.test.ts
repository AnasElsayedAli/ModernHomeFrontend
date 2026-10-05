import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('API proxy', () => {
  it.each([204, 205, 304])('forwards %i without a response body', async (status) => {
    vi.stubEnv('API_PROXY_TARGET', 'http://api.test');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status })));

    const { DELETE } = await import('../app/api/[...path]/route');
    const request = new NextRequest('http://localhost/api/products/1/', {
      method: 'DELETE',
    });

    const response = await DELETE(request);

    expect(response.status).toBe(status);
    expect(response.body).toBeNull();
  });
});