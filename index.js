// ZeRoUI v0.2.0 — ZeppOS Rounded UI
// import { UI } from '@bug-breeder/zeroui'          (namespace)
// import { renderPage, LAYOUT, COLOR } from '@bug-breeder/zeroui'  (named)

import { COLOR, TYPOGRAPHY, RADIUS, SPACING, configure } from './src/tokens.js';
import { LAYOUT } from './src/layout.js';
import { Column } from './src/column.js';
import { renderPage } from './src/page.js';
import {
  bg,
  title,
  column,
  actionButton,
} from './src/chrome.js';

export const UI = {
  bg,
  title,
  column,
  actionButton,
  configure,
  LAYOUT,
  COLOR,
  TYPOGRAPHY,
  RADIUS,
  SPACING,
};

export {
  COLOR,
  TYPOGRAPHY,
  RADIUS,
  SPACING,
  LAYOUT,
  Column,
  configure,
  bg,
  title,
  column,
  actionButton,
  renderPage,
};
