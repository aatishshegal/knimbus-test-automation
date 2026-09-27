import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SourcePage extends BasePage {
  readonly sourceNavLink: Locator;

  constructor(page: Page) {
    super(page);
    this.sourceNavLink = page.getByRole('link', { name: /^source$/i });
  }

  async goto() {
    await this.sourceNavLink.click();
    await this.verifySourcePageLoaded();
  }

  async verifySourcePageLoaded() {
    // Wait for at least one of the main widgets to be visible as a proxy for page load
    await expect(this.page.getByText('Publishers — Name & Logo', { exact: true }).first()).toBeVisible({ timeout: 20000 });
  }

  getWidgetContainer(widgetName: string): Locator {
    // Finds the exact wrapper that contains the heading and the body (list, accordion, slider, tabs)
    const heading = this.page.getByText(widgetName, { exact: true }).first();
    return this.page.locator('div')
      .filter({ has: heading })
      .filter({ has: this.page.locator('ul, ol, .accordion, .react-multi-carousel-list, .nav-tabs, .btn-group, .grp-widget-tabs') })
      .last();
  }

  async verifyWidget(widgetName: string) {
    const heading = this.page.getByText(widgetName, { exact: true }).first();
    await expect(heading).toBeVisible();

    // Verify subtitle exists nearby (it's usually right next to the title in the DOM tree or inside the same container)
    const container = this.getWidgetContainer(widgetName);
    await expect(container).toBeVisible();
  }

  getWidgetCardLinks(widgetName: string): Locator {
    const container = this.getWidgetContainer(widgetName);
    // Almost all styles (grid, slider, tabs, toggle) use `li a` for the clickable card.
    return container.locator('li a');
  }

  async getWidgetCards(widgetName: string) {
    const links = this.getWidgetCardLinks(widgetName);
    await links.first().waitFor({ state: 'attached', timeout: 15000 }).catch(() => { });
    const count = await links.count();
    const arr: Locator[] = [];
    for (let i = 0; i < count; i++) {
      arr.push(links.nth(i));
    }
    return arr;
  }

  async searchWidget(widgetName: string, query: string) {
    const container = this.getWidgetContainer(widgetName);
    const searchInput = container.locator('input[type="text"], input[placeholder*="Search"], input[placeholder*="search"]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill(query);
  }

  async clickViewAll(widgetName: string) {
    const container = this.getWidgetContainer(widgetName);
    const viewAllLink = container.locator('a.viewAll, a[title="View All"], a:has-text("View All"), a:has-text("VIEW ALL")').first();
    await expect(viewAllLink).toBeVisible();
    await viewAllLink.click();
    
    // Wait for routing
    await this.page.waitForURL(/.*\/viewAll.*/, { timeout: 15000 });
    
    // Verify the page title is present
    const pageHeading = this.page.locator('.grp-widget-title', { hasText: new RegExp(`^${widgetName}$`, 'i') });
    await expect(pageHeading).toBeVisible({ timeout: 15000 });
  }

  async goBackFromViewAll() {
    await this.page.goBack();
    await this.verifySourcePageLoaded();
  }

  async switchTab(widgetName: string, tabName: string) {
    const container = this.getWidgetContainer(widgetName);
    const tabButton = container.locator('.btn-grp-widget-tabs, .nav-tabs a, [role="tab"]').filter({ hasText: tabName }).first();
    await expect(tabButton).toBeVisible();
    await tabButton.click();
    // Verify active state if it uses a class like tab-active or active
    await expect(tabButton).toHaveClass(/active/);
  }

  async toggleView(widgetName: string, mode: string) {
    // Toggles usually have accordion buttons to expand a specific group
    const container = this.getWidgetContainer(widgetName);
    // Use plain string for hasText to avoid regex capture group issues with parentheses like "(19)"
    const toggleButton = container.locator('.accordion-button').filter({ hasText: mode }).first();
    await expect(toggleButton).toBeVisible();
    
    const isExpanded = await toggleButton.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await toggleButton.click();
    }
    await expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
  }
}
