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
      const isVisible = await this.continueButton.isVisible().catch(() => false);
      if (isVisible) {
        await this.clickElement(this.continueButton, 'Continue');
        await this.continueButton.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
      } else {
        await this.continueButton.waitFor({ state: 'visible', timeout: 2000 });
        await this.clickElement(this.continueButton, 'Continue');
        await this.continueButton.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
      }
    } catch {
      // Welcome page not present, user landed directly on home page
    }
  }
}
