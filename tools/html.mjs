/**
 * ZeRoUI Canvas 2D page renderer.
 *
 * Converts a ZeppOS widget list to a self-contained HTML file with a 480×480
 * Canvas 2D preview. Accurately simulates z-order masking (black FILL_RECTs
 * render solid) and supports interactive wheel/touch scroll on scrollable pages.
 *
 * Usage (from ZeppOS app directory, via preview.mjs):
 *   const html = widgetsToHTML(widgets, { label, pageSlug });
 *   writeFileSync('/tmp/zepp-preview-home.html', html, 'utf-8');
 */

/** Convert a ZeppOS hex color integer to CSS hex string (#rrggbb). */
function hexColor(n) {
  if (n === undefined || n === null) return '#000000'; // Canvas has no 'none' — fall back to black
  return '#' + ((n >>> 0) & 0xffffff).toString(16).padStart(6, '0');
}

/**
 * Infer layout zones from the widget array.
 * No layout object needed — everything is derived from mask positions.
 *
 * renderPage() creates widgets in this order:
 *   1. FILL_RECT bg (y=0, h=480, black)          — fixed
 *   2. VIEW_CONTAINER (if scrollable)             — marks scrollable start
 *   3. buildFn content (scrollable or fixed)
 *   4. FILL_RECT top_mask (y=0, h=mainY, black)  — fixed
 *   5. TEXT title (if any)                        — fixed
 *   6. FILL_RECT bottom_mask (y=mainBottom, black)— fixed
 *   7. BUTTON action (if any)                     — fixed
 */
function inferLayout(widgets) {
  const isFullWidthBlack = (w) =>
    w._type === 'FILL_RECT' &&
    (w.w || 0) >= 460 &&
    (w.color === 0 || w.color === 0x000000);

  // Top mask: full-width black at y=0, h<200 (bg has h=480 — excluded by h<200 guard)
  const topMask = widgets.find((w) => isFullWidthBlack(w) && w.y === 0 && w.h < 200);
  // Bottom mask: first full-width black with y>0
  const bottomMask = widgets.find((w) => isFullWidthBlack(w) && (w.y || 0) > 0);

  const mainY = topMask ? topMask.h : 0;
  const mainBottom = bottomMask ? bottomMask.y : 480;
  const mainH = mainBottom - mainY;
  const mainX = 80;   // consistent across all ZeRoUI layouts
  const mainW = 320;  // consistent across all ZeRoUI layouts

  const vcIdx = widgets.findIndex((w) => w._type === 'VIEW_CONTAINER');
  const scrollable = vcIdx >= 0;

  // Scrollable widget range: after VIEW_CONTAINER, before next full-width black FILL_RECT
  let scStart = 0, scEnd = 0;
  if (scrollable) {
    scStart = vcIdx + 1;
    const nextMaskIdx = widgets.findIndex((w, i) => i > vcIdx && isFullWidthBlack(w));
    scEnd = nextMaskIdx >= 0 ? nextMaskIdx : widgets.length;
  }

  const titleWidget =
    widgets.find((w) => w._type === 'TEXT' && (w.y || 0) < mainY && w._visible !== false) || null;
  const actionWidget =
    widgets.find((w) => w._type === 'BUTTON' && (w.y || 0) >= mainBottom && w._visible !== false) || null;

  // maxScroll: how far content can scroll before the last widget is fully visible
  let maxScroll = 0;
  if (scrollable && scEnd > scStart) {
    const maxY = Math.max(
      ...widgets.slice(scStart, scEnd).map((w) => (w.y || 0) + (w.h || 0))
    );
    maxScroll = Math.max(0, maxY - mainY - mainH);
  }

  return { mainY, mainBottom, mainH, mainX, mainW, scrollable, scStart, scEnd, titleWidget, actionWidget, maxScroll };
}

/** Serialize widget array to JSON, stripping functions (e.g. setProperty, click_func). */
function serializeWidgets(widgets) {
  return JSON.stringify(
    widgets.map((w) => {
      const out = {};
      for (const [k, v] of Object.entries(w)) {
        if (typeof v !== 'function') out[k] = v;
      }
      return out;
    })
  );
}

/**
 * Escape </script> sequences in a JSON string for safe HTML embedding.
 * Prevents early script-tag closure when widget text contains "</script>".
 */
function escapeForScript(json) {
  return json.replace(/<\/script>/gi, '<\\/script>');
}

/** Escape HTML special characters for use in HTML text content. */
function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Render a list of ZeppOS widgets to a self-contained HTML string.
 * @param {object[]} widgets  - Array of widget objects from the hmUI mock.
 * @param {object}   options
 * @param {string}   options.label     - Caption shown below the canvas.
 * @param {string}   options.pageSlug  - Page name for the HTML title.
 */
export function widgetsToHTML(widgets, { label = '', pageSlug = '' } = {}) {
  const {
    mainY, mainBottom, mainH, mainX, mainW,
    scrollable, scStart, scEnd,
    titleWidget, actionWidget, maxScroll,
  } = inferLayout(widgets);

  const widgetsJSON = escapeForScript(serializeWidgets(widgets));
  const scrollHint = scrollable ? ' \u2014 scroll to see full content' : '';
  const cursor = scrollable ? 'grab' : 'default';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(pageSlug) || 'preview'} \u2014 ZeRoUI preview</title>
  <style>
    body { margin: 0; background: #0d0d0d; display: flex; flex-direction: column; align-items: center; padding: 32px; font-family: system-ui, sans-serif; }
    canvas { border-radius: 50%; cursor: ${cursor}; display: block; box-shadow: 0 0 0 2px #2a2a2a; }
    .info { color: #8e8e93; font-size: 13px; margin-top: 14px; }
  </style>
</head>
<body>
  <canvas id="watch" width="480" height="480"></canvas>
  <p class="info">${esc(label)}${scrollHint}</p>
<script>
const WIDGETS = ${widgetsJSON};
const MAIN_X = ${mainX}, MAIN_Y = ${mainY}, MAIN_W = ${mainW}, MAIN_H = ${mainH};
const MAIN_BOTTOM = ${mainBottom};
const SC_START = ${scStart}, SC_END = ${scEnd};
const SCROLLABLE = ${scrollable};
const MAX_SCROLL = ${maxScroll};
const TITLE_WIDGET = ${escapeForScript(JSON.stringify(titleWidget))};
const ACTION_WIDGET = ${escapeForScript(JSON.stringify(actionWidget))};

const canvas = document.getElementById('watch');
const ctx = canvas.getContext('2d');

function hexColor(n) {
  if (n === undefined || n === null) return '#000000'; // Canvas has no 'none' — fall back to black
  return '#' + ((n >>> 0) & 0xffffff).toString(16).padStart(6, '0');
}

function drawFillRect(ctx, w) {
  if (w._visible === false) return;
  ctx.fillStyle = hexColor(w.color);
  const r = Math.min(w.radius || 0, (w.w || 0) / 2, (w.h || 0) / 2);
  if (r > 0) {
    ctx.beginPath();
    ctx.roundRect(w.x, w.y, w.w, w.h, r);
    ctx.fill();
  } else {
    ctx.fillRect(w.x || 0, w.y || 0, w.w || 0, w.h || 0);
  }
}

function drawText(ctx, w) {
  if (w._visible === false || !w.text) return;
  ctx.fillStyle = hexColor(w.color);
  ctx.font = \`\${w.text_size || 30}px 'Noto Sans', system-ui, sans-serif\`;
  ctx.textBaseline = 'middle';
  const ty = (w.y || 0) + (w.h || 0) / 2;
  if (w.align_h === 'LEFT') {
    ctx.textAlign = 'left';
    ctx.fillText(String(w.text), (w.x || 0) + 4, ty);
  } else if (w.align_h === 'RIGHT') {
    ctx.textAlign = 'right';
    ctx.fillText(String(w.text), (w.x || 0) + (w.w || 0) - 4, ty);
  } else {
    ctx.textAlign = 'center';
    ctx.fillText(String(w.text), (w.x || 0) + (w.w || 0) / 2, ty);
  }
}

function drawButton(ctx, w) {
  if (w._visible === false) return;
  ctx.fillStyle = hexColor(w.normal_color);
  const r = Math.min(w.radius || 0, (w.w || 0) / 2, (w.h || 0) / 2);
  ctx.beginPath();
  ctx.roundRect(w.x || 0, w.y || 0, w.w || 0, w.h || 0, r);
  ctx.fill();
  if (w.text) {
    ctx.fillStyle = hexColor(w.color);
    ctx.font = \`\${w.text_size || 30}px 'Noto Sans', system-ui, sans-serif\`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(w.text), (w.x || 0) + (w.w || 0) / 2, (w.y || 0) + (w.h || 0) / 2);
  }
}

function drawArc(ctx, w) {
  if (w._visible === false) return;
  const cx = (w.x || 0) + (w.w || 0) / 2;
  const cy = (w.y || 0) + (w.h || 0) / 2;
  const lw = w.line_width || 4;
  const r = Math.max(0, (w.w || 0) / 2 - lw / 2);
  ctx.strokeStyle = hexColor(w.color);
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2); // TODO: start_angle/end_angle not yet implemented — renders full circle
  ctx.stroke();
}

function drawImg(ctx, w) {
  if (w._visible === false) return;
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(w.x || 0, w.y || 0, w.w || 0, w.h || 0);
  ctx.fillStyle = '#555555';
  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('IMG', (w.x || 0) + (w.w || 0) / 2, (w.y || 0) + (w.h || 0) / 2);
}

function drawWidget(ctx, w) {
  switch (w._type) {
    case 'FILL_RECT': drawFillRect(ctx, w); break;
    case 'TEXT':      drawText(ctx, w);     break;
    case 'BUTTON':    drawButton(ctx, w);   break;
    case 'ARC':       drawArc(ctx, w);      break;
    case 'IMG':       drawImg(ctx, w);      break;
  }
}

function drawOverlay(ctx) {
  ctx.save();
  ctx.lineWidth = 1.5;

  // MAIN zone — always shown
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = '#30d15888';
  ctx.strokeRect(MAIN_X, MAIN_Y, MAIN_W, MAIN_H);
  ctx.setLineDash([]);
  ctx.fillStyle = '#30d15899';
  ctx.font = '11px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('MAIN', MAIN_X + 4, MAIN_Y + 4);

  // TITLE zone
  if (TITLE_WIDGET) {
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = '#ff9f0a88';
    ctx.strokeRect(TITLE_WIDGET.x || 0, TITLE_WIDGET.y || 0, TITLE_WIDGET.w || 0, TITLE_WIDGET.h || 0);
    ctx.setLineDash([]);
    ctx.fillStyle = '#ff9f0a99';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('TITLE', (TITLE_WIDGET.x || 0) + 4, (TITLE_WIDGET.y || 0) + 4);
  }

  // ACTION zone
  if (ACTION_WIDGET) {
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = '#007aff88';
    ctx.strokeRect(ACTION_WIDGET.x || 0, ACTION_WIDGET.y || 0, ACTION_WIDGET.w || 0, ACTION_WIDGET.h || 0);
    ctx.setLineDash([]);
    ctx.fillStyle = '#007aff99';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('ACTION', (ACTION_WIDGET.x || 0) + 4, (ACTION_WIDGET.y || 0) + 4);
  }

  // Scroll indicator on right edge of MAIN zone — only when content actually overflows
  if (SCROLLABLE && MAX_SCROLL > 0) {
    ctx.fillStyle = '#30d158bb';
    ctx.font = '22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u2195', MAIN_X + MAIN_W + 20, MAIN_Y + MAIN_H / 2);
  }

  ctx.restore();
}

function render(scrollY) {
  ctx.clearRect(0, 0, 480, 480);

  // Clip all drawing to the circular watch face
  ctx.save();
  ctx.beginPath();
  ctx.arc(240, 240, 240, 0, Math.PI * 2);
  ctx.clip();

  for (let i = 0; i < WIDGETS.length; i++) {
    const w = WIDGETS[i];
    if (w._type === 'VIEW_CONTAINER') continue;

    const isScrollable = SCROLLABLE && i >= SC_START && i < SC_END;

    if (isScrollable) {
      // Clip scrollable widgets to MAIN zone and shift by scrollY
      ctx.save();
      ctx.beginPath();
      ctx.rect(MAIN_X, MAIN_Y, MAIN_W, MAIN_H);
      ctx.clip();
      ctx.translate(0, -scrollY);
      drawWidget(ctx, w);
      ctx.restore();
    } else {
      // Fixed widgets (bg, masks, title, action) render at original positions.
      // Black FILL_RECTs (masks) render solid — z-order hides overflow content.
      drawWidget(ctx, w);
    }
  }

  drawOverlay(ctx);
  ctx.restore(); // remove circle clip
}

// ─── Scroll interactivity ───────────────────────────────────────────────────

let scrollY = 0;

if (SCROLLABLE && MAX_SCROLL > 0) {
  canvas.addEventListener('wheel', (e) => {
    scrollY = Math.max(0, Math.min(MAX_SCROLL, scrollY + e.deltaY * 0.5));
    render(scrollY);
    e.preventDefault();
  }, { passive: false });

  let touchStartY = 0;
  canvas.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  canvas.addEventListener('touchmove', (e) => {
    const dy = touchStartY - e.touches[0].clientY;
    touchStartY = e.touches[0].clientY;
    scrollY = Math.max(0, Math.min(MAX_SCROLL, scrollY + dy));
    render(scrollY);
    e.preventDefault();
  }, { passive: false });
}

// ─── Font loading + initial render ─────────────────────────────────────────

async function init() {
  try {
    const font = new FontFace(
      'Noto Sans',
      'url(https://fonts.gstatic.com/s/notosans/v39/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A-9X6VLHvA.woff2)'
    );
    await font.load();
    document.fonts.add(font);
  } catch (_) { /* offline — falls back to system-ui */ }
  render(0);
}
init();
</script>
</body>
</html>`;
}
