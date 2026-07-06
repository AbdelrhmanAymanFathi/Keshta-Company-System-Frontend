import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './playwright.global-setup.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Run E2E tests sequentially to avoid database transaction conflicts
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:8081',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Spin up frontend and backend servers automatically before running E2E tests
  webServer: [
    {
      command: 'npm run dev:test',
      url: 'http://127.0.0.1:3001/ping',
      cwd: '../accounting',
      timeout: 240000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run serve -- --port 8081',
      url: 'http://127.0.0.1:8081',
      timeout: 240000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
