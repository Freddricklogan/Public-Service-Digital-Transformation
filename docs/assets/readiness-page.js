/** Stakeholder readiness page: five 1–5 scores on the shared tool scaffold. */
import { DIMENSIONS, score, toMarkdown } from './lib/readiness.js';
import { el, mountTool } from './shell/tool-page.js';

const root = document.getElementById('readiness-tool');
if (root) {
  const selects = {};
  mountTool(root, {
    subjectLabel: 'Stakeholder or group',
    copyLabel: 'Copy score as Markdown',
    buildFields(form) {
      const fs = el('fieldset', {}, [el('legend', { text: 'Section 3 ratings (1–5)' })]);
      fs.style.setProperty('--tool-cols', '1fr 160px');
      for (const d of DIMENSIONS) {
        selects[d.id] = el('select', { id: `sr-${d.id}` }, [el('option', { value: '', text: 'not scored' }), ...[5, 4, 3, 2, 1].map((s) => el('option', { value: String(s), text: String(s) }))]);
        fs.append(el('div', { class: 'tool-row' }, [el('label', { for: `sr-${d.id}`, text: `${d.name} (${(d.weight * 100).toFixed(0)}%)` }), selects[d.id]]));
      }
      form.append(fs);
    },
    read: () => Object.fromEntries(DIMENSIONS.map((d) => [d.id, selects[d.id].value === '' ? null : Number(selects[d.id].value)])),
    render(out, scores) {
      const r = score(scores);
      out.append(el('p', { class: `tool-headline tool-${r.complete ? 'ok' : 'warn'}`, text: r.complete ? `${r.overall.toFixed(2)} — ${r.band.name}: ${r.band.note}` : `Incomplete — not yet scored: ${r.missing.join(', ')}` }));
    },
    toMarkdown: (subject, scores) => toMarkdown(subject, score(scores))
  });
}
