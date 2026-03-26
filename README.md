# ZeRoUI — ZeppOS Rounded UI

UI library for ZeppOS round-display apps. Design tokens, safe-zone layout system, Column layout helper, and hmUI component wrappers.

## Install

In a ZeppOS app (side-by-side repos):
```json
"dependencies": {
  "@bug-breeder/zeroui": "file:../ZeRoUI"
}
```

Then `npm install`.

## Quick Start

```js
import { renderPage, column, LAYOUT } from '@bug-breeder/zeroui';

let col = null;

Page({
  onInit() { col = null; },
  build() {
    col = column(LAYOUT.FULL.MAIN, { scrollable: true });
    renderPage({
      layout: LAYOUT.FULL,
      title: 'My Page',
      buildFn() {
        col.sectionLabel('Options');
        col.chip('Choice A', { onPress: () => {} });
        col.chip('Choice B', { onPress: () => {} });
        col.finalize();
      },
    });
  },
  onDestroy() {
    if (col) { col.destroyAll(); col = null; }
  },
});
```

## API Reference

### LAYOUT modes

| Mode | Zones | Use |
|---|---|---|
| `LAYOUT.FULL` | TITLE + MAIN + ACTION | standard page |
| `LAYOUT.NO_TITLE` | MAIN + ACTION | no title bar |
| `LAYOUT.NO_ACTION` | TITLE + MAIN | no action button |
| `LAYOUT.MAIN_ONLY` | MAIN | fullscreen / immersive |

### renderPage(opts)

| Option | Type | Required | Description |
|---|---|---|---|
| `layout` | LAYOUT mode | yes | Zone configuration |
| `buildFn` | `() => void` | yes | Creates Column content (no args) |
| `title` | string | no | Page title |
| `action` | `{ text, onPress }` | no | Bottom action button |

### column(zone, opts)

Returns a `Column`. Opts: `{ scrollable?: boolean }`.

| Method | Description |
|---|---|
| `sectionLabel(text)` | Muted caption row |
| `chip(text, opts)` | Full-width tappable chip (`selected`, `onPress`) |
| `chipRow(options[], opts)` | Horizontal row of equal chips (`selected`, `onPress`) |
| `spacer(n)` | Add n units vertical gap |
| `finalize()` | **Required** for scrollable — sets total scroll height |
| `clearContent()` | Destroy children, keep container (use in rebuilds) |
| `destroyAll()` | Full teardown — call only in `onDestroy()` |

### Tokens

`COLOR`, `TYPOGRAPHY`, `RADIUS`, `SPACING` — see `src/tokens.js` for full values.

## Package structure

```
index.js          Entry point — re-exports everything
src/
  tokens.js       Design tokens
  zones.js        ZONE (legacy) + LAYOUT (4 modes)
  column.js       Column class
  components.js   bg, title, actionButton, heroText, statCard, renderPage
```
