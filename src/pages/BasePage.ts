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
   * Resolves Google reCAPTCHA v2 on the page by waiting for the widget and triggering its verified callback.
   *
   * @param token Optional verification token to pass to the reCAPTCHA callback (default: automated token)
   */
  async handleGoogleRecaptcha(token = 'automated-test-captcha-token'): Promise<void> {
    console.log('Resolving Google reCAPTCHA...');
    // Wait for the reCAPTCHA widget iframe to be attached to the DOM
    await this.page.waitForSelector('.g-recaptcha iframe[title="reCAPTCHA"], iframe[src*="recaptcha"]', {
      state: 'attached',
      timeout: 15000
    });

    // Wait until grecaptcha clients and callback are initialized
    await this.page.waitForFunction(() => {
      const w = window as any;
      if (!w.___grecaptcha_cfg || !w.___grecaptcha_cfg.clients) return false;
      const findCb = (obj: any, depth = 0): boolean => {
        if (!obj || depth > 8) return false;
        for (const k of Object.keys(obj)) {
          if (k === 'callback' && typeof obj[k] === 'function') return true;
          if (typeof obj[k] === 'object' && obj[k] !== null && findCb(obj[k], depth + 1)) return true;
        }
        return false;
      };
      return findCb(w.___grecaptcha_cfg.clients);
    }, { timeout: 15000 });

    // Invoke the callback with the verification token
    const callbackInvoked = await this.page.evaluate((captchaToken) => {
      const w = window as any;
      const findAndCall = (obj: any, depth = 0): boolean => {
        if (!obj || depth > 8) return false;
        for (const k of Object.keys(obj)) {
          if (k === 'callback' && typeof obj[k] === 'function') {
            obj[k](captchaToken);
            return true;
          }
          if (typeof obj[k] === 'object' && obj[k] !== null && findAndCall(obj[k], depth + 1)) return true;
        }
        return false;
      };
      return findAndCall(w.___grecaptcha_cfg.clients);
    }, token);

    if (!callbackInvoked) {
      throw new Error('Failed to find or invoke reCAPTCHA callback in window.___grecaptcha_cfg');
    }
    console.log('Google reCAPTCHA resolved successfully.');
  }
}

