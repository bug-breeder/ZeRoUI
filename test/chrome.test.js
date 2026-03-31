import { beforeEach, describe, expect, it, vi } from 'vitest';
import hmUI from './__mocks__/zos-ui.js';
import { actionButton, title } from '../src/chrome.js';
import { LAYOUT } from '../src/layout.js';
import { COLOR } from '../src/tokens.js';

beforeEach(() => vi.clearAllMocks());

describe('actionButton()', () => {
  it('uses PRIMARY by default', () => {
    actionButton('Go', { onPress: () => {} });
    const call = hmUI.createWidget.mock.calls[0];
    expect(call[0]).toBe('BUTTON');
    expect(call[1].normal_color).toBe(COLOR.PRIMARY);
    expect(call[1].press_color).toBe(COLOR.PRIMARY_PRESSED);
  });

  it('uses SECONDARY for secondary variant', () => {
    actionButton('Cancel', { onPress: () => {}, variant: 'secondary' });
    const call = hmUI.createWidget.mock.calls[0];
    expect(call[1].normal_color).toBe(COLOR.SECONDARY);
    expect(call[1].press_color).toBe(COLOR.SECONDARY_PRESSED);
  });

  it('places button in ACTION zone by default', () => {
    actionButton('Go', { onPress: () => {} });
    const call = hmUI.createWidget.mock.calls[0];
    expect(call[1].x).toBe(LAYOUT.FULL.ACTION.x);
    expect(call[1].y).toBe(LAYOUT.FULL.ACTION.y);
    expect(call[1].w).toBe(LAYOUT.FULL.ACTION.w);
    expect(call[1].h).toBe(LAYOUT.FULL.ACTION.h);
  });
});

describe('title()', () => {
  it('uses LAYOUT.FULL.TITLE zone by default', () => {
    title('My Page');
    const call = hmUI.createWidget.mock.calls[0];
    expect(call[0]).toBe('TEXT');
    expect(call[1].x).toBe(LAYOUT.FULL.TITLE.x);
    expect(call[1].y).toBe(LAYOUT.FULL.TITLE.y);
    expect(call[1].w).toBe(LAYOUT.FULL.TITLE.w);
    expect(call[1].h).toBe(LAYOUT.FULL.TITLE.h);
  });

  it('uses provided layout.TITLE zone when specified', () => {
    title('My Page', { layout: LAYOUT.NO_ACTION });
    const call = hmUI.createWidget.mock.calls[0];
    expect(call[1].x).toBe(LAYOUT.NO_ACTION.TITLE.x);
    expect(call[1].y).toBe(LAYOUT.NO_ACTION.TITLE.y);
  });

  it('renders the text prop correctly', () => {
    title('Hello World');
    const call = hmUI.createWidget.mock.calls[0];
    expect(call[1].text).toBe('Hello World');
  });
});
