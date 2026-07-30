import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class OtpPage extends BasePage {
  readonly otpPageIdentifier: Locator;
  readonly otpInput: Locator;
  readonly verifyOtpButton: Locator;
  readonly invalidOtpFormatError: Locator;
  readonly invalidOtpError: Locator;
  readonly otpExhaustedError: Locator;
  readonly resendOtpButton: Locator;
  readonly resendOtpLimitText: Locator;

  constructor(page: Page) {
    super(page);
    this.otpPageIdentifier = page.getByText('We\'ve sent OTP to your');
    this.otpInput = page.locator('input:visible:not([disabled])').first();
    this.verifyOtpButton = page.getByRole('button', { name: /Verify OTP/i });
    this.invalidOtpFormatError = page.getByText('OTP must be 6 digits', { exact: true });
    this.invalidOtpError = page.getByText(/You have entered a wrong OTP\. Please try again/i);
    this.otpExhaustedError = page.getByText(/You have entered a wrong OTP for \d+ times now\. Please reload this window to start afresh\./i);
    this.resendOtpButton = page.getByText(/Resend OTP|Retry/i).filter({ hasNotText: /in 00:/i });
    this.resendOtpLimitText = page.getByText('Resend OTP (3/3)', { exact: true });
  }

  async fillOtp(otpCode: string) {
    await this.fillText(this.otpInput, otpCode, 'OTP Field');
  }

  async submitOtp(otpCode: string) {
    await this.fillOtp(otpCode);
    await this.clickElement(this.verifyOtpButton, 'Verify OTP Button');
  }

  async getOtpRemainingAttempts(): Promise<number> {
    if (await this.invalidOtpError.isVisible()) {
       const errorText = await this.invalidOtpError.innerText();
       const match = errorText.match(/remaining\s*(\d+)/i);
       if (match && match[1]) {
           return parseInt(match[1], 10);
       }
    }
    return -1;
  }
}
