import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class OcaPage extends BasePage {
  readonly ocaNavLink: Locator;

  constructor(page: Page) {
    super(page);
    this.ocaNavLink = page.getByRole('link', { name: 'Off-Campus Access' });
  }

  /**
   * Helper to retrieve a widget container by its heading text.
   */
  getWidgetContainer(widgetTitle: string): Locator {
    return this.page.locator('div.var-padding.row')
      .filter({ has: this.page.getByText(widgetTitle) })
      .first();
  }

  /**
   * Helper to retrieve a widget's title heading locator.
   */
  getWidgetTitle(widgetTitle: string): Locator {
    return this.getWidgetContainer(widgetTitle)
      .locator('.grp-widget-title, div, h2, h3')
      .filter({ hasText: widgetTitle })
      .first();
  }

  /**
   * Helper to retrieve a widget's description / subtitle locator.
   */
  getWidgetDescription(widgetTitle: string): Locator {
    return this.getWidgetContainer(widgetTitle).locator('.grp-widget-desc').first();
  }

  /**
   * Navigates to the Off-Campus Access page via navbar link.
   */
  async goto() {
    console.log('[POM] Navigating to Off-Campus Access Page...');
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
    await expect(this.ocaNavLink).toBeVisible({ timeout: 20000 });
    await this.ocaNavLink.click();
    await this.verifyOcaPageLoaded();
  }

  /**
   * Verifies that the Off-Campus Access page has loaded successfully.
   */
  async verifyOcaPageLoaded() {
    console.log('[POM] Verifying Off-Campus Access page loaded...');
    await this.page.locator('text=Loading').waitFor({ state: 'detached', timeout: 30000 }).catch(() => {});
    const heading = this.page.getByText('Remote Access — Toggle View').first();
    await expect(heading).toBeVisible({ timeout: 20000 });
  }

  /**
   * Verifies a widget's header title and description sub-detail.
   */
  async verifyWidgetHeaderAndDescription(widgetTitle: string, expectedDesc: string) {
    console.log(`[POM] Verifying header and sub-detail for: "${widgetTitle}"...`);
    const container = this.getWidgetContainer(widgetTitle);
    await expect(container).toBeVisible({ timeout: 15000 });

    const titleEl = this.getWidgetTitle(widgetTitle);
    await expect(titleEl).toBeVisible({ timeout: 10000 });

    const descEl = this.getWidgetDescription(widgetTitle);
    await expect(descEl).toBeVisible({ timeout: 10000 });
    await expect(descEl).toContainText(expectedDesc);
  }

  /**
   * Retrieves category locator (headers/buttons) within a widget.
   */
  getWidgetCategoryElements(widgetTitle: string): Locator {
    const container = this.getWidgetContainer(widgetTitle);
    if (widgetTitle.toLowerCase().includes('tabbed')) {
      return container.getByRole('button');
    }
    return container.locator('strong');
  }

  /**
   * Verifies the total number of categories in a widget.
   */
  async verifyCategorizationCount(widgetTitle: string, expectedCount: number) {
    console.log(`[POM] Verifying categorization count in "${widgetTitle}" equals ${expectedCount}...`);
    const categoryEls = this.getWidgetCategoryElements(widgetTitle);
    await expect(categoryEls.first()).toBeVisible({ timeout: 10000 });
    const actualCount = await categoryEls.count();
    expect(actualCount).toBe(expectedCount);
  }

  /**
   * Verifies the presence of category headers within a widget.
   */
  async verifyWidgetCategories(widgetTitle: string, expectedCategories: string[]) {
    console.log(`[POM] Verifying categories in "${widgetTitle}": ${expectedCategories.join(', ')}...`);
    const container = this.getWidgetContainer(widgetTitle);
    const isTabbed = widgetTitle.toLowerCase().includes('tabbed');
    for (const category of expectedCategories) {
      // Use plain string to avoid regex parenthesis capture group issues
      const categoryEl = isTabbed
        ? container.getByRole('button', { name: category }).first()
        : container.locator('strong').filter({ hasText: category }).first();
      await expect(categoryEl).toBeVisible({ timeout: 10000 });
    }
  }

  /**
   * Verifies individual category counts (e.g. "Alpha Category" -> 15).
   */
  async verifyCategoryCounts(widgetTitle: string, categoriesWithCounts: Array<{ name: string, count: number }>) {
    console.log(`[POM] Verifying individual category counts in "${widgetTitle}"...`);
    const container = this.getWidgetContainer(widgetTitle);
    const isTabbed = widgetTitle.toLowerCase().includes('tabbed');
    for (const item of categoriesWithCounts) {
      const fullExpectedText = `${item.name} (${item.count})`;
      const el = isTabbed
        ? container.getByRole('button', { name: fullExpectedText }).first()
        : container.locator('strong').filter({ hasText: fullExpectedText }).first();
      await expect(el).toBeVisible({ timeout: 10000 });
    }
  }

  /**
   * Returns clickable resource card locators within a widget container.
   */
  getWidgetCards(widgetTitle: string): Locator {
    const container = this.getWidgetContainer(widgetTitle);
    return container.locator('a[title], .widgetNwlCardTitle, a:has(img[alt])')
      .filter({ hasNotText: /^View all$/i })
      .filter({ hasNot: this.page.locator('img[alt="View All"]') });
  }

  /**
   * Returns the count of resource cards in a widget.
   */
  async getWidgetCardCount(widgetTitle: string): Promise<number> {
    const cards = this.getWidgetCards(widgetTitle);
    await cards.first().waitFor({ state: 'attached', timeout: 10000 }).catch(() => {});
    return await cards.count();
  }

  /**
   * Performs search within a specific widget's search box.
   */
  async searchWithinWidget(widgetTitle: string, query: string) {
    console.log(`[POM] Searching inside "${widgetTitle}" with query: "${query}"...`);
    const container = this.getWidgetContainer(widgetTitle);
    const searchInput = container.getByRole('textbox', { name: 'Search' }).first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await searchInput.fill(query);
    await this.page.waitForTimeout(1000);
  }

  /**
   * Clears the search input within a specific widget.
   */
  async clearSearchWithinWidget(widgetTitle: string) {
    console.log(`[POM] Clearing search in "${widgetTitle}"...`);
    const container = this.getWidgetContainer(widgetTitle);
    const searchInput = container.getByRole('textbox', { name: 'Search' }).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('');
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Clicks a tab button within the Tabbed widget.
   */
  async clickTabInWidget(widgetTitle: string, tabName: string) {
    console.log(`[POM] Clicking tab "${tabName}" in "${widgetTitle}"...`);
    const container = this.getWidgetContainer(widgetTitle);
    const tabButton = container.getByRole('button', { name: tabName }).first();
    await expect(tabButton).toBeVisible({ timeout: 10000 });
    await tabButton.click();
    await this.page.waitForTimeout(800);
  }

  /**
   * Verifies that a specific resource card is visible within a widget.
   */
  async verifyResourceInWidget(widgetTitle: string, resourceName: string) {
    console.log(`[POM] Verifying resource "${resourceName}" in "${widgetTitle}"...`);
    const container = this.getWidgetContainer(widgetTitle);
    // Plain string hasText avoids RegExp capture issues with parentheses
    const resource = container.locator('a, span, .widgetNwlCardTitle').filter({ hasText: resourceName }).first();
    await expect(resource).toBeVisible({ timeout: 10000 });
  }

  /**
   * Clicks a resource/source card within a widget, verifies it opens the source page in a new tab,
   * validates the new tab URL, closes the new tab, and returns focus to the initial OCA page.
   */
  async clickResourceAndVerifyNewTab(widgetTitle: string, resourceName?: string): Promise<Page> {
    console.log(`[POM] Clicking resource card in "${widgetTitle}" to verify new tab navigation...`);
    const container = this.getWidgetContainer(widgetTitle);
    const targetCard = resourceName
      ? container.locator('a[title], .widgetNwlCardTitle, a:has(img[alt])').filter({ hasText: resourceName }).first()
      : this.getWidgetCards(widgetTitle).first();

    await expect(targetCard).toBeVisible({ timeout: 10000 });

    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page', { timeout: 15000 }),
      targetCard.click()
    ]);

    await newPage.waitForLoadState('domcontentloaded').catch(() => {});
    console.log(`[POM] New tab opened with URL: ${newPage.url()}`);

    // Verify new tab opened with a valid URL
    expect(newPage.url()).not.toBe('about:blank');
    expect(newPage.url().length).toBeGreaterThan(10);

    // Close the new tab and bring focus back to the initial OCA page
    console.log('[POM] Closing new tab and returning to initial OCA page...');
    await newPage.close();
    await this.page.bringToFront();
    await this.verifyOcaPageLoaded();

    return this.page;
  }

  /**
   * Returns "View all" link locators within a widget.
   */
  getWidgetViewAllLinks(widgetTitle: string): Locator {
    const container = this.getWidgetContainer(widgetTitle);
    return container.locator('a:has-text("View all"), a:has(img[alt="View All"])');
  }

  /**
   * Clicks a "View all" link within a widget, verifies navigation to the View All page,
   * validates View All page breadcrumb and content, navigates back, and verifies return to the OCA page.
   */
  async clickViewAllAndVerifyNavigation(widgetTitle: string, index = 0) {
    console.log(`[POM] Clicking "View all" (index: ${index}) in "${widgetTitle}"...`);
    const viewAllLinks = this.getWidgetViewAllLinks(widgetTitle);
    await expect(viewAllLinks.nth(index)).toBeVisible({ timeout: 10000 });
    await viewAllLinks.nth(index).click();

    await this.page.waitForLoadState('domcontentloaded');
    await this.page.locator('text=Loading').waitFor({ state: 'detached', timeout: 30000 }).catch(() => {});

    // Verify View All page loaded
    expect(this.page.url()).toContain('/portal/v2/default/viewAll');
    const breadcrumb = this.page.locator('.breadcrumb, nav[aria-label="breadcrumb"]').filter({ hasText: 'View All' }).first();
    await expect(breadcrumb).toBeVisible({ timeout: 10000 });

    const cardCount = await this.page.locator('a[title], .card, .widgetNwlCardTitle').count();
    expect(cardCount).toBeGreaterThan(0);

    // Navigate back to the OCA page
    console.log(`[POM] Returning to OCA page from View All...`);
    await this.page.goBack();
    await this.page.waitForLoadState('domcontentloaded');
    await this.verifyOcaPageLoaded();
  }

  /**
   * Verifies that a "View all" button/card is displayed for every category in a widget.
   */
  async verifyViewAllDisplayedForAllCategories(widgetTitle: string, expectedCount = 6) {
    console.log(`[POM] Verifying "View all" is displayed for all categories in "${widgetTitle}"...`);
    const container = this.getWidgetContainer(widgetTitle);

    if (widgetTitle.toLowerCase().includes('tabbed')) {
      const tabs = container.getByRole('button');
      const tabCount = await tabs.count();
      for (let i = 0; i < tabCount; i++) {
        await tabs.nth(i).click();
        await this.page.waitForTimeout(300);
        const viewAll = container.locator('a:has-text("View all"), a:has(img[alt="View All"])').first();
        await expect(viewAll).toBeVisible({ timeout: 10000 });
      }
    } else {
      const viewAllLinks = this.getWidgetViewAllLinks(widgetTitle);
      await expect(viewAllLinks.first()).toBeVisible({ timeout: 10000 });
      const count = await viewAllLinks.count();
      expect(count).toBe(expectedCount);
      for (let i = 0; i < count; i++) {
        await expect(viewAllLinks.nth(i)).toBeVisible({ timeout: 5000 });
      }
    }
  }
}




