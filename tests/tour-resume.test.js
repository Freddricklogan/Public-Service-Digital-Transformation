import { describe, expect, it } from 'vitest';
import { RESUME_KEY, RESUME_WINDOW_MS, clearResume, saveResume, sessionStore, takeResume } from '../docs/assets/shell/tour-resume.js';

function memory() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), m };
}
const broken = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };

describe('tour resume', () => {
  it('resumes a step saved moments ago, once', () => {
    const s = memory();
    saveResume(s, 1, 1000);
    expect(takeResume(s, 2, 1500)).toBe(1);
    expect(takeResume(s, 2, 1600)).toBeNull();
  });
  it('ignores a stale record and clears it', () => {
    const s = memory();
    saveResume(s, 1, 0);
    expect(takeResume(s, 2, RESUME_WINDOW_MS + 1)).toBeNull();
    expect(s.m.has(RESUME_KEY)).toBe(false);
  });
  it('rejects an index outside the tour', () => {
    const s = memory();
    saveResume(s, 5, 0);
    expect(takeResume(s, 2, 10)).toBeNull();
    saveResume(s, -1, 0);
    expect(takeResume(s, 2, 10)).toBeNull();
  });
  it('rejects malformed records and clock skew', () => {
    const s = memory();
    s.setItem(RESUME_KEY, 'not json');
    expect(takeResume(s, 2, 0)).toBeNull();
    s.setItem(RESUME_KEY, JSON.stringify({ index: 1 }));
    expect(takeResume(s, 2, 0)).toBeNull();
    saveResume(s, 1, 5000);
    expect(takeResume(s, 2, 4000)).toBeNull();
  });
  it('clearResume removes the record', () => {
    const s = memory();
    saveResume(s, 0, 0);
    clearResume(s);
    expect(takeResume(s, 2, 1)).toBeNull();
  });
  it('never throws when storage is blocked or missing', () => {
    expect(() => saveResume(broken, 1)).not.toThrow();
    expect(() => clearResume(broken)).not.toThrow();
    expect(takeResume(broken, 2)).toBeNull();
    expect(takeResume(null, 2)).toBeNull();
  });
  it('sessionStore returns null outside a browser', () => {
    expect(sessionStore()).toBeNull();
  });
});
