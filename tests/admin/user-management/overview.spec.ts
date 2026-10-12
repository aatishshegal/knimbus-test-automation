import { test, expect, Page } from '@playwright/test';
import { AdminDashboardLoginPage } from '../../../src/pages/admin/AdminDashboardLoginPage';
import { UserMgmtOverviewPage } from '../../../src/pages/admin/user-management/UserMgmtOverviewPage';
import adminData from '../../test-data/admin-data.json';

test.describe('User Management - Overview Validations', () => {

    test.beforeEach(async ({ page }) => {
        const dashboard = new AdminDashboardLoginPage(page);
        await page.goto(process.env.ADMIN_TEST_URL + '/librarian/v2/elibrarySetup/dashboard');
        await expect(page).toHaveTitle(/.*Codec Network.*/i, { timeout: 15000 });
        await dashboard.sidebar.navigateToOverview();
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.overview));
    });

    test('User Management Overview - Total Users Card - Displays registered users count metric', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await expect(overviewPage.totalRegisteredUsersCount).not.toBeEmpty();
    });

    test('User Management Overview - Total Users Card - Navigates to Manage Users page on arrow click', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        // Explicitly click the arrow icon (svg) as instructed by user because other parts of the card don't trigger navigation
        await overviewPage.totalRegisteredUsersCard.locator('.link-arrow-icon').click();
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.manageUsers), { timeout: 15000 });
        await page.goBack();
    });

    test('User Management Overview - Pending OCA Card - Displays pending OCA requests count metric', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await expect(overviewPage.pendingOcaRequestsCount).not.toBeEmpty();
    });

    test('User Management Overview - Pending OCA Card - Navigates to OCA requests page on click', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await overviewPage.pendingOcaRequestsCard.click();
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.ocaRequests), { timeout: 15000 });
        await page.goBack();
    });

    test('User Management Overview - Quick Find Search - Displays placeholder text', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await expect(overviewPage.quickFindInput).toHaveAttribute('placeholder', 'Enter user name/email');
    });

    test('User Management Overview - Quick Find Search - Searches by email keyword and routes to Manage Users', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        const keyword = adminData.userManagement.quickFindKeywords[0]; // codec@yopmail.com
        await overviewPage.performQuickFindSearch(keyword);
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.manageUsers), { timeout: 15000 });
        await page.goBack();
    });

    test('User Management Overview - Quick Find Search - Searches by name keyword and routes to Manage Users', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        const keyword = adminData.userManagement.quickFindKeywords[1]; // network
        await overviewPage.performQuickFindSearch(keyword);
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.manageUsers), { timeout: 15000 });
        await page.goBack();
    });

    test('User Management Overview - Quick Find Search - Clear button resets search input field', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        const tempText = adminData.userManagement.temporarySearchText;
        await overviewPage.quickFindInput.fill(tempText);
        await expect(overviewPage.quickFindInput).toHaveValue(tempText);
        await overviewPage.quickFindClearBtn.click();
        await expect(overviewPage.quickFindInput).toBeEmpty();
    });

    test('User Management Overview - Service Groups Card - Displays assigned users count metric', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await expect(overviewPage.serviceGroupsAssignedUsers).toBeVisible();
    });

    test('User Management Overview - Service Groups Card - Displays max users limit metric', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await expect(overviewPage.serviceGroupsMaxUsers).toBeVisible();
    });

    test('User Management Overview - Service Groups Card - Navigates to Service Groups page on click', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await overviewPage.serviceGroupsCard.click();
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.serviceGroups), { timeout: 15000 });
        await page.goBack();
    });

    test('User Management Overview - Content Groups Card - Displays content groups count metric', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await expect(overviewPage.contentGroupsCount).toBeVisible();
    });

    test('User Management Overview - Content Groups Card - Navigates to Content Groups page on click', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await overviewPage.contentGroupsCard.click();
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.contentGroups), { timeout: 15000 });
        await page.goBack();
    });

    test('User Management Overview - Quick Actions - Add Single User card navigates to Add User page', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await overviewPage.addSingleUserCard.click();
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.addSingleUser), { timeout: 15000 });
        await page.goBack();
    });

    test('User Management Overview - Quick Actions - Add Multiple Users card navigates to Bulk Upload page', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await overviewPage.addMultipleUsersCard.click();
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.addMultipleUsers), { timeout: 15000 });
        await page.goBack();
    });

    test('User Management Overview - Quick Actions - Profile Settings card navigates to Settings page', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await overviewPage.profileSettingsCard.click();
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.userProfileSettings), { timeout: 15000 });
        await page.goBack();
    });

    test('User Management Overview - Quick Actions - Export Users card initiates export and displays confirmation toast', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await overviewPage.exportUsersCard.click();
        const toastLocator = page.locator('.swal2-toast');
        await expect(toastLocator).toBeVisible();
        await expect(toastLocator).toContainText('Export all users operation has been initiated, you will receive the attachment in email shortly');
    });

    test('User Management Overview - Quick Actions - Security Settings card navigates to Security Settings page', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await overviewPage.securitySettingsCard.click();
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.securitySettings));
        await page.goBack();
    });
});
