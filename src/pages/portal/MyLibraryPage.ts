import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class MyLibraryPage extends BasePage {
  readonly myLibraryHeader: Locator;
  
  // 4 Main Tabs on My Library Page
  readonly tabRow: Locator;
  readonly favouritesTab: Locator;
  readonly webKlipsTab: Locator;
  readonly savedSearchesTab: Locator;
  readonly orcidTab: Locator;

  // Aliases for backward compatibility
  readonly savedSearchTab: Locator;
  readonly favoritesTab: Locator;

  readonly nextPageButton: Locator;

  // Favourites card locators & action items
  readonly favouritesCountText: Locator;
  readonly favouriteCards: Locator;
  readonly readButtons: Locator;
  readonly deleteButtons: Locator;

  // Delete modal dialog locators
  readonly deleteConfirmationModal: Locator;
  readonly deleteModalMessage: Locator;
  readonly modalCancelButton: Locator;
  readonly modalDeleteButton: Locator;
  readonly deleteToastNotification: Locator;

  // Pagination locators
  readonly paginationContainer: Locator;
  readonly firstPageButton: Locator;
  readonly previousPageButton: Locator;
  readonly lastPageButton: Locator;
  readonly noFavouritesMessage: Locator;

  // Web Klips Locators
  readonly addWebKlipButton: Locator;
  readonly webKlipModal: Locator;
  readonly webKlipUrlInput: Locator;
  readonly invalidUrlErrorText: Locator;
  readonly webKlipNextButton: Locator;
  readonly webKlipClearButton: Locator;
  readonly webKlipTitleInput: Locator;
  readonly webKlipSaveButton: Locator;
  readonly webKlipCancelButton: Locator;
  readonly webKlipsCountText: Locator;
  readonly webKlipToastNotification: Locator;
  readonly webKlipCards: Locator;

  // Saved Searches Locators
  readonly savedSearchesCountText: Locator;
  readonly noSavedSearchesMessage: Locator;

  constructor(page: Page) {
    super(page);
    // Generic header locator on My Library page
    this.myLibraryHeader = page.locator('.main-content, .container, body').first();
    this.tabRow = page.locator('.my-library-tab-row');

    // Tab locators based on actual DOM HTML attributes (data-rr-ui-event-key and nav-item title)
    this.favouritesTab = page.locator('a[data-rr-ui-event-key="Favourites"], .nav-item[title="Favourites"] a').first();
    this.webKlipsTab = page.locator('a[data-rr-ui-event-key="Web Klips"], .nav-item[title="Web Klips"] a').first();
    this.savedSearchesTab = page.locator('a[data-rr-ui-event-key="Saved Searches"], .nav-item[title="Saved Searches"] a').first();
    this.orcidTab = page.locator('a[data-rr-ui-event-key="ORCID"], .nav-item[title="ORCID"] a').first();

    // Aliases
    this.savedSearchTab = this.savedSearchesTab;
    this.favoritesTab = this.favouritesTab;

    this.nextPageButton = page.locator('.pagination [title="Next"], .pagination [aria-label="Next"], .pagination .next, .pagination-next, .pagination a:has-text(">"), .pagination li:has-text(">")').first();

    // Favourites card locators
    this.noFavouritesMessage = page.locator('.no-data').or(page.getByText('No favourite found', { exact: false })).or(page.locator('h5:has-text("No favourite found")')).first();
    this.favouritesCountText = page.locator('text=/Showing \\d+ results for/i');
    this.favouriteCards = page.locator('.grid-view-card');
    this.readButtons = page.locator('.grid-view-card button:has-text("Read"), .grid-view-card a:has-text("Read"), .grid-view-card :text("Read")');
    this.deleteButtons = page.locator('.grid-view-card .delete-btn, .grid-view-card button:has(.fa-trash), .grid-view-card .fa-trash, .grid-view-card img[src*="delete"], .grid-view-card img[src*="trash"], .grid-view-card button.btn-outline-danger').or(page.locator('.grid-view-card button').nth(1));

    // Delete modal dialog locators
    this.deleteConfirmationModal = page.locator('.modal-dialog, .modal-content, .swal2-modal, div[role="dialog"]').filter({ hasText: /Are you sure you want to delete/i });
    this.deleteModalMessage = page.locator('text="Are you sure you want to delete?"');
    this.modalCancelButton = page.locator('.modal-dialog, .modal-content, div[role="dialog"], .swal2-modal, body').locator('button, a').filter({ hasText: /^Cancel$/i }).first();
    this.modalDeleteButton = page.locator('.modal-dialog, .modal-content, div[role="dialog"], .swal2-modal, body').locator('button, a').filter({ hasText: /^Delete$/i }).first();
    this.deleteToastNotification = page.locator('.toast, .alert, .snackbar, .toast-message').or(page.locator('text=/Your Favourite Item has been Deleted|Favourite.*Deleted/i')).first();

    // Pagination locators
    this.paginationContainer = page.locator('.pagination, [class*="pagination"]');
    this.firstPageButton = page.locator('.pagination').locator('a, button, li').filter({ hasText: '<<' }).first();
    this.previousPageButton = page.locator('.pagination').locator('a, button, li').filter({ hasText: '<' }).first();
    this.lastPageButton = page.locator('.pagination').locator('a, button, li').filter({ hasText: '>>' }).first();

    // Web Klips locators
    this.addWebKlipButton = page.locator('#triggerButton, .add-web-klip-box-button, button:has-text("Add a web klip"), a:has-text("Add a web klip")').first();
    this.webKlipModal = page.getByRole('dialog').first();
    this.webKlipUrlInput = page.locator('input[placeholder*="Paste a link with protocol" i], input[placeholder*="protocol" i], .modal-content input').first();
    this.invalidUrlErrorText = page.getByText('Invalid URL', { exact: false }).first();
    this.webKlipNextButton = page.locator('.modal-content button, [role="dialog"] button').filter({ hasText: /^Next$/i }).first();
    this.webKlipClearButton = page.locator('.modal-content button, [role="dialog"] button').filter({ hasText: /^Clear$/i }).first();
    this.webKlipTitleInput = page.locator('input[placeholder*="Enter Title" i], input[placeholder*="Title" i], .modal-content input').last();
    this.webKlipSaveButton = page.locator('button').filter({ hasText: 'Save' }).first();
    this.webKlipCancelButton = page.locator('button').filter({ hasText: 'Cancel' }).first();
    this.webKlipsCountText = page.locator('text=/Showing \\d+ results for Web klips/i');
    this.webKlipToastNotification = page.locator('.toast, .alert, .snackbar, .toast-message').or(page.getByText('deleted successfully', { exact: false })).or(page.getByText('klip has been deleted', { exact: false })).first();
    this.webKlipCards = page.locator('.grid-view-card, .added-klip-container .card');
    this.refreshButton = page.locator('button[title*="Refresh" i], .refresh-btn').or(page.locator('button').filter({ has: page.locator('svg, i') })).last();

    // Saved Searches locators
    this.savedSearchesCountText = page.locator('text=/Showing \\d+ results for Saved Searches/i');
    this.noSavedSearchesMessage = page.locator('.no-data, .no-result, .no-data-found').or(page.getByText(/No saved search/i)).or(page.getByText(/No search found/i)).first();
  }

  /**
   * Click Favourites tab
   */
  async clickFavouritesTab(): Promise<void> {
    await this.favouritesTab.click({ force: true });
    await this.page.waitForTimeout(500);
  }

  /**
   * Click Web Klips tab
   */
  async clickWebKlipsTab(): Promise<void> {
    await this.webKlipsTab.click({ force: true });
    await this.page.waitForTimeout(500);
  }

  /**
   * Click Saved Searches tab
   */
  async clickSavedSearchesTab(): Promise<void> {
    await this.savedSearchesTab.click({ force: true });
    await this.page.waitForTimeout(500);
  }

  /**
   * Click ORCID tab
   */
  async clickOrcidTab(): Promise<void> {
    await this.orcidTab.click({ force: true });
    await this.page.waitForTimeout(500);
  }

  /**
   * Check if a specific tab is active
   */
  async isTabActive(tabLocator: Locator): Promise<boolean> {
    const parentContainer = tabLocator.locator('xpath=..');
    const ariaSelected = await tabLocator.getAttribute('aria-selected').catch(() => null);
    const classList = await tabLocator.getAttribute('class').catch(() => '');
    const parentClassList = await parentContainer.getAttribute('class').catch(() => '');
    return ariaSelected === 'true' || (classList ? classList.includes('active') : false) || (parentClassList ? parentClassList.includes('selected-tab-bg') : false);
  }

  /**
   * Asserts that a tab is active using Playwright web-first auto-retrying assertion
   */
  async expectTabToBeActive(tabLocator: Locator): Promise<void> {
    const parentContainer = tabLocator.locator('xpath=..');
    const combined = tabLocator.or(parentContainer);
    await expect(combined.first()).toHaveClass(/active|selected-tab-bg/, { timeout: 10000 });
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

  /**
   * Extracts current count of Favourites from "Showing X results for Favourites"
   */
  async getFavouritesCount(): Promise<number> {
    await this.favouritesCountText.first().waitFor({ state: 'visible', timeout: 10000 });
    const text = await this.favouritesCountText.first().innerText();
    const match = text.match(/Showing\s+([\d,]+)\s+results/i);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''), 10);
    }
    return 0;
  }

  /**
   * Helper locator to select a specific pagination page number button
   */
  getPageNumberButton(pageNumber: number): Locator {
    return this.paginationContainer.locator('a, button, li, span').filter({ hasText: new RegExp(`^${pageNumber}$`) }).first();
  }

  /**
   * Clicks the Read button on the first card and waits for a new browser tab popup
   */
  async clickReadOnFirstCard(): Promise<Page> {
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.readButtons.first().click()
    ]);
    await newPage.waitForLoadState('domcontentloaded');
    return newPage;
  }

  /**
   * Clicks Delete (trash icon) button on the first card
   */
  async clickDeleteOnFirstCard(): Promise<void> {
    await this.deleteButtons.first().click({ force: true });
    await this.page.waitForTimeout(500);
  }

  /**
   * Clicks Cancel button on the delete confirmation modal
   */
  async clickCancelOnDeleteModal(): Promise<void> {
    await this.modalCancelButton.click({ force: true });
    await this.page.waitForTimeout(500);
  }

  /**
   * Clicks Delete button on the delete confirmation modal
   */
  async clickConfirmOnDeleteModal(): Promise<void> {
    await this.modalDeleteButton.click({ force: true });
    await this.page.waitForTimeout(500);
  }

  /**
   * Clicks a specific page number in pagination
   */
  async clickPageNumber(pageNumber: number): Promise<void> {
    const targetPageBtn = this.getPageNumberButton(pageNumber);
    await targetPageBtn.click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  /**
   * Extracts current count of Web Klips from "Showing X results for Web klips"
   */
  async getWebKlipsCount(): Promise<number> {
    const isCountVisible = await this.webKlipsCountText.first().isVisible({ timeout: 3000 }).catch(() => false);
    if (!isCountVisible) {
      return 0;
    }
    const text = await this.webKlipsCountText.first().innerText();
    const match = text.match(/Showing\s+([\d,]+)\s+results/i);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''), 10);
    }
    return 0;
  }

  /**
   * Clicks the "+ Add a web klip" button
   */
  async clickAddWebKlipButton(): Promise<void> {
    await this.addWebKlipButton.click({ force: true });
    await this.page.waitForTimeout(500);
  }

  /**
   * Enters URL in the Web Klip modal URL input
   */
  async enterWebKlipUrl(url: string): Promise<void> {
    await this.webKlipUrlInput.fill(url);
  }

  /**
   * Clicks Next button in Web Klip modal
   */
  async clickNextInWebKlipModal(): Promise<void> {
    await this.webKlipNextButton.click({ force: true });
    await this.page.waitForTimeout(500);
  }

  /**
   * Clicks Clear button in Web Klip modal
   */
  async clickClearInWebKlipModal(): Promise<void> {
    await this.webKlipClearButton.click({ force: true });
    await this.page.waitForTimeout(500);
  }

  /**
   * Enters Title in Step 2 of Web Klip modal
   */
  async enterWebKlipTitle(title: string): Promise<void> {
    await this.webKlipTitleInput.fill(title);
  }

  /**
   * Clicks Save button in Web Klip modal
   */
  async clickSaveInWebKlipModal(): Promise<void> {
    await this.webKlipSaveButton.click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  /**
   * Extracts current count of Saved Searches from "Showing X results for Saved Searches"
   */
  async getSavedSearchesCount(): Promise<number> {
    const isCountVisible = await this.savedSearchesCountText.first().isVisible({ timeout: 3000 }).catch(() => false);
    if (!isCountVisible) {
      return 0;
    }
    const text = await this.savedSearchesCountText.first().innerText();
    const match = text.match(/Showing\s+([\d,]+)\s+results/i);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''), 10);
    }
    return 0;
  }
}


