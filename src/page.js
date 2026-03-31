/**
 * renderPage() — full page layout orchestrator.
 *
 * Creates bg, column, masks, title, and action button in correct z-order.
 * Passes the Column to buildFn — callers do NOT create the column separately.
 * Returns the Column for use in rebuild loops.
 *
 * Render order (z-order, low → high):
 *   1. FILL_RECT bg
 *   2. VIEW_CONTAINER (if scrollable)
 *   3. buildFn(col) content
 *   4. Top mask FILL_RECT (hides overflow above MAIN)
 *   5. Title TEXT
 *   6. Bottom mask FILL_RECT (hides overflow below MAIN)
 *   7. Action BUTTON
 */

import hmUI from '@zos/ui';
import { COLOR, TYPOGRAPHY, RADIUS } from './tokens.js';
import { LAYOUT } from './layout.js';
import { Column } from './column.js';

export function renderPage({ layout, buildFn, title: titleText, action, scrollable = true }) {
  // 1. Black background
  hmUI.createWidget(hmUI.widget.FILL_RECT, {
    x: 0, y: 0, w: 480, h: 480,
    color: COLOR.BG,
  });

  // 2. Create Column (VIEW_CONTAINER if scrollable) + run buildFn — lowest z-order content
  const col = layout.MAIN ? new Column(layout.MAIN, { scrollable }) : null;
  if (buildFn && col) buildFn(col);

  // 3. Top mask — hides content that scrolls above MAIN
  if (layout.MAIN && layout.MAIN.y > 0) {
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: 0, y: 0, w: 480, h: layout.MAIN.y,
      color: COLOR.BG,
    });
  }

  // 4. Title text (on top of mask)
  if (titleText && layout.TITLE) {
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: layout.TITLE.x, y: layout.TITLE.y, w: layout.TITLE.w, h: layout.TITLE.h,
      text: titleText,
      text_size: TYPOGRAPHY.subheadline,
      color: COLOR.TEXT,
      align_h: hmUI.align.CENTER_H,
    });
  }

  // 5. Bottom mask — hides content that scrolls below MAIN
  if (layout.MAIN) {
    const mainBottom = layout.MAIN.y + layout.MAIN.h;
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: 0, y: mainBottom, w: 480, h: 480 - mainBottom,
      color: COLOR.BG,
    });
  }

  // 6. Action button — topmost widget
  if (action && layout.ACTION) {
    const z = layout.ACTION;
    const variant = action.variant || 'primary';
    const normalColor = variant === 'secondary' ? COLOR.SECONDARY : COLOR.PRIMARY;
    const pressColor = variant === 'secondary' ? COLOR.SECONDARY_PRESSED : COLOR.PRIMARY_PRESSED;
    hmUI.createWidget(hmUI.widget.BUTTON, {
      x: z.x, y: z.y, w: z.w, h: z.h,
      radius: RADIUS.chip,
      normal_color: normalColor,
      press_color: pressColor,
      text: action.text,
      text_size: TYPOGRAPHY.subheadline,
      color: COLOR.TEXT,
      click_func: action.onPress,
    });
  }

  return col;
}
