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
  if (status === 401) return 'Please sign in to continue.';
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "We couldn't find what you're looking for.";
  if (status === 409) return 'This item has changed. Please review it and try again.';
  if (status === 429) return 'Too many attempts. Please wait a moment and try again.';
  if (status && status >= 500) return 'Something went wrong on our side. Please try again shortly.';
  return 'Something went wrong. Please try again.';
}

function toUserFacingMessage(message: string, status?: number): string {
  if (isHtmlDocument(message)) return 'Something went wrong. Please try again.';
  if (/failed to fetch|networkerror|err_network|network request failed|\bnetwork error\b/i.test(message)) {
    return "We couldn't connect. Check your internet connection and try again.";
  }
  if (/timed? ?out|timeout/i.test(message)) {
    return 'This is taking longer than expected. Please try again.';
  }
  if (/csrf|x-csrftoken|cross-site request forgery|cross[- ]origin|\btoken\b|\bjwt\b|\bcors\b|origin checking|trusted origin|\bcookie\b/i.test(message)) {
    return status === 401
      ? 'Your sign-in has expired. Please sign in again.'
      : 'We could not verify this request. Please refresh the page and try again.';
  }
  if (/cloudinary|upload preset|cloud name|upload folder|folder header|folder values/i.test(message)) {
    return "We couldn't upload this image. Please try again.";
  }
  if (/front[- ]?end|back[- ]?end|\bapi\b|\bhttp\b|\bhtml\b|\bjson\b|endpoint|\bproxy\b|\bserver\b|database|pagination|unauthorized|authentication|authorization|\bsession\b|stack trace|traceback|exception|keyerror|valueerror|typeerror|attributeerror|integrityerror|operationalerror|programmingerror|vercel|railway/i.test(message)) {
    return messageForStatus(status);
  }
  return message;
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
  let message = 'An unexpected error occurred. Please try again.';
  let status = fallbackStatus;

  if (!error) {
    return { message, fieldErrors, status };
  }

  // If already an ApiError instance
  if (error instanceof ApiError) {
    let normalizedMessage = error.message;
    if (isHtmlDocument(normalizedMessage)) {
      normalizedMessage = 'Something went wrong. Please try again.';
    } else if (normalizedMessage.includes('Failed to fetch') || normalizedMessage.includes('NetworkError')) {
      normalizedMessage = "We couldn't connect. Check your internet connection and try again.";
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
      message = 'This is taking longer than expected. Please try again.';
      status = 408;
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      message = "We couldn't connect. Check your internet connection and try again.";
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
    message = 'Something went wrong. Please try again.';
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
    if (status === 401 && message === 'An unexpected error occurred. Please try again.') {
      message = 'Please sign in to continue.';
    } else if (status === 403 && message === 'An unexpected error occurred. Please try again.') {
      message = 'You do not have permission to perform this action.';
    } else if (status === 404 && message === 'An unexpected error occurred. Please try again.') {
      message = "We couldn't find what you're looking for.";
    } else if (status === 409 && message === 'An unexpected error occurred. Please try again.') {
      message = 'This item has changed. Please review it and try again.';
    } else if (status === 429) {
      message = 'Too many attempts. Please wait a moment and try again.';
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
