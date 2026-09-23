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

    test('TC_UserMgmt_Overview_ManageUsers_CountVisibility', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await expect(overviewPage.totalRegisteredUsersCount).not.toBeEmpty();
    });

    test('TC_UserMgmt_Overview_TotalUsers_NavigatesTo_ManageUsers', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        // Explicitly click the arrow icon (svg) as instructed by user because other parts of the card don't trigger navigation
        await overviewPage.totalRegisteredUsersCard.locator('.link-arrow-icon').click();
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.manageUsers), { timeout: 15000 });
        await page.goBack();
    });

    test('TC_UserMgmt_Overview_PendingOCA_CountVisibility', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await expect(overviewPage.pendingOcaRequestsCount).not.toBeEmpty();
    });

    test('TC_UserMgmt_Overview_PendingOCA_Navigation', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await overviewPage.pendingOcaRequestsCard.click();
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.ocaRequests), { timeout: 15000 });
        await page.goBack();
    });

    test('TC_UserMgmt_Overview_QuickFind_PlaceholderValidation', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await expect(overviewPage.quickFindInput).toHaveAttribute('placeholder', 'Enter user name/email');
    });

    test('TC_UserMgmt_Overview_QuickFind_SearchFirstKeyword', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        const keyword = adminData.userManagement.quickFindKeywords[0]; // codec@yopmail.com
        await overviewPage.performQuickFindSearch(keyword);
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.manageUsers), { timeout: 15000 });
        await page.goBack();
    });

    test('TC_UserMgmt_Overview_QuickFind_SearchSecondKeyword', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        const keyword = adminData.userManagement.quickFindKeywords[1]; // network
        await overviewPage.performQuickFindSearch(keyword);
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.manageUsers), { timeout: 15000 });
        await page.goBack();
    });

    test('TC_UserMgmt_Overview_QuickFind_ClearButton', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        const tempText = adminData.userManagement.temporarySearchText;
        await overviewPage.quickFindInput.fill(tempText);
        await expect(overviewPage.quickFindInput).toHaveValue(tempText);
        await overviewPage.quickFindClearBtn.click();
        await expect(overviewPage.quickFindInput).toBeEmpty();
    });

    test('TC_UserMgmt_Overview_ServiceGroups_AssignedUsersCountVisibility', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await expect(overviewPage.serviceGroupsAssignedUsers).toBeVisible();
    });

    test('TC_UserMgmt_Overview_ServiceGroups_MaxUsersCountVisibility', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await expect(overviewPage.serviceGroupsMaxUsers).toBeVisible();
    });

    test('TC_UserMgmt_Overview_ServiceGroups_Navigation', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await overviewPage.serviceGroupsCard.click();
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.serviceGroups), { timeout: 15000 });
        await page.goBack();
    });

    test('TC_UserMgmt_Overview_ContentGroups_CountVisibility', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await expect(overviewPage.contentGroupsCount).toBeVisible();
    });

    test('TC_UserMgmt_Overview_ContentGroups_Navigation', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await overviewPage.contentGroupsCard.click();
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.contentGroups), { timeout: 15000 });
        await page.goBack();
    });

    test('TC_UserMgmt_Overview_AddSingleUser_Navigation', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await overviewPage.addSingleUserCard.click();
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.addSingleUser), { timeout: 15000 });
        await page.goBack();
    });

    test('TC_UserMgmt_Overview_AddMultipleUsers_Navigation', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await overviewPage.addMultipleUsersCard.click();
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.addMultipleUsers), { timeout: 15000 });
        await page.goBack();
    });

    test('TC_UserMgmt_Overview_ProfileSettings_Navigation', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await overviewPage.profileSettingsCard.click();
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.userProfileSettings), { timeout: 15000 });
        await page.goBack();
    });

    test('TC_UserMgmt_Overview_ExportUsers_ToastValidation', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await overviewPage.exportUsersCard.click();
        const toastLocator = page.locator('.swal2-toast');
        await expect(toastLocator).toBeVisible();
        await expect(toastLocator).toContainText('Export all users operation has been initiated, you will receive the attachment in email shortly');
    });

    test('TC_UserMgmt_Overview_SecuritySettings_Navigation', async ({ page }) => {
        const overviewPage = new UserMgmtOverviewPage(page);
        await overviewPage.securitySettingsCard.click();
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.securitySettings));
        await page.goBack();
    });
});
