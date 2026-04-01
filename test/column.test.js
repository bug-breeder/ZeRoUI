import { beforeEach, describe, expect, it, vi } from 'vitest';
import hmUI from './__mocks__/zos-ui.js';
import { Column } from '../src/column.js';
import { COLOR } from '../src/tokens.js';

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

  it('heroNumber() advances by largeTitle+4 plus sm gap', () => {
    const col = new Column(zone);
    col.heroNumber(42);
    expect(col.currentY).toBe(186); // 74 + (96+4) + 12
  });

  it('chip() advances by 48 plus chipGap', () => {
    const col = new Column(zone);
    col.chip('X');
    expect(col.currentY).toBe(128); // 74 + 48 + 6
  });

  it('chipRow() advances by 48 plus chipGap (one row, any count)', () => {
    const col = new Column(zone);
    col.chipRow(['A', 'B', 'C']);
    expect(col.currentY).toBe(128); // 74 + 48 + 6
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
    col.chip('A');           // +54 → 180
    col.chip('B');           // +54 → 234
    expect(col.currentY).toBe(234);
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
    expect(calls[0][1].normal_color).toBe(COLOR.SURFACE);        // '1' unselected
    expect(calls[1][1].normal_color).toBe(COLOR.PRIMARY_TINT);   // '2' selected
    expect(calls[2][1].normal_color).toBe(COLOR.SURFACE);        // '3' unselected
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
    vi.clearAllMocks(); // reset counts before clearContent
    col.clearContent();
    expect(hmUI.deleteWidget).toHaveBeenCalledTimes(3);
  });

  it('scrollable: finalize() calls setProperty on the VIEW_CONTAINER', () => {
    const col = new Column(zone, { scrollable: true });
    col.chip('A');
    col.finalize();
    // VIEW_CONTAINER is the first createWidget call in a scrollable column
    const container = hmUI.createWidget.mock.results[0].value;
    expect(container.setProperty).toHaveBeenCalledWith('MORE', {
      h: expect.any(Number),
    });
  });

  it('scrollable: finalize() sets h >= zone.h', () => {
    const col = new Column(zone, { scrollable: true });
    col.finalize(); // no content — h should be at least zone.h
    const container = hmUI.createWidget.mock.results[0].value;
    const callArgs = container.setProperty.mock.calls[0];
    expect(callArgs[1].h).toBeGreaterThanOrEqual(zone.h);
  });

  it('non-scrollable: finalize() is a no-op', () => {
    const col = new Column(zone); // non-scrollable — no VIEW_CONTAINER
    col.chip('A');
    col.finalize();
    // The chip widget should not have had setProperty called on it
    const chipWidget = hmUI.createWidget.mock.results[0].value;
    expect(chipWidget.setProperty).not.toHaveBeenCalled();
  });
});
