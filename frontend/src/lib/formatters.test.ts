import { describe, expect, it } from 'vitest';
import { formatRelative, humanize } from './formatters';

describe('formatRelative', () => {
  const now = new Date('2026-01-01T12:00:00Z');

  it('returns "never" when there is no timestamp', () => {
    expect(formatRelative(null, now)).toBe('never');
  });

  it('formats seconds, minutes, hours and days', () => {
    expect(formatRelative('2026-01-01T11:59:48Z', now)).toBe('12 s ago');
    expect(formatRelative('2026-01-01T11:57:00Z', now)).toBe('3 min ago');
    expect(formatRelative('2026-01-01T10:00:00Z', now)).toBe('2 h ago');
    expect(formatRelative('2025-12-27T12:00:00Z', now)).toBe('5 d ago');
  });
});

describe('humanize', () => {
  it('turns enum names into readable text', () => {
    expect(humanize('ACCESS_POINT')).toBe('Access point');
  });
});
