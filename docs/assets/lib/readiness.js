/** Stakeholder readiness score — the five dimensions, their weights and the four
 * classification bands are those in docs/stakeholder-assessment.md Section 4. */

export const DIMENSIONS = [
  { id: 'awareness', name: 'Awareness', weight: 0.15 },
  { id: 'desire', name: 'Desire', weight: 0.3 },
  { id: 'knowledge', name: 'Knowledge', weight: 0.2 },
  { id: 'ability', name: 'Ability', weight: 0.2 },
  { id: 'reinforcement', name: 'Reinforcement', weight: 0.15 }
];
/** Bands from the template: lower bound inclusive. */
export const BANDS = [
  { min: 4.0, name: 'Champion', note: 'Actively supports and promotes the change' },
  { min: 3.0, name: 'Supporter', note: 'Generally positive, may need minor support' },
  { min: 2.0, name: 'Neutral', note: 'Neither supporting nor resisting, needs engagement' },
  { min: 1.0, name: 'Skeptic', note: 'Has concerns that must be addressed; at risk of resistance' }
];

const isScore = (v) => Number.isInteger(v) && v >= 1 && v <= 5;

/** scores: { [dimensionId]: 1-5|null } */
export function validate(scores) {
  const problems = [];
  for (const d of DIMENSIONS) {
    const v = scores?.[d.id] ?? null;
    if (v !== null && !isScore(v)) problems.push(`${d.name}: score must be an integer 1-5`);
  }
  return problems;
}

export function classify(score) {
  if (score === null) return null;
  return BANDS.find((b) => score >= b.min) ?? null;
}

export function score(scores) {
  const problems = validate(scores);
  if (problems.length) throw new Error(problems.join('; '));
  const rows = DIMENSIONS.map((d) => { const v = scores[d.id] ?? null; return { ...d, score: v, weighted: v === null ? null : v * d.weight }; });
  const complete = rows.every((r) => r.score !== null);
  // The template's overall is a weighted sum over all five; it is only defined when all five are scored.
  // Rounded to two decimals before classification so that, e.g., five 4s (0.15+0.3+0.2+0.2+0.15 in binary
  // floating point) land on 4.00 and in the Champion band the template puts them in.
  const overall = complete ? Math.round(rows.reduce((s, r) => s + r.weighted, 0) * 100) / 100 : null;
  const band = classify(overall);
  return { rows, complete, overall, band, missing: rows.filter((r) => r.score === null).map((r) => r.name) };
}

export function toMarkdown(stakeholder, result) {
  const lines = [`# Stakeholder readiness: ${stakeholder || 'unnamed stakeholder'}`, '', result.complete ? `Overall weighted score: **${result.overall.toFixed(2)}** — **${result.band.name}** (${result.band.note})` : `Incomplete — not yet scored: ${result.missing.join(', ')}`, '', '| Dimension | Score (1-5) | Weight | Weighted |', '|---|---|---|---|'];
  for (const r of result.rows) lines.push(`| ${r.name} | ${r.score ?? '—'} | ${(r.weight * 100).toFixed(0)}% | ${r.weighted === null ? '—' : r.weighted.toFixed(2)} |`);
  return lines.join('\n') + '\n';
}
