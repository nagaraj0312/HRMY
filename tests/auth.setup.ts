import { test as setup, expect } from '../src/fixtures/pages.fixture';
import { STORAGE_STATE } from '../playwright.config';
import { credentials } from '../src/utils/testData';

setup('authenticate as administrator', async ({ loginPage, page }) => {
  await loginPage.open();
  const dashboard = await loginPage.login(credentials.username, credentials.password);
  await expect(dashboard.homeLink).toBeVisible();
  await page.context().storageState({ path: STORAGE_STATE });
});
