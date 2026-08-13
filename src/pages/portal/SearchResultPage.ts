import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SearchResultPage extends BasePage {
  readonly searchResultIdentifier: Locator;
  readonly tabsContainer: Locator;
  readonly sortingDropdownToggle: Locator;
  readonly viewDropdownToggle: Locator;
  readonly innerSearchInput: Locator;
  readonly searchCountText: Locator;
  readonly filtersSidebar: Locator;
  readonly saveSearchButton: Locator;
  readonly toastNotification: Locator;
  
  // View Options
  readonly viewOptionList: Locator;
  readonly viewOptionGrid: Locator;
  readonly sortOptionsContainer: Locator;
  
  // Pagination & Filters
  readonly firstFilterCheckbox: Locator;
  readonly activePageIndicator: Locator;
  readonly nextPageButton: Locator;

  constructor(page: Page) {
    super(page);
    // When a search is performed, the URL routes to /portal/v2/default/searchresult
    // We will use the page header or generic body as a fallback to ensure the page has loaded.
    this.searchResultIdentifier = page.locator('.page-title, h1, h2, h3').filter({ hasText: 'Search' }).or(page.locator('body')).first();
    
    // Tabs (Container fallback if needed, but buttons are more direct)
    this.tabsContainer = page.locator('.result-page-tabs, .custom-tabs-container, .tabs-wrapper').first();
    
    // Controls
    this.sortingDropdownToggle = page.locator('.sort-by .dropdown-toggle, .sort-by a[data-bs-toggle="dropdown"]');
    this.viewDropdownToggle = page.locator('.view-options, a[data-bs-toggle="dropdown"]').filter({ hasText: 'View' }); // Fallback pattern, though UI shows "Grid View" as text
    
    // Dropdown items (they appear in .dropdown-menu.show when the toggle is clicked)
    this.viewOptionGrid = page.locator('.dropdown-menu.show a, .dropdown-menu.show .dropdown-item').filter({ hasText: 'Grid View' });
    this.viewOptionList = page.locator('.dropdown-menu.show a, .dropdown-menu.show .dropdown-item').filter({ hasText: 'List View' });
    
    // Sorting options
    this.sortOptionsContainer = page.locator('.sort-by .dropdown-menu.show, .dropdown-menu.show');
    
    // Search area
    this.innerSearchInput = page.locator('input[placeholder="Search within results"]');
    this.searchCountText = page.locator('text=/^Showing [\\d,]+ for/').first();
    
    // Filters and Pagination
    this.filtersSidebar = page.locator('.filter-block, .filter-block-heading.web-view, aside').first();
    this.firstFilterCheckbox = page.locator('.filter-chk-box').first();
    
    this.activePageIndicator = page.locator('.pagin-active, .pagination .active').first();
    this.nextPageButton = page.locator('.pagination [title="Next"], .pagination [aria-label="Next"]').first();
    
    // Save Search & Toast
    this.saveSearchButton = page.locator('img[alt="Save"], img[title="Save"], .save-search-btn').first();
    this.toastNotification = page.locator('.toast, .snackbar, #toast-container, .alert, .MuiSnackbar-root, .success-message, .toast-message, [role="alert"]').or(page.locator('text=/Your search has been saved|The search is already saved|You have already saved this search/i')).first();
  }
  
  /**
   * Returns a locator for a specific tab by its exact name
   */
  getTabByName(tabName: string) {
    return this.page.locator('button.custom-tabs, .result-page-tabs button').filter({ hasText: tabName });
  }

  /**
   * Explicitly wait for the backend API to finish sorting/reloading the results.
   * Uses network interception instead of hardcoded timeouts.
   */
  async waitForResultsToReload() {
    try {
      // Intercept the API call that searches/sorts
      await this.page.waitForResponse(response => 
        response.url().includes('search') && response.status() === 200, 
        { timeout: 10000 }
      );
    } catch (error) {
      console.warn('API intercept for search/sort timed out. Assuming DOM updated natively.');
    }
    // Also wait for the results container to stabilize
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Extracts the titles of the visible search results.
   */
  async getVisibleResultTitles(): Promise<string[]> {
    return await this.page.evaluate(() => {
      const titleElements = Array.from(document.querySelectorAll('.grid-view-card .title, .list-view-card .title, .detail-container .title'));
      return titleElements.map(el => (el as HTMLElement).innerText.trim()).filter(text => text.length > 0);
    });
  }

  /**
   * Extracts the publication years from the visible search results.
   */
  async getVisibleResultYears(): Promise<number[]> {
    return await this.page.evaluate(() => {
      const resultBlocks = Array.from(document.querySelectorAll('.grid-view-card, .list-view-card, .detail-container'));
      
      return resultBlocks.map(block => {
        const text = (block as HTMLElement).innerText || '';
        // Extract a 4-digit year starting with 19 or 20
        const yearMatch = text.match(/\b(19|20)\d{2}\b/);
        return yearMatch ? parseInt(yearMatch[0], 10) : 0;
      }).filter(year => year > 0); // Exclude items without a detectable year
    });
  }
  /**
   * Returns a Locator for a specific search result card by index.
   * Elements within this locator can be accessed using standard chaining, e.g.:
   * card.locator('.title')
   */
  getSearchResultCard(index: number = 0): Locator {
    return this.page.locator('.grid-view-card').nth(index);
  }

  /**
   * Selects a random search result card from the current page.
   */
  async getRandomSearchResultCard(): Promise<Locator> {
    const count = await this.page.locator('.grid-view-card').count();
    if (count === 0) {
      throw new Error('No search result cards found on the page.');
    }
    const randomIndex = Math.floor(Math.random() * count);
    return this.getSearchResultCard(randomIndex);
  }
}
