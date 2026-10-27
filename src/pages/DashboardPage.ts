import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { routes } from '../utils/testData';

export class DashboardPage extends BasePage {
  readonly lastLoginLabel: Locator;
  readonly activeEmployeesLink: Locator;
  readonly inviteEmployeeLink: Locator;

  constructor(page: Page) {
    super(page);
    this.lastLoginLabel = this.main.getByText('Last Login');
    // The Overview card's employee count links to Employee > Management.
    this.activeEmployeesLink = this.main
      .getByRole('link')
      .and(page.locator('[href="#/employee/management"]'));
    this.inviteEmployeeLink = this.main.getByRole('link', { name: 'Invite Employee' });
  }

  async open() {
    await this.goto(routes.dashboard);
    return this;
  }

  async waitForLoad() {
    await this.homeLink.waitFor();
  }

  /** Each dashboard card has a title toolbar ("Overview", "Alert", ...). */
  widgetTitle(name: string): Locator {
    return this.main.getByRole('toolbar').filter({ hasText: name }).first();
  }

  async isLoaded(): Promise<boolean> {
    return (await this.homeLink.isVisible()) && (await this.widgetTitle('Overview').isVisible());
  }
}
