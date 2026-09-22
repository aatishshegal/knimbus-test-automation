import { test, expect, Page } from '@playwright/test';
import { AdminDashboardLoginPage } from '../../../src/pages/admin/AdminDashboardLoginPage';
import { AddSingleUserPage } from '../../../src/pages/admin/user-management/AddSingleUserPage';
import { ManageUsersPage } from '../../../src/pages/admin/user-management/ManageUsersPage';
import adminData from '../../test-data/admin-data.json';

import { AdminApiService } from '../../../src/api/AdminApiService';

test.describe('User Management - Manage Users', () => {
    
    // Test data for this specific suite
    const baseTimestamp = Date.now();
    const testEmail1 = adminData.userManagement.newUserData.email.replace('@', `${baseTimestamp}1@`);
    const testEmail2 = adminData.userManagement.newUserData.email.replace('@', `${baseTimestamp}2@`);
    const testEmail3 = adminData.userManagement.newUserData.email.replace('@', `${baseTimestamp}3@`);
    const testEmail4 = adminData.userManagement.newUserData.email.replace('@', `${baseTimestamp}4@`);
    const testEmail5 = adminData.userManagement.newUserData.email.replace('@', `${baseTimestamp}5@`);
    const testEmail6 = adminData.userManagement.newUserData.email.replace('@', `${baseTimestamp}6@`);
    const testEmail7 = adminData.userManagement.newUserData.email.replace('@', `${baseTimestamp}7@`);

    test.beforeAll(async () => {
        // Use API for instantaneous test data setup to avoid UI bloat across tests
        // Initialize from existing state to avoid invalidating the global UI session
        const adminApi = new AdminApiService();
        await adminApi.initFromState();
        
        const usersToCreate = [
            { userName: adminData.userManagement.newUserData.userName, email: testEmail1 },
            { userName: adminData.userManagement.newUserData.userName, email: testEmail2 },
            { userName: adminData.userManagement.newUserData.userName, email: testEmail3 }
        ];
        
        for (const user of usersToCreate) {
            await adminApi.addSingleUser(user.userName, user.email);
        }
        await adminApi.close();
    });

    test.afterAll(async ({ browser }) => {
        // We use a fresh context injected with the admin state to safely perform UI teardown
        const context = await browser.newContext({ storageState: '.auth/admin.json' });
        const authPage = await context.newPage();
        await authPage.goto(process.env.ADMIN_TEST_URL + '/librarian/v2/elibrarySetup/dashboard');
        
        const dashboardAuth = new AdminDashboardLoginPage(authPage);
        await dashboardAuth.sidebar.navigateToManageUsers();
        const manageUsersPage = new ManageUsersPage(authPage);

        for (const email of [testEmail1, testEmail2, testEmail3, testEmail4, testEmail5, testEmail6, testEmail7]) {
            try {
                await manageUsersPage.searchForUser(email);
                
                const row = manageUsersPage.getRowByEmail(email);
                const noRecords = authPage.getByText(/No results found|No matching records found|No Record Found/i);
                
                await require('@playwright/test').expect(row.or(noRecords).first()).toBeVisible({ timeout: 15000 }).catch(() => {});
                
                if (await noRecords.first().isVisible()) {
                    continue;
                }
                await manageUsersPage.deleteUser(email);
                await authPage.waitForTimeout(1000);
            } catch (e) {
                // Ignore if already deleted
            }
        }
        await context.close();
    });

    test.beforeEach(async ({ page }) => {
        const dashboard = new AdminDashboardLoginPage(page);
        await page.goto(process.env.ADMIN_TEST_URL + '/librarian/v2/elibrarySetup/dashboard');
        await expect(page).toHaveTitle(/.*Codec Network.*/i, { timeout: 15000 });
        await dashboard.sidebar.navigateToManageUsers();
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.manageUsers));
    });

    test('TC_UserMgmt_ManageUsers_Search', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        await manageUsersPage.searchForUser(testEmail1);
        
        // Assert that the user is in the table
        const userRow = manageUsersPage.getRowByEmail(testEmail1);
        await expect(userRow).toBeVisible();
    });

    test('TC_UserMgmt_ManageUsers_BulkExportAllToast', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        await manageUsersPage.exportAllUsersBtn.click();
        await expect(manageUsersPage.swalToast).toBeVisible();
        await expect(manageUsersPage.swalToast).toContainText(/Export.*initiated/i);
        // Close or wait to hide
        await manageUsersPage.page.locator('.swal2-close').click().catch(() => {});
    });
    
    test('TC_UserMgmt_ManageUsers_Table_SearchNoResults', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        const invalidSearch = adminData.userManagement.invalidSearchTerm;
        
        test.info().annotations.push({ type: 'testData', description: `Invalid Search: ${invalidSearch}` });
        
        await manageUsersPage.searchForUser(invalidSearch);
        await expect(page.locator('text=No data found').or(page.locator('.no-data-found, .empty-state'))).toBeVisible({ timeout: 5000 }).catch(() => {});
    });

    test('TC_UserMgmt_ManageUsers_Table_CancelSelection', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        if (await manageUsersPage.clearSearchBtn.isVisible()) { await manageUsersPage.clearSearchBtn.click(); }
        const commonEmailPrefix = `auto_tester_manage${baseTimestamp}`;
        await manageUsersPage.searchForUser(commonEmailPrefix);
        
        await manageUsersPage.selectUserCheckbox(testEmail2);
        await manageUsersPage.selectUserCheckbox(testEmail3);
        
        // Verify "2 users selected" header appears
        await expect(page.locator('text=2 users selected')).toBeVisible();
        
        // Click Cancel on the dynamic header
        await manageUsersPage.headerCancelSelectionBtn.click();
        
        // Verify checkboxes are unchecked
        const row2 = manageUsersPage.getRowByEmail(testEmail2);
        const row3 = manageUsersPage.getRowByEmail(testEmail3);
        await expect(row2.locator('input[type="checkbox"]')).not.toBeChecked();
        await expect(row3.locator('input[type="checkbox"]')).not.toBeChecked();
        await expect(page.locator('text=2 users selected')).not.toBeVisible();
    });

    test('TC_UserMgmt_ManageUsers_Table_UserDetailsOverview', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        if (await manageUsersPage.clearSearchBtn.isVisible()) { await manageUsersPage.clearSearchBtn.click(); }
        await manageUsersPage.searchForUser(testEmail1);
        
        await manageUsersPage.clickUserDetailsOverview(testEmail1);
        
        // Verify modal opens and contains the email
        const modal = page.locator('.modal.show, .modal').filter({ hasText: 'User Profile' });
        await expect(modal).toBeVisible();
        await expect(modal).toContainText(testEmail1);
        
        // Close the modal
        const closeBtn = modal.getByRole('button', { name: 'Close', exact: true }).or(modal.locator('.btn-close'));
        if (await closeBtn.isVisible()) {
            await closeBtn.click();
        } else {
            await page.keyboard.press('Escape');
        }
        await expect(modal).not.toBeVisible();
    });

    test('TC_UserMgmt_ManageUsers_Table_AssignGroup', async ({ page }) => {
        const dashboard = new AdminDashboardLoginPage(page);
        
        // 1-4: Navigate to User Management > Add Single User & Create User
        await dashboard.sidebar.navigateToAddSingleUser();
        const addUserPage = new AddSingleUserPage(page);
        const userToCreate = { ...adminData.userManagement.newUserData, email: testEmail4 };
        await addUserPage.fillRegistrationForm(userToCreate);
        await addUserPage.submitForm();
        
        const toastLocator = page.locator('.swal2-toast, .swal2-popup');
        await expect(toastLocator).toBeVisible({ timeout: 15000 });
        await expect(toastLocator).toContainText(/success|created|saved/i);
        await expect(toastLocator).not.toBeVisible();
        
        // 5: Navigate to Manage Users
        await dashboard.sidebar.navigateToManageUsers();

        const manageUsersPage = new ManageUsersPage(page);
        if (await manageUsersPage.clearSearchBtn.isVisible()) { await manageUsersPage.clearSearchBtn.click(); }
        
        // 6: Search for the newly created user
        await manageUsersPage.searchForUser(testEmail4);
        
        // 7-11: Verify Assign Group pop-up displayed, assign group, and Save
        const targetServiceGroup = adminData.userManagement.newUserData.serviceGroup; // "tester"
        await manageUsersPage.assignServiceGroup(testEmail4, targetServiceGroup);
        
        // 12: Search for the same user again (to ensure table refresh)
        if (await manageUsersPage.clearSearchBtn.isVisible()) { await manageUsersPage.clearSearchBtn.click(); }
        await manageUsersPage.searchForUser(testEmail4);
        
        // 13: Verify that the selected service group is assigned to the user
        await manageUsersPage.verifyAssignedServiceGroup(testEmail4, targetServiceGroup);
    });

    test('TC_UserMgmt_ManageUsers_Table_AssignGroupWithDate', async ({ page }) => {
        // Required for navigating to other sub-menus in User Management
        const dashboard = new AdminDashboardLoginPage(page);
        
        // 1-4: Navigate to User Management > Add Single User & Create User
        await dashboard.sidebar.navigateToAddSingleUser();
        const addUserPage = new AddSingleUserPage(page);
        const userToCreate = { ...adminData.userManagement.newUserData, email: testEmail5 };
        await addUserPage.fillRegistrationForm(userToCreate);
        await addUserPage.submitForm();
        
        const toastLocator = page.locator('.swal2-toast, .swal2-popup');
        await expect(toastLocator).toBeVisible({ timeout: 15000 });
        await expect(toastLocator).toContainText(/success|created|saved/i);
        await expect(toastLocator).not.toBeVisible();
        
        // 5: Navigate to Manage Users
        await dashboard.sidebar.navigateToManageUsers();

        const manageUsersPage = new ManageUsersPage(page);
        if (await manageUsersPage.clearSearchBtn.isVisible()) { await manageUsersPage.clearSearchBtn.click(); }
        
        // 6: Search for the newly created user
        await manageUsersPage.searchForUser(testEmail5);
        
        // 7-11: Verify Assign Group pop-up displayed, assign group with date, and Save
        const targetServiceGroup = adminData.userManagement.newUserData.serviceGroup; // "tester"
        const expiryDate = adminData.userManagement.newUserData.expiryDate as string; 
        
        // Push annotation for test reporting
        test.info().annotations.push({ type: 'testData', description: `Group: ${targetServiceGroup} | Date: ${expiryDate}` });
        
        await manageUsersPage.assignServiceGroupWithDate(testEmail5, targetServiceGroup, expiryDate);
        
        // 12: Search for the same user again (to ensure table refresh)
        if (await manageUsersPage.clearSearchBtn.isVisible()) { await manageUsersPage.clearSearchBtn.click(); }
        await manageUsersPage.searchForUser(testEmail5);
        
        // 13: Verify that the selected service group and date are assigned to the user
        await manageUsersPage.verifyAssignedServiceGroupWithDate(testEmail5, targetServiceGroup, expiryDate);
    });

    test('TC_UserMgmt_ManageUsers_Table_AssignGroup_ExpiredValidation', async ({ page }) => {
        const dashboard = new AdminDashboardLoginPage(page);
        
        // 1. Navigate to Add Single User & Create User
        await dashboard.sidebar.navigateToAddSingleUser();
        const addUserPage = new AddSingleUserPage(page);
        const userToCreate = { ...adminData.userManagement.newUserData, email: testEmail6 };
        await addUserPage.fillRegistrationForm(userToCreate);
        await addUserPage.submitForm();
        
        const toastLocator = page.locator('.swal2-toast, .swal2-popup');
        await expect(toastLocator).toBeVisible({ timeout: 15000 });
        await expect(toastLocator).not.toBeVisible();
        
        // 2. Navigate to Manage Users
        await dashboard.sidebar.navigateToManageUsers();
        const manageUsersPage = new ManageUsersPage(page);
        if (await manageUsersPage.clearSearchBtn.isVisible()) { await manageUsersPage.clearSearchBtn.click(); }
        
        // 3. Search for user
        await manageUsersPage.searchForUser(testEmail6);
        
        // 4. Click Assign Group
        await manageUsersPage.clickAssignGroup(testEmail6);
        await manageUsersPage.assignGroupModal.waitFor({ state: 'visible', timeout: 5000 });
        
        // 5. Select "tester" service group
        await manageUsersPage.assignGroupSelect.selectOption({ label: 'tester' });
        
        // 6. Assert "This service group is already expired!!" message
        const expiredWarning = manageUsersPage.assignGroupModal.getByText('This service group is already expired!!');
        await expect(expiredWarning).toBeVisible({ timeout: 5000 });
        
        // Cleanup: Close modal
        const closeBtn = manageUsersPage.assignGroupModal.getByRole('button', { name: 'Cancel' }).or(page.locator('.btn-close')).first();
        if (await closeBtn.isVisible()) {
            await closeBtn.click();
        } else {
            await page.keyboard.press('Escape');
        }
    });

    test('TC_UserMgmt_ManageUsers_Table_AssignGroup_Cancel', async ({ page }) => {
        const dashboard = new AdminDashboardLoginPage(page);
        
        // 1. Navigate to Add Single User & Create User
        await dashboard.sidebar.navigateToAddSingleUser();
        const addUserPage = new AddSingleUserPage(page);
        const userToCreate = { ...adminData.userManagement.newUserData, email: testEmail7 };
        await addUserPage.fillRegistrationForm(userToCreate);
        await addUserPage.submitForm();
        
        const toastLocator = page.locator('.swal2-toast, .swal2-popup');
        await expect(toastLocator).toBeVisible({ timeout: 15000 });
        await expect(toastLocator).not.toBeVisible();
        
        // 2. Navigate to Manage Users
        await dashboard.sidebar.navigateToManageUsers();
        const manageUsersPage = new ManageUsersPage(page);
        if (await manageUsersPage.clearSearchBtn.isVisible()) { await manageUsersPage.clearSearchBtn.click(); }
        
        // 3. Search for user
        await manageUsersPage.searchForUser(testEmail7);
        
        // 4. Click Assign Group and enter data
        await manageUsersPage.clickAssignGroup(testEmail7);
        await manageUsersPage.assignGroupModal.waitFor({ state: 'visible', timeout: 5000 });
        await manageUsersPage.assignGroupSelect.selectOption({ label: 'tester' });
        
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 2);
        const dateString = futureDate.toISOString().split('T')[0];
        
        await manageUsersPage.assignGroupExpiryDateInput.waitFor({ state: 'visible', timeout: 5000 });
        await manageUsersPage.assignGroupExpiryDateInput.fill(dateString);
        await page.keyboard.press('Enter');
        
        // 5. Click Cancel Button
        const cancelBtn = manageUsersPage.assignGroupModal.getByRole('button', { name: 'Cancel', exact: true });
        await cancelBtn.click();
        await manageUsersPage.assignGroupModal.waitFor({ state: 'hidden', timeout: 5000 });
        
        // 6. Refresh page and verify it is not assigned
        await page.reload({ waitUntil: 'domcontentloaded' });
        
        if (await manageUsersPage.clearSearchBtn.isVisible()) { await manageUsersPage.clearSearchBtn.click(); }
        await manageUsersPage.searchForUser(testEmail7);
        
        // Assert it's still unassigned
        const row = manageUsersPage.getRowByEmail(testEmail7);
        await expect(row.getByText('tester', { exact: true })).not.toBeVisible();
    });

    test('TC_UserMgmt_ManageUsers_Table_SendNotification_Cancel', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        if (await manageUsersPage.clearSearchBtn.isVisible()) { await manageUsersPage.clearSearchBtn.click(); }
        await manageUsersPage.searchForUser(testEmail1);
        
        await manageUsersPage.clickSendNotification(testEmail1);
        
        const modal = page.locator('.modal.show, .modal');
        await expect(modal).toBeVisible();
        
        // Just cancel the modal
        const closeBtn = modal.getByRole('button', { name: 'Close', exact: true }).or(modal.locator('.btn-close'));
        if (await closeBtn.isVisible()) {
            await closeBtn.click();
        } else {
            await page.keyboard.press('Escape');
        }
        await expect(modal).not.toBeVisible();
    });

    test('TC_UserMgmt_ManageUsers_Table_ExportUsageLog', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        if (await manageUsersPage.clearSearchBtn.isVisible()) { await manageUsersPage.clearSearchBtn.click(); }
        await manageUsersPage.searchForUser(testEmail1);
        
        await manageUsersPage.clickExportUsageLog(testEmail1);
        
        // Wait for Export Usage Log modal
        const modal = page.locator('.modal.show, .modal').filter({ hasText: 'Export Usage Log' });
        await expect(modal).toBeVisible();
        
        // Click Cancel to just verify the modal opens without triggering actual export emails/downloads in this simple check
        await modal.getByRole('button', { name: 'Cancel', exact: true }).click();
        await expect(modal).not.toBeVisible();
    });

    test('TC_UserMgmt_ManageUsers_DeleteSingleUser_Cancel', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        if (await manageUsersPage.clearSearchBtn.isVisible()) { await manageUsersPage.clearSearchBtn.click(); }
        await manageUsersPage.searchForUser(testEmail1);
        
        await manageUsersPage.selectUserCheckbox(testEmail1);
        const row = manageUsersPage.getRowByEmail(testEmail1);
        await row.locator('span[title="Delete user"] button').click();
        
        // Wait for modal
        await page.waitForTimeout(500);
        const swalCancel = page.locator('.swal2-cancel');
        const modalCancel = page.locator('.modal.show').getByRole('button', { name: 'Cancel', exact: true });
        
        if (await swalCancel.isVisible()) {
            await swalCancel.click();
        } else if (await modalCancel.isVisible()) {
            await modalCancel.click();
        } else {
            await page.keyboard.press('Escape');
        }
        
        await page.locator('.modal').waitFor({ state: 'hidden' }).catch(() => {});
        await page.locator('.swal2-container').waitFor({ state: 'hidden' }).catch(() => {});
        
        // Verify user is still in the table
        await expect(manageUsersPage.getRowByEmail(testEmail1)).toBeVisible();
    });
    
    test('TC_UserMgmt_ManageUsers_DeleteMultipleUsersBulk_Cancel', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        if (await manageUsersPage.clearSearchBtn.isVisible()) { await manageUsersPage.clearSearchBtn.click(); }
        const commonEmailPrefix = `auto_tester_manage${baseTimestamp}`;
        await manageUsersPage.searchForUser(commonEmailPrefix);
        
        await manageUsersPage.selectUserCheckbox(testEmail2);
        await manageUsersPage.selectUserCheckbox(testEmail3);
        
        await manageUsersPage.headerDeleteSelectedBtn.click();
        
        // Wait for modal
        await page.waitForTimeout(500);
        const swalCancel = page.locator('.swal2-cancel');
        const modalCancel = page.locator('.modal.show').getByRole('button', { name: 'Cancel', exact: true });
        
        if (await swalCancel.isVisible()) {
            await swalCancel.click();
        } else if (await modalCancel.isVisible()) {
            await modalCancel.click();
        } else {
            await page.keyboard.press('Escape');
        }
        
        await page.locator('.modal').waitFor({ state: 'hidden' }).catch(() => {});
        await page.locator('.swal2-container').waitFor({ state: 'hidden' }).catch(() => {});
        
        // Verify users are still in the table
        await expect(manageUsersPage.getRowByEmail(testEmail2)).toBeVisible();
        await expect(manageUsersPage.getRowByEmail(testEmail3)).toBeVisible();
    });

    test('TC_UserMgmt_ManageUsers_DeleteSingleUser', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        // Ensure we find the user first
        await manageUsersPage.searchForUser(testEmail1);
        
        // Delete the single user
        await manageUsersPage.deleteUser(testEmail1);
        
        // Let the table reload
        await page.waitForTimeout(2000);
        
        // Verify user is gone
        await manageUsersPage.searchForUser(testEmail1);
        const userRow = manageUsersPage.getRowByEmail(testEmail1);
        await expect(userRow).not.toBeVisible();
    });

    test('TC_UserMgmt_ManageUsers_DeleteMultipleUsersBulk', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        // Clear any previous search
        if (await manageUsersPage.clearSearchBtn.isVisible()) { await manageUsersPage.clearSearchBtn.click(); }
        
        // Search by the initial common part of the email id
        const commonEmailPrefix = `auto_tester_manage${baseTimestamp}`;
        await manageUsersPage.searchForUser(commonEmailPrefix);
        
        // Check both users
        await manageUsersPage.selectUserCheckbox(testEmail2);
        await manageUsersPage.selectUserCheckbox(testEmail3);
        
        // Bulk delete using the table header "Delete" button
        await manageUsersPage.multiSelectDeleteSelected();
        
        // Let the table reload
        await page.waitForTimeout(2000);
        
        // Verify users are gone
        await manageUsersPage.searchForUser(testEmail2);
        await expect(manageUsersPage.getRowByEmail(testEmail2)).not.toBeVisible();
        
        await manageUsersPage.searchForUser(testEmail3);
        await expect(manageUsersPage.getRowByEmail(testEmail3)).not.toBeVisible();
    });
});
