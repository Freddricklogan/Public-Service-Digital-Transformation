/** Shared scaffold for the MkDocs tool pages: a subject field, the fields the tool builds, a live
 * aria-live result, and a "Copy as Markdown" button with a <pre> fallback when the clipboard is
 * unavailable. Vendored into docs/assets/shell/ next to exec-shell.js; each page supplies only its
 * fields, its read() of the form and its render() of the result. */

export function el(tag, props = {}, kids = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k.startsWith('aria-') || k === 'for' || k === 'placeholder') node.setAttribute(k, v);
    else node[k] = v;
  }
  node.append(...kids);
  return node;
}

/** A <select> whose first option is "<label>: not rated"; options is [[value, text], ...]. */
export function levelSelect(id, label, options) {
  return el('select', { id, 'aria-label': label }, [
    el('option', { value: '', text: `${label}: not rated` }),
    ...options.map(([value, text]) => el('option', { value: String(value), text: `${label}: ${text}` }))
  ]);
}

/** Send the tour to a tool page unless it is already open. */
export function gotoTool(path) {
  if (!location.pathname.includes('/tools/')) location.href = new URL(path, document.baseURI).href;
}

/**
 * mountTool(root, {
 *   subjectLabel: 'Tool under evaluation',
 *   buildFields(form): append the tool's fieldsets to form,
 *   read(form): the tool's input value,
 *   render(out, value): fill the aria-live result container,
 *   toMarkdown(subject, value): Markdown export,
 *   copyLabel: button text,
 *   events: ['change'] by default; add 'input' when free text changes the result,
 * })
 */
export function mountTool(root, spec) {
  const form = el('form', { class: 'tool-form', noValidate: true });
  const subject = el('input', { id: 'tool-subject', type: 'text' });
  form.append(el('div', { class: 'tool-field' }, [el('label', { for: 'tool-subject', text: spec.subjectLabel }), subject]));
  spec.buildFields(form);
  const out = el('div', { class: 'tool-out', 'aria-live': 'polite' });
  const btn = el('button', { type: 'button', class: 'md-button md-button--primary', text: spec.copyLabel });
  const status = el('p', { class: 'tool-status' });
  root.append(form, out, btn, status);
  const render = () => { out.replaceChildren(); spec.render(out, spec.read(form)); };
  for (const ev of spec.events ?? ['change']) form.addEventListener(ev, render);
  btn.addEventListener('click', async () => {
    const md = spec.toMarkdown(subject.value.trim(), spec.read(form));
    try {
      await navigator.clipboard.writeText(md);
      status.textContent = 'Copied.';
    } catch {
      status.replaceChildren('Clipboard unavailable — result printed below.', el('pre', { text: md }));
    }
  });
  render();
  return { form, out, render };
}

/** Material for MkDocs remembers the palette it picked on first load; when the OS scheme flips,
 * switch its palette with the shell so header and body stay in the same scheme. */
export function followScheme() {
  if (typeof matchMedia !== 'function') return;
  const sync = (light) => {
    const wanted = `(prefers-color-scheme: ${light ? 'light' : 'dark'})`;
    const input = document.querySelector(`input[data-md-color-media="${wanted}"]`);
    if (input && !input.checked) input.click();
  };
  const mq = matchMedia('(prefers-color-scheme: light)');
  mq.addEventListener('change', (e) => sync(e.matches));
  sync(mq.matches);
}
