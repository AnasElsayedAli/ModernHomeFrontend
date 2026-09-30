import { apiConfig } from './config';
import { normalizeApiError, ApiError } from './errors';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: any;
  params?: Record<string, string | number | boolean | undefined>;
  skipAuthRefresh?: boolean;
}

type AuthFailureListener = () => void;
type TokenRefreshResult = { ok: true } | { ok: false; status: number };

class ApiClient {
  private refreshPromise: Promise<TokenRefreshResult> | null = null;
  private csrfBootstrapPromise: Promise<string> | null = null;
  private authFailureListeners: Set<AuthFailureListener> = new Set();
  private activeRequests: Set<AbortController> = new Set();
  private logoutPromise: Promise<unknown> | null = null;
  private sessionVersion = 0;
  private isLoggingOut = false;
  private sessionRevocationPending = false;

  async runLogout<T>(operation: () => Promise<T>): Promise<T> {
    if (this.logoutPromise) {
      return this.logoutPromise as Promise<T>;
    }

    this.isLoggingOut = true;
    this.sessionVersion += 1;
    this.activeRequests.forEach((controller) => controller.abort());
    const pendingRefresh = this.refreshPromise;
    const logoutPromise = Promise.resolve().then(async () => {
      if (pendingRefresh) {
        await pendingRefresh.catch(() => ({ ok: false, status: 0 } as TokenRefreshResult));
      }

      try {
        const result = await operation();
        this.sessionRevocationPending = false;
        return result;
      } catch (error) {
        this.sessionRevocationPending = true;
        throw error;
      } finally {
        this.isLoggingOut = false;
        this.logoutPromise = null;
      }
    });
    this.logoutPromise = logoutPromise;
    return logoutPromise;
  }

  private readCsrfCookie(): string | null {
    if (typeof document === 'undefined') return null;
    const cookie = document.cookie
      .split(';')
      .map((entry) => entry.trim())
      .find((entry) => entry.startsWith('csrftoken='));
    return cookie ? decodeURIComponent(cookie.slice('csrftoken='.length)) : null;
  }

  
  private csrfBootstrapError(status?: number): ApiError {
    const message = status === 403
      ? 'We could not verify your sign-in. Please refresh the page and try again.'
      : status
        ? 'We could not prepare your sign-in. Please refresh the page and try again.'
        : "We couldn't connect. Check your internet connection and try again.";
    return new ApiError({ message, fieldErrors: {}, status: status || 0 });
  }

  private async getCsrfToken(forceRefresh = false): Promise<string> {
    const cookieToken = forceRefresh ? null : this.readCsrfCookie();
    if (cookieToken) return cookieToken;

    if (!this.csrfBootstrapPromise) {
      this.csrfBootstrapPromise = (async () => {
        const bootstrapUrl = `${apiConfig.getBaseUrl()}/auth/csrf/`;
        try {
          const response = await fetch(bootstrapUrl, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
            headers: { Accept: 'application/json' },
          });
          if (!response.ok) throw this.csrfBootstrapError(response.status);
          await response.arrayBuffer();
          const token = this.readCsrfCookie();
          if (!token) {
            throw new ApiError({
              message: 'We could not prepare your sign-in. Please refresh the page and try again.',
              fieldErrors: {},
              status: 0,
            });
          }
          return token;
        } catch (error) {
          if (error instanceof ApiError) throw error;
          throw this.csrfBootstrapError();
        }
      })();
    }

    try {
      return await this.csrfBootstrapPromise;
    } finally {
      this.csrfBootstrapPromise = null;
    }
  }

  private async isCsrfFailure(response: Response): Promise<boolean> {
    if (response.status !== 403) return false;

    const contentType = response.headers.get('content-type') || '';
    let body = '';
    try {
      body = contentType.includes('application/json')
        ? JSON.stringify(await response.clone().json())
        : await response.clone().text();
    } catch {
      return false;
    }

    return /csrf|cross-site request forgery/i.test(body);
  }

  onAuthFailure(listener: AuthFailureListener): () => void {
    this.authFailureListeners.add(listener);
    return () => {
      this.authFailureListeners.delete(listener);
    };
  }

  private notifyAuthFailure() {
    this.authFailureListeners.forEach((fn) => {
      try {
        fn();
      } catch {
        // Ignore listener error
      }
    });
  }

  /**
   * Executes an API request with automatic token refresh on 401 Unauthorized
   */
  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      params,
      skipAuthRefresh = false,
      ...customConfig
    } = options;

    // Normalize endpoint path with query params
    let urlPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        urlPath += (urlPath.includes('?') ? '&' : '?') + queryString;
      }
    }

    const fullUrl = `${apiConfig.getBaseUrl()}${urlPath}`;
    const isLogoutRequest = urlPath.toLowerCase().includes('/auth/logout');
    const isSessionCreation = urlPath.toLowerCase().includes('/auth/login')
      || urlPath.toLowerCase().includes('/auth/register');
    if (this.sessionRevocationPending && !isLogoutRequest && !isSessionCreation) {
      throw new ApiError({
        message: 'Your previous sign-out did not finish. Please try again before continuing.',
        fieldErrors: {},
        status: 401,
      });
    }
    if (this.logoutPromise && !isLogoutRequest && !this.isAuthEndpoint(urlPath)) {
      try {
        await this.logoutPromise;
      } catch {
        throw new ApiError({
          message: 'Sign out could not be completed. Please try again before continuing.',
          fieldErrors: {},
          status: 401,
        });
      }
    }

    const requestSessionVersion = this.sessionVersion;
    const controller = new AbortController();
    this.activeRequests.add(controller);
    const externalSignal = customConfig.signal;
    const forwardAbort = () => controller.abort(externalSignal?.reason);
    if (externalSignal) {
      if (externalSignal.aborted) {
        forwardAbort();
      } else {
        externalSignal.addEventListener('abort', forwardAbort, { once: true });
      }
    }

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(headers as Record<string, string>),
    };

    const normalizedMethod = String(method).toUpperCase();
    try {
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(normalizedMethod)) {
        const csrfToken = await this.getCsrfToken();
        if (csrfToken) requestHeaders['X-CSRFToken'] = csrfToken;
      }

      if (!isLogoutRequest && requestSessionVersion !== this.sessionVersion) {
        throw new ApiError({
          message: 'Your sign-in status changed. Please try again.',
          fieldErrors: {},
          status: 401,
        });
      }

      const fetchConfig: RequestInit = {
        method,
        headers: requestHeaders,
        ...customConfig,
        credentials: 'include', // Strictly required: Send HttpOnly access & refresh cookies
        signal: controller.signal,
      };

      if (body !== undefined && body !== null) {
        fetchConfig.body = typeof body === 'string' ? body : JSON.stringify(body);
      }

      const response = await fetch(fullUrl, fetchConfig);

      if (response.ok && isSessionCreation) {
        this.sessionRevocationPending = false;
      }

      if (!isLogoutRequest && requestSessionVersion !== this.sessionVersion) {
        throw new ApiError({
            message: 'Your sign-in status changed. Please try again.',
          fieldErrors: {},
          status: 401,
        });
      }

      if (
        ['POST', 'PUT', 'PATCH', 'DELETE'].includes(normalizedMethod)
        && await this.isCsrfFailure(response)
      ) {
        const freshCsrfToken = await this.getCsrfToken(true);
        requestHeaders['X-CSRFToken'] = freshCsrfToken;
        const csrfRetryResponse = await fetch(fullUrl, fetchConfig);
        if (await this.isCsrfFailure(csrfRetryResponse)) {
          throw new ApiError({
            message: 'We could not verify this request. Please refresh the page and try again.',
            fieldErrors: {},
            status: 403,
          });
        }
        return await this.handleResponse<T>(csrfRetryResponse);
      }

      // Handle 401 Unauthorized for access token expiration
      if (
        response.status === 401 &&
        !skipAuthRefresh &&
        !this.isAuthEndpoint(urlPath) &&
        !this.isLoggingOut
      ) {
        const refreshResult = await this.handleTokenRefresh();
        if (requestSessionVersion !== this.sessionVersion || this.isLoggingOut) {
          return await this.handleResponse<T>(response);
        }
        if (refreshResult.ok) {
          // Retry original request once
          const retryResponse = await fetch(fullUrl, fetchConfig);
          if (retryResponse.status === 401) {
            this.notifyAuthFailure();
          }
          return await this.handleResponse<T>(retryResponse);
        } else {
          if (refreshResult.status === 401 || refreshResult.status === 403) {
            this.notifyAuthFailure();
            throw new ApiError({
              message: 'Your sign-in has expired. Please sign in again.',
              fieldErrors: {},
              status: 401,
            });
          }

          const status = refreshResult.status;
          const message = status === 429
            ? normalizeApiError({ status: 429 }).message
            : status >= 500
              ? 'We are having trouble completing your request. Please try again shortly.'
              : status === 0
                ? "We couldn't connect. Check your internet connection and try again."
                : 'We could not confirm your sign-in. Please sign in again.';
          throw new ApiError({ message, fieldErrors: {}, status });
        }
      }

      return await this.handleResponse<T>(response);
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      if (controller.signal.aborted && requestSessionVersion !== this.sessionVersion) {
        throw new ApiError({
          message: 'Your sign-in status changed. Please try again.',
          fieldErrors: {},
          status: 401,
        });
      }
      throw new ApiError(normalizeApiError(err));
    } finally {
      this.activeRequests.delete(controller);
      externalSignal?.removeEventListener('abort', forwardAbort);
    }
  }

  private isAuthEndpoint(path: string): boolean {
    const clean = path.toLowerCase();
    return (
      clean.includes('/auth/refresh') ||
      clean.includes('/auth/login') ||
      clean.includes('/auth/register') ||
      clean.includes('/auth/logout')
    );
  }

  /**
   * Centralized Token Refresh Logic
   * Uses singleton promise to ensure only one refresh request runs at a time
   */
  private async handleTokenRefresh(): Promise<TokenRefreshResult> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        // Real backend: POST /auth/refresh/ with credentials: 'include'
        // Empty body! Refresh token is read from HttpOnly cookie by Django backend
        const refreshUrl = `${apiConfig.getBaseUrl()}/auth/refresh/`;
        const csrfToken = await this.getCsrfToken();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        };
        if (csrfToken) headers['X-CSRFToken'] = csrfToken;
        const res = await fetch(refreshUrl, {
          method: 'POST',
          credentials: 'include',
          headers,
        });

        return res.ok ? { ok: true } : { ok: false, status: res.status };
      } catch {
        return { ok: false, status: 0 };
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
      let rawData: any = null;
      try {
        rawData = isJson ? await response.json() : await response.text();
      } catch {
        // Could not parse response body
      }

      const normalized = normalizeApiError(rawData, response.status);
      throw new ApiError(normalized);
    }

    if (response.status === 204) {
      return null as unknown as T;
    }

    if (isJson) {
      return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
  }

  // Convenience methods
  get<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  put<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  patch<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  delete<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method'>) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
