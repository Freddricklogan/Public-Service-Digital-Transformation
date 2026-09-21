/** Binds the stakeholder readiness score to the form on tools/readiness/. Runs only where the form exists. */
import { DIMENSIONS, score, toMarkdown } from './lib/readiness.js';

const root = document.getElementById('readiness-tool');
if (root) {
  const form = document.createElement('form');
  form.className = 'dm-form';
  form.noValidate = true;
  const nameField = document.createElement('div');
  nameField.className = 'dm-field';
  const nameLabel = document.createElement('label');
  nameLabel.htmlFor = 'sr-name';
  nameLabel.textContent = 'Stakeholder or group';
  const nameInput = document.createElement('input');
  nameInput.id = 'sr-name';
  nameInput.type = 'text';
  nameField.append(nameLabel, nameInput);
  form.append(nameField);
  const fs = document.createElement('fieldset');
  const lg = document.createElement('legend');
  lg.textContent = 'Section 3 ratings (1–5)';
  fs.append(lg);
  for (const d of DIMENSIONS) {
    const row = document.createElement('div');
    row.className = 'dm-row dm-row--2';
    const label = document.createElement('label');
    label.htmlFor = `sr-${d.id}`;
    label.textContent = `${d.name} (${(d.weight * 100).toFixed(0)}%)`;
    const select = document.createElement('select');
    select.id = `sr-${d.id}`;
    const blank = document.createElement('option');
    blank.value = '';
    blank.textContent = 'not scored';
    select.append(blank);
    for (const s of [5, 4, 3, 2, 1]) { const o = document.createElement('option'); o.value = String(s); o.textContent = String(s); select.append(o); }
    row.append(label, select);
    fs.append(row);
  }
  form.append(fs);
  const out = document.createElement('div');
  out.className = 'dm-out';
  out.setAttribute('aria-live', 'polite');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'md-button md-button--primary';
  btn.textContent = 'Copy score as Markdown';
  const status = document.createElement('p');
  status.className = 'dm-status';
  root.append(form, out, btn, status);

  const scores = () => Object.fromEntries(DIMENSIONS.map((d) => { const v = form.querySelector(`#sr-${d.id}`).value; return [d.id, v === '' ? null : Number(v)]; }));
  const render = () => {
    const r = score(scores());
    out.replaceChildren();
    const h = document.createElement('p');
    h.className = `dm-headline dm-${r.complete ? 'ok' : 'partial'}`;
    h.textContent = r.complete ? `${r.overall.toFixed(2)} — ${r.band.name}: ${r.band.note}` : `Incomplete — not yet scored: ${r.missing.join(', ')}`;
    out.append(h);
  };
  form.addEventListener('change', render);
  btn.addEventListener('click', async () => {
    const md = toMarkdown(nameInput.value.trim(), score(scores()));
    try { await navigator.clipboard.writeText(md); status.textContent = 'Copied.'; } catch { status.textContent = 'Clipboard unavailable — score printed below.'; const pre = document.createElement('pre'); pre.textContent = md; status.append(pre); }
  });
  render();
}
