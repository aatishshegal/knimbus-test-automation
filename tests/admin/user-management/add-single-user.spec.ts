import { test, expect, Page } from '@playwright/test';
import { AdminDashboardLoginPage } from '../../../src/pages/admin/AdminDashboardLoginPage';
import { AddSingleUserPage } from '../../../src/pages/admin/user-management/AddSingleUserPage';
import adminData from '../../test-data/admin-data.json';

test.describe('User Management - Add Single User', () => {
    
    test.beforeEach(async ({ page }) => {
        const dashboard = new AdminDashboardLoginPage(page);
        await page.goto(process.env.ADMIN_TEST_URL + '/librarian/v2/elibrarySetup/dashboard');
        await expect(page).toHaveTitle(/.*Codec Network.*/i, { timeout: 15000 });
        await dashboard.sidebar.navigateToAddSingleUser();
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.addSingleUser));
    });

    test('TC_UserMgmt_AddSingleUser_Success', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        
        // We append a timestamp to the email to ensure it's always unique and avoid "User already exists" errors
        const uniqueEmail = adminData.userManagement.newUserData.email.replace('@', `${Date.now()}@`);
        
        const testUser = {
            ...adminData.userManagement.newUserData,
            email: uniqueEmail
        };

        // Fill out the required form fields
        await addUserPage.fillRegistrationForm(testUser);
        
        // Submit
        await addUserPage.submitForm();
        
        // Verify success toast/modal
        // The exact success message might vary, we check for swal2-toast or swal2-popup containing success keywords
        const toastLocator = page.locator('.swal2-toast, .swal2-popup');
        await expect(toastLocator).toBeVisible({ timeout: 10000 });
        await expect(toastLocator).toContainText(/success|created|saved/i);
    });
});
