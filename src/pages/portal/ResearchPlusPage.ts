import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ResearchPlusPage extends BasePage {
  readonly pageIdentifier: Locator;
  readonly searchTipsHeading: Locator;
  readonly queryTypeDropdown: Locator;
  readonly searchBarInput: Locator;
  readonly searchButton: Locator;
  readonly fromYearInput: Locator;
  readonly toYearInput: Locator;
  
  // Advanced Search Locators
  readonly queryTypeDropdown1: Locator;
  readonly queryTypeDropdown2: Locator;
  readonly queryTypeDropdown3: Locator;
  readonly searchBarInput1: Locator;
  readonly searchBarInput2: Locator;
  readonly searchBarInput3: Locator;
  readonly matchDropdown: Locator;
  readonly addQueryTypeBtn: Locator;
  readonly resetAllButton: Locator;
  
  // Results Locators
  readonly showingCountIndicator: Locator;
  readonly resultPageTabs: Locator;
  readonly refreshButton: Locator;
  readonly getMoreButton: Locator;
  readonly pollingHourglass: Locator;

  // Selected Resources Locators (Tabs and Actions)
  readonly defaultTab: Locator;
  readonly subscribedTab: Locator;
  readonly openTab: Locator;
  readonly allTab: Locator;
  readonly historyTab: Locator;
  readonly clearAllButton: Locator;
  readonly selectAllButton: Locator;
  readonly defaultButton: Locator;
  readonly sourceSearchInput: Locator;
  readonly allResourcesList: Locator;
  readonly historyResourcesList: Locator;

  constructor(page: Page) {
    super(page);
    // Identify the page by its title element
    this.pageIdentifier = page.locator('.grp-widget-title').filter({ hasText: 'Research+' });
    
    // Locators for Research+ form
    this.searchTipsHeading = page.locator('#srch-tips');
    this.queryTypeDropdown = page.locator('select[name="f1"]');
    this.searchBarInput = page.locator('input[name="st1"]');
    this.searchButton = page.locator('button[type="submit"][form="searchQueryForm"]');
    
    // Advanced Search Locators
    this.queryTypeDropdown1 = page.locator('select[name="f1"]');
    this.queryTypeDropdown2 = page.locator('select[name="f2"]');
    this.queryTypeDropdown3 = page.locator('select[name="f3"]');
    this.searchBarInput1 = page.locator('input[name="st1"]');
    this.searchBarInput2 = page.locator('input[name="st2"]');
    this.searchBarInput3 = page.locator('input[name="st3"]');
    this.matchDropdown = page.locator('select[name="match"], select[name="o1"]');
    this.addQueryTypeBtn = page.locator('a[title="Add more"]');
    this.resetAllButton = page.locator('button[type="reset"]');
    
    // Publication Year Fields
    this.fromYearInput = page.locator('input[name*="from"], input[placeholder*="From Year"]').first();
    this.toYearInput = page.locator('input[name*="to"], input[placeholder*="To Year"]').first();
    
    this.showingCountIndicator = page.locator('.showing-count').filter({ hasText: 'Showing' });
    this.refreshButton = page.getByRole('button', { name: 'Refresh' });
    this.getMoreButton = page.getByRole('button', { name: 'Get More' });
    this.pollingHourglass = page.locator('svg.hourglass');
    this.resultPageTabs = page.locator('.result-page-tabs, .custom-tabs-container, .tabs-wrapper');

    // Locators for Selected Resources component
    // We use .nav-item filter to ensure we get the actual tabs, not dropdown options
    this.defaultTab = page.locator('.nav-item').filter({ hasText: /Default/i }).locator('a, input').first();
    this.subscribedTab = page.locator('.nav-item').filter({ hasText: /Subscribed/i }).locator('a, input').first();
    this.openTab = page.locator('.nav-item').filter({ hasText: /Open/i }).locator('a, input').first();
    this.allTab = page.locator('.nav-item').filter({ hasText: /All/i }).locator('a, input').first();
    this.historyTab = page.locator('.nav-item').filter({ hasText: /History/i }).locator('a, input').first();
    
    // Action buttons inside the resource box
    this.clearAllButton = page.getByRole('button', { name: 'Clear all', exact: false });
    this.selectAllButton = page.getByRole('button', { name: 'Select all', exact: false });
    this.defaultButton = page.getByRole('button', { name: 'Default', exact: true });
    
    // Search input for resources
    this.sourceSearchInput = page.getByPlaceholder('Search within');
    
    // The list of resources (checkbox containers)
    // Only search within the active tab to prevent counting hidden resources from other tabs
    this.allResourcesList = page.locator('.tab-pane.active .asw-connector-wrapper > div');
    this.historyResourcesList = page.locator('.tab-pane.active .asw-connector-wrapper > div.asw-checkbox-checked');
  }

  async verifySearchTipsVisibility() {
    await expect(this.searchTipsHeading).toBeVisible();
    await expect(this.searchTipsHeading).toContainText('Search Tips');
  }

  async enterPublicationYearRange(fromYear: number, toYear: number) {
    // If the elements are simple inputs, we fill them.
    await this.fromYearInput.fill(fromYear.toString());
    await this.toYearInput.fill(toYear.toString());
  }

  async performSearch(queryTypeLabel: string, queryTypeValue: string, query: string, resourceTab: string) {
    // Select Query Type (Title)
    const currentValue = await this.queryTypeDropdown.inputValue();
    if (currentValue !== queryTypeValue) {
      await this.queryTypeDropdown.selectOption({ label: queryTypeLabel });
    }

    // Fill Search Bar
    await this.fillText(this.searchBarInput, query, 'Research+ Search Bar');

    // Select Resources Tab
    const resourceTabLocator = this.page.locator(`a[data-rr-ui-event-key="${resourceTab}"]`);
    await this.clickElement(resourceTabLocator, `${resourceTab} Resources Tab`);

    // Click Search Button
    await this.clickElement(this.searchButton, 'Research+ Search Button');
    
    // Wait for the navigation to the results page
    await this.page.waitForURL(/search/i, { timeout: 30000 }).catch(() => {});
  }

  async verifyResultsPaintedAndNoTabs() {
    // 1. Verify the result count indicator is visible (Results are painted)
    // Increased timeout to 90s because federated search over multiple third-party sources can be slow.
    await expect(this.showingCountIndicator).toBeVisible({ timeout: 90000 });
    
    // 2. Verify that global search menus like eCatalog, Section, Multimedia (tabs) do NOT exist
    await expect(this.resultPageTabs).toBeHidden();
  }

  async clearAllResources() {
    await this.clickElement(this.allTab, 'All Tab');
    await this.clickElement(this.clearAllButton, 'Clear All Button');
  }

  async executeQueryTypeSearch(queryType: string, query: string, action: string, specificSource?: string) {
    await this.clickElement(this.allTab, 'All Tab');
    if (action === 'selectSpecific' && specificSource) {
      await this.clickElement(this.clearAllButton, 'Clear All Button');
      await this.selectSpecificResources([specificSource]);
    }
    await this.queryTypeDropdown1.selectOption({ label: queryType });
    await this.fillText(this.searchBarInput1, query, 'Research+ Search Input');
    await this.clickElement(this.searchButton, 'Research+ Search Button');
    await expect(this.showingCountIndicator).toBeVisible({ timeout: 90000 });
  }

  async getRenderedResultCount(): Promise<number> {
    const countText = await this.showingCountIndicator.innerText();
    const match = countText.match(/Showing\s+([\d,]+)/);
    return match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
  }

  async triggerRefreshAndGetNewCount(initialCount: number): Promise<number> {
    // If Refresh button is not visible yet, clicking Get More triggers the next federated batch
    const isRefreshVisible = await this.refreshButton.isVisible();
    if (!isRefreshVisible) {
      if (await this.getMoreButton.isVisible().catch(() => false)) {
        await this.clickElement(this.getMoreButton, 'Get More Button');
      }
    }
    
    await expect(this.refreshButton).toBeVisible({ timeout: 60000 });
    await this.clickElement(this.refreshButton, 'Refresh Button');
    
    await expect(async () => {
      const newCount = await this.getRenderedResultCount();
      expect(newCount).toBeGreaterThan(initialCount);
    }).toPass({ timeout: 20000 });

    return this.getRenderedResultCount();
  }

  async triggerGetMoreAndValidatePolling() {
    await expect(this.pollingHourglass).toBeHidden({ timeout: 60000 }).catch(() => {});
    if (await this.refreshButton.isVisible().catch(() => false)) {
      await this.clickElement(this.refreshButton, 'Refresh Button');
      await this.page.waitForTimeout(1000);
      await expect(this.pollingHourglass).toBeHidden({ timeout: 60000 }).catch(() => {});
    }
    await expect(this.getMoreButton).toBeVisible({ timeout: 30000 });
    await this.clickElement(this.getMoreButton, 'Get More Button');
    await expect(this.pollingHourglass).toBeVisible({ timeout: 10000 });
    await expect(this.pollingHourglass).toBeHidden({ timeout: 60000 });
  }

  async selectResourcesByCount(count: number, allowedSources?: string[]): Promise<string[]> {
    const selectedNames: string[] = [];
    await this.allResourcesList.first().waitFor({ state: 'visible' });
    const totalResources = await this.allResourcesList.count();
    
    const validIndices: number[] = [];
    for (let i = 0; i < totalResources; i++) {
        const text = await this.allResourcesList.nth(i).locator('.text-truncate').innerText();
        if (!allowedSources || allowedSources.includes(text.trim())) {
            validIndices.push(i);
        }
    }

    if (validIndices.length < count) {
      throw new Error(`Cannot select ${count} resources, only ${validIndices.length} available out of allowed list.`);
    }

    const selectedIndices = validIndices.slice(0, count);
    for (const index of selectedIndices) {
      const resourceLocator = this.allResourcesList.nth(index);
      const resourceName = await resourceLocator.locator('.text-truncate').innerText();
      await this.clickElement(resourceLocator, `Resource: ${resourceName}`);
      selectedNames.push(resourceName.trim());
    }

    return selectedNames.sort();
  }

  async selectRandomResources(count: number, allowedSources?: string[]): Promise<string[]> {
    return this.selectResourcesByCount(count, allowedSources);
  }

  async selectSpecificResources(sourceNames: string[]) {
    await this.allResourcesList.first().waitFor({ state: 'visible' });
    const count = await this.allResourcesList.count();
    
    for (const targetName of sourceNames) {
      let found = false;
      for (let i = 0; i < count; i++) {
        const text = await this.allResourcesList.nth(i).locator('.text-truncate').innerText();
        if (text.trim() === targetName) {
          await this.clickElement(this.allResourcesList.nth(i), `Resource: ${targetName}`);
          found = true;
          break;
        }
      }
      if (!found) {
        throw new Error(`Failed to find resource with name: ${targetName}`);
      }
    }
  }

  async getHistorySelectedResources(): Promise<string[]> {
    await this.clickElement(this.historyTab, 'History Tab');
    
    // Explicitly wait for the React DOM to update and render the selected checkboxes 
    // inside the newly active History tab pane.
    await this.historyResourcesList.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});

    // Ensure the history list has at least one item, or return empty if none exist
    const count = await this.historyResourcesList.count();
    const historyNames: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const name = await this.historyResourcesList.nth(i).locator('.text-truncate').innerText();
      historyNames.push(name);
    }
    return historyNames.sort();
  }

  // --- Advanced Search Helper Methods ---
  getRemoveBtn(): Locator {
    // The UI only renders the remove button on the LAST added row. 
    // It removes it from previous rows. Thus, there is only ever one active remove button.
    // It has a desktop and mobile version. We target the desktop version specifically.
    return this.page.locator('span.d-md-inline-block > a[title*="emove"]').first();
  }

  async verifyAllResourcesChecked() {
    const totalResources = await this.allResourcesList.count();
    for (let i = 0; i < totalResources; i++) {
        await expect(this.allResourcesList.nth(i)).toHaveClass(/asw-checkbox-checked/);
    }
  }

  async verifyResourcesPartiallyChecked() {
    const totalResources = await this.allResourcesList.count();
    let hasUnselected = false;
    for (let i = 0; i < totalResources; i++) {
        const classAttr = await this.allResourcesList.nth(i).getAttribute('class');
        if (!classAttr?.includes('asw-checkbox-checked')) {
            hasUnselected = true;
            break;
        }
    }
    expect(hasUnselected).toBeTruthy();
  }

  async verifyNoResourcesChecked() {
    const totalResources = await this.allResourcesList.count();
    for (let i = 0; i < totalResources; i++) {
        await expect(this.allResourcesList.nth(i)).not.toHaveClass(/asw-checkbox-checked/);
    }
  }
}
