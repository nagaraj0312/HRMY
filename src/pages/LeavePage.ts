import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Leave > Management */
export class LeavePage extends BasePage {
  static readonly hash = '#/leave/application';
  readonly selectEmployeePrompt: Locator;

  constructor(page: Page) {
    super(page);
    this.selectEmployeePrompt = this.main.getByText('Select Employee');
  }

  async open() {
    await this.goto(`employer/${LeavePage.hash}`);
    return this;
  }

  async waitForLoad() {
    await this.homeLink.waitFor();
  }
}
