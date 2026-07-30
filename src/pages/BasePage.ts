import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo(path: string) {
    console.log(`Navigating to: ${path}`);
    try {
      await this.page.goto(path);
    } catch (error) {
      throw new Error(`Failed to navigate to ${path}. Error: ${(error as Error).message}`);
    }
  }

  async clickElement(locator: Locator, elementName: string) {
    console.log(`Clicking on: ${elementName}`);
    try {
      await locator.click();
    } catch (error) {
      throw new Error(`Failed to click on [${elementName}]. Error: ${(error as Error).message}`);
    }
  }

  async fillText(locator: Locator, text: string, elementName: string) {
    console.log(`Filling text into: ${elementName}`);
    try {
      await locator.fill(text);
    } catch (error) {
      throw new Error(`Failed to fill text in [${elementName}]. Error: ${(error as Error).message}`);
    }
  }

  async waitForURLToContain(urlPart: string) {
    console.log(`Waiting for URL to contain: ${urlPart}`);
    try {
      await this.page.waitForURL(`**/${urlPart}**`);
    } catch (error) {
      throw new Error(`Failed waiting for URL to contain [${urlPart}]. Error: ${(error as Error).message}`);
    }
  }
}
