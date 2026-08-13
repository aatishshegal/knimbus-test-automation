import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ProfilePage extends BasePage {
  readonly profileHeader: Locator;

  constructor(page: Page) {
    super(page);
    // Generic locator that will be on the profile page
    this.profileHeader = page.locator('.main-content, .container, body').first();
  }
}
