import { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';

export class PasswordPage extends BasePage {
  readonly tabHeader: Locator;
  readonly passwordForm: Locator;

  // Input Locators
  readonly oldPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;

  // Eye Icon Visibility Toggles
  readonly oldPasswordEyeIcon: Locator;
  readonly newPasswordEyeIcon: Locator;
  readonly confirmPasswordEyeIcon: Locator;

  // Action Button
  readonly updatePasswordButton: Locator;

  // Error Message Locators
  readonly oldPasswordError: Locator;
  readonly newPasswordError: Locator;
  readonly confirmPasswordError: Locator;

  constructor(page: Page) {
    super(page);
    this.tabHeader = page.locator('h1, h2, h3, h5, .profile-form-content-heading').filter({ hasText: /change password/i }).first();
    this.passwordForm = page.locator('form').filter({ hasText: /change password/i }).first();

    // Field Inputs by ID / Name
    this.oldPasswordInput = page.locator('#oldPassword, input[name="oldPassword"]');
    this.newPasswordInput = page.locator('#newPassword, input[name="newPassword"]');
    this.confirmPasswordInput = page.locator('#confirmPassword, input[name="confirmPassword"]');

    // Eye Icons
    this.oldPasswordEyeIcon = this.oldPasswordInput.locator('xpath=ancestor::div[contains(@class, "input-group")]').locator('.password-eye-icon-wrapper').first();
    this.newPasswordEyeIcon = this.newPasswordInput.locator('xpath=ancestor::div[contains(@class, "input-group")]').locator('.password-eye-icon-wrapper').first();
    this.confirmPasswordEyeIcon = this.confirmPasswordInput.locator('xpath=ancestor::div[contains(@class, "input-group")]').locator('.password-eye-icon-wrapper').first();

    // Update Password Button
    this.updatePasswordButton = page.getByRole('button', { name: 'Update password' }).or(page.locator('button').filter({ hasText: /update password/i })).first();

    // Field Specific Error Messages
    this.oldPasswordError = this.oldPasswordInput.locator('xpath=ancestor::div[contains(@class, "mb-4")]').locator('.profile-form-errortxt, .text-danger, .invalid-feedback');
    this.newPasswordError = this.newPasswordInput.locator('xpath=ancestor::div[contains(@class, "mb-4")]').locator('.profile-form-errortxt, .text-danger, .invalid-feedback');
    this.confirmPasswordError = this.confirmPasswordInput.locator('xpath=ancestor::div[contains(@class, "mb-4")]').locator('.profile-form-errortxt, .text-danger, .invalid-feedback');
  }

  /**
   * Fills the password change form with provided input data.
   */
  async fillPasswordForm(data: {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }) {
    if (data.oldPassword !== undefined) {
      await this.fillText(this.oldPasswordInput, data.oldPassword, 'Current Password Input');
    }
    if (data.newPassword !== undefined) {
      await this.fillText(this.newPasswordInput, data.newPassword, 'New Password Input');
    }
    if (data.confirmPassword !== undefined) {
      await this.fillText(this.confirmPasswordInput, data.confirmPassword, 'Confirm Password Input');
    }
  }

  /**
   * Clears all password input fields in the form.
   */
  async clearPasswordForm() {
    await this.oldPasswordInput.fill('');
    await this.newPasswordInput.fill('');
    await this.confirmPasswordInput.fill('');
  }

  /**
   * Clicks the Update password submit button.
   */
  async clickUpdatePassword() {
    await this.clickElement(this.updatePasswordButton, 'Update Password Button');
  }

  /**
   * Returns validation error locator matching expected text.
   */
  getErrorMessage(expectedText?: string): Locator {
    if (expectedText) {
      return this.page.locator('.profile-form-errortxt, .text-danger, .invalid-feedback, .error-message').filter({ hasText: expectedText }).first();
    }
    return this.page.locator('.profile-form-errortxt, .text-danger, .invalid-feedback, .error-message').first();
  }
}

