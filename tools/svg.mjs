/**
 * Converts a ZeppOS widget list to a 480×480 SVG with circular clip.
 * Widgets are rendered in creation order (= z-order, low → high).
 *
 * Coordinate system matches ZeppOS design canvas:
 *   origin (0,0) = top-left, x right, y down, circle at cx=240 cy=240 r=240.
 */

/** Convert a ZeppOS hex color integer (e.g. 0x30d158) to SVG hex string (#30d158). */
function hexColor(n) {
  if (n === undefined || n === null) return 'none';
  return '#' + (n >>> 0).toString(16).padStart(6, '0').slice(-6);
}

/** Escape XML special characters for SVG text content. */
function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Compute SVG rx (corner radius) for a widget.
 * ZeppOS RADIUS.pill = 999 → cap at min(w,h)/2 to produce a perfect pill.
 */
function rx(radius, w, h) {
  if (!radius) return 0;
  return Math.min(Number(radius), w / 2, h / 2);
}

function renderWidget(w) {
  // OLED behaviour: black pixels are physically off — don't render black FILL_RECTs.
  // This correctly shows content (e.g. heatmap row 4) that the mask "hides" on LCD but
  // is actually visible through the black pixels on OLED.
  if (w._type === 'FILL_RECT' && (w.color === 0 || w.color === 0x000000) && w.w < 460) return '';

  // Respect visibility changes from setProperty('VISIBLE', false)
  if (w._visible === false) return '';

  const { _type: type, x = 0, y = 0, w: ww = 0, h = 0 } = w;

  switch (type) {
    case 'FILL_RECT':
      return `<rect x="${x}" y="${y}" width="${ww}" height="${h}" rx="${rx(w.radius, ww, h)}" fill="${hexColor(w.color)}"/>`;

    case 'TEXT': {
      const align = w.align_h;
      let tx, anchor;
      if (align === 'LEFT') {
        tx = x + 4;
        anchor = 'start';
      } else if (align === 'RIGHT') {
        tx = x + ww - 4;
        anchor = 'end';
      } else {
        tx = x + ww / 2;
        anchor = 'middle';
      }
      const ty = y + h / 2;
      return `<text x="${tx}" y="${ty}" font-family="system-ui,-apple-system,sans-serif" font-size="${w.text_size || 30}" fill="${hexColor(w.color)}" text-anchor="${anchor}" dominant-baseline="central">${esc(w.text)}</text>`;
    }

    case 'BUTTON': {
      const bg = `<rect x="${x}" y="${y}" width="${ww}" height="${h}" rx="${rx(w.radius, ww, h)}" fill="${hexColor(w.normal_color)}"/>`;
      const label = w.text
        ? `<text x="${x + ww / 2}" y="${y + h / 2}" font-family="system-ui,-apple-system,sans-serif" font-size="${w.text_size || 30}" fill="${hexColor(w.color)}" text-anchor="middle" dominant-baseline="central">${esc(w.text)}</text>`
        : '';
      return bg + (label ? '\n    ' + label : '');
    }

    case 'ARC': {
      // ARC bounding box: x,y = top-left corner, w,h = dimensions.
      // Render as a full-circle stroke centered within the bounding box.
      const cx = x + ww / 2;
      const cy = y + h / 2;
      const lw = w.line_width || 4;
      const r = ww / 2 - lw / 2;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${hexColor(w.color)}" stroke-width="${lw}"/>`;
    }

    case 'VIEW_CONTAINER':
      return `<!-- VIEW_CONTAINER (scrollable wrapper — no visual) -->`;

    case 'IMG':
      return `<rect x="${x}" y="${y}" width="${ww}" height="${h}" fill="#2a2a2a"/>
    <text x="${x + ww / 2}" y="${y + h / 2}" fill="#555" text-anchor="middle" dominant-baseline="central" font-size="12" font-family="sans-serif">IMG</text>`;

    default:
      return `<!-- unknown widget: ${type} -->`;
  }
}

/**
 * Render a list of ZeppOS widgets to an SVG string.
 * @param {object[]} widgets  - Array of widget objects from the hmUI mock.
 * @param {object}   options
 * @param {string}   options.label  - Optional caption below the screen.
 */
export function widgetsToSVG(widgets, { label = '' } = {}) {
  const body = widgets.map((w) => '    ' + renderWidget(w)).join('\n');
  const caption = label
    ? `<text x="240" y="496" text-anchor="middle" fill="#888" font-family="sans-serif" font-size="13">${esc(label)}</text>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="510" viewBox="0 0 480 510">
  <defs>
    <clipPath id="screen">
      <circle cx="240" cy="240" r="240"/>
    </clipPath>
  </defs>

  <!-- Dark surround (simulates watch bezel area) -->
  <rect width="480" height="510" fill="#1a1a1a"/>

  <!-- OLED black base inside the circle -->
  <circle cx="240" cy="240" r="240" fill="#000000"/>

  <!-- Widgets rendered in z-order (creation order = bottom → top) -->
  <g clip-path="url(#screen)">
${body}
  </g>

  <!-- Bezel ring -->
  <circle cx="240" cy="240" r="239" fill="none" stroke="#333" stroke-width="2"/>

  ${caption}
</svg>`;
}
