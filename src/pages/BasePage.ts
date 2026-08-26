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

  /**
   * Dynamically checks if a form field is configured as mandatory (has '*' in label or required attribute/class).
   */
  async isFieldMandatory(fieldInput: Locator, fieldLabel?: Locator): Promise<boolean> {
    try {
      if (fieldLabel && await fieldLabel.isVisible().catch(() => false)) {
        const labelText = await fieldLabel.innerText().catch(() => '');
        if (labelText.includes('*')) return true;
      }
      return await fieldInput.evaluate((el: HTMLElement) => {
        const parent = el.closest('.required, .required-field, .form-floating, .mb-4, div');
        const hasReqClass = parent ? parent.classList.contains('required') || parent.classList.contains('required-field') : false;
        const hasReqAttr = el.hasAttribute('required');
        const label = parent ? parent.querySelector('label') : null;
        const labelHasStar = label ? (label.textContent || '').includes('*') : false;
        return hasReqClass || hasReqAttr || labelHasStar;
      }).catch(() => false);
    } catch {
      return false;
    }
  }
}
