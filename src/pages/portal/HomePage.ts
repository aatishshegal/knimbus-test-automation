import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class HomePage extends BasePage {
  readonly homePageIdentifier: Locator;
  // Sections are dynamically located via getWidgetContainer()

  constructor(page: Page) {
    super(page);
    const libraryName = process.env.LIBRARY_NAME || 'Knimbus';
    this.homePageIdentifier = page.getByText(libraryName).first().or(page.locator('.logo, .header-logo, .main-content, body').first());
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
    const item = widget.getByTitle(itemName, { exact: true }).or(widget.getByText(itemName, { exact: true })).first();
    await item.waitFor({ state: 'visible', timeout: 5000 });
    await item.click();
  }
}
