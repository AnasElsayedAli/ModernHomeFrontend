import { describe, expect, it } from 'vitest';
import { ApiError, normalizeApiError } from '../lib/api/errors';

describe('normalizeApiError', () => {
  it('does not show raw HTML response bodies in error messages', () => {
    const normalized = normalizeApiError('<!DOCTYPE html><html><body>CSRF failed</body></html>', 403);

    expect(normalized.message).toBe('ليس لديك صلاحية لتنفيذ هذا الإجراء.');
    expect(normalized.raw).toContain('<!DOCTYPE html>');
  });

  it('does not show HTML embedded in a JSON detail field', () => {
    const normalized = normalizeApiError({
      detail: '<!DOCTYPE html><html><body>CSRF verification failed</body></html>',
    }, 403);

    expect(normalized.message).toBe('ليس لديك صلاحية لتنفيذ هذا الإجراء.');
    expect(normalized.message).not.toContain('<html>');
  });

  it('keeps Arabic plain text response messages', () => {
    expect(normalizeApiError('العنصر المحدد غير متاح.', 409).message)
      .toBe('العنصر المحدد غير متاح.');
  });

  it('replaces unknown English response messages with an Arabic status message', () => {
    expect(normalizeApiError('The selected item is unavailable.', 409).message)
      .toBe('تغير هذا العنصر. راجعه ثم حاول مرة أخرى.');
  });

  it('normalizes network errors already wrapped in ApiError', () => {
    const error = new ApiError({ message: 'Failed to fetch', fieldErrors: {}, status: 0 });

    expect(normalizeApiError(error).message)
      .toBe('تعذر الاتصال. تحقق من اتصال الإنترنت ثم حاول مرة أخرى.');
  });

  it('replaces technical security error details with plain language', () => {
    const normalized = normalizeApiError({
      detail: 'CSRF token rejected by backend proxy.',
    }, 403);

    expect(normalized.message)
      .toBe('تعذر التحقق من الطلب. حدّث الصفحة ثم حاول مرة أخرى.');
    expect(normalized.message).not.toMatch(/[A-Za-z]/);
  });

  it('does not expose internal details for server errors', () => {
    const normalized = normalizeApiError({
      detail: 'OperationalError: database connection failed at internal endpoint.',
    }, 500);

    expect(normalized.message).toBe('حدث خطأ من جانبنا. حاول مرة أخرى بعد قليل.');
    expect(normalized.message).not.toMatch(/[A-Za-z]/);
  });

  it('replaces image upload configuration errors with plain language', () => {
    const normalized = normalizeApiError({ message: 'The upload folder header is required.' }, 400);

    expect(normalized.message).toBe('تعذر رفع الصورة. حاول مرة أخرى.');
    expect(normalized.message).not.toMatch(/[A-Za-z]/);
  });
});