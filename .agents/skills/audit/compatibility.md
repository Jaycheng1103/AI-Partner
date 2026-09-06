# Routing and cross-runtime compatibility

Required for every audit. Keep checks bounded and read-only. Inspect the runtimes actually used or explicitly targeted for migration; a single-runtime project does not need duplicate installations to pass. Treat a potential future migration as an optional opportunity unless requested. Never install, synchronize, rename, or run project workflows merely to audit them.

## 1. Establish the comparison contract

- Read applicable manuals, scoped overrides, bridge documentation, and sync configuration. Identify the canonical source, generated copies, intentional independent implementations, and declared sharing rules. Do not assume the newest file or the Claude copy is authoritative.
- Inventory actual project skill locations, including `.claude/skills`, `.agents/skills`, and `.codex/skills` when present or referenced. A literal `.agent/skills` directory is a candidate typo/custom location, not automatically a discovered skill root. Verify it against the installed runtime.
- Include relevant user-level roots, linked directories, runtime overrides, and duplicate names when available through discovery/configuration. Do not crawl unrelated personal files or expose configuration secrets. If user-level discovery is unavailable, report that limit.
- Establish discovery and precedence using the installed runtime's read-only listing/configuration, or current official documentation if needed. Folder presence alone proves neither availability nor precedence. Record the runtime/version when available. Do not assume every listed location works in every version.
- Report scope numerically: manuals read, roots inventoried, skills compared, skills whose discovery was checked, resources checked, and workflows exercised. State what was sampled or omitted. A metadata check is not an execution test.

## 2. Compare operating instructions

1. Compare root `AGENTS.md` and `CLAUDE.md` when present, then sampled scoped overrides. Compare purpose, user preferences, source authority, routes, output locations, permissions, and workflow instructions.
2. Classify each meaningful difference as shared guidance that agrees, an intentional runtime adaptation, a confirmed conflict/omission, or an unresolved difference. Whitespace and line endings are not behavioral conflicts. Enforce exact synchronization only when the project explicitly promises it; report harmless formatting drift as such.
3. A missing manual is a migration defect only if the target runtime consequently lacks required guidance and no verified bridge/equivalent supplies it. Do not demand duplicate manuals from a single-runtime setup.
4. Show both file/line references, the differing rules, the runtime affected, and the likely behavior. For omissions, cite the source rule plus the inspected destination section/file. Never invent a destination line for absent text.
5. Check that bridges preserve shared instructions without pretending unsupported runtime-specific fields or tools are enforced. Different model/tool names may be valid adaptations; losing an approval boundary or source route is substantive.

## 3. Check routes in both directions

- **Route to target:** resolve concrete paths from the correct base (repository, containing file, declared working directory, user home, or separate host). Verify existence and intended destination. Distinguish concrete references from placeholders, examples, globs, URLs, and remote-host paths. A remote path unavailable locally is unverified, not automatically broken.
- **Important target to route:** compare the relevant indexes/manuals with immediate project, knowledge, and skill inventories. Follow index chains; a nested project can be properly routed without a direct root-manual link. Identify useful active material with no usable entry route, using evidence of its relevance. An unclassified folder is a candidate for review, not automatically an orphan.
- Check obsolete usernames, moved folders, platform-specific absolute paths, wrong folder spelling/case where material, stale aliases/counts, archived material shown as active, and links pointing at the wrong valid destination. An existing path can still be wrong.
- Do not flag every unlinked file. Scratch, generated files, dependencies, archives, and intentionally private/specialist material may be correctly excluded. Distinguish stale factual content from an old file whose contents remain accurate.

## 4. Compare skill packages and actual availability

Match skills by declared identity, purpose, and documented aliases, not folder name alone. Inventory broadly by metadata, then inspect required resources for the selected workflows and any suspected mismatch.

1. **Presence:** required source/target copy or intentional runtime-specific scope.
2. **Content:** shared workflow steps, inputs, outputs, boundaries, and behavior. For declared mirrors, compare after only documented transforms. Never blanket-strip runtime text or path differences to manufacture a match.
3. **Resources:** required scripts, templates, examples, assets, dependency instructions, and agent references resolve from the target environment. Include extra obsolete mirror files as potential drift; a source-to-target-only comparison misses these. Broken symlinks and targets outside the checkout need explicit evidence.
4. **Discovery:** distinguish present on disk, runtime-listed, disabled, and not checked. Detect duplicate identities across project/user roots and determine effective resolution where supported. Report ambiguity if precedence cannot be verified. Do not assume presence in a menu means successful execution.
5. **Behavior:** check incompatible tool calls, unsupported instructions, wrong working directories, platform commands, missing environment-variable names without revealing values, and undocumented dependencies. Use safe existing evidence for actual execution; leave paid, posting, or other side-effecting workflows untested in a read-only audit.

## 5. Communicate the result

Use these finding classes:

- **Confirmed defect:** evidence shows a missing required route/resource, conflicting instruction, broken path, or unavailable required skill.
- **Verification gap:** discovery, remote access, intent, or execution was not established. State the smallest check that would resolve it.
- **Intentional difference:** a documented and appropriate runtime adaptation. No repair needed.
- **Improvement opportunity:** a useful simplification or extension without a demonstrated failure. Explain the benefit without calling it broken.

Show a compact compatibility matrix, using actual paths/runtime names:

| Item | Claude evidence | Codex evidence | Finding / ID | Practical consequence |
|---|---|---|---|---|
| Shared operating guidance | File/section | File/section or verified bridge | Agrees / intentional difference / conflict / not checked | What changes for the user |
| Sampled skill | Canonical/package status | Mirror/discovery status | Equivalent / missing / drift / disabled / not checked | What works or fails after switching |
| Required resource or route | Resolved source | Resolved target | Valid / broken / unlinked / not checked | Effect on retrieval or execution |

Follow with only actionable findings, grouped by class:

| ID / class / priority | Evidence and affected runtime | User impact | Proposed change or verification | Completion check |
|---|---|---|---|---|
| Stable ID; repair, verify, or opportunity | Exact file/line pairs or dated runtime result | Concrete failure or uncertainty | Canonical edit/sync/route addition/read-only check | Observable result |

Prioritize wrong answers, lost instructions, unavailable workflows, and unsafe permission drift over cosmetic differences. Use one ID for an underlying issue across manual, routing, and skill sections. Do not hide a confirmed lower-priority defect because only three actions are recommended.

Conclude **blocked in the sampled migration** only for a confirmed defect that prevents a required migrated behavior; **needs verification** for unresolved evidence or a nonblocking confirmed mismatch; **passed inspected checks** when the stated checks passed without unresolved applicable findings. Optional opportunities do not block a pass. Always name unchecked execution/coverage. No fifth score, no migration percentage, no score bonus for duplicate files. No automatic repairs.

## Calibration cases

- Manuals share all rules but use different supported tool names: intentional adaptation, no conflict.
- Project explicitly promises identical manuals; only newline encoding differs: formatting-only, not a behavioral blocker.
- A shared permission rule exists only in the source manual, with no target bridge: confirmed omission; cite the source and inspected destination.
- A single-runtime project has one manual and skill tree: no missing-copy penalty.
- A requested target runtime lists a same-name skill through a verified user-level installation: not missing solely because its project mirror is absent; inspect the effective package.
- A mirror matches the documented path rewrite but lacks a required template: confirmed package defect despite matching SKILL.md.
- Duplicate project/user skills exist but effective precedence is unknown: ambiguity/verification gap, not an assumed overwrite.
- A referenced remote host is unavailable during inspection: verification gap, not a broken local path.
- A relevant project is reachable through a domain index: routed; scratch with no incoming link is not a defect.
- A skill is listed and enabled but was not run: discovery verified, execution unverified.
