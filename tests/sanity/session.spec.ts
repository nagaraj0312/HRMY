import { test, expect } from '../../src/fixtures/pages.fixture';
import { credentials, routes } from '../../src/utils/testData';

// HR.my allows one active session per account: every successful login invalidates the
// previous session, including the shared storageState the rest of the suite runs on.
// These tests therefore run in the "session" project, the teardown of "setup", which
// starts only after all other tests have finished.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Session', { tag: '@sanity' }, () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('valid login lands on the dashboard', async ({ page, loginPage }) => {
    const dashboard = await loginPage.login(credentials.username, credentials.password);

    await expect(page).toHaveURL(/\/employer\/#\/$/);
    await expect(dashboard.homeLink).toBeVisible();
    await expect(dashboard.widgetTitle('Overview')).toBeVisible();
  });

  test('logout ends the session and returns to the login page', async ({ page, loginPage }) => {
    const dashboard = await loginPage.login(credentials.username, credentials.password);
    await dashboard.signOut();
    // HR.my redirects to its crowdfunding page after sign-out.
    await expect(page).not.toHaveURL(/\/employer\//);

    // The session is gone: the app redirects back to the login page.
    await page.goto(routes.dashboard, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/go\/\?login=employer/);
    await expect(loginPage.loginButton).toBeVisible();
  });
});
