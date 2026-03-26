/**
 * Column layout helper — auto y-tracking with widget lifecycle.
 *
 * Pre-calculates positions from known heights (token constants).
 * Never reads rendered widget dimensions — avoids zeppos-zui's
 * fatal layout bug where children were always at y=0.
 */

import hmUI from '@zos/ui';
import { COLOR, TYPOGRAPHY, RADIUS, SPACING } from './tokens.js';

export class Column {
  constructor(zone) {
    this.x = zone.x;
    this.w = zone.w;
    this.y = zone.y;
    this._startY = zone.y;
    this._widgets = [];
  }

  // Reserve h design-units, return y where the item should draw
  _slot(h, gapAfter = 0) {
    const y = this.y;
    this.y += h + gapAfter;
    return y;
  }

  // Create widget and track it for destroyAll()
  _create(type, props) {
    const w = hmUI.createWidget(type, props);
    if (w) this._widgets.push(w);
    return w;
  }

  // Delete all widgets created by this Column, reset y to start
  destroyAll() {
    this._widgets.forEach((w) => hmUI.deleteWidget(w));
    this._widgets = [];
    this.y = this._startY;
  }

  sectionLabel(text) {
    const h = 28;
    const y = this._slot(h, SPACING.sm);
    return this._create(hmUI.widget.TEXT, {
      x: this.x,
      y,
      w: this.w,
      h,
      text,
      text_size: TYPOGRAPHY.caption,
      color: COLOR.TEXT_MUTED,
      align_h: hmUI.align.CENTER_H,
    });
  }

  chip(text, { selected = false, onPress } = {}) {
    const h = 44;
    const y = this._slot(h, SPACING.chipGap);
    return this._create(hmUI.widget.BUTTON, {
      x: this.x,
      y,
      w: this.w,
      h,
      radius: RADIUS.chip,
      normal_color: selected ? COLOR.PRIMARY_TINT : COLOR.SURFACE,
      press_color: selected ? COLOR.PRIMARY_PRESSED : COLOR.SURFACE_PRESSED,
      text,
      text_size: TYPOGRAPHY.subheadline,
      color: selected ? COLOR.PRIMARY : COLOR.TEXT,
      click_func: onPress,
    });
  }

  chipRow(options, { selected, onPress } = {}) {
    const count = options.length;
    const gap = SPACING.sm;
    const chipW = Math.floor((this.w - gap * (count - 1)) / count);
    const h = 44;
    const y = this._slot(h, SPACING.chipGap);
    return options.map((opt, i) => {
      const isSel = String(opt) === String(selected);
      return this._create(hmUI.widget.BUTTON, {
        x: this.x + i * (chipW + gap),
        y,
        w: chipW,
        h,
        radius: RADIUS.pill,
        normal_color: isSel ? COLOR.PRIMARY_TINT : COLOR.SURFACE,
        press_color: COLOR.SURFACE_PRESSED,
        text: String(opt),
        text_size: TYPOGRAPHY.subheadline,
        color: isSel ? COLOR.PRIMARY : COLOR.TEXT,
        click_func: () => onPress && onPress(opt),
      });
    });
  }

  spacer(n) {
    this.y += n;
  }

  get currentY() {
    return this.y;
  }
}
