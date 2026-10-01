import { test, expect, Page } from '@playwright/test';
import { AdminDashboardLoginPage } from '../../../src/pages/admin/AdminDashboardLoginPage';

test.describe('Admin Header - Bulk Email Limit', () => {
    
    test.beforeEach(async ({ page }) => {
        const dashboard = new AdminDashboardLoginPage(page);
        await page.goto(process.env.ADMIN_TEST_URL + "/librarian/v2/elibrarySetup/dashboard");
        await dashboard.ensureLoggedIn();
        await expect(page).toHaveTitle(/.*Codec Network.*/i, { timeout: 15000 });
        await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
    });

    test('Admin Header - Bulk Email Widget - Displays remaining email quota on dashboard header', async ({ page }) => {
        const dashboard = new AdminDashboardLoginPage(page);
        // Assert the widget is visible on the initial Dashboard load
        await dashboard.header.verifyBulkEmailLimitVisible();
    });

    test('Admin Header - Bulk Email Widget - Expands usage popover and opens more info modal on click', async ({ page }) => {
        const dashboard = new AdminDashboardLoginPage(page);
        
        await dashboard.header.verifyBulkEmailLimitVisible();
        
        // Click the dropdown
        await dashboard.header.clickBulkEmailLimitDropdown();
        
        // Verify the popover appears with the expected content based on the provided HTML
        await expect(dashboard.header.bulkEmailDropdownPopover).toBeVisible({ timeout: 10000 });
        await expect(dashboard.header.popoverDailyUsageText).toBeVisible();
        await expect(dashboard.header.popoverProgressBar).toBeAttached();
        await expect(dashboard.header.popoverUsageCountText).toContainText(/used out of [\d,]+ emails/);
        await expect(dashboard.header.popoverInfoIcon).toBeVisible();
        await expect(dashboard.header.popoverMoreInfoLink).toBeVisible();
        
        // Further validate clickable elements per user requirement
        await dashboard.header.clickPopoverInfoIcon();
        
        // Use a promise to wait for navigation or new page before clicking more info, 
        // but since we don't know exactly what happens, we'll just verify it's clickable
        await dashboard.header.clickPopoverMoreInfoLink();

        // Verify the Info Modal appears with expected content
        await expect(dashboard.header.bulkEmailInfoModal).toBeVisible({ timeout: 10000 });
        await expect(dashboard.header.bulkEmailInfoModalTitle).toBeVisible();
        await expect(dashboard.header.bulkEmailInfoModalDescription).toContainText('Your organization can send up to');
        await expect(dashboard.header.bulkEmailInfoModalDescription).toContainText('bulk emails per day');
        
        // Close the modal
        await dashboard.header.closeBulkEmailInfoModal();
        await expect(dashboard.header.bulkEmailInfoModal).toBeHidden();
    });

    test('Admin Header - Bulk Email Widget - Persists globally across admin page navigations', async ({ page }) => {
        const dashboard = new AdminDashboardLoginPage(page);
        
        // Verify it's visible on the Dashboard
        await dashboard.header.verifyBulkEmailLimitVisible();
        
        // Navigate to a completely different page (Security Settings)
        await dashboard.sidebar.navigateToSecuritySettings();
        
        // Verify it remains visible on the new page, proving global presence
        await dashboard.header.verifyBulkEmailLimitVisible();
    });
});
