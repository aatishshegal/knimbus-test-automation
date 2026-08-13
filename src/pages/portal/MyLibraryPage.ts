import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class MyLibraryPage extends BasePage {
  readonly myLibraryHeader: Locator;
  readonly savedSearchTab: Locator;
  readonly favoritesTab: Locator;

  readonly nextPageButton: Locator;

  constructor(page: Page) {
    super(page);
    // Generic locator that will be on the My Library page
    this.myLibraryHeader = page.locator('.main-content, .container, body').first();
    this.savedSearchTab = page.locator('button, a, .nav-link, .nav-item').filter({ hasText: /Saved Search/i }).first();
    this.favoritesTab = page.locator('button, a, .nav-link, .nav-item').filter({ hasText: /Favourite|Favorite/i }).first();
    this.nextPageButton = page.locator('.pagination [title="Next"], .pagination [aria-label="Next"], .pagination .next, .pagination-next').first();
  }

  /**
   * Fetches all saved search queries displayed on the current page of the Saved Search tab.
   */
  async getSavedSearchTitles(): Promise<string[]> {
    // Wait for at least one saved search card to render, since we know there should be at least one
    // We only wait for .grid-view-card .title to avoid catching the "No saved search found!" message if it has a .title class
    await this.page.waitForSelector('.grid-view-card .title', { state: 'visible', timeout: 15000 }).catch(() => {});
    
    return await this.page.evaluate(() => {
      // Find all titles in the saved search cards based on actual Knimbus UI
      const titleElements = Array.from(document.querySelectorAll('.grid-view-card .title'));
      return titleElements.map(el => (el as HTMLElement).innerText.trim()).filter(text => text.length > 0);
    });
  }

  /**
   * Iterates through pagination to find if a query is present in the saved searches.
   * @param query The search query to find
   * @param maxPages Maximum number of pages to check before giving up
   */
  async isSearchSaved(query: string, maxPages: number = 10): Promise<boolean> {
    for (let i = 0; i < maxPages; i++) {
      const savedTitles = await this.getSavedSearchTitles();
      
      const isQuerySaved = savedTitles.some(title => title.toLowerCase().includes(query.toLowerCase()));
      if (isQuerySaved) {
        return true;
      }

      // Check if Next button exists and is not disabled
      const isNextButtonVisible = await this.nextPageButton.isVisible();
      if (!isNextButtonVisible) {
        break; // No more pages
      }
      
      const isNextButtonDisabled = await this.nextPageButton.evaluate((node) => {
        return node.hasAttribute('disabled') || node.classList.contains('disabled');
      }).catch(() => true);

      if (isNextButtonDisabled) {
        break; // Reached the last page
      }

      // Click Next and wait for DOM update
      await this.nextPageButton.click({ force: true });
      await this.page.waitForTimeout(2000); // Give time for new data to load
    }
    
    return false;
  }

  /**
   * Iterates through pagination to find if a query is present in the favorites.
   * @param query The search query to find
   * @param maxPages Maximum number of pages to check before giving up
   */
  async isFavoriteSaved(query: string, maxPages: number = 10): Promise<boolean> {
    for (let i = 0; i < maxPages; i++) {
      // Re-use the same UI extraction since both tabs use .grid-view-card .title
      const savedTitles = await this.getSavedSearchTitles();
      
      const isQuerySaved = savedTitles.some(title => title.toLowerCase().includes(query.toLowerCase()));
      if (isQuerySaved) {
        return true;
      }

      // Check if Next button exists and is not disabled
      const isNextButtonVisible = await this.nextPageButton.isVisible();
      if (!isNextButtonVisible) {
        break; // No more pages
      }
      
      const isNextButtonDisabled = await this.nextPageButton.evaluate((node) => {
        return node.hasAttribute('disabled') || node.classList.contains('disabled');
      }).catch(() => true);

      if (isNextButtonDisabled) {
        break; // Reached the last page
      }

      // Click Next and wait for DOM update
      await this.nextPageButton.click({ force: true });
      await this.page.waitForTimeout(2000); // Give time for new data to load
    }
    
    return false;
  }
}
