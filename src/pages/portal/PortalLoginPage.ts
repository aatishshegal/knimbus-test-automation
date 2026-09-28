import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class PortalLoginPage extends BasePage {
  readonly signInPopupTrigger: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly signUpLink: Locator;

  readonly continueWithEmailAndPasswordBtn: Locator;

  // Negative Scenario Identifiers
  readonly invalidEmailFormatError: Locator;
  readonly unregisteredUserError: Locator;
  readonly invalidPasswordError: Locator;
  readonly accountLockedError: Locator;

  constructor(page: Page) {
    super(page);
    this.signInPopupTrigger = page.getByRole('button', { name: 'Sign in' });
    this.continueWithEmailAndPasswordBtn = page.getByRole('button', { name: /Continue with Email & Password/i })
      .or(page.getByText('Continue with Email & Password', { exact: false }));
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.getByRole('button', { name: /Continue|Next/i });
    this.signUpLink = page.getByRole('link', { name: 'Sign up' });

    // Negative Scenario Locators
    this.invalidEmailFormatError = page.getByText('Invalid email address');
    this.unregisteredUserError = page.getByText('Incorrect email address or password.', { exact: true })
      .or(page.getByText('User does not exist with the provided login details.', { exact: true }));
    this.invalidPasswordError = page.getByText(/Incorrect email address or password\.\s*Your remaining attempt is \d+/i)
      .or(page.getByText('Invalid login credential', { exact: true }));
    this.accountLockedError = page.getByText(/Your account will remain locked for (the )?next \d+m due to multiple incorrect login attempts/i);
  }

  async isSubmitButtonDisabled(): Promise<boolean> {
    return await this.submitButton.isDisabled();
  }

  async login(email: string, password?: string) {
    // 0. Check if user is already logged in (profile dropdown or notification bell visible)
    const isProfileVisible = await this.page.locator('.profile-dropdwn-toggle, .notification-badge').first().isVisible({ timeout: 2000 }).catch(() => false);
    if (isProfileVisible) {
      console.log('[PortalLoginPage] User is already logged in. Skipping UI login.');
      return;
    }

    // 1. Check if Sign In button is visible on current page
    let isSignInVisible = await this.signInPopupTrigger.isVisible({ timeout: 3000 }).catch(() => false);

    if (!isSignInVisible) {
      const isEmailInputVisible = await this.emailInput.isVisible({ timeout: 1000 }).catch(() => false);
      const isContinueWithEmailVisible = await this.continueWithEmailAndPasswordBtn.isVisible({ timeout: 1000 }).catch(() => false);
      
      if (!isEmailInputVisible && !isContinueWithEmailVisible) {
        // User is already logged in
        return;
      }
    } else {
      await this.clickElement(this.signInPopupTrigger, 'Sign In Popup Trigger');
    }

    // 2. Handle 'Continue with Email & Password' if OIDC selection is present
    if (await this.continueWithEmailAndPasswordBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.clickElement(this.continueWithEmailAndPasswordBtn, 'Continue with Email & Password');
    }

    // 3. Fill credentials & submit
    await this.fillText(this.emailInput, email, 'Email Field');
    if (password) {
      await this.fillText(this.passwordInput, password, 'Password Field');
    }
    await this.clickElement(this.submitButton, 'Continue Button');
  }
}
