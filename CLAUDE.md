# ZeRoUI — ZeppOS Rounded UI Library

**Package:** `@bug-breeder/zeroui`
**Purpose:** UI library for ZeppOS round-display apps — design tokens, safe-zone system, Column layout, and hmUI component wrappers.
**Claude Code plugin (for app devs):** `/plugin marketplace add bug-breeder/zepphyr` then `/plugin install zepphyr@zepphyr`

---

## Library Development

### What this repo is

Plain npm package. No zeus, no ZeppOS app build. Entry point: `index.js`. Source: `src/`.

```
index.js          Re-exports everything (named + UI namespace)
src/
  tokens.js       COLOR, TYPOGRAPHY, RADIUS, SPACING, configure()
  layout.js       LAYOUT (4 named modes: FULL, NO_TITLE, NO_ACTION, MINIMAL)
  column.js       Column class — auto y-tracking + widget lifecycle
  page.js         renderPage() — full page layout orchestrator
  chrome.js       bg, title, actionButton, column factory
```

### Design principles

- **Pre-calculated positions from constants** — never read widget dimensions at runtime (avoids fatal zeppos-zui layout bug)
- **480-unit design coords throughout** — no `px()` calls anywhere in this library
- **Absolute screen coordinates** — even inside VIEW_CONTAINER (Column always uses screen coords)
- **renderPage creates the Column** — pass `buildFn: (col) => void`, do NOT create the column before calling renderPage

### Adding a component

**Column method** (new row type inside a Column):
1. Add the method to the `Column` class in `src/column.js`
2. Use `_slot(h, gapAfter)` for y-tracking, `_create(type, props)` for widget creation
3. Update `skills/zeroui/references/api.md` in the zepphyr repo

**Standalone component** (page-level, not inside a column):
1. Add `export function myComponent(opts = {})` to `src/chrome.js`
2. Import tokens from `./tokens.js`, layout from `./layout.js`
3. In `index.js`: add to both `export { ... }` block and `export const UI = { ... }`
4. Update `skills/zeroui/references/api.md` in the zepphyr repo

### Verify

```bash
npx eslint src/
node -e "import('./index.js').then(m => console.log(Object.keys(m)))"
```

Consumer apps use `"@bug-breeder/zeroui": "file:../ZeRoUI"` — run `npm install` in the consumer after changes.

---

## Consumer API Reference

### Import

```js
import { renderPage, LAYOUT, COLOR, TYPOGRAPHY, RADIUS, SPACING, configure } from '@bug-breeder/zeroui';
import { UI } from '@bug-breeder/zeroui'; // namespace form
```

### configure()

```js
configure({ accent: 'green' })  // presets: 'green'|'blue'|'red'|'orange'|'purple'
configure({ accent: { primary: 0x007aff, primaryLight: 0x4da3ff, primaryTint: 0x001f4d, primaryPressed: 0x0051d5 } })
```

Call once in `app.js`. Mutates `COLOR.PRIMARY*` in place — all pages see updated values.

### LAYOUT modes

| Mode | Zones | Use when |
|---|---|---|
| `LAYOUT.FULL` | TITLE + MAIN + ACTION | most pages |
| `LAYOUT.NO_TITLE` | MAIN + ACTION | no title bar |
| `LAYOUT.NO_ACTION` | TITLE + MAIN | no bottom button |
| `LAYOUT.MINIMAL` | MAIN | fullscreen / immersive |

### renderPage()

```js
const col = renderPage({
  layout: LAYOUT.FULL,
  buildFn: (col) => {        // column passed in — do NOT create column separately
    col.label('Section');
    col.chip('Item', { onPress: () => {} });
    col.finalize();          // required for scrollable columns
  },
  title: 'Page Title',      // optional
  action: { text: 'Go', onPress: () => {}, variant: 'primary' }, // optional
  scrollable: true,         // default true
});
// returns the Column — store for rebuild use
```

Render order: bg → VIEW_CONTAINER → buildFn → top mask → title → bottom mask → action.

### Column methods

```js
// Text
col.label(text, { color, align })                  // muted caption header
col.text(text, { size, color, align, wrap, h })    // body text
col.heroNumber(value, { color })                   // large centered number

// Interactive
col.chip(text, { selected, onPress, variant })     // variant: 'default'|'primary'|'secondary'|'danger'|'ghost'
col.chipRow(options[], { selected, onPress, variant })

// Display
col.card({ title, value, valueColor, h })
col.progressBar(value, { color, h, radius })       // value: 0.0–1.0
col.image(src, { w, h })

// Structure
col.divider({ color, margin })
col.spacer(n)
col.widget(type, props, h)                         // escape hatch — raw hmUI widget

// Lifecycle
col.finalize()       // REQUIRED for scrollable — sets VIEW_CONTAINER height
col.clearContent()   // in rebuild loops — wipe content, keep VIEW_CONTAINER
col.destroyAll()     // in onDestroy() only — full teardown
col.currentY         // current y position (read-only)
```

---

## Dev Commands

| Command | What it does |
|---|---|
| `npm install` | Install dev dependencies |
| `npx eslint src/` | Lint source |
| `node -e "import('./index.js').then(m => console.log(Object.keys(m)))"` | Verify exports |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:watch` | Tests in watch mode |
