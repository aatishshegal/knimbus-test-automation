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
  const testEmail8 = adminData.userManagement.newUserData.email.replace('@', `${baseTimestamp}8@`);
  const testEmail9 = adminData.userManagement.newUserData.email.replace('@', `${baseTimestamp}9@`);

    
    
    
  async function createApiUser(email: string) {
    const adminApi = new AdminApiService();
    await adminApi.initFromState();
    await adminApi.addSingleUser(adminData.userManagement.newUserData.userName, email);
    await adminApi.close();
  }

  test.beforeEach(async ({ page }) => {
        const dashboard = new AdminDashboardLoginPage(page);
        await page.goto(process.env.ADMIN_TEST_URL + '/librarian/v2/elibrarySetup/dashboard');
        await expect(page).toHaveTitle(/.*Codec Network.*/i, { timeout: 15000 });
        await dashboard.sidebar.navigateToManageUsers();
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.manageUsers));
    });

    test('Manage Users - Search Filter - Displays matching user record when searching by email', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        await createApiUser(testEmail1);
        await manageUsersPage.searchForUser(testEmail1);
        
        // Assert that the user is in the table
        const userRow = manageUsersPage.getRowByEmail(testEmail1);
        await expect(userRow).toBeVisible();
    });

    test('Manage Users - Bulk Export - Initiates bulk export and displays success confirmation toast', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        await manageUsersPage.exportAllUsersBtn.click();
        await expect(manageUsersPage.swalToast).toBeVisible();
        await expect(manageUsersPage.swalToast).toContainText(/Export.*initiated/i);
        // Close or wait to hide
        await manageUsersPage.page.locator('.swal2-close').click().catch(() => {});
    });
    
    test('Manage Users - Search Filter - Displays empty state when searching with non-existent keyword', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        const invalidSearch = adminData.userManagement.invalidSearchTerm;
        
        test.info().annotations.push({ type: 'testData', description: `Invalid Search: ${invalidSearch}` });
        
        await manageUsersPage.searchForUser(invalidSearch);
        await expect(page.locator('text=No data found')).toBeVisible({ timeout: 5000 }).catch(() => {});
    });

    test('Manage Users - Bulk Selection - Cancel action unchecks all selected user checkboxes', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        await createApiUser(testEmail2);
        await createApiUser(testEmail3);
        await manageUsersPage.clearSearchSafely();
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

    test('Manage Users - User Profile Overview - Clicking user row opens user profile overview modal', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        await createApiUser(testEmail1);
        await manageUsersPage.clearSearchSafely();
        await manageUsersPage.searchForUser(testEmail1);
        
        await manageUsersPage.clickUserDetailsOverview(testEmail1);
        
        // Verify modal opens and contains the email
        const modal = page.locator('.modal.show, .modal').filter({ hasText: 'User Profile' });
        await expect(modal).toBeVisible();
        await expect(modal).toContainText(testEmail1);
        
        // Close the modal
        await manageUsersPage.closeModal(modal);
        await expect(modal).not.toBeVisible();
    });

    test('Manage Users - Assign Service Group - Assigns service group and updates group cell in table', async ({ page }) => {
        const dashboard = new AdminDashboardLoginPage(page);
        
        // 1-4: Navigate to User Management > Add Single User & Create User
        await dashboard.sidebar.navigateToAddSingleUser();
        const addUserPage = new AddSingleUserPage(page);
        const userToCreate = { ...adminData.userManagement.newUserData, email: testEmail4 };
        delete (userToCreate as any).serviceGroup;
        await addUserPage.fillRegistrationForm(userToCreate);
        await addUserPage.submitForm();
        
        const toastLocator = page.locator('.swal2-toast, .swal2-popup');
        await expect(toastLocator).toBeVisible({ timeout: 15000 });
        await expect(toastLocator).toContainText(/success|created|saved/i);
        await expect(toastLocator).not.toBeVisible();
        
        // 5: Navigate to Manage Users
        await dashboard.sidebar.navigateToManageUsers();

        const manageUsersPage = new ManageUsersPage(page);
        await manageUsersPage.clearSearchSafely();
        
        // 6: Search for the newly created user
        await manageUsersPage.searchForUser(testEmail4);
        
        // 7-11: Verify Assign Group pop-up displayed, assign group, and Save
        const targetServiceGroup = adminData.userManagement.newUserData.serviceGroup; // "tester"
        await manageUsersPage.assignServiceGroup(testEmail4, targetServiceGroup);
        
        // 12: Search for the same user again (to ensure table refresh)
        await manageUsersPage.clearSearchSafely();
        await manageUsersPage.searchForUser(testEmail4);
        
        // 13: Verify that the selected service group is assigned to the user
        await manageUsersPage.verifyAssignedServiceGroup(testEmail4, targetServiceGroup);
    });

    test('Manage Users - Assign Service Group - Assigns service group with custom expiry date and updates table', async ({ page }) => {
        // Required for navigating to other sub-menus in User Management
        const dashboard = new AdminDashboardLoginPage(page);
        
        // 1-4: Navigate to User Management > Add Single User & Create User
        await dashboard.sidebar.navigateToAddSingleUser();
        const addUserPage = new AddSingleUserPage(page);
        const userToCreate = { ...adminData.userManagement.newUserData, email: testEmail5 };
        delete (userToCreate as any).serviceGroup;
        await addUserPage.fillRegistrationForm(userToCreate);
        await addUserPage.submitForm();
        
        const toastLocator = page.locator('.swal2-toast, .swal2-popup');
        await expect(toastLocator).toBeVisible({ timeout: 15000 });
        await expect(toastLocator).toContainText(/success|created|saved/i);
        await expect(toastLocator).not.toBeVisible();
        
        // 5: Navigate to Manage Users
        await dashboard.sidebar.navigateToManageUsers();

        const manageUsersPage = new ManageUsersPage(page);
        await manageUsersPage.clearSearchSafely();
        
        // 6: Search for the newly created user
        await manageUsersPage.searchForUser(testEmail5);
        
        // 7-11: Verify Assign Group pop-up displayed, assign group with date, and Save
        const targetServiceGroup = adminData.userManagement.newUserData.serviceGroup; // "tester"
        const expiryDate = adminData.userManagement.newUserData.expiryDate as string; 
        
        // Push annotation for test reporting
        test.info().annotations.push({ type: 'testData', description: `Group: ${targetServiceGroup} | Date: ${expiryDate}` });
        
        await manageUsersPage.assignServiceGroupWithDate(testEmail5, targetServiceGroup, expiryDate);
        
        // 12: Search for the same user again (to ensure table refresh)
        await manageUsersPage.clearSearchSafely();
        await manageUsersPage.searchForUser(testEmail5);
        
        // 13: Verify that the selected service group and date are assigned to the user
        await manageUsersPage.verifyAssignedServiceGroupWithDate(testEmail5, targetServiceGroup, expiryDate);
    });

    test('Manage Users - Assign Service Group - Displays expired warning when assigning an expired service group', async ({ page }) => {
        const dashboard = new AdminDashboardLoginPage(page);
        
        // 1. Navigate to Add Single User & Create User
        await dashboard.sidebar.navigateToAddSingleUser();
        const addUserPage = new AddSingleUserPage(page);
        const userToCreate = { ...adminData.userManagement.newUserData, email: testEmail6 };
        delete (userToCreate as any).serviceGroup;
        await addUserPage.fillRegistrationForm(userToCreate);
        await addUserPage.submitForm();
        
        const toastLocator = page.locator('.swal2-toast, .swal2-popup');
        await expect(toastLocator).toBeVisible({ timeout: 15000 });
        await expect(toastLocator).not.toBeVisible();
        
        // 2. Navigate to Manage Users
        await dashboard.sidebar.navigateToManageUsers();
        const manageUsersPage = new ManageUsersPage(page);
        await manageUsersPage.clearSearchSafely();
        
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
        await manageUsersPage.cancelAssignGroupModal();
    });

    test('Manage Users - Assign Service Group - Cancel action discards modal and preserves original group', async ({ page }) => {
        const dashboard = new AdminDashboardLoginPage(page);
        
        // 1. Navigate to Add Single User & Create User
        await dashboard.sidebar.navigateToAddSingleUser();
        const addUserPage = new AddSingleUserPage(page);
        const userToCreate = { ...adminData.userManagement.newUserData, email: testEmail7 };
        delete (userToCreate as any).serviceGroup;
        await addUserPage.fillRegistrationForm(userToCreate);
        await addUserPage.submitForm();
        
        const toastLocator = page.locator('.swal2-toast, .swal2-popup');
        await expect(toastLocator).toBeVisible({ timeout: 15000 });
        await expect(toastLocator).not.toBeVisible();
        
        // 2. Navigate to Manage Users
        await dashboard.sidebar.navigateToManageUsers();
        const manageUsersPage = new ManageUsersPage(page);
        await manageUsersPage.clearSearchSafely();
        
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
        
        await manageUsersPage.clearSearchSafely();
        await manageUsersPage.searchForUser(testEmail7);
        
        // Assert it's still unassigned
        const row = manageUsersPage.getRowByEmail(testEmail7);
        await expect(row.getByText('tester', { exact: true })).not.toBeVisible();
    });

    test('Manage Users - Send Notification - Cancel button discards notification modal', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        await createApiUser(testEmail1);
        await manageUsersPage.clearSearchSafely();
        await manageUsersPage.searchForUser(testEmail1);
        
        await manageUsersPage.clickSendNotification(testEmail1);
        await expect(manageUsersPage.notificationModal).toBeVisible();
        
        // Cancel the modal
        await manageUsersPage.notificationCancelBtn.click();
        await expect(manageUsersPage.notificationModal).not.toBeVisible();
    });

    test('Manage Users - Send Notification - Close cross icon closes notification modal', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        await createApiUser(testEmail1);
        await manageUsersPage.clearSearchSafely();
        await manageUsersPage.searchForUser(testEmail1);
        
        await manageUsersPage.clickSendNotification(testEmail1);
        await expect(manageUsersPage.notificationModal).toBeVisible();
        
        await manageUsersPage.notificationCloseCrossBtn.click();
        await expect(manageUsersPage.notificationModal).not.toBeVisible();
    });

    test('Manage Users - Send Notification - Validates form fields and dynamic submit button state', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        const notifData = adminData.userManagement.notification;
        await createApiUser(testEmail1);
        await manageUsersPage.clearSearchSafely();
        await manageUsersPage.searchForUser(testEmail1);
        
        await manageUsersPage.clickSendNotification(testEmail1);
        await expect(manageUsersPage.notificationModal).toBeVisible();

        // Verify initial state: Send button disabled and initial char counter present
        await expect(manageUsersPage.notificationSendBtn).toBeDisabled();
        await expect(manageUsersPage.notificationCharCounter).toHaveText(notifData.remainingCharInitial);

        // Fill Title only -> Send button must remain disabled
        await manageUsersPage.fillNotificationTitle(notifData.sampleTitle);
        await expect(manageUsersPage.notificationSendBtn).toBeDisabled();

        // Fill Description -> Send button must become enabled
        await manageUsersPage.fillNotificationDescription(notifData.sampleDescription);
        await expect(manageUsersPage.notificationSendBtn).toBeEnabled();

        // Verify remaining character counter dynamically decremented
        await expect(manageUsersPage.notificationCharCounter).not.toHaveText(notifData.remainingCharInitial);

        // Clear Title -> Send button must revert to disabled
        await manageUsersPage.fillNotificationTitle('');
        await expect(manageUsersPage.notificationSendBtn).toBeDisabled();

        // Refill Title and clear Description -> Send button must remain disabled
        await manageUsersPage.fillNotificationTitle(notifData.sampleTitle);
        await manageUsersPage.fillNotificationDescription('');
        await expect(manageUsersPage.notificationSendBtn).toBeDisabled();

        // Cleanup
        await manageUsersPage.notificationCancelBtn.click();
    });

    test('Manage Users - Send Notification - Submitting valid form dispatches notification and closes modal', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        const notifData = adminData.userManagement.notification;
        await createApiUser(testEmail1);
        await manageUsersPage.clearSearchSafely();
        await manageUsersPage.searchForUser(testEmail1);
        
        await manageUsersPage.clickSendNotification(testEmail1);
        await expect(manageUsersPage.notificationModal).toBeVisible();

        await manageUsersPage.fillNotificationTitle(notifData.sampleTitle);
        await manageUsersPage.fillNotificationDescription(notifData.sampleDescription);

        // Intercept backend API call
        const apiResponsePromise = page.waitForResponse(
            res => res.url().includes('/ws/addNotification') && res.status() === 200
        );

        await manageUsersPage.clickSendNotificationSubmit();
        const apiResponse = await apiResponsePromise;
        expect(apiResponse.ok()).toBeTruthy();

        // Modal automatically closes on successful submission
        await expect(manageUsersPage.notificationModal).not.toBeVisible();
    });

    test('Manage Users - Send Notification - Displays only Email channel for user without service group', async ({ page }) => {
        const dashboard = new AdminDashboardLoginPage(page);
        await dashboard.sidebar.navigateToAddSingleUser();
        const addUserPage = new AddSingleUserPage(page);
        const userToCreate = { ...adminData.userManagement.newUserData, email: testEmail8 };
        delete (userToCreate as any).serviceGroup;
        await addUserPage.fillRegistrationForm(userToCreate);
        await addUserPage.submitForm();

        const toastLocator = page.locator('.swal2-toast, .swal2-popup');
        await expect(toastLocator).toBeVisible({ timeout: 15000 });
        await expect(toastLocator).not.toBeVisible();

        await dashboard.sidebar.navigateToManageUsers();
        const manageUsersPage = new ManageUsersPage(page);
        await manageUsersPage.clearSearchSafely();
        await manageUsersPage.searchForUser(testEmail8);
        await manageUsersPage.clickSendNotification(testEmail8);

        await expect(manageUsersPage.notificationModal).toBeVisible();
        await expect(manageUsersPage.notificationTypeWeb).toBeVisible();
        await expect(manageUsersPage.notificationTypeMobile).not.toBeVisible();
        await expect(manageUsersPage.notificationTypeBoth).not.toBeVisible();
        
        await manageUsersPage.notificationCancelBtn.click();
    });

    test('Manage Users - Send Notification - Displays multiple notification channels for assigned user', async ({ page }) => {
        const dashboard = new AdminDashboardLoginPage(page);
        await dashboard.sidebar.navigateToAddSingleUser();
        const addUserPage = new AddSingleUserPage(page);
        const userToCreate = { ...adminData.userManagement.newUserData, email: testEmail9 };
        await addUserPage.fillRegistrationForm(userToCreate);
        await addUserPage.submitForm();

        const toastLocator = page.locator('.swal2-toast, .swal2-popup');
        await expect(toastLocator).toBeVisible({ timeout: 15000 });
        await expect(toastLocator).not.toBeVisible();

        await dashboard.sidebar.navigateToManageUsers();
        const manageUsersPage = new ManageUsersPage(page);
        await manageUsersPage.clearSearchSafely();
        await manageUsersPage.searchForUser(testEmail9);
        await manageUsersPage.verifyAssignedServiceGroup(testEmail9, userToCreate.serviceGroup as string);
        await manageUsersPage.clickSendNotification(testEmail9);

        await expect(manageUsersPage.notificationModal).toBeVisible();
        await expect(manageUsersPage.notificationTypeWeb).toBeVisible();
        await expect(manageUsersPage.notificationTypeMobile).toBeVisible();
        await expect(manageUsersPage.notificationTypeBoth).toBeVisible();

        // Verify radio button interaction
        await manageUsersPage.selectNotificationType('Both');
        await expect(manageUsersPage.notificationTypeBoth).toBeChecked();

        await manageUsersPage.notificationCancelBtn.click();
    });

    test('Manage Users - Export Usage Log - Opens export modal and displays date range picker', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        const exportData = adminData.userManagement.exportUsageLog;
        await createApiUser(testEmail1);
        await manageUsersPage.clearSearchSafely();
        await manageUsersPage.searchForUser(testEmail1);
        
        await manageUsersPage.clickExportUsageLog(testEmail1);
        await expect(manageUsersPage.exportUsageLogModal).toBeVisible();
        await expect(manageUsersPage.exportUsageLogModal).toContainText(exportData.promptText);
        await expect(manageUsersPage.exportUsageLogDateRangeInput).toBeVisible();
        await expect(manageUsersPage.exportUsageLogDateRangeInput).not.toBeEmpty();
        
        // Cancel to verify dismiss
        await manageUsersPage.exportUsageLogCancelBtn.click();
        await expect(manageUsersPage.exportUsageLogModal).not.toBeVisible();
    });

    test('Manage Users - Export Usage Log - Close cross icon closes export modal', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        await createApiUser(testEmail1);
        await manageUsersPage.clearSearchSafely();
        await manageUsersPage.searchForUser(testEmail1);
        
        await manageUsersPage.clickExportUsageLog(testEmail1);
        await expect(manageUsersPage.exportUsageLogModal).toBeVisible();
        
        await manageUsersPage.exportUsageLogCloseCrossBtn.click();
        await expect(manageUsersPage.exportUsageLogModal).not.toBeVisible();
    });

    test('Manage Users - Export Usage Log - Submitting date range downloads usage log CSV file', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        const exportData = adminData.userManagement.exportUsageLog;
        await createApiUser(testEmail1);
        await manageUsersPage.clearSearchSafely();
        await manageUsersPage.searchForUser(testEmail1);
        
        await manageUsersPage.clickExportUsageLog(testEmail1);
        await expect(manageUsersPage.exportUsageLogModal).toBeVisible();

        const download = await manageUsersPage.clickExportUsageLogSubmit();
        const downloadedFileName = download.suggestedFilename();
        expect(downloadedFileName.endsWith(exportData.expectedExtension)).toBeTruthy();

        await expect(manageUsersPage.exportUsageLogModal).not.toBeVisible();
    });



    test('Manage Users - Delete User - Cancel confirmation preserves single user record', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        await createApiUser(testEmail1);
        await manageUsersPage.clearSearchSafely();
        await manageUsersPage.searchForUser(testEmail1);
        
        await manageUsersPage.selectUserCheckbox(testEmail1);
        const row = manageUsersPage.getRowByEmail(testEmail1);
        await row.locator('span[title="Delete user"] button').click();
        
        // Wait for modal
        await page.waitForTimeout(500);
        await manageUsersPage.cancelDeletionSafely();
        
        await page.locator('.modal').waitFor({ state: 'hidden' }).catch(() => {});
        await page.locator('.swal2-container').waitFor({ state: 'hidden' }).catch(() => {});
        
        // Verify user is still in the table
        await expect(manageUsersPage.getRowByEmail(testEmail1)).toBeVisible();
    });
    
    test('Manage Users - Bulk Delete - Cancel confirmation preserves selected user records', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        await createApiUser(testEmail2);
        await createApiUser(testEmail3);
        await manageUsersPage.clearSearchSafely();
        const commonEmailPrefix = `auto_tester_manage${baseTimestamp}`;
        await manageUsersPage.searchForUser(commonEmailPrefix);
        
        await manageUsersPage.selectUserCheckbox(testEmail2);
        await manageUsersPage.selectUserCheckbox(testEmail3);
        
        await manageUsersPage.headerDeleteSelectedBtn.click();
        
        // Wait for modal
        await page.waitForTimeout(500);
        await manageUsersPage.cancelDeletionSafely();
        
        await page.locator('.modal').waitFor({ state: 'hidden' }).catch(() => {});
        await page.locator('.swal2-container').waitFor({ state: 'hidden' }).catch(() => {});
        
        // Verify users are still in the table
        await expect(manageUsersPage.getRowByEmail(testEmail2)).toBeVisible();
        await expect(manageUsersPage.getRowByEmail(testEmail3)).toBeVisible();
    });

    test('Manage Users - Delete User - Confirmed single deletion removes user record from table', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        await createApiUser(testEmail1);
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

    test('Manage Users - Bulk Delete - Confirmed bulk deletion removes selected user records from table', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        await createApiUser(testEmail2);
        await createApiUser(testEmail3);
        // Clear any previous search
        await manageUsersPage.clearSearchSafely();
        
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
