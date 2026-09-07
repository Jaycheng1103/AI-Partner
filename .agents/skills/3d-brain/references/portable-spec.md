# Portable 3D Brain specification

This package preserves a working application rather than relying on a prose-only recreation. The portable runtime has a configurable ingestion layer and the same spherical renderer, growth planner, orbital scene, and interaction behavior as the reference implementation.

## Files and contracts

- `assets/template/config.mjs`: validates names, category IDs, paths, colors, and limits.
- `assets/template/build.mjs`: reads only the selected local sources; creates graph nodes, evidence-based edges, health flags, inventory, and an internal file registry.
- `assets/template/serve.mjs`: zero-dependency Node server. Loopback only; static assets are allowlisted. Note IDs resolve through the file registry, never an arbitrary URL path.
- `assets/template/codex-memory.mjs`: read-only curated memory importer with exact topic section bounds.
- `assets/template/src/app.js`: search, graph interactions, source controls, drawers, sanitized note rendering, Cinema, and growth playback.
- `assets/template/src/constellation.js`: deterministic spherical placement, central orb, and restrained orbital accents.
- `assets/template/src/growth.js`: a spanning forest using only existing edges, limited branching per step, spring motion, and exact final positions.
- `assets/template/dist/app.js`: prebuilt renderer. No package installation is necessary to run the generated app.
- `scripts/discover.mjs`: lists candidate paths without reading their contents.
- `scripts/scaffold.mjs`: copies an explicit file allowlist into a new app folder, refuses replacement, and writes local config.

## Visual and interaction contract

Near-black space, one color per category, a spherical silhouette from every angle, a central wire orb, and two quiet orbital tracks. White particles accent selected paths; background links are sampled. Labels have collision detection and explicit cleanup when graph nodes are removed or rebuilt.

Growth begins with one node at the orb and the first real edge. New nodes spring from their actual parent nodes; a limited branching queue creates outward growth instead of a starburst from a single hub. Growth accelerates, finishes in roughly 29 seconds, restores every node to its deterministic globe position, and offers Replay. Disconnected components have independent roots.

Camera orbit and zoom continue to work during growth. User input takes over from the automatic pullback without stopping the timeline. The orb is present from frame one; the rings fade and expand in later. Cinema puts the counter beside the globe. Reduced-motion preferences produce a static completed state rather than forced motion.

The overview draws sampled paths. Selection shows up to 72 paths and 24 particle paths; full graph counts remain available in inventory. Default labels are limited to one hub per category and a small selected neighborhood. Mobile layouts retain filters through the Sources button.

## Data integrity and boundaries

IDs include category and file identity, so duplicate basenames do not collide. Wikilinks resolve only when unambiguous. Explicit file links take precedence over mention inference. Full-title mentions are labeled separately and are not claims of semantic certainty. The replay represents connectivity, never invented creation dates.

No bundled user content, graph snapshots, credentials, API keys, real memory exports, or absolute author-machine paths. User configs and generated data remain local and ignored by git. The skill makes no deployment, universal-format, exact-history, or virality promise.
