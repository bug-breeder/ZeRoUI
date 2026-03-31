/**
 * Page chrome components — standalone wrappers for page-level elements.
 * For new components, add them here until chrome.js grows large enough
 * to warrant splitting into src/components/.
 */

import hmUI from '@zos/ui';
import { COLOR, TYPOGRAPHY, RADIUS } from './tokens.js';
import { LAYOUT } from './layout.js';
import { Column } from './column.js';

// OLED black background — call first in build() when not using renderPage()
export function bg() {
  hmUI.createWidget(hmUI.widget.FILL_RECT, {
    x: 0, y: 0, w: 480, h: 480,
    color: COLOR.BG,
  });
}

// Page title. layout param defaults to LAYOUT.FULL for standalone use.
export function title(text, { layout = LAYOUT.FULL } = {}) {
  const z = layout.TITLE || LAYOUT.FULL.TITLE;
  return hmUI.createWidget(hmUI.widget.TEXT, {
    x: z.x, y: z.y, w: z.w, h: z.h,
    text,
    text_size: TYPOGRAPHY.subheadline,
    color: COLOR.TEXT,
    align_h: hmUI.align.CENTER_H,
  });
}

// Column layout helper — standalone factory for custom layouts outside renderPage().
export function column(zone = LAYOUT.FULL.MAIN, opts = {}) {
  return new Column(zone, opts);
}

// Action button. variant: 'primary' (default) | 'secondary'.
export function actionButton(text, { onPress, variant = 'primary', layout = LAYOUT.FULL } = {}) {
  const z = layout.ACTION || LAYOUT.FULL.ACTION;
  const normalColor = variant === 'secondary' ? COLOR.SECONDARY : COLOR.PRIMARY;
  const pressColor = variant === 'secondary' ? COLOR.SECONDARY_PRESSED : COLOR.PRIMARY_PRESSED;
  return hmUI.createWidget(hmUI.widget.BUTTON, {
    x: z.x, y: z.y, w: z.w, h: z.h,
    radius: RADIUS.chip,
    normal_color: normalColor,
    press_color: pressColor,
    text,
    text_size: TYPOGRAPHY.subheadline,
    color: COLOR.TEXT,
    click_func: onPress,
  });
}
