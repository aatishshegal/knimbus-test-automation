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
}
