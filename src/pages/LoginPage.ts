import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { DashboardPage } from './DashboardPage';
import { routes } from '../utils/testData';

export class LoginPage extends BasePage {
  readonly logo: Locator;
  readonly administratorTab: Locator;
  readonly employeeTab: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly hrRoleSwitch: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly invalidCredentialsError: Locator;

  constructor(page: Page) {
    super(page);
    this.logo = page.getByRole('link').filter({ has: page.getByRole('img') }).first();
    this.administratorTab = page.getByRole('tab', { name: 'Administrator' });
    this.employeeTab = page.getByRole('tab', { name: 'Employee' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.hrRoleSwitch = page.getByRole('switch', { name: 'HR Role' });
    this.loginButton = page.getByRole('button', { name: 'Administrator Login' });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot Administrator Password?' });
    this.invalidCredentialsError = this.toast.filter({ hasText: 'Please check your login credentials' });
  }

  async open() {
    await this.goto(routes.login);
    return this;
  }

  async waitForLoad() {
    await this.loginButton.waitFor();
  }

  async submitCredentials(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /** Logs in as Administrator and returns the dashboard once the app shell is shown. */
  async login(email: string, password: string): Promise<DashboardPage> {
    await this.submitCredentials(email, password);
    await this.page.waitForURL(/\/employer\/#\//);
    const dashboard = new DashboardPage(this.page);
    await dashboard.waitForLoad();
    return dashboard;
  }
}
