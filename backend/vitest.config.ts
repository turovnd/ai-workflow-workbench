import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { include: ['backend/tests/**/*.unit.test.ts'] },
});
