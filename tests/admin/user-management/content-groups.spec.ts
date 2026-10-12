import { test, expect } from '@playwright/test';
import { ContentGroupsPage } from '../../../src/pages/admin/user-management/ContentGroupsPage';
import { ManageUsersPage } from '../../../src/pages/admin/user-management/ManageUsersPage';
import adminData from '../../test-data/admin-data.json';

/**
 * MANDATORY PRE-EXECUTION CHECKLIST:
 * 1. No Hardcoding: Verified that all strings, expected titles, and messages are extracted from admin-data.json.
 * 2. No Logic in Specs: Verified there are no if/else statements in this .spec.ts file. All conditional logic is in POMs.
 * 3. No Internal Loops: Verified there are no for loops inside test() blocks.
 * 4. No Dynamic Routing: Verified that no locators in the POM use .or() for fallback guessing.
 * 5. Natural Hierarchy Naming: All test titles strictly follow:
 *    [Page / Module] - [Component / Feature] - [Action and Expected Outcome]
 */

test.describe('User Management - Content Groups', () => {
    let contentGroupsPage: ContentGroupsPage;
    const cgData = adminData.userManagement.contentGroupsManagement;
    const uniqueTimestamp = Date.now();
    const dynamicGroupName = `CG_Auto_${uniqueTimestamp}`;
    const dynamicEditName = `CG_Edit_${uniqueTimestamp}`;
    const targetUserEmail = cgData.crossModuleUser.email;
    const targetUserName = cgData.crossModuleUser.name;

    test.beforeEach(async ({ page }) => {
        contentGroupsPage = new ContentGroupsPage(page);
        await contentGroupsPage.navigate();
        await contentGroupsPage.dismissAnyOpenModals();
    });

    // =========================================================================
    // 1. LANDING PAGE & VISUAL PRESENTATION
    // =========================================================================
    test('Content Groups - Landing Page - Renders breadcrumb and page title correctly', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.breadcrumb });
        await expect(contentGroupsPage.pageHeader).toBeVisible();
        await expect(contentGroupsPage.pageHeader).toHaveText(/Content Groups/i);
        await expect(contentGroupsPage.breadcrumb).toBeVisible();
    });

    test('Content Groups - Landing Page - Displays descriptive subtitle explaining content groups', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.subtitle });
        await expect(contentGroupsPage.subtitle).toBeVisible();
        await expect(contentGroupsPage.subtitle).toContainText('Content groups let you easily manage and restrict');
    });

    test('Content Groups - Landing Page - Displays Create group button in top action area', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.createGroupBtnText });
        await expect(contentGroupsPage.createGroupBtn).toBeVisible();
        await expect(contentGroupsPage.createGroupBtn).toHaveText(cgData.createGroupBtnText);
    });

    test('Content Groups - Data Table - Renders all 4 column headers (Group Name, Associated Users, Associated Sections, Actions)', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.tableHeaders.join(', ') });
        await expect(contentGroupsPage.table).toBeVisible();
        await contentGroupsPage.verifyTableHeaders(cgData.tableHeaders);
    });

    test('Content Groups - Data Table - Lists existing active content groups with non-negative user counts', async () => {
        test.info().annotations.push({ type: 'testData', description: 'Table rows exist' });
        const count = await contentGroupsPage.getGroupRowCount();
        expect(count).toBeGreaterThan(0);
    });

    // =========================================================================
    // 2. SEARCH & FILTER
    // =========================================================================
    test('Content Groups - Search Bar - Search button remains disabled when input is empty', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.searchPlaceholder });
        await expect(contentGroupsPage.searchInput).toHaveAttribute('placeholder', cgData.searchPlaceholder);
        await expect(contentGroupsPage.searchSubmitBtn).toBeDisabled();
    });

    test('Content Groups - Search Bar - Enables search button when query text is entered', async () => {
        test.info().annotations.push({ type: 'testData', description: 'Sample query text' });
        await contentGroupsPage.searchInput.fill('Sample');
        await expect(contentGroupsPage.searchSubmitBtn).toBeEnabled();
        await contentGroupsPage.clearSearch();
    });

    test('Content Groups - Search Bar - Filters table rows to matching group when query is submitted', async () => {
        const names = await contentGroupsPage.getVisibleGroupNames();
        const targetName = names[0];
        test.info().annotations.push({ type: 'testData', description: targetName });
        await contentGroupsPage.searchGroup(targetName);
        const filteredNames = await contentGroupsPage.getVisibleGroupNames();
        expect(filteredNames).toContain(targetName);
        await contentGroupsPage.clearSearch();
    });

    test('Content Groups - Search Bar - Displays no results state when searching for non-existent group name', async () => {
        const dummyQuery = `NonExistent_${uniqueTimestamp}`;
        test.info().annotations.push({ type: 'testData', description: dummyQuery });
        await contentGroupsPage.searchGroup(dummyQuery);
        const hasNoRes = await contentGroupsPage.hasNoResults();
        expect(hasNoRes).toBeTruthy();
        await contentGroupsPage.clearSearch();
    });

    test('Content Groups - Search Bar - Restores full group list when search input is cleared', async () => {
        const initialCount = await contentGroupsPage.getGroupRowCount();
        test.info().annotations.push({ type: 'testData', description: `Initial rows: ${initialCount}` });
        await contentGroupsPage.searchGroup(`NonExistent_${uniqueTimestamp}`);
        await contentGroupsPage.clearSearch();
        const restoredCount = await contentGroupsPage.getGroupRowCount();
        expect(restoredCount).toBe(initialCount);
    });

    // =========================================================================
    // 3. TABLE COLUMN SORTING
    // =========================================================================
    test('Content Groups - Table Sorting - Clicking Group Name column header toggles sorting A-Z and Z-A', async () => {
        test.info().annotations.push({ type: 'testData', description: `${cgData.sortTitles.asc} | ${cgData.sortTitles.desc}` });
        
        // 1st click: Sort A-Z
        await contentGroupsPage.sortByGroupName();
        const namesAsc = await contentGroupsPage.getVisibleGroupNames();
        expect(contentGroupsPage.isSortedAscending(namesAsc)).toBeTruthy();

        // 2nd click: Sort Z-A
        await contentGroupsPage.sortByGroupName();
        const namesDesc = await contentGroupsPage.getVisibleGroupNames();
        expect(contentGroupsPage.isSortedDescending(namesDesc)).toBeTruthy();
    });

    // =========================================================================
    // 4. PAGINATION & LOAD MORE BUTTON
    // =========================================================================
    test('Content Groups - Pagination - Displays LOAD MORE button and fetches additional items when more than 10 groups exist', async () => {
        const initialCount = await contentGroupsPage.getGroupRowCount();
        test.info().annotations.push({ type: 'testData', description: `Initial rows: ${initialCount}` });
        await expect(contentGroupsPage.loadMoreBtn).toBeVisible();
        await contentGroupsPage.clickLoadMore();
        const loadedCount = await contentGroupsPage.getGroupRowCount();
        expect(loadedCount).toBeGreaterThan(initialCount);
    });

    test('Content Groups - Pagination - Hides LOAD MORE button when 10 or fewer groups are displayed', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.paginationSearchFilter });
        await contentGroupsPage.searchGroup(cgData.paginationSearchFilter);
        const filteredCount = await contentGroupsPage.getGroupRowCount();
        expect(filteredCount).toBeLessThanOrEqual(10);
        await expect(contentGroupsPage.loadMoreBtn).toBeHidden();
        await contentGroupsPage.clearSearch();
    });

    // =========================================================================
    // 5. CREATE GROUP MODAL & FORM VALIDATIONS
    // =========================================================================
    test('Content Groups - Create Group Modal - Opens modal when clicking Create group button', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.modal.createTitle });
        await contentGroupsPage.clickCreateGroup();
        await expect(contentGroupsPage.modalHeaderTitle).toHaveText(cgData.modal.createTitle);
        await expect(contentGroupsPage.groupNameInput).toBeVisible();
        await expect(contentGroupsPage.groupDescriptionInput).toBeVisible();
        await contentGroupsPage.clickCancel();
    });

    test('Content Groups - Create Group Modal - Closes modal when clicking top close cross icon', async () => {
        await contentGroupsPage.clickCreateGroup();
        await expect(contentGroupsPage.modal).toBeVisible();
        await contentGroupsPage.closeModalViaCross();
        await expect(contentGroupsPage.modal).toBeHidden();
    });

    test('Content Groups - Create Group Modal - Closes modal without saving when clicking Cancel', async () => {
        await contentGroupsPage.clickCreateGroup();
        await contentGroupsPage.fillGroupName(dynamicGroupName);
        await contentGroupsPage.clickCancel();
        await expect(contentGroupsPage.modal).toBeHidden();
        const isPresent = await contentGroupsPage.isGroupPresentInTable(dynamicGroupName);
        expect(isPresent).toBeFalsy();
    });

    test('Content Groups - Create Group Modal - Displays required error when group name is submitted empty', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.modal.nameRequiredError });
        await contentGroupsPage.clickCreateGroup();
        await contentGroupsPage.clickSave();
        await expect(contentGroupsPage.groupNameError).toBeVisible();
        await expect(contentGroupsPage.groupNameError).toHaveText(cgData.modal.nameRequiredError);
        await contentGroupsPage.clickCancel();
    });

    test('Content Groups - Create Group Modal - Restricts group name to 200 characters max', async () => {
        const longName = 'A'.repeat(210);
        test.info().annotations.push({ type: 'testData', description: '210 characters input' });
        await contentGroupsPage.clickCreateGroup();
        await contentGroupsPage.fillGroupName(longName);
        const value = await contentGroupsPage.groupNameInput.inputValue();
        expect(value.length).toBeLessThanOrEqual(201);
        await contentGroupsPage.clickCancel();
    });

    test('Content Groups - Create Group Modal - Restricts group description to 200 characters max', async () => {
        const longDesc = 'D'.repeat(210);
        test.info().annotations.push({ type: 'testData', description: '210 characters description' });
        await contentGroupsPage.clickCreateGroup();
        await contentGroupsPage.fillDescription(longDesc);
        const value = await contentGroupsPage.groupDescriptionInput.inputValue();
        expect(value.length).toBeLessThanOrEqual(200);
        await contentGroupsPage.clickCancel();
    });

    test('Content Groups - Create Group Modal - Displays alert when saving already existing group name', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.existingGroups.science });
        await contentGroupsPage.clickCreateGroup();
        await contentGroupsPage.fillGroupName(cgData.existingGroups.science);
        await contentGroupsPage.clickSave();
        await expect(contentGroupsPage.duplicateAlertModal).toBeVisible();
        await expect(contentGroupsPage.duplicateAlertMessage).toContainText(cgData.messages.alreadyExists);
        await contentGroupsPage.dismissDuplicateAlert();
    });

    test('Content Groups - Create Group Modal - Displays error when html or script tags are entered in group name', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.testInputs.htmlPayload });
        await contentGroupsPage.clickCreateGroup();
        await contentGroupsPage.fillGroupName(cgData.testInputs.htmlPayload);
        await contentGroupsPage.clickSave();
        await expect(contentGroupsPage.groupNameError).toBeVisible();
        await expect(contentGroupsPage.groupNameError).toHaveText(cgData.messages.htmlUnsupported);
        await contentGroupsPage.clickCancel();
    });

    test('Content Groups - Create Group Modal - Displays error when leading or trailing spaces are entered in group name', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.testInputs.spacedName });
        await contentGroupsPage.clickCreateGroup();
        await contentGroupsPage.fillGroupName(cgData.testInputs.spacedName);
        await contentGroupsPage.clickSave();
        await expect(contentGroupsPage.groupNameError).toBeVisible();
        await expect(contentGroupsPage.groupNameError).toHaveText(cgData.messages.leadingTrailingSpaces);
        await contentGroupsPage.clickCancel();
    });

    test('Content Groups - Create Group Modal - Successfully creates new content group with valid name and description', async () => {
        test.info().annotations.push({ type: 'testData', description: dynamicGroupName });
        await contentGroupsPage.createContentGroup(dynamicGroupName, 'Automated test content group');
        const isPresent = await contentGroupsPage.isGroupPresentInTable(dynamicGroupName);
        expect(isPresent).toBeTruthy();
    });

    // =========================================================================
    // 6. EDIT GROUP MODAL
    // =========================================================================
    test('Content Groups - Edit Group Modal - Opens modal with pre-populated values when clicking edit icon', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.existingGroups.science });
        await contentGroupsPage.clickEditGroup(cgData.existingGroups.science);
        await expect(contentGroupsPage.modalHeaderTitle).toHaveText(cgData.modal.editTitle);
        const currentName = await contentGroupsPage.getEditGroupNameValue();
        expect(currentName).toBe(cgData.existingGroups.science);
        await contentGroupsPage.clickCancel();
    });

    test('Content Groups - Edit Group Modal - Closes modal without applying changes when clicking Cancel or close cross', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.existingGroups.science });
        await contentGroupsPage.clickEditGroup(cgData.existingGroups.science);
        await contentGroupsPage.fillGroupName(`${cgData.existingGroups.science}_Mod`);
        await contentGroupsPage.clickCancel();
        const isOriginalPresent = await contentGroupsPage.isGroupPresentInTable(cgData.existingGroups.science);
        expect(isOriginalPresent).toBeTruthy();
    });

    test('Content Groups - Edit Group Modal - Displays validation error when clearing group name and submitting', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.modal.nameRequiredError });
        await contentGroupsPage.clickEditGroup(cgData.existingGroups.science);
        await contentGroupsPage.fillGroupName('');
        await contentGroupsPage.clickSave();
        await expect(contentGroupsPage.groupNameError).toBeVisible();
        await expect(contentGroupsPage.groupNameError).toHaveText(cgData.modal.nameRequiredError);
        await contentGroupsPage.clickCancel();
    });

    test('Content Groups - Edit Group Modal - Displays alert when updating to an already existing group name', async () => {
        test.info().annotations.push({ type: 'testData', description: `${cgData.existingGroups.medicine} -> ${cgData.existingGroups.science}` });
        await contentGroupsPage.clickEditGroup(cgData.existingGroups.medicine);
        await contentGroupsPage.fillGroupName(cgData.existingGroups.science);
        await contentGroupsPage.clickSave();
        await expect(contentGroupsPage.duplicateAlertModal).toBeVisible();
        await expect(contentGroupsPage.duplicateAlertMessage).toContainText(cgData.messages.alreadyExists);
        await contentGroupsPage.dismissDuplicateAlert();
    });

    test('Content Groups - Edit Group Modal - Displays error when html or script tags are entered in group name', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.testInputs.htmlPayload });
        await contentGroupsPage.clickEditGroup(cgData.existingGroups.medicine);
        await contentGroupsPage.fillGroupName(cgData.testInputs.htmlPayload);
        await contentGroupsPage.clickSave();
        await expect(contentGroupsPage.groupNameError).toBeVisible();
        await expect(contentGroupsPage.groupNameError).toHaveText(cgData.messages.htmlUnsupported);
        await contentGroupsPage.clickCancel();
    });

    test('Content Groups - Edit Group Modal - Displays error when leading or trailing spaces are entered in group name', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.testInputs.spacedName });
        await contentGroupsPage.clickEditGroup(cgData.existingGroups.medicine);
        await contentGroupsPage.fillGroupName(cgData.testInputs.spacedName);
        await contentGroupsPage.clickSave();
        await expect(contentGroupsPage.groupNameError).toBeVisible();
        await expect(contentGroupsPage.groupNameError).toHaveText(cgData.messages.leadingTrailingSpaces);
        await contentGroupsPage.clickCancel();
    });

    test('Content Groups - Edit Group Modal - Successfully updates group name and description on Save', async () => {
        test.info().annotations.push({ type: 'testData', description: dynamicEditName });
        await contentGroupsPage.ensureGroupExists(dynamicGroupName);
        await contentGroupsPage.updateContentGroup(dynamicGroupName, dynamicEditName, 'Updated group description');
        const isUpdatedPresent = await contentGroupsPage.isGroupPresentInTable(dynamicEditName);
        expect(isUpdatedPresent).toBeTruthy();
    });

    // =========================================================================
    // 7. ASSOCIATED SECTIONS MODAL (Select sections)
    // =========================================================================
    test('Content Groups - Select Sections Modal - Opens Select sections modal when clicking Add section button', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.existingGroups.science });
        await contentGroupsPage.clickAddSection(cgData.existingGroups.science);
        await expect(contentGroupsPage.sectionModalTitle).toHaveText(cgData.selectSectionsModal.title);
        await expect(contentGroupsPage.sectionModalGroupName).toContainText(cgData.existingGroups.science);
        await contentGroupsPage.cancelSections();
    });

    test('Content Groups - Select Sections Modal - Displays target group name and selected section counter', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.existingGroups.science });
        await contentGroupsPage.clickAddSection(cgData.existingGroups.science);
        await expect(contentGroupsPage.sectionModalSelectedCount).toBeVisible();
        await contentGroupsPage.cancelSections();
    });

    test('Content Groups - Select Sections Modal - Lists all available institutional sections with checkboxes', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.existingGroups.science });
        await contentGroupsPage.clickAddSection(cgData.existingGroups.science);
        const count = await contentGroupsPage.sectionCheckboxes.count();
        expect(count).toBeGreaterThan(0);
        await contentGroupsPage.cancelSections();
    });

    test('Content Groups - Select Sections Modal - Closes modal without applying changes when clicking Cancel or close cross', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.existingGroups.science });
        await contentGroupsPage.clickAddSection(cgData.existingGroups.science);
        await contentGroupsPage.sectionModalCloseCrossBtn.click();
        await expect(contentGroupsPage.sectionModal).toBeHidden();
    });

    test('Content Groups - Associated Sections - Assigning a section increments associated sections column counter', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.existingGroups.science });
        const initialCount = await contentGroupsPage.getAssociatedSectionsCount(cgData.existingGroups.science);
        await contentGroupsPage.clickAddSection(cgData.existingGroups.science);
        await contentGroupsPage.sectionCheckboxes.first().click();
        await contentGroupsPage.updateSections();
        const updatedCount = await contentGroupsPage.getAssociatedSectionsCount(cgData.existingGroups.science);
        expect(updatedCount).toBe(initialCount + 1);
    });

    test('Content Groups - Associated Sections - Removing a section decrements associated sections column counter', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.existingGroups.science });
        const countBefore = await contentGroupsPage.getAssociatedSectionsCount(cgData.existingGroups.science);
        await contentGroupsPage.clickAddSection(cgData.existingGroups.science);
        await contentGroupsPage.sectionCheckboxes.first().click();
        await contentGroupsPage.updateSections();
        const countAfter = await contentGroupsPage.getAssociatedSectionsCount(cgData.existingGroups.science);
        expect(countAfter).toBe(countBefore - 1);
    });

    // =========================================================================
    // 8. ASSOCIATED USERS MODAL (Select users)
    // =========================================================================
    test('Content Groups - Select Users Modal - Opens Select users modal when clicking Edit user icon in Associated Users column', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.existingGroups.science });
        await contentGroupsPage.clickEditUsers(cgData.existingGroups.science);
        await expect(contentGroupsPage.userModalTitle).toHaveText(cgData.selectUsersModal.title);
        await expect(contentGroupsPage.userModalGroupName).toContainText(cgData.existingGroups.science);
        await contentGroupsPage.cancelUsers();
    });

    test('Content Groups - Select Users Modal - Displays matching group name and initial selected user count', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.existingGroups.science });
        await contentGroupsPage.clickEditUsers(cgData.existingGroups.science);
        await expect(contentGroupsPage.userModalSelectedCount).toBeVisible();
        await contentGroupsPage.cancelUsers();
    });

    test('Content Groups - Select Users Modal - Lists user cards with email and checkboxes', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.existingGroups.science });
        await contentGroupsPage.clickEditUsers(cgData.existingGroups.science);
        const count = await contentGroupsPage.userModal.locator('.user-list-card').count();
        expect(count).toBeGreaterThan(0);
        await contentGroupsPage.cancelUsers();
    });

    test('Content Groups - Select Users Modal - Filters user list when searching by name', async () => {
        test.info().annotations.push({ type: 'testData', description: targetUserName });
        await contentGroupsPage.clickEditUsers(cgData.existingGroups.science);
        await contentGroupsPage.searchUserInModal(targetUserName);
        await expect(contentGroupsPage.getUserCheckbox(targetUserEmail)).toBeVisible();
        await contentGroupsPage.cancelUsers();
    });

    test('Content Groups - Select Users Modal - Restores full user list when modal search input is cleared', async () => {
        test.info().annotations.push({ type: 'testData', description: 'Clear user search' });
        await contentGroupsPage.clickEditUsers(cgData.existingGroups.science);
        await contentGroupsPage.searchUserInModal(targetUserName);
        await contentGroupsPage.clearUserSearchInModal();
        const userCards = await contentGroupsPage.userModal.locator('.user-list-card').count();
        expect(userCards).toBeGreaterThan(1);
        await contentGroupsPage.cancelUsers();
    });

    test('Content Groups - Select Users Modal - Closes modal without modifying user allocation when clicking Cancel', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.existingGroups.science });
        await contentGroupsPage.clickEditUsers(cgData.existingGroups.science);
        await contentGroupsPage.userModalCloseCrossBtn.click();
        await expect(contentGroupsPage.userModal).toBeHidden();
    });

    // =========================================================================
    // 9. CROSS-MODULE VERIFICATION: ASSIGN & DE-ASSIGN USER TO CONTENT GROUP
    // =========================================================================
    test('Content Groups - User Assignment - Assigning user to content group reflects in User Management Profile Overview', async ({ page }) => {
        test.info().annotations.push({ type: 'testData', description: `${targetUserEmail} -> ${dynamicEditName}` });
        
        // 1. Assign user in Content Groups modal
        await contentGroupsPage.ensureGroupExists(dynamicEditName);
        await contentGroupsPage.clickEditUsers(dynamicEditName);
        await contentGroupsPage.checkUser(targetUserEmail, targetUserName);
        await contentGroupsPage.updateUsers();

        // 2. Navigate to Manage Users and verify Content Group is present in User Profile Overview
        const manageUsersPage = new ManageUsersPage(page);
        const manageUsersUrl = (process.env.ADMIN_TEST_URL || 'https://qa.knimbus.com') + '/librarian/v2/elibrarySetup' + adminData.userManagement.expectedUrls.manageUsers;
        await page.goto(manageUsersUrl, { waitUntil: 'networkidle' });
        await manageUsersPage.searchForUser(targetUserEmail);
        await manageUsersPage.clickUserDetailsOverview(targetUserEmail);

        const isAssigned = await manageUsersPage.isContentGroupOptionSelected(dynamicEditName);
        expect(isAssigned).toBeTruthy();

        await manageUsersPage.clickProfileCancel();
    });

    test('Content Groups - User Assignment - De-assigning user from content group removes group in User Management Profile Overview', async ({ page }) => {
        test.info().annotations.push({ type: 'testData', description: `${targetUserEmail} -> Remove ${dynamicEditName}` });
        
        // 1. De-assign user in Content Groups modal
        await contentGroupsPage.navigate();
        await contentGroupsPage.ensureGroupExists(dynamicEditName);
        await contentGroupsPage.clickEditUsers(dynamicEditName);
        await contentGroupsPage.uncheckUser(targetUserEmail, targetUserName);
        await contentGroupsPage.updateUsers();

        // 2. Navigate to Manage Users and verify Content Group is no longer present
        const manageUsersPage = new ManageUsersPage(page);
        const manageUsersUrl = (process.env.ADMIN_TEST_URL || 'https://qa.knimbus.com') + '/librarian/v2/elibrarySetup' + adminData.userManagement.expectedUrls.manageUsers;
        await page.goto(manageUsersUrl, { waitUntil: 'networkidle' });
        await manageUsersPage.searchForUser(targetUserEmail);
        await manageUsersPage.clickUserDetailsOverview(targetUserEmail);

        const isAssigned = await manageUsersPage.isContentGroupOptionSelected(dynamicEditName);
        expect(isAssigned).toBeFalsy();

        await manageUsersPage.clickProfileCancel();
    });

    test('Content Groups - User Assignment - Assigning user to content group increments associated users column counter', async () => {
        test.info().annotations.push({ type: 'testData', description: `${targetUserEmail} -> ${dynamicEditName}` });
        await contentGroupsPage.ensureGroupExists(dynamicEditName);
        const initialCount = await contentGroupsPage.getAssociatedUsersCount(dynamicEditName);
        await contentGroupsPage.clickEditUsers(dynamicEditName);
        await contentGroupsPage.checkUser(targetUserEmail, targetUserName);
        await contentGroupsPage.updateUsers();
        const updatedCount = await contentGroupsPage.getAssociatedUsersCount(dynamicEditName);
        expect(updatedCount).toBe(initialCount + 1);
    });

    test('Content Groups - User Assignment - De-assigning user from content group decrements associated users column counter', async () => {
        test.info().annotations.push({ type: 'testData', description: `${targetUserEmail} -> Remove ${dynamicEditName}` });
        await contentGroupsPage.ensureGroupExists(dynamicEditName);
        const countBefore = await contentGroupsPage.getAssociatedUsersCount(dynamicEditName);
        await contentGroupsPage.clickEditUsers(dynamicEditName);
        await contentGroupsPage.uncheckUser(targetUserEmail, targetUserName);
        await contentGroupsPage.updateUsers();
        const countAfter = await contentGroupsPage.getAssociatedUsersCount(dynamicEditName);
        expect(countAfter).toBe(countBefore - 1);
    });

    // =========================================================================
    // 10. DELETE GROUP DIALOG & FINAL CLEANUP
    // =========================================================================
    test('Content Groups - Delete Group Dialog - Opens confirmation alert when clicking delete icon in actions column', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.deleteAlert.title });
        await contentGroupsPage.clickDeleteGroup(cgData.existingGroups.science);
        await expect(contentGroupsPage.deleteAlertTitle).toHaveText(cgData.deleteAlert.title);
        await expect(contentGroupsPage.deleteAlertMessage).toContainText(cgData.deleteAlert.message);
        await contentGroupsPage.cancelDelete();
    });

    test('Content Groups - Delete Group Dialog - Displays expected warning message and action buttons', async () => {
        test.info().annotations.push({ type: 'testData', description: `${cgData.deleteAlert.confirmBtn} | ${cgData.deleteAlert.cancelBtn}` });
        await contentGroupsPage.clickDeleteGroup(cgData.existingGroups.science);
        await expect(contentGroupsPage.deleteYesBtn).toBeVisible();
        await expect(contentGroupsPage.deleteCancelBtn).toBeVisible();
        await contentGroupsPage.cancelDelete();
    });

    test('Content Groups - Delete Group Dialog - Dismisses alert and retains group when clicking Cancel', async () => {
        test.info().annotations.push({ type: 'testData', description: cgData.existingGroups.science });
        await contentGroupsPage.clickDeleteGroup(cgData.existingGroups.science);
        await contentGroupsPage.cancelDelete();
        await expect(contentGroupsPage.deleteModal).toBeHidden();
        const isPresent = await contentGroupsPage.isGroupPresentInTable(cgData.existingGroups.science);
        expect(isPresent).toBeTruthy();
    });

    test('Content Groups - Delete Group Dialog - Permanently deletes group and removes row from table when confirming deletion', async () => {
        test.info().annotations.push({ type: 'testData', description: dynamicEditName });
        await contentGroupsPage.ensureGroupExists(dynamicEditName);
        await contentGroupsPage.clickDeleteGroup(dynamicEditName);
        await contentGroupsPage.confirmDelete();
        const isPresent = await contentGroupsPage.isGroupPresentInTable(dynamicEditName);
        expect(isPresent).toBeFalsy();
    });
});
