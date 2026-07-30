import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class HomePage extends BasePage {
  readonly homePageIdentifier: Locator;

  constructor(page: Page) {
    super(page);
    this.homePageIdentifier = page.getByText('Sydney University');
  }
}
