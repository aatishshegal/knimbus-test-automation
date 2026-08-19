import { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';

export class WorkEducationPage extends BasePage {
  readonly tabHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.tabHeader = page.locator('h1, h2, h3, .heading').filter({ hasText: /work & education/i }).first();
  }
}
