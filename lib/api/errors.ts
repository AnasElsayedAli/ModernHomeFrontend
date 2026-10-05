/**
 * Reusable Error Normalization Mechanism
 *
 * Normalizes Django REST Framework errors into a consistent, user-friendly format:
 * - Field-level validation errors: { field: ["error message"] }
 * - Non-field errors: { non_field_errors: ["error message"] }
 * - Detail errors: { detail: "message" }
 * - Message errors: { message: "message" }
 * - Plain string errors: "error message"
 * - Network failures, timeouts, and HTTP status codes
 */

export interface NormalizedError {
  message: string;
  fieldErrors: Record<string, string[]>;
  status?: number;
  raw?: unknown;
}

export class ApiError extends Error {
  public status?: number;
  public fieldErrors: Record<string, string[]>;
  public raw?: unknown;

  constructor(normalized: NormalizedError) {
    super(normalized.message);
    this.name = 'ApiError';
    this.status = normalized.status;
    this.fieldErrors = normalized.fieldErrors;
    this.raw = normalized.raw;
  }
}

function isHtmlDocument(value: string): boolean {
  return /^\s*(?:<!doctype\s+html|<html\b|<head\b|<body\b|<\?xml)/i.test(value);
}

function messageForStatus(status?: number): string {
  if (status === 401) return 'سجّل الدخول للمتابعة.';
  if (status === 403) return 'ليس لديك صلاحية لتنفيذ هذا الإجراء.';
  if (status === 404) return 'لم نعثر على ما تبحث عنه.';
  if (status === 409) return 'تغير هذا العنصر. راجعه ثم حاول مرة أخرى.';
  if (status === 429) return 'عدد المحاولات كبير. انتظر قليلًا ثم حاول مرة أخرى.';
  if (status && status >= 500) return 'حدث خطأ من جانبنا. حاول مرة أخرى بعد قليل.';
  return 'حدث خطأ غير متوقع. حاول مرة أخرى.';
}

function toUserFacingMessage(message: string, status?: number): string {
  if (isHtmlDocument(message)) return messageForStatus(status);
  if (/failed to fetch|networkerror|err_network|network request failed|\bnetwork error\b/i.test(message)) {
    return 'تعذر الاتصال. تحقق من اتصال الإنترنت ثم حاول مرة أخرى.';
  }
  if (/timed? ?out|timeout/i.test(message)) {
    return 'استغرق الطلب وقتًا أطول من المتوقع. حاول مرة أخرى.';
  }
  if (/csrf|x-csrftoken|cross-site request forgery|cross[- ]origin|\btoken\b|\bjwt\b|\bcors\b|origin checking|trusted origin|\bcookie\b/i.test(message)) {
    return status === 401
      ? 'انتهت صلاحية تسجيل الدخول. سجّل الدخول مرة أخرى.'
      : 'تعذر التحقق من الطلب. حدّث الصفحة ثم حاول مرة أخرى.';
  }
  if (/cloudinary|upload preset|cloud name|upload folder|folder header|folder values/i.test(message)) {
    return 'تعذر رفع الصورة. حاول مرة أخرى.';
  }
  if (/front[- ]?end|back[- ]?end|\bapi\b|\bhttp\b|\bhtml\b|\bjson\b|endpoint|\bproxy\b|\bserver\b|database|pagination|unauthorized|authentication|authorization|\bsession\b|stack trace|traceback|exception|keyerror|valueerror|typeerror|attributeerror|integrityerror|operationalerror|programmingerror|vercel|railway/i.test(message)) {
    return messageForStatus(status);
  }
  return /[A-Za-z]/.test(message) ? messageForStatus(status) : message;
}

function toUserFacingFieldErrors(
  fieldErrors: Record<string, string[]>,
  status?: number
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([field, messages]) => {
      const safeField = /front[- ]?end|back[- ]?end|csrf|token|api|http|proxy|endpoint|session/i.test(field)
        ? 'general'
        : field;
      return [safeField, messages.map((message) => toUserFacingMessage(message, status))];
    })
  );
}

/**
 * Normalizes any error response or exception into a user-friendly NormalizedError
 */
export function normalizeApiError(error: unknown, fallbackStatus?: number): NormalizedError {
  const fieldErrors: Record<string, string[]> = {};
  let message = 'حدث خطأ غير متوقع. حاول مرة أخرى.';
  let status = fallbackStatus;

  if (!error) {
    return { message, fieldErrors, status };
  }

  // If already an ApiError instance
  if (error instanceof ApiError) {
    let normalizedMessage = error.message;
    if (isHtmlDocument(normalizedMessage)) {
      normalizedMessage = messageForStatus(error.status);
    } else if (normalizedMessage.includes('Failed to fetch') || normalizedMessage.includes('NetworkError')) {
      normalizedMessage = 'تعذر الاتصال. تحقق من اتصال الإنترنت ثم حاول مرة أخرى.';
    }
    return {
      message: toUserFacingMessage(normalizedMessage, error.status),
      fieldErrors: toUserFacingFieldErrors(error.fieldErrors, error.status),
      status: error.status,
      raw: error.raw,
    };
  }

  // If it's a standard JS Error
  if (error instanceof Error) {
    message = error.message;
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      message = 'استغرق الطلب وقتًا أطول من المتوقع. حاول مرة أخرى.';
      status = 408;
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      message = 'تعذر الاتصال. تحقق من اتصال الإنترنت ثم حاول مرة أخرى.';
      status = 0;
    }
  }

  // If error is a plain string
  if (typeof error === 'string') {
    const text = error.trim();
    if (!isHtmlDocument(text)) {
      return {
        message: toUserFacingMessage(text, status),
        fieldErrors,
        status,
        raw: error,
      };
    }
  }

  if (isHtmlDocument(message)) {
    message = messageForStatus(status);
  }

  // If error is an object (e.g. parsed JSON response from DRF)
  if (typeof error === 'object' && error !== null) {
    const errObj = error as Record<string, any>;

    if (errObj.status && typeof errObj.status === 'number') {
      status = errObj.status;
    }

    // 1. DRF { "detail": "..." }
    if (typeof errObj.detail === 'string') {
      message = errObj.detail;
    } else if (Array.isArray(errObj.detail) && errObj.detail.length > 0) {
      message = String(errObj.detail[0]);
    }

    // 2. { "message": "..." }
    if (typeof errObj.message === 'string') {
      message = errObj.message;
    }

    // 3. DRF { "non_field_errors": ["..."] }
    if (Array.isArray(errObj.non_field_errors) && errObj.non_field_errors.length > 0) {
      message = String(errObj.non_field_errors[0]);
      fieldErrors['non_field_errors'] = errObj.non_field_errors.map(String);
    }

    // 4. Field-level validation errors { "email": ["..."], "password": ["..."] }
    let hasFieldErrors = false;
    for (const [key, value] of Object.entries(errObj)) {
      if (['detail', 'message', 'status', 'statusCode'].includes(key)) {
        continue;
      }

      if (Array.isArray(value)) {
        const errorStrings = value.map((v) => (typeof v === 'string' ? v : JSON.stringify(v)));
        fieldErrors[key] = errorStrings;
        hasFieldErrors = true;
        // If message is still default, pick first field error for context
        if (message === 'An unexpected error occurred. Please try again.') {
          message = `${formatFieldName(key)}: ${errorStrings[0]}`;
        }
      } else if (typeof value === 'string' && key !== 'message' && key !== 'detail') {
        fieldErrors[key] = [value];
        hasFieldErrors = true;
        if (message === 'An unexpected error occurred. Please try again.') {
          message = `${formatFieldName(key)}: ${value}`;
        }
      }
    }
  }

  if (isHtmlDocument(message)) {
    message = 'Something went wrong. Please try again.';
  }

  // HTTP Status-specific overrides if message is still too generic
  if (status) {
    if (status === 401 && message === 'حدث خطأ غير متوقع. حاول مرة أخرى.') {
      message = messageForStatus(401);
    } else if (status === 403 && message === 'حدث خطأ غير متوقع. حاول مرة أخرى.') {
      message = messageForStatus(403);
    } else if (status === 404 && message === 'حدث خطأ غير متوقع. حاول مرة أخرى.') {
      message = messageForStatus(404);
    } else if (status === 409 && message === 'حدث خطأ غير متوقع. حاول مرة أخرى.') {
      message = messageForStatus(409);
    } else if (status === 429) {
      message = messageForStatus(429);
    }
  }

  if (status && status >= 500) {
    message = messageForStatus(status);
  }

  return {
    message: toUserFacingMessage(message, status),
    fieldErrors: toUserFacingFieldErrors(fieldErrors, status),
    status,
    raw: error,
  };
}

function formatFieldName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
