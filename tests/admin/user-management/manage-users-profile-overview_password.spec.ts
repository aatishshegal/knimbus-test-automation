import { test, expect } from '@playwright/test';
import { AdminDashboardLoginPage } from '../../../src/pages/admin/AdminDashboardLoginPage';
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
        const dashboard = new AdminDashboardLoginPage(page);
        await page.goto(process.env.ADMIN_TEST_URL + '/librarian/v2/elibrarySetup/dashboard');
        await expect(page).toHaveTitle(/.*Codec Network.*/i, { timeout: 15000 });
        await dashboard.sidebar.navigateToManageUsers();
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.manageUsers));
    });

    test('User Profile Password - Tab Navigation - Verifies Password tab is present and selectable', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        await manageUsersPage.searchForUser(testEmail);
        await manageUsersPage.clickUserDetailsOverview(testEmail);

        await expect(manageUsersPage.changePasswordTab).toBeVisible();

        await manageUsersPage.clickProfileCancel();
    });

    test('User Profile Password - Form Fields - Displays New Password and Confirm Password inputs with eye icons', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        await manageUsersPage.searchForUser(testEmail);
        await manageUsersPage.clickUserDetailsOverview(testEmail);

        await manageUsersPage.clickChangePasswordTab();

        await expect(manageUsersPage.newPasswordInput).toBeVisible();
        await expect(manageUsersPage.confirmPasswordInput).toBeVisible();

        await manageUsersPage.clickChangePasswordClose();
    });

    test.describe('New Password Field Validations', () => {

        test('User Profile Password - New Password Field - Clearing input displays required error message', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.clearNewPassword();

            await expect(manageUsersPage.newPasswordError).toHaveText(pwdData.messages.newPasswordRequired);

            await manageUsersPage.clickChangePasswordClose();
        });

        test('User Profile Password - New Password Field - Entering fewer than 5 characters displays min length error', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.fillNewPassword(pwdData.shortPassword);

            await expect(manageUsersPage.newPasswordError).toHaveText(pwdData.messages.atLeast5Characters);

            await manageUsersPage.clickChangePasswordClose();
        });

        test('User Profile Password - New Password Field - Entering more than 30 characters displays max length error', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.fillNewPassword(pwdData.longPassword);

            await expect(manageUsersPage.newPasswordError).toHaveText(pwdData.messages.max30Characters);

            await manageUsersPage.clickChangePasswordClose();
        });

        test('User Profile Password - New Password Field - Eye icon toggles between masked and plain text', async ({ page }) => {
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

        test('User Profile Password - Confirm Password Field - Clearing input displays required error message', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.clearConfirmPassword();

            await expect(manageUsersPage.confirmPasswordError).toHaveText(pwdData.messages.confirmPasswordRequired);

            await manageUsersPage.clickChangePasswordClose();
        });

        test('User Profile Password - Confirm Password Field - Entering fewer than 5 characters displays min length error', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.fillConfirmPassword(pwdData.shortPassword);

            await expect(manageUsersPage.confirmPasswordError).toHaveText(pwdData.messages.atLeast5Characters);

            await manageUsersPage.clickChangePasswordClose();
        });

        test('User Profile Password - Confirm Password Field - Entering more than 30 characters displays max length error', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.fillConfirmPassword(pwdData.longPassword);

            await expect(manageUsersPage.confirmPasswordError).toHaveText(pwdData.messages.max30Characters);

            await manageUsersPage.clickChangePasswordClose();
        });

        test('User Profile Password - Confirm Password Field - Eye icon toggles between masked and plain text', async ({ page }) => {
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

        test('User Profile Password - Password Matching - entering different passwords displays mismatch error', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.fillNewPassword(pwdData.validPassword);
            await manageUsersPage.fillConfirmPassword(pwdData.mismatchedPassword);

            await expect(manageUsersPage.passwordMismatchError).toHaveText(pwdData.messages.passwordsMismatch);

            await manageUsersPage.clickChangePasswordClose();
        });

        test('User Profile Password - Form Actions - entering matching passwords and clicking update displays confirmation toast', async ({ page }) => {
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

        test('User Profile Password - Form Actions - entering password and clicking close closes the modal without submitting', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.fillNewPassword(pwdData.validPassword);
            await manageUsersPage.fillConfirmPassword(pwdData.validPassword);

            await manageUsersPage.clickChangePasswordClose();
            await expect(manageUsersPage.userProfileModal).toBeHidden();
        });

        test('User Profile Password - Form Submission - clicking update on blank form triggers required messages on both fields', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(testEmail);
            await manageUsersPage.clickUserDetailsOverview(testEmail);

            await manageUsersPage.clickChangePasswordTab();
            await manageUsersPage.clickChangePasswordUpdate();

            await expect(manageUsersPage.newPasswordError).toHaveText(pwdData.messages.newPasswordRequired);
            await expect(manageUsersPage.confirmPasswordError).toHaveText(pwdData.messages.confirmPasswordRequired);

            await manageUsersPage.clickChangePasswordClose();
        });

        test('User Profile Password - Boundary Validation - entering exactly 5 characters is accepted without errors', async ({ page }) => {
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

        test('User Profile Password - Boundary Validation - entering exactly 30 characters is accepted without errors', async ({ page }) => {
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

        test('User Profile Password - Password Matching - mismatch error clears dynamically when confirm password is corrected', async ({ page }) => {
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

        test('User Profile Password - Modal State - closing and reopening modal clears password fields and lingering errors', async ({ page }) => {
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

        test('User Profile Password - Modal State - clicking top cross icon dismisses the modal from Change Password tab', async ({ page }) => {
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
