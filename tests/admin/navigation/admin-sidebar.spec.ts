import { test, expect, Page } from '@playwright/test';
import { AdminDashboardLoginPage } from '../../../src/pages/admin/AdminDashboardLoginPage';
import adminData from '../../test-data/admin-data.json';

test.describe('Admin Sidebar Navigation', () => {
    test.beforeEach(async ({ page }) => {
        const dashboard = new AdminDashboardLoginPage(page);
        await page.goto(process.env.ADMIN_TEST_URL + "/librarian/v2/elibrarySetup/dashboard");
        await expect(page).toHaveTitle(/.*Codec Network.*/i, { timeout: 15000 });
    });

    test('TC_AdminSidebar_NavigateToSecuritySettings - successfully toggles accordion and navigates', async ({ page }) => {
        const dashboard = new AdminDashboardLoginPage(page);
        // Navigate to Security Settings
        await dashboard.sidebar.navigateToSecuritySettings();
        
        // Verify URL contains 'securitySettings'
        await expect(page).toHaveURL(/.*securitySettings.*/);
    });
});
