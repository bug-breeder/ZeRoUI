import { vi } from 'vitest';

export default {
  createWidget: vi.fn((type, props) => {
    const w = { _type: type, ...props };
    w.setProperty = vi.fn();
    return w;
  }),
  deleteWidget: vi.fn(),
  widget: {
    TEXT: 'TEXT',
    BUTTON: 'BUTTON',
    FILL_RECT: 'FILL_RECT',
    VIEW_CONTAINER: 'VIEW_CONTAINER',
    IMG: 'IMG',
  },
  align: { CENTER_H: 'CENTER_H', LEFT: 'LEFT', RIGHT: 'RIGHT' },
  prop: { MORE: 'MORE' },
};
