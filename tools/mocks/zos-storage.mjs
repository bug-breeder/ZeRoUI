/**
 * Mock for @zos/storage — LocalStorage with seeded preview data.
 * Keys match the app's storage keys (without 'dev_' prefix).
 */

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

const SEED = {
  streak_days: 1,
  last_session_date: todayStr,
  last_technique: 'box',
  last_rounds: 5,
  total_sessions: 4,
  session_history: { [todayStr]: 1 },
};

export class LocalStorage {
  // Intentionally no defaultValue param — real ZeppOS getItem() ignores it.
  // Callers must use:  s.getItem(key) ?? defaultValue
  // NOT:              s.getItem(key, defaultValue)   ← silently broken on device
  getItem(key) {
    const base = key.startsWith('dev_') ? key.slice(4) : key;
    return base in SEED ? SEED[base] : undefined;
  }

  setItem() {}
}
