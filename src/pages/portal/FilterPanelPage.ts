import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class FilterPanelPage extends BasePage {
  readonly filtersSidebar: Locator;
  readonly appliedFiltersContainer: Locator;
  readonly clearAllButton: Locator;
  
  constructor(page: Page) {
    super(page);
    // Main wrapper for the filter panel
    this.filtersSidebar = page.locator('.filter-block, aside').first();
    
    // Applied filters area (typically at the top of the sidebar)
    // The text "Applied Filters:" is inside a wrapper (e113). Its parent (e112) contains both this wrapper and all the filter chips.
    this.appliedFiltersContainer = this.filtersSidebar.locator('.applied-filters-container, .filter-chip-container, .applied-filter').or(this.filtersSidebar.locator('text=/^Applied Filters:/i').locator('xpath=..'));
    
    // Clear All button
    this.clearAllButton = this.filtersSidebar.getByText('Clear All', { exact: true }).or(this.filtersSidebar.locator('a.clear-all, button.clear-all'));
  }

  /**
   * Returns a RegExp that safely matches the category name followed by optional whitespace and a number.
   * e.g., "Source 15", "Access Type 2", "Source"
   */
  private getCategoryRegex(categoryName: string): RegExp {
    // Escape special characters in categoryName to be safe
    const escapedName = categoryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`^${escapedName}\\s*\\d*$`, 'i');
  }

  /**
   * Locates the main category header button (e.g. "Source 15")
   */
  getCategoryButton(categoryName: string): Locator {
    // Uses the regex to match exact name and optional count dynamically, irrespective of what the count is
    return this.filtersSidebar.getByRole('button', { name: this.getCategoryRegex(categoryName) }).first();
  }

  /**
   * Expands the filter category if it is collapsed.
   */
  async expandFilter(categoryName: string) {
    const categoryBtn = this.getCategoryButton(categoryName);
    
    // Wait for it to be visible
    await categoryBtn.waitFor({ state: 'visible' });

    // Check if it's already expanded. We can usually tell by 'aria-expanded' or by checking if the content is visible.
    // Knimbus uses chevron icons or aria-expanded. We will check aria-expanded first.
    const isExpanded = await categoryBtn.getAttribute('aria-expanded');
    
    if (isExpanded === 'false' || isExpanded === null) {
      // If null, we might need to rely on the visibility of the "View All" link or checkboxes
      // Let's click it to expand
      await this.clickElement(categoryBtn, `Expand ${categoryName} Filter Category`);
      await this.page.waitForTimeout(500); // Wait for animation
    }
  }

  /**
   * Applies a specific filter value within a category.
   */
  async applyFilterValue(categoryName: string, valueName: string) {
    await this.expandFilter(categoryName);
    
    // Locate the checkbox directly by its accessible name (e.g., "IEEE(341)" or "IEEE")
    const filterOption = this.filtersSidebar.getByRole('checkbox', { name: new RegExp(`^${valueName.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}`, 'i') }).first();
    
    await this.clickElement(filterOption, `Apply filter ${valueName} in ${categoryName}`);
    await this.waitForFilterUpdate();
  }

  /**
   * Clears a specific applied filter.
   */
  async removeAppliedFilter(categoryName: string, valueName: string) {
    const chip = this.getAppliedFilterChip(valueName);
    const closeBtn = chip.getByRole('link', { name: /Remove/i }).first();
    await this.clickElement(closeBtn, `Remove applied filter ${valueName}`);
    await this.waitForFilterUpdate();
  }

  /**
   * Clicks the Clear All button.
   */
  async clearAllFilters() {
    const clearBtn = this.appliedFiltersContainer.getByRole('link', { name: /Clear All/i }).or(this.clearAllButton).first();
    await this.clickElement(clearBtn, 'Clear All Filters');
    await this.waitForFilterUpdate();
  }

  /**
   * Opens the View All popup for a category.
   */
  async openViewAllPopup(categoryName: string) {
    await this.expandFilter(categoryName);
    
    // The View All link is usually within the same block as the category.
    const viewAllLink = this.filtersSidebar.getByRole('link', { name: /^View All/i }).first();
    await this.clickElement(viewAllLink, `Open View All for ${categoryName}`);
    
    // Wait for the modal to appear
    await this.page.locator('.modal, .popup-container, .view-all-modal, .MuiDialog-root').first().waitFor({ state: 'visible' });
  }

  /**
   * Extracts the count badge from a category heading.
   */
  async getCategoryCount(categoryName: string): Promise<number> {
    const categoryBtn = this.getCategoryButton(categoryName);
    const text = await categoryBtn.innerText();
    // Extracts the last sequence of digits in the string
    const match = text.match(/\d+$/);
    return match ? parseInt(match[0], 10) : 0;
  }

  /**
   * Extracts the count next to a specific filter value checkbox (e.g. "IEEE (341)").
   */
  async getFilterValueCount(categoryName: string, valueName: string): Promise<number> {
    await this.expandFilter(categoryName);
    const filterOption = this.filtersSidebar.getByRole('checkbox', { name: new RegExp(`^${valueName.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}`, 'i') }).first();
    
    // Look up to the parent label, then find the dedicated count span
    const countText = await filterOption.locator('xpath=..').locator('.filter-field-count').innerText().catch(() => '');
    const match = countText.match(/\d+/);
    if (match) {
      return parseInt(match[0], 10);
    }
    return 0;
  }

  /**
   * Helper to get a specific applied filter chip resiliently
   */
  getAppliedFilterChip(valueName: string): Locator {
    // Applied chips contain the filter value and a "Remove" link.
    // We find all "Remove" links in the sidebar, get their parent wrappers,
    // and filter for the one containing our valueName.
    return this.filtersSidebar
      .getByRole('link', { name: /Remove/i })
      .locator('xpath=..')
      .filter({ hasText: new RegExp(valueName, 'i') })
      .first();
  }

  /**
   * Checks if a filter is currently applied by waiting up to 3 seconds for it to be visible.
   */
  async isFilterApplied(valueName: string): Promise<boolean> {
    const chip = this.getAppliedFilterChip(valueName);
    try {
      await chip.waitFor({ state: 'visible', timeout: 3000 });
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Checks if an inner search term filter is applied (the "Drilldown to:" chip)
   */
  async isInnerSearchFilterApplied(searchTerm: string): Promise<boolean> {
    const drilldownChip = this.filtersSidebar.locator('.filterSearchTerm').filter({ hasText: new RegExp(searchTerm, 'i') }).first();
    try {
      await drilldownChip.waitFor({ state: 'visible', timeout: 3000 });
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Extracts the total result count from the "Showing X for Y" header.
   */
  async getResultCountText(): Promise<number> {
    const headerTextLocator = this.page.locator('text=/^Showing [\\d,]+ for/').first();
    await headerTextLocator.waitFor({ state: 'visible' });
    const text = await headerTextLocator.innerText();
    const match = text.match(/Showing ([\d,]+) for/);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''), 10);
    }
    return 0;
  }

  /**
   * Helper to wait for network/DOM stability after applying/removing a filter.
   */
  private async waitForFilterUpdate() {
    try {
      // Intercept the search API call
      await this.page.waitForResponse(response => 
        response.url().includes('search') && response.status() === 200, 
        { timeout: 15000 }
      );
    } catch (e) {
      console.warn('Filter update API intercept timed out. Assuming DOM updated natively.');
    }
    
    await this.page.waitForTimeout(1000); 
    
    // Explicitly wait for results to become visible (bypassing any blocking loader)
    // We wait up to 15s instead of swallowing the timeout, so tests don't fail later on random elements.
    await this.page.locator('.grid-view-card, .list-view-card, .detail-container, .no-data').first().waitFor({ state: 'visible', timeout: 15000 });
  }
}
