/**
 * Mock for @zos/sensor — Time (used in utils/date.js) and Vibrator (session page).
 * Time wraps the native JS Date so date calculations work correctly in preview.
 */

const now = new Date();

export class Time {
  getFullYear() {
    return now.getFullYear();
  }
  getMonth() {
    return now.getMonth(); // 0-indexed, matching ZeppOS Time.getMonth()
  }
  getDate() {
    return now.getDate();
  }
  getDay() {
    return now.getDay(); // 0=Sunday, JS convention — matches ZeppOS
  }
}

export class Vibrator {
  getType() {
    return { PULSE: 'PULSE', PAUSE: 'PAUSE', STRONG_SHORT: 'STRONG_SHORT' };
  }
  start() {}
  stop() {}
}
