/**
 * Column layout helper — auto y-tracking with widget lifecycle.
 *
 * Pre-calculates positions from known heights (token constants).
 * Never reads rendered widget dimensions — avoids zeppos-zui's
 * fatal layout bug where children were always at y=0.
 *
 * Scrollable mode (scrollable=true):
 *   const col = new Column(zone, { scrollable: true });
 *   col.label('Section');
 *   col.chip('Item', { onPress });
 *   col.finalize();              // required — sets VIEW_CONTAINER height
 *   // on rebuild:
 *   col.clearContent();          // wipe content, keep VIEW_CONTAINER z-order
 *   col.label('Section');
 *   col.finalize();
 *   // in onDestroy:
 *   col.destroyAll();            // full teardown
 */

import hmUI from '@zos/ui';
import { COLOR, TYPOGRAPHY, RADIUS, SPACING } from './tokens.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function resolveTextColor(color) {
  if (typeof color === 'number') return color;
  switch (color) {
    case 'muted':    return COLOR.TEXT_MUTED;
    case 'disabled': return COLOR.TEXT_DISABLED;
    case 'primary':  return COLOR.PRIMARY;
    case 'danger':   return COLOR.DANGER;
    case 'warning':  return COLOR.WARNING;
    case 'success':  return COLOR.SUCCESS;
    default:         return COLOR.TEXT;
  }
}

function resolveAccentColor(color) {
  if (typeof color === 'number') return color;
  switch (color) {
    case 'secondary': return COLOR.SECONDARY;
    case 'danger':    return COLOR.DANGER;
    default:          return COLOR.PRIMARY;
  }
}

function resolveAlign(align) {
  if (align === 'left')  return hmUI.align.LEFT;
  if (align === 'right') return hmUI.align.RIGHT;
  return hmUI.align.CENTER_H;
}

// ─── Column ─────────────────────────────────────────────────────────────────

export class Column {
  constructor(zone, { scrollable = false } = {}) {
    this._zone = zone;
    this._container = null;

    if (scrollable) {
      this._container = hmUI.createWidget(hmUI.widget.VIEW_CONTAINER, {
        x: zone.x,
        y: zone.y,
        w: zone.w,
        h: zone.h,
        scroll_enable: 1,
      });
    }

    this.x = zone.x;
    this.y = zone.y;
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

  // Colors for chip/chipRow based on variant + selected state
  _chipColors(variant, selected) {
    switch (variant) {
      case 'primary':
        return { normalColor: COLOR.PRIMARY, pressColor: COLOR.PRIMARY_PRESSED, textColor: COLOR.TEXT };
      case 'secondary':
        return { normalColor: COLOR.SECONDARY, pressColor: COLOR.SECONDARY_PRESSED, textColor: COLOR.TEXT };
      case 'danger':
        return { normalColor: 0x3d0000, pressColor: 0xc73d3d, textColor: COLOR.DANGER };
      case 'ghost':
        return { normalColor: COLOR.BG, pressColor: COLOR.SURFACE, textColor: COLOR.TEXT_MUTED };
      default: // 'default' — selected state applies
        return selected
          ? { normalColor: COLOR.PRIMARY_TINT, pressColor: COLOR.PRIMARY_PRESSED, textColor: COLOR.PRIMARY }
          : { normalColor: COLOR.SURFACE, pressColor: COLOR.SURFACE_PRESSED, textColor: COLOR.TEXT };
    }
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  // Destroy child widgets only — VIEW_CONTAINER stays alive.
  // Use inside rebuild() so VIEW_CONTAINER keeps its original z-order.
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
  // Must call after every rebuild when scrollable=true. No-op otherwise.
  finalize() {
    if (!this._container) return;
    const contentH = this.y - this._zone.y;
    this._container.setProperty(hmUI.prop.MORE, {
      h: Math.max(contentH, this._zone.h),
    });
  }

  get currentY() {
    return this.y;
  }

  // ── Text ──────────────────────────────────────────────────────────────────

  // Section header — small, muted. Replaces sectionLabel().
  label(text, { color = 'muted', align = 'center' } = {}) {
    const h = TYPOGRAPHY.caption + 4;
    const y = this._slot(h, SPACING.sm);
    return this._create(hmUI.widget.TEXT, {
      x: this.x, y, w: this.w, h,
      text,
      text_size: TYPOGRAPHY.caption,
      color: resolveTextColor(color),
      align_h: resolveAlign(align),
    });
  }

  // General body text. For multiline, pass explicit h.
  text(text, { size = 'body', color = 'default', align = 'center', wrap = false, h: explicitH } = {}) {
    const fontSize = TYPOGRAPHY[size] || TYPOGRAPHY.body;
    const slotH = explicitH !== undefined ? explicitH : fontSize + 4;
    const y = this._slot(slotH, SPACING.sm);
    return this._create(hmUI.widget.TEXT, {
      x: this.x, y, w: this.w, h: slotH,
      text: String(text),
      text_size: fontSize,
      color: resolveTextColor(color),
      align_h: resolveAlign(align),
    });
  }

  // Large centered number (or short text). Absorbed from standalone heroText().
  heroNumber(value, { color = 'default' } = {}) {
    const h = TYPOGRAPHY.largeTitle + 4;
    const y = this._slot(h, SPACING.sm);
    return this._create(hmUI.widget.TEXT, {
      x: this.x, y, w: this.w, h,
      text: String(value),
      text_size: TYPOGRAPHY.largeTitle,
      color: resolveTextColor(color),
      align_h: hmUI.align.CENTER_H,
    });
  }

  // ── Interactive ───────────────────────────────────────────────────────────

  // Full-width chip button.
  // variant: 'default'|'primary'|'secondary'|'danger'|'ghost'
  chip(text, { selected = false, onPress, variant = 'default' } = {}) {
    const h = 48;
    const y = this._slot(h, SPACING.chipGap);
    const { normalColor, pressColor, textColor } = this._chipColors(variant, selected);
    return this._create(hmUI.widget.BUTTON, {
      x: this.x, y, w: this.w, h,
      radius: RADIUS.chip,
      normal_color: normalColor,
      press_color: pressColor,
      text,
      text_size: TYPOGRAPHY.subheadline,
      color: textColor,
      click_func: onPress,
    });
  }

  // Row of N equal-width chips.
  // variant: 'default'|'primary'|'secondary'|'danger'|'ghost'
  chipRow(options, { selected, onPress, variant = 'default' } = {}) {
    const count = options.length;
    const gap = SPACING.sm;
    const chipW = Math.floor((this.w - gap * (count - 1)) / count);
    const h = 48;
    const y = this._slot(h, SPACING.chipGap);
    return options.map((opt, i) => {
      const isSel = variant === 'default' && String(opt) === String(selected);
      const { normalColor, pressColor, textColor } = this._chipColors(variant, isSel);
      return this._create(hmUI.widget.BUTTON, {
        x: this.x + i * (chipW + gap), y, w: chipW, h,
        radius: RADIUS.chip,
        normal_color: normalColor,
        press_color: pressColor,
        text: String(opt),
        text_size: TYPOGRAPHY.subheadline,
        color: textColor,
        click_func: () => onPress && onPress(opt),
      });
    });
  }

  // ── Display ───────────────────────────────────────────────────────────────

  // Metric card — SURFACE background with centered value + label.
  // Absorbed from standalone statCard(). valueColor accepts string alias or raw hex.
  card({ title: cardTitle, value, valueColor = 'default', h: cardH = 80 } = {}) {
    const y = this._slot(cardH, SPACING.chipGap);
    const resolvedValueColor = resolveTextColor(valueColor);
    const widgets = [];
    widgets.push(this._create(hmUI.widget.FILL_RECT, {
      x: this.x, y, w: this.w, h: cardH,
      radius: RADIUS.card, color: COLOR.SURFACE,
    }));
    widgets.push(this._create(hmUI.widget.TEXT, {
      x: this.x, y: y + 10, w: this.w, h: 40,
      text: String(value),
      text_size: TYPOGRAPHY.title,
      color: resolvedValueColor,
      align_h: hmUI.align.CENTER_H,
    }));
    widgets.push(this._create(hmUI.widget.TEXT, {
      x: this.x, y: y + cardH - 30, w: this.w, h: 24,
      text: String(cardTitle),
      text_size: TYPOGRAPHY.caption,
      color: COLOR.TEXT_MUTED,
      align_h: hmUI.align.CENTER_H,
    }));
    return widgets;
  }

  // Horizontal progress bar. value: 0.0–1.0.
  // color: 'primary'|'secondary'|'danger' or raw hex.
  progressBar(value, { color = 'primary', h: barH = 8, radius: barRadius = 4 } = {}) {
    const totalH = barH + SPACING.sm * 2;
    const y = this._slot(totalH, 0);
    const barY = y + SPACING.sm;
    const resolvedColor = resolveAccentColor(color);
    const track = this._create(hmUI.widget.FILL_RECT, {
      x: this.x, y: barY, w: this.w, h: barH,
      radius: barRadius, color: COLOR.SURFACE,
    });
    const fillW = Math.round(this.w * Math.min(1, Math.max(0, value)));
    const fill = fillW > 0
      ? this._create(hmUI.widget.FILL_RECT, {
          x: this.x, y: barY, w: fillW, h: barH,
          radius: barRadius, color: resolvedColor,
        })
      : null;
    return [track, fill];
  }

  // Image widget, centered in column width.
  image(src, { w: imgW, h: imgH } = {}) {
    const w = imgW !== undefined ? imgW : this.w;
    const h = imgH !== undefined ? imgH : this.w;
    const x = this.x + Math.round((this.w - w) / 2);
    const y = this._slot(h, SPACING.sm);
    return this._create(hmUI.widget.IMG, { x, y, w, h, src });
  }

  // ── Structure ─────────────────────────────────────────────────────────────

  // Thin horizontal separator.
  divider({ color = 'surface', margin = SPACING.xs } = {}) {
    const h = 1;
    const totalH = h + margin * 2;
    const y = this._slot(totalH, 0);
    const resolved = color === 'surface' ? COLOR.SURFACE : resolveTextColor(color);
    return this._create(hmUI.widget.FILL_RECT, {
      x: this.x, y: y + margin, w: this.w, h,
      color: resolved,
    });
  }

  // Add vertical gap — no widget created.
  spacer(n) {
    this.y += n;
  }

  // ── Escape hatch ──────────────────────────────────────────────────────────

  // Raw hmUI widget with explicit h for y-tracking. Props are passed as-is.
  // Read col.currentY BEFORE calling to get the correct y for props.
  // e.g.: col.widget(hmUI.widget.ARC, { x: 40, y: col.currentY, w: 400, h: 400, ... }, 400)
  widget(type, props, h) {
    this.y += h;
    const w = hmUI.createWidget(type, props);
    if (w) this._widgets.push(w);
    return w;
  }
}
