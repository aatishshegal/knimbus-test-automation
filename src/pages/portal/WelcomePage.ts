import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class WelcomePage extends BasePage {
  readonly welcomePageIdentifier: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomePageIdentifier = page.locator('text=/welcome/i').first();
    this.continueButton = page.locator('button#continue');
  }

  async proceedToHome() {
    // Wait for the button to be visible and click it
    await this.clickElement(this.continueButton, 'Continue');
  }
}
