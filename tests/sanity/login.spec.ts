import { test, expect } from '../../src/fixtures/pages.fixture';
import { invalidCredentials } from '../../src/utils/testData';

// These tests exercise the login page itself, so start without the saved session.
// Successful logins live in session.spec.ts (see the note there).
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login page', { tag: '@sanity' }, () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('login page loads with all key elements', async ({ page, loginPage }) => {
    await expect(page).toHaveTitle(/HR\.my/);
    await expect(loginPage.logo).toBeVisible();
    await expect(loginPage.administratorTab).toHaveAttribute('aria-selected', 'true');
    await expect(loginPage.employeeTab).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeEnabled();
  });

  test('invalid login shows an error message', async ({ page, loginPage }) => {
    await loginPage.submitCredentials(invalidCredentials.username, invalidCredentials.password);

    await expect(loginPage.invalidCredentialsError).toBeVisible();
    await expect(page).not.toHaveURL(/\/employer\//);
  });
});
