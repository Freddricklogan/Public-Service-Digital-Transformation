/** Binds the maturity gap analysis to the form on tools/maturity/. Runs only where the form exists. */
import { DIMENSIONS, LEVELS, analyse, toMarkdown } from './lib/maturity.js';

const root = document.getElementById('maturity-tool');
if (root) {
  const form = document.createElement('form');
  form.className = 'dm-form';
  form.noValidate = true;
  const nameField = document.createElement('div');
  nameField.className = 'dm-field';
  const nameLabel = document.createElement('label');
  nameLabel.htmlFor = 'dm-org';
  nameLabel.textContent = 'Organization or department';
  const nameInput = document.createElement('input');
  nameInput.id = 'dm-org';
  nameInput.type = 'text';
  nameField.append(nameLabel, nameInput);
  form.append(nameField);

  const levelSelect = (id, label) => {
    const select = document.createElement('select');
    select.id = id;
    select.setAttribute('aria-label', label);
    const blank = document.createElement('option');
    blank.value = '';
    blank.textContent = `${label}: not rated`;
    select.append(blank);
    for (const [k, v] of Object.entries(LEVELS)) {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = `${label}: Level ${k} — ${v}`;
      select.append(o);
    }
    return select;
  };
  const fs = document.createElement('fieldset');
  const lg = document.createElement('legend');
  lg.textContent = 'Seven dimensions — current and target level';
  fs.append(lg);
  for (const d of DIMENSIONS) {
    const row = document.createElement('div');
    row.className = 'dm-row';
    const label = document.createElement('div');
    label.className = 'dm-name';
    label.textContent = d.name;
    row.append(label, levelSelect(`dm-c-${d.id}`, 'Current'), levelSelect(`dm-t-${d.id}`, 'Target'));
    fs.append(row);
  }
  form.append(fs);

  const out = document.createElement('div');
  out.className = 'dm-out';
  out.setAttribute('aria-live', 'polite');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'md-button md-button--primary';
  btn.textContent = 'Copy gap analysis as Markdown';
  const status = document.createElement('p');
  status.className = 'dm-status';
  root.append(form, out, btn, status);

  const val = (id) => { const v = form.querySelector(`#${id}`).value; return v === '' ? null : Number(v); };
  const ratings = () => Object.fromEntries(DIMENSIONS.map((d) => [d.id, { current: val(`dm-c-${d.id}`), target: val(`dm-t-${d.id}`) }]));
  const f = (v) => (v === null ? '—' : v.toFixed(2));
  const render = () => {
    const a = analyse(ratings());
    out.replaceChildren();
    const h = document.createElement('p');
    h.className = `dm-headline dm-${a.complete ? 'ok' : 'partial'}`;
    h.textContent = `Current mean ${f(a.currentMean)} · target mean ${f(a.targetMean)} · ${a.ratedCount}/${DIMENSIONS.length} rated${a.complete ? '' : ' (incomplete)'}`;
    out.append(h);
    if (a.weakest) { const p = document.createElement('p'); p.textContent = `Lowest current dimension: ${a.weakest.name} — Level ${a.weakest.current}, ${a.weakest.currentLevel}.`; out.append(p); }
    if (a.gaps.length) {
      const ol = document.createElement('ol');
      for (const d of a.gaps) { const li = document.createElement('li'); li.textContent = `${d.name}: Level ${d.current} → ${d.target} (${d.gap} level${d.gap === 1 ? '' : 's'})`; ol.append(li); }
      out.append(ol);
    }
    for (const d of a.regressions) { const p = document.createElement('p'); p.className = 'dm-warn'; p.textContent = `${d.name}: target (Level ${d.target}) is below current (Level ${d.current}) — check the rating.`; out.append(p); }
  };
  form.addEventListener('change', render);
  btn.addEventListener('click', async () => {
    const md = toMarkdown(nameInput.value.trim(), analyse(ratings()));
    try { await navigator.clipboard.writeText(md); status.textContent = 'Copied.'; } catch { status.textContent = 'Clipboard unavailable — analysis printed below.'; const pre = document.createElement('pre'); pre.textContent = md; status.append(pre); }
  });
  render();
}
