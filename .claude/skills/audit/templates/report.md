---
audit_kind: aios
history_schema: 1
run_id: "<UTC timestamp and random suffix>"
started_at: "<ISO-8601 UTC>"
completed_at: "<ISO-8601 UTC>"
project_root: "<absolute audited root; use forward slashes in YAML paths>"
project_identity: "<verified project identity, without credentials>"
report_status: complete
rubric_version: v2
previous_reports: []
score_baseline: null
scores_comparable: false
scores:
  context: null
  connections: null
  capabilities: null
  cadence: null
  raw_total: null
  final: null
---

# AIOS Audit: <project and date>

## Conclusion and scope

<What works, most consequential mismatch, inspected runtimes/workflows/domains/probes, counts, exclusions, and verification limits. Mark partial runs explicitly.>

## AGENTS.md / CLAUDE.md findings

<Exact checked/missing/not-checked manuals, shared guidance comparison, finding IDs and file references, scoped coverage, and whether manuals changed.>

## Routing and migration compatibility

<Compatibility matrix and unique findings grouped by confirmed defect, verification gap, intentional difference, and improvement opportunity. Include source/target evidence and discovery versus execution coverage.>

## Routing probes

<Five selected questions, attempted routes, sources, and direct/fallback/unresolved results.>

## What works

<Up to three evidenced strengths.>

## Verified operational reliability

<All 20 criterion IDs and awarded points, four subtotals, raw total, caps with reasons, final score, and stage. Distinguish defects from unverified evidence. This measures verified operational reliability, not overall usefulness. Partial/unscored entries remain null.>

## Progress since the previous audit

<Clickable previous-report links and score baseline, or first recorded baseline. Show transitions, actual repairs versus evidence-only gains, regressions, and coverage/rubric changes. Include comparable score arithmetic only when justified.>

## Finding ledger

| ID | Class | Target / runtime | First seen | Prior status | Current status | Last verified date / state | Evidence | Completion check |
|---|---|---|---|---|---|---|---|---|

<Populate current findings plus all carried findings, including not-rechecked items and compact prior closures. No findings is valid when supported by inspected scope.>

## Top improvements and next run

<Up to three prioritized repair/verify/optional actions with benefit, finding IDs, and acceptance checks. Include a scoped next-run prompt and unresolved verification limits.>
