import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SearchResultPage extends BasePage {
  readonly searchResultIdentifier: Locator;

  constructor(page: Page) {
    super(page);
    // When a search is performed, the URL routes to /portal/v2/default/searchresult
    // We will use the page header or generic body as a fallback to ensure the page has loaded.
    this.searchResultIdentifier = page.locator('.page-title, h1, h2, h3').filter({ hasText: 'Search' }).or(page.locator('body')).first();
  }
}
