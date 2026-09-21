import { describe, it, expect } from 'vitest';
import { DIMENSIONS, LEVELS, validate, analyse, toMarkdown } from '../docs/assets/lib/maturity.js';

const all = (current, target) => Object.fromEntries(DIMENSIONS.map((d) => [d.id, { current, target }]));

describe('maturity gap analysis', () => {
  it('encodes the model: seven dimensions, five named levels', () => {
    expect(DIMENSIONS.map((d) => d.name)).toEqual(['Service Delivery', 'Technology Infrastructure', 'Data and Analytics', 'Workforce and Culture', 'Governance and Strategy', 'Security and Privacy', 'Interoperability']);
    expect(Object.keys(LEVELS)).toHaveLength(5);
    expect(LEVELS[1]).toBe('Initial (Ad Hoc)');
    expect(LEVELS[5]).toBe('Optimizing (Innovative)');
  });
  it('validates levels and shape', () => {
    expect(validate(all(2, 3))).toEqual([]);
    const bad = all(2, 3);
    bad.data = { current: 6, target: 2.5 };
    delete bad.security;
    expect(validate(bad)).toEqual(['Data and Analytics: current must be a level 1-5', 'Data and Analytics: target must be a level 1-5', 'Security and Privacy: missing']);
    expect(() => analyse(bad)).toThrow(/Security and Privacy: missing/);
  });
  it('computes means, the weakest dimension and ranked gaps (largest first, ties in model order)', () => {
    const r = all(3, 4);
    r.security = { current: 1, target: 4 };
    r.interoperability = { current: 2, target: 4 };
    r.service = { current: 3, target: 5 };
    const a = analyse(r);
    expect(a.complete).toBe(true);
    expect(a.currentMean).toBeCloseTo((3 + 3 + 3 + 3 + 3 + 1 + 2) / 7, 9);
    expect(a.targetMean).toBeCloseTo((5 + 4 + 4 + 4 + 4 + 4 + 4) / 7, 9);
    expect(a.weakest.name).toBe('Security and Privacy');
    expect(a.gaps.map((d) => `${d.name}:${d.gap}`)).toEqual(['Security and Privacy:3', 'Service Delivery:2', 'Interoperability:2', 'Technology Infrastructure:1', 'Data and Analytics:1', 'Workforce and Culture:1', 'Governance and Strategy:1']);
    expect(a.regressions).toEqual([]);
  });
  it('handles partial ratings and flags a target below current', () => {
    const r = all(null, null);
    r.service = { current: 4, target: 2 };
    r.data = { current: 2, target: null };
    const a = analyse(r);
    expect(a.complete).toBe(false);
    expect(a.ratedCount).toBe(2);
    expect(a.targetedCount).toBe(1);
    expect(a.currentMean).toBe(3);
    expect(a.targetMean).toBe(2);
    expect(a.gaps).toEqual([]);
    expect(a.regressions.map((d) => d.name)).toEqual(['Service Delivery']);
    expect(a.weakest.name).toBe('Data and Analytics');
    expect(analyse(all(null, null)).weakest).toBeNull();
    expect(analyse(all(null, null)).currentMean).toBeNull();
  });
  it('a gap of zero is neither a gap nor a regression', () => {
    const a = analyse(all(3, 3));
    expect(a.gaps).toEqual([]);
    expect(a.regressions).toEqual([]);
    expect(a.dimensions.every((d) => d.gap === 0)).toBe(true);
  });
  it('exports Markdown with means, the table and the ranked list', () => {
    const r = all(2, 3);
    r.governance = { current: 1, target: 4 };
    r.security = { current: 3, target: 2 };
    const md = toMarkdown('City of Example', analyse(r));
    expect(md).toContain('# Digital maturity gap analysis: City of Example');
    expect(md).toContain('7/7 dimensions rated');
    expect(md).toContain('Lowest current dimension: Governance and Strategy (Level 1, Initial (Ad Hoc))');
    expect(md).toContain('| Governance and Strategy | 1 | 4 | +3 |');
    expect(md).toContain('| Security and Privacy | 3 | 2 | -1 |');
    expect(md).toContain('1. Governance and Strategy: Level 1 → 4 (3 levels)');
    expect(md).toContain('2. Service Delivery: Level 2 → 3 (1 level)');
    expect(md).toContain('- Security and Privacy: Level 3 → 2');
    const empty = toMarkdown('', analyse(all(null, null)));
    expect(empty).toContain('unnamed organization');
    expect(empty).toContain('Current mean level: — · Target mean level: — · 0/7');
  });
});
