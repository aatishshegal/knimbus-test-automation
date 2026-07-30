import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class DashboardLoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    // Updated locators based on live DOM inspection of qa.knimbus.com
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.getByRole('button', { name: 'Next' });
  }

  async login(username: string, password: string) {
    const url = process.env.DASHBOARD_URL;
    if (!url) throw new Error('DASHBOARD_URL is not defined in .env');

    await this.navigateTo(url);
    await this.fillText(this.usernameInput, username, 'Username Field');
    await this.fillText(this.passwordInput, password, 'Password Field');
    await this.clickElement(this.loginButton, 'Login Button');
    await this.waitForURLToContain('dashboard');
  }
}
