import { describe, it, expect } from 'vitest';
import { DIMENSIONS, BANDS, validate, classify, score, toMarkdown } from '../docs/assets/lib/readiness.js';

const all = (v) => Object.fromEntries(DIMENSIONS.map((d) => [d.id, v]));

describe('stakeholder readiness', () => {
  it('encodes the template: five dimensions whose weights sum to 1, four bands', () => {
    expect(DIMENSIONS.map((d) => d.weight)).toEqual([0.15, 0.3, 0.2, 0.2, 0.15]);
    expect(DIMENSIONS.reduce((s, d) => s + d.weight, 0)).toBeCloseTo(1, 9);
    expect(BANDS.map((b) => b.name)).toEqual(['Champion', 'Supporter', 'Neutral', 'Skeptic']);
  });
  it('validates scores', () => {
    expect(validate(all(3))).toEqual([]);
    const bad = all(3);
    bad.desire = 0;
    bad.ability = 3.5;
    expect(validate(bad)).toEqual(['Desire: score must be an integer 1-5', 'Ability: score must be an integer 1-5']);
    expect(() => score(bad)).toThrow(/Desire/);
  });
  it('classifies on the template bands, lower bound inclusive', () => {
    expect(classify(5).name).toBe('Champion');
    expect(classify(4.0).name).toBe('Champion');
    expect(classify(3.95).name).toBe('Supporter');
    expect(classify(3.0).name).toBe('Supporter');
    expect(classify(2.0).name).toBe('Neutral');
    expect(classify(1.0).name).toBe('Skeptic');
    expect(classify(null)).toBeNull();
  });
  it('weights the overall: desire at 30% moves it most', () => {
    expect(score(all(3)).overall).toBeCloseTo(3, 9);
    const d = all(3); d.desire = 5;
    const a = all(3); a.awareness = 5;
    expect(score(d).overall).toBeCloseTo(3 + 0.3 * 2, 9);
    expect(score(a).overall).toBeCloseTo(3 + 0.15 * 2, 9);
    expect(score(d).band.name).toBe('Supporter');
    expect(score(all(4)).overall).toBe(4); // would be 3.9999999999999996 unrounded
    expect(score(all(4)).band.name).toBe('Champion');
    expect(score(all(1)).band.name).toBe('Skeptic');
  });
  it('an incomplete form has no overall and no band', () => {
    const p = all(4); p.reinforcement = null;
    const r = score(p);
    expect(r.complete).toBe(false);
    expect(r.overall).toBeNull();
    expect(r.band).toBeNull();
    expect(r.missing).toEqual(['Reinforcement']);
  });
  it('exports Markdown', () => {
    const md = toMarkdown('Records unit lead', score(all(2)));
    expect(md).toContain('# Stakeholder readiness: Records unit lead');
    expect(md).toContain('Overall weighted score: **2.00** — **Neutral**');
    expect(md).toContain('| Desire | 2 | 30% | 0.60 |');
    const p = all(2); p.desire = null;
    expect(toMarkdown('', score(p))).toContain('Incomplete — not yet scored: Desire');
    expect(toMarkdown('', score(p))).toContain('unnamed stakeholder');
    expect(toMarkdown('', score(p))).toContain('| Desire | — | 30% | — |');
  });
});
