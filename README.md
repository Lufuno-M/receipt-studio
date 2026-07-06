# Receipt Studio v6 (React/Vite)

Migrated from the vanilla-JS v4 (`index.html` + `templates/*.json` + `renderer.js`)
to Vite + React. Same 9 brand templates, same look and CSS, new architecture.

## Why this fixes "no receipts available"

v4 loaded templates with `fetch('templates/xyz.json')`. That only works when the
page is served over `http://` — opening `index.html` directly (`file://...`)
gets silently blocked by the browser's CORS rules, and the `.catch(() => null)`
swallowed the error, so the sidebar just looked empty.

v6 imports the JSON files directly (`import end from './data/end.json'`), so
Vite bundles them at build time. No fetch, no server requirement, no silent
failure.

## What's new in this version

- **Logo upload**: each template now has an "Upload logo" control in the
  editor panel. Images are downscaled client-side (max 256px) and stored as
  base64 in `localStorage`, so they persist across sessions without needing a
  backend yet.
- Same 9 renderers (END., GOAT, StockX, Apple, Nike, eBay, Louis Vuitton,
  Patagonia, Amazon), ported to pure functions — `renderReceipt(template, values, currency)`
  — no DOM reads, which also makes them reusable later for a PDF export step.

## What didn't make the first pass (carried over as TODO)

- Undo/redo and keyboard shortcuts (`js/undo.js`, `js/shortcuts.js` in the old
  repo) — not yet ported.
- Mobile tab-bar view — the old mobile markup/CSS exists but this pass focused
  on desktop layout parity first.
- Settings modal UI (currency picker etc.) — currency defaults to `$` and is
  wired up in state (`rs-currency` in localStorage) but has no settings panel
  yet.

## Running locally

```bash
npm install
npm run dev       # http://localhost:5173
```

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

## Adding a new brand template

Same as before: drop a `{id}.json` file in `src/data/`, add its import to
`src/data/templates.js`, and add a render function + register it in
`src/render/renderReceipt.js`.

## Roadmap notes (v6→v8)

- v6: logo upload (this pass) ✅
- v7: accounts + cloud save (swap `useLocalStorage` for a real backend)
- v8: AI-assisted logo/brand "blending" features
