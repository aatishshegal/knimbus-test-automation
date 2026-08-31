import { test, expect } from '../../../src/fixtures';
import { PasswordPage } from '../../../src/pages/portal/PasswordPage';
import { TopNavigationBar } from '../../../src/pages/portal/TopNavigationBar';
import { AdminApiService } from '../../../src/api/AdminApiService';
import * as fs from 'fs';
import * as path from 'path';

// Load post-login profile data
const postLoginDataPath = path.resolve(__dirname, '../../../tests/test-data/postLoginProfileData.json');
const postLoginData = JSON.parse(fs.readFileSync(postLoginDataPath, 'utf-8'));
const passwordScenarios = postLoginData.passwordScenarios;

test.describe('Profile Password Suite', () => {
    let adminApi: AdminApiService;

    test.beforeAll(async () => {
        adminApi = new AdminApiService();
        await adminApi.login();
        // Standard Preconditions: Reset any blocking security settings
        await adminApi.updateSecuritySettings({ 
            mandatoryFields: { fields: [], isMandatory: false },
            editableFields: { fields: [], isEditable: true },
            allFieldsEditable: true
        });
    });

    test.afterAll(async () => {
        if (adminApi) await adminApi.close();
    });

    test.describe('Profile Password Navigation', () => {
        test.beforeEach(async ({ page }) => {
            const topNav = new TopNavigationBar(page);
            const url = process.env.PORTAL_URL as string;
            // Navigation workaround for profile redirection
            const profileUrl = url.replace(/\/home\/?$/, '/profile');
            
            await page.goto(profileUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Wait a moment for page to stabilize
            await page.waitForTimeout(1000);
            
            // Use top navigation to make sure we are properly routed if deep linking fails
            if (await topNav.profileDropdown.isVisible().catch(() => false)) {
                await topNav.openProfileMenu();
                await topNav.profileMenuProfileLink.click().catch(() => {});
            }
            
            // Navigate to Password Tab
            // Wait for it to be attached and visible
            const passwordTab = page.getByRole('tab', { name: /Password/i });
            await passwordTab.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
            await passwordTab.click({ force: true });
            
            const passwordPage = new PasswordPage(page);
            await expect(passwordPage.tabHeader).toBeVisible();
        });

        test.describe('UI Components', () => {
        test('TC_Password_UI_Visibility - Verify visibility of Password form controls', async ({ page }) => {
            const passwordPage = new PasswordPage(page);
            await expect(passwordPage.oldPasswordInput).toBeVisible();
            await expect(passwordPage.newPasswordInput).toBeVisible();
            await expect(passwordPage.confirmPasswordInput).toBeVisible();
            await expect(passwordPage.updatePasswordButton).toBeVisible();
            
            // Wait for eye icons to be visible before asserting attributes
            await expect(passwordPage.oldPasswordEyeIcon).toBeVisible();
            
            // Check default type is password
            await expect(passwordPage.oldPasswordInput).toHaveAttribute('type', 'password');
            await expect(passwordPage.newPasswordInput).toHaveAttribute('type', 'password');
            await expect(passwordPage.confirmPasswordInput).toHaveAttribute('type', 'password');
        });

        test('TC_Password_UI_EyeToggle - Verify password visibility toggle via eye icon', async ({ page }) => {
            const passwordPage = new PasswordPage(page);
            await passwordPage.fillPasswordForm({ oldPassword: 'test' });
            
            await expect(passwordPage.oldPasswordInput).toHaveAttribute('type', 'password');
            await passwordPage.oldPasswordEyeIcon.click();
            await expect(passwordPage.oldPasswordInput).toHaveAttribute('type', 'text');
        });

        test('TC_Password_UI_MaxLength - Verify maxlength constraints on input fields', async ({ page }) => {
            const passwordPage = new PasswordPage(page);
            await expect(passwordPage.oldPasswordInput).toHaveAttribute('maxlength', '31');
            await expect(passwordPage.newPasswordInput).toHaveAttribute('maxlength', '31');
            await expect(passwordPage.confirmPasswordInput).toHaveAttribute('maxlength', '31');
        });
    });

    test.describe('Negative Validation Scenarios', () => {
        for (const s of passwordScenarios.negativeScenarios) {
            test(`TC_Password_Validation_${s.scenario}`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: JSON.stringify(s) });
                const passwordPage = new PasswordPage(page);
                
                // Maxlength bypass logic for long password testing
                if (s.bypassLength) {
                    await passwordPage.oldPasswordInput.evaluate((el: HTMLInputElement) => el.removeAttribute('maxlength'));
                    await passwordPage.newPasswordInput.evaluate((el: HTMLInputElement) => el.removeAttribute('maxlength'));
                    await passwordPage.confirmPasswordInput.evaluate((el: HTMLInputElement) => el.removeAttribute('maxlength'));
                }
                
                // Inject actual correct current password for "Same as old password" scenario
                let testOldPassword = s.oldPassword;
                let testNewPassword = s.newPassword;
                let testConfirmPassword = s.confirmPassword;
                
                if (s.scenario.toLowerCase().includes('same as old password')) {
                    const defaultPassword = process.env.HOME_PAGE_USER_PASSWORD as string;
                    testOldPassword = defaultPassword;
                    testNewPassword = defaultPassword;
                    testConfirmPassword = defaultPassword;
                }
                
                await passwordPage.clearPasswordForm();
                await passwordPage.fillPasswordForm({
                    oldPassword: testOldPassword,
                    newPassword: testNewPassword,
                    confirmPassword: testConfirmPassword
                });
                
                await passwordPage.clickUpdatePassword();
                
                // Verify expected error
                await expect(page.getByText(s.expectedError, { exact: false }).first()).toBeVisible({ timeout: 5000 });
            });
        }
    });
    });

    test.describe('Positive Scenario', () => {
        // Need a unique session context here if we change the password, otherwise other tests fail
        // Since global setup uses default user, changing password breaks all subsequent tests!
        // We must generate a test user or restore the password at the end.
        
        test.use({ storageState: { cookies: [], origins: [] } });

        let testUserEmail: string;
        const defaultPassword = process.env.HOME_PAGE_USER_PASSWORD as string;
        let adminApiPositive: AdminApiService;
        
        test.beforeAll(async () => {
            adminApiPositive = new AdminApiService();
            await adminApiPositive.login();
            
            // Generate a fresh user just for the password change success test
            const uniqueId = Date.now().toString().slice(-6);
            testUserEmail = `pwd_user_${uniqueId}@yopmail.com`;
            await adminApiPositive.addSingleUser(`Pwd User ${uniqueId}`, testUserEmail);
            await adminApiPositive.changeUserPassword(testUserEmail, defaultPassword);
        });
        
        test.afterAll(async () => {
             if (adminApiPositive) await adminApiPositive.close();
        });

        test('TC_Password_Success - Verify successful password update', async ({ page, termsAndConditionsModal }) => {
            const { PortalLoginPage } = require('../../../src/pages/portal/PortalLoginPage');
            const loginPage = new PortalLoginPage(page);
            const topNav = new TopNavigationBar(page);
            const passwordPage = new PasswordPage(page);
            const newPassword = passwordScenarios.validInputs.newPassword2;
            
            // Login as the isolated test user
            await loginPage.login(testUserEmail, defaultPassword);
            await page.waitForTimeout(3000);
            
            // Handle Welcome modal if visible (give it a few seconds to appear for a fresh user)
            const welcomeContinueBtn = page.getByRole('button', { name: 'Continue', exact: true });
            await welcomeContinueBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
            if (await welcomeContinueBtn.isVisible().catch(() => false)) {
                await welcomeContinueBtn.click().catch(() => {});
            }
            
            // Handle T&C modal just in case. Wait for a few seconds for it to pop up.
            await page.waitForTimeout(3000);
            await termsAndConditionsModal.handleTermsAndConditionsIfVisible();
            
            // Navigate to Profile > Password Tab directly via URL to avoid flakiness
            const url = process.env.PORTAL_URL as string;
            const profileUrl = url.replace(/\/home\/?$/, '/profile');
            await page.goto(profileUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Wait a moment for page to stabilize
            await page.waitForTimeout(1000);
            
            // Use top navigation to make sure we are properly routed if deep linking fails
            if (await topNav.profileDropdown.isVisible().catch(() => false)) {
                await topNav.openProfileMenu();
                await topNav.profileMenuProfileLink.click({ force: true }).catch(() => {});
            }
            
            const passwordTab = page.getByRole('tab', { name: /Password/i });
            await passwordTab.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
            await passwordTab.click({ force: true });
            
            await expect(passwordPage.tabHeader).toBeVisible();
            
            // Fill and Submit
            await passwordPage.fillPasswordForm({
                oldPassword: defaultPassword,
                newPassword: newPassword,
                confirmPassword: newPassword
            });
            await passwordPage.clickUpdatePassword();
            
            // Verify Success Toast
            const successMsg = page.getByText(/successfully/i, { exact: false }).or(page.locator('.p-toast-message, .toast-message, snack-bar-container, .ngx-toastr'));
            await expect(successMsg.first()).toBeVisible({ timeout: 10000 });
            
            // Wait for toast to disappear
            await expect(successMsg.first()).toBeHidden({ timeout: 10000 }).catch(() => {});
            
            // Validate login works with new password
            await page.context().clearCookies();
            await loginPage.login(testUserEmail, newPassword);
            await expect(topNav.profileDropdown).toBeVisible({ timeout: 15000 });
        });
    });
});
