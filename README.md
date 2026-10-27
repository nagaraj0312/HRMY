# HR.my Playwright Sanity Suite

Playwright + TypeScript smoke/sanity tests for [HR.my](https://hr.my/go/), built with the Page Object Model.

## Setup

```bash
npm install
npx playwright install chromium            # add "firefox webkit" for the optional browsers
cp .env.example .env                       # then fill in the values below
```

`.env` (never commit it; it is gitignored):

| Variable      | Description                                   |
| ------------- | --------------------------------------------- |
| `BASE_URL`    | App URL, defaults to `https://hr.my/go/`      |
| `HR_USERNAME` | Administrator email of a test account         |
| `HR_PASSWORD` | Its password                                  |

## Running

| Command                      | What it does                                         |
| ---------------------------- | ---------------------------------------------------- |
| `npm test`                   | Run every test (headless Chromium)                   |
| `npm run test:sanity`        | Run only tests tagged `@sanity`                      |
| `npm run test:headed`        | Run with a visible browser                           |
| `npm run test:all-browsers`  | Also run Firefox and WebKit (`ALL_BROWSERS=1`)       |
| `npm run report`             | Open the last HTML report                            |
| `npm run typecheck`          | Type-check the project                               |

Failures keep a screenshot and video; a retried test (CI only) records a trace.

## Structure

```
playwright.config.ts        projects: setup -> chromium (-> firefox/webkit) -> session (teardown)
src/pages/                  BasePage (nav, account panel, toasts), LoginPage, DashboardPage, EmployeePage, LeavePage
src/fixtures/pages.fixture.ts  test fixture that injects page objects and a PageHealthMonitor
src/utils/testData.ts       credentials (from env), routes, nav items, dashboard widgets
src/utils/pageHealthMonitor.ts  collects console errors and first-party 4xx/5xx responses
tests/auth.setup.ts         logs in once, saves playwright/.auth/admin.json
tests/sanity/               login, dashboard, navigation, health, session specs
```

## Test coverage

| Spec                  | Checks                                                                 |
| --------------------- | ---------------------------------------------------------------------- |
| `login.spec.ts`       | Login page elements; invalid credentials show an error toast           |
| `dashboard.spec.ts`   | App shell plus the Alert, Overview, File Storage, Discussion, Announcement and HR.my News widgets |
| `navigation.spec.ts`  | Sidebar items (Employee, Expense Claim, Leave, Attendance, Employer) open their pages; Home link |
| `health.spec.ts`      | No console errors or failed HR.my requests on login and main pages      |
| `session.spec.ts`     | Valid login lands on the dashboard; logout ends the session            |

To cover more sidebar pages, add entries to `navItems` in `src/utils/testData.ts`.
Both the navigation and the health specs pick them up.

## Things to know about HR.my

- **One active session per account.** Every successful login invalidates the previous session.
  That's why the suite logs in once in `auth.setup.ts`, and why the tests that log in fresh
  (`session.spec.ts`) run in the `session` teardown project, after all other tests.
  Don't run two copies of the suite against the same account at the same time
  (the CI workflow uses a `concurrency` group for this). A run will also sign you out of
  any browser where you are logged in with the same account.
- **Sign Out redirects to `hr.my/doc/crowdfunding.html`**, not the login page. The logout test
  checks that the session is gone by reopening the app and expecting the login page.
- **Third-party ads** can delay the `load` event and keep the network busy, so page objects
  navigate with `domcontentloaded` and wait for real app elements. The health check ignores
  ad and analytics hosts (`ignoredNetworkHosts` in `testData.ts`).
- Several sidebar links share a name (e.g. "Management"), so `BasePage.openMenu()` pins the link to its hash route.

## Allure report

Every run also writes Allure results to `allure-results/`. The report uses Allure 3 (the `allure` npm package), so Java isn't needed.

| Command                    | What it does                                                         |
| -------------------------- | -------------------------------------------------------------------- |
| `npm run test:allure`      | Clear old results, run the `@sanity` suite, generate `allure-report/` |
| `npm run allure:generate`  | Build `allure-report/` from the current `allure-results/`            |
| `npm run allure:open`      | Serve the report and open it in the browser                          |
| `npm run allure:clean`     | Delete `allure-results/`                                             |

Report settings live in `allurerc.mjs`. Run history is kept in `allure-history.jsonl` (gitignored),
so the report shows trends across runs. Failed tests include Playwright's screenshot, video and trace.

## Playwright Test Agents (Claude Code)

Installed with `npx playwright init-agents --loop=claude --project=chromium`:

- `.claude/agents/playwright-test-planner.md`: explores the app and writes test plans to `specs/`
- `.claude/agents/playwright-test-generator.md`: turns a plan into test files
- `.claude/agents/playwright-test-healer.md`: runs failing tests and fixes them
- `.mcp.json`: the `playwright-test` MCP server the agents use
- `tests/seed.spec.ts`: starting point for the agents (saved admin session, dashboard open)

Restart Claude Code in this folder and approve the `playwright-test` MCP server. Then ask, for example,
"use the playwright-test-planner agent to plan tests for Leave > Holiday".
Re-run the `init-agents` command after upgrading `@playwright/test`.

## CI

`.github/workflows/playwright.yml` runs the sanity suite on push/PR. Add the repository secrets
`HR_USERNAME` and `HR_PASSWORD` (and optionally a `BASE_URL` variable). The HTML report is uploaded as an artifact.
