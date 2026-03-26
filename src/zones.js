/**
 * Round-display safe zones for 480×480 design canvas.
 *
 * A round display clips content near the top/bottom edges.
 * Three zones of progressively different widths ensure all
 * content stays visible inside the circle (radius 240).
 *
 * All values in 480-unit design coords — no px() needed.
 */

export const ZONE = {
  // Narrow strip at top — page titles (max ~12 chars at subheadline)
  // At y=40: chord width ≈ 265 > 240 ✓
  TITLE: { x: 120, y: 40, w: 240, h: 44 },

  // Main content area — inscribed safe rectangle
  // All 4 corners inside circle (max dist from center ≈ 224 < 240) ✓
  MAIN: { x: 80, y: 84, w: 320, h: 300 },

  // Narrow strip at bottom — primary action button
  // At y=440 (bottom edge): chord width ≈ 265 > 200 ✓
  ACTION: { x: 140, y: 392, w: 200, h: 48 },
};
