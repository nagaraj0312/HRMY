import { Page } from '@playwright/test';
import { test, expect } from '../../src/fixtures/pages.fixture';
import { navItems, routes } from '../../src/utils/testData';
import { PageHealthMonitor } from '../../src/utils/pageHealthMonitor';
import { LoginPage } from '../../src/pages/LoginPage';
import { DashboardPage } from '../../src/pages/DashboardPage';

const mainPages = [
  { name: 'Dashboard', path: routes.dashboard },
  ...navItems.map(({ group, item, hash }) => ({ name: `${group} > ${item}`, path: `employer/${hash}` })),
];

/** Lets the page's own API calls finish. Ads can keep the network busy forever, so this is bounded. */
async function settle(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
}

test.describe('Page health', { tag: '@sanity' }, () => {
  test('login page has no console errors or failed requests', async ({ browser, baseURL }) => {
    // Fresh, unauthenticated context; the monitor is attached before navigation.
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    const monitor = new PageHealthMonitor(page, baseURL!);

    await new LoginPage(page).open();
    await settle(page);

    expect(monitor.consoleErrors, 'console errors').toEqual([]);
    expect(monitor.failedResponses, 'failed requests').toEqual([]);
    await context.close();
  });

  for (const { name, path } of mainPages) {
    test(`${name} has no console errors or failed requests`, async ({ page, healthMonitor }) => {
      await new DashboardPage(page).goto(path);
      await settle(page);

      expect(healthMonitor.consoleErrors, 'console errors').toEqual([]);
      expect(healthMonitor.failedResponses, 'failed requests').toEqual([]);
    });
  }
});
