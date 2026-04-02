/**
 * ZeRoUI page preview tool.
 *
 * Runs a ZeppOS page's lifecycle (onInit → build) with mocked @zos/* APIs,
 * records every hmUI.createWidget call, and renders the result to an SVG.
 * Catches layout bugs — ghost chips, text overflow, circle clipping — before
 * they reach the simulator.
 *
 * Usage (from your ZeppOS app directory):
 *   node --no-warnings --loader ../ZeRoUI/tools/loader.mjs \
 *        ../ZeRoUI/tools/preview.mjs [page-name|path/to/page.js]
 *
 *   Examples:
 *     node --no-warnings --loader ../ZeRoUI/tools/loader.mjs \
 *          ../ZeRoUI/tools/preview.mjs home
 *     node --no-warnings --loader ../ZeRoUI/tools/loader.mjs \
 *          ../ZeRoUI/tools/preview.mjs pages/home/index.js
 *
 * Or add to your app's package.json scripts:
 *   "preview-page": "node --no-warnings --loader ../ZeRoUI/tools/loader.mjs ../ZeRoUI/tools/preview.mjs"
 *
 * Output:
 *   /tmp/zepp-preview-[page].svg  — open in any browser
 *
 * To convert to PNG (macOS, then readable by Claude's image tool):
 *   qlmanage -t -s 480 -o /tmp /tmp/zepp-preview-[page].svg
 *   # Output: /tmp/zepp-preview-[page].svg.png
 *
 * Seed data (streak, session history, etc.) comes from tools/mocks/zos-storage.mjs.
 * Edit that file to preview different data states.
 */

import { writeFileSync, existsSync } from 'node:fs';
import { resolve, basename, dirname, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

// Shared widget recorder — same instance used by all page/ZeRoUI code via @zos/ui.
import { widgets } from './mocks/zos-ui.mjs';
import { widgetsToHTML } from './html.mjs';

// ─── Resolve page path ────────────────────────────────────────────────────────
// Accepts either a bare page name (resolved as pages/<name>/index.js relative
// to CWD) or an explicit path relative to CWD.

const arg = process.argv[2] || 'home';
const cwd = process.cwd();

let pageFile;
if (extname(arg)) {
  // Explicit path: pages/home/index.js, ./pages/home/index.js, etc.
  pageFile = resolve(cwd, arg);
} else {
  // Bare page name: 'home' → <cwd>/pages/home/index.js
  pageFile = resolve(cwd, `pages/${arg}/index.js`);
}

if (!existsSync(pageFile)) {
  console.error(`Page not found: ${pageFile}`);
  console.error('Pass a page name (e.g. "home") or a path relative to CWD.');
  process.exit(1);
}

const pageSlug = basename(dirname(pageFile)); // e.g. 'home' from 'pages/home/index.js'

// ─── ZeppOS global stubs ──────────────────────────────────────────────────────

let capturedPageDef = null;
globalThis.Page = (def) => {
  capturedPageDef = def;
};
globalThis.setInterval = () => 0;
globalThis.clearInterval = () => {};
globalThis.setTimeout = () => 0;
globalThis.clearTimeout = () => {};

// ─── Import and run page lifecycle ───────────────────────────────────────────

widgets.length = 0;
await import(pathToFileURL(pageFile).href);

if (!capturedPageDef) {
  console.error(`ERROR: Page() was never called in ${pageFile}`);
  process.exit(1);
}

// Session page needs params; others use defaults from the storage mock.
const PAGE_PARAMS = {
  session: JSON.stringify({ technique: 'box', rounds: 5 }),
};

widgets.length = 0;
if (capturedPageDef.onInit) capturedPageDef.onInit(PAGE_PARAMS[pageSlug]);
if (capturedPageDef.build) capturedPageDef.build();

// ─── Render HTML ──────────────────────────────────────────────────────────────

const html = widgetsToHTML(widgets, {
  label: `${pageSlug}  \u2014  ${widgets.length} widgets`,
  pageSlug,
});

const outPath = `/tmp/zepp-preview-${pageSlug}.html`;
writeFileSync(outPath, html, 'utf-8');

// ─── Layout analysis ──────────────────────────────────────────────────────────

console.log(`\n\u{1F4F1}  ${pageSlug}  \u2014  ${widgets.length} widgets  \u2192  ${outPath}`);
console.log('\u2500'.repeat(70));

const VISUAL = ['TEXT', 'BUTTON', 'FILL_RECT', 'ARC'];
for (const w of widgets) {
  if (!VISUAL.includes(w._type)) continue;
  if (w._visible === false) continue;
  const label = w.text != null ? `"${w.text}"` : w._type;
  const bgHex =
    w.normal_color !== undefined
      ? `bg=#${((w.normal_color >>> 0) & 0xffffff).toString(16).padStart(6, '0')}`
      : `fill=#${((w.color >>> 0) & 0xffffff).toString(16).padStart(6, '0')}`;
  const fontSize = w.text_size ? `  font=${w.text_size}` : '';
  console.log(
    `  [${w._type.padEnd(10)}] ${String(label).padEnd(20)} x=${String(w.x).padStart(3)} y=${String(w.y).padStart(3)} w=${String(w.w).padStart(3)} h=${String(w.h).padStart(3)}  ${bgHex}${fontSize}`
  );
}

// Circle boundary check (skip full-width elements and large backgrounds)
const CX = 240,
  CY = 240,
  R = 240;
let clippedCount = 0;

for (const w of widgets) {
  if (w._type === 'VIEW_CONTAINER') continue;
  if (w._type === 'FILL_RECT' && w.w * w.h > 10000) continue;
  if (w.w >= 460) continue;
  if (!w.w || !w.h) continue;

  const corners = [
    [w.x, w.y],
    [w.x + w.w, w.y],
    [w.x, w.y + w.h],
    [w.x + w.w, w.y + w.h],
  ];
  for (const [px, py] of corners) {
    const dist = Math.sqrt((px - CX) ** 2 + (py - CY) ** 2);
    if (dist > R) {
      if (clippedCount === 0) console.log('\n\u26A0\uFE0F   Widgets clipped by circular screen:');
      const lbl = w.text ? `"${w.text}"` : w._type;
      console.log(
        `      [${w._type}] ${lbl}  corner (${px},\u00A0${py})  r=${Math.round(dist)}  >  ${R}`
      );
      clippedCount++;
      break;
    }
  }
}
if (clippedCount === 0) console.log('\n\u2705  All widgets within circle bounds');

// Ghost chip check
const ghostChips = widgets.filter((w) => w._type === 'BUTTON' && w.normal_color === 0x000000);
if (ghostChips.length > 0) {
  console.log('\n\u26A0\uFE0F   Ghost chips with black background (invisible on OLED):');
  for (const w of ghostChips) {
    console.log(`      [BUTTON] "${w.text}"  x=${w.x} y=${w.y} w=${w.w} h=${w.h}`);
  }
} else {
  console.log('\u2705  No invisible ghost chips');
}

// Text overflow check
const overflow = widgets.filter(
  (w) => (w._type === 'TEXT' || w._type === 'BUTTON') && w.text_size && w.h && w.text_size > w.h
);
if (overflow.length > 0) {
  console.log('\n\u26A0\uFE0F   Text exceeds widget height (will clip in ZeppOS):');
  for (const w of overflow) {
    console.log(`      [${w._type}] "${w.text}"  text_size=${w.text_size}  h=${w.h}`);
  }
} else {
  console.log('\u2705  All text sizes fit within widget heights');
}

console.log('\n' + '\u2500'.repeat(70));
console.log(`Open:    open ${outPath}\n`);
