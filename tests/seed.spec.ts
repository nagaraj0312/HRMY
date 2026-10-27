import { test, expect } from '../src/fixtures/pages.fixture';

// Seed for the Playwright test agents (planner/generator/healer). It runs in the "chromium"
// project, so it starts with the saved admin session and lands on the dashboard.
// Generated tests should use the page objects from src/fixtures/pages.fixture.ts.
test.describe('Seed', () => {
  test('seed', async ({ dashboardPage }) => {
    await dashboardPage.open();
    await expect(dashboardPage.homeLink).toBeVisible();
  });
});
