import { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';

export class ContactPage extends BasePage {
  readonly tabHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.tabHeader = page.locator('h1, h2, h3, .heading').filter({ hasText: /contact/i }).first();
  }
}
