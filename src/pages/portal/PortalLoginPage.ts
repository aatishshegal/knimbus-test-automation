import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class PortalLoginPage extends BasePage {
  readonly signInPopupTrigger: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly signUpLink: Locator;

  // Negative Scenario Identifiers
  readonly invalidEmailFormatError: Locator;
  readonly unregisteredUserError: Locator;
  readonly invalidPasswordError: Locator;
  readonly accountLockedError: Locator;

  constructor(page: Page) {
    super(page);
    this.signInPopupTrigger = page.getByRole('button', { name: 'Sign in' });
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.getByRole('button', { name: /Continue|Next/i });
    this.signUpLink = page.getByRole('link', { name: 'Sign up' });

    // Negative Scenario Locators
    this.invalidEmailFormatError = page.getByText('Invalid email address');
    this.unregisteredUserError = page.getByText(/Incorrect email address or password\.|User does not exist with the provided login details\./);
    this.invalidPasswordError = page.getByText(/Incorrect email address or password\.\s*Your remaining attempt is \d+|Invalid login credential/);
    this.accountLockedError = page.getByText(/Your account will remain locked for (the )?next \d+m due to multiple incorrect login attempts/i);
  }

  async isSubmitButtonDisabled(): Promise<boolean> {
    return await this.submitButton.isDisabled();
  }

  async verifyInvalidPasswordFeedback() {
    const feedback = this.page.getByText(/Incorrect email address or password|Invalid login credential|Your account will remain locked/i);
    await feedback.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  async login(email: string, password?: string) {
    const url = process.env.PORTAL_URL;
    if (!url) throw new Error('PORTAL_URL is not defined in .env');

    await this.navigateTo(url);
    await this.clickElement(this.signInPopupTrigger, 'Sign In Popup Trigger');
    
    await this.fillText(this.emailInput, email, 'Email Field');
    if (password) {
      await this.fillText(this.passwordInput, password, 'Password Field');
    }
    await this.clickElement(this.submitButton, 'Continue Button');
    await this.submitButton.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  }
}
