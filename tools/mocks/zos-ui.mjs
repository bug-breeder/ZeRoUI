/**
 * Mock for @zos/ui — records every hmUI.createWidget call into `widgets`.
 *
 * This module is a singleton: preview.mjs imports it directly AND the Node.js
 * module cache ensures the same instance is used when the loader redirects
 * @zos/ui → this file for all page/ZeRoUI code. Both sides see the same array.
 */

export const widgets = [];

const hmUI = {
  widget: {
    TEXT: 'TEXT',
    BUTTON: 'BUTTON',
    FILL_RECT: 'FILL_RECT',
    VIEW_CONTAINER: 'VIEW_CONTAINER',
    ARC: 'ARC',
    IMG: 'IMG',
  },
  align: { CENTER_H: 'CENTER_H', LEFT: 'LEFT', RIGHT: 'RIGHT' },
  prop: { VISIBLE: 'VISIBLE', TEXT: 'TEXT', MORE: 'MORE' },

  createWidget(type, props) {
    const w = { _type: type, ...props };
    w.setProperty = (prop, value) => {
      // Keep widget state accurate for preview rendering
      if (prop === 'TEXT') w.text = value;
      if (prop === 'VISIBLE') w._visible = value;
      if (prop === 'MORE') Object.assign(w, value); // VIEW_CONTAINER height resize
    };
    widgets.push(w);
    return w;
  },

  deleteWidget(w) {
    const idx = widgets.indexOf(w);
    if (idx !== -1) widgets.splice(idx, 1);
  },
};

export default hmUI;
