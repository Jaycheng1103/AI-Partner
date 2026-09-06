# Automatic audit history

Read this at the start of every AIOS audit. The dated reports are the durable history; each new report carries the finding ledger forward. Do not maintain a separate editable score database or depend on this conversation. Writing reports does not schedule future audits or repair the inspected system.

## 1. Select prior evidence

1. Resolve the audited project's root and its existing `audits/` directory. Inspect report names and metadata first, not every audit's full contents. The folder may also contain cost, code, or security audits: these are not AIOS baselines.
2. Use `audit_kind: aios`, project identity, run timestamp, report status, rubric version, and coverage to select reports. For legacy reports without metadata, read their headings/scope and identify them explicitly as legacy; never guess scores, IDs, or dates from memory. Do not change historical files to match the new format.
3. Read the latest applicable report's ledger, plus the most recent complete comparable report if different. Start with at most two full reports. Follow older links only for unresolved identity/evidence or older comparable scope; note limits if that is not possible. Exclude fixture/example reports. Inspect overlapping/parallel runs when present so one branch's unresolved findings do not disappear.
4. Compare scores only for the same project, rubric, and materially equivalent scope: runtimes, domains, workflows, and retrieval probes. A moved checkout of the same project may qualify when identity is verified. Different projects, changed scoring anchors, narrower/broader samples, and partial reports do not support a simple score delta. Finding-level comparisons can still be valid where targets/checks match.
5. Record the previous report link(s) and separately the score baseline, if any. No eligible saved report means **first recorded baseline**. Do not treat any unsaved audit as freshly verified evidence. Historical imports require an explicit request and a clearly labeled source/date.

## 2. Maintain finding identity and status

Give each new underlying finding a stable ID such as `AIOS-<run-id>-01`. Preserve the original ID on later runs, matching by affected route/workflow, runtime, and failure mode. Record verified renames/moves instead of minting duplicate findings. If identity is ambiguous, explain it before merging. Class (defect, verification gap, opportunity, intentional difference), evidence confidence, and progress status are separate fields.

Carry the previous report's complete tracked ledger into the new report, including unresolved items outside today's sample and compact entries for previously closed items. Keep original first-seen and last-verified timestamps. An item omitted from the three recommended actions is not closed. Use these progress labels:

| Status | Evidence required |
|---|---|
| New | First observed in this history. Say newly detected, not newly introduced, unless prior evidence establishes the latter. |
| Still open | Rechecked and the defect/verification gap remains, or a tracked opportunity is confirmed pending. |
| Resolved | The original completion check passes with current evidence. A proposed edit, changed timestamp, installed copy, or self-reported success alone does not establish resolution. |
| Reopened | Previously resolved; the same failure is demonstrated again. Keep the ID and reference its prior closure. |
| Not rechecked | Not covered, inaccessible, or insufficient evidence today. Preserve last verified state; never imply resolution or a new failure. |
| No longer applicable | Explicitly changed requirements, retired workflow, or other evidenced scope change. Explain why; this is not a successful repair. |

A previously resolved finding not checked today is `Not rechecked` with last verified state `Resolved`, not a reopened defect. If a prior suspected defect is disproved or found intentional, record the correction and evidence in the new report; do not call it a repair or erase the old observation.

For each tracked finding record: ID, class, affected target/runtime, first seen, prior status, current status, last verified timestamp/state, evidence link(s), and completion check. The current state is always as of this run, not guaranteed live between audits.

## 3. Explain progress honestly

Use a compact transition table and short narrative:

| Finding ID | Prior state | This run | Evidence / practical change | Next check |
|---|---|---|---|---|
| Existing stable ID | Prior recorded state | One status above | Current evidence, or reason not rechecked | Original acceptance check or justified revision |

- Separate **actual fixes**, **newly verified evidence**, **regressions**, and **coverage or rubric changes**. More logs can justify more credit without any system improvement; a newly discovered defect may lower the score without a recent regression.
- For a valid score comparison, show prior/current four subtotals, raw totals, caps, and final totals. Explain which criterion evidence changed and any cap effect. Otherwise say **scores not directly comparable** and explain why; do not show a misleading delta or trend.
- Show unique finding counts by progress state, with rechecked versus carried-forward coverage. Treat no-longer-applicable and corrected classifications separately from verified repairs. Do not claim improvement merely because the score rose or the open count shrank.
- Prioritize the next checks by user impact, including important unresolved prior items. Do not rerun paid workflows, send alerts, or make repairs just to earn resolution credit.

## 4. Save every run safely

1. Use [the report template](templates/report.md). Generate a real UTC timestamp and collision-resistant run ID, for example a timestamp plus random suffix. Default filename: `audits/audit-YYYY-MM-DD-HHMMSS-<suffix>.md`, using UTC. Include timezone-aware timestamps and the exact audited root in metadata. These are local records, not public uploads.
2. Fill every required report section with actual evidence, or an explicit not-checked/partial explanation. Keep full criterion arithmetic, the current finding ledger, prior-report links, comparison limits, and proposed completion checks. Do not leave sample placeholders or invented results.
3. Create the file without overwriting an existing path; use exclusive creation or equivalent collision protection, retrying with a fresh suffix if necessary. Never silently replace an earlier same-day run. Preserve parallel runs. Do not rewrite historical reports when a later run resolves an issue; later reports document the transition.
4. Read back the saved report. Verify metadata, links to prior reports, score arithmetic, finding IDs/statuses, redaction, and that the saved content agrees with the reported result. Resolve relative links from the report's directory. Link the saved absolute file path in chat, with a concise progress summary.
5. If the audit stops early, save observed evidence as `report_status: partial`, with unavailable scores set to `null`, reasons, and unchecked findings carried forward. A partial run is not a full-score baseline. Unexpected process termination may prevent saving; never claim otherwise.
6. If the filesystem cannot be written, say **report not saved**, return the report in chat, and describe the specific blocker. Do not substitute a secret-bearing log dump, silently save elsewhere, or claim history was updated. An explicit user instruction not to save takes precedence; say **not saved at your request**.

The audited workspace remains unchanged apart from the new report and its directory. Do not add an audit entry to business memory, alter `decisions/log.md` on each audit, or update the manuals automatically. Existing reports are point-in-time evidence, never canonical current business facts.

## Calibration checks

- First run: one real report saved; no invented baseline, score delta, or repaired finding.
- Second run: original report unchanged; carry IDs forward; resolve only with passing evidence.
- Same-second or parallel runs: distinct filenames; neither replaces the other.
- Reduced scope: omitted prior findings remain visible as not rechecked; no automatic resolution.
- Scope/rubric change: finding transitions may be shown; whole-score improvement is not claimed.
- Previously resolved finding fails again: reopened with the original ID and current evidence.
- Permission failure or explicit no-save: no false saved confirmation.
- Partial report or fixture: never used as a completed score baseline.
