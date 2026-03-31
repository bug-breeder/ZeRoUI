import { afterEach, describe, expect, it } from 'vitest';
import { COLOR, configure } from '../src/tokens.js';

// Reset to default green accent after every test — configure() mutates COLOR in place
afterEach(() => configure({ accent: 'green' }));

describe('configure()', () => {
  it('sets all four PRIMARY tokens for a named preset', () => {
    configure({ accent: 'blue' });
    expect(COLOR.PRIMARY).toBe(0x007aff);
    expect(COLOR.PRIMARY_LIGHT).toBe(0x4da3ff);
    expect(COLOR.PRIMARY_TINT).toBe(0x001f4d);
    expect(COLOR.PRIMARY_PRESSED).toBe(0x0051d5);
  });

  it('accepts a custom accent object', () => {
    configure({ accent: { primary: 0x123456 } });
    expect(COLOR.PRIMARY).toBe(0x123456);
  });

  it('partial custom object only mutates provided keys', () => {
    const before = COLOR.PRIMARY_LIGHT;
    configure({ accent: { primary: 0x123456 } });
    expect(COLOR.PRIMARY_LIGHT).toBe(before); // untouched
  });

  it('ignores unknown preset name', () => {
    const before = COLOR.PRIMARY;
    configure({ accent: 'neon' });
    expect(COLOR.PRIMARY).toBe(before);
  });

  it('is a no-op when called with no args', () => {
    const before = COLOR.PRIMARY;
    configure();
    expect(COLOR.PRIMARY).toBe(before);
  });

  it('resets to green defaults', () => {
    configure({ accent: 'blue' });
    configure({ accent: 'green' });
    expect(COLOR.PRIMARY).toBe(0x30d158);
    expect(COLOR.PRIMARY_LIGHT).toBe(0x52d985);
  });
});

describe('COLOR defaults', () => {
  it('PRIMARY_LIGHT is 0x52d985 by default', () => {
    expect(COLOR.PRIMARY_LIGHT).toBe(0x52d985);
  });

  it('BG is 0x000000', () => {
    expect(COLOR.BG).toBe(0x000000);
  });
});
