import { test, expect } from '@playwright/test';
import { ManageUsersPage } from '../../../src/pages/admin/user-management/ManageUsersPage';
import { AdminApiService } from '../../../src/api/AdminApiService';
import adminData from '../../test-data/admin-data.json';

test.describe('Manage Users - User Profile Overview - Change Password Tab', () => {

    const testEmail = `pwd_overview_${Date.now()}@yopmail.com`;
    const pwdData = adminData.userManagement.userProfileOverview.changePassword;

    test.beforeAll(async () => {
        const adminApi = new AdminApiService();
        await adminApi.initFromState('.auth/admin.json');
        await adminApi.addSingleUser("Password TestUser", testEmail);
        await adminApi.close();
    });

    test.beforeEach(async ({ page }) => {
        await page.goto(process.env.ADMIN_TEST_URL + '/librarian/v2/elibrarySetup/userManagement/manageUsers');
    });

    test('TC_ManageUsers_UserOverview_Password_Tab_Present - verifies password option is present in User Profile Overview', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        await manageUsersPage.searchForUser(testEmail);
        await manageUsersPage.clickUserDetailsOverview(testEmail);

        await expect(manageUsersPage.changePasswordTab).toBeVisible();

        await manageUsersPage.clickProfileCancel();
    });

    test('TC_ManageUsers_UserOverview_Password_TextBoxes_Present - verifies presence of New Password and Confirm Password text boxes', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        await manageUsersPage.searchForUser(testEmail);
        await manageUsersPage.clickUserDetailsOverview(testEmail);

        await manageUsersPage.clickChangePasswordTab();

        await expect(manageUsersPage.newPasswordInput).toBeVisible();
        await expect(manageUsersPage.confirmPasswordInput).toBeVisible();

        await manageUsersPage.clickChangePasswordClose();
    });

    test.describe('New Password Field Validations', () => {

        test('TC_ManageUsers_UserOverview_Password_NewPassword_Clear_RequiredMessage - clearing text box displays required message', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.clearNewPassword();

            await expect(manageUsersPage.newPasswordError).toHaveText(pwdData.messages.newPasswordRequired);

            await manageUsersPage.clickChangePasswordClose();
        });

        test('TC_ManageUsers_UserOverview_Password_NewPassword_MinLength_Message - entering 3 characters displays minimum characters required message', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.fillNewPassword(pwdData.shortPassword);

            await expect(manageUsersPage.newPasswordError).toHaveText(pwdData.messages.atLeast5Characters);

            await manageUsersPage.clickChangePasswordClose();
        });

        test('TC_ManageUsers_UserOverview_Password_NewPassword_MaxLength_Message - entering more than 30 characters displays maximum characters allowed message', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.fillNewPassword(pwdData.longPassword);

            await expect(manageUsersPage.newPasswordError).toHaveText(pwdData.messages.max30Characters);

            await manageUsersPage.clickChangePasswordClose();
        });

        test('TC_ManageUsers_UserOverview_Password_NewPassword_EyeIcon_TogglesPlainText - clicking eye icon toggles password visibility between masked and plain text', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.fillNewPassword(pwdData.validPassword);

            // Initially masked
            expect(await manageUsersPage.getNewPasswordInputType()).toBe('password');

            // Click eye icon to show plain text
            await manageUsersPage.clickNewPasswordEyeIcon();
            expect(await manageUsersPage.getNewPasswordInputType()).toBe('text');

            // Click eye icon again to mask
            await manageUsersPage.clickNewPasswordEyeIcon();
            expect(await manageUsersPage.getNewPasswordInputType()).toBe('password');

            await manageUsersPage.clickChangePasswordClose();
        });
    });

    test.describe('Confirm Password Field Validations', () => {

        test('TC_ManageUsers_UserOverview_Password_ConfirmPassword_Clear_RequiredMessage - clearing text box displays required message', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.clearConfirmPassword();

            await expect(manageUsersPage.confirmPasswordError).toHaveText(pwdData.messages.confirmPasswordRequired);

            await manageUsersPage.clickChangePasswordClose();
        });

        test('TC_ManageUsers_UserOverview_Password_ConfirmPassword_MinLength_Message - entering 3 characters displays minimum characters required message', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.fillConfirmPassword(pwdData.shortPassword);

            await expect(manageUsersPage.confirmPasswordError).toHaveText(pwdData.messages.atLeast5Characters);

            await manageUsersPage.clickChangePasswordClose();
        });

        test('TC_ManageUsers_UserOverview_Password_ConfirmPassword_MaxLength_Message - entering more than 30 characters displays maximum characters allowed message', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.fillConfirmPassword(pwdData.longPassword);

            await expect(manageUsersPage.confirmPasswordError).toHaveText(pwdData.messages.max30Characters);

            await manageUsersPage.clickChangePasswordClose();
        });

        test('TC_ManageUsers_UserOverview_Password_ConfirmPassword_EyeIcon_TogglesPlainText - clicking eye icon toggles password visibility between masked and plain text', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.fillConfirmPassword(pwdData.validPassword);

            // Initially masked
            expect(await manageUsersPage.getConfirmPasswordInputType()).toBe('password');

            // Click eye icon to show plain text
            await manageUsersPage.clickConfirmPasswordEyeIcon();
            expect(await manageUsersPage.getConfirmPasswordInputType()).toBe('text');

            // Click eye icon again to mask
            await manageUsersPage.clickConfirmPasswordEyeIcon();
            expect(await manageUsersPage.getConfirmPasswordInputType()).toBe('password');

            await manageUsersPage.clickChangePasswordClose();
        });
    });

    test.describe('Password Matching & Form Actions', () => {

        test('TC_ManageUsers_UserOverview_Password_Mismatch_Message - entering different passwords displays mismatch error', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.fillNewPassword(pwdData.validPassword);
            await manageUsersPage.fillConfirmPassword(pwdData.mismatchedPassword);

            await expect(manageUsersPage.passwordMismatchError).toHaveText(pwdData.messages.passwordsMismatch);

            await manageUsersPage.clickChangePasswordClose();
        });

        test('TC_ManageUsers_UserOverview_Password_SamePassword_Update_DisplaysToast - entering matching passwords and clicking update displays confirmation toast', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.fillNewPassword(pwdData.validPassword);
            await manageUsersPage.fillConfirmPassword(pwdData.validPassword);

            await manageUsersPage.clickChangePasswordUpdate();

            const toast = page.locator('.swal2-toast, .swal2-popup, .toast, .alert').filter({ hasText: pwdData.messages.updateSuccessToast });
            await expect(toast).toBeVisible({ timeout: 5000 });
        });

        test('TC_ManageUsers_UserOverview_Password_SamePassword_Close_ClosesModal - entering password and clicking close closes the modal without submitting', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.fillNewPassword(pwdData.validPassword);
            await manageUsersPage.fillConfirmPassword(pwdData.validPassword);

            await manageUsersPage.clickChangePasswordClose();
            await expect(manageUsersPage.userProfileModal).toBeHidden();
        });

        test('TC_ManageUsers_UserOverview_Password_EmptySubmit_TriggersBothRequiredMessages - clicking update on blank form triggers required messages on both fields', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.clickChangePasswordUpdate();

            await expect(manageUsersPage.newPasswordError).toHaveText(pwdData.messages.newPasswordRequired);
            await expect(manageUsersPage.confirmPasswordError).toHaveText(pwdData.messages.confirmPasswordRequired);

            await manageUsersPage.clickChangePasswordClose();
        });

        test('TC_ManageUsers_UserOverview_Password_Boundary_ExactMinLength_Accepted - entering exactly 5 characters is accepted without errors', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.fillNewPassword(pwdData.boundaryMinPassword);
            await manageUsersPage.fillConfirmPassword(pwdData.boundaryMinPassword);

            await expect(manageUsersPage.newPasswordError).toBeHidden();
            await expect(manageUsersPage.confirmPasswordError).toBeHidden();
            await expect(manageUsersPage.passwordMismatchError).toBeHidden();

            await manageUsersPage.clickChangePasswordClose();
        });

        test('TC_ManageUsers_UserOverview_Password_Boundary_ExactMaxLength_Accepted - entering exactly 30 characters is accepted without errors', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.fillNewPassword(pwdData.boundaryMaxPassword);
            await manageUsersPage.fillConfirmPassword(pwdData.boundaryMaxPassword);

            await expect(manageUsersPage.newPasswordError).toBeHidden();
            await expect(manageUsersPage.confirmPasswordError).toBeHidden();
            await expect(manageUsersPage.passwordMismatchError).toBeHidden();

            await manageUsersPage.clickChangePasswordClose();
        });

        test('TC_ManageUsers_UserOverview_Password_Mismatch_DynamicallyClearsOnCorrection - mismatch error clears dynamically when confirm password is corrected', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.fillNewPassword(pwdData.validPassword);
            await manageUsersPage.fillConfirmPassword(pwdData.mismatchedPassword);

            await expect(manageUsersPage.passwordMismatchError).toBeVisible();

            // Correct confirm password to match new password
            await manageUsersPage.fillConfirmPassword(pwdData.validPassword);
            await expect(manageUsersPage.passwordMismatchError).toBeHidden();

            await manageUsersPage.clickChangePasswordClose();
        });

        test('TC_ManageUsers_UserOverview_Password_ModalReopen_ResetsFormState - closing and reopening modal clears password fields and lingering errors', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.fillNewPassword(pwdData.shortPassword);
            await manageUsersPage.fillConfirmPassword(pwdData.mismatchedPassword);

            await expect(manageUsersPage.newPasswordError).toBeVisible();
            await expect(manageUsersPage.passwordMismatchError).toBeVisible();

            // Close without submitting
            await manageUsersPage.clickChangePasswordClose();
            await expect(manageUsersPage.userProfileModal).toBeHidden();

            // Reopen and switch to Change password tab
            await manageUsersPage.clickUserDetailsOverview(testEmail);
            await manageUsersPage.clickChangePasswordTab();

            // Verify clean state
            expect(await manageUsersPage.newPasswordInput.inputValue()).toBe('');
            expect(await manageUsersPage.confirmPasswordInput.inputValue()).toBe('');
            await expect(manageUsersPage.newPasswordError).toBeHidden();
            await expect(manageUsersPage.confirmPasswordError).toBeHidden();
            await expect(manageUsersPage.passwordMismatchError).toBeHidden();

            await manageUsersPage.clickChangePasswordClose();
        });

        test('TC_ManageUsers_UserOverview_Password_Close_Via_CrossIcon - clicking top cross icon dismisses the modal from Change Password tab', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await expect(manageUsersPage.userProfileModal).toBeVisible();

            await manageUsersPage.closeUserProfileModalViaCrossIcon();
            await expect(manageUsersPage.userProfileModal).toBeHidden();
        });
    });
});
