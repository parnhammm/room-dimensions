import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      exclude: ['src/pages/**'],
      thresholds: {
        lines: 80,
        branches: 80,
      },
    },
  },
});
