/**
 * ZeRoUI design tokens.
 * All values are raw numbers — no px() wrapping needed.
 * hmUI.createWidget() accepts 480-unit design coords;
 * ZeppOS scales to device pixels via designWidth in app.json.
 */

export const COLOR = {
  // Backgrounds
  BG: 0x000000, // OLED black
  SURFACE: 0x1c1c1e, // chip / card background (unselected)
  SURFACE_PRESSED: 0x2c2c2e, // pressed surface
  SURFACE_BORDER: 0x2c2c2e, // chip outline (unselected)

  // Primary (green — selected state, progress)
  PRIMARY: 0x30d158,
  PRIMARY_TINT: 0x0c2415, // dark green bg for selected chip
  PRIMARY_PRESSED: 0x25a244, // pressed selected chip

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

export const TYPOGRAPHY = {
  largeTitle: 60, // hero numbers
  title: 44, // section titles
  body: 40, // body text
  subheadline: 34, // chips, buttons
  caption: 30, // section labels, hints (minimum legible)
};

export const RADIUS = {
  pill: 999, // fully rounded ends (chipRow items, action button)
  chip: 12, // standard chip corner
  card: 12, // stat cards, surfaces
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  chipGap: 4, // between stacked chips (reduced to keep setup layout in MAIN zone)
  sectionGap: 8, // after last chip before next section label
};
