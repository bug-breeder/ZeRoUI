/**
 * ZeRoUI design tokens.
 * All values are raw numbers — no px() wrapping needed.
 * hmUI.createWidget() accepts 480-unit design coords;
 * ZeppOS scales to device pixels via designWidth in app.json.
 */

const ACCENT_PRESETS = {
  green:  { primary: 0x30d158, primaryLight: 0x52d985, primaryTint: 0x0c2415, primaryPressed: 0x25a244 },
  blue:   { primary: 0x007aff, primaryLight: 0x4da3ff, primaryTint: 0x001f4d, primaryPressed: 0x0051d5 },
  red:    { primary: 0xfa5151, primaryLight: 0xfd8585, primaryTint: 0x3d0000, primaryPressed: 0xc73d3d },
  orange: { primary: 0xff9f0a, primaryLight: 0xffb84d, primaryTint: 0x3d2200, primaryPressed: 0xcc7a00 },
  purple: { primary: 0xbf5af2, primaryLight: 0xd28af5, primaryTint: 0x2d0060, primaryPressed: 0x9b3de0 },
};

export const COLOR = {
  // Backgrounds
  BG: 0x000000,
  SURFACE: 0x1c1c1e,
  SURFACE_PRESSED: 0x2c2c2e,
  SURFACE_BORDER: 0x2c2c2e,

  // Primary accent — mutable via configure()
  PRIMARY: 0x30d158,
  PRIMARY_LIGHT: 0x52d985,
  PRIMARY_TINT: 0x0c2415,
  PRIMARY_PRESSED: 0x25a244,

  // Secondary (blue — action buttons)
  SECONDARY: 0x007aff,
  SECONDARY_PRESSED: 0x0051d5,

  // Semantic
  DANGER: 0xfa5151,
  SUCCESS: 0x34c759,
  WARNING: 0xff9f0a,

  // Text
  TEXT: 0xffffff,
  TEXT_MUTED: 0x8e8e93,
  TEXT_DISABLED: 0x3a3a3c,
};

/**
 * ZeRoUI design tokens — calibrated for 1.32–1.5" round OLED ZeppOS watches.
 * Target: Amazfit Balance (1.5", 480×480, 453 PPI) and GTR Mini (1.32", 466×466, 500 PPI).
 * Design grid: 12-unit base (12, 24, 36, 48, 60, 72, 96, 120, 132…).
 * All values are ZeppOS design units (designWidth: 480 in app.json).
 * Physical sizes at 453 PPI (1.5"): caption(36)≈2mm · subheadline(48)≈2.7mm
 *   body(60)≈3.4mm · title(72)≈4mm · largeTitle(96)≈5.4mm · hero(120)≈6.7mm
 */
export const TYPOGRAPHY = {
  hero:         120,  // was 60 — immersive full-screen numbers (session page)
  largeTitle:    96,  // was 60 — page title ("Breathe" label)
  title:         72,  // was 44 — prominent numbers (home streak, stats streak)
  body:          60,  // was 40 — technique chip labels
  subheadline:   48,  // was 34 — "day streak", round numbers
  caption:       36,  // was 30 — section labels, DOW headers
};

export const RADIUS = {
  pill: 999,
  chip: 12,
  card: 12,
};

export const SPACING = {
  xs:          6,   // was 4
  sm:         12,   // was 8
  md:         24,   // was 16
  lg:         36,   // was 24
  xl:         48,   // was 32
  chipGap:     6,   // was 4 — gap between stacked chips
  sectionGap: 24,   // was 8 — gap between sections
};

/**
 * Configure accent colors for the app.
 * Call once in app.js before any pages render.
 * Mutates COLOR.PRIMARY* in place — all pages see the updated values.
 *
 * configure({ accent: 'blue' })
 * configure({ accent: { primary: 0x007aff, primaryLight: 0x4da3ff, primaryTint: 0x001f4d, primaryPressed: 0x0051d5 } })
 */
export function configure({ accent } = {}) {
  if (!accent) return;
  const preset = typeof accent === 'string' ? ACCENT_PRESETS[accent] : accent;
  if (!preset) return;
  if (preset.primary !== undefined) COLOR.PRIMARY = preset.primary;
  if (preset.primaryLight !== undefined) COLOR.PRIMARY_LIGHT = preset.primaryLight;
  if (preset.primaryTint !== undefined) COLOR.PRIMARY_TINT = preset.primaryTint;
  if (preset.primaryPressed !== undefined) COLOR.PRIMARY_PRESSED = preset.primaryPressed;
}
