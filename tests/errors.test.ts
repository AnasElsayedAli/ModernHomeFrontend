import { describe, expect, it } from 'vitest';
import { ApiError, normalizeApiError } from '../lib/api/errors';

describe('normalizeApiError', () => {
  it('does not show raw HTML response bodies in error messages', () => {
    const normalized = normalizeApiError('<!DOCTYPE html><html><body>CSRF failed</body></html>', 403);

    expect(normalized.message).toBe('You do not have permission to perform this action.');
    expect(normalized.raw).toContain('<!DOCTYPE html>');
  });

  it('does not show HTML embedded in a JSON detail field', () => {
    const normalized = normalizeApiError({
      detail: '<!DOCTYPE html><html><body>CSRF verification failed</body></html>',
    }, 403);

    expect(normalized.message).toBe('Something went wrong. Please try again.');
    expect(normalized.message).not.toContain('<html>');
  });

  it('keeps plain text response messages', () => {
    expect(normalizeApiError('The selected item is unavailable.', 409).message)
      .toBe('The selected item is unavailable.');
  });

  it('normalizes network errors already wrapped in ApiError', () => {
    const error = new ApiError({ message: 'Failed to fetch', fieldErrors: {}, status: 0 });

    expect(normalizeApiError(error).message)
      .toBe("We couldn't connect. Check your internet connection and try again.");
  });

  it('replaces technical security error details with plain language', () => {
    const normalized = normalizeApiError({
      detail: 'CSRF token rejected by backend proxy.',
    }, 403);

    expect(normalized.message)
      .toBe('We could not verify this request. Please refresh the page and try again.');
    expect(normalized.message).not.toMatch(/csrf|token|backend|proxy/i);
  });

  it('does not expose internal details for server errors', () => {
    const normalized = normalizeApiError({
      detail: 'OperationalError: database connection failed at internal endpoint.',
    }, 500);

    expect(normalized.message).toBe('Something went wrong on our side. Please try again shortly.');
    expect(normalized.message).not.toMatch(/database|endpoint|OperationalError/i);
  });

  it('replaces image upload configuration errors with plain language', () => {
    const normalized = normalizeApiError({ message: 'The upload folder header is required.' }, 400);

    expect(normalized.message).toBe("We couldn't upload this image. Please try again.");
    expect(normalized.message).not.toMatch(/folder|header/i);
  });
});