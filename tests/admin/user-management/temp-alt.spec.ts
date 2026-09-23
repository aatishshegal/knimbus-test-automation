import { test, expect } from '@playwright/test';
import { ManageUsersPage } from '../../../src/pages/admin/user-management/ManageUsersPage';
import { AdminApiService } from '../../../src/api/AdminApiService';
import * as fs from 'fs';

test('Extract Alternate Email Error', async ({ page }) => {
    const adminApi = new AdminApiService();
    await adminApi.initFromState('.auth/admin.json');
    const testEmail = `profiletest${Date.now()}@yopmail.com`;
    await adminApi.addSingleUser("Profile TestUser", testEmail);
    await adminApi.close();

    await page.goto(process.env.ADMIN_TEST_URL + '/librarian/v2/elibrarySetup/userManagement/manageUsers');
    const manageUsersPage = new ManageUsersPage(page);
    await manageUsersPage.searchForUser(testEmail);
    await manageUsersPage.clickUserDetailsOverview(testEmail);
    
    await page.waitForTimeout(2000);
    
    const altEmail = manageUsersPage.getProfileLocator('alternateEmail');
    await altEmail.fill(testEmail);
    await altEmail.blur();
    
    await manageUsersPage.clickProfileSave();
    await page.waitForTimeout(1000);
    
    const errorMsg = await page.evaluate(() => {
        const err = document.querySelector('.error, .text-danger, .invalid-feedback, .error-message, .alert-danger, label.error');
        return err ? err.textContent : 'NO_ERROR_FOUND';
    });
    
    fs.mkdirSync('scratch', { recursive: true });
    fs.writeFileSync('scratch/error.txt', errorMsg || '');
});
