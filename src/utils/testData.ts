function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var ${name}. Copy .env.example to .env and fill it in.`);
  }
  return value;
}

export const credentials = {
  get username() {
    return requireEnv('HR_USERNAME');
  },
  get password() {
    return requireEnv('HR_PASSWORD');
  },
};

export const invalidCredentials = {
  username: 'invalid.user@example.invalid',
  password: 'WrongPassword!123',
};

export const routes = {
  login: './',
  dashboard: 'employer/#/',
};

/** Sidebar groups and the sub-page used to smoke-test each one. */
export interface NavItem {
  group: string;
  item: string;
  /** Hash route the sidebar link points to, e.g. '#/leave/application'. */
  hash: string;
}

export const navItems: NavItem[] = [
  { group: 'Employee', item: 'Management', hash: '#/employee/management' },
  { group: 'Expense Claim', item: 'Management', hash: '#/claim/application' },
  { group: 'Leave', item: 'Management', hash: '#/leave/application' },
  { group: 'Leave', item: 'Holiday', hash: '#/leave/holiday' },
  { group: 'Attendance', item: 'Management', hash: '#/attendance/management' },
  { group: 'Employer', item: 'Information', hash: '#/employer/info' },
  { group: 'Employer', item: 'Department', hash: '#/employer/department' },
];

export const dashboardWidgets = [
  'Alert',
  'Overview',
  'File Storage',
  'Discussion',
  'Announcement',
  'HR.my News',
];

/** Third-party hosts (ads/analytics) whose failures are not app defects. */
export const ignoredNetworkHosts = [
  /google/,
  /doubleclick/,
  /googlesyndication/,
  /adtrafficquality/,
  /stripe/,
  /statcounter/,
  /facebook/,
  /twitter/,
];
