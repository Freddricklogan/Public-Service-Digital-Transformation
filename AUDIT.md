# AUDIT — Public-Service-Digital-Transformation (pre-refactor)

Audit of the previous build: four framework documents and one
template (about 10,900 words), a README, no site, no code, no tests.
The README linked to a lowercase Pages URL served by a stale folder in
the user-site repository; this repository had no Pages configuration
and no workflow.

---

## A. Claims the documents could not support

### A1 — "30% technology, 70% people"
`docs/change-management-strategy.md` line 5 stated that technology
"accounts for roughly 30% of a transformation initiative's complexity;
the remaining 70%" is culture, process and behaviour. No source. The
figures are a familiar consulting heuristic, not a measurement.
**Fix:** rewritten as "the smaller part … the larger part", which is
the claim the document can actually stand behind.

### A2 — Targets that read like results
`docs/implementation-roadmap.md` carries per-phase KPI tables (40%
awareness, 80% trained, 99.5% uptime, 60% cost reduction and so on).
They are labelled targets in the document and remain so; nothing was
changed. The README no longer summarises them.

### A3 — Two instruments left to hand arithmetic
The maturity model's assessment process (Steps 1 and 4) asks for a
1–5 rating on seven dimensions and a gap analysis against a target;
the stakeholder template's Section 4 asks for a weighted score
(15/30/20/20/15) and a classification into four bands. Both were
tables of blanks. **Fix:** `docs/assets/lib/maturity.js` and
`docs/assets/lib/readiness.js`, with tests. The readiness module
rounds the weighted sum to two decimals before classifying, because
five 4s sum to 3.9999999999999996 in binary floating point and the
template clearly intends them to be a Champion (4.0).

## B. Publishing

### B1 — No site
Five documents cross-referenced by file path. **Fix:** MkDocs +
Material, `strict` build in CI; the template moved from `templates/`
into `docs/`.

### B2 — Wrong-case URL
The README's live link used the lowercase repository name, which is
served by the stale user-site folder and keeps serving it after the
project site exists (observed on EdTech-Policy-Framework). The
canonical `site_url` uses the repository's casing; pruning the stale
folders is a separate, manual task.

## C. License

The original README released the framework under CC BY 4.0 and the
repository had no LICENSE file. `LICENSE` now records CC BY 4.0 for
the documents and MIT for the tool code, rather than replacing the
stated licence.

## D. What was added

| Item | Where |
| --- | --- |
| Maturity gap analysis module (pure, tested) | `docs/assets/lib/maturity.js`, `tests/maturity.test.js` |
| Stakeholder readiness module (pure, tested) | `docs/assets/lib/readiness.js`, `tests/readiness.test.js` |
| Tool pages (forms, live output, Markdown export) | `docs/tools/maturity.md`, `docs/tools/readiness.md`, `docs/assets/*-page.js` |
| Executive Shell on every page | `docs/assets/site.js`, `docs/assets/shell/` |
| MkDocs site, strict | `mkdocs.yml`, `requirements.txt` |
| CI/CD (lint → tests → build → scan → Pages) + CodeQL | `.github/workflows/` |
| Case study | `docs/CASE_STUDY.md` |
