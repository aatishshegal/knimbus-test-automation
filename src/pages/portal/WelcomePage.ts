import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class WelcomePage extends BasePage {
  readonly welcomePageIdentifier: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomePageIdentifier = page.locator('text=/welcome/i').first();
    this.continueButton = page.getByRole('button', { name: 'Continue' });
  }

  async proceedToHome() {
    try {
      await this.welcomePageIdentifier.waitFor({ state: 'visible', timeout: 8000 });
      await this.clickElement(this.continueButton, 'Continue');
      await this.welcomePageIdentifier.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    } catch {
      // Welcome page not present, user landed directly on home page
    }
  }
}
