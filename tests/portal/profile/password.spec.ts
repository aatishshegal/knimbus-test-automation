import { test, expect } from '../../../src/fixtures';
import { PasswordPage } from '../../../src/pages/portal/PasswordPage';
import { TopNavigationBar } from '../../../src/pages/portal/TopNavigationBar';
import { PortalLoginPage } from '../../../src/pages/portal/PortalLoginPage';
import { WelcomePage } from '../../../src/pages/portal/WelcomePage';
import { AdminApiService } from '../../../src/api/AdminApiService';
import * as fs from 'fs';
import * as path from 'path';

// Load post-login profile data
const postLoginDataPath = path.resolve(__dirname, '../../../tests/test-data/portal/profile-data.json');
const postLoginData = JSON.parse(fs.readFileSync(postLoginDataPath, 'utf-8'));
const passwordScenarios = postLoginData['password.spec.ts'];

test.describe('Profile Details - Password Management', () => {
    let adminApi: AdminApiService;

    test.beforeAll(async () => {
        adminApi = new AdminApiService();
        await adminApi.login();
        await adminApi.updateSecuritySettings({ 
            mandatoryFields: { fields: [], isMandatory: false },
            editableFields: { fields: [], isEditable: true },
            allFieldsEditable: true
        });
    });

    test.afterAll(async () => {
        if (adminApi) {
            await adminApi.login();
            await adminApi.updateSecuritySettings({ 
                mandatoryFields: { fields: [], isMandatory: false },
                editableFields: { fields: [], isEditable: true },
                allFieldsEditable: true
            });
            await adminApi.close();
        }
    });

    test.describe('Profile Password - UI Controls', () => {
        test.beforeEach(async ({ page, topNavigationBar, profilePage }) => {
            await page.goto(process.env.PORTAL_URL as string);
            await expect(topNavigationBar.profileDropdown).toBeVisible({ timeout: 15000 });
            
            await topNavigationBar.openProfileMenu();
            await topNavigationBar.profileMenuProfileLink.click();
            await expect(profilePage.profileHeader).toBeVisible({ timeout: 15000 });
            
            const passwordTab = page.getByRole('tab', { name: /Password/i });
            await passwordTab.click({ force: true });
        });

        test('Profile Password - Input fields, toggle eye icons, and Update button are visible', async ({ page }) => {
            const passwordPage = new PasswordPage(page);
            await expect(passwordPage.oldPasswordInput).toBeVisible();
            await expect(passwordPage.newPasswordInput).toBeVisible();
            await expect(passwordPage.confirmPasswordInput).toBeVisible();
            await expect(passwordPage.updatePasswordButton).toBeVisible();
            
            await expect(passwordPage.oldPasswordEyeIcon).toBeVisible();
            await expect(passwordPage.oldPasswordInput).toHaveAttribute('type', 'password');
            await expect(passwordPage.newPasswordInput).toHaveAttribute('type', 'password');
            await expect(passwordPage.confirmPasswordInput).toHaveAttribute('type', 'password');
        });

        test('Profile Password - Clicking eye toggle icon alternates input between masked and visible text', async ({ page }) => {
            const passwordPage = new PasswordPage(page);
            await passwordPage.fillPasswordForm({ oldPassword: 'test' });
            
            await expect(passwordPage.oldPasswordInput).toHaveAttribute('type', 'password');
            await passwordPage.oldPasswordEyeIcon.click();
            await expect(passwordPage.oldPasswordInput).toHaveAttribute('type', 'text');
        });

        test('Profile Password - Input fields enforce maximum 31 characters limit via maxlength attribute', async ({ page }) => {
            const passwordPage = new PasswordPage(page);
            await expect(passwordPage.oldPasswordInput).toHaveAttribute('maxlength', '31');
            await expect(passwordPage.newPasswordInput).toHaveAttribute('maxlength', '31');
            await expect(passwordPage.confirmPasswordInput).toHaveAttribute('maxlength', '31');
        });
    });

    test.describe('Profile Password - Input Validation Scenarios', () => {
        test.beforeEach(async ({ page, topNavigationBar, profilePage }) => {
            await page.goto(process.env.PORTAL_URL as string);
            await expect(topNavigationBar.profileDropdown).toBeVisible({ timeout: 15000 });
            
            await topNavigationBar.openProfileMenu();
            await topNavigationBar.profileMenuProfileLink.click();
            await expect(profilePage.profileHeader).toBeVisible({ timeout: 15000 });
            
            const passwordTab = page.getByRole('tab', { name: /Password/i });
            await passwordTab.click({ force: true });
        });

        const validationScenarios = passwordScenarios.negativeScenarios.filter((s: any) => 
            !s.scenario.toLowerCase().includes('same as old password') && !s.bypassLength
        );

        for (const s of validationScenarios) {
            test(`Profile Password - Rejects invalid input: ${s.scenario}`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: JSON.stringify(s) });
                const passwordPage = new PasswordPage(page);
                
                await passwordPage.clearPasswordForm();
                await passwordPage.fillPasswordForm({
                    oldPassword: s.oldPassword,
                    newPassword: s.newPassword,
                    confirmPassword: s.confirmPassword
                });
                
                await passwordPage.clickUpdatePassword();
                await expect(page.getByText(s.expectedError, { exact: false }).first()).toBeVisible({ timeout: 15000 });
            });
        }
    });

    test.describe('Profile Password - Password Change Flows with Isolated User', () => {
        test.use({ storageState: { cookies: [], origins: [] } });

        let testUserEmail: string;
        const defaultPassword = process.env.HOME_PAGE_USER_PASSWORD as string;
        let adminApiPositive: AdminApiService;
        
        test.beforeAll(async () => {
            adminApiPositive = new AdminApiService();
            await adminApiPositive.login();
            
            const uniqueId = Date.now().toString().slice(-6);
            testUserEmail = `pwd_user_${uniqueId}@yopmail.com`;
            await adminApiPositive.addSingleUser(`Pwd User ${uniqueId}`, testUserEmail);
            await adminApiPositive.changeUserPassword(testUserEmail, defaultPassword);
        });
        
        test.afterAll(async () => {
            if (adminApiPositive) await adminApiPositive.close();
        });

        test('Profile Password - Rejects update when new password matches old password', async ({ page, termsAndConditionsModal }) => {
            const loginPage = new PortalLoginPage(page);
            const topNav = new TopNavigationBar(page);
            const passwordPage = new PasswordPage(page);
            
            const welcomePage = new WelcomePage(page);
            await loginPage.login(testUserEmail, defaultPassword);
            await welcomePage.proceedToHome();
            await page.waitForTimeout(1000);
            await termsAndConditionsModal.handleTermsAndConditionsIfVisible();
            
            await topNav.openProfileMenu();
            await topNav.profileMenuProfileLink.click({ force: true });
            
            const passwordTab = page.getByRole('tab', { name: /Password/i });
            await passwordTab.click({ force: true });
            await expect(passwordPage.tabHeader).toBeVisible();
            
            await passwordPage.fillPasswordForm({
                oldPassword: defaultPassword,
                newPassword: defaultPassword,
                confirmPassword: defaultPassword
            });
            await passwordPage.clickUpdatePassword();
            
            const expectedError = "Old password and new password cannot be same!";
            await expect(page.getByText(expectedError, { exact: false }).first()).toBeVisible({ timeout: 15000 });
        });

        test('Profile Password - Successfully updates user password with valid new credentials', async ({ page, termsAndConditionsModal }) => {
            const loginPage = new PortalLoginPage(page);
            const topNav = new TopNavigationBar(page);
            const passwordPage = new PasswordPage(page);
            const welcomePage = new WelcomePage(page);
            const newPassword = passwordScenarios.validInputs.newPassword2;
            
            await loginPage.login(testUserEmail, defaultPassword);
            await welcomePage.proceedToHome();
            await page.waitForTimeout(1000);
            await termsAndConditionsModal.handleTermsAndConditionsIfVisible();
            
            await topNav.openProfileMenu();
            await topNav.profileMenuProfileLink.click({ force: true });
            
            const passwordTab = page.getByRole('tab', { name: /Password/i });
            await passwordTab.click({ force: true });
            await expect(passwordPage.tabHeader).toBeVisible();
            
            await passwordPage.fillPasswordForm({
                oldPassword: defaultPassword,
                newPassword: newPassword,
                confirmPassword: newPassword
            });
            await passwordPage.clickUpdatePassword();
            
            await expect(page.getByText(/Updated successfully|Password changed successfully/i).first()).toBeVisible({ timeout: 15000 });
        });
    });
});
