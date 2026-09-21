/** Digital Maturity Model gap analysis — the seven dimensions, the five levels and the
 * assessment steps are those in docs/digital-maturity-model.md (Steps 1 and 4). The model
 * does not rank gaps for you; this module orders them by size, then by dimension order,
 * and says so on the page. */

export const DIMENSIONS = [
  { id: 'service', name: 'Service Delivery' },
  { id: 'technology', name: 'Technology Infrastructure' },
  { id: 'data', name: 'Data and Analytics' },
  { id: 'workforce', name: 'Workforce and Culture' },
  { id: 'governance', name: 'Governance and Strategy' },
  { id: 'security', name: 'Security and Privacy' },
  { id: 'interoperability', name: 'Interoperability' }
];
export const LEVELS = { 1: 'Initial (Ad Hoc)', 2: 'Developing (Emerging)', 3: 'Defined (Standardized)', 4: 'Managed (Measured)', 5: 'Optimizing (Innovative)' };

const isLevel = (v) => Number.isInteger(v) && v >= 1 && v <= 5;

/** ratings: { [dimensionId]: { current: 1-5|null, target: 1-5|null } } */
export function validate(ratings) {
  const problems = [];
  for (const d of DIMENSIONS) {
    const r = ratings?.[d.id];
    if (!r || typeof r !== 'object') { problems.push(`${d.name}: missing`); continue; }
    for (const k of ['current', 'target']) {
      const v = r[k] ?? null;
      if (v !== null && !isLevel(v)) problems.push(`${d.name}: ${k} must be a level 1-5`);
    }
  }
  return problems;
}

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export function analyse(ratings) {
  const problems = validate(ratings);
  if (problems.length) throw new Error(problems.join('; '));
  const dimensions = DIMENSIONS.map((d) => {
    const current = ratings[d.id].current ?? null;
    const target = ratings[d.id].target ?? null;
    const gap = current !== null && target !== null ? target - current : null;
    return { id: d.id, name: d.name, current, target, gap, currentLevel: current === null ? null : LEVELS[current], targetLevel: target === null ? null : LEVELS[target] };
  });
  const rated = dimensions.filter((d) => d.current !== null);
  const targeted = dimensions.filter((d) => d.gap !== null);
  const currentMean = mean(rated.map((d) => d.current));
  const targetMean = mean(targeted.map((d) => d.target));
  const weakest = rated.length ? rated.reduce((a, b) => (b.current < a.current ? b : a)) : null;
  // Ranked gaps: largest first; ties keep the model's dimension order.
  const gaps = targeted.filter((d) => d.gap > 0).sort((a, b) => b.gap - a.gap);
  const regressions = targeted.filter((d) => d.gap < 0);
  const complete = rated.length === DIMENSIONS.length && targeted.length === DIMENSIONS.length;
  return { dimensions, currentMean, targetMean, weakest, gaps, regressions, complete, ratedCount: rated.length, targetedCount: targeted.length };
}

export function toMarkdown(org, result) {
  const f = (v) => (v === null ? '—' : v.toFixed(2));
  const lines = [`# Digital maturity gap analysis: ${org || 'unnamed organization'}`, '', `Current mean level: ${f(result.currentMean)} · Target mean level: ${f(result.targetMean)} · ${result.ratedCount}/${DIMENSIONS.length} dimensions rated`, ''];
  if (result.weakest) lines.push(`Lowest current dimension: ${result.weakest.name} (Level ${result.weakest.current}, ${result.weakest.currentLevel})`, '');
  lines.push('| Dimension | Current | Target | Gap |', '|---|---|---|---|');
  for (const d of result.dimensions) lines.push(`| ${d.name} | ${d.current ?? '—'} | ${d.target ?? '—'} | ${d.gap === null ? '—' : d.gap > 0 ? `+${d.gap}` : String(d.gap)} |`);
  if (result.gaps.length) lines.push('', 'Gaps to close, largest first:', ...result.gaps.map((d, i) => `${i + 1}. ${d.name}: Level ${d.current} → ${d.target} (${d.gap} level${d.gap === 1 ? '' : 's'})`));
  if (result.regressions.length) lines.push('', 'Target below current (check the rating):', ...result.regressions.map((d) => `- ${d.name}: Level ${d.current} → ${d.target}`));
  return lines.join('\n') + '\n';
}
