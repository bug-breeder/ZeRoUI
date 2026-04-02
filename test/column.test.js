import { beforeEach, describe, expect, it, vi } from 'vitest';
import hmUI from './__mocks__/zos-ui.js';
import { Column } from '../src/column.js';
import { COLOR, RADIUS } from '../src/tokens.js';

const zone = { x: 80, y: 74, w: 320, h: 312 };

beforeEach(() => vi.clearAllMocks());

// ── Y-tracking ────────────────────────────────────────────────────────────────

describe('Column y-tracking', () => {
  it('starts at zone.y', () => {
    const col = new Column(zone);
    expect(col.currentY).toBe(74);
  });

  it('label() advances by caption+4 height plus sm gap', () => {
    const col = new Column(zone);
    col.label('X');
    expect(col.currentY).toBe(126); // 74 + (36+4) + 12
  });

  it('text() with default size advances by body+4 plus sm gap', () => {
    const col = new Column(zone);
    col.text('X');
    expect(col.currentY).toBe(150); // 74 + (60+4) + 12
  });

  it('text() with largeTitle size advances by largeTitle+4 plus sm gap', () => {
    const col = new Column(zone);
    col.text('X', { size: 'largeTitle' });
    expect(col.currentY).toBe(186); // 74 + (96+4) + 12
  });

  it('text() with title size advances by title+4 plus sm gap', () => {
    const col = new Column(zone);
    col.text('X', { size: 'title' });
    expect(col.currentY).toBe(162); // 74 + (72+4) + 12
  });

  it('heroNumber() advances by largeTitle+4 plus sm gap', () => {
    const col = new Column(zone);
    col.heroNumber(42);
    expect(col.currentY).toBe(186); // 74 + (96+4) + 12
  });

  it('chip() default h=120 advances by 120 plus chipGap', () => {
    const col = new Column(zone);
    col.chip('X');
    expect(col.currentY).toBe(200); // 74 + 120 + 6
  });

  it('chipRow() default h=96 advances by 96 plus chipGap (one row, any count)', () => {
    const col = new Column(zone);
    col.chipRow(['A', 'B', 'C']);
    expect(col.currentY).toBe(176); // 74 + 96 + 6
  });

  it('card() advances by h plus chipGap', () => {
    const col = new Column(zone);
    col.card({ title: 'x', value: '7', h: 80 });
    expect(col.currentY).toBe(160); // 74 + 80 + 6
  });

  it('spacer() advances by n with no widget', () => {
    const col = new Column(zone);
    col.spacer(16);
    expect(col.currentY).toBe(90); // 74 + 16
    expect(hmUI.createWidget).not.toHaveBeenCalled();
  });

  it('progressBar() advances by barH + 2*sm', () => {
    const col = new Column(zone);
    col.progressBar(0.5);
    expect(col.currentY).toBe(106); // 74 + 8 + 12*2
  });

  it('divider() advances by 1 + 2*xs', () => {
    const col = new Column(zone);
    col.divider();
    expect(col.currentY).toBe(87); // 74 + 1 + 6*2
  });

  it('widget() advances by explicit h', () => {
    const col = new Column(zone);
    col.widget('FILL_RECT', { x: 80, y: 74, w: 320, h: 100 }, 100);
    expect(col.currentY).toBe(174); // 74 + 100
  });

  it('multiple methods accumulate y correctly', () => {
    const col = new Column(zone);
    col.label('Section');   // +52 → 126
    col.chip('A');           // +126 → 252
    col.chip('B');           // +126 → 378
    expect(col.currentY).toBe(378);
  });
});

// ── chip() radius and h options ───────────────────────────────────────────────

describe('Column chip() radius and h options', () => {
  it('default radius is RADIUS.chip (12)', () => {
    const col = new Column(zone);
    col.chip('X');
    const call = hmUI.createWidget.mock.calls[0];
    expect(call[1].radius).toBe(12);
  });

  it('explicit radius is passed to widget', () => {
    const col = new Column(zone);
    col.chip('X', { radius: 999 });
    const call = hmUI.createWidget.mock.calls[0];
    expect(call[1].radius).toBe(999);
  });

  it('explicit h overrides default for y-tracking', () => {
    const col = new Column(zone);
    col.chip('X', { h: 48 });
    expect(col.currentY).toBe(74 + 48 + 6); // 128
  });

  it('explicit h is passed to widget', () => {
    const col = new Column(zone);
    col.chip('X', { h: 48 });
    const call = hmUI.createWidget.mock.calls[0];
    expect(call[1].h).toBe(48);
  });

  it('explicit w centers the button within the column', () => {
    const col = new Column(zone); // zone.x=80, zone.w=320
    col.chip('X', { w: 192 });
    const call = hmUI.createWidget.mock.calls[0];
    expect(call[1].w).toBe(192);
    expect(call[1].x).toBe(144); // 80 + Math.floor((320-192)/2) = 80+64=144
  });

  it('w larger than column width is clamped to column width', () => {
    const col = new Column(zone);
    col.chip('X', { w: 999 });
    const call = hmUI.createWidget.mock.calls[0];
    expect(call[1].w).toBe(320);
    expect(call[1].x).toBe(80); // no offset when w === column width
  });

  it('y-tracking is unaffected by w option', () => {
    const col = new Column(zone);
    col.chip('X', { w: 192 });
    expect(col.currentY).toBe(200); // 74 + 120 + 6 — same as without w
  });
});

// ── chipRow() radius and h options ────────────────────────────────────────────

describe('Column chipRow() radius and h options', () => {
  it('default radius is RADIUS.chip (12)', () => {
    const col = new Column(zone);
    col.chipRow(['A', 'B']);
    const calls = hmUI.createWidget.mock.calls;
    expect(calls[0][1].radius).toBe(12);
    expect(calls[1][1].radius).toBe(12);
  });

  it('explicit radius is applied to all chips', () => {
    const col = new Column(zone);
    col.chipRow(['A', 'B'], { radius: 999 });
    const calls = hmUI.createWidget.mock.calls;
    expect(calls[0][1].radius).toBe(999);
    expect(calls[1][1].radius).toBe(999);
  });

  it('explicit h overrides default for y-tracking', () => {
    const col = new Column(zone);
    col.chipRow(['A', 'B'], { h: 48 });
    expect(col.currentY).toBe(74 + 48 + 6); // 128
  });

  it('explicit h is passed to each widget', () => {
    const col = new Column(zone);
    col.chipRow(['A', 'B'], { h: 48 });
    const calls = hmUI.createWidget.mock.calls;
    expect(calls[0][1].h).toBe(48);
    expect(calls[1][1].h).toBe(48);
  });
});

// ── Chip variants ─────────────────────────────────────────────────────────────

describe('Column chip variants', () => {
  it('default unselected uses SURFACE background and TEXT color', () => {
    const col = new Column(zone);
    col.chip('X', { variant: 'default', selected: false });
    const call = hmUI.createWidget.mock.calls[0];
    expect(call[1].normal_color).toBe(COLOR.SURFACE);
    expect(call[1].color).toBe(COLOR.TEXT);
  });

  it('default selected uses PRIMARY_TINT background and PRIMARY text', () => {
    const col = new Column(zone);
    col.chip('X', { variant: 'default', selected: true });
    const call = hmUI.createWidget.mock.calls[0];
    expect(call[1].normal_color).toBe(COLOR.PRIMARY_TINT);
    expect(call[1].color).toBe(COLOR.PRIMARY);
  });

  it('primary variant uses PRIMARY background', () => {
    const col = new Column(zone);
    col.chip('X', { variant: 'primary' });
    const call = hmUI.createWidget.mock.calls[0];
    expect(call[1].normal_color).toBe(COLOR.PRIMARY);
  });

  it('secondary variant uses SECONDARY background', () => {
    const col = new Column(zone);
    col.chip('X', { variant: 'secondary' });
    const call = hmUI.createWidget.mock.calls[0];
    expect(call[1].normal_color).toBe(COLOR.SECONDARY);
  });

  it('danger variant uses DANGER text color', () => {
    const col = new Column(zone);
    col.chip('X', { variant: 'danger' });
    const call = hmUI.createWidget.mock.calls[0];
    expect(call[1].color).toBe(COLOR.DANGER);
  });

  it('ghost variant uses BG background and TEXT_MUTED text', () => {
    const col = new Column(zone);
    col.chip('X', { variant: 'ghost' });
    const call = hmUI.createWidget.mock.calls[0];
    expect(call[1].normal_color).toBe(COLOR.BG);
    expect(call[1].color).toBe(COLOR.TEXT_MUTED);
  });
});

// ── chipRow selected logic ────────────────────────────────────────────────────

describe('Column chipRow selected logic', () => {
  it('default variant: selected chip gets PRIMARY_TINT, others get SURFACE', () => {
    const col = new Column(zone);
    col.chipRow(['1', '2', '3'], { selected: '2', variant: 'default' });
    const calls = hmUI.createWidget.mock.calls;
    expect(calls[0][1].normal_color).toBe(COLOR.SURFACE);
    expect(calls[1][1].normal_color).toBe(COLOR.PRIMARY_TINT);
    expect(calls[2][1].normal_color).toBe(COLOR.SURFACE);
  });

  it('primary variant: all chips use PRIMARY regardless of selected', () => {
    const col = new Column(zone);
    col.chipRow(['A', 'B'], { selected: 'A', variant: 'primary' });
    const calls = hmUI.createWidget.mock.calls;
    expect(calls[0][1].normal_color).toBe(COLOR.PRIMARY);
    expect(calls[1][1].normal_color).toBe(COLOR.PRIMARY);
  });
});

// ── Text color resolution ─────────────────────────────────────────────────────

describe('Column text color resolution', () => {
  it("color:'warning' resolves to COLOR.WARNING", () => {
    const col = new Column(zone);
    col.text('X', { color: 'warning' });
    const call = hmUI.createWidget.mock.calls[0];
    expect(call[1].color).toBe(COLOR.WARNING);
  });

  it("color:'muted' resolves to COLOR.TEXT_MUTED", () => {
    const col = new Column(zone);
    col.text('X', { color: 'muted' });
    const call = hmUI.createWidget.mock.calls[0];
    expect(call[1].color).toBe(COLOR.TEXT_MUTED);
  });

  it('raw hex number passes through unchanged', () => {
    const col = new Column(zone);
    col.text('X', { color: 0xabcdef });
    const call = hmUI.createWidget.mock.calls[0];
    expect(call[1].color).toBe(0xabcdef);
  });

  it('label() defaults to COLOR.TEXT_MUTED', () => {
    const col = new Column(zone);
    col.label('X');
    const call = hmUI.createWidget.mock.calls[0];
    expect(call[1].color).toBe(COLOR.TEXT_MUTED);
  });
});

// ── Lifecycle ─────────────────────────────────────────────────────────────────

describe('Column lifecycle', () => {
  it('clearContent() resets currentY to zone.y', () => {
    const col = new Column(zone);
    col.chip('A');
    col.chip('B');
    col.chip('C');
    col.clearContent();
    expect(col.currentY).toBe(zone.y);
  });

  it('clearContent() calls deleteWidget for each tracked widget', () => {
    const col = new Column(zone);
    col.chip('A');
    col.chip('B');
    col.chip('C');
    vi.clearAllMocks();
    col.clearContent();
    expect(hmUI.deleteWidget).toHaveBeenCalledTimes(3);
  });

  it('scrollable: finalize() calls setProperty on the VIEW_CONTAINER', () => {
    const col = new Column(zone, { scrollable: true });
    col.chip('A');
    col.finalize();
    const container = hmUI.createWidget.mock.results[0].value;
    expect(container.setProperty).toHaveBeenCalledWith('MORE', {
      h: expect.any(Number),
    });
  });

  it('scrollable: finalize() sets h >= zone.h', () => {
    const col = new Column(zone, { scrollable: true });
    col.finalize();
    const container = hmUI.createWidget.mock.results[0].value;
    const callArgs = container.setProperty.mock.calls[0];
    expect(callArgs[1].h).toBeGreaterThanOrEqual(zone.h);
  });

  it('non-scrollable: finalize() is a no-op', () => {
    const col = new Column(zone);
    col.chip('A');
    col.finalize();
    const chipWidget = hmUI.createWidget.mock.results[0].value;
    expect(chipWidget.setProperty).not.toHaveBeenCalled();
  });
});
