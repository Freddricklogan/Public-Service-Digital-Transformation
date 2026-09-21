# Case Study — Public-Service-Digital-Transformation

**Repository:** [Public-Service-Digital-Transformation](https://github.com/Freddricklogan/Public-Service-Digital-Transformation) · **Live demo:** [freddricklogan.github.io/Public-Service-Digital-Transformation](https://freddricklogan.github.io/Public-Service-Digital-Transformation/) · **Author:** Freddrick Logan

---

## 1. Who has this problem

A city or state agency that has been told to "go digital" and has to decide where to start. The CIO who needs a picture of where seven departments actually stand, the programme manager who has to turn that picture into a sequenced roadmap, and the change lead who has to know which stakeholders will carry the work and which will quietly stall it.

## 2. The problem, as a scenario

An agency runs the maturity self-assessment. Each department rates itself 1 to 5 on seven dimensions and names a target. The results come back as seven spreadsheets in slightly different layouts. An analyst consolidates them, averages the columns, and produces a slide that says the agency is "at 2.7". Nobody can see from the slide that Security and Privacy is at Level 1 while everything else is at 3, or that one department set its data target below its current level because it misread the scale. Meanwhile the change lead has scored twelve stakeholders on the readiness template and is adding weighted sums by hand; one of them — five 4s — comes out at 3.99 in the spreadsheet and gets filed as a Supporter instead of a Champion.

## 3. What it costs to leave it alone

The roadmap gets built on an average that hides the weakest dimension, which in the public sector is usually the one that ends up in an audit finding. The stakeholder map misclassifies the people the programme depends on. And the framework itself — five documents readable only as raw Markdown — is not something a programme office can circulate, so the method stays with whoever wrote it.

## 4. The approach, and the alternative I rejected

I rejected building an assessment platform: departmental logins, saved responses, dashboards. Agencies have those and they go unused, because the assessment is an annual conversation, not a system. The documents became a static site, and the two instruments in them became pages on that site — a form, a live result and a Markdown export the analyst pastes into the assessment record. The arithmetic lives in pure modules with tests; the pages only bind them.

I also rejected adding a verdict to the maturity tool. The model is explicit that Level 5 everywhere is not the goal, so the tool reports and ranks gaps and never says "pass" or "fail". Where the document was silent — how to order the gaps — the tool states its convention on the page rather than presenting it as the model's.

## 5. What the code does today

`docs/assets/lib/maturity.js` holds the seven dimensions and five level names from the model. `analyse()` takes a current and a target level per dimension, validates them, computes the current and target means over what is rated, finds the lowest current dimension, ranks positive gaps largest first with ties in model order, and lists any target below current separately as something to check. `docs/assets/lib/readiness.js` holds the stakeholder template's five dimensions, their weights and four bands. `score()` computes the weighted overall only when all five are scored, rounds it to two decimals, and classifies it. Both modules export Markdown.

`docs/assets/maturity-page.js` and `readiness-page.js` build the forms and re-render on every change. `site.js` mounts the Executive Shell on every page. CI lints, tests with coverage, builds with `mkdocs build --strict`, runs npm audit and Trivy, and deploys to GitHub Pages. The one unsourced statistic in the documents — technology as "30%" of a transformation's complexity — was softened to a qualitative claim.

## 6. Evidence

Twelve Vitest tests pass with 100 percent statement coverage over both modules. They pin the scenario above: a Security and Privacy rating of 1 among 3s is reported as the lowest dimension and ranks first among the gaps; a target below current is flagged and excluded from the ranking; a gap of zero is neither; five 4s on the readiness template score 4.00 and classify as Champion, and the test records that the unrounded sum is 3.9999999999999996. `mkdocs build --strict` completes without warnings across nine pages. A headless-Chrome smoke of the built site found both forms — fourteen and five selects — produced the expected means, ranking, warning and bands, opened the tour, logged no console messages, and showed no horizontal overflow at 1280 or 400 pixels.

## 7. What it would take to run this in production

It runs as a static site now. For an agency the remaining work is procedural: agree who rates, collect the evidence the model's Step 2 asks for, and validate ratings independently in Step 3 — none of which a tool should pretend to do. If a programme office wants to consolidate many departments' exports, the modules are the piece to keep and a small aggregation script is the piece to add.

## 8. Limits and next steps

The tools cover the model's Steps 1 and 4 and the template's Section 4; evidence, validation and the engagement plan are still done by people. The gap ordering is a convention, stated as such. The site sets no Content-Security-Policy because Material for MkDocs relies on inline scripts. The next step is the roadmap's per-phase KPI tables, which could become a tracker that reads a department's measured values against the targets.

## 9. Who should look at this

Public sector technology leaders who need an assessment their roadmap can actually be built on, and anyone judging whether I can turn a policy framework into instruments without overstating what the framework says.
