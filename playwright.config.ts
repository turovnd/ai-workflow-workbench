import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/apps',
  testMatch: '**/*.browser.test.ts',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
