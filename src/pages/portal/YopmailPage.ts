import { Page } from '@playwright/test';

export class YopmailPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async getLatestOtp(email: string): Promise<string> {
    console.log(`[Yopmail] Fetching OTP for ${email}...`);

    await this.page.goto('https://yopmail.com/');
    await this.page.locator('#login').fill(email.split('@')[0]);
    await this.page.locator('button[title="Check Inbox @yopmail.com"]').click();

    let match: RegExpMatchArray | null = null;
    let emailText = '';

    // Retry finding the OTP for up to 15 seconds
    for (let i = 0; i < 15; i++) {
      await this.page.waitForTimeout(3000);
      try {
        const emailFrame = this.page.frameLocator('iframe#ifmail');
        emailText = await emailFrame.locator('body').innerText();
        match = emailText.match(/\b\d{6}\b/);
        if (match) break;
      } catch (e) {
        // Frame might not be fully loaded yet
      }
      // Click refresh if needed
      await this.page.locator('#refresh').click().catch(() => { });
    }

    if (!match) {
      throw new Error(`Could not find a 6-digit OTP in the Yopmail email body. Email body: ${emailText}`);
    }

    console.log(`[Yopmail] Successfully extracted OTP: ${match[0]}`);
    return match[0];
  }

  async getResetLink(email: string): Promise<string> {
    console.log(`[Yopmail] Fetching Reset Link for ${email}...`);

    await this.page.goto('https://yopmail.com/');
    await this.page.locator('#login').fill(email.split('@')[0]);
    await this.page.locator('button[title="Check Inbox @yopmail.com"]').click();

    let match: RegExpMatchArray | null = null;
    let emailText = '';

    // Retry finding the link for up to 15 seconds
    for (let i = 0; i < 15; i++) {
      await this.page.waitForTimeout(3000);
      try {
        const emailFrame = this.page.frameLocator('iframe#ifmail');
        emailText = await emailFrame.locator('body').innerText();
        match = emailText.match(/https:\/\/[^\s\/]+\/portal\/v2\/default\/verifyToken\?token=[a-z0-9-]+/);
        if (match) break;
      } catch (e) {
        // Frame might not be fully loaded yet
      }
      // Click refresh if needed
      await this.page.locator('#refresh').click().catch(() => { });
    }

    if (!match) {
      throw new Error(`Could not find a reset link in the Yopmail email body. Email body: ${emailText}`);
    }

    console.log(`[Yopmail] Successfully extracted Reset Link: ${match[0]}`);
    return match[0];
  }

  /**
   * Waits for and retrieves the title/subject of the latest email for a given user on Yopmail.
   * Retries and refreshes the inbox if the email hasn't arrived yet.
   *
   * @param email The Yopmail email address (e.g. prant3@yopmail.com)
   * @param expectedPattern Optional substring or RegExp to match the expected email title
   * @param timeoutSeconds Max wait time in seconds (default 30)
   * @returns The title/subject string of the matched or latest email
   */
  async getLatestEmailTitle(email: string, expectedPattern?: string | RegExp, timeoutSeconds = 30): Promise<string> {
    console.log(`[Yopmail] Fetching latest email title for ${email}...`);

    await this.page.goto('https://yopmail.com/');
    await this.page.locator('#login').fill(email.split('@')[0]);
    await this.page.locator('button[title="Check Inbox @yopmail.com"]').click();

    const maxRetries = Math.ceil(timeoutSeconds / 3);
    for (let i = 0; i < maxRetries; i++) {
      await this.page.waitForTimeout(3000);
      try {
        const inboxFrame = this.page.frameLocator('iframe#ifinbox');
        const firstMail = inboxFrame.locator('.m').first();
        if (await firstMail.isVisible()) {
          const subject = (await firstMail.locator('.lms').innerText()).trim();
          if (!expectedPattern) {
            console.log(`[Yopmail] Latest email title: "${subject}"`);
            return subject;
          }
          const matches = typeof expectedPattern === 'string'
            ? subject.toLowerCase().includes(expectedPattern.toLowerCase())
            : expectedPattern.test(subject);
          if (matches) {
            console.log(`[Yopmail] Found matching email title: "${subject}"`);
            return subject;
          }
        }
      } catch (e) {
        // Frame might be refreshing or loading
      }
      // Click refresh inbox button
      await this.page.locator('#refresh').click().catch(() => {});
    }

    throw new Error(`[Yopmail] Expected email matching pattern "${expectedPattern}" was not found in ${email} inbox within ${timeoutSeconds}s.`);
  }
}

