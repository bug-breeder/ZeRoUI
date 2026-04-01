/**
 * Round-display layout modes for 480×480 design canvas.
 * Calibrated for 1.32–1.5" round OLED ZeppOS watches. Design grid: 12-unit base.
 *
 * Arc geometry (circle r=240, center=240):
 *   y=60 / y=420: ~1px outside the inscribed rect at x=80 — safe because OLED clips at
 *   the circle boundary and content at x=80 is never visible past the arc anyway.
 *   ACTION zone at y=456 (384+72): half-chord≈105px > half-width 96px ✓
 */

export const LAYOUT = {
  // title bar + scrollable main + action button
  FULL: {
    TITLE:  { x: 120, y: 24,  w: 240, h: 48  },
    MAIN:   { x: 80,  y: 84,  w: 320, h: 288 },
    ACTION: { x: 144, y: 384, w: 192, h: 72  },
  },

  // no title — MAIN starts at y=60
  NO_TITLE: {
    MAIN:   { x: 80,  y: 60,  w: 320, h: 312 },
    ACTION: { x: 144, y: 384, w: 192, h: 72  },
  },

  // no action button
  NO_ACTION: {
    TITLE:  { x: 120, y: 24,  w: 240, h: 48  },
    MAIN:   { x: 80,  y: 84,  w: 320, h: 336 },
  },

  // no chrome — full safe inscribed rect (home, session)
  MINIMAL: {
    MAIN:   { x: 80,  y: 60,  w: 320, h: 360 },
  },
};
