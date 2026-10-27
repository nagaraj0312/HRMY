import { test, expect } from '../../src/fixtures/pages.fixture';
import { dashboardWidgets } from '../../src/utils/testData';

test.describe('Dashboard', { tag: '@sanity' }, () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.open();
  });

  test('app shell renders header and side navigation', async ({ dashboardPage }) => {
    await expect(dashboardPage.header).toBeVisible();
    await expect(dashboardPage.accountButton).toBeVisible();
    await expect(dashboardPage.homeLink).toBeVisible();
  });

  for (const widget of dashboardWidgets) {
    test(`"${widget}" widget renders`, async ({ dashboardPage }) => {
      await expect(dashboardPage.widgetTitle(widget)).toBeVisible();
    });
  }

  test('overview shows last login and employee summary', async ({ dashboardPage }) => {
    await expect(dashboardPage.lastLoginLabel).toBeVisible();
    await expect(dashboardPage.activeEmployeesLink).toHaveText(/^\d+$/);
    await expect(dashboardPage.inviteEmployeeLink).toBeVisible();
  });
});
