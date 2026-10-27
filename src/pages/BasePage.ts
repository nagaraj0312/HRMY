import { Locator, Page } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;
  readonly header: Locator;
  readonly main: Locator;
  readonly sideNav: Locator;
  readonly homeLink: Locator;
  readonly accountButton: Locator;
  readonly signOutButton: Locator;
  /** Quasar notifications (q-notify) render with role="alert". */
  readonly toast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.getByRole('banner');
    this.main = page.getByRole('main');
    // The left drawer is the only complementary region that contains the "Home" link
    // (the account panel is also a complementary region when open).
    this.sideNav = page
      .getByRole('complementary')
      .filter({ has: page.getByRole('link', { name: 'Home', exact: true }) });
    this.homeLink = this.sideNav.getByRole('link', { name: 'Home', exact: true });
    // Icon-only button without an accessible name; the account icon is the only stable hook.
    this.accountButton = this.header
      .getByRole('button')
      .filter({ has: page.locator('.mdi-account-circle') });
    this.signOutButton = page.getByRole('button', { name: /sign out/i });
    this.toast = page.getByRole('alert');
  }

  async goto(path: string) {
    // Third-party ad scripts can delay the "load" event; waitForLoad() waits for real app content instead.
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await this.waitForLoad();
  }

  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Expands a sidebar group if it is collapsed. */
  async expandMenuGroup(group: string) {
    const toggle = this.sideNav.getByRole('button').filter({ hasText: group }).first();
    if ((await toggle.getAttribute('aria-expanded')) !== 'true') {
      await toggle.click();
    }
  }

  /**
   * Opens a sidebar page. Sub-items share names across groups (e.g. "Management"),
   * so the link is pinned to its hash route as well.
   */
  async openMenu(group: string, item: string, hash: string) {
    await this.expandMenuGroup(group);
    await this.sideNav
      .getByRole('link', { name: item, exact: true })
      .and(this.page.locator(`[href="${hash}"]`))
      .click();
  }

  async signOut() {
    await this.accountButton.click();
    await this.signOutButton.click();
  }
}
