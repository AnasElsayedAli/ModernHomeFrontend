import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../lib/api/client';
import { ApiError } from '../lib/api/errors';

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('ApiClient session concurrency', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('does not send login when CSRF bootstrap fails and returns a safe message', async () => {
    vi.stubGlobal('document', { cookie: '' });
    const fetchMock = vi.fn(async (_input: RequestInfo | URL) => new Response(
      '<!DOCTYPE html><html><body>CSRF verification failed</body></html>',
      { status: 403, headers: { 'content-type': 'text/html' } }
    ));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiClient.post('/auth/login/', {
      email: 'person@example.test',
      password: 'test',
    }, { skipAuthRefresh: true })).rejects.toMatchObject({
      status: 403,
      message: expect.stringContaining('could not verify your sign-in'),
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain('/auth/csrf/');
  });

  it('refreshes a rejected stale CSRF token once and retries the mutation once', async () => {
    let csrfCookie = 'csrftoken=old-token';
    vi.stubGlobal('document', { get cookie() { return csrfCookie; } });
    const submittedTokens: string[] = [];
    let csrfBootstrapCalls = 0;
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/auth/csrf/')) {
        csrfBootstrapCalls += 1;
        csrfCookie = 'csrftoken=fresh-token';
        return jsonResponse({ detail: 'CSRF cookie set.' });
      }
      if (url.endsWith('/auth/login/')) {
        const headers = init?.headers as Record<string, string>;
        submittedTokens.push(headers['X-CSRFToken']);
        if (submittedTokens.length === 1) {
          return jsonResponse({ detail: 'CSRF Failed: token has incorrect value.' }, 403);
        }
        return jsonResponse({ user: { id: 1 } });
      }
      throw new Error(`Unexpected request: ${url}`);
    }));

    await expect(apiClient.post('/auth/login/', {
      email: 'person@example.test',
      password: 'test',
    }, { skipAuthRefresh: true })).resolves.toEqual({ user: { id: 1 } });

    expect(csrfBootstrapCalls).toBe(1);
    expect(submittedTokens).toEqual(['old-token', 'fresh-token']);
  });

  it('shares one refresh request across simultaneous 401 responses', async () => {
    vi.stubGlobal('document', { cookie: 'csrftoken=test-token' });
    let resourceRequests = 0;
    let refreshRequests = 0;

    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/auth/refresh/')) {
        refreshRequests += 1;
        return new Response(null, { status: 204 });
      }
      if (url.endsWith('/resource')) {
        resourceRequests += 1;
        return resourceRequests <= 2
          ? jsonResponse({ detail: 'expired' }, 401)
          : jsonResponse({ ok: true });
      }
      throw new Error(`Unexpected request: ${url}`);
    }));

    const [first, second] = await Promise.all([
      apiClient.get<{ ok: boolean }>('/resource'),
      apiClient.get<{ ok: boolean }>('/resource'),
    ]);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(refreshRequests).toBe(1);
    expect(resourceRequests).toBe(4);
  });

  it('treats a CSRF 403 from token refresh as one failed refresh, not a thrown transport error', async () => {
    vi.stubGlobal('document', { cookie: 'csrftoken=test-token' });
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/auth/refresh/')) {
        return new Response('<html><body>CSRF verification failed</body></html>', {
          status: 403,
          headers: { 'content-type': 'text/html' },
        });
      }
      if (url.endsWith('/resource')) return jsonResponse({ detail: 'expired' }, 401);
      throw new Error(`Unexpected request: ${url}`);
    }));
    const authFailure = vi.fn();
    const unsubscribe = apiClient.onAuthFailure(authFailure);

    await expect(apiClient.get('/resource')).rejects.toMatchObject({
      status: 401,
      message: 'Your sign-in has expired. Please sign in again.',
    });

    unsubscribe();
    expect(authFailure).toHaveBeenCalledOnce();
  });

  it('surfaces refresh throttling without clearing the authenticated session', async () => {
    vi.stubGlobal('document', { cookie: 'csrftoken=test-token' });
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/auth/refresh/')) {
        return jsonResponse({ detail: 'throttled' }, 429);
      }
      if (url.endsWith('/resource')) return jsonResponse({ detail: 'expired' }, 401);
      throw new Error(`Unexpected request: ${url}`);
    }));
    const authFailure = vi.fn();
    const unsubscribe = apiClient.onAuthFailure(authFailure);

    await expect(apiClient.get('/resource')).rejects.toMatchObject({
      status: 429,
      message: 'Too many attempts. Please wait a moment and try again.',
    });

    unsubscribe();
    expect(authFailure).not.toHaveBeenCalled();
  });

  it('aborts active requests before completing logout', async () => {
    let requestSignal: AbortSignal | undefined;
    vi.stubGlobal('fetch', vi.fn((_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        requestSignal = init?.signal ?? undefined;
        requestSignal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
      })
    ));

    const pendingRequest = apiClient.get('/slow').then(
      () => null,
      (error: unknown) => error
    );
    const logout = apiClient.runLogout(async () => 'logged out');

    const requestError = await pendingRequest;
    await expect(logout).resolves.toBe('logged out');
    expect(requestSignal?.aborted).toBe(true);
    expect(requestError).toBeInstanceOf(ApiError);
    expect((requestError as ApiError).status).toBe(401);
  });

  it('does not send queued requests with stale cookies if logout fails', async () => {
    let rejectLogout: ((error: Error) => void) | undefined;
    const logout = apiClient.runLogout(() => new Promise<string>((_resolve, reject) => {
      rejectLogout = reject;
    }));
    await Promise.resolve();

    const backendFetch = vi.fn();
    vi.stubGlobal('fetch', backendFetch);
    const queuedRequest = apiClient.get('/protected').then(
      () => null,
      (error: unknown) => error
    );

    rejectLogout?.(new Error('backend logout unavailable'));
    const requestError = await queuedRequest;
    await expect(logout).rejects.toThrow('backend logout unavailable');

    expect(backendFetch).not.toHaveBeenCalled();
    expect(requestError).toBeInstanceOf(ApiError);
    expect((requestError as ApiError).status).toBe(401);
  });

  it('blocks protected requests after logout failure until a new login succeeds', async () => {
    vi.stubGlobal('document', { cookie: 'csrftoken=test-token' });
    await expect(apiClient.runLogout(async () => {
      throw new Error('logout unavailable');
    })).rejects.toThrow('logout unavailable');

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      return url.endsWith('/auth/login/')
        ? jsonResponse({ user: { id: 1 } })
        : jsonResponse({ ok: true });
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiClient.get('/protected')).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).not.toHaveBeenCalled();

    await apiClient.post('/auth/login/', { email: 'person@example.test', password: 'test' }, { skipAuthRefresh: true });
    await expect(apiClient.get<{ ok: boolean }>('/protected')).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});