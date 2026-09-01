import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ForgotPasswordPage extends BasePage {
  readonly emailInput: Locator;
  readonly resetButton: Locator;
  readonly backToSignInLink: Locator;
  readonly logo: Locator;
  readonly heading: Locator;
  readonly successMessage: Locator;
  readonly validationMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('input[type="email"]');
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.backToSignInLink = page.getByRole('link', { name: 'Sign in' });
    this.logo = page.getByRole('img', { name: 'Library logo' });
    this.heading = page.locator('#root'); // Will be checked with toContainText('Forgot password?')
    this.successMessage = page.locator('#root'); // Will be checked with toContainText('Your password has been reset...')

    // Can also add generic toast or validation locators if needed
    // Usually knimbus shows text in #root for success or standard validation errors near the field
    this.validationMessage = page.getByText(/This email id has not been registered within the organization!/i);
  }

  async navigateToForgotPassword(portalUrl: string) {
    await this.navigateTo(portalUrl);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
    await this.page.getByRole('link', { name: 'Forgot password?' }).click();
  }

  async requestPasswordReset(email: string) {
    await this.fillText(this.emailInput, email, 'Email Field');
    await this.clickElement(this.resetButton, 'Reset Button');
  }
}
