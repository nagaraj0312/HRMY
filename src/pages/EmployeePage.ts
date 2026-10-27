import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Employee > Management */
export class EmployeePage extends BasePage {
  static readonly hash = '#/employee/management';
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = this.main.getByRole('toolbar').getByRole('textbox');
  }

  async open() {
    await this.goto(`employer/${EmployeePage.hash}`);
    return this;
  }

  async waitForLoad() {
    await this.homeLink.waitFor();
  }

  async search(text: string) {
    await this.searchInput.fill(text);
    await this.searchInput.press('Enter');
  }
}
