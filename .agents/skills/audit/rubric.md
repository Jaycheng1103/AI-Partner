# Four Cs rubric v2

## Scoring rules

There are five criteria per C, each worth 5 points. Use **0, 1, 3, or 5 only**: select the highest anchor fully supported by evidence. **0** means absent, contradicted, or not evidenced at even the 1-point level. Higher anchors retain the substantive checks below them; numerical coverage bands (such as N1) are alternatives, not simultaneous requirements. Never interpolate, start with full points and deduct, award points for irrelevant infrastructure, or replace missing evidence with optimism.

For multi-part anchors, all parts are required. A bounded sample can establish the stated sample criterion, but does not prove whole-system coverage. Name the sample and unresolved scope. If no relevant workflows or connections can be identified, those evidence-dependent criteria are 0, not vacuously complete. Documentation may earn 1 where specified; it is not a working result.

## Context: can a fresh session understand and retrieve? (25)

| ID | Criterion | 1 point | 3 points | 5 points |
|---|---|---|---|---|
| C1 | Personalized operating context | Non-placeholder identity and purpose exist | Identity, audience/stakeholders, priorities, and collaboration preferences have specific usable sources | All of those are consistent across the sampled current sources, with meaningful priorities and clear completion expectations |
| C2 | Routing and findability | A manual or equivalent gives at least one specific usable route | At least 3 of the 5 probes succeed through declared routes, and the important project/knowledge indexes exist where needed | All 5 succeed through declared routes; immediate-folder comparison finds no unexplained important omissions or broken sampled routes |
| C3 | Freshness | Changing facts have source/as-of dates | Sampled changing facts have appropriate refresh rules and current evidence, or are explicitly historical with a working current-source route | All sampled current facts are verified within their expected interval; optional caches are consistent, maintained, and optional, or absent |
| C4 | Source authority | At least one canonical source is identified | Rules distinguish stable context, current status/metrics, and original records; sampled claims link to supporting sources | All sampled authority chains resolve; duplicates have explicit roles, and no unresolved material source/manual conflicts remain |
| C5 | Continuity | An actual decision or project-state record exists | The sampled active project has a current deliverable, decision rationale, and next step accessible from its entry point | A second relevant project or knowledge thread can also be resumed from durable records, with current status and useful source links |

A hot cache, particular wiki layout, memory folder, long manual, or extra project count is not required. For a genuinely single-project setup, C5's second thread can be a distinct prior decision within that project.

## Connections: can it reach the information it needs? (25)

Inventory applicable domains before scoring. Mark irrelevant domains with a reason grounded in the user's role/context. Do not reward connecting tools the user does not need.

| ID | Criterion | 1 point | 3 points | 5 points |
|---|---|---|---|---|
| N1 | Relevant domain access | At least one relevant domain has successful-read evidence, but fewer than half do | At least half, but not all, applicable domains have successful-read evidence | Every applicable domain has successful-read evidence within its expected interval |
| N2 | Useful retrieval | A specific query and expected answer are documented | One actual priority-related query returns the right record, date range, and source | Two distinct priority-related queries return adequate results, with pagination/completeness or documented export limits checked |
| N3 | Reproducible access routes | One connection has a tool/script path and purpose documented | All applicable domains have a documented route or explicit missing-connection status, and connected routes include safe auth instructions and query examples | The documented sampled access route is successfully reproduced without relying on hidden chat context; all connected domains have usable guides |
| N4 | Appropriate action boundaries | Required read/write scopes and approval boundaries are documented | For a needed write workflow, a prior authorized successful write or faithful sandbox result is recorded; alternatively, the user's deliberately read-only scope is documented and verified | Sampled operations respect intended permissions and have verified failure/duplicate safeguards; do not perform a live write just to earn points |
| N5 | Freshness and failure visibility | Source timestamps and freshness expectations are documented | Sampled reads/exports are within those expectations and failures are surfaced rather than replaced by unlabeled old data | Every applicable domain has recent success evidence plus demonstrated expired-auth/stale-data handling for at least one representative connection |

N1: if there is exactly one applicable domain, its successful read meets the 5-point coverage anchor, not the other criteria automatically. Local files and exports can satisfy relevant domains when they are the real source and sufficiently current. No hidden bonus for MCPs, API keys, provider count, or write access the user does not need.

## Capabilities: do relevant workflows produce usable results? (25)

Use up to three priority workflows chosen before inspecting their outputs. If only one exists, assess it honestly; do not require unnecessary skills. If an identified priority needs a missing workflow, retain that gap in the sample.

| ID | Criterion | 1 point | 3 points | 5 points |
|---|---|---|---|---|
| P1 | Fit and invocation | A workflow has a clear trigger tied to a stated need | One sampled workflow has a successful invocation with the intended inputs | All sampled priority workflows have successful invocation evidence, with clear boundaries between overlapping triggers |
| P2 | Output quality | An example output and acceptance criteria exist | One actual output was checked against meaningful acceptance criteria | All sampled workflows have usable outputs verified against their acceptance criteria, not merely self-reported completion |
| P3 | Failure handling | Expected missing-input/error cases and side effects are documented | At least one relevant missing-input, stale-source, or dependency-failure case was tested and handled correctly | Every sampled workflow has a relevant boundary-case result and respects authorization/side-effect limits |
| P4 | Portability and discoverability | Required files/dependencies and invocation route are documented | Sampled entry points, references, and runtime registrations resolve; generated mirrors match required transforms where used | A recorded clean-session or equivalent isolated run reproduces the sampled workflow without hidden conversation state or undocumented dependencies |
| P5 | Repeated useful use | At least one dated real use is evidenced | One sampled workflow has two distinct successful real uses with output references | All sampled workflows have repeated successful real uses; corrections are reflected in the current workflow with subsequent validation |

Skill/agent count and file recency score zero by themselves. A deterministic script or simple prompt can score as highly as a complex agent. A newly created skill cannot prove repeated real use by running synthetic tests twice.

## Cadence: does useful work happen reliably over time? (25)

Use actual schedules and expected due times. A manually invoked ritual is useful but is not unattended execution. Configuration alone does not establish a successful run.

| ID | Criterion | 1 point | 3 points | 5 points |
|---|---|---|---|---|
| D1 | Real trigger | An explicit human ritual or actual scheduler/trigger configuration exists | At least one enabled trigger has a verified runtime/host and expected output | That trigger has demonstrably run in its intended unattended environment, including runtime availability requirements |
| D2 | Due executions | A dated manual completion or incomplete/failed automatic attempt is recorded | One due automatic execution completed with its expected output | At least two distinct due automatic executions completed; no unexplained missed due runs remain in the inspected period |
| D3 | Observability | Run status/logging and failure-notification behavior are documented | Inspected executions have durable timestamps, outcomes, and a verified failure-reporting path | A real or safely simulated failure reached the intended reporting mechanism, and recovery is evidenced |
| D4 | Control and recovery | Stop/disable, ownership, permissions, and recovery instructions exist | Configuration confirms those controls plus protection against inappropriate duplicate/overlapping actions | A prior or safe isolated test demonstrates stop/recovery and duplicate prevention without unintended side effects |
| D5 | Maintenance loop | Review frequency and freshness/cleanup responsibilities are defined | One completed review repaired a real issue or verified no action was needed, with evidence | Two distinct scheduled review cycles are recorded, with follow-up verification of any fixes and maintained routing/context |

Do not trigger jobs, change schedules, send test alerts, or disable automation during a read-only audit. Use prior evidence or label the test unverified. A manual-only system has a maximum **10/25 for Cadence**, even if its review discipline is strong. A newly enabled routine must wait for due-run evidence; back-to-back manual test runs are not two due executions.

## Gates and stages

1. Sum criterion points within each C. If the five retrieval probes cannot recover either the user's main purpose or any authoritative priority/status source, **Context is capped at 10**. Show its raw subtotal and the cap.
2. Apply the manual-only Cadence cap of 10 when no enabled automatic trigger is verified. This includes a system with no triggers at all; the cap never awards points.
3. Sum the four resulting C subtotals as the **raw total**.
4. Apply every relevant total cap; the lowest wins:
   - Any C below 10: total capped at **49**.
   - Any C below 15, or fewer than two verified due automatic successes: total capped at **69**.
   - Any C below 20, or a material unresolved routing/source-authority conflict: total capped at **84**.
5. Final score = min(raw total, applicable caps). Report each applied cap and why; never silently alter arithmetic.

| Final score | Stage |
|---|---|
| 0-24 | Unproven |
| 25-49 | Foundation |
| 50-69 | Working, with gaps |
| 70-84 | Dependable in the verified scope |
| 85-100 | Maintained and evidenced |

Never label a high score universally autonomous, safe, or complete. State what was sampled. Unknown evidence is a verification gap, not proof that a system is broken. These gates intentionally prevent a large skill library from compensating for absent connections or cadence.

## Calibration checks

- Fresh template, named daily skills, API keys, and recent file timestamps: no execution/output/domain-access credit. A fresh clone should remain Unproven, not jump to 70+.
- Personalized manual, useful references, 60 skills, and 10 agents but no observed outputs or runs: presence cannot earn full Capabilities or Cadence.
- Excellent Context/Connections/Capabilities at 25 each and manual-only Cadence at 10: raw 85, final 69. No automatic success evidence means the 69 cap applies.
- All Cs at 21 with two due successes and no material conflicts: raw/final 84. At 23 each under the same conditions: raw/final 92.
- A stale required hot cache that contradicts a canonical source lowers freshness/authority credit and prevents a score above 84 until resolved. No hot cache incurs no penalty.
- A monthly routine with two evidenced due executions can earn repeat-run credit; a newly configured daily job with no executions cannot.
