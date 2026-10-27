import { defineConfig } from 'allure';

export default defineConfig({
  name: 'HR.my Sanity Report',
  output: './allure-report',
  // Keeps run history so the report can show trends and retries across runs.
  historyPath: './allure-history.jsonl',
  plugins: {
    awesome: {
      options: {
        reportName: 'HR.my Sanity Report',
        groupBy: ['parentSuite', 'suite', 'subSuite'],
      },
    },
  },
});
