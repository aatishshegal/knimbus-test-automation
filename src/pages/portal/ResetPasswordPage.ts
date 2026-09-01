import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ResetPasswordPage extends BasePage {
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly continueButton: Locator;
  readonly heading: Locator;
  readonly subHeading: Locator;
  
  // Validation Messages
  readonly passwordMismatchError: Locator;
  readonly passwordLengthError: Locator;
  readonly passwordMaxLengthError: Locator;

  constructor(page: Page) {
    super(page);
    this.newPasswordInput = page.locator('#newPassword');
    this.confirmPasswordInput = page.locator('#confirmPassword');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.heading = page.locator('.module-heading').filter({ hasText: 'Reset password' });
    this.subHeading = page.locator('.module-sub-heading').filter({ hasText: 'Enter new password here!' });
    
    // We will refine these once we see the exact validation text on UI if it changes, 
    // but these are typical errors based on previous patterns
    this.passwordMismatchError = page.getByText(/Passwords do not match|Confirm password must match/i);
    this.passwordLengthError = page.getByText('Atleast 5 characters required');
    this.passwordMaxLengthError = page.getByText('Maximum 30 characters allowed');
  }

  async setNewPassword(password: string, confirmPassword?: string, submit: boolean = true) {
    await this.fillText(this.newPasswordInput, password, 'New Password Field');
    if (confirmPassword !== undefined) {
      await this.fillText(this.confirmPasswordInput, confirmPassword, 'Confirm Password Field');
    }
    
    // Blur the input to trigger validation if we're not submitting
    if (!submit) {
      if (confirmPassword !== undefined) {
        await this.confirmPasswordInput.blur();
      } else {
        await this.newPasswordInput.blur();
      }
    }
    
    if (submit) {
      await this.clickElement(this.continueButton, 'Continue Button');
    }
  }
}
