import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class HomePage extends BasePage {
  readonly homePageIdentifier: Locator;
  // Sections are dynamically located via getWidgetContainer()

  constructor(page: Page) {
    super(page);
    this.homePageIdentifier = page.getByText(process.env.LIBRARY_NAME as string);
  }

  getWidgetContainer(widgetTitle: string) {
    // Finds the main row block for the widget by first finding the title
    return this.page.locator('.row').filter({
      has: this.page.locator('.grp-widget-title', { hasText: widgetTitle })
    }).first();
  }

  async clickWidgetItem(widgetTitle: string, itemName: string) {
    const widget = this.getWidgetContainer(widgetTitle);
    await widget.scrollIntoViewIfNeeded();
    // Use an exact CSS attribute selector to avoid accessible name mismatches with inner counts
    const item = widget.locator(`a[title="${itemName}"]`).first();
    await item.waitFor({ state: 'visible', timeout: 5000 });
    await item.click();
  }

  async verifyWidgetsVisibility(widgetTitles: string[]) {
    for (const title of widgetTitles) {
      const widgetContainer = this.getWidgetContainer(title);
      await expect.soft(widgetContainer).toBeVisible();
    }
  }

  async verifyWidgetItemsClickable(widgetTitle: string, itemNames: string[]) {
    for (const itemName of itemNames) {
      // Navigate to home page explicitly before each click to reset state
      await this.page.goto(process.env.PORTAL_URL as string);
      await expect(this.homePageIdentifier).toBeVisible();
      
      const widget = this.getWidgetContainer(widgetTitle);
      await widget.scrollIntoViewIfNeeded();
      
      await this.clickWidgetItem(widgetTitle, itemName);
      await this.page.waitForLoadState('networkidle');
      await expect.soft(this.page).toHaveURL(/.*search|.*browse/i);
    }
  }
}
