import { test, expect } from '@playwright/test';
import { AdminDashboardLoginPage } from '../../../src/pages/admin/AdminDashboardLoginPage';
import adminData from '../../test-data/admin-data.json';

test.describe('Admin Dashboard Login', () => {
    // We want to test login itself, so we must start logged out
    test.use({ storageState: { cookies: [], origins: [] } });

    test('Admin Authentication - Login - Authenticates successfully with valid credentials and stores session', async ({ page }) => {
        const loginPage = new AdminDashboardLoginPage(page);

        await loginPage.navigate();

        const email = process.env.ADMIN_TEST_EMAIL as string;
        const password = process.env.ADMIN_TEST_PASSWORD as string;

        await loginPage.login(email, password);

        // Basic assertion placeholder, will update once UI is known
        await expect(page).toHaveTitle(new RegExp(adminData.expectedTitles.dashboard, 'i'));
        await page.context().storageState({ path: '.auth/admin.json' });
    });
});
