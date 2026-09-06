---
name: audit
description: Use when someone asks to audit their AIOS, score the Four Cs, find stale paths or unlinked projects, compare AGENTS.md and CLAUDE.md, check Claude/Codex skill compatibility, or assess migration readiness. Automatically saves dated reports and tracks evidence-backed improvements across runs.
---

# AIOS Audit

Check whether this AIOS can find the right information and do useful work reliably, and identify changes that would make the user's work easier. Score **Context, Connections, Capabilities, and Cadence out of 25 each**, using [rubric.md](rubric.md). This is rubric **v2**. Label the number **verified operational reliability**, not overall usefulness or percentage of work the AIOS can do. A folder, installed skill, API key, or confident claim is not proof of a working system.

Run locally in the current project. Do not launch subagents unless the user requests them. Audit first; `/link` repairs a route, and `/level-up` helps close one meaningful gap. Never inflate or deliberately depress a score to encourage another run. Improvement comes from better evidence and behavior.

**Every audit automatically saves its report in the audited project's `audits/` folder.** Read [history.md](history.md) for prior-report selection, finding transitions, comparison rules, and safe persistence. Saving the local audit record is part of this skill, not a separate approval step. An explicit user request not to save overrides this default. The inspected system remains unchanged.

## 1. Establish scope and evidence

- Get the current date and project root. Read applicable `AGENTS.md`, `CLAUDE.md`, and local overrides; follow the runtime's instruction hierarchy. Read both manuals when both exist. Check for conflicting routing and promised synchronization, without assuming distinct runtime instructions must be identical.
- Load the relevant prior AIOS report and carried finding ledger using [history.md](history.md), before selecting probes. Recheck important prior findings alongside current priorities; do not assume earlier results remain true. Identify the comparison baseline and scope changes before scoring.
- Use the manual's routing rules first. Read its project and knowledge indexes before listing their immediate child folders. Inspect only relevant scoped manuals. Skip dependencies, caches, generated output, and archives unless a route points there or an archived/current ambiguity needs checking.
- Identify the user's role, main objective, current priorities, and up to three important workflows from actual context. Unfilled template placeholders do not count. Do not require business revenue data from someone whose work has no revenue function.
- Inspect the supported skill/agent registries, connection references, and actual scheduler configuration/run evidence. Accept scripts, MCPs, exports, local data, and equivalent mechanisms equally. Count inventories for orientation only.
- Record each finding as **verified**, **documented but unverified**, **missing**, **stale**, or **conflicting**, with a file/line, source URL, or dated run reference. File modification times and last-checked labels alone do not prove a successful refresh or execution.
- Start with targeted reads. If a time budget or local page limit prevents verification, mark it unverified and state coverage. Never award full points because there was no time to check. Do not claim an exhaustive audit from a sample.

## 2. Test routing and context retrieval

Make a compact map: **user need → manual/index → specific source → freshness rule**. Include applicable business context, people, priorities/commitments, original records, project deliverables, specialist knowledge bases, media/assets, and external systems. A generic folder or provider name is insufficient when it leaves the relevant source unclear.

Compare the maps with immediate folders to find important unindexed projects, outdated counts, broken paths, ambiguous aliases, duplicate sources of truth, and retired material presented as active. Distinguish confirmed gaps from folders whose relevance is unknown. Check whether supplied routes work from the current checkout, including references inside skills and generated mirrors where that runtime uses them.

Follow the declared routes for these five questions, adapted to the user's real work:

1. What does this person/business do, for whom, and what matters now?
2. Where is the authoritative current priority, commitment, or status, and how would I verify it?
3. Where is the latest deliverable and next step for an important active project?
4. Where is a previous decision, lesson, or subject-specific knowledge item and its supporting source?
5. Where is one commonly needed external record, asset, or original document, and how is it accessed?

Select relevant examples before searching for answers. If a category does not apply, record why and substitute a different real retrieval need, keeping five probes. For each, show the question, route attempted, source, result, and whether it was found directly, only by fallback search, or not found. A broad search can recover an answer, but it does not prove the declared route works. Mark external access unverified if not checked; a documented access path earns only documentation credit. Score only the evidence actually observed.

**Check freshness and authority explicitly:**

- An optional `_hot.md`, briefing, or cache earns no points just for existing. Do not recommend creating one by default. Check whether it duplicates canonical pages, has a real refresh mechanism, and presents stale numbers or past deadlines as current. A recently edited header does not refresh every fact inside it.
- If a cache adds duplication without reliable upkeep, recommend bypassing it in retrieval and using the relevant index/source directly. Never automatically remove it. No cache is a valid architecture.
- Stable context can live in a wiki; current metrics and task status should resolve to the appropriate live system or dated export. Exact terms should resolve to original records. Check source dates and flag conflicts rather than treating the wiki as automatically authoritative for every type of fact.
- Check whether a fresh session could understand the user, resume the selected project, and find evidence without depending on this conversation. Praise compact, accurate routing; do not reward manual length, exhaustive root catalogs, or reading every wiki page.

## 3. Verify the other three Cs

First run the required [routing and cross-runtime compatibility checks](compatibility.md). This covers stale/broken paths, important unlinked work, differences between operating manuals, and skill availability across the runtimes in use or targeted for migration. Compare shared behavior and required resources, not raw file equality alone. Record expected runtime differences separately from defects. The protocol also defines the mandatory compatibility table, evidence labels, and calibration cases.

**Connections:** Identify applicable domains: finances, customer interactions, calendar, communication, tasks, meetings, and knowledge/files; add content or specialist domains when material. Record each domain's relevance, mechanism, specific access route, successful-read evidence, date, and limitations. One tool may cover multiple domains only when each has evidence. A configured MCP or `.env` key does not establish authentication. Use narrow, safe read-only checks when available, or dated successful-run evidence within the source's expected refresh interval. With no documented interval, use 30 days and explain why highly volatile data may require a fresh read. Do not print secret values or bulk private records. Do not run unknown scripts before checking their side effects.

**Capabilities:** Select up to three workflows tied to the identified priorities, not merely the most polished demos. Examine triggers, inputs, output destination, examples of actual usable outputs, verification, failure handling, and repeated use. Missing workflows remain gaps. Check discoverability, needed supporting files, and canonical/mirror consistency after documented transforms. Agents are optional; quantity, complexity, and custom naming earn no bonus. Use existing outputs or safe bounded checks; do not start paid generation or substantive work just to audit it.

**Cadence:** Inspect actual enabled schedules, event triggers, hooks, or explicitly defined human-run rituals and their execution records. Identify the host/runtime, trigger, expected output, last due execution, success/failure evidence, and stop/recovery controls. A skill named `daily-*`, a template, or recently edited files does not establish cadence. A useful manual ritual gets limited credit; label it manual. Do not call a local job unattended or laptop-independent without evidence for that environment. Judge monthly or quarterly routines against their real due dates rather than a fixed weekly window.

## 4. Score and prioritize

Read the complete [rubric.md](rubric.md). Assign all 20 criterion scores, then apply its caps. Show the four subtotals, raw sum, any cap and reason, final score, and stage. Missing evidence earns no verified credit, but distinguish **unverified** from **known broken**. Record excluded domains with reasons; do not exclude a domain merely because it is disconnected.

Rank gaps by likely effect on the user's work, with wrong/stale answers and missing source access ahead of cosmetic tidiness. Give up to three concrete fixes with an exact affected route/workflow, supporting evidence, and a clear completion check. Do not invent three faults in a healthy system. Distinguish a repair from a check needed to resolve uncertainty.

Group findings into **confirmed defects**, **verification gaps**, and **improvement opportunities**; list intentional differences separately. Keep severity distinct from confidence. Assign each underlying issue a stable ID and reuse it across sections. Do not count one missing mirror or bad route as multiple independent defects. State which existing rubric criteria it affects; do not introduce a migration score or change the v2 anchors. Explain score limitations, including manual-cadence limits when relevant. Unchecked evidence is not proof of failure, and optional enhancements are not defects merely because they are absent.

## 5. Return a concise, reviewable report

Use this structure, keeping the evidence ledger compact:

1. **AIOS Audit: date, project, rubric v2.** Scope, runtimes, verification limits, and a plain-language conclusion. Lead with what works and the most consequential mismatch. Report unique finding counts by class, not as an exhaustive total outside the inspected scope.
2. **AGENTS.md / CLAUDE.md findings:** always include the dedicated section specified below, even when no issues are found. Do not bury operating-manual findings in the general fixes or routing table.
3. **Routing and migration compatibility:** the coverage/matrix and actionable findings from [compatibility.md](compatibility.md), including confirmed defects, verification gaps, intentional differences, and improvement opportunities. Reference existing finding IDs instead of repeating full manual findings. State whether sampled migration is blocked, needs verification, or passed the inspected checks; do not imply the whole system is portable from a sample.
4. **Routing check:** five probe results, including source references and direct/fallback/unresolved status.
5. **What works:** up to three evidence-backed strengths.
6. **Verified operational reliability:** four rows, each `/25`; raw total, caps, final `/100`, and stage. Include criterion IDs and awarded points so arithmetic is reproducible. Explain separately how confirmed defects and unverified evidence limited credit. This is not an overall usefulness grade.
7. **Top improvements:** up to three ranked actions, each labeled repair, verify, or optional improvement, with evidence, exact next action, expected practical benefit, and what would prove it complete. Refer to finding IDs instead of repeating them in full.
8. **Progress since the previous audit:** link the baseline, show finding transitions and evidence from [history.md](history.md), and explain any comparable score change. Separate actual repairs, newly verified evidence, regressions, and coverage/rubric changes. No prior comparable report means a new baseline, not an invented improvement.
9. **Next run:** a ready-to-use `/level-up` prompt carrying the highest-value gap, evidence, and acceptance check; use `/link <target> <purpose>` for a routing-only fix. Recommend these commands only if installed; otherwise give the equivalent plain-language task. `/grill-me`, if available, is useful for genuinely missing context, not for facts already stored elsewhere.
10. **Saved record:** write and read back the complete report using [templates/report.md](templates/report.md). Link the actual saved file in the final reply. The chat can be concise; the saved record must retain the score breakdown, evidence, compatibility checks, and carried finding ledger. Never say saved without confirming it.

### Required section: AGENTS.md / CLAUDE.md findings

Start by naming the exact root manuals inspected and the scoped manuals sampled. Mark each root manual **checked**, **missing**, or **not checked**, with a reason where needed. State whether their shared guidance agrees, conflicts, or intentionally differs. Do not imply that inspecting one file verifies the other; a setup with only one applicable manual does not need a duplicate merely to pass.

Then show a compact findings table:

| File and section/line | Rule or missing route | Finding and practical effect | Recommended change |
|---|---|---|---|
| Exact clickable file reference | Short quote or precise paraphrase; label omissions explicitly | What was verified, stale, conflicting, broken, or unverified, and how that affects finding or using information | Specific edit or verification step |

Separate **problems in the manual itself** from **problems in files it routes to**. For example, a stale target index is a downstream maintenance gap unless the manual also directs readers to the wrong index. Name the downstream file and the route that reaches it. Include one brief statement about what the manuals already do well. If no issues are found, explicitly say "No operating-manual issues found in the inspected scope" and state any coverage limits; do not invent findings to fill the table.

Finish the section with whether any manuals were changed. In a standard read-only audit, say **"No operating manuals were changed."** These findings inform the existing Four-Cs criteria and caps; do not add a fifth score or double-count deductions. Apply this section to both chat reports and saved reports.

Recommend rerunning `/audit` after the selected fix and weekly during active setup, then at a sensible maintenance interval. Compare with a previous saved report only when scope and rubric match; v1 scores need a new baseline. Scores can decrease when evidence becomes stale. Do not promise a higher score from another run alone.

The audit is read-only toward inspected systems: no repairs, file moves, installation, scheduler changes, messages, or external writes. Its sole default write is a new local audit report under `audits/` (create the directory if needed). Preserve earlier reports, redact secrets and unnecessary private records, and do not update business memory or source-of-truth files from audit observations. On an incomplete run, save a clearly marked partial report when possible; do not present it as a completed audit or fabricate a score. If saving fails, report that explicitly and return the report in chat.
