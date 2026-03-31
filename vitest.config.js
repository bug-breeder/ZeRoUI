import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  test: {
    environment: 'node',
    alias: {
      '@zos/ui': resolve(__dirname, 'test/__mocks__/zos-ui.js'),
    },
  },
});
