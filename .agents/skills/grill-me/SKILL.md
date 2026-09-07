---
name: grill-me
description: Interview the user relentlessly about a plan, design, or topic, checkpointing every answer to a brainstorm file so nothing is lost. Use when the user wants to stress-test a plan, get grilled on a design, run a brainstorm or discovery session, extract what's in their head into a doc, build up their AI OS context over time, or says "grill me".
---

# Grill Me

Relentlessly interview the user about every aspect of the topic until you reach shared understanding. Walk down each branch of the decision tree, resolving dependencies one by one. The real goal is to **extract what's in their head into a durable, organized markdown file** so nothing is lost as context fills up.

## The capture file is the whole point

Long interviews fill up context. If you hold answers only in your head, you will eventually misremember, conflate, or drop something. So you **checkpoint to disk after every single answer**. The file, not your context, is the source of truth. Never make the user ask you to save progress.

## Existing context and scope

Read the applicable `AGENTS.md` and `CLAUDE.md`, then only the context pages and prior captures relevant to the topic. Starter-kit context lives in `context/`, but follow an established project's declared routes instead of creating a duplicate knowledge store. Reuse facts already supplied; ask about gaps, changes, decisions, and tradeoffs. Installing the skill does not start an interview.

## Setup (do this BEFORE the first question)

1. **Create the capture file** at `brainstorms/{YYYY-MM-DD}-{topic-slug}.md` (create the `brainstorms/` folder if it doesn't exist). Every brainstorm capture lives here. One predictable home, regardless of topic. Do NOT scatter captures into project folders. If a session later produces a polished deliverable (a plan, a map, a spec), that artifact can move into the relevant `projects/` folder, but the raw capture always stays in `brainstorms/`.
   - Get today's actual date using the available clock or shell (`Get-Date -Format yyyy-MM-dd` in PowerShell, `date +%F` in Bash).
   - Never overwrite an existing capture. For a new session with the same date/topic, add a time or unique suffix and create exclusively. Resume an existing capture only when the user requests or clearly refers to that session; read it first and continue its question numbering.
   - If no topic is supplied or inferable, create an `untitled-discovery` capture with goal pending, then ask what to explore. Record the chosen topic and goal in that same file.
2. **Create the file immediately** with a header: title, date, the goal of the session, and an empty "Open flags" section.
3. **Tell the user where you're saving**, in one line. Then ask Q1.

## The checkpoint rule (non-negotiable)

After EVERY user answer, BEFORE you ask the next question:
- Append a structured entry to the capture file: the question topic, the key facts and decisions from their answer (in their words where the wording matters), and any flags (things they couldn't answer plus who should).
- Update the running summary when a later answer changes it. Preserve the original Q&A entry, mark it superseded, and link to the correcting answer so the reasoning remains traceable.
- Read back the saved entry before continuing. If saving fails, explain the failure and keep the answer visible in chat; do not claim it was saved or continue collecting answers without a working checkpoint.
- Only then ask the next question.

Never batch multiple answers into one write. Checkpoint one answer at a time. The point is that if context is lost at any moment, the file already holds everything said so far.

## Interview method

- Ask **one question at a time**. For decisions, provide a suggested answer grounded in context and label it as a suggestion. For personal or business facts, ask neutrally; do not lead the user with invented facts or save your inference as their answer.
- Keep user-confirmed facts, tentative ideas, assistant suggestions, and unresolved questions distinguishable in the capture.
- Resolve dependencies in order: settle the upstream decision before the ones that depend on it.
- If a question can be answered by **exploring the codebase or reading a file/doc**, do that instead of asking. If the user hands you a doc (e.g. a Google Doc), read it and only surface what's net-new.
- When the user **can't answer** something, capture it as a flag with the right owner and move on. Don't stall.
- Keep going until the user says you're done, needs a pause, or you've covered the useful branches. Respect an explicit stop immediately; do not add a new question. Offer a completeness backstop near the end ("anything we haven't touched?").

## Capture file structure

```
# {Topic}: Brainstorm / Discovery Notes
Date: {date} · Goal: {one line}
Status: in progress / paused / complete
Context sources: {relevant existing pages, if any}

## Summary / key decisions
(running synthesis, updated as you go)

## Q&A log
### Q1 - {topic}
- Asked: {question}
- Captured: {user-confirmed facts, decisions, in their words where it matters}
- Tentative / suggested: {unconfirmed ideas, clearly labeled}
- Flags: {open item -> owner}
...

## Open flags (pending input)
- {item} -> {who can answer}
```

## At the end or on pause
- Read the capture for contradictions or gaps. Mark unresolved conflicts explicitly; do not choose a business fact on the user's behalf. Update the session status and resume point.
- For sessions explicitly about building or updating AI OS context, merge user-confirmed durable facts and preferences into the appropriate existing context page, with a dated link back to the capture. Preserve unrelated content. Record confirmed meaningful decisions in the existing decision log without duplicating entries. Unknowns, brainstorm ideas, and assistant suggestions stay labeled in the capture until confirmed.
- For a plan/design interview without a request to update canonical context, keep the raw capture as the output. Suggest `/link` for routing a useful result, or `/level-up` for turning a selected opportunity into one improvement. Do not run either automatically.
- Ensure the operating manual or an existing index routes to `brainstorms/` when capture routing is absent, using the project's conventions and preserving shared manual parity. Individual captures do not each need a root-manual entry. Raw captures are dated interview evidence, not automatically current business truth.
- Give a short recap with a clickable capture path, context pages actually updated, remaining flags, and the next step or resume point.

## Boundaries and verification

- Local interview capture and requested context updates are the scope. No global-memory edits, publication, messages, or external-system changes. Do not request or save credentials; use references or redactions for secrets.
- The starter kit ignores `brainstorms/` in Git by default. This does not remove captures already tracked in an existing repository.
- Validate a fresh session, same-day name collision, resume, a correcting answer, a stop request, and a failed write. Verify that only confirmed facts reach canonical context and that earlier answers remain traceable.
