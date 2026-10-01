import { Page, Locator } from '@playwright/test';

export class PasswordPage {
    readonly page: Page;
    readonly tabHeader: Locator;
    readonly oldPasswordInput: Locator;
    readonly newPasswordInput: Locator;
    readonly confirmPasswordInput: Locator;
    readonly updatePasswordButton: Locator;
    readonly oldPasswordEyeIcon: Locator;
    readonly newPasswordEyeIcon: Locator;
    readonly confirmPasswordEyeIcon: Locator;
    readonly successToast: Locator;
    readonly oldPasswordError: Locator;
    readonly newPasswordError: Locator;
    readonly confirmPasswordError: Locator;

    constructor(page: Page) {
        this.page = page;
        
        // Tab Header
        this.tabHeader = page.getByRole('heading', { name: 'Change Password' });
        
        // Text Inputs (The fields have empty placeholders due to Material floating labels, using id/name)
        this.oldPasswordInput = page.locator('#oldPassword, input[name="oldPassword"], input[formcontrolname="oldPassword"]').first();
        this.newPasswordInput = page.locator('#newPassword, input[name="newPassword"], input[formcontrolname="newPassword"]').first();
        this.confirmPasswordInput = page.locator('#confirmPassword, input[name="confirmPassword"], input[formcontrolname="confirmPassword"]').first();
        
        // Buttons and Icons
        this.updatePasswordButton = page.getByRole('button', { name: /Update Password/i });
        
        // Assuming the eye icons are adjacent to the inputs or inside the same input group
        this.oldPasswordEyeIcon = page.locator('i.fa-eye, i.fa-eye-slash, .eye-icon, img[src*="eye"]').nth(0);
        this.newPasswordEyeIcon = page.locator('i.fa-eye, i.fa-eye-slash, .eye-icon, img[src*="eye"]').nth(1);
        this.confirmPasswordEyeIcon = page.locator('i.fa-eye, i.fa-eye-slash, .eye-icon, img[src*="eye"]').nth(2);
        this.successToast = page.getByRole('heading', { name: /Updated successfully/i });

        this.oldPasswordError = page.locator('#oldPassword ~ .invalid-feedback, div:has(#oldPassword) .error-message, div:has(#oldPassword) .profile-form-errortxt').first();
        this.newPasswordError = page.locator('#newPassword ~ .invalid-feedback, div:has(#newPassword) .error-message, div:has(#newPassword) .profile-form-errortxt').first();
        this.confirmPasswordError = page.locator('#confirmPassword ~ .invalid-feedback, div:has(#confirmPassword) .error-message, div:has(#confirmPassword) .profile-form-errortxt').first();
    }

    /**
     * Clears all fields in the password form.
     */
    async clearPasswordForm() {
        await this.oldPasswordInput.clear();
        await this.newPasswordInput.clear();
        await this.confirmPasswordInput.clear();
    }

    /**
     * Fills the password form with the provided data.
     */
    async fillPasswordForm(data: { oldPassword?: string, newPassword?: string, confirmPassword?: string }) {
        if (data.oldPassword !== undefined) {
            await this.oldPasswordInput.fill(data.oldPassword);
        }
        if (data.newPassword !== undefined) {
            await this.newPasswordInput.fill(data.newPassword);
        }
        if (data.confirmPassword !== undefined) {
            await this.confirmPasswordInput.fill(data.confirmPassword);
        }
    }

    /**
     * Clicks the update password button.
     */
    async clickUpdatePassword() {
        await this.updatePasswordButton.click();
    }

    /**
     * Helper to get common error messages based on text.
     */
    getErrorMessage(text: string): Locator {
        // The application might use toast messages or inline validation errors
        return this.page.getByText(text, { exact: false }).first();
    }

    /**
     * Verifies that the success toast/alert is displayed after updating password.
     */
    async verifyUpdateSuccess() {
        await this.successToast.first().waitFor({ state: 'visible', timeout: 10000 });
    }
}
