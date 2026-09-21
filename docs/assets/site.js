/** Mounts the Executive Shell on every page; KPIs come from the tool modules, not typed in. */
import { mountExecShell } from './shell/exec-shell.js';
import { gotoTool } from './shell/tool-page.js';
import { DIMENSIONS, LEVELS } from './lib/maturity.js';
import { BANDS } from './lib/readiness.js';

mountExecShell({
  title: 'Public Service Digital Transformation',
  tagline: 'Service design, change management, a digital maturity model, an implementation roadmap and a stakeholder readiness template for public sector organizations — published as a documentation site, with the maturity model\'s gap analysis and the readiness score implemented as tools.',
  repo: 'https://github.com/Freddricklogan/Public-Service-Digital-Transformation',
  pagesUrl: 'https://freddricklogan.github.io/Public-Service-Digital-Transformation/',
  badges: [{ label: 'MkDocs', tone: 'accent' }, { label: 'Maturity gap analysis', dot: true }, { label: 'Readiness score', dot: true }],
  kpis: [
    { label: 'Documents', compute: () => 5, tone: 'accent' },
    { label: 'Maturity dimensions', compute: () => DIMENSIONS.length },
    { label: 'Maturity levels', compute: () => Object.keys(LEVELS).length, tone: 'ok' },
    { label: 'Readiness bands', compute: () => BANDS.length, tone: 'warn' }
  ],
  tour: [
    { selector: '.md-content', title: 'A framework you can read', body: 'Service design methodology, change management strategy, the digital maturity model, the implementation roadmap and the stakeholder readiness template — rendered as a site with search and navigation.' },
    { selector: '.md-content', title: 'A model you can apply', body: `The Tools pages rate ${DIMENSIONS.length} dimensions at current and target levels and rank the gaps, and score a stakeholder's readiness on the template's weights and ${BANDS.length} bands — both exportable as Markdown.`, action: () => gotoTool('tools/maturity/') }
  ],
  mainSelector: '.md-main'
});
