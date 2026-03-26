/**
 * Column layout helper — auto y-tracking with widget lifecycle.
 *
 * Scrollable mode:
 *   const col = new Column(zone, { scrollable: true });
 *   // add items...
 *   col.finalize();           // must call after all items added
 *   // on chip selection:
 *   col.clearContent();       // wipe chips, keep VIEW_CONTAINER z-order
 *   // re-add items...
 *   col.finalize();
 *   // in onDestroy:
 *   col.destroyAll();         // full teardown
 *
 * Non-scrollable mode: API unchanged from before.
 */

import hmUI from '@zos/ui';
import { COLOR, TYPOGRAPHY, RADIUS, SPACING } from './tokens.js';

export class Column {
  constructor(zone, { scrollable = false } = {}) {
    this._scrollable = scrollable;
    this._zone = zone;
    this._container = null;

    if (scrollable) {
      // Create the scrollable viewport. Widgets added after this widget and
      // positioned within its bounds are adopted as scrollable children.
      // Child widget coordinates are in container-local space (0,0 = top-left
      // of container, not top-left of screen).
      this._container = hmUI.createWidget(hmUI.widget.VIEW_CONTAINER, {
        x: zone.x,
        y: zone.y,
        w: zone.w,
        h: zone.h,
        scroll_enable: 1,
      });
      this.x = 0;
      this.y = 0;
    } else {
      this.x = zone.x;
      this.y = zone.y;
    }

    this.w = zone.w;
    this._startY = this.y;
    this._widgets = [];
  }

  // Reserve h design-units, return y where the item should draw
  _slot(h, gapAfter = 0) {
    const y = this.y;
    this.y += h + gapAfter;
    return y;
  }

  // Create widget and track it for clearContent() / destroyAll()
  _create(type, props) {
    const w = hmUI.createWidget(type, props);
    if (w) this._widgets.push(w);
    return w;
  }

  // Destroy child widgets only — VIEW_CONTAINER stays alive.
  // Use this inside rebuild() so VIEW_CONTAINER keeps its original z-order.
  clearContent() {
    this._widgets.forEach((w) => hmUI.deleteWidget(w));
    this._widgets = [];
    this.y = this._startY;
  }

  // Full teardown: child widgets + VIEW_CONTAINER.
  // Call only in page onDestroy(), never inside rebuild().
  destroyAll() {
    this.clearContent();
    if (this._container) {
      hmUI.deleteWidget(this._container);
      this._container = null;
    }
  }

  // Set VIEW_CONTAINER total scrollable height after all items are added.
  // Must call after every rebuild when scrollable=true.
  // VIEW_CONTAINER defaults to viewport height — without finalize(), content
  // taller than the viewport is silently cut off rather than scrollable.
  finalize() {
    if (!this._container) return;
    this._container.setProperty(hmUI.prop.MORE, {
      h: Math.max(this.y, this._zone.h),
    });
  }

  sectionLabel(text) {
    const h = 34;
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
    const h = 48;
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
    const h = 48;
    const y = this._slot(h, SPACING.chipGap);
    return options.map((opt, i) => {
      const isSel = String(opt) === String(selected);
      return this._create(hmUI.widget.BUTTON, {
        x: this.x + i * (chipW + gap),
        y,
        w: chipW,
        h,
        radius: RADIUS.chip,
        normal_color: isSel ? COLOR.PRIMARY_TINT : COLOR.SURFACE,
        press_color: isSel ? COLOR.PRIMARY_PRESSED : COLOR.SURFACE_PRESSED,
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
