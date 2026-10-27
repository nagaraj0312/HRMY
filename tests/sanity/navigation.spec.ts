import { test, expect } from '../../src/fixtures/pages.fixture';
import { navItems } from '../../src/utils/testData';

test.describe('Main navigation', { tag: '@sanity' }, () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.open();
  });

  for (const { group, item, hash } of navItems) {
    test(`${group} > ${item} opens without errors`, async ({ page, dashboardPage }) => {
      await dashboardPage.openMenu(group, item, hash);

      await expect(page).toHaveURL(new RegExp(`${hash.replace(/[/#]/g, '\\$&')}$`));
      await expect(dashboardPage.main).toBeVisible();
      await expect(dashboardPage.toast).toHaveCount(0);
    });
  }

  test('Employee > Management shows the employee search toolbar', async ({ employeePage }) => {
    await employeePage.open();
    await expect(employeePage.searchInput).toBeVisible();
  });

  test('Leave > Management prompts to select an employee', async ({ leavePage }) => {
    await leavePage.open();
    await expect(leavePage.selectEmployeePrompt).toBeVisible();
  });

  test('Home link returns to the dashboard', async ({ page, dashboardPage }) => {
    await dashboardPage.openMenu('Leave', 'Holiday', '#/leave/holiday');
    await dashboardPage.homeLink.click();
    await expect(page).toHaveURL(/\/employer\/#\/$/);
    await expect(dashboardPage.widgetTitle('Overview')).toBeVisible();
  });
});
