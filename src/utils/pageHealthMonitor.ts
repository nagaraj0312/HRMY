import { Page, Response, ConsoleMessage } from '@playwright/test';
import { ignoredNetworkHosts } from './testData';

/**
 * Collects console errors and failed (4xx/5xx) responses from the app's own host,
 * ignoring third-party ad/analytics noise.
 */
export class PageHealthMonitor {
  readonly consoleErrors: string[] = [];
  readonly failedResponses: string[] = [];
  private readonly appHost: string;

  constructor(private readonly page: Page, baseURL: string) {
    this.appHost = new URL(baseURL).host;
    page.on('console', this.onConsole);
    page.on('response', this.onResponse);
  }

  private isIgnored(url: string): boolean {
    if (!url) return false;
    return ignoredNetworkHosts.some((pattern) => pattern.test(new URL(url).host));
  }

  private onConsole = (msg: ConsoleMessage) => {
    if (msg.type() !== 'error') return;
    const url = msg.location().url;
    if (this.isIgnored(url)) return;
    this.consoleErrors.push(`${msg.text()} (${url || 'unknown source'})`);
  };

  private onResponse = (response: Response) => {
    const url = response.url();
    if (response.status() < 400 || new URL(url).host !== this.appHost) return;
    this.failedResponses.push(`${response.status()} ${response.request().method()} ${url}`);
  };

  stop() {
    this.page.off('console', this.onConsole);
    this.page.off('response', this.onResponse);
  }
}
