/**
 * ZeRoUI components — thin wrappers around hmUI.createWidget().
 * All coordinates in 480-unit design canvas. No px() needed.
 */

import hmUI from '@zos/ui';
import { COLOR, TYPOGRAPHY, RADIUS } from './tokens.js';
import { ZONE } from './zones.js';
import { Column } from './column.js';

// OLED black background — always call first in build()
export function bg() {
  hmUI.createWidget(hmUI.widget.FILL_RECT, {
    x: 0,
    y: 0,
    w: 480,
    h: 480,
    color: COLOR.BG,
  });
}

// Page title in TITLE zone, centered
export function title(text) {
  const z = ZONE.TITLE;
  return hmUI.createWidget(hmUI.widget.TEXT, {
    x: z.x,
    y: z.y,
    w: z.w,
    h: z.h,
    text,
    text_size: TYPOGRAPHY.subheadline,
    color: COLOR.TEXT,
    align_h: hmUI.align.CENTER_H,
  });
}

// Column layout helper, defaults to MAIN zone
export function column(zone = ZONE.MAIN) {
  return new Column(zone);
}

// Primary pill button in ACTION zone
export function actionButton(text, { onPress } = {}) {
  const z = ZONE.ACTION;
  return hmUI.createWidget(hmUI.widget.BUTTON, {
    x: z.x,
    y: z.y,
    w: z.w,
    h: z.h,
    radius: RADIUS.pill,
    normal_color: COLOR.SECONDARY,
    press_color: COLOR.SECONDARY_PRESSED,
    text,
    text_size: TYPOGRAPHY.subheadline,
    color: COLOR.TEXT,
    click_func: onPress,
  });
}

// Large centered number at a specific y position
export function heroText(text, { y, color = COLOR.TEXT } = {}) {
  return hmUI.createWidget(hmUI.widget.TEXT, {
    x: ZONE.MAIN.x,
    y,
    w: ZONE.MAIN.w,
    h: 60,
    text: String(text),
    text_size: TYPOGRAPHY.largeTitle,
    color,
    align_h: hmUI.align.CENTER_H,
  });
}

// Metric display card — returns array of all widgets [bg, value, label]
export function statCard({
  y,
  w = 320,
  h = 80,
  title: cardTitle,
  value,
  valueColor = COLOR.TEXT,
} = {}) {
  const x = Math.round((480 - w) / 2);
  const widgets = [];
  widgets.push(
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x,
      y,
      w,
      h,
      radius: RADIUS.card,
      color: COLOR.SURFACE,
    })
  );
  widgets.push(
    hmUI.createWidget(hmUI.widget.TEXT, {
      x,
      y: y + 10,
      w,
      h: 40,
      text: String(value),
      text_size: TYPOGRAPHY.title,
      color: valueColor,
      align_h: hmUI.align.CENTER_H,
    })
  );
  widgets.push(
    hmUI.createWidget(hmUI.widget.TEXT, {
      x,
      y: y + h - 30,
      w,
      h: 24,
      text: String(cardTitle),
      text_size: TYPOGRAPHY.caption,
      color: COLOR.TEXT_MUTED,
      align_h: hmUI.align.CENTER_H,
    })
  );
  return widgets;
}
