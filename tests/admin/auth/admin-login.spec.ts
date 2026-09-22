import { test, expect } from '@playwright/test';
import { AdminDashboardLoginPage } from '../../../src/pages/admin/AdminDashboardLoginPage';
import adminData from '../../test-data/admin-data.json';

test.describe.skip('Admin Dashboard Login', () => {
    // We want to test login itself, so we must start logged out
    test.use({ storageState: { cookies: [], origins: [] } });

    test('TC_AdminLogin_Success - logs in successfully', async ({ page }) => {
        const loginPage = new AdminDashboardLoginPage(page);

        await loginPage.navigate();

        const email = process.env.ADMIN_TEST_EMAIL;
        const password = process.env.ADMIN_TEST_PASSWORD;

        if (!email || !password) {
            throw new Error("Admin credentials are not defined in .env");
        }

        await loginPage.login(email, password);

        // Basic assertion placeholder, will update once UI is known
        await expect(page).toHaveTitle(new RegExp(adminData.expectedTitles.dashboard, 'i'));
    });
});
