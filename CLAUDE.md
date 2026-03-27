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
  tokens.js       COLOR, TYPOGRAPHY, RADIUS, SPACING
  zones.js        ZONE (legacy), LAYOUT (4 named modes)
  column.js       Column class — auto y-tracking + widget lifecycle
  components.js   bg, title, actionButton, heroText, statCard, renderPage
```

### Design principles

- **Pre-calculated positions from constants** — never read widget dimensions at runtime (that was zeppos-zui's fatal bug)
- **480-unit design coords throughout** — no `px()` calls anywhere in this library
- **Absolute screen coordinates** — even inside VIEW_CONTAINER (Column always uses screen coords)

### Adding a component

1. Add `export function myComponent(opts = {})` to `src/components.js` (or new `src/<name>.js` if large)
2. Import tokens from `./tokens.js`, zones from `./zones.js`
3. `hmUI.createWidget(...)` — return the widget or widget array (pure draw, no state)
4. In `index.js`: add to both `export { ... }` block and `export const UI = { ... }`

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
import { renderPage, column, LAYOUT, COLOR, TYPOGRAPHY, RADIUS } from '@bug-breeder/zeroui';
import { UI } from '@bug-breeder/zeroui'; // namespace form
```

### LAYOUT modes

| Mode | Zones | Use when |
|---|---|---|
| `LAYOUT.FULL` | TITLE + MAIN + ACTION | most pages |
| `LAYOUT.NO_TITLE` | MAIN + ACTION | no title bar |
| `LAYOUT.NO_ACTION` | TITLE + MAIN | no bottom button |
| `LAYOUT.MAIN_ONLY` | MAIN | fullscreen / immersive |

### renderPage()

```js
renderPage({
  layout: LAYOUT.FULL,
  buildFn() { /* create Column content here — no args */ },
  title: 'Page Title',          // optional
  action: { text: 'Go', onPress: () => {} }, // optional
});
```

Handles z-order: bg → buildFn → top mask → title → bottom mask → action.

### column() + Column

```js
const col = column(LAYOUT.FULL.MAIN, { scrollable: true });
col.sectionLabel('Section');
col.chip('Item', { selected: false, onPress: () => {} });
col.chipRow(['A', 'B'], { selected: 'A', onPress: (v) => {} });
col.spacer(16);
col.finalize();          // REQUIRED for scrollable — sets VIEW_CONTAINER height

// Rebuild: clearContent() + re-add + finalize()
// Teardown (onDestroy only): destroyAll()
```

### Key gotchas

- **`finalize()` required** for scrollable columns — missing it breaks scroll
- **`clearContent()` in rebuilds, `destroyAll()` only in `onDestroy`**
- **`buildFn` takes no args** — access `col` and `layout` via closure
- **Use `COLOR` from `@bug-breeder/zeroui`** — do not mix with `utils/constants.js` tokens

---

## Dev Commands

| Command | What it does |
|---|---|
| `npm install` | Install dev dependencies |
| `npx eslint src/` | Lint source |
| `node -e "import('./index.js').then(m => console.log(Object.keys(m)))"` | Verify exports |
