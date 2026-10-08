import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Converts a local Egyptian number (e.g. "01080182663") or "00"-prefixed
// international number into the country-code-qualified digits wa.me requires.
export function toWhatsAppNumber(phone: string | null | undefined): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return `20${digits.slice(1)}`;
  if (digits.startsWith('20')) return digits;
  return `20${digits}`;
}

export const EGYPTIAN_PHONE_ERROR = 'أدخل رقمًا مصريًا صحيحًا من 11 رقمًا يبدأ بـ 010 أو 011 أو 012 أو 015.';

export function normalizeEgyptianPhone(value: string): string | null {
  const englishDigits = value.replace(/[٠-٩۰-۹]/g, (digit) => {
    const code = digit.charCodeAt(0);
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });

  if (!/^[0-9\s\-‐‑‒–—]+$/.test(englishDigits)) return null;

  const normalized = englishDigits.replace(/[\s\-‐‑‒–—]/g, '');
  return /^01[0125][0-9]{8}$/.test(normalized) ? normalized : null;
}
