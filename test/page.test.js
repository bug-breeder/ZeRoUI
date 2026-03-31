import { beforeEach, describe, expect, it, vi } from 'vitest';
import hmUI from './__mocks__/zos-ui.js';
import { renderPage } from '../src/page.js';
import { LAYOUT } from '../src/layout.js';
import { COLOR } from '../src/tokens.js';

beforeEach(() => vi.clearAllMocks());

describe('renderPage z-order', () => {
  it('creates FILL_RECT bg as the very first widget', () => {
    renderPage({ layout: LAYOUT.FULL, buildFn: () => {} });
    const firstCall = hmUI.createWidget.mock.calls[0];
    expect(firstCall[0]).toBe('FILL_RECT');
    expect(firstCall[1]).toMatchObject({ x: 0, y: 0, w: 480, h: 480, color: COLOR.BG });
  });

  it('creates a top mask FILL_RECT when MAIN.y > 0', () => {
    renderPage({ layout: LAYOUT.FULL, buildFn: () => {} });
    const rects = hmUI.createWidget.mock.calls.filter(c => c[0] === 'FILL_RECT');
    const topMask = rects.find(c => c[1].y === 0 && c[1].h === LAYOUT.FULL.MAIN.y);
    expect(topMask).toBeDefined();
  });

  it('creates a bottom mask FILL_RECT below MAIN', () => {
    renderPage({ layout: LAYOUT.FULL, buildFn: () => {} });
    const mainBottom = LAYOUT.FULL.MAIN.y + LAYOUT.FULL.MAIN.h;
    const rects = hmUI.createWidget.mock.calls.filter(c => c[0] === 'FILL_RECT');
    const bottomMask = rects.find(c => c[1].y === mainBottom);
    expect(bottomMask).toBeDefined();
  });

  it('creates title TEXT when title and layout.TITLE are provided', () => {
    renderPage({ layout: LAYOUT.FULL, title: 'My Page', buildFn: () => {} });
    const textCalls = hmUI.createWidget.mock.calls.filter(c => c[0] === 'TEXT');
    const titleWidget = textCalls.find(c => c[1].text === 'My Page');
    expect(titleWidget).toBeDefined();
    expect(titleWidget[1].y).toBe(LAYOUT.FULL.TITLE.y);
  });

  it('does not create title TEXT when layout has no TITLE zone', () => {
    renderPage({ layout: LAYOUT.MINIMAL, title: 'Ignored', buildFn: () => {} });
    const textCalls = hmUI.createWidget.mock.calls.filter(c => c[0] === 'TEXT');
    expect(textCalls).toHaveLength(0);
  });

  it('creates action BUTTON when action and layout.ACTION are provided', () => {
    renderPage({
      layout: LAYOUT.FULL,
      buildFn: () => {},
      action: { text: 'Go', onPress: () => {} },
    });
    const buttonCalls = hmUI.createWidget.mock.calls.filter(c => c[0] === 'BUTTON');
    expect(buttonCalls).toHaveLength(1);
    expect(buttonCalls[0][1].text).toBe('Go');
  });
});

describe('renderPage column param and return value', () => {
  it('buildFn receives a Column instance', () => {
    let received = null;
    renderPage({ layout: LAYOUT.FULL, buildFn: (c) => { received = c; } });
    expect(received).not.toBeNull();
    expect(typeof received.chip).toBe('function');
    expect(typeof received.finalize).toBe('function');
  });

  it('returns the same column instance passed to buildFn', () => {
    let buildFnCol = null;
    const returned = renderPage({ layout: LAYOUT.FULL, buildFn: (c) => { buildFnCol = c; } });
    expect(returned).toBe(buildFnCol);
  });
});

describe('renderPage scrollable param', () => {
  it('creates VIEW_CONTAINER by default (scrollable:true)', () => {
    renderPage({ layout: LAYOUT.FULL, buildFn: () => {} });
    const types = hmUI.createWidget.mock.calls.map(c => c[0]);
    expect(types).toContain('VIEW_CONTAINER');
  });

  it('does not create VIEW_CONTAINER when scrollable:false', () => {
    renderPage({ layout: LAYOUT.FULL, scrollable: false, buildFn: () => {} });
    const types = hmUI.createWidget.mock.calls.map(c => c[0]);
    expect(types).not.toContain('VIEW_CONTAINER');
  });
});

describe('renderPage action variant', () => {
  it('action button uses PRIMARY by default', () => {
    renderPage({
      layout: LAYOUT.FULL,
      buildFn: () => {},
      action: { text: 'Go', onPress: () => {} },
    });
    const buttons = hmUI.createWidget.mock.calls.filter(c => c[0] === 'BUTTON');
    expect(buttons[0][1].normal_color).toBe(COLOR.PRIMARY);
  });

  it('action button uses SECONDARY when variant is secondary', () => {
    renderPage({
      layout: LAYOUT.FULL,
      buildFn: () => {},
      action: { text: 'Go', onPress: () => {}, variant: 'secondary' },
    });
    const buttons = hmUI.createWidget.mock.calls.filter(c => c[0] === 'BUTTON');
    expect(buttons[0][1].normal_color).toBe(COLOR.SECONDARY);
  });
});
