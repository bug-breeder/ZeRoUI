import { describe, expect, it } from 'vitest';
import { LAYOUT } from '../src/layout.js';

describe('LAYOUT.FULL', () => {
  it('MAIN zone has correct coordinates', () => {
    expect(LAYOUT.FULL.MAIN).toEqual({ x: 80, y: 84, w: 320, h: 288 });
  });

  it('TITLE zone has correct coordinates', () => {
    expect(LAYOUT.FULL.TITLE).toEqual({ x: 120, y: 24, w: 240, h: 48 });
  });

  it('ACTION zone has correct coordinates', () => {
    expect(LAYOUT.FULL.ACTION).toEqual({ x: 144, y: 384, w: 192, h: 72 });
  });
});

describe('LAYOUT.MINIMAL', () => {
  it('MAIN zone has correct coordinates', () => {
    expect(LAYOUT.MINIMAL.MAIN).toEqual({ x: 80, y: 60, w: 320, h: 360 });
  });

  it('has no TITLE zone', () => {
    expect(LAYOUT.MINIMAL.TITLE).toBeUndefined();
  });

  it('has no ACTION zone', () => {
    expect(LAYOUT.MINIMAL.ACTION).toBeUndefined();
  });
});

describe('LAYOUT.NO_ACTION', () => {
  it('has no ACTION zone', () => {
    expect(LAYOUT.NO_ACTION.ACTION).toBeUndefined();
  });

  it('has TITLE and MAIN zones', () => {
    expect(LAYOUT.NO_ACTION.TITLE).toBeDefined();
    expect(LAYOUT.NO_ACTION.MAIN).toBeDefined();
  });

  it('MAIN zone has correct coordinates', () => {
    expect(LAYOUT.NO_ACTION.MAIN).toEqual({ x: 80, y: 84, w: 320, h: 336 });
  });
});

describe('LAYOUT.NO_TITLE', () => {
  it('has no TITLE zone', () => {
    expect(LAYOUT.NO_TITLE.TITLE).toBeUndefined();
  });

  it('has MAIN and ACTION zones', () => {
    expect(LAYOUT.NO_TITLE.MAIN).toBeDefined();
    expect(LAYOUT.NO_TITLE.ACTION).toBeDefined();
  });

  it('MAIN zone has correct coordinates', () => {
    expect(LAYOUT.NO_TITLE.MAIN).toEqual({ x: 80, y: 60, w: 320, h: 312 });
  });

  it('ACTION zone has correct coordinates', () => {
    expect(LAYOUT.NO_TITLE.ACTION).toEqual({ x: 144, y: 384, w: 192, h: 72 });
  });
});
