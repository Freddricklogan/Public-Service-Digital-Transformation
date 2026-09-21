/** Maturity gap analysis page: seven dimensions × current/target level on the shared tool scaffold. */
import { DIMENSIONS, LEVELS, analyse, toMarkdown } from './lib/maturity.js';
import { el, levelSelect, mountTool } from './shell/tool-page.js';

const root = document.getElementById('maturity-tool');
if (root) {
  const levels = Object.entries(LEVELS).map(([k, v]) => [k, `Level ${k} — ${v}`]);
  const rows = {};
  const f = (v) => (v === null ? '—' : v.toFixed(2));
  mountTool(root, {
    subjectLabel: 'Organization or department',
    copyLabel: 'Copy gap analysis as Markdown',
    buildFields(form) {
      const fs = el('fieldset', {}, [el('legend', { text: 'Seven dimensions — current and target level' })]);
      fs.style.setProperty('--tool-cols', '1.2fr 1fr 1fr');
      for (const d of DIMENSIONS) {
        rows[d.id] = { current: levelSelect(`dm-c-${d.id}`, 'Current', levels), target: levelSelect(`dm-t-${d.id}`, 'Target', levels) };
        fs.append(el('div', { class: 'tool-row' }, [el('div', { class: 'tool-name', text: d.name }), rows[d.id].current, rows[d.id].target]));
      }
      form.append(fs);
    },
    read: () => Object.fromEntries(DIMENSIONS.map((d) => [d.id, { current: rows[d.id].current.value ? Number(rows[d.id].current.value) : null, target: rows[d.id].target.value ? Number(rows[d.id].target.value) : null }])),
    render(out, ratings) {
      const a = analyse(ratings);
      out.append(el('p', { class: `tool-headline tool-${a.complete ? 'ok' : 'warn'}`, text: `Current mean ${f(a.currentMean)} · target mean ${f(a.targetMean)} · ${a.ratedCount}/${DIMENSIONS.length} rated${a.complete ? '' : ' (incomplete)'}` }));
      if (a.weakest) out.append(el('p', { text: `Lowest current dimension: ${a.weakest.name} — Level ${a.weakest.current}, ${a.weakest.currentLevel}.` }));
      if (a.gaps.length) out.append(el('ol', {}, a.gaps.map((d) => el('li', { text: `${d.name}: Level ${d.current} → ${d.target} (${d.gap} level${d.gap === 1 ? '' : 's'})` }))));
      for (const d of a.regressions) out.append(el('p', { class: 'tool-danger', text: `${d.name}: target (Level ${d.target}) is below current (Level ${d.current}) — check the rating.` }));
    },
    toMarkdown: (subject, ratings) => toMarkdown(subject, analyse(ratings))
  });
}
