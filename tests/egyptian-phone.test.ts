import { describe, expect, it } from 'vitest';
import { normalizeEgyptianPhone } from '../lib/utils';

describe('normalizeEgyptianPhone', () => {
  it.each([
    ['01012345678', '01012345678'],
    ['010 1234 5678', '01012345678'],
    ['011-1234-5678', '01112345678'],
    ['٠١٢ ١٢٣٤ ٥٦٧٨', '01212345678'],
    ['۰۱۵-۱۲۳۴-۵۶۷۸', '01512345678'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeEgyptianPhone(input)).toBe(expected);
  });

  it.each([
    '0101234567',
    '01312345678',
    '+201012345678',
    '010123456789',
    '٠١٢ ABC ١٢٣٤',
  ])('rejects invalid phone %s', (input) => {
    expect(normalizeEgyptianPhone(input)).toBeNull();
  });
});