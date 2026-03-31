import { describe, expect, it } from 'vitest';
import { LAYOUT } from '../src/layout.js';

describe('LAYOUT.FULL', () => {
  it('MAIN zone has correct coordinates', () => {
    expect(LAYOUT.FULL.MAIN).toEqual({ x: 80, y: 74, w: 320, h: 312 });
  });

  it('TITLE zone has correct coordinates', () => {
    expect(LAYOUT.FULL.TITLE).toEqual({ x: 120, y: 24, w: 240, h: 44 });
  });

  it('ACTION zone has correct coordinates', () => {
    expect(LAYOUT.FULL.ACTION).toEqual({ x: 140, y: 392, w: 200, h: 48 });
  });
});

describe('LAYOUT.MINIMAL', () => {
  it('MAIN zone has correct coordinates', () => {
    expect(LAYOUT.MINIMAL.MAIN).toEqual({ x: 80, y: 62, w: 320, h: 354 });
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
});

describe('LAYOUT.NO_TITLE', () => {
  it('has no TITLE zone', () => {
    expect(LAYOUT.NO_TITLE.TITLE).toBeUndefined();
  });

  it('has MAIN and ACTION zones', () => {
    expect(LAYOUT.NO_TITLE.MAIN).toBeDefined();
    expect(LAYOUT.NO_TITLE.ACTION).toBeDefined();
  });
});
