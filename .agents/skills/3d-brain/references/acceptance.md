# Acceptance checklist

Package checks: run `node <skill-directory>/scripts/test-package.mjs`. It builds a separate fictional AIOS, scaffolds the app, checks personalized data and source links, verifies the read-only server and path boundaries, and checks the real growth modules. It never uses the author's private notes.

For an actual skill run, retain a small local verification report beside the generated app. Do not include its private graph or screenshots in the public skill.

- [ ] Exact chosen name appears in document title, header, splash, and demo caption.
- [ ] Categories reflect approved folders; notices identify missing/unsupported data.
- [ ] All node IDs are unique; all edges have existing endpoints; duplicate basenames stay distinct.
- [ ] Sample note readback matches originals, including Codex topic boundaries.
- [ ] Search, solo filter, restore, and inventory work.
- [ ] At growth start, a single node and the central orb appear, followed by the first real edge.
- [ ] Mid-growth shows branching and increasing counts; no old label is stranded in the center.
- [ ] Drag, zoom, and background/node clicks preserve active growth.
- [ ] Completion reaches the real visible-node count; all final positions match the globe; Replay starts cleanly.
- [ ] Cinema, pause/resume, reduced-motion behavior, and narrow layout work.
- [ ] Console errors are checked; the server is loopback only; arbitrary filesystem paths are not exposed.
- [ ] Public package contains only runtime/template files and fictional fixtures, not personal data.

If a capability cannot be verified on the available host, report that exact limitation. Do not substitute implementer confidence for a browser check.
