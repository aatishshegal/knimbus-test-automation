import { Locator, Page } from '@playwright/test';
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
    return this.page.locator('div.var-padding.row').filter({
      has: this.page.locator('.grp-widget-title', { hasText: widgetTitle })
    });
  }

  async clickWidgetItem(widgetTitle: string, itemName: string) {
    const widget = this.getWidgetContainer(widgetTitle);
    await widget.getByTitle(itemName, { exact: true }).or(widget.getByText(itemName, { exact: true })).first().click();
  }
}
