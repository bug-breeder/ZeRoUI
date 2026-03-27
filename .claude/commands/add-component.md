---
name: add-component
description: Scaffold a new ZeRoUI component and export it from index.js.
argument-hint: <ComponentName>
---

Add a new ZeRoUI component: $ARGUMENTS

**Goal:** Add an exported draw function to `src/components.js` (or a new `src/<name>.js` if the component is large/complex). Export it from `index.js`.

**Constraints:**
- Pure draw function — `export function myComponent(opts = {}) { ... }`
- Only `hmUI.createWidget()` — no state, no classes (unless a layout helper like Column)
- Import tokens from `./tokens.js`, zones from `./zones.js`
- Return the widget or widget array
- No `px()` calls — design canvas (480-unit) coords only
- Derive sensible defaults from existing token values

**After adding to src/components.js (or new file):**

In `index.js`, add to both blocks:
```js
// Named exports block:
export { ..., myComponent } from './src/components.js';

// UI namespace:
export const UI = {
  ...,
  myComponent,
};
```

**Verify:**
```bash
npx eslint src/
node -e "import('./index.js').then(m => console.log(Object.keys(m)))"
```

Expected: 0 lint errors, new export key appears in the output.
