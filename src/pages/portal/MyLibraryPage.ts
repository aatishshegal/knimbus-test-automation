import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class MyLibraryPage extends BasePage {
  readonly myLibraryHeader: Locator;

  constructor(page: Page) {
    super(page);
    // Generic locator that will be on the My Library page
    this.myLibraryHeader = page.locator('.main-content, .container, body').first();
  }
}
