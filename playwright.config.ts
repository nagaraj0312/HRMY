import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

// Relative navigation (page.goto('employer/#/')) needs a trailing slash on baseURL.
const baseURL = (process.env.BASE_URL || 'https://hr.my/go/').replace(/\/?$/, '/');
export const STORAGE_STATE = path.join(__dirname, 'playwright/.auth/admin.json');

const browserProjects = [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  // Optional browsers: enable with ALL_BROWSERS=1 (requires `npx playwright install firefox webkit`).
  ...(process.env.ALL_BROWSERS
    ? [
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      ]
    : []),
];

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
        detail: true,
        suiteTitle: true,
        environmentInfo: {
          BASE_URL: baseURL,
          Node: process.version,
          OS: process.platform,
        },
      },
    ],
  ],
  use: {
    baseURL,
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    // SLOW_MO=1000 adds a 1s pause before every browser action (useful with --headed).
    launchOptions: { slowMo: Number(process.env.SLOW_MO) || 0 },
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    // Logs in once and saves the session; "session" runs as its teardown, after everything else.
    { name: 'setup', testMatch: /auth\.setup\.ts/, teardown: 'session' },
    ...browserProjects.map((p) => ({
      ...p,
      use: { ...p.use, storageState: STORAGE_STATE },
      dependencies: ['setup'],
      testIgnore: [/auth\.setup\.ts/, /session\.spec\.ts/],
    })),
    // HR.my allows one session per account, so fresh logins must run last (see session.spec.ts).
    {
      name: 'session',
      testMatch: /session\.spec\.ts/,
      fullyParallel: false,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
