/**
 * Round-display layout modes for 480×480 design canvas.
 *
 * ZONE removed — use LAYOUT.FULL.* directly.
 * MAIN_ONLY renamed to MINIMAL.
 *
 * All values in 480-unit design coords — no px() needed.
 * Circle geometry: radius=240, center=(240,240).
 * All zone corners verified inside the circle.
 */

export const LAYOUT = {
  // title bar + scrollable main + action button (default for most pages)
  FULL: {
    TITLE:  { x: 120, y: 24,  w: 240, h: 44  },
    MAIN:   { x: 80,  y: 74,  w: 320, h: 312 },
    ACTION: { x: 140, y: 392, w: 200, h: 48  },
  },

  // no title — MAIN starts at y=62 (min safe top for x=80 content)
  NO_TITLE: {
    MAIN:   { x: 80,  y: 62,  w: 320, h: 324 },
    ACTION: { x: 140, y: 392, w: 200, h: 48  },
  },

  // no action button — MAIN extends to y=416 (max safe bottom for x=80)
  NO_ACTION: {
    TITLE:  { x: 120, y: 24,  w: 240, h: 44  },
    MAIN:   { x: 80,  y: 74,  w: 320, h: 342 },
  },

  // full safe inscribed rect — no chrome (session, immersive pages)
  MINIMAL: {
    MAIN:   { x: 80,  y: 62,  w: 320, h: 354 },
  },
};
