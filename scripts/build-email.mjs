// Builds the HTML result email from Playwright's JSON report.
// Usage: node scripts/build-email.mjs [results.json] [out.html]
// In GitHub Actions it also writes `subject` and `status` to $GITHUB_OUTPUT.
import fs from 'fs';
import path from 'path';

const [resultsPath = 'reports/results.json', outPath = 'reports/email.html'] = process.argv.slice(2);
const env = process.env;

const escape = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// Playwright error messages carry ANSI colour codes.
const stripAnsi = (s) => String(s).replace(/\u001b\[[0-9;]*m/g, '');

let report;
try {
  report = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
} catch {
  report = null;
}

const stats = report?.stats ?? { expected: 0, unexpected: 0, flaky: 0, skipped: 0, duration: 0 };
const total = stats.expected + stats.unexpected + stats.flaky + stats.skipped;

// Walk the suite tree and collect failed and flaky tests with their first error.
const failures = [];
const flaky = [];
const walk = (suite, titles) => {
  const trail = suite.title && !suite.title.endsWith('.ts') ? [...titles, suite.title] : titles;
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const entry = {
        title: [...trail, spec.title].join(' › '),
        file: `${spec.file}:${spec.line}`,
        project: test.projectName,
      };
      if (test.status === 'unexpected') {
        const error = test.results?.find((r) => r.error)?.error;
        entry.error = stripAnsi(error?.message ?? 'No error message').split('\n').slice(0, 6).join('\n');
        failures.push(entry);
      } else if (test.status === 'flaky') {
        flaky.push(entry);
      }
    }
  }
  for (const child of suite.suites ?? []) walk(child, trail);
};
for (const suite of report?.suites ?? []) walk(suite, []);

const errored = !report || (report.errors?.length ?? 0) > 0;
const passed = !errored && stats.unexpected === 0;
const status = errored && total === 0 ? 'ERROR' : passed ? 'PASSED' : 'FAILED';
const colour = { PASSED: '#1a7f37', FAILED: '#cf222e', ERROR: '#9a6700' }[status];

const minutes = Math.floor(stats.duration / 60000);
const seconds = Math.round((stats.duration % 60000) / 1000);
const duration = `${minutes}m ${seconds}s`;

const runUrl = env.GITHUB_SERVER_URL
  ? `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`
  : '';
const reportUrl = env.ALLURE_REPORT_URL ?? '';
const shortSha = (env.GITHUB_SHA ?? '').slice(0, 7);

const tile = (label, value, fg) => `
  <td align="center" style="padding:12px 8px;border:1px solid #d0d7de;border-radius:6px;">
    <div style="font-size:24px;font-weight:700;color:${fg};">${value}</div>
    <div style="font-size:12px;color:#57606a;text-transform:uppercase;letter-spacing:.5px;">${label}</div>
  </td>`;

const button = (href, label) =>
  href
    ? `<a href="${escape(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:10px 16px;background:#0969da;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">${label}</a>`
    : '';

const testRows = (items, withError) =>
  items
    .map(
      (t) => `
  <tr>
    <td style="padding:10px;border-top:1px solid #d0d7de;vertical-align:top;">
      <div style="font-weight:600;color:#24292f;">${escape(t.title)}</div>
      <div style="font-size:12px;color:#57606a;">${escape(t.file)} · ${escape(t.project)}</div>
      ${
        withError
          ? `<pre style="margin:8px 0 0;padding:8px;background:#fff8f8;border:1px solid #ffcecb;border-radius:4px;font-size:12px;white-space:pre-wrap;word-break:break-word;color:#82071e;">${escape(t.error)}</pre>`
          : ''
      }
    </td>
  </tr>`,
    )
    .join('');

const section = (heading, items, withError) =>
  items.length
    ? `
  <h3 style="margin:24px 0 8px;font-size:16px;color:#24292f;">${heading} (${items.length})</h3>
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #d0d7de;border-radius:6px;border-collapse:separate;">
    ${testRows(items, withError)}
  </table>`
    : '';

const details = [
  ['Repository', env.GITHUB_REPOSITORY],
  ['Branch', env.GITHUB_REF_NAME],
  ['Commit', shortSha],
  ['Triggered by', env.GITHUB_EVENT_NAME && `${env.GITHUB_EVENT_NAME} (${env.GITHUB_ACTOR})`],
  ['Environment', env.BASE_URL],
  ['Duration', duration],
]
  .filter(([, v]) => v)
  .map(
    ([k, v]) =>
      `<tr><td style="padding:4px 12px 4px 0;color:#57606a;white-space:nowrap;">${k}</td><td style="padding:4px 0;color:#24292f;">${escape(v)}</td></tr>`,
  )
  .join('');

const html = `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f6f8fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8fa;padding:24px 0;">
<tr><td align="center">
<table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#ffffff;border:1px solid #d0d7de;border-radius:8px;">
  <tr>
    <td style="padding:20px 24px;background:${colour};border-radius:8px 8px 0 0;color:#ffffff;">
      <div style="font-size:13px;opacity:.9;">HR.my Playwright Sanity Suite</div>
      <div style="font-size:22px;font-weight:700;margin-top:4px;">Test run ${status}</div>
    </td>
  </tr>
  <tr>
    <td style="padding:24px;">
      <table width="100%" cellpadding="0" cellspacing="8" style="border-collapse:separate;">
        <tr>
          ${tile('Total', total, '#24292f')}
          ${tile('Passed', stats.expected, '#1a7f37')}
          ${tile('Failed', stats.unexpected, '#cf222e')}
          ${tile('Flaky', stats.flaky, '#9a6700')}
          ${tile('Skipped', stats.skipped, '#57606a')}
        </tr>
      </table>

      <table cellpadding="0" cellspacing="0" style="margin-top:16px;font-size:14px;">${details}</table>

      ${
        errored
          ? `<p style="margin:16px 0 0;padding:12px;background:#fff8c5;border:1px solid #d4a72c;border-radius:6px;color:#4d2d00;">The run reported errors outside of individual tests (setup, configuration or a crash). Check the workflow logs.</p>`
          : ''
      }

      ${section('Failed tests', failures, true)}
      ${section('Flaky tests (passed on retry)', flaky, false)}

      <div style="margin-top:24px;">
        ${button(reportUrl, 'Open Allure report')}
        ${button(runUrl, 'View workflow run')}
      </div>
    </td>
  </tr>
  <tr>
    <td style="padding:16px 24px;border-top:1px solid #d0d7de;font-size:12px;color:#57606a;">
      The Allure report, Playwright HTML report and failure screenshots/videos are attached to the workflow run as artifacts.
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, html);

const subject = `[HR.my Sanity] ${status} – ${stats.expected}/${total} passed${
  stats.unexpected ? `, ${stats.unexpected} failed` : ''
}${env.GITHUB_REF_NAME ? ` (${env.GITHUB_REF_NAME}${shortSha ? ` @ ${shortSha}` : ''})` : ''}`;

if (env.GITHUB_OUTPUT) {
  fs.appendFileSync(env.GITHUB_OUTPUT, `subject=${subject}\nstatus=${status}\n`);
}
console.log(subject);
