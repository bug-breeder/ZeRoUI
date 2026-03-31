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
import { renderPage, LAYOUT } from '@bug-breeder/zeroui';

let col = null;

Page({
  onInit() { col = null; },

  build() {
    renderPage({
      layout: LAYOUT.FULL,
      title: 'My Page',
      buildFn: (c) => {
        col = c;
        col.label('Options');
        col.chip('Choice A', { onPress: () => {} });
        col.chip('Choice B', { onPress: () => {} });
        col.finalize();
      },
    });
  },

  onDestroy() {
    col?.destroyAll();
    col = null;
  },
});
```

## API Reference

### configure()

```js
import { configure } from '@bug-breeder/zeroui';
configure({ accent: 'blue' }); // call once in app.js
// presets: 'green' (default) | 'blue' | 'red' | 'orange' | 'purple'
```

### LAYOUT modes

| Mode | Zones | Use |
|---|---|---|
| `LAYOUT.FULL` | TITLE + MAIN + ACTION | standard page |
| `LAYOUT.NO_TITLE` | MAIN + ACTION | no title bar |
| `LAYOUT.NO_ACTION` | TITLE + MAIN | no action button |
| `LAYOUT.MINIMAL` | MAIN | fullscreen / immersive |

### renderPage(opts)

| Option | Type | Default | Description |
|---|---|---|---|
| `layout` | LAYOUT mode | — | Zone configuration (required) |
| `buildFn` | `(col: Column) => void` | — | Column content builder — column passed in |
| `title` | string | — | Page title text |
| `action` | `{ text, onPress, variant? }` | — | Bottom action button |
| `scrollable` | boolean | `true` | Enable column scrolling |

Returns the `Column` — store it for rebuild loops.

### Column

| Method | Description |
|---|---|
| `label(text, opts?)` | Muted caption row |
| `text(text, opts?)` | Body text (`size`, `color`, `align`, `wrap`, `h`) |
| `heroNumber(value, opts?)` | Large centered number |
| `chip(text, opts?)` | Full-width tappable chip (`selected`, `onPress`, `variant`) |
| `chipRow(options[], opts?)` | Row of equal chips (`selected`, `onPress`, `variant`) |
| `card({ title, value, valueColor?, h? })` | Metric card with SURFACE background |
| `progressBar(value, opts?)` | Horizontal fill bar (0.0–1.0) |
| `image(src, opts?)` | Centered image widget |
| `divider(opts?)` | Thin horizontal separator |
| `spacer(n)` | Add n units vertical gap |
| `widget(type, props, h)` | Raw hmUI escape hatch |
| `finalize()` | **Required** for scrollable — sets total scroll height |
| `clearContent()` | Destroy children, keep container (use in rebuilds) |
| `destroyAll()` | Full teardown — call only in `onDestroy()` |
| `currentY` | Current y position (read-only) |

Chip/button variants: `'default'` `'primary'` `'secondary'` `'danger'` `'ghost'`

### Tokens

`COLOR`, `TYPOGRAPHY`, `RADIUS`, `SPACING` — see `src/tokens.js` for full values.
`COLOR.PRIMARY*` tokens are mutable via `configure()`.

## Package structure

```
index.js          Entry point — re-exports everything
src/
  tokens.js       Design tokens + configure()
  layout.js       LAYOUT modes
  column.js       Column class
  page.js         renderPage()
  chrome.js       bg, title, actionButton, column factory
```
