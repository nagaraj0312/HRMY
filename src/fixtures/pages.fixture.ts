import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { EmployeePage } from '../pages/EmployeePage';
import { LeavePage } from '../pages/LeavePage';
import { PageHealthMonitor } from '../utils/pageHealthMonitor';

type PageFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  employeePage: EmployeePage;
  leavePage: LeavePage;
  healthMonitor: PageHealthMonitor;
};

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  dashboardPage: async ({ page }, use) => use(new DashboardPage(page)),
  employeePage: async ({ page }, use) => use(new EmployeePage(page)),
  leavePage: async ({ page }, use) => use(new LeavePage(page)),
  healthMonitor: async ({ page, baseURL }, use) => {
    const monitor = new PageHealthMonitor(page, baseURL!);
    await use(monitor);
    monitor.stop();
  },
});

export { expect };
