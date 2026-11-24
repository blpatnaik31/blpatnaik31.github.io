const REPO = "https://github.com/blpatnaik31/arch-portfolio/blob/main";

const caseStudies = [
  {
    slug: "governed-multi-agent-repair",
    number: "A1",
    file: "case-studies/a1-governed-multi-agent-repair.md",
    title: "Governed multi-agent repair for blocked catalog products",
    kicker: "Agent orchestration",
    summary: "A lead agent and eight specialised workers diagnose blocked products, assign fix mechanisms and verify repairs. Production re-drive happens only after a human approves a packaged, evidenced change.",
    headline: "8 workers · 2 passes · 3 clean runs",
    status: "Draft",
    role: "Product Owner & Solution Architect",
    engagement: "A commerce/marketplace SaaS platform · AI-driven catalog",
    period: "Jun 2026 – present",
    tags: ["Multi-agent", "Human-in-the-loop", "State machine", "Contracts"],
    context: [
      "An AI-driven catalog engine takes sellers' raw product data and lists it on e-commerce marketplaces. Across a multi-thousand-item production catalog, products get blocked: a listing fails a downstream channel or quality rule and stops flowing. Each one needs someone to find out why, choose a fix, check that the fix worked, and get the corrected product back into production.",
      "An earlier piece of my work set this up: a standalone diagnostic tool that surfaces currently-blocked items straight from production fault telemetry, with safeguards against over-crediting unverified fixes. The repair architecture builds on that lesson. \"Fixed\" has to be proven, not assumed.",
    ],
    forces: [
      ["Many causes, many mechanisms", "One generic \"fix it\" step can't cover them. Different causes need different kinds of repair."],
      ["Deterministic and judgment steps mixed", "If a model drives the whole loop, the deterministic steps become probabilistic. If everything is scripted, the ambiguous cases can't be handled."],
      ["Re-drive is the risky step", "A wrong repair that reaches a live channel costs far more than a slow one."],
      ["Not every case belongs to automation", "Without clear ownership, cases outside the system's scope quietly stall."],
      ["Every change must be auditable", "Reviewers need to see what was diagnosed, what changed, what verified it and who approved it."],
    ],
    decision: [
      "A lead agent delegates to eight specialised workers. It routes products, tracks state and writes the audit trail, but never edits a product itself.",
      "Pass 1, fix and verify, is automated and never touches production. A repair counts as verified only after three consecutive clean runs.",
      "Pass 2, approve and re-drive, packages each verified change with its evidence. A person approves it before the product is re-driven to production.",
      "Cases automation shouldn't or can't resolve end in a named stop state with an explicit owner, instead of being retried indefinitely.",
    ],
    diagram: {
      label: "Two-pass repair flow, from blocked product to human-approved production re-drive",
      stages: [
        { step: "Intake", nodes: [{ kind: "code", title: "Intake worker", detail: "Collect blocked products and normalise their block reasons" }] },
        { step: "Diagnose", nodes: [{ kind: "code", title: "Diagnoser", detail: "Map a block reason to a known fix mechanism" }], note: "No mechanism or out of scope → named stop state with an owner" },
        { step: "Resolve", nodes: [
          { kind: "llm", title: "Judgment worker", detail: "Classify ambiguous cases only" },
          { kind: "llm", title: "Resolver", detail: "Propose repair content where a rule isn't enough" },
        ], note: "Model output feeds a scripted worker. It never edits a product directly." },
        { step: "Fix", nodes: [{ kind: "code", title: "Fix applier", detail: "Apply the assigned mechanism outside production" }] },
        { step: "Verify", nodes: [{ kind: "code", title: "Verifier", detail: "Three consecutive clean runs, or UNVERIFIED" }] },
        { step: "Package", nodes: [{ kind: "output", title: "Packager", detail: "Change, diagnosis and verification evidence in one approval package" }] },
        { step: "Approve", nodes: [{ kind: "human", title: "Human approval", detail: "The only route from Pass 1 to production" }] },
        { step: "Re-drive", nodes: [{ kind: "external", title: "Production re-drive", detail: "Re-submit approved products and record the result" }] },
      ],
      caption: "Steps 1–5 are Pass 1 (automated, outside production). Steps 6–8 are Pass 2 (human-approved). Worker names are generic labels.",
    },
    roster: [
      ["1", "Intake", "1", "Scripted", "Collect blocked products and normalise block reasons"],
      ["2", "Diagnoser", "1", "Scripted", "Map a block reason to a fix mechanism, or flag it as ambiguous or out of scope"],
      ["3", "Judgment worker", "1", "Model-backed", "Classify ambiguous cases the diagnoser can't map deterministically"],
      ["4", "Resolver", "1", "Model-backed", "Propose repair content when a fix needs judgment"],
      ["5", "Fix applier", "1", "Scripted", "Apply the assigned mechanism outside production"],
      ["6", "Verifier", "1", "Scripted", "Re-run validation and enforce the three-clean-run rule"],
      ["7", "Packager", "2", "Scripted", "Bundle change, diagnosis and evidence into an approval package"],
      ["8", "Re-driver", "2", "Scripted", "Re-submit approved products to production and record the result"],
    ],
    alternatives: [
      ["One general-purpose agent for the whole loop", "Deterministic steps become probabilistic and hard to test. One failure mode hides another, and it isn't clear who owns which errors."],
      ["Fully scripted pipeline, no model", "Ambiguous diagnoses and judgment-based repairs either stall or get forced into the wrong mechanism."],
      ["Single pass: fix, verify and re-drive automatically", "Removes the human check from the highest-risk step. One bad mechanism could reach live channels at scale."],
      ["Human review of every step", "Safe but doesn't scale, and reviewers tire of approving deterministic steps that are already correct."],
      ["Single clean verification run", "Intermittent failures pass once and then fail in production."],
    ],
    boundaries: [
      ["Script vs model", "A model is used only where no deterministic answer exists. Its output goes into a scripted worker before anything changes."],
      ["Automated vs human", "Pass 1 never touches production. Only a human approval moves a package into re-drive."],
      ["In vs out of automation", "Cases with no known mechanism, or outside scope, exit through a named stop state with an owner."],
      ["Verification", "\"Fixed\" means three consecutive clean runs, not one."],
    ],
    contract: `{
  "product_ref": "opaque-id",
  "worker": "diagnoser",
  "pass": 1,
  "input_digest": "sha256:…",
  "outcome": "ROUTED | VERIFIED | PACKAGED | APPROVED | REDRIVEN | STOPPED",
  "stop_state": null,
  "owner": null,
  "evidence": [{ "kind": "validation_run", "result": "clean", "run": 1 }],
  "rationale": "Short, human-readable reason for this outcome"
}`,
    stopStates: [
      ["NO_MECHANISM", "Diagnosis finds no known fix mechanism", "Named product/data owner"],
      ["OUT_OF_SCOPE", "The cause is outside what automation may change", "Named owning team"],
      ["UNVERIFIED", "The repair fails the three-clean-run rule", "Engineering owner of that mechanism"],
      ["REJECTED", "A human declines the Pass 2 package", "Approver records the reason"],
    ],
    risks: [
      ["A model-proposed repair is plausible but wrong", "Model output only feeds a scripted applier, then three clean runs, then human approval"],
      ["A flaky repair passes once", "Three-consecutive-clean-run rule"],
      ["A bad mechanism reaches production at scale", "Re-drive happens only after human approval of a packaged, evidenced change"],
      ["Cases stall silently", "Named stop states with explicit owners"],
      ["No way to reconstruct what happened", "Same handoff envelope for every worker, with input digest, evidence and rationale"],
      ["Reviewers tire of approving", "Humans review only Pass 2 packages, not deterministic steps"],
    ],
    outcomes: [
      ["8", "worker roles, deterministic and model-assisted kept separate"],
      ["2", "workflow passes: automated verification, human-approved re-drive"],
      ["3", "consecutive clean runs before a repair counts as verified"],
      ["0", "production re-drives without a human approval"],
    ],
    measureNext: [
      "Blocked products cleared per cycle, and median time from block to re-drive",
      "First-attempt verification pass rate",
      "Share of cases closed by automation vs routed to each stop state",
      "Approval turnaround and rejection rate for Pass 2 packages",
      "Repairs that regressed after re-drive (the real test of the verification rule)",
    ],
    adrs: ["ADR-001", "ADR-002", "ADR-003", "ADR-004"],
  },
];

const planned = [
  ["A2", "Metrics automation: CI vs scheduled vs manual scorers", "Twelve scoreboard metric mechanisms classified as automated, manual or absent, with controls for stage leakage, silenced failures and stale metrics."],
  ["A3", "Designing a defensible end-to-end quality metric", "Corpus and answer-key design across 276 candidate products, 57 product types and 17 accounts: stable identity joins, stratification and confidence intervals."],
  ["A4", "Reusable channel onboarding for a marketplace pipeline", "An RFC separating shared capabilities from channel-specific mappings, classifying 11 runtime and 14 tooling artifact types, with a per-category rollout loop."],
];

const decisions = [
  { id: "ADR-001", file: "decisions/adr-001-two-pass-operating-model.md", title: "Two-pass operating model", study: "A1", body: "Separate automated fix verification from human-approved production re-drive, so human attention goes only to the step where a mistake reaches customers." },
  { id: "ADR-002", file: "decisions/adr-002-script-vs-model-boundary.md", title: "Script vs model boundary", study: "A1", body: "Scripted workers for every deterministic step. Models only for judgment and resolution, and their output never changes a product directly." },
  { id: "ADR-003", file: "decisions/adr-003-three-clean-run-verification.md", title: "Three-clean-run verification", study: "A1", body: "A repair counts as verified only after three consecutive clean runs, catching flaky fixes before packaging rather than after re-drive." },
  { id: "ADR-004", file: "decisions/adr-004-named-stop-states.md", title: "Named stop states with owners", study: "A1", body: "Every case that leaves automation ends in a named state with an owner and a reason, so nothing stalls unseen." },
];

const principles = [
  ["Deterministic first", "Use a model only where no provably correct answer exists. Everything else is a plain, testable step."],
  ["Gate the risk, not the work", "Put human approval where a mistake reaches customers, not on every step."],
  ["Contracts before code", "Every hand-off uses a shape the whole system and the audit trail can rely on."],
  ["Every exit has an owner", "Cases automation can't handle end in a named state with an owner, never in a retry loop."],
  ["Measure before you automate", "Define what \"fixed\" and \"better\" mean, and how you'd know if the metric itself is wrong."],
];

const main = document.querySelector("#main-content");
const nav = document.querySelector("#site-nav");
document.querySelector("#current-year").textContent = new Date().getFullYear();

const tagList = (tags) => `<div class="tag-list">${tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>`;
const code = (text) => `<pre class="code-block"><code>${text.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</code></pre>`;
const table = (head, rows, numCols = []) => `<div class="skills-table-wrap"><table class="skills-table eval-table"><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${numCols.includes(i) ? ' class="num"' : ""}>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;

const KINDS = {
  data: { label: "Data", icon: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>' },
  code: { label: "Deterministic code", icon: '<path d="m8 8-4 4 4 4"/><path d="m16 8 4 4-4 4"/><path d="m14 5-4 14"/>' },
  llm: { label: "Model-backed", icon: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="m12 8 1.5 2.5L16 12l-2.5 1.5L12 16l-1.5-2.5L8 12l2.5-1.5Z"/>' },
  human: { label: "Human decision", icon: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>' },
  output: { label: "Output", icon: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/>' },
  external: { label: "External system", icon: '<path d="M14 4h6v6"/><path d="m20 4-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>' },
};
const kindIcon = (kind) => `<svg class="dg-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${KINDS[kind].icon}</svg>`;

function diagram(d) {
  const used = [...new Set(d.stages.flatMap((st) => st.nodes.map((n) => n.kind)))];
  const stages = d.stages.map((st, i) => `<li class="dg-stage">
      <span class="dg-step"><span class="dg-step-num">${String(i + 1).padStart(2, "0")}</span>${st.step}</span>
      <div class="dg-body">
        <ul class="dg-nodes" data-count="${st.nodes.length}">${st.nodes.map((n) => `<li class="dg-node dg-${n.kind}">
          <span class="dg-kind">${kindIcon(n.kind)}${KINDS[n.kind].label}</span>
          <strong>${n.title}</strong><span class="dg-detail">${n.detail}</span>
        </li>`).join("")}</ul>
        ${st.note ? `<p class="dg-note">${st.note}</p>` : ""}
      </div>
    </li>`).join("");
  return `<figure class="diagram">
    <ol class="dg-flow" aria-label="${d.label}">${stages}</ol>
    <figcaption><span class="dg-legend" aria-hidden="true">${used.map((k) => `<span class="dg-legend-item dg-${k}">${kindIcon(k)}${KINDS[k].label}</span>`).join("")}</span><span>${d.caption}</span></figcaption>
  </figure>`;
}

function studyCard(item) {
  return `<a class="work-card" href="#/case-studies/${item.slug}">
    <div class="card-top">
      <span class="card-index">${item.number} · ${item.status}</span>
      <h3>${item.title}</h3>
      <span class="card-company">${item.kicker} · ${item.period}</span>
    </div>
    <div class="card-bottom">
      <p class="card-result"><strong>${item.headline}</strong>${item.summary}</p>
      ${tagList(item.tags.slice(0, 2))}
    </div>
  </a>`;
}

function plannedCard([number, title, body]) {
  return `<div class="work-card" aria-disabled="true" style="opacity:0.72">
    <div class="card-top">
      <span class="card-index">${number} · Planned</span>
      <h3>${title}</h3>
      <span class="card-company">Write-up in progress</span>
    </div>
    <div class="card-bottom"><p class="card-result">${body}</p></div>
  </div>`;
}

function metrics() {
  return `<div class="metrics-grid">
    <div class="metric"><span class="metric-value">8</span><span class="metric-label">worker roles in a governed agent architecture</span></div>
    <div class="metric"><span class="metric-value">12</span><span class="metric-label">scoreboard metric mechanisms reviewed</span></div>
    <div class="metric"><span class="metric-value">276</span><span class="metric-label">candidate products evaluated for corpus design</span></div>
    <div class="metric"><span class="metric-value">25</span><span class="metric-label">artifact types classified for channel onboarding</span></div>
  </div>`;
}

function principleGrid() {
  return `<div class="process-grid">${principles.map(([title, body], i) => `<div class="process-step"><span class="process-number">0${i + 1}</span><h3>${title}</h3><p>${body}</p></div>`).join("")}</div>`;
}

function allStudyCards() {
  return caseStudies.map(studyCard).join("") + planned.map(plannedCard).join("");
}

function renderHome() {
  main.innerHTML = `<section class="hero"><div class="container hero-grid">
    <div>
      <span class="eyebrow">Product Owner · Solution Architect</span>
      <h1>I design where the <em>agent</em> stops and the human decides.</h1>
      <p class="lede">Architecture case studies from AI-driven catalog and marketplace platforms: how a system is decomposed, where the deterministic, model-assisted and human boundaries sit, and which contracts hold it together.</p>
      <div class="hero-actions"><a class="button button-primary" href="#/case-studies">Read the case studies <span aria-hidden="true">↗</span></a><a class="button button-quiet" href="#/decisions">Decision records <span aria-hidden="true">↓</span></a></div>
    </div>
    <aside class="hero-aside"><p>Script what has a right answer. Give the model only the judgment calls. Put the human where a mistake reaches customers. Give every exit an owner.</p><span class="signature-line"></span><span class="signature-label">Agents · Contracts · Metrics · Integration</span></aside>
  </div></section>
  <section class="section"><div class="container">${metrics()}<p style="font-size:0.78rem;color:var(--ink-faint);margin-top:0.9rem">Scope counts from documented, independently evidenced work, not outcome claims.</p></div></section>
  <section class="section"><div class="container">
    <div class="section-heading"><div><span class="eyebrow">Case studies</span><h2>Architecture decisions, with the reasoning shown.</h2></div><p>Each follows the same review structure: forces, decision, alternatives, boundaries, contracts, risks.</p></div>
    <div class="work-grid">${allStudyCards()}</div>
  </div></section>
  <section class="section"><div class="container">
    <div class="section-heading"><div><span class="eyebrow">Principles</span><h2>The rules behind the designs.</h2></div><p>The same judgment calls, applied across agents, metrics and integrations.</p></div>
    ${principleGrid()}
  </div></section>`;
}

function renderStudies() {
  main.innerHTML = `<section class="page-hero"><div class="container"><span class="eyebrow">Case studies</span><h1>Designs you can review like an architecture board would.</h1><p class="lede">Public-safe write-ups: product names, internal tools, IDs, account and third-party names are left out. Worker and state names are generic labels.</p></div></section>
  <section class="section"><div class="container"><div class="work-grid">${allStudyCards()}</div></div></section>`;
}

function renderStudy(slug) {
  const s = caseStudies.find((c) => c.slug === slug);
  if (!s) return renderNotFound();
  const adrLinks = decisions.filter((d) => s.adrs.includes(d.id));
  main.innerHTML = `<section class="detail-hero"><div class="container"><span class="eyebrow">${s.kicker} · Case study ${s.number} · ${s.status}</span><h1>${s.title}</h1><p class="lede">${s.summary}</p><div class="detail-meta"><div class="meta-item"><small>Role</small><span>${s.role}</span></div><div class="meta-item"><small>Engagement</small><span>${s.engagement}</span></div><div class="meta-item"><small>Period</small><span>${s.period}</span></div></div></div></section>
  <div class="container detail-layout"><article class="detail-content">
    <section class="detail-section"><h2>Context</h2>${s.context.map((p) => `<p>${p}</p>`).join("")}</section>
    <section class="detail-section"><h2>Forces</h2><ul>${s.forces.map(([t, b]) => `<li><strong>${t}.</strong> ${b}</li>`).join("")}</ul></section>
    <section class="detail-section"><h2>Decision</h2><ul>${s.decision.map((d) => `<li>${d}</li>`).join("")}</ul>${diagram(s.diagram)}</section>
    <section class="detail-section"><h2>Worker roster</h2><p>Scripted workers handle deterministic work. Model-backed workers are limited to judgment and resolution.</p>${table(["#", "Worker", "Pass", "Type", "Responsibility"], s.roster, [0, 2])}</section>
    <section class="detail-section"><h2>Alternatives considered</h2>${table(["Option", "Why not"], s.alternatives)}</section>
    <section class="detail-section"><h2>Control boundaries</h2>${table(["Boundary", "Rule"], s.boundaries)}</section>
    <section class="detail-section"><h2>Handoff contract</h2><p>Every worker hand-off uses the same envelope, so the lead agent and the audit trail can treat all eight workers alike.</p>${code(s.contract)}<h3 style="margin-top:1.6rem">Named stop states</h3>${table(["Stop state", "Entered when", "Owner"], s.stopStates.map(([a, b, c]) => [`<code>${a}</code>`, b, c]))}<p>Each stop state is a finished result with an owner, not an error. Every blocked product is either fixed, waiting for approval, or with a named owner.</p></section>
    <section class="detail-section"><h2>Risks and mitigations</h2>${table(["Risk", "Mitigation in the design"], s.risks)}</section>
    <section class="detail-section"><h2>Scope evidence</h2><div class="outcomes-grid">${s.outcomes.map(([v, l]) => `<div class="outcome-card"><span class="outcome-value">${v}</span><span class="outcome-label">${l}</span></div>`).join("")}</div></section>
    <section class="detail-section"><h2>What I'd measure next</h2><div class="scope-note"><strong>Scope-driven case study.</strong><br>The engagement is ongoing, so outcome metrics are being set up rather than estimated after the fact.</div><ul>${s.measureNext.map((m) => `<li>${m}</li>`).join("")}</ul></section>
    <section class="detail-section"><h2>Decision records</h2><ul>${adrLinks.map((d) => `<li><a href="${REPO}/${d.file}" target="_blank" rel="noreferrer">${d.id}: ${d.title} ↗</a></li>`).join("")}</ul><div class="button-row"><a class="button button-primary" href="${REPO}/${s.file}" target="_blank" rel="noreferrer">Full write-up on GitHub <span aria-hidden="true">↗</span></a></div></section>
  </article><aside class="detail-sidebar"><div class="side-label">Planned case studies</div><div class="side-list">${planned.map(([n, t]) => `<span>${n} · ${t}</span>`).join("")}</div><div class="side-label">Related portfolios</div><div class="side-list"><a href="https://blpatnaik31.github.io/fde/">FDE: runnable builds →</a><a href="https://blpatnaik31.github.io/tpm/">TPM: delivery outcomes →</a></div></aside></div>`;
}

function renderDecisions() {
  main.innerHTML = `<section class="page-hero"><div class="container"><span class="eyebrow">Decision records</span><h1>Context, decision, consequences.</h1><p class="lede">Short ADRs taken from the case studies. They record the reasoning, not internal identifiers.</p></div></section>
  <section class="section"><div class="container"><div class="process-grid">${decisions.map((d) => `<div class="process-step"><span class="process-number">${d.id} · ${d.study}</span><h3>${d.title}</h3><p>${d.body}</p><p><a href="${REPO}/${d.file}" target="_blank" rel="noreferrer">Read the ADR ↗</a></p></div>`).join("")}</div></div></section>`;
}

function renderPrinciples() {
  main.innerHTML = `<section class="page-hero"><div class="container"><span class="eyebrow">Principles</span><h1>The rules behind the designs.</h1><p class="lede">An architecture is a set of decisions about where risk lives and who owns it. These are the ones I make every time.</p></div></section>
  <section class="section"><div class="container">${principleGrid()}</div></section>`;
}

function renderAbout() {
  main.innerHTML = `<section class="page-hero"><div class="container"><span class="eyebrow">About</span><h1>Program leader, product owner, architect.</h1><p class="lede">Product Owner and Solution Architect on AI-driven catalog and marketplace platforms, with 13+ years in healthcare IT, medical devices and enterprise delivery.</p></div></section>
  <section class="section"><div class="container about-grid"><div><span class="eyebrow">Three lenses</span><h2>Same throughline, different evidence.</h2><p>The TPM portfolio shows quantified delivery outcomes in regulated environments. The FDE portfolio shows runnable builds with honest evaluations. This one shows the architecture decisions in between: decomposition, control boundaries, contracts and risk.</p><div class="credential-list"><span class="credential">PMP</span><span class="credential">CSPO</span><span class="credential">CSM</span><span class="credential">MBA · University of San Diego</span></div><div class="button-row"><a class="button button-primary" href="mailto:blpatnaik31@gmail.com">Get in touch <span aria-hidden="true">↗</span></a><a class="button" href="https://blpatnaik31.github.io/tpm/">TPM portfolio <span aria-hidden="true">→</span></a><a class="button" href="https://blpatnaik31.github.io/fde/">FDE portfolio <span aria-hidden="true">→</span></a></div></div><div><span class="eyebrow">Competencies</span><h2>What I architect.</h2>${tagList(["Multi-agent & AI-assisted design", "Service decomposition", "Human-in-the-loop governance", "Deterministic vs model boundaries", "CI/CD & stage isolation", "Data & quality-measurement design", "Integration & channel patterns", "RFCs, ADRs & risk registers"])}</div></div></section>`;
}

function renderNotFound() {
  main.innerHTML = `<section class="not-found container"><span class="eyebrow">404</span><h1>Named stop state: NO_ROUTE.</h1><p class="lede" style="margin-inline:auto">This page has no owner. Here is the way back.</p><div class="button-row" style="justify-content:center"><a class="button button-primary" href="#/">Return home</a></div></section>`;
}

function updateNav(page) {
  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    if (link.getAttribute("href") === `#/${page}`) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function render() {
  const parts = (window.location.hash.replace(/^#/, "") || "/").split("/").filter(Boolean);
  updateNav(parts[0] || "");
  if (parts[0] === "case-studies" && parts[1]) renderStudy(parts[1]);
  else if (parts[0] === "case-studies") renderStudies();
  else if (parts[0] === "decisions") renderDecisions();
  else if (parts[0] === "principles") renderPrinciples();
  else if (parts[0] === "about") renderAbout();
  else if (parts.length === 0) renderHome();
  else renderNotFound();
  main.focus({ preventScroll: true });
  window.scrollTo(0, 0);
  nav.classList.remove("is-open");
  document.querySelector(".menu-toggle")?.setAttribute("aria-expanded", "false");
}

document.querySelector(".menu-toggle").addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  document.querySelector(".menu-toggle").setAttribute("aria-expanded", String(open));
});
window.addEventListener("hashchange", render);
render();
