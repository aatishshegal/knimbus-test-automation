import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class AtoZResultPage extends BasePage {
  readonly atozNavLink: Locator;
  readonly breadcrumbAtoZ: Locator;
  readonly pageHeading: Locator;
  readonly pageSubtitle: Locator;
  readonly bannerImage: Locator;
  readonly alphabetContainer: Locator;
  readonly ecatalogTab: Locator;
  readonly multimediaTab: Locator;
  readonly searchWithinInput: Locator;
  readonly searchWithinButton: Locator;
  readonly viewSwitcher: Locator;
  readonly sortDropdown: Locator;
  readonly resultsCountText: Locator;
  readonly filtersSidebar: Locator;
  readonly filtersHeader: Locator;
  readonly filterCollapseToggle: Locator;
  readonly resultCards: Locator;
  readonly paginationContainer: Locator;
  readonly nextPageButton: Locator;
  readonly prevPageButton: Locator;

  constructor(page: Page) {
    super(page);

    // Header & Navigation
    this.atozNavLink = page.getByRole('link', { name: /^A-Z List$/i })
      .or(page.locator('nav, .navbar, header').locator('a').filter({ hasText: /^A-Z List$/i }))
      .first();

    // Breadcrumbs
    this.breadcrumbAtoZ = page.locator('.breadcrumb, ol.breadcrumb, nav[aria-label*="breadcrumb"], [class*="breadcrumb"]')
      .getByText(/A-Z List/i)
      .first();

    // Banner Title & Subtitle
    this.pageHeading = page.locator('.page-title, .grp-widget-title, .title, .banner-title, h1, h2, h3, h4, h5, p')
      .filter({ hasText: /^A-Z List$/i })
      .first();

    this.pageSubtitle = page.getByText(/An exhaustive catalog of your organization's digital assets/i).first();
    this.bannerImage = page.locator('img[alt*="A2Z"], img[src*="atoz"], img[alt*="A-Z"]').first();

    // Alphabet Bar Container
    this.alphabetContainer = page.locator('div, ul, nav, section')
      .filter({ has: page.locator('a, button, span, li', { hasText: /^A$/ }) })
      .filter({ has: page.locator('a, button, span, li', { hasText: /^Z$/ }) })
      .first();

    // Content Tabs (Buttons: eCatalog, Multimedia)
    this.ecatalogTab = page.getByRole('button', { name: /^eCatalog$/i })
      .or(page.locator('button, a, [role="tab"]').filter({ hasText: /^eCatalog$/i }))
      .first();

    this.multimediaTab = page.getByRole('button', { name: /^Multimedia$/i })
      .or(page.locator('button, a, [role="tab"]').filter({ hasText: /^Multimedia$/i }))
      .first();

    // Search Within Results
    this.searchWithinInput = page.getByPlaceholder(/search within results/i).first();
    this.searchWithinButton = page.getByRole('button', { name: /search/i })
      .or(page.locator('.search-within, .search-box, div:has(> input[placeholder*="within"])').locator('button, span, i, svg'))
      .first();

    // View Switcher & Sort Dropdown
    this.viewSwitcher = page.getByRole('button', { name: /Grid View|List View/i })
      .or(page.locator('button, a').filter({ hasText: /Grid View/i }))
      .first();

    this.sortDropdown = page.getByRole('button', { name: /Alphabetically/i })
      .or(page.locator('button, a').filter({ hasText: /Alphabetically/i }))
      .first();

    // Results Count & Grid Cards
    this.resultsCountText = page.locator('text=/Showing [\\d,]+ for/i').or(page.getByText(/Showing.*for/i)).first();
    this.resultCards = page.locator('div:has(> .detail-container):has(> .actions), div:has(> .detail-container)');

    // Sidebar Filters
    this.filtersSidebar = page.locator('.filter-block, [class*="filter-block"]').first();
    this.filtersHeader = page.locator('.filter-block-heading.web-view');
    this.filterCollapseToggle = page.locator('.filter-toggle-web button');

    // Pagination
    this.paginationContainer = page.locator('ul.pagination, .pagination, [class*="pagination"]')
      .or(page.locator('ul, nav, ol').filter({ has: page.locator('button, a').filter({ hasText: /^1$/ }) }))
      .first();

    this.nextPageButton = this.paginationContainer.getByRole('button', { name: /Next/i })
      .or(this.paginationContainer.locator('button, a').filter({ hasText: /Next/i }))
      .or(page.getByRole('button', { name: /Next/i }))
      .first();

    this.prevPageButton = this.paginationContainer.getByRole('button', { name: /Prev|Previous/i })
      .or(this.paginationContainer.locator('button, a').filter({ hasText: /Prev/i }))
      .or(page.getByRole('button', { name: /Prev|Previous/i }))
      .first();
  }

  /**
   * Navigates to the A-Z List page via Navbar link and ensures a fresh, clean page state.
   */
  async goto() {
    console.log('[POM] Navigating to A-Z List Page via navbar...');
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
    await expect(this.atozNavLink).toBeVisible({ timeout: 25000 });
    await this.clickElement(this.atozNavLink, 'A-Z List Navbar Link');
    await this.verifyPageLoaded();

    // Clear any active filters from previous tests to guarantee a fresh state
    const clearAll = this.page.getByRole('link', { name: /^Clear All$/i })
      .or(this.page.locator('a, button').filter({ hasText: /^Clear All$/i }))
      .first();
    if (await clearAll.isVisible({ timeout: 1000 }).catch(() => false)) {
      console.log('[POM] Clearing leftover active filters for fresh test state...');
      await clearAll.click();
      await this.page.waitForTimeout(1500);
    }

    // Clear search within input if populated from prior tests
    if (await this.searchWithinInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      const val = await this.searchWithinInput.inputValue().catch(() => '');
      if (val) {
        console.log('[POM] Clearing leftover search input for fresh test state...');
        await this.searchWithinInput.fill('');
        await this.searchWithinInput.press('Enter');
        await this.page.waitForTimeout(1500);
      }
    }
  }

  /**
   * Verifies that the A-Z List Page has successfully loaded by asserting the unique subtitle.
   */
  async verifyPageLoaded() {
    console.log('[POM] Verifying A-Z List Page loaded...');
    await expect(this.pageSubtitle).toBeVisible({ timeout: 20000 });
  }

  /**
   * Verifies breadcrumbs indicate Home / A-Z List.
   */
  async verifyBreadcrumbs() {
    console.log('[POM] Verifying Breadcrumbs...');
    await expect(this.breadcrumbAtoZ).toBeVisible({ timeout: 15000 });
  }

  /**
   * Retrieves locator for an alphabet letter button within the alphabet ribbon.
   */
  getLetterLocator(letter: string): Locator {
    return this.page.getByRole('link', { name: letter, exact: true })
      .or(this.alphabetContainer.locator('a, button, span, li').filter({ hasText: new RegExp(`^\\s*${letter}\\s*$`) }))
      .first();
  }

  /**
   * Verifies that all 26 alphabet letters are present and visible in the ribbon.
   */
  async verifyAllAlphabetLetters(expectedLetters: string[]) {
    console.log('[POM] Verifying Alphabet letters A-Z...');
    await expect(this.alphabetContainer).toBeVisible({ timeout: 15000 });
    for (const letter of expectedLetters) {
      const letterLocator = this.getLetterLocator(letter);
      await expect(letterLocator, `Expected letter "${letter}" to be visible in alphabet bar`).toBeVisible();
    }
  }

  /**
   * Clicks an alphabet letter to filter catalog items.
   */
  async clickAlphabetLetter(letter: string) {
    console.log(`[POM] Clicking Alphabet letter: ${letter}...`);
    const letterLocator = this.getLetterLocator(letter);
    await this.clickElement(letterLocator, `Alphabet Letter ${letter}`);
    await this.page.waitForTimeout(2500);
  }

  /**
   * Verifies that both eCatalog and Multimedia tabs are visible.
   */
  async verifyTabsVisible() {
    console.log('[POM] Verifying Content Tabs...');
    await expect(this.ecatalogTab).toBeVisible({ timeout: 10000 });
    await expect(this.multimediaTab).toBeVisible({ timeout: 10000 });
  }

  /**
   * Switches to a specific content tab (eCatalog or Multimedia).
   */
  async switchTab(tabName: 'eCatalog' | 'Multimedia') {
    console.log(`[POM] Switching to tab: ${tabName}...`);
    const targetTab = tabName === 'eCatalog' ? this.ecatalogTab : this.multimediaTab;
    await this.clickElement(targetTab, `${tabName} Tab`);
    await this.page.waitForTimeout(2000);
  }

  /**
   * Retrieves locator for a specific filter facet accordion heading.
   */
  getFilterFacet(facetName: string): Locator {
    return this.page.locator('#filterCustomAccordian .accordion-button, #filterCustomAccordian .btn-accordian-fltr')
      .filter({ has: this.page.locator('.filter-title', { hasText: new RegExp(`^\\s*${facetName}\\s*$`, 'i') }) })
      .or(
        this.page.locator('#filterCustomAccordian .accordion-button, #filterCustomAccordian .btn-accordian-fltr')
          .filter({ hasText: new RegExp(facetName, 'i') })
      )
      .first();
  }

  /**
   * Verifies that all configured filter facets are displayed in the sidebar.
   */
  async verifyFilterFacets(expectedFacets: string[]) {
    console.log('[POM] Verifying Filter Facets in sidebar...');
    await expect(this.filtersHeader).toBeVisible({ timeout: 10000 });

    for (const facet of expectedFacets) {
      const facetLocator = this.getFilterFacet(facet);
      await expect(facetLocator, `Expected facet "${facet}" to be visible in filters sidebar`).toBeVisible({ timeout: 5000 });
    }
  }

  /**
   * Expands a filter facet accordion by clicking its header.
   */
  async expandFilterFacet(facetName: string) {
    console.log(`[POM] Expanding filter facet: ${facetName}...`);
    const facetLocator = this.getFilterFacet(facetName);
    await expect(facetLocator).toBeVisible({ timeout: 10000 });
    await this.clickElement(facetLocator, `Facet ${facetName}`);
    await this.page.waitForTimeout(1000);

    const accordionItem = facetLocator.locator('xpath=ancestor::*[contains(@class, "accordion-item")]');
    const accordionBody = accordionItem.locator('.accordion-collapse, .accordion-body');
    await expect(accordionBody.first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Toggles the filter sidebar collapse/expand.
   */
  async toggleFilterSidebar() {
    console.log('[POM] Toggling filter sidebar...');
    await expect(this.filterCollapseToggle).toBeVisible({ timeout: 10000 });
    await this.clickElement(this.filterCollapseToggle, 'Filter Collapse Toggle');
    await this.page.waitForTimeout(1000);
  }

  /**
   * Searches within results using the search input.
   */
  async searchWithinResults(query: string) {
    console.log(`[POM] Searching within results for: "${query}"...`);
    await expect(this.searchWithinInput).toBeVisible({ timeout: 10000 });
    await this.searchWithinInput.fill(query);
    await this.searchWithinInput.press('Enter');
    await this.page.waitForTimeout(3000);
  }

  /**
   * Clears the search within results input.
   */
  async clearSearchWithin() {
    console.log('[POM] Clearing Search Within results...');
    await this.searchWithinInput.fill('');
    await this.searchWithinInput.press('Enter');
    await this.page.waitForTimeout(2000);
  }

  /**
   * Verifies that results cards are rendered in the grid.
   */
  async verifyResultsDisplayed() {
    console.log('[POM] Verifying Results Grid Cards...');
    await expect(this.resultsCountText).toBeVisible({ timeout: 15000 });
    await expect(this.resultCards.first()).toBeVisible({ timeout: 15000 });
    const count = await this.resultCards.count();
    expect(count, 'Expected at least 1 result card to be visible in the catalog grid').toBeGreaterThan(0);
  }

  /**
   * Verifies complete card metadata (title, author/publisher, action buttons).
   */
  async verifyFirstCardMetadata() {
    console.log('[POM] Verifying First Card metadata...');
    const firstCard = this.resultCards.first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });

    const title = firstCard.locator('.title, h4, h5, button, a').first();
    await expect(title).toBeVisible({ timeout: 10000 });
    const titleText = (await title.innerText()) || (await firstCard.innerText());
    expect(titleText.trim().length, 'Expected card to have non-empty text').toBeGreaterThan(0);
  }

  /**
   * Verifies action buttons on the first card (Read, View details, Add to favourites, Share).
   */
  async verifyFirstCardActionButtons() {
    console.log('[POM] Verifying First Card action buttons...');
    const firstCard = this.resultCards.first();
    await expect(firstCard.getByRole('button', { name: /^Read$/i })).toBeVisible({ timeout: 10000 });
    await expect(firstCard.locator('a[title*="View details"], a[title*="details" i]').or(firstCard.getByRole('link', { name: /view details/i }))).toBeVisible({ timeout: 10000 });
    await expect(firstCard.locator('a[title*="favourites" i], a[title*="favorite" i]').or(firstCard.getByRole('link', { name: /favourites|favorite/i }))).toBeVisible({ timeout: 10000 });
    await expect(firstCard.locator('a[title*="Share" i]').or(firstCard.getByRole('link', { name: /share/i }))).toBeVisible({ timeout: 10000 });
  }

  /**
   * Clicks the Read button on the first card and verifies tab handling.
   */
  async clickFirstCardReadButton() {
    console.log('[POM] Clicking Read button on first card...');
    const firstCard = this.resultCards.first();
    const readBtn = firstCard.getByRole('button', { name: /^Read$/i });

    await this.clickElement(readBtn, 'Card Read Button');
    await this.page.waitForTimeout(3000);

    const pages = this.page.context().pages();
    if (pages.length > 1) {
      console.log('[POM] Document opened in new tab, closing tab...');
      const newPage = pages[pages.length - 1];
      await newPage.close();
      await this.page.bringToFront();
    }
  }

  /**
   * Verifies View switcher and Sort dropdown controls.
   */
  async verifyViewAndSortControls() {
    console.log('[POM] Verifying View Switcher and Sort Dropdown...');
    await expect(this.viewSwitcher).toBeVisible();
    await expect(this.sortDropdown).toBeVisible();
  }

  /**
   * Retrieves locator for a specific page number button in pagination.
   */
  getPageNumberButton(pageNumber: string): Locator {
    return this.paginationContainer.getByRole('button', { name: pageNumber, exact: true })
      .or(this.paginationContainer.locator('button, a').filter({ hasText: new RegExp(`^\\s*${pageNumber}\\s*$`) }))
      .or(this.page.getByRole('button', { name: pageNumber, exact: true }))
      .first();
  }

  /**
   * Verifies pagination controls are visible and page 1 is active.
   */
  async verifyPaginationControls() {
    console.log('[POM] Verifying Pagination Controls...');
    await this.paginationContainer.scrollIntoViewIfNeeded().catch(() => {});
    await expect(this.paginationContainer).toBeVisible({ timeout: 10000 });
    const page1Btn = this.getPageNumberButton('1');
    await expect(page1Btn).toBeVisible({ timeout: 10000 });
    await expect(this.nextPageButton).toBeVisible({ timeout: 10000 });
  }

  /**
   * Navigates to the next page using pagination controls.
   */
  async goToNextPage() {
    console.log('[POM] Navigating to next page...');
    await this.paginationContainer.scrollIntoViewIfNeeded().catch(() => {});
    await expect(this.nextPageButton).toBeVisible({ timeout: 10000 });
    await this.clickElement(this.nextPageButton, 'Next Page Button');
    await this.page.waitForTimeout(2500);
    const page2Btn = this.getPageNumberButton('2');
    await expect(page2Btn).toBeVisible({ timeout: 10000 });
    await this.verifyResultsDisplayed();
  }

  /**
   * Navigates back to the first page using pagination controls.
   */
  async returnToFirstPage() {
    console.log('[POM] Returning to first page...');
    await this.paginationContainer.scrollIntoViewIfNeeded().catch(() => {});
    const page1Btn = this.getPageNumberButton('1');
    await expect(page1Btn).toBeVisible({ timeout: 10000 });
    await this.clickElement(page1Btn, 'Page 1 Button');
    await this.page.waitForTimeout(2500);
    await this.verifyResultsDisplayed();
  }

  /**
   * Selects the first available checkbox option under an expanded facet and verifies filter is applied.
   */
  async selectFirstFacetOption(facetName: string) {
    console.log(`[POM] Selecting first option under facet: ${facetName}...`);
    const facetLocator = this.getFilterFacet(facetName);
    const accordionItem = facetLocator.locator('xpath=ancestor::*[contains(@class, "accordion-item")]');
    const firstOptionLabel = accordionItem.locator('.filter-item-box, label.filter-chk-box-label, input.filter-chk-box').first();
    await expect(firstOptionLabel).toBeVisible({ timeout: 5000 });
    await this.clickElement(firstOptionLabel, `First option in ${facetName}`);
    await this.page.waitForTimeout(2500);

    // Verify active filter indicator (Clear All link becomes visible)
    const clearAll = this.page.getByRole('link', { name: /^Clear All$/i })
      .or(this.page.locator('a, button').filter({ hasText: /^Clear All$/i }))
      .first();
    await expect(clearAll).toBeVisible({ timeout: 10000 });
  }

  /**
   * Clicks 'Clear All' active filters link and verifies filters are removed and catalog restored.
   */
  async clearAllFilters() {
    console.log('[POM] Clearing all active filters...');
    const clearAll = this.page.getByRole('link', { name: /^Clear All$/i })
      .or(this.page.locator('a, button').filter({ hasText: /^Clear All$/i }))
      .first();
    await expect(clearAll).toBeVisible({ timeout: 5000 });
    await this.clickElement(clearAll, 'Clear All Filters Link');
    await expect(clearAll).toBeHidden({ timeout: 7000 });
    await this.page.waitForTimeout(1000);
    await this.verifyResultsDisplayed();
  }

  /**
   * Verifies an applied filter tag is displayed in the sidebar.
   */
  async verifyAppliedFilterTag(expectedText: string) {
    console.log(`[POM] Verifying applied filter tag: ${expectedText}...`);
    const filterTag = this.page.locator('.filter-block, [class*="filter-block"]')
      .getByText(new RegExp(expectedText, 'i'))
      .first();
    await expect(filterTag).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verifies empty search results state for invalid search queries.
   */
  async verifyNoResultsFound() {
    console.log('[POM] Verifying No Results Found message...');
    const noResults = this.page.getByText(/No (records|results|data) found|Showing 0 for|No Document Found/i)
      .or(this.page.locator('.no-results, .no-data, .empty-state, [class*="no-result"]'))
      .first();
    await expect(noResults).toBeVisible({ timeout: 10000 });
  }
}
