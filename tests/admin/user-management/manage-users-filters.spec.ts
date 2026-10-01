import { test, expect } from '@playwright/test';
import { AdminDashboardLoginPage } from '../../../src/pages/admin/AdminDashboardLoginPage';
import { AddSingleUserPage } from '../../../src/pages/admin/user-management/AddSingleUserPage';
import { ManageUsersPage } from '../../../src/pages/admin/user-management/ManageUsersPage';
import { AdminApiService } from '../../../src/api/AdminApiService';
import adminData from '../../test-data/admin-data.json';

test.describe('User Management - Manage Users Filters', () => {
    const filterData = adminData.userManagement.filters;
    const baseTimestamp = Date.now();
    const serviceGroupEmail = adminData.userManagement.newUserData.email.replace('@', `${baseTimestamp}sg@`);
    const incompleteUserEmail = filterData.incompleteUserEmail.replace('@', `${baseTimestamp}inc@`);

    test.beforeEach(async ({ page }) => {
        const dashboard = new AdminDashboardLoginPage(page);
        await page.goto(process.env.ADMIN_TEST_URL + '/librarian/v2/elibrarySetup/dashboard');
        await expect(page).toHaveTitle(new RegExp(adminData.expectedTitles.dashboard, 'i'), { timeout: 15000 });
        await dashboard.sidebar.navigateToManageUsers();
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.manageUsers));
    });

    test('TC_ManageUsers_Filters_ToggleVisibility - Expanding and collapsing filter panel', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);

        // Verify initial collapsed state
        await expect(manageUsersPage.serviceGroupSelect).not.toBeVisible();

        // Expand filters
        await manageUsersPage.openFilters();
        await expect(manageUsersPage.serviceGroupSelect).toBeVisible();
        await expect(manageUsersPage.userTypeSelect).toBeVisible();
        await expect(manageUsersPage.applyFiltersBtn).toBeVisible();
        await expect(manageUsersPage.clearFiltersBtn).toBeVisible();

        // Collapse filters
        await manageUsersPage.closeFilters();
        await expect(manageUsersPage.serviceGroupSelect).not.toBeVisible();
    });

    test('TC_ManageUsers_Filters_InitialStateDisabled - Apply and Clear buttons disabled initially', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);

        // Expand filters without selecting any option
        await manageUsersPage.openFilters();

        // Verify Apply and Clear buttons are not actionable initially
        const isApplyDisabled = await manageUsersPage.isApplyFilterDisabled();
        const isClearDisabled = await manageUsersPage.isClearFilterDisabled();

        expect(isApplyDisabled).toBeTruthy();
        expect(isClearDisabled).toBeTruthy();

        // Cleanup: collapse filters
        await manageUsersPage.closeFilters();
    });

    test('TC_ManageUsers_Filters_FilterByServiceGroup - Filters user table by selected service group', async ({ page }) => {
        const dashboard = new AdminDashboardLoginPage(page);
        const manageUsersPage = new ManageUsersPage(page);
        const targetGroup = filterData.serviceGroup;

        test.info().annotations.push({ type: 'testData', description: `Service Group: ${targetGroup}` });

        // Precondition: Create a user assigned to the target service group
        await dashboard.sidebar.navigateToAddSingleUser();
        const addUserPage = new AddSingleUserPage(page);
        const userToCreate = { ...adminData.userManagement.newUserData, email: serviceGroupEmail };
        await addUserPage.fillRegistrationForm(userToCreate);
        await addUserPage.submitForm();

        const toastLocator = page.locator('.swal2-toast, .swal2-popup');
        await expect(toastLocator).toBeVisible({ timeout: 15000 });
        await expect(toastLocator).not.toBeVisible();

        // Navigate to Manage Users and apply filter
        await dashboard.sidebar.navigateToManageUsers();
        await manageUsersPage.filterByServiceGroup(targetGroup);

        // Verify filtered table rows have the target service group
        await manageUsersPage.verifyAllVisibleRowsHaveServiceGroup(targetGroup);

        // Delete the temporary user
        await manageUsersPage.deleteUser(serviceGroupEmail);
        await page.waitForTimeout(2000);

        // Clear filter
        await manageUsersPage.clickClearFilters();
    });

    test('TC_ManageUsers_Filters_FilterByUserType - Filters user table by selected user type', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        const targetUserType = filterData.userType;

        test.info().annotations.push({ type: 'testData', description: `User Type: ${targetUserType}` });

        // Apply filter by User Type
        await manageUsersPage.filterByUserType(targetUserType);

        // Verify results table is populated and rendered
        await expect(manageUsersPage.tableRows.first()).toBeVisible({ timeout: 10000 });

        // Clear filter
        await manageUsersPage.clickClearFilters();
    });

    test.describe('Incomplete Registrations Filter', () => {
        let adminApi: AdminApiService;

        test.beforeAll(async () => {
            adminApi = new AdminApiService();
            await adminApi.initFromState('.auth/admin.json');
            // Precondition: Set mandatory field in User Profile Settings so new basic user is incomplete
            await adminApi.updateSecuritySettings({
                mandatoryFields: {
                    fields: [filterData.mandatoryFieldForPrecondition],
                    isMandatory: true
                }
            });
            // Create a user with only basic info (missing the mandatory field)
            await adminApi.addSingleUser(adminData.userManagement.newUserData.userName, incompleteUserEmail);
        });

        test.afterAll(async () => {
            try {
                if (adminApi) {
                    await adminApi.initFromState('.auth/admin.json');
                    // Teardown: Revert mandatory field back to false
                    await adminApi.updateSecuritySettings({
                        mandatoryFields: {
                            fields: [filterData.mandatoryFieldForPrecondition],
                            isMandatory: false
                        }
                    });
                    await adminApi.close();
                }
            } catch (err) {
                console.error('Teardown error:', err);
            }
        });

        test('TC_ManageUsers_Filters_IncompleteRegistrations - Displays users with missing mandatory fields', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);

            test.info().annotations.push({ type: 'testData', description: `Incomplete User Email: ${incompleteUserEmail}` });

            // Apply filter for Incomplete Registrations
            await manageUsersPage.filterByIncompleteRegistrations();

            // Assert the incomplete user is present in the filtered table
            const userRow = manageUsersPage.getRowByEmail(incompleteUserEmail);
            await expect(userRow).toBeVisible({ timeout: 10000 });

            // Clean up: delete the temporary test user
            await manageUsersPage.deleteUser(incompleteUserEmail);
            await page.waitForTimeout(2000);

            // Clear filter
            await manageUsersPage.clickClearFilters();
        });
    });
});
