/** Mounts the Executive Shell on every page of the docs site. */
import { mountExecShell } from './shell/exec-shell.js';

const shell = mountExecShell({
  title: 'Public Service Digital Transformation',
  tagline: 'Service design, change management, a digital maturity model, an implementation roadmap and a stakeholder readiness template for public sector organizations — published as a documentation site, with the maturity model\'s gap analysis and the readiness score implemented as tools.',
  repo: 'https://github.com/Freddricklogan/Public-Service-Digital-Transformation',
  pagesUrl: 'https://freddricklogan.github.io/Public-Service-Digital-Transformation/',
  badges: [{ label: 'MkDocs', tone: 'accent' }, { label: 'Maturity gap analysis', dot: true }, { label: 'Readiness score', dot: true }],
  kpis: [
    { label: 'Documents', compute: () => 5, tone: 'accent' },
    { label: 'Maturity dimensions', compute: () => 7 },
    { label: 'Maturity levels', compute: () => 5, tone: 'ok' },
    { label: 'Readiness bands', compute: () => 4, tone: 'warn' }
  ],
  tour: [
    { selector: '.md-content', title: 'A framework you can read', body: 'Service design methodology, change management strategy, the digital maturity model, the implementation roadmap and the stakeholder readiness template — rendered as a site with search and navigation.' },
    { selector: '.md-content', title: 'A model you can apply', body: 'The Tools pages rate seven dimensions at current and target levels and rank the gaps, and score a stakeholder\'s readiness on the template\'s weights and bands — both exportable as Markdown.', action: () => { if (!location.pathname.includes('/tools/')) location.href = new URL('tools/maturity/', document.baseURI).href; } }
  ],
  mainSelector: '.md-main'
});
shell.refreshKpis();
