# Your 3D Brain

A local, read-only view of the knowledge sources selected in `brain.config.json`.

Run `node serve.mjs` from this folder, then open the printed localhost link. Node.js 22 or newer is required. The prebuilt renderer is included, so no installation is needed to run it. To edit the renderer, run `npm ci`, edit `src/`, and run `npm run build:js`.

The name, categories, colors, source paths, and port come from `brain.config.json`. Rebuild from disk refreshes notes and connections. Restart the server after changing code or the port. Missing or inaccessible sources appear as notices in the inventory, not invented notes.

- Drag to orbit, scroll to zoom, and click a node to read it. `/` focuses search.
- Source buttons toggle categories. Shift-click solos one; click the last active source to restore all.
- Play demo (`D`) grows the graph through real connections over about 29 seconds. Orbit and zoom still work during growth. The central orb is visible immediately. Replay starts again after completion.
- Cinema (`C`) hides surrounding UI. Escape exits it.
- Pause motion freezes rotation and animated accents. Reduced-motion settings are honored.
- Only selected neighborhoods get bright paths; overview links are sampled to stay readable. The inventory retains full counts.

The replay shows connectivity, not historical creation dates. Unknown relationships remain disconnected. Exact-title mentions are labeled `mention`; explicit Markdown links and wikilinks take precedence. Duplicate basenames with ambiguous links are reported instead of silently assigned.

Markdown and text files are supported directly, including local meeting notes, wiki pages, project notes, skills, and Claude memory. The Codex adapter reads curated memory summaries, topic groups, recaps, and workflow notes. It excludes raw session logs and duplicate raw-memory exports. Remote systems, PDFs, databases, and raw meeting JSON need an explicit local export or an additional adapter; this app does not claim to ingest them automatically.

The server binds to `127.0.0.1`. It exposes only indexed note IDs and approved static assets, rejects cross-origin API requests, and sanitizes rendered Markdown. Native pointer lock and cursor capture are disabled. Source files are never modified. The local config and generated graph are gitignored. Cinema hides controls, not private information; review the visible notes before recording or sharing screenshots.

Third-party dependency licenses are included in `THIRD-PARTY-NOTICES.txt`.
