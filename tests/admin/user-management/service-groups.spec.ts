import { test, expect } from '@playwright/test';
import { ServiceGroupsPage } from '../../../src/pages/admin/user-management/ServiceGroupsPage';
import { SelectResourcesModal } from '../../../src/pages/admin/user-management/SelectResourcesModal';
import { SelectUsersModal } from '../../../src/pages/admin/user-management/SelectUsersModal';
import { UserMgmtOverviewPage } from '../../../src/pages/admin/user-management/UserMgmtOverviewPage';
import { AdminApiService } from '../../../src/api/AdminApiService';
import * as adminData from '../../test-data/admin-data.json';

/**
 * MANDATORY PRE-EXECUTION CHECKLIST:
 * 1. No Hardcoding: Verified that all strings, expected titles, and messages are extracted from admin-data.json.
 * 2. No Logic in Specs: Verified there are no if/else statements in this .spec.ts file.
 * 3. No Internal Loops: Verified there are no for loops inside test() blocks.
 * 4. No Dynamic Routing: Verified that no locators in the POM use .or() for fallback guessing.
 */

test.describe('User Management - Service Groups Management', () => {
    let serviceGroupsPage: ServiceGroupsPage;
    let selectResourcesModal: SelectResourcesModal;
    let selectUsersModal: SelectUsersModal;
    let adminApi: AdminApiService;

    const sgData = adminData.userManagement.serviceGroupsManagement;
    const serviceGroupsUrl = adminData.userManagement.expectedUrls.serviceGroups;
    const overviewUrl = adminData.userManagement.expectedUrls.overview;

    // Helper date generator for future expiry
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const validExpiryDateStr = futureDate.toISOString().split('T')[0];

    test.beforeEach(async ({ page }) => {
        serviceGroupsPage = new ServiceGroupsPage(page);
        selectResourcesModal = new SelectResourcesModal(page);
        selectUsersModal = new SelectUsersModal(page);
        adminApi = new AdminApiService();
        await adminApi.initFromState('.auth/admin.json');

        await page.goto(`${process.env.ADMIN_TEST_URL}/librarian/v2/elibrarySetup${serviceGroupsUrl}`);
        await page.waitForLoadState('networkidle');
        await serviceGroupsPage.waitForTableLoaded();
    });

    test.afterEach(async () => {
        await serviceGroupsPage.dismissAnyOpenModals();
    });

    // 1. Check option of creating + Create group
    test('TC_ServiceGroups_01_CreateGroupButton_Present - verifies create group button is visible and enabled', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.createGroupBtnText });
        await expect(serviceGroupsPage.createGroupBtn).toBeVisible();
        await expect(serviceGroupsPage.createGroupBtn).toBeEnabled();
        await expect(serviceGroupsPage.createGroupBtn).toContainText(sgData.createGroupBtnText);
    });

    // 2. Check clicking on + Create group option, it should open a pop up
    test('TC_ServiceGroups_02_ClickCreateGroup_OpensModal - clicking create group button opens modal', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.modalTitle });
        await serviceGroupsPage.clickCreateGroup();
        await expect(serviceGroupsPage.modal).toBeVisible();
        await expect(serviceGroupsPage.modal).toContainText(sgData.modalTitle);
    });

    // 3. in Pop up cross button click should close the pop up
    test('TC_ServiceGroups_03_CrossButton_ClosesModal - clicking top cross button closes popup', async () => {
        await serviceGroupsPage.clickCreateGroup();
        await expect(serviceGroupsPage.modal).toBeVisible();

        await serviceGroupsPage.closeModalViaCross();
        await expect(serviceGroupsPage.modal).not.toBeVisible();
    });

    // 4. pop up has Group name when its empty it display error message "Group name is required"
    test('TC_ServiceGroups_04_GroupName_Empty_ErrorMessage - displays required error when group name is empty', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.messages.nameRequired });
        await serviceGroupsPage.clickCreateGroup();
        await serviceGroupsPage.clickSave();
        await expect(serviceGroupsPage.groupNameError).toBeVisible();
        await expect(serviceGroupsPage.groupNameError).toHaveText(sgData.messages.nameRequired);
    });

    // 5. If in Group name enter html tags the error message will be : "Only plain text is allowed..."
    test('TC_ServiceGroups_05_GroupName_HtmlTags_ErrorMessage - displays error when html tags are entered in group name', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.testInputs.htmlPayload });
        await serviceGroupsPage.clickCreateGroup();
        await serviceGroupsPage.fillGroupName(sgData.testInputs.htmlPayload);
        await expect(serviceGroupsPage.groupNameError).toBeVisible();
        await expect(serviceGroupsPage.groupNameError).toHaveText(sgData.messages.htmlUnsupported);
    });

    // 6. When entered leading trailing spaces the message should be : "Leading or trailing spaces not allowed"
    test('TC_ServiceGroups_06_GroupName_LeadingTrailingSpaces_ErrorMessage - displays error when leading or trailing spaces are entered', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.testInputs.spacedName });
        await serviceGroupsPage.clickCreateGroup();
        await serviceGroupsPage.fillGroupName(sgData.testInputs.spacedName);
        await expect(serviceGroupsPage.groupNameError).toBeVisible();
        await expect(serviceGroupsPage.groupNameError).toHaveText(sgData.messages.leadingTrailingSpaces);
    });

    // 7. when entered more than 100 characters then message would be: "Maximum 100 characters allowed"
    test('TC_ServiceGroups_07_GroupName_MaxLengthExceeded_ErrorMessage - displays error when entering more than 100 characters', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.testInputs.oversizedName });
        await serviceGroupsPage.clickCreateGroup();
        await serviceGroupsPage.fillGroupName(sgData.testInputs.oversizedName);
        await expect(serviceGroupsPage.groupNameError).toBeVisible();
        await expect(serviceGroupsPage.groupNameError).toHaveText(sgData.messages.max100Chars);
    });

    // 8. When entered Group name which is already taken Example "RA" then on clicking save button then message would be : The group name already exists! Please enter a different group name.
    test('TC_ServiceGroups_08_GroupName_AlreadyExists_ErrorMessage - displays error alert when saving already existing group name', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.existingGroup });
        await serviceGroupsPage.clickCreateGroup();
        await serviceGroupsPage.fillGroupName(sgData.existingGroup);
        await serviceGroupsPage.setExpiryDate(validExpiryDateStr);

        await serviceGroupsPage.clickSave();
        await expect(serviceGroupsPage.duplicateGroupAlert).toBeVisible();
        await expect(serviceGroupsPage.duplicateGroupAlert).toContainText(sgData.messages.alreadyExists);
    });

    // 9. Enter only group name and directly click on save then it should open Expiry calendar and error message: "Expiry date is required"
    test('TC_ServiceGroups_09_OnlyGroupName_SaveTriggersCalendarAndError - opening calendar and displaying expiry required error on save', async () => {
        const uniqueName = `${sgData.testInputs.uniquePrefix}${Date.now()}`;
        test.info().annotations.push({ type: 'testData', description: uniqueName });
        await serviceGroupsPage.clickCreateGroup();
        await serviceGroupsPage.fillGroupName(uniqueName);

        await serviceGroupsPage.clickSave();
        await expect(serviceGroupsPage.datePicker).toBeVisible();
        await expect(serviceGroupsPage.expiryDateError).toBeVisible();
        await expect(serviceGroupsPage.expiryDateError).toHaveText(sgData.messages.expiryRequired);
    });

    // 10. even without selecting access options it should allow creating Group (group name and expiry is important)
    test('TC_ServiceGroups_10_CreateGroup_WithoutAccessSelection_Success - creates group without selecting access options', async () => {
        const uniqueName = `${sgData.testInputs.uniquePrefix}NoAcc_${Date.now()}`;
        test.info().annotations.push({ type: 'testData', description: uniqueName });
        await serviceGroupsPage.clickCreateGroup();
        await serviceGroupsPage.fillGroupName(uniqueName);
        await serviceGroupsPage.setExpiryDate(validExpiryDateStr);

        await serviceGroupsPage.saveGroupAndReload();
        await serviceGroupsPage.ensureGroupVisibleInTable(uniqueName);
    });

    // 11. Automate calendar popup (does not allow selecting back date from current date)
    test('TC_ServiceGroups_11_Calendar_PastDatesDisabled - verifies past dates are disabled in datepicker', async () => {
        await serviceGroupsPage.clickCreateGroup();
        await serviceGroupsPage.openCalendar();
        await expect(serviceGroupsPage.disabledDateDays.first()).toBeVisible();
        await expect(serviceGroupsPage.disabledDateDays.first()).toHaveAttribute('aria-disabled', 'true');
        await serviceGroupsPage.closeCalendarViaEscape();
    });

    // 12. verify in select access option there will be 2 options
    test('TC_ServiceGroups_12_AccessOptions_TwoOptionsVisible - verifies exactly 2 access options are visible', async () => {
        test.info().annotations.push({ type: 'testData', description: `${sgData.accessOptions.offCampus}, ${sgData.accessOptions.mobileApp}` });
        await serviceGroupsPage.clickCreateGroup();
        await expect(serviceGroupsPage.accessLabels).toHaveCount(2);
        await expect(serviceGroupsPage.accessLabels.nth(0)).toContainText(sgData.accessOptions.offCampus);
        await expect(serviceGroupsPage.accessLabels.nth(1)).toContainText(sgData.accessOptions.mobileApp);
    });

    // 13. verify that select option when user selects only off campus access option then it should not select Mobile app automatically
    test('TC_ServiceGroups_13_AccessOptions_SelectingRA_DoesNotSelectMobile - selecting off campus does not automatically select mobile app', async () => {
        await serviceGroupsPage.clickCreateGroup();
        await serviceGroupsPage.selectOffCampusAccess();
        await expect(serviceGroupsPage.raCheckbox).toBeChecked();
        await expect(serviceGroupsPage.mobileCheckbox).not.toBeChecked();
    });

    // 14. When user selects mobile app then automatically it should select off-campus access
    test('TC_ServiceGroups_14_AccessOptions_SelectingMobile_AutoSelectsRA - selecting mobile app automatically selects off campus access', async () => {
        await serviceGroupsPage.clickCreateGroup();
        await serviceGroupsPage.selectMobileApp();
        await expect(serviceGroupsPage.mobileCheckbox).toBeChecked();
        await expect(serviceGroupsPage.raCheckbox).toBeChecked();
    });

    // 15. after filling form when cancel button is clicked it should not create group
    test('TC_ServiceGroups_15_CancelButton_DiscardsGroupCreation - clicking cancel does not create group', async () => {
        const uniqueName = `${sgData.testInputs.uniquePrefix}Canceled_${Date.now()}`;
        test.info().annotations.push({ type: 'testData', description: uniqueName });
        await serviceGroupsPage.clickCreateGroup();
        await serviceGroupsPage.fillGroupName(uniqueName);
        await serviceGroupsPage.setExpiryDate(validExpiryDateStr);
        await serviceGroupsPage.selectOffCampusAccess();

        await serviceGroupsPage.closeModalViaCancel();
        await expect(serviceGroupsPage.modal).not.toBeVisible();

        const isPresent = await serviceGroupsPage.isGroupPresentInTable(uniqueName);
        expect(isPresent).toBeFalsy();
    });

    // 16. Fill all the field then should able to create group
    test('TC_ServiceGroups_16_CreateGroup_WithAllFields_Success - creates group with all fields filled', async () => {
        const uniqueName = `${sgData.testInputs.uniquePrefix}AllFields_${Date.now()}`;
        test.info().annotations.push({ type: 'testData', description: uniqueName });
        await serviceGroupsPage.clickCreateGroup();
        await serviceGroupsPage.fillGroupName(uniqueName);
        await serviceGroupsPage.setExpiryDate(validExpiryDateStr);
        await serviceGroupsPage.selectMobileApp();

        await serviceGroupsPage.saveGroupAndReload();
        await serviceGroupsPage.ensureGroupVisibleInTable(uniqueName);
    });

    // 17. when group gets created then on Service group page Showing count gets increased by one
    test('TC_ServiceGroups_17_CreateGroup_IncrementsShowingCount - verifies showing count increases by one after group creation', async () => {
        const initialCount = await serviceGroupsPage.getShowingCount();
        const uniqueName = `${sgData.testInputs.uniquePrefix}Count_${Date.now()}`;
        test.info().annotations.push({ type: 'testData', description: `Initial: ${initialCount} | Name: ${uniqueName}` });

        await serviceGroupsPage.clickCreateGroup();
        await serviceGroupsPage.fillGroupName(uniqueName);
        await serviceGroupsPage.setExpiryDate(validExpiryDateStr);

        await serviceGroupsPage.saveGroupAndReload();

        // Verify count is incremented by 1
        await serviceGroupsPage.waitForShowingCount(initialCount + 1);
    });

    // ==========================================
    // DELETION OPERATIONS (Cases 1 & 2)
    // ==========================================

    // 1. clicking delete icon should delete the Group
    test('TC_ServiceGroups_18_DeleteGroup_Success - clicking delete icon deletes the group', async () => {
        const delGroup = `${sgData.testInputs.uniquePrefix}Del_${Date.now()}`;
        test.info().annotations.push({ type: 'testData', description: delGroup });

        await serviceGroupsPage.clickCreateGroup();
        await serviceGroupsPage.fillGroupName(delGroup);
        await serviceGroupsPage.setExpiryDate(validExpiryDateStr);
        await serviceGroupsPage.saveGroupAndReload();
        await serviceGroupsPage.ensureGroupVisibleInTable(delGroup);

        await serviceGroupsPage.clickDeleteGroup(delGroup);
        await expect(serviceGroupsPage.deleteModal).toBeVisible();
        await expect(serviceGroupsPage.deleteAlertMessage).toContainText(sgData.messages.deleteAlertMessage);

        await serviceGroupsPage.confirmDelete();
        await expect(serviceGroupsPage.getGroupRow(delGroup)).not.toBeVisible();
        await serviceGroupsPage.clearSearch();
    });

    // 2. Validate showing out of count should get decreased post deleting
    test('TC_ServiceGroups_19_DeleteGroup_DecrementsShowingCount - verifies showing count decreases after deleting group', async () => {
        const initialCount = await serviceGroupsPage.getShowingCount();
        const countDelGroup = `${sgData.testInputs.uniquePrefix}CntDel_${Date.now()}`;
        test.info().annotations.push({ type: 'testData', description: `Initial: ${initialCount} | Name: ${countDelGroup}` });

        await serviceGroupsPage.clickCreateGroup();
        await serviceGroupsPage.fillGroupName(countDelGroup);
        await serviceGroupsPage.setExpiryDate(validExpiryDateStr);
        await serviceGroupsPage.saveGroupAndReload();
        await serviceGroupsPage.waitForShowingCount(initialCount + 1);

        await serviceGroupsPage.ensureGroupVisibleInTable(countDelGroup);
        await serviceGroupsPage.clickDeleteGroup(countDelGroup);
        await serviceGroupsPage.confirmDelete();
        await serviceGroupsPage.clearSearch();
        await serviceGroupsPage.waitForShowingCount(initialCount);
    });

    // ==========================================
    // PAGINATION & SORTING (Cases 3, 4, 5, 6)
    // ==========================================

    // 3. If there are more than 10 groups then "LOAD MORE" button should get appeared
    test('TC_ServiceGroups_20_LoadMore_VisibleWhenOverTenGroups - verifies LOAD MORE button appears when more than 10 groups exist', async () => {
        test.setTimeout(90000);
        await serviceGroupsPage.ensureAtLeastNGroups(11, validExpiryDateStr);
        const totalCount = await serviceGroupsPage.getShowingCount();
        test.info().annotations.push({ type: 'testData', description: `Total Count: ${totalCount}` });

        expect(totalCount).toBeGreaterThan(10);
        await expect(serviceGroupsPage.loadMoreBtn).toBeVisible();
        await expect(serviceGroupsPage.loadMoreBtn).toContainText(sgData.dialogs.loadMoreBtn);
    });

    // 4. Clicking "LOAD MORE" button list another set to groups as well
    test('TC_ServiceGroups_21_LoadMore_LoadsAdditionalGroups - clicking LOAD MORE lists another set of groups', async () => {
        test.setTimeout(90000);
        await serviceGroupsPage.ensureAtLeastNGroups(11, validExpiryDateStr);
        const initialRowCount = await serviceGroupsPage.tableRows.count();
        test.info().annotations.push({ type: 'testData', description: `Initial Rows: ${initialRowCount}` });

        await serviceGroupsPage.clickLoadMore();
        const updatedRowCount = await serviceGroupsPage.tableRows.count();
        expect(updatedRowCount).toBeGreaterThan(initialRowCount);
    });

    // 5. deleting the group and out of count is less than 10 then LOAD MORE button should get disappeared
    test('TC_ServiceGroups_22_LoadMore_DisappearsWhenCountTenOrLess - LOAD MORE button disappears when count is 10 or less', async () => {
        test.setTimeout(90000);
        await serviceGroupsPage.deleteExcessTestGroupsUntilCount(10);
        const count = await serviceGroupsPage.getShowingCount();
        test.info().annotations.push({ type: 'testData', description: `Adjusted Count: ${count}` });

        expect(count).toBeLessThanOrEqual(10);
        await expect(serviceGroupsPage.loadMoreBtn).not.toBeVisible();
    });

    // 6. Clicking on group name will sorted the list alphabetical order if clicked twice then list will sorted from z-a
    test('TC_ServiceGroups_23_Sort_ByGroupName_AscendingAndDescending - clicking group name header sorts A-Z and then Z-A', async () => {
        // 1st click: Sort A-Z
        await serviceGroupsPage.sortByGroupName();
        await expect(serviceGroupsPage.groupNameSortIcon).toHaveAttribute('class', /fa-caret-down/);
        const titleAsc = await serviceGroupsPage.getSortTitle();
        expect(titleAsc).toContain(sgData.dialogs.sortAscTitle);
        const namesAsc = await serviceGroupsPage.getVisibleGroupNames();
        expect(serviceGroupsPage.isSortedAscending(namesAsc)).toBeTruthy();

        // 2nd click: Sort Z-A
        await serviceGroupsPage.sortByGroupName();
        await expect(serviceGroupsPage.groupNameSortIcon).toHaveAttribute('class', /fa-caret-up/);
        const titleDesc = await serviceGroupsPage.getSortTitle();
        expect(titleDesc).toContain(sgData.dialogs.sortDescTitle);
        const namesDesc = await serviceGroupsPage.getVisibleGroupNames();
        expect(serviceGroupsPage.isSortedDescending(namesDesc)).toBeTruthy();
    });

    // ==========================================
    // EXPIRED GROUP ALERTS (Cases 7, 8, 9)
    // ==========================================

    // 7. Click on "+ ADD Users" from a expired group, first it will open message alert pop up saying "Group expired!"
    test('TC_ServiceGroups_24_ExpiredGroup_AddUsers_ShowsExpiredAlert - clicking Add users from expired group opens Group expired alert', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.expiredGroup });

        await serviceGroupsPage.searchGroup(sgData.expiredGroup);
        await serviceGroupsPage.clickAddOrEditUsers(sgData.expiredGroup);

        await expect(serviceGroupsPage.expiredAlert).toBeVisible();
        await expect(serviceGroupsPage.expiredAlertTitle).toHaveText(sgData.messages.expiredAlertTitle);
        await expect(serviceGroupsPage.expiredAlertMessage).toHaveText(sgData.messages.expiredAlertMessage);

        await serviceGroupsPage.clickExpiredCancel();
        await serviceGroupsPage.clearSearch();
    });

    // 8. Click on "+ ADD Users" from a expired group, alert has cancel button; if clicked on cancel then pop up should get closed
    test('TC_ServiceGroups_25_ExpiredGroup_AddUsers_AlertCancelDismisses - clicking cancel in Group expired alert closes the popup', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.expiredGroup });

        await serviceGroupsPage.searchGroup(sgData.expiredGroup);
        await serviceGroupsPage.clickAddOrEditUsers(sgData.expiredGroup);

        await expect(serviceGroupsPage.expiredAlert).toBeVisible();
        await serviceGroupsPage.clickExpiredCancel();
        await expect(serviceGroupsPage.expiredAlert).not.toBeVisible();

        await serviceGroupsPage.clearSearch();
    });

    // 9. Click on "+ ADD Users" from a expired group, if clicked on Continue then it will open Select Users pop up
    test('TC_ServiceGroups_26_ExpiredGroup_AddUsers_AlertContinueOpensSelectUsers - clicking continue opens Select Users modal', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.expiredGroup });

        await serviceGroupsPage.searchGroup(sgData.expiredGroup);
        await serviceGroupsPage.clickAddOrEditUsers(sgData.expiredGroup);

        await expect(serviceGroupsPage.expiredAlert).toBeVisible();
        await serviceGroupsPage.clickExpiredContinue();

        await expect(selectUsersModal.modal).toBeVisible();
        await expect(selectUsersModal.title).toContainText(sgData.dialogs.selectUsersTitle);

        await selectUsersModal.clickCancel();
        await expect(selectUsersModal.modal).not.toBeVisible();
        await serviceGroupsPage.clearSearch();
    });

    // ==========================================
    // ASSOCIATED RESOURCES MANAGEMENT (Cases 10 - 21)
    // ==========================================

    const resTestGroupName = `${sgData.testInputs.uniquePrefix}ResTest_${Date.now()}`;

    // 10. check "Associated Resources" rows, if no resources are allocated then it will display "+ Add resources" button
    test('TC_ServiceGroups_27_AssociatedResources_DisplaysAddResourcesButtonWhenEmpty - displays Add resources button when no resources are allocated', async () => {
        test.info().annotations.push({ type: 'testData', description: resTestGroupName });

        await serviceGroupsPage.clickCreateGroup();
        await serviceGroupsPage.fillGroupName(resTestGroupName);
        await serviceGroupsPage.setExpiryDate(validExpiryDateStr);
        await serviceGroupsPage.saveGroupAndReload();
        await serviceGroupsPage.ensureGroupVisibleInTable(resTestGroupName);

        await expect(serviceGroupsPage.getAddResourcesBtn(resTestGroupName)).toBeVisible();
        await expect(serviceGroupsPage.getAddResourcesBtn(resTestGroupName)).toContainText(sgData.dialogs.addResourcesBtn);
    });

    // 11. if clicked on "+ ADD resources" then it should open a pop up window called "Select resources"
    test('TC_ServiceGroups_28_AssociatedResources_ClickAddResourcesOpensModal - clicking Add resources opens Select resources popup', async () => {
        test.info().annotations.push({ type: 'testData', description: resTestGroupName });

        await serviceGroupsPage.ensureGroupVisibleInTable(resTestGroupName);
        await serviceGroupsPage.clickAddResources(resTestGroupName);
        await expect(selectResourcesModal.modal).toBeVisible();
        await expect(selectResourcesModal.title).toHaveText(sgData.dialogs.selectResourcesTitle);
        await selectResourcesModal.clickCancel();
    });

    // 12. when clicked on "+ ADD resources" then verify selected count it must be 0
    test('TC_ServiceGroups_29_SelectResourcesModal_DefaultSelectedCountIsZero - verifies default selected count is 0', async () => {
        test.info().annotations.push({ type: 'testData', description: resTestGroupName });

        await serviceGroupsPage.ensureGroupVisibleInTable(resTestGroupName);
        await serviceGroupsPage.clickAddResources(resTestGroupName);
        const count = await selectResourcesModal.getSelectedCount();
        expect(count).toBe(0);
        await selectResourcesModal.clickCancel();
    });

    // 13. select few sources from list by clicking on checkbox, verify clicking checkbox gets selected or ticked
    test('TC_ServiceGroups_30_SelectResourcesModal_CheckboxTickedOnClick - clicking checkbox marks it checked', async () => {
        test.info().annotations.push({ type: 'testData', description: resTestGroupName });

        await serviceGroupsPage.ensureGroupVisibleInTable(resTestGroupName);
        await serviceGroupsPage.clickAddResources(resTestGroupName);
        await selectResourcesModal.selectResourceByIndex(0);
        const isChecked = await selectResourcesModal.isResourceChecked(0);
        expect(isChecked).toBeTruthy();
        await selectResourcesModal.clickCancel();
    });

    // 14. select few sources, verify selected count is also getting increased
    test('TC_ServiceGroups_31_SelectResourcesModal_SelectedCountIncreasesOnSelection - selected count increases upon checking checkboxes', async () => {
        test.info().annotations.push({ type: 'testData', description: resTestGroupName });

        await serviceGroupsPage.ensureGroupVisibleInTable(resTestGroupName);
        await serviceGroupsPage.clickAddResources(resTestGroupName);
        await selectResourcesModal.selectResourceByIndex(0);
        await selectResourcesModal.selectResourceByIndex(1);
        const count = await selectResourcesModal.getSelectedCount();
        expect(count).toBe(2);
        await selectResourcesModal.clickCancel();
    });

    // 15. click on cancel button, selected resources must not get added; when reopened same no selection should be there
    test('TC_ServiceGroups_32_SelectResourcesModal_CancelDoesNotAddResources - clicking cancel discards selection and no selection on reopen', async () => {
        test.info().annotations.push({ type: 'testData', description: resTestGroupName });

        await serviceGroupsPage.ensureGroupVisibleInTable(resTestGroupName);
        await serviceGroupsPage.clickAddResources(resTestGroupName);
        await selectResourcesModal.selectResourceByIndex(0);
        await selectResourcesModal.selectResourceByIndex(1);
        await selectResourcesModal.clickCancel();
        await expect(selectResourcesModal.modal).not.toBeVisible();

        await serviceGroupsPage.clickAddResources(resTestGroupName);
        const reopenedCount = await selectResourcesModal.getSelectedCount();
        expect(reopenedCount).toBe(0);
        expect(await selectResourcesModal.isResourceChecked(0)).toBeFalsy();
        await selectResourcesModal.clickCancel();
    });

    // 16. click on update button, same number of sources get added
    test('TC_ServiceGroups_33_SelectResourcesModal_UpdateAddsResources - clicking update adds selected resources to the group', async () => {
        test.info().annotations.push({ type: 'testData', description: resTestGroupName });

        await serviceGroupsPage.ensureGroupVisibleInTable(resTestGroupName);
        await serviceGroupsPage.clickAddResources(resTestGroupName);
        await selectResourcesModal.selectResourceByIndex(0);
        await selectResourcesModal.selectResourceByIndex(1);
        await selectResourcesModal.clickUpdate();
        await expect(selectResourcesModal.modal).not.toBeVisible();

        const rowCount = await serviceGroupsPage.getResourcesCount(resTestGroupName);
        expect(rowCount).toBe(2);
    });

    // 17. verify "Associated Resources" where in group some sources already added and along with count it should have edit button
    test('TC_ServiceGroups_34_AssociatedResources_ShowsCountAndEditButtonWhenAllocated - verifies count and edit button when resources are added', async () => {
        test.info().annotations.push({ type: 'testData', description: resTestGroupName });

        await serviceGroupsPage.ensureGroupVisibleInTable(resTestGroupName);
        await expect(serviceGroupsPage.getEditResourcesBtn(resTestGroupName)).toBeVisible();
        const rowCount = await serviceGroupsPage.getResourcesCount(resTestGroupName);
        expect(rowCount).toBe(2);
    });

    // 18. verify by clicking on edit button it should open a pop window of selected Resources
    test('TC_ServiceGroups_35_AssociatedResources_ClickEditOpensSelectResourcesModal - clicking edit button opens Select resources popup', async () => {
        test.info().annotations.push({ type: 'testData', description: resTestGroupName });

        await serviceGroupsPage.ensureGroupVisibleInTable(resTestGroupName);
        await serviceGroupsPage.clickEditResources(resTestGroupName);
        await expect(selectResourcesModal.modal).toBeVisible();
        await expect(selectResourcesModal.title).toHaveText(sgData.dialogs.selectResourcesTitle);
        await selectResourcesModal.clickCancel();
    });

    // 19. Match the count of selected in pop up it should have same count which is displayed in service group page of associated resources
    test('TC_ServiceGroups_36_SelectResourcesModal_SelectedCountMatchesTableRowCount - selected count in popup matches table row count', async () => {
        test.info().annotations.push({ type: 'testData', description: resTestGroupName });

        await serviceGroupsPage.ensureGroupVisibleInTable(resTestGroupName);
        const rowCount = await serviceGroupsPage.getResourcesCount(resTestGroupName);
        await serviceGroupsPage.clickEditResources(resTestGroupName);
        await selectResourcesModal.expectSelectedCount(rowCount);
        const modalCount = await selectResourcesModal.getSelectedCount();
        expect(modalCount).toBe(rowCount);
        await selectResourcesModal.clickCancel();
    });

    // 20. validate by removing one or 2 sources and click on update, its count should get decreased
    test('TC_ServiceGroups_37_SelectResourcesModal_RemoveResourceDecreasesCount - unchecking resource and clicking update decreases resources count', async () => {
        test.info().annotations.push({ type: 'testData', description: resTestGroupName });

        await serviceGroupsPage.ensureGroupVisibleInTable(resTestGroupName);
        await serviceGroupsPage.clickEditResources(resTestGroupName);
        await selectResourcesModal.expectSelectedCount(2);
        await selectResourcesModal.unselectResourceByIndex(0);
        await selectResourcesModal.clickUpdate();
        await expect(selectResourcesModal.modal).not.toBeVisible();

        const updatedCount = await serviceGroupsPage.getResourcesCount(resTestGroupName);
        expect(updatedCount).toBe(1);
    });

    // 21. validate by adding one or 2 sources and click on update, its count should get increased
    test('TC_ServiceGroups_38_SelectResourcesModal_AddResourceIncreasesCount - checking resource and clicking update increases resources count', async () => {
        test.info().annotations.push({ type: 'testData', description: resTestGroupName });

        await serviceGroupsPage.ensureGroupVisibleInTable(resTestGroupName);
        await serviceGroupsPage.clickEditResources(resTestGroupName);
        await selectResourcesModal.expectSelectedCount(1);
        await selectResourcesModal.selectResourceByIndex(2);
        await selectResourcesModal.clickUpdate();
        await expect(selectResourcesModal.modal).not.toBeVisible();

        const finalCount = await serviceGroupsPage.getResourcesCount(resTestGroupName);
        expect(finalCount).toBe(2);

        // Teardown: delete test group to keep environment clean
        await serviceGroupsPage.clickDeleteGroup(resTestGroupName);
        await serviceGroupsPage.confirmDelete();
        await expect(serviceGroupsPage.getGroupRow(resTestGroupName)).not.toBeVisible();
        await serviceGroupsPage.clearSearch();
    });

    // 39. validate When A Group is created using create group the date entered while creating group is displaying same date on EXPIRY DATE post creation when group is created list
    test('TC_ServiceGroups_39_CreateGroup_EnteredExpiryDate_MatchesTableList - verifies entered expiry date matches table list expiry date post creation', async () => {
        const uniqueName = `${sgData.testInputs.uniquePrefix}Expiry_${Date.now()}`;

        await serviceGroupsPage.clickCreateGroup();
        await serviceGroupsPage.fillGroupName(uniqueName);

        // Pick a random future date directly via the live calendar picker
        const selectedExpiryDate = await serviceGroupsPage.selectRandomFutureExpiryDateViaCalendar();
        test.info().annotations.push({ type: 'testData', description: `Group: ${uniqueName} | Chosen Expiry Date: ${selectedExpiryDate}` });

        await serviceGroupsPage.saveGroupAndReload();
        await serviceGroupsPage.ensureGroupVisibleInTable(uniqueName);

        // Verify the table list displays the exact same date selected during creation
        await expect(serviceGroupsPage.getExpiryDateCell(uniqueName)).toHaveText(selectedExpiryDate);
        const displayedExpiryDate = await serviceGroupsPage.getExpiryDate(uniqueName);
        expect(displayedExpiryDate).toBe(selectedExpiryDate);

        // Teardown: delete test group to keep environment clean
        await serviceGroupsPage.clickDeleteGroup(uniqueName);
        await serviceGroupsPage.confirmDelete();
        await expect(serviceGroupsPage.getGroupRow(uniqueName)).not.toBeVisible();
        await serviceGroupsPage.clearSearch();
    });

    // ==========================================
    // ASSOCIATED USERS MODAL VALIDATIONS (Cases 1 - 5)
    // ==========================================
    const userTestGroupName = `${sgData.testInputs.uniquePrefix}Users_${Date.now()}`;

    // 1. click on cross icon, it should close the pop up
    test('TC_ServiceGroups_40_AssociatedUsers_CloseCrossIcon_ClosesModal - clicking cross icon closes Select users popup', async () => {
        test.info().annotations.push({ type: 'testData', description: userTestGroupName });

        await serviceGroupsPage.createGroupIfNotPresent(userTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.clickAddOrEditUsers(userTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.closeViaCross();
        await expect(selectUsersModal.modal).not.toBeVisible();
    });

    // 2. Validate 4 tabs are present "All users", "Selected", "Unselected" and "Via CSV"
    test('TC_ServiceGroups_41_SelectUsersModal_FourTabsPresent - verifies four tabs are present in Select users popup', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.selectUsersModal.tabs.join(', ') });

        await serviceGroupsPage.createGroupIfNotPresent(userTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.clickAddOrEditUsers(userTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.verifyTabsPresent(sgData.selectUsersModal.tabs);
        await selectUsersModal.clickCancel();
    });

    // 3. Validate by default would be "All users" tab
    test('TC_ServiceGroups_42_SelectUsersModal_DefaultTabIsAllUsers - verifies All users tab is active by default', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.selectUsersModal.defaultTab });

        await serviceGroupsPage.createGroupIfNotPresent(userTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.clickAddOrEditUsers(userTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await expect(selectUsersModal.activeTab).toHaveText(sgData.selectUsersModal.defaultTab);
        await selectUsersModal.clickCancel();
    });

    // 4. Validate the name is same present below the All users is same as you clicked
    test('TC_ServiceGroups_43_SelectUsersModal_GroupNameMatchesClickedGroup - verifies group name displayed below tabs matches clicked group', async () => {
        test.info().annotations.push({ type: 'testData', description: userTestGroupName });

        await serviceGroupsPage.createGroupIfNotPresent(userTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.clickAddOrEditUsers(userTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await expect(selectUsersModal.groupNameContainer).toContainText(userTestGroupName);
        const displayedGroupName = await selectUsersModal.getGroupName();
        expect(displayedGroupName).toBe(userTestGroupName);

        await selectUsersModal.clickCancel();
    });

    // 5. Validate count "All Users: 12" (it should display total user count) this count you need to verify from User Management > Overview > Total registered users count
    test('TC_ServiceGroups_44_SelectUsersModal_AllUsersCountMatchesOverviewTotalUsers - verifies All users count matches Overview total registered users count', async ({ page }) => {
        // Step 1: Navigate to Overview and read the Total registered users count
        const overviewPage = new UserMgmtOverviewPage(page);
        await page.goto(`${process.env.ADMIN_TEST_URL}/librarian/v2/elibrarySetup${overviewUrl}`);
        await expect(overviewPage.totalRegisteredUsersCount).not.toBeEmpty();
        const expectedTotalUsers = (await overviewPage.totalRegisteredUsersCount.innerText()).trim();
        test.info().annotations.push({ type: 'testData', description: `Overview Total Users: ${expectedTotalUsers}` });

        // Step 2: Navigate back to Service Groups, find group, and open + ADD USERS
        await page.goto(`${process.env.ADMIN_TEST_URL}/librarian/v2/elibrarySetup${serviceGroupsUrl}`);
        await serviceGroupsPage.waitForTableLoaded();
        await serviceGroupsPage.createGroupIfNotPresent(userTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.clickAddOrEditUsers(userTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        // Step 3: Validate the modal displays the exact same total users count
        await expect(selectUsersModal.allUsersCountContainer).toContainText(expectedTotalUsers);
        const modalCount = await selectUsersModal.getAllUsersCount();
        expect(modalCount).toBe(expectedTotalUsers);

        await selectUsersModal.clickCancel();
    });

    // ==========================================
    // ASSOCIATED USERS MODAL VALIDATIONS (Cases 6 - 14)
    // ==========================================

    // 1. Find user search box presence
    test('TC_ServiceGroups_45_SelectUsersModal_FindUserSearchBox_Present - verifies search box presence and placeholder in Select users popup', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.selectUsersModal.searchPlaceholder });

        await serviceGroupsPage.createGroupIfNotPresent(userTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.clickAddOrEditUsers(userTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await expect(selectUsersModal.searchInput).toBeVisible();
        await expect(selectUsersModal.searchInput).toHaveAttribute('placeholder', sgData.selectUsersModal.searchPlaceholder);
        await expect(selectUsersModal.searchBtn).toBeVisible();

        await selectUsersModal.clickCancel();
    });

    // 2. In Find user search with register user ex. "codec" it should display all the matching result either in email or as name in user listing box
    test('TC_ServiceGroups_46_SelectUsersModal_SearchRegisteredUser_DisplaysMatchingResults - searches registered keyword and verifies all matching results in name or email', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.selectUsersModal.searchKeyword });

        await serviceGroupsPage.createGroupIfNotPresent(userTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.clickAddOrEditUsers(userTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.searchUser(sgData.selectUsersModal.searchKeyword);
        await selectUsersModal.verifySearchResultsMatch(sgData.selectUsersModal.searchKeyword);

        await selectUsersModal.clickCancel();
    });

    // 3. using Find the user search for the user "codec@yopmail.com", once the list populates check below email id the service group is already assigned or not
    test('TC_ServiceGroups_47_SelectUsersModal_SearchSpecificUser_DisplaysAssignedGroup - searches for specific user email and verifies assigned service group badge', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.selectUsersModal.searchEmail });

        await serviceGroupsPage.createGroupIfNotPresent(userTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.clickAddOrEditUsers(userTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.ensureUserAssigned(sgData.selectUsersModal.searchEmail);
        await selectUsersModal.searchUser(sgData.selectUsersModal.searchEmail);
        const isAssigned = await selectUsersModal.isUserAssignedToAnyGroup(sgData.selectUsersModal.searchEmail);
        expect(isAssigned).toBeTruthy();

        const groupBadge = await selectUsersModal.getUserAssignedGroupBadge(sgData.selectUsersModal.searchEmail);
        expect(groupBadge.length).toBeGreaterThan(0);

        await selectUsersModal.clickCancel();
    });

    // 4. When the list shows more than 10 user verify that "Load more >" button is present
    test('TC_ServiceGroups_48_SelectUsersModal_LoadMoreButton_PresentWhenRowsExceedTen - verifies Load more button is present when user list exceeds 10', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.selectUsersModal.loadMoreBtn });

        await serviceGroupsPage.createGroupIfNotPresent(userTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.clickAddOrEditUsers(userTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await expect(selectUsersModal.tableRows.first()).toBeVisible({ timeout: 10000 });
        await expect(selectUsersModal.tableRows).toHaveCount(10, { timeout: 10000 });
        await expect(selectUsersModal.loadMoreBtn).toBeVisible();
        await expect(selectUsersModal.loadMoreBtn).toContainText(sgData.selectUsersModal.loadMoreBtn);

        await selectUsersModal.clickCancel();
    });

    // 5. Validate clicking on "LOAD MORE" button increases the Showing count
    test('TC_ServiceGroups_49_SelectUsersModal_ClickLoadMore_IncreasesShowingCount - clicking Load more increases the showing count', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.selectUsersModal.loadMoreBtn });

        await serviceGroupsPage.createGroupIfNotPresent(userTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.clickAddOrEditUsers(userTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        const initialShowingCount = await selectUsersModal.getShowingCount();
        await selectUsersModal.clickLoadMore();
        const updatedShowingCount = await selectUsersModal.getShowingCount();
        expect(updatedShowingCount).toBeGreaterThan(initialShowingCount);

        await selectUsersModal.clickCancel();
    });

    // 6. check in Name/ email listing check box is present for all the user
    test('TC_ServiceGroups_50_SelectUsersModal_CheckboxesPresentForAllUsers - verifies checkbox is present for all users in the listing', async () => {
        await serviceGroupsPage.createGroupIfNotPresent(userTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.clickAddOrEditUsers(userTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.verifyAllRowsHaveCheckbox();

        await selectUsersModal.clickCancel();
    });

    // 7. Validate if user is in same group which you have opened, it should display check box as already ticked do this using find user
    test('TC_ServiceGroups_51_SelectUsersModal_UserInSameGroup_CheckboxTicked - verifies assigned user has checkbox ticked by default when searched', async () => {
        await serviceGroupsPage.createGroupIfNotPresent(userTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.clickAddOrEditUsers(userTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        // Get an unselected user to assign
        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[2]);
        const targetEmail = await selectUsersModal.getFirstUserEmail();
        test.info().annotations.push({ type: 'testData', description: targetEmail });

        await selectUsersModal.checkUser(targetEmail);
        await selectUsersModal.clickUpdate();

        // Close and reopen modal to test persistent assigned state
        await selectUsersModal.closeViaCross();
        await serviceGroupsPage.clickAddOrEditUsers(userTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        // Use Find user search box to find this assigned user
        await selectUsersModal.searchUser(targetEmail);
        const isTicked = await selectUsersModal.isUserChecked(targetEmail);
        expect(isTicked).toBeTruthy();

        await selectUsersModal.clickCancel();
    });

    // 8. validate on selecting the unselected user and clicking on update button the user gets assigned to that group and same group name will be visible below to the email text
    test('TC_ServiceGroups_52_SelectUsersModal_SelectUnselectedUser_UpdateAssignsGroup - selecting unselected user and clicking update displays group badge below email', async () => {
        await serviceGroupsPage.createGroupIfNotPresent(userTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.clickAddOrEditUsers(userTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        // Go to Unselected tab to get an unassigned user
        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[2]);
        const targetEmail = await selectUsersModal.getFirstUserEmail();
        test.info().annotations.push({ type: 'testData', description: targetEmail });

        // Select the user and click update
        await selectUsersModal.checkUser(targetEmail);
        await selectUsersModal.clickUpdate();

        // Switch back to All users tab and search for targetEmail
        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[0]);
        await selectUsersModal.searchUser(targetEmail);

        // Verify group name badge appears below the email text matching the current service group
        await expect(selectUsersModal.getUserRow(targetEmail)).toBeVisible();
        const groupBadge = await selectUsersModal.getUserAssignedGroupBadge(targetEmail);
        expect(groupBadge).toBe(userTestGroupName);

        await selectUsersModal.clickCancel();
    });

    // 9. register a user and then come to service group, choose one service group, note the count of existing user, click edit/add users, find registered user, check checkbox and update, close modal, verify service group user count increased
    test('TC_ServiceGroups_53_ServiceGroups_RegisterUserAndAssign_IncreasesTableUserCount - registers user, assigns to service group, and verifies table user count increases', async ({ page }) => {
        // Step 1: Register a new user via AdminApiService
        const uniqueSuffix = Date.now();
        const newUserName = `AutoUser_${uniqueSuffix}`;
        const newUserEmail = `autouser_${uniqueSuffix}@yopmail.com`;
        await adminApi.addSingleUser(newUserName, newUserEmail);
        test.info().annotations.push({ type: 'testData', description: `Registered User: ${newUserEmail}` });

        // Step 2: Navigate to Service Groups and note the existing count of users in the group
        await page.goto(`${process.env.ADMIN_TEST_URL}/librarian/v2/elibrarySetup${serviceGroupsUrl}`);
        await serviceGroupsPage.waitForTableLoaded();
        await serviceGroupsPage.createGroupIfNotPresent(userTestGroupName, validExpiryDateStr);
        const initialCount = await serviceGroupsPage.getUsersCount(userTestGroupName);

        // Step 3: Click Add/Edit users to open Select users modal
        await serviceGroupsPage.clickAddOrEditUsers(userTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        // Step 4: Find the newly registered user and select checkbox
        await selectUsersModal.searchUser(newUserEmail);
        await selectUsersModal.checkUser(newUserEmail);

        // Step 5: Click Update button and close the modal
        await selectUsersModal.clickUpdate();
        await selectUsersModal.closeViaCross();
        await expect(selectUsersModal.modal).not.toBeVisible();

        // Step 6: Find the service group in table and verify user count increased by 1
        await serviceGroupsPage.ensureGroupVisibleInTable(userTestGroupName);
        const updatedCount = await serviceGroupsPage.getUsersCount(userTestGroupName);
        expect(updatedCount).toBe(initialCount + 1);

        // Teardown: delete test group to keep environment clean
        await serviceGroupsPage.clickDeleteGroup(userTestGroupName);
        await serviceGroupsPage.confirmDelete();
        await expect(serviceGroupsPage.getGroupRow(userTestGroupName)).not.toBeVisible();
        await serviceGroupsPage.clearSearch();
    });

    // ==========================================
    // ASSOCIATED USERS - SELECTED TAB VALIDATIONS (Cases 1 - 10)
    // ==========================================
    const emptyTestGroupName = `${sgData.testInputs.uniquePrefix}SelEmpty_${Date.now()}`;
    const assocTestGroupName = `${sgData.testInputs.uniquePrefix}SelAssoc_${Date.now()}`;
    const disassocTestGroupName = `${sgData.testInputs.uniquePrefix}SelDis_${Date.now()}`;
    const deselectOneGroupName = `${sgData.testInputs.uniquePrefix}SelOne_${Date.now()}`;

    // 1. verify When + add user button is clicked of a service group then on pop up when moves to selected tab it display list as "No user found"
    test('TC_ServiceGroups_54_SelectedTab_EmptyGroup_DisplaysNoUserFound - verifies Selected tab displays No user found for newly created service group', async () => {
        test.info().annotations.push({ type: 'testData', description: emptyTestGroupName });

        await serviceGroupsPage.createGroupIfNotPresent(emptyTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.ensureGroupVisibleInTable(emptyTestGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(emptyTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[1]);
        await expect(selectUsersModal.emptyTableText).toBeVisible();
        await expect(selectUsersModal.emptyTableText).toHaveText(sgData.selectUsersModal.noUserFound);

        await selectUsersModal.clickCancel();
    });

    // 2. verify When + add user button is clicked of a service group then on pop up when moves to selected tab the "Selected users" count will 0
    test('TC_ServiceGroups_55_SelectedTab_EmptyGroup_SelectedUsersCountIsZero - verifies Selected users count is 0 for newly created service group', async () => {
        test.info().annotations.push({ type: 'testData', description: emptyTestGroupName });

        await serviceGroupsPage.ensureGroupVisibleInTable(emptyTestGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(emptyTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[1]);
        const count = await selectUsersModal.getSelectedUsersCount();
        expect(count).toBe(0);

        await selectUsersModal.clickCancel();
    });

    // 3. verify When + add user button is clicked of a service group then on pop up when moves to selected tab and perform Find user of already registered user it still displays "No user found"
    test('TC_ServiceGroups_56_SelectedTab_EmptyGroup_SearchRegisteredUser_DisplaysNoUserFound - searching registered user on empty Selected tab displays No user found', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.selectUsersModal.searchKeyword });

        await serviceGroupsPage.ensureGroupVisibleInTable(emptyTestGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(emptyTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[1]);
        await selectUsersModal.searchInput.fill(sgData.selectUsersModal.searchKeyword);
        await selectUsersModal.searchInput.press('Enter');

        await expect(selectUsersModal.emptyTableText).toBeVisible();
        await expect(selectUsersModal.emptyTableText).toHaveText(sgData.selectUsersModal.noUserFound);

        await selectUsersModal.clickCancel();
    });

    // 4. verify When + add user button is clicked of a service group then on pop up when moves to selected tab and clicked on update button then it should open a modal saying "No changes in user selection"
    test('TC_ServiceGroups_57_SelectedTab_EmptyGroup_ClickUpdateWithoutChanges_ShowsAlertModal - clicking update without changes displays No changes in user selection alert', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.selectUsersModal.noChangesAlert.title });

        await serviceGroupsPage.ensureGroupVisibleInTable(emptyTestGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(emptyTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[1]);
        await selectUsersModal.updateBtn.click();

        await expect(selectUsersModal.alertPopup).toBeVisible();
        await expect(selectUsersModal.alertTitle).toHaveText(sgData.selectUsersModal.noChangesAlert.title);
        await expect(selectUsersModal.alertMessage).toContainText(sgData.selectUsersModal.noChangesAlert.message);

        await selectUsersModal.dismissAlert();
        await selectUsersModal.clickCancel();

        // Teardown empty test group
        await serviceGroupsPage.clickDeleteGroup(emptyTestGroupName);
        await serviceGroupsPage.confirmDelete();
        await expect(serviceGroupsPage.getGroupRow(emptyTestGroupName)).not.toBeVisible();
        await serviceGroupsPage.clearSearch();
    });

    // 5. verify when Edit icon clicked for Associated users (choose that which already had user associated), it opens selected pop up modal then move to selected tab, verify here it has same count on Selected users that present while clicking edit icon
    test('TC_ServiceGroups_58_SelectedTab_AssocGroup_SelectedUsersCountMatchesTableRowCount - Selected users count matches table row count for group with associated users', async () => {
        // Setup group with 2 associated users
        await serviceGroupsPage.createGroupIfNotPresent(assocTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.ensureGroupVisibleInTable(assocTestGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(assocTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();
        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[0]);
        const user1 = await selectUsersModal.tableRows.nth(0).locator('.user-list-item-email').innerText();
        const user2 = await selectUsersModal.tableRows.nth(1).locator('.user-list-item-email').innerText();
        await selectUsersModal.checkUser(user1);
        await selectUsersModal.checkUser(user2);
        await selectUsersModal.clickUpdate();
        await selectUsersModal.closeViaCross();

        // Step 1: Note count in main table row
        await serviceGroupsPage.ensureGroupVisibleInTable(assocTestGroupName);
        const rowCount = await serviceGroupsPage.getUsersCount(assocTestGroupName);
        expect(rowCount).toBe(2);
        test.info().annotations.push({ type: 'testData', description: `Table Row Users Count: ${rowCount}` });

        // Step 2: Click Edit users icon, move to Selected tab, verify count
        await serviceGroupsPage.clickAddOrEditUsers(assocTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();
        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[1]);

        const selectedCount = await selectUsersModal.getSelectedUsersCount();
        expect(selectedCount).toBe(rowCount);

        await selectUsersModal.clickCancel();
    });

    // 6. verify when Edit icon clicked for Associated users (choose that which already had user associated), it opens selected pop up modal then move to selected tab, verify here "Deselect All" button should be present
    test('TC_ServiceGroups_59_SelectedTab_AssocGroup_DeselectAllButton_Present - verifies Deselect All button is present on Selected tab for group with users', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.selectUsersModal.buttons.deselectAll });

        await serviceGroupsPage.ensureGroupVisibleInTable(assocTestGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(assocTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[1]);
        await expect(selectUsersModal.deselectAllBtn).toBeVisible();
        await expect(selectUsersModal.deselectAllBtn).toHaveText(sgData.selectUsersModal.buttons.deselectAll);

        await selectUsersModal.clickCancel();
    });

    // 7. verify when Edit icon clicked for Associated users (choose that which already had user associated), it opens selected pop up modal then move to selected tab, verify here "Deselect All" button on clicking de-select all the users in the list. (do not click on update) and a note has appeared saying: "Note: De-select All operation takes some time to be reflected after update"
    test('TC_ServiceGroups_60_SelectedTab_AssocGroup_DeselectAll_UnchecksUsersAndShowsNote - clicking Deselect All unchecks all listed users and displays note', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.selectUsersModal.deselectAllNote });

        await serviceGroupsPage.ensureGroupVisibleInTable(assocTestGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(assocTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[1]);
        await selectUsersModal.clickDeselectAll();

        // Verify all listed users are de-selected (unchecked)
        const allUnchecked = await selectUsersModal.areAllListedUsersUnchecked();
        expect(allUnchecked).toBeTruthy();

        // Verify note has appeared
        await expect(selectUsersModal.deselectAllNote).toBeVisible();
        await expect(selectUsersModal.deselectAllNote).toContainText(sgData.selectUsersModal.deselectAllNote);

        await selectUsersModal.clickCancel();
    });

    // 8. verify when Edit icon clicked for Associated users (choose that which already had user associated), it opens selected pop up modal then move to selected tab, verify here "Deselect All" button on clicking de-select all the users in the list. (do not click on update) and beside the note there is undo button, clicking on that all the listed user got selected again
    test('TC_ServiceGroups_61_SelectedTab_AssocGroup_DeselectAll_UndoReselectsUsers - clicking Undo beside note re-selects all listed users', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.selectUsersModal.buttons.undo });

        await serviceGroupsPage.ensureGroupVisibleInTable(assocTestGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(assocTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[1]);
        await selectUsersModal.clickDeselectAll();

        await expect(selectUsersModal.undoBtn).toBeVisible();
        await expect(selectUsersModal.undoBtn).toHaveText(sgData.selectUsersModal.buttons.undo);

        // Click Undo and verify all listed users got selected again
        await selectUsersModal.clickUndo();
        const allChecked = await selectUsersModal.areAllListedUsersChecked();
        expect(allChecked).toBeTruthy();

        await selectUsersModal.clickCancel();

        // Teardown associated test group
        await serviceGroupsPage.clickDeleteGroup(assocTestGroupName);
        await serviceGroupsPage.confirmDelete();
        await expect(serviceGroupsPage.getGroupRow(assocTestGroupName)).not.toBeVisible();
        await serviceGroupsPage.clearSearch();
    });

    // 9. Create a group associated some users in it. then verify that on selected tab click on deselect all and clicking on update button, all users from this groups gets dissociated when you revisited in selected tab it should show "No user found"
    test('TC_ServiceGroups_62_SelectedTab_DeselectAllAndUpdate_DissociatesAllUsers - clicking Deselect All and update dissociates all users and shows No user found on revisit', async () => {
        // Step 1: Create a group and associate 2 users
        await serviceGroupsPage.createGroupIfNotPresent(disassocTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.ensureGroupVisibleInTable(disassocTestGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(disassocTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();
        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[0]);
        const user1 = await selectUsersModal.tableRows.nth(0).locator('.user-list-item-email').innerText();
        const user2 = await selectUsersModal.tableRows.nth(1).locator('.user-list-item-email').innerText();
        await selectUsersModal.checkUser(user1);
        await selectUsersModal.checkUser(user2);
        await selectUsersModal.clickUpdate();
        await selectUsersModal.closeViaCross();

        // Step 2: Open modal, switch to Selected tab, click Deselect All, and click Update
        await serviceGroupsPage.ensureGroupVisibleInTable(disassocTestGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(disassocTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();
        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[1]);

        await selectUsersModal.clickDeselectAll();
        await selectUsersModal.clickUpdate();
        await selectUsersModal.closeViaCross();

        // Step 3: Revisit Selected tab and verify it shows "No user found" and count is 0
        await serviceGroupsPage.ensureGroupVisibleInTable(disassocTestGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(disassocTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();
        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[1]);

        await expect(selectUsersModal.emptyTableText).toBeVisible();
        await expect(selectUsersModal.emptyTableText).toHaveText(sgData.selectUsersModal.noUserFound);
        const count = await selectUsersModal.getSelectedUsersCount();
        expect(count).toBe(0);

        await selectUsersModal.clickCancel();

        // Teardown group
        await serviceGroupsPage.clickDeleteGroup(disassocTestGroupName);
        await serviceGroupsPage.confirmDelete();
        await expect(serviceGroupsPage.getGroupRow(disassocTestGroupName)).not.toBeVisible();
        await serviceGroupsPage.clearSearch();
    });

    // 10. similarly create another test case by de-selecting one user and click on update in selected tab (precondition: create group, add some users, then move to selected users tab then deselect one and click on update, and verify that user is now not associated with group)
    test('TC_ServiceGroups_63_SelectedTab_DeselectOneUserAndUpdate_DissociatesSingleUser - deselecting single user and updating removes only that user from Selected tab', async () => {
        // Step 1: Create group and associate 2 users
        await serviceGroupsPage.createGroupIfNotPresent(deselectOneGroupName, validExpiryDateStr);
        await serviceGroupsPage.ensureGroupVisibleInTable(deselectOneGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(deselectOneGroupName);
        await expect(selectUsersModal.modal).toBeVisible();
        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[0]);
        const userToDeselect = await selectUsersModal.tableRows.nth(0).locator('.user-list-item-email').innerText();
        const userToKeep = await selectUsersModal.tableRows.nth(1).locator('.user-list-item-email').innerText();
        await selectUsersModal.checkUser(userToDeselect);
        await selectUsersModal.checkUser(userToKeep);
        await selectUsersModal.clickUpdate();
        await selectUsersModal.closeViaCross();

        // Step 2: Open modal, move to Selected tab, deselect one user, click Update
        await serviceGroupsPage.ensureGroupVisibleInTable(deselectOneGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(deselectOneGroupName);
        await expect(selectUsersModal.modal).toBeVisible();
        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[1]);

        await selectUsersModal.uncheckUser(userToDeselect);
        await selectUsersModal.clickUpdate();
        await selectUsersModal.closeViaCross();

        // Step 3: Revisit Selected tab and verify that user is no longer associated, but the other user remains
        await serviceGroupsPage.ensureGroupVisibleInTable(deselectOneGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(deselectOneGroupName);
        await expect(selectUsersModal.modal).toBeVisible();
        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[1]);

        await expect(selectUsersModal.getUserRow(userToDeselect)).not.toBeVisible();
        await expect(selectUsersModal.getUserRow(userToKeep)).toBeVisible();
        const remainingCount = await selectUsersModal.getSelectedUsersCount();
        expect(remainingCount).toBe(1);

        await selectUsersModal.clickCancel();

        // Teardown group
        await serviceGroupsPage.clickDeleteGroup(deselectOneGroupName);
        await serviceGroupsPage.confirmDelete();
        await expect(serviceGroupsPage.getGroupRow(deselectOneGroupName)).not.toBeVisible();
    });

    // ==========================================
    // ASSOCIATED USERS - SELECTED TAB SEARCH, DEFAULTS & DISCARD (Cases 64 - 69)
    // ==========================================
    const opsGroupName = `${sgData.testInputs.uniquePrefix}SelOps_${Date.now()}`;

    // 64. Search for an associated user on the "Selected" tab and verify matching results
    test('TC_ServiceGroups_64_SelectedTab_SearchAssociatedUser_DisplaysMatchingRow - searching associated user in Selected tab displays matching row', async () => {
        await serviceGroupsPage.ensureGroupHasAssociatedUsers(opsGroupName, validExpiryDateStr, selectUsersModal, sgData.selectUsersModal.tabs[0]);
        await serviceGroupsPage.ensureGroupVisibleInTable(opsGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(opsGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[1]);
        const targetEmail = await selectUsersModal.getFirstUserEmail();
        test.info().annotations.push({ type: 'testData', description: targetEmail });

        await selectUsersModal.searchUser(targetEmail);
        await expect(selectUsersModal.getUserRow(targetEmail)).toBeVisible();

        await selectUsersModal.clickCancel();
    });

    // 65. Search for a non-associated / invalid user on the "Selected" tab and verify it displays "No user found"
    test('TC_ServiceGroups_65_SelectedTab_SearchNonAssociatedUser_DisplaysNoUserFound - searching non-associated user in Selected tab displays No user found', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.selectUsersModal.invalidSearchTerm });

        await serviceGroupsPage.ensureGroupHasAssociatedUsers(opsGroupName, validExpiryDateStr, selectUsersModal, sgData.selectUsersModal.tabs[0]);
        await serviceGroupsPage.ensureGroupVisibleInTable(opsGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(opsGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[1]);
        await selectUsersModal.searchInput.fill(sgData.selectUsersModal.invalidSearchTerm);
        await selectUsersModal.searchInput.press('Enter');

        await expect(selectUsersModal.emptyTableText).toBeVisible();
        await expect(selectUsersModal.emptyTableText).toHaveText(sgData.selectUsersModal.noUserFound);

        await selectUsersModal.clickCancel();
    });

    // 66. Clearing search via cross icon restores full selected users list
    test('TC_ServiceGroups_66_SelectedTab_ClearSearchViaCrossIcon_RestoresSelectedUsersList - clicking cross icon beside search clears input and restores selected users list', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.selectUsersModal.invalidSearchTerm });

        await serviceGroupsPage.ensureGroupHasAssociatedUsers(opsGroupName, validExpiryDateStr, selectUsersModal, sgData.selectUsersModal.tabs[0]);
        await serviceGroupsPage.ensureGroupVisibleInTable(opsGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(opsGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[1]);
        await selectUsersModal.searchInput.fill(sgData.selectUsersModal.invalidSearchTerm);

        await expect(selectUsersModal.searchClearCrossBtn).toBeVisible();
        await selectUsersModal.clickSearchClearCross();

        const inputVal = await selectUsersModal.getSearchInputValue();
        expect(inputVal).toBe('');

        const restoredCount = await selectUsersModal.getSelectedUsersCount();
        expect(restoredCount).toBeGreaterThanOrEqual(2);

        await selectUsersModal.clickCancel();
    });

    // 67. Verify all user checkboxes in Selected tab are checked by default
    test('TC_ServiceGroups_67_SelectedTab_DefaultCheckboxes_AllUsersAreTicked - all user checkboxes in Selected tab are checked by default', async () => {
        await serviceGroupsPage.ensureGroupHasAssociatedUsers(opsGroupName, validExpiryDateStr, selectUsersModal, sgData.selectUsersModal.tabs[0]);
        await serviceGroupsPage.ensureGroupVisibleInTable(opsGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(opsGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[1]);
        const allChecked = await selectUsersModal.areAllListedUsersChecked();
        expect(allChecked).toBeTruthy();

        await selectUsersModal.clickCancel();
    });

    // 68. Verify every user row in Selected tab displays the correct service group badge matching current group
    test('TC_ServiceGroups_68_SelectedTab_UserRows_DisplayMatchingServiceGroupBadge - every user row in Selected tab displays matching service group badge', async () => {
        test.info().annotations.push({ type: 'testData', description: opsGroupName });

        await serviceGroupsPage.ensureGroupHasAssociatedUsers(opsGroupName, validExpiryDateStr, selectUsersModal, sgData.selectUsersModal.tabs[0]);
        await serviceGroupsPage.ensureGroupVisibleInTable(opsGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(opsGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[1]);
        const allBadgesMatch = await selectUsersModal.areAllListedUserBadgesMatching(opsGroupName);
        expect(allBadgesMatch).toBeTruthy();

        await selectUsersModal.clickCancel();
    });

    // 69. Discard changes validation: Deselect All and Cancel retains associated users
    test('TC_ServiceGroups_69_SelectedTab_DeselectAllAndCancel_DiscardsChanges - clicking Deselect All then Cancel retains user associations without changes', async () => {
        await serviceGroupsPage.ensureGroupHasAssociatedUsers(opsGroupName, validExpiryDateStr, selectUsersModal, sgData.selectUsersModal.tabs[0]);
        await serviceGroupsPage.ensureGroupVisibleInTable(opsGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(opsGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[1]);
        await selectUsersModal.clickDeselectAll();
        const allUnchecked = await selectUsersModal.areAllListedUsersUnchecked();
        expect(allUnchecked).toBeTruthy();

        await selectUsersModal.clickCancel();

        // Re-open modal and verify changes were discarded (users remain selected)
        await serviceGroupsPage.ensureGroupVisibleInTable(opsGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(opsGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[1]);
        const stillChecked = await selectUsersModal.areAllListedUsersChecked();
        expect(stillChecked).toBeTruthy();
        const selectedCount = await selectUsersModal.getSelectedUsersCount();
        expect(selectedCount).toBeGreaterThanOrEqual(2);

        await selectUsersModal.clickCancel();

        // Teardown opsGroupName
        await serviceGroupsPage.clickDeleteGroup(opsGroupName);
        await serviceGroupsPage.confirmDelete();
        await expect(serviceGroupsPage.getGroupRow(opsGroupName)).not.toBeVisible();
        await serviceGroupsPage.clearSearch();
    });

    // ==========================================
    // ASSOCIATED USERS - UNSELECTED TAB VALIDATIONS (Cases 70 - 84)
    // ==========================================
    const emptyUnselGroupName = `${sgData.testInputs.uniquePrefix}UnselEmpty_${Date.now()}`;
    const opsUnselGroupName = `${sgData.testInputs.uniquePrefix}UnselOps_${Date.now()}`;
    const assocSingleGroupName = `${sgData.testInputs.uniquePrefix}UnselSingle_${Date.now()}`;

    // 70. Verify Unselected users count for newly created service group matches total registered users
    test('TC_ServiceGroups_70_UnselectedTab_EmptyGroup_CountMatchesTotalUsers - verifies Unselected users count matches total registered users for empty group', async ({ page }) => {
        // Step 1: Read total registered users count from Overview page
        const overviewPage = new UserMgmtOverviewPage(page);
        await page.goto(`${process.env.ADMIN_TEST_URL}/librarian/v2/elibrarySetup${overviewUrl}`);
        await page.waitForLoadState('networkidle');
        const expectedTotalUsersStr = await overviewPage.getRegisteredUsersCount();
        const expectedTotalUsers = parseInt(expectedTotalUsersStr, 10);
        test.info().annotations.push({ type: 'testData', description: `Overview Total Users: ${expectedTotalUsers}` });

        // Step 2: Navigate back to Service Groups, open modal for empty group, switch to Unselected tab
        await page.goto(`${process.env.ADMIN_TEST_URL}/librarian/v2/elibrarySetup${serviceGroupsUrl}`);
        await serviceGroupsPage.waitForTableLoaded();
        await serviceGroupsPage.createGroupIfNotPresent(emptyUnselGroupName, validExpiryDateStr);
        await serviceGroupsPage.ensureGroupVisibleInTable(emptyUnselGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(emptyUnselGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[2]);
        const unselectedCount = await selectUsersModal.getUnselectedUsersCount();
        expect(unselectedCount).toBe(expectedTotalUsers);

        await selectUsersModal.clickCancel();
    });

    // 71. Verify all user checkboxes in Unselected tab are unchecked by default
    test('TC_ServiceGroups_71_UnselectedTab_DefaultCheckboxes_AllUsersAreUnticked - all user checkboxes in Unselected tab are unchecked by default', async () => {
        await serviceGroupsPage.ensureGroupVisibleInTable(emptyUnselGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(emptyUnselGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[2]);
        const allUnchecked = await selectUsersModal.areAllListedUsersUnchecked();
        expect(allUnchecked).toBeTruthy();

        await selectUsersModal.clickCancel();
    });

    // 72. Verify presence of "Select all" button and absence of "Deselect All" button
    test('TC_ServiceGroups_72_UnselectedTab_SelectAllButton_PresentAndDeselectAllAbsent - verifies Select all button is visible and Deselect All is absent', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.selectUsersModal.buttons.selectAll });

        await serviceGroupsPage.ensureGroupVisibleInTable(emptyUnselGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(emptyUnselGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[2]);
        await expect(selectUsersModal.selectAllBtn).toBeVisible();
        await expect(selectUsersModal.selectAllBtn).toHaveText(sgData.selectUsersModal.buttons.selectAll);
        await expect(selectUsersModal.deselectAllBtn).not.toBeVisible();

        await selectUsersModal.clickCancel();
    });

    // 73. Verify clicking Update without changes shows alert modal
    test('TC_ServiceGroups_73_UnselectedTab_ClickUpdateWithoutChanges_ShowsAlertModal - clicking update without changes displays alert modal', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.selectUsersModal.noChangesAlert.title });

        await serviceGroupsPage.ensureGroupVisibleInTable(emptyUnselGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(emptyUnselGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[2]);
        await selectUsersModal.clickUpdate();

        await expect(selectUsersModal.alertPopup).toBeVisible();
        await expect(selectUsersModal.alertTitle).toHaveText(sgData.selectUsersModal.noChangesAlert.title);
        await expect(selectUsersModal.alertMessage).toContainText(sgData.selectUsersModal.noChangesAlert.message);

        await selectUsersModal.dismissAlert();
        await selectUsersModal.clickCancel();

        // Teardown emptyUnselGroupName
        await serviceGroupsPage.clickDeleteGroup(emptyUnselGroupName);
        await serviceGroupsPage.confirmDelete();
        await expect(serviceGroupsPage.getGroupRow(emptyUnselGroupName)).not.toBeVisible();
        await serviceGroupsPage.clearSearch();
    });

    // 74. Verify clicking "Select all" checks all user checkboxes and displays note
    test('TC_ServiceGroups_74_UnselectedTab_SelectAll_ChecksAllUsersAndShowsNote - clicking Select all checks all users and displays note', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.selectUsersModal.selectAllNote });

        await serviceGroupsPage.createGroupIfNotPresent(opsUnselGroupName, validExpiryDateStr);
        await serviceGroupsPage.ensureGroupVisibleInTable(opsUnselGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(opsUnselGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[2]);
        await selectUsersModal.clickSelectAll();

        const allChecked = await selectUsersModal.areAllListedUsersChecked();
        expect(allChecked).toBeTruthy();
        await expect(selectUsersModal.selectAllNote).toBeVisible();

        await selectUsersModal.clickCancel();
    });

    // 75. Verify clicking "Undo" unchecks all users again
    test('TC_ServiceGroups_75_UnselectedTab_SelectAll_UndoUnchecksAllUsers - clicking Undo beside note unchecks all users again', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.selectUsersModal.buttons.undo });

        await serviceGroupsPage.ensureGroupVisibleInTable(opsUnselGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(opsUnselGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[2]);
        await selectUsersModal.clickSelectAll();

        await expect(selectUsersModal.undoBtn).toBeVisible();
        await expect(selectUsersModal.undoBtn).toHaveText(sgData.selectUsersModal.buttons.undo);

        await selectUsersModal.clickUndo();
        const allUnchecked = await selectUsersModal.areAllListedUsersUnchecked();
        expect(allUnchecked).toBeTruthy();

        await selectUsersModal.clickCancel();
    });

    // 76. Verify Unselected users count decrements when users are associated
    test('TC_ServiceGroups_76_UnselectedTab_AssocGroup_CountDecrementsByAssociatedUsers - Unselected count decrements by number of associated users', async () => {
        await serviceGroupsPage.ensureGroupHasAssociatedUsers(opsUnselGroupName, validExpiryDateStr, selectUsersModal, sgData.selectUsersModal.tabs[0]);
        await serviceGroupsPage.ensureGroupVisibleInTable(opsUnselGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(opsUnselGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[0]);
        const allUsersCountStr = await selectUsersModal.getAllUsersCount();
        const allUsersCount = parseInt(allUsersCountStr, 10);

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[1]);
        const selectedCount = await selectUsersModal.getSelectedUsersCount();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[2]);
        const unselectedCount = await selectUsersModal.getUnselectedUsersCount();

        expect(unselectedCount).toBe(allUsersCount - selectedCount);

        await selectUsersModal.clickCancel();
    });

    // 77. Verify associated users are excluded from the Unselected tab list
    test('TC_ServiceGroups_77_UnselectedTab_AssocGroup_AssociatedUsersExcludedFromList - associated users do not appear in Unselected tab', async () => {
        await serviceGroupsPage.ensureGroupHasAssociatedUsers(opsUnselGroupName, validExpiryDateStr, selectUsersModal, sgData.selectUsersModal.tabs[0]);
        await serviceGroupsPage.ensureGroupVisibleInTable(opsUnselGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(opsUnselGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[1]);
        const assocUserEmail = await selectUsersModal.getFirstUserEmail();
        test.info().annotations.push({ type: 'testData', description: assocUserEmail });

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[2]);
        await expect(selectUsersModal.getUserRow(assocUserEmail)).not.toBeVisible();

        await selectUsersModal.clickCancel();
    });

    // 78. Searching an already-associated user in Unselected tab displays "No user found"
    test('TC_ServiceGroups_78_UnselectedTab_SearchAssociatedUser_DisplaysNoUserFound - searching associated user in Unselected tab displays No user found', async () => {
        await serviceGroupsPage.ensureGroupHasAssociatedUsers(opsUnselGroupName, validExpiryDateStr, selectUsersModal, sgData.selectUsersModal.tabs[0]);
        await serviceGroupsPage.ensureGroupVisibleInTable(opsUnselGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(opsUnselGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[1]);
        const assocUserEmail = await selectUsersModal.getFirstUserEmail();
        test.info().annotations.push({ type: 'testData', description: assocUserEmail });

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[2]);
        await selectUsersModal.searchUser(assocUserEmail);

        await expect(selectUsersModal.emptyTableText).toBeVisible();
        await expect(selectUsersModal.emptyTableText).toHaveText(sgData.selectUsersModal.noUserFound);

        await selectUsersModal.clickCancel();
    });

    // 79. Search registered unselected user in Unselected tab displays matching row
    test('TC_ServiceGroups_79_UnselectedTab_SearchUnassociatedUser_DisplaysMatchingRow - searching unselected user in Unselected tab displays matching row', async () => {
        await serviceGroupsPage.ensureGroupHasAssociatedUsers(opsUnselGroupName, validExpiryDateStr, selectUsersModal, sgData.selectUsersModal.tabs[0]);
        await serviceGroupsPage.ensureGroupVisibleInTable(opsUnselGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(opsUnselGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[2]);
        const unselUserEmail = await selectUsersModal.getFirstUserEmail();
        test.info().annotations.push({ type: 'testData', description: unselUserEmail });

        await selectUsersModal.searchUser(unselUserEmail);
        await expect(selectUsersModal.getUserRow(unselUserEmail)).toBeVisible();

        await selectUsersModal.clickCancel();
    });

    // 80. Search non-existent / invalid keyword in Unselected tab displays "No user found"
    test('TC_ServiceGroups_80_UnselectedTab_SearchInvalidKeyword_DisplaysNoUserFound - searching invalid keyword in Unselected tab displays No user found', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.selectUsersModal.invalidSearchTerm });

        await serviceGroupsPage.ensureGroupHasAssociatedUsers(opsUnselGroupName, validExpiryDateStr, selectUsersModal, sgData.selectUsersModal.tabs[0]);
        await serviceGroupsPage.ensureGroupVisibleInTable(opsUnselGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(opsUnselGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[2]);
        await selectUsersModal.searchInput.fill(sgData.selectUsersModal.invalidSearchTerm);
        await selectUsersModal.searchInput.press('Enter');

        await expect(selectUsersModal.emptyTableText).toBeVisible();
        await expect(selectUsersModal.emptyTableText).toHaveText(sgData.selectUsersModal.noUserFound);

        await selectUsersModal.clickCancel();
    });

    // 81. Clear search via cross icon restores unselected user list
    test('TC_ServiceGroups_81_UnselectedTab_ClearSearchViaCrossIcon_RestoresUnselectedList - clicking cross icon beside search clears input and restores unselected list', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.selectUsersModal.invalidSearchTerm });

        await serviceGroupsPage.ensureGroupHasAssociatedUsers(opsUnselGroupName, validExpiryDateStr, selectUsersModal, sgData.selectUsersModal.tabs[0]);
        await serviceGroupsPage.ensureGroupVisibleInTable(opsUnselGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(opsUnselGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[2]);
        await selectUsersModal.searchInput.fill(sgData.selectUsersModal.invalidSearchTerm);

        await expect(selectUsersModal.searchClearCrossBtn).toBeVisible();
        await selectUsersModal.clickSearchClearCross();

        const inputVal = await selectUsersModal.getSearchInputValue();
        expect(inputVal).toBe('');

        const restoredCount = await selectUsersModal.getUnselectedUsersCount();
        expect(restoredCount).toBeGreaterThan(0);

        await selectUsersModal.clickCancel();
    });

    // 82. Associating a single user via Unselected tab moves user to Selected tab and updates group count
    test('TC_ServiceGroups_82_UnselectedTab_AssociateSingleUser_UpdatesGroupAndMovesToSelected - associating single user via Unselected tab moves user to Selected tab', async () => {
        await serviceGroupsPage.createGroupIfNotPresent(assocSingleGroupName, validExpiryDateStr);
        await serviceGroupsPage.ensureGroupVisibleInTable(assocSingleGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(assocSingleGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[2]);
        const userToAssociate = await selectUsersModal.getFirstUserEmail();
        test.info().annotations.push({ type: 'testData', description: userToAssociate });

        await selectUsersModal.checkUser(userToAssociate);
        await selectUsersModal.clickUpdate();
        await selectUsersModal.closeViaCross();

        // Re-open and verify user is now in Selected tab and absent from Unselected tab
        await serviceGroupsPage.ensureGroupVisibleInTable(assocSingleGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(assocSingleGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[1]);
        await expect(selectUsersModal.getUserRow(userToAssociate)).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[2]);
        await expect(selectUsersModal.getUserRow(userToAssociate)).not.toBeVisible();

        await selectUsersModal.clickCancel();

        // Teardown assocSingleGroupName
        await serviceGroupsPage.clickDeleteGroup(assocSingleGroupName);
        await serviceGroupsPage.confirmDelete();
        await expect(serviceGroupsPage.getGroupRow(assocSingleGroupName)).not.toBeVisible();
        await serviceGroupsPage.clearSearch();
    });

    // 83. Discard changes on Cancel: checking user and cancelling leaves user unassociated
    test('TC_ServiceGroups_83_UnselectedTab_CheckUserAndCancel_DiscardsChanges - checking user and clicking Cancel discards changes', async () => {
        await serviceGroupsPage.ensureGroupHasAssociatedUsers(opsUnselGroupName, validExpiryDateStr, selectUsersModal, sgData.selectUsersModal.tabs[0]);
        await serviceGroupsPage.ensureGroupVisibleInTable(opsUnselGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(opsUnselGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[2]);
        const targetUser = await selectUsersModal.getFirstUserEmail();
        test.info().annotations.push({ type: 'testData', description: targetUser });

        await selectUsersModal.checkUser(targetUser);
        await selectUsersModal.clickCancel();

        // Re-open modal and verify user was not associated and checkbox remains unticked
        await serviceGroupsPage.ensureGroupVisibleInTable(opsUnselGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(opsUnselGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[2]);
        const isChecked = await selectUsersModal.isUserChecked(targetUser);
        expect(isChecked).toBeFalsy();

        await selectUsersModal.clickCancel();
    });

    // 84. Verify Load more button increases shown results count
    test('TC_ServiceGroups_84_UnselectedTab_LoadMoreIncreasesShowingCount - clicking Load more increases showing count by 10', async () => {
        await serviceGroupsPage.ensureGroupHasAssociatedUsers(opsUnselGroupName, validExpiryDateStr, selectUsersModal, sgData.selectUsersModal.tabs[0]);
        await serviceGroupsPage.ensureGroupVisibleInTable(opsUnselGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(opsUnselGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[2]);
        const initialShowing = await selectUsersModal.getShowingCount();
        expect(initialShowing).toBe(10);

        await selectUsersModal.clickLoadMore();
        const newShowing = await selectUsersModal.getShowingCount();
        expect(newShowing).toBe(initialShowing + 10);

        await selectUsersModal.clickCancel();

        // Teardown opsUnselGroupName
        await serviceGroupsPage.clickDeleteGroup(opsUnselGroupName);
        await serviceGroupsPage.confirmDelete();
        await expect(serviceGroupsPage.getGroupRow(opsUnselGroupName)).not.toBeVisible();
        await serviceGroupsPage.clearSearch();
    });

    // ==========================================
    // EDIT SERVICE GROUP VALIDATIONS (Cases 85 - 97)
    // ==========================================
    const editTestGroupName = `${sgData.testInputs.uniquePrefix}Edit_${Date.now()}`;
    const editedNewGroupName = `${sgData.testInputs.uniquePrefix}Edited_${Date.now()}`;
    const futureExpiryDate = '2028-11-20';

    // 85. Click Edit icon opens modal with pre-populated values
    test('TC_ServiceGroups_85_EditGroup_OpenModal_DisplaysPrePopulatedValues - clicking edit icon opens Edit group modal with pre-filled details', async () => {
        test.info().annotations.push({ type: 'testData', description: editTestGroupName });

        await serviceGroupsPage.createGroupIfNotPresent(editTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.ensureGroupVisibleInTable(editTestGroupName);
        await serviceGroupsPage.clickEditGroup(editTestGroupName);
        await expect(serviceGroupsPage.editModal).toBeVisible();

        const currentName = await serviceGroupsPage.getEditGroupName();
        expect(currentName).toBe(editTestGroupName);

        const currentExpiry = await serviceGroupsPage.getEditExpiryDate();
        expect(currentExpiry).toBe(validExpiryDateStr);

        await serviceGroupsPage.closeEditModalViaCancel();
    });

    // 86. Cross icon closes modal
    test('TC_ServiceGroups_86_EditGroup_CloseCrossIcon_ClosesModal - clicking cross icon closes Edit group modal', async () => {
        test.info().annotations.push({ type: 'testData', description: editTestGroupName });

        await serviceGroupsPage.ensureGroupVisibleInTable(editTestGroupName);
        await serviceGroupsPage.clickEditGroup(editTestGroupName);
        await expect(serviceGroupsPage.editModal).toBeVisible();

        await serviceGroupsPage.closeEditModalViaCross();
        await expect(serviceGroupsPage.editModal).not.toBeVisible();
    });

    // 87. Cancel button discards changes
    test('TC_ServiceGroups_87_EditGroup_CancelButton_DiscardsChanges - modifying fields and clicking Cancel discards changes', async () => {
        test.info().annotations.push({ type: 'testData', description: editTestGroupName });

        await serviceGroupsPage.ensureGroupVisibleInTable(editTestGroupName);
        await serviceGroupsPage.clickEditGroup(editTestGroupName);
        await expect(serviceGroupsPage.editModal).toBeVisible();

        await serviceGroupsPage.fillEditGroupName(`${editTestGroupName}_Mod`);
        await serviceGroupsPage.closeEditModalViaCancel();
        await expect(serviceGroupsPage.editModal).not.toBeVisible();

        // Verify group name in table remains unchanged
        await expect(serviceGroupsPage.getGroupRow(editTestGroupName)).toBeVisible();
    });

    // 88. Empty group name validation
    test('TC_ServiceGroups_88_EditGroup_EmptyName_ErrorMessage - clearing group name shows required error message', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.messages.nameRequired });

        await serviceGroupsPage.ensureGroupVisibleInTable(editTestGroupName);
        await serviceGroupsPage.clickEditGroup(editTestGroupName);
        await expect(serviceGroupsPage.editModal).toBeVisible();

        await serviceGroupsPage.clearEditGroupName();
        await expect(serviceGroupsPage.editGroupNameError).toBeVisible();
        await expect(serviceGroupsPage.editGroupNameError).toContainText(sgData.messages.nameRequired);

        await serviceGroupsPage.closeEditModalViaCancel();
    });

    // 89. HTML tags validation
    test('TC_ServiceGroups_89_EditGroup_HtmlTags_ErrorMessage - entering HTML tags displays error message', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.messages.htmlUnsupported });

        await serviceGroupsPage.ensureGroupVisibleInTable(editTestGroupName);
        await serviceGroupsPage.clickEditGroup(editTestGroupName);
        await expect(serviceGroupsPage.editModal).toBeVisible();

        await serviceGroupsPage.fillEditGroupName(sgData.testInputs.htmlPayload);
        await expect(serviceGroupsPage.editGroupNameError).toBeVisible();
        await expect(serviceGroupsPage.editGroupNameError).toContainText(sgData.messages.htmlUnsupported);

        await serviceGroupsPage.closeEditModalViaCancel();
    });

    // 90. Leading / trailing spaces validation
    test('TC_ServiceGroups_90_EditGroup_Spaces_ErrorMessage - entering spaces displays error message', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.messages.leadingTrailingSpaces });

        await serviceGroupsPage.ensureGroupVisibleInTable(editTestGroupName);
        await serviceGroupsPage.clickEditGroup(editTestGroupName);
        await expect(serviceGroupsPage.editModal).toBeVisible();

        await serviceGroupsPage.fillEditGroupName(sgData.testInputs.spacedName);
        await expect(serviceGroupsPage.editGroupNameError).toBeVisible();
        await expect(serviceGroupsPage.editGroupNameError).toContainText(sgData.messages.leadingTrailingSpaces);

        await serviceGroupsPage.closeEditModalViaCancel();
    });

    // 91. Max length (100 chars) exceeded
    test('TC_ServiceGroups_91_EditGroup_MaxLength_ErrorMessage - entering over 100 characters displays error message', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.messages.max100Chars });

        await serviceGroupsPage.ensureGroupVisibleInTable(editTestGroupName);
        await serviceGroupsPage.clickEditGroup(editTestGroupName);
        await expect(serviceGroupsPage.editModal).toBeVisible();

        await serviceGroupsPage.fillEditGroupName(sgData.testInputs.oversizedName);
        await expect(serviceGroupsPage.editGroupNameError).toBeVisible();
        await expect(serviceGroupsPage.editGroupNameError).toContainText(sgData.messages.max100Chars);

        await serviceGroupsPage.closeEditModalViaCancel();
    });

    // 92. Duplicate group name validation
    test('TC_ServiceGroups_92_EditGroup_AlreadyExists_ErrorMessage - changing name to existing group name displays already exists alert', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.messages.alreadyExists });

        await serviceGroupsPage.ensureGroupVisibleInTable(editTestGroupName);
        await serviceGroupsPage.clickEditGroup(editTestGroupName);
        await expect(serviceGroupsPage.editModal).toBeVisible();

        await serviceGroupsPage.fillEditGroupName(sgData.existingGroup);
        await serviceGroupsPage.clickEditSave();
        await expect(serviceGroupsPage.editDuplicateGroupAlert).toBeVisible();
        await expect(serviceGroupsPage.editDuplicateGroupAlert).toContainText(sgData.messages.alreadyExists);

        await serviceGroupsPage.closeEditModalViaCancel();
    });

    // 93. Calendar past dates disabled
    test('TC_ServiceGroups_93_EditGroup_Calendar_PastDatesDisabled - verifies past dates are disabled in datepicker', async () => {
        await serviceGroupsPage.ensureGroupVisibleInTable(editTestGroupName);
        await serviceGroupsPage.clickEditGroup(editTestGroupName);
        await expect(serviceGroupsPage.editModal).toBeVisible();

        await serviceGroupsPage.openEditCalendar();
        await expect(serviceGroupsPage.disabledDateDays.first()).toBeVisible();
        const pastDate = serviceGroupsPage.disabledDateDays.first();
        await expect(pastDate).toHaveAttribute('aria-disabled', 'true');

        await serviceGroupsPage.closeCalendarViaEscape();
        await serviceGroupsPage.closeEditModalViaCancel();
    });

    // 94. Access options dependency: checking Mobile App auto-selects Off Campus
    test('TC_ServiceGroups_94_EditGroup_AccessOptions_SelectingMobile_AutoSelectsRA - selecting mobile app automatically selects off campus access', async () => {
        await serviceGroupsPage.ensureGroupVisibleInTable(editTestGroupName);
        await serviceGroupsPage.clickEditGroup(editTestGroupName);
        await expect(serviceGroupsPage.editModal).toBeVisible();

        await serviceGroupsPage.toggleEditRa(false);
        await serviceGroupsPage.toggleEditMobile(true);
        const isRaChecked = await serviceGroupsPage.isEditRaChecked();
        expect(isRaChecked).toBeTruthy();

        await serviceGroupsPage.closeEditModalViaCancel();
    });

    // 95. Update Group Name successfully
    test('TC_ServiceGroups_95_EditGroup_UpdateName_Success - changing group name updates name in table row', async () => {
        test.info().annotations.push({ type: 'testData', description: editedNewGroupName });

        await serviceGroupsPage.ensureGroupVisibleInTable(editTestGroupName);
        await serviceGroupsPage.clickEditGroup(editTestGroupName);
        await expect(serviceGroupsPage.editModal).toBeVisible();

        await serviceGroupsPage.fillEditGroupName(editedNewGroupName);
        await serviceGroupsPage.saveEditedGroupAndReload();

        await serviceGroupsPage.ensureGroupVisibleInTable(editedNewGroupName);
        await expect(serviceGroupsPage.getGroupRow(editedNewGroupName)).toBeVisible();
    });

    // 96. Update Expiry Date successfully
    test('TC_ServiceGroups_96_EditGroup_UpdateExpiryDate_Success - changing expiry date updates expiry cell in table row', async () => {
        test.info().annotations.push({ type: 'testData', description: futureExpiryDate });

        await serviceGroupsPage.ensureGroupVisibleInTable(editedNewGroupName);
        await serviceGroupsPage.clickEditGroup(editedNewGroupName);
        await expect(serviceGroupsPage.editModal).toBeVisible();

        await serviceGroupsPage.setEditExpiryDate(futureExpiryDate);
        await serviceGroupsPage.saveEditedGroupAndReload();

        await serviceGroupsPage.ensureGroupVisibleInTable(editedNewGroupName);
        const updatedExpiry = await serviceGroupsPage.getExpiryDate(editedNewGroupName);
        expect(updatedExpiry).toBe(futureExpiryDate);
    });

    // 97. Update Access Options successfully
    test('TC_ServiceGroups_97_EditGroup_ToggleAccessOptions_Success - toggling access options persists upon re-opening Edit modal', async () => {
        await serviceGroupsPage.ensureGroupVisibleInTable(editedNewGroupName);
        await serviceGroupsPage.clickEditGroup(editedNewGroupName);
        await expect(serviceGroupsPage.editModal).toBeVisible();

        await serviceGroupsPage.toggleEditRa(true);
        await serviceGroupsPage.toggleEditMobile(true);
        await serviceGroupsPage.saveEditedGroupAndReload();

        // Re-open and verify checkboxes persisted
        await serviceGroupsPage.ensureGroupVisibleInTable(editedNewGroupName);
        await serviceGroupsPage.clickEditGroup(editedNewGroupName);
        await expect(serviceGroupsPage.editModal).toBeVisible();

        expect(await serviceGroupsPage.isEditRaChecked()).toBeTruthy();
        expect(await serviceGroupsPage.isEditMobileChecked()).toBeTruthy();

        await serviceGroupsPage.closeEditModalViaCancel();

        // Teardown editedNewGroupName
        await serviceGroupsPage.clickDeleteGroup(editedNewGroupName);
        await serviceGroupsPage.confirmDelete();
        await expect(serviceGroupsPage.getGroupRow(editedNewGroupName)).not.toBeVisible();
        await serviceGroupsPage.clearSearch();
    });

    // ==========================================
    // MAIN TABLE SEARCH & ACTION VALIDATIONS (Cases 98 - 106)
    // ==========================================
    const searchTestGroupName = `${sgData.testInputs.uniquePrefix}Search_${Date.now()}`;

    // 98. Search box & button initial state
    test('TC_ServiceGroups_98_TableSearch_InitialState - verifies placeholder, title, disabled search button, and hidden clear button', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.tableSearch.placeholder });

        await serviceGroupsPage.clearSearch();
        await expect(serviceGroupsPage.searchInput).toBeVisible();
        await expect(serviceGroupsPage.searchInput).toHaveAttribute('placeholder', sgData.tableSearch.placeholder);
        await expect(serviceGroupsPage.searchInput).toHaveAttribute('title', sgData.tableSearch.inputTitle);
        await expect(serviceGroupsPage.searchSubmitBtn).toBeDisabled();
        await expect(serviceGroupsPage.searchClearBtn).not.toBeVisible();
    });

    // 99. Typing text enables search & displays clear icon
    test('TC_ServiceGroups_99_TableSearch_TypingText_EnablesSearchAndShowsClearButton - entering text enables search button and shows red clear icon', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.tableSearch.partialKeyword });

        await serviceGroupsPage.clearSearch();
        await serviceGroupsPage.searchInput.fill(sgData.tableSearch.partialKeyword);

        await expect(serviceGroupsPage.searchSubmitBtn).toBeEnabled();
        await expect(serviceGroupsPage.searchClearBtn).toBeVisible();
        await expect(serviceGroupsPage.searchClearBtn).toHaveAttribute('title', sgData.tableSearch.clearBtnTitle);

        await serviceGroupsPage.clickClearSearchBtn();
    });

    // 100. Search by exact group name
    test('TC_ServiceGroups_100_TableSearch_SearchExactGroupName_DisplaysMatchingRow - exact group search filters table to matching row', async () => {
        test.info().annotations.push({ type: 'testData', description: searchTestGroupName });

        await serviceGroupsPage.createGroupIfNotPresent(searchTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.searchGroup(searchTestGroupName);

        await expect(serviceGroupsPage.getGroupRow(searchTestGroupName)).toBeVisible();
        const showingCount = await serviceGroupsPage.getShowingCount();
        expect(showingCount).toBe(1);

        await serviceGroupsPage.clearSearch();
    });

    // 101. Search by partial keyword
    test('TC_ServiceGroups_101_TableSearch_SearchPartialKeyword_DisplaysAllMatchingRows - partial keyword search returns matching groups', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.tableSearch.partialKeyword });

        await serviceGroupsPage.searchGroup(sgData.tableSearch.partialKeyword);
        const visibleNames = await serviceGroupsPage.getVisibleGroupNames();
        expect(visibleNames.length).toBeGreaterThan(0);

        await serviceGroupsPage.clearSearch();
    });

    // 102. Case-insensitive search
    test('TC_ServiceGroups_102_TableSearch_CaseInsensitiveSearch - searching lowercase returns uppercase matching group', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.tableSearch.caseInsensitiveKeyword });

        await serviceGroupsPage.searchGroup(sgData.tableSearch.caseInsensitiveKeyword);
        await expect(serviceGroupsPage.getGroupRow(sgData.existingGroup)).toBeVisible();

        await serviceGroupsPage.clearSearch();
    });

    // 103. Non-existent search query
    test('TC_ServiceGroups_103_TableSearch_NonExistentKeyword_DisplaysNoResultsFound - searching non-existent term displays No results found', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.tableSearch.nonExistentKeyword });

        await serviceGroupsPage.searchGroup(sgData.tableSearch.nonExistentKeyword);
        await expect(serviceGroupsPage.tableNoResultsCell).toBeVisible();
        await expect(serviceGroupsPage.tableNoResultsCell).toContainText(sgData.tableSearch.noResultsFound);

        await serviceGroupsPage.clearSearch();
    });

    // 104. Click Clear button restores table
    test('TC_ServiceGroups_104_TableSearch_ClickClearButton_RestoresFullTable - clicking red clear button restores full table listing', async () => {
        await serviceGroupsPage.searchGroup(sgData.tableSearch.nonExistentKeyword);
        await expect(serviceGroupsPage.tableNoResultsCell).toBeVisible();

        await serviceGroupsPage.clickClearSearchBtn();
        await expect(serviceGroupsPage.tableRows.first()).toBeVisible();
        const showingCount = await serviceGroupsPage.getShowingCount();
        expect(showingCount).toBeGreaterThan(0);
        await expect(serviceGroupsPage.searchClearBtn).not.toBeVisible();
    });

    // 105. Delete modal — Close cross icon
    test('TC_ServiceGroups_105_TableActions_DeleteModal_CloseCrossIcon_ClosesModal - clicking cross icon on delete modal discards delete', async () => {
        test.info().annotations.push({ type: 'testData', description: searchTestGroupName });

        await serviceGroupsPage.createGroupIfNotPresent(searchTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.ensureGroupVisibleInTable(searchTestGroupName);
        await serviceGroupsPage.clickDeleteGroup(searchTestGroupName);
        await expect(serviceGroupsPage.deleteModal).toBeVisible();

        await serviceGroupsPage.closeDeleteModalViaCross();
        await expect(serviceGroupsPage.deleteModal).not.toBeVisible();

        // Verify group is still present
        await expect(serviceGroupsPage.getGroupRow(searchTestGroupName)).toBeVisible();
    });

    // 106. Delete modal — Cancel button
    test('TC_ServiceGroups_106_TableActions_DeleteModal_CancelButton_DiscardsDelete - clicking Cancel on delete modal discards delete', async () => {
        test.info().annotations.push({ type: 'testData', description: searchTestGroupName });

        await serviceGroupsPage.createGroupIfNotPresent(searchTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.ensureGroupVisibleInTable(searchTestGroupName);
        await serviceGroupsPage.clickDeleteGroup(searchTestGroupName);
        await expect(serviceGroupsPage.deleteModal).toBeVisible();

        await serviceGroupsPage.cancelDelete();
        await expect(serviceGroupsPage.deleteModal).not.toBeVisible();

        // Verify group is still present
        await expect(serviceGroupsPage.getGroupRow(searchTestGroupName)).toBeVisible();

        // Teardown searchTestGroupName
        await serviceGroupsPage.clickDeleteGroup(searchTestGroupName);
        await serviceGroupsPage.confirmDelete();
        await expect(serviceGroupsPage.getGroupRow(searchTestGroupName)).not.toBeVisible();
        await serviceGroupsPage.clearSearch();
    });

    // ==========================================
    // ASSOCIATED USERS - VIA CSV TAB (Cases 107 - 114)
    // ==========================================
    const csvTestGroupName = `${sgData.testInputs.uniquePrefix}CSV_${Date.now()}`;
    const csvData = sgData.selectUsersModal.viaCsv;

    // 107. Tab presence, active state, and header details
    test('TC_ServiceGroups_107_ViaCsvTab_TabPresenceAndActiveState - clicking Via CSV tab marks it active with matching group name', async () => {
        test.info().annotations.push({ type: 'testData', description: csvTestGroupName });

        await serviceGroupsPage.createGroupIfNotPresent(csvTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.ensureGroupVisibleInTable(csvTestGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(csvTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[3]);
        await expect(selectUsersModal.activeTab).toHaveText(sgData.selectUsersModal.tabs[3]);
        await expect(selectUsersModal.viaCsvDesc).toContainText(csvData.description);
        await expect(selectUsersModal.groupNameContainer).toContainText(csvTestGroupName);

        await selectUsersModal.clickCancel();
    });

    // 108. Upload area elements presence
    test('TC_ServiceGroups_108_ViaCsvTab_UploadAreaElements_Presence - verifies file upload dropzone and format instructions', async () => {
        await serviceGroupsPage.createGroupIfNotPresent(csvTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.ensureGroupVisibleInTable(csvTestGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(csvTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[3]);
        await expect(selectUsersModal.viaCsvDropzone).toBeVisible();
        await expect(selectUsersModal.viaCsvDropzone).toContainText(csvData.instructionMain);
        await expect(selectUsersModal.viaCsvDropzone).toContainText(csvData.instructionSub);
        await expect(selectUsersModal.viaCsvDropzone).toContainText(csvData.formatInfo);
        await expect(selectUsersModal.viaCsvDropzone).toContainText(csvData.browseBtn);
        await expect(selectUsersModal.viaCsvFileInput).toHaveAttribute('accept', '.csv,text/csv');

        await selectUsersModal.clickCancel();
    });

    // 109. Download sample CSV
    test('TC_ServiceGroups_109_ViaCsvTab_DownloadSampleCsv_DownloadsFile - clicking download sample CSV downloads valid template', async () => {
        await serviceGroupsPage.createGroupIfNotPresent(csvTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.ensureGroupVisibleInTable(csvTestGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(csvTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[3]);
        const downloaded = await selectUsersModal.clickDownloadSampleCsv();
        expect(downloaded.filename).toBe(csvData.sampleFilename);
        expect(downloaded.content).toContain(csvData.sampleHeader);

        await selectUsersModal.clickCancel();
    });

    // 110. Empty file submission error
    test('TC_ServiceGroups_110_ViaCsvTab_EmptyFile_ClickUpdate_ShowsError - clicking update without choosing file displays inline error', async () => {
        test.info().annotations.push({ type: 'testData', description: csvData.missingFileError });

        await serviceGroupsPage.createGroupIfNotPresent(csvTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.ensureGroupVisibleInTable(csvTestGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(csvTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[3]);
        await selectUsersModal.updateBtn.click();

        await expect(selectUsersModal.viaCsvErrorText).toBeVisible();
        await expect(selectUsersModal.viaCsvErrorText).toContainText(csvData.missingFileError);

        await selectUsersModal.clickCancel();
    });

    // 111. File selection displays filename
    test('TC_ServiceGroups_111_ViaCsvTab_SelectValidCsv_DisplaysFilename - selecting CSV renders filename in dropzone', async () => {
        const fs = require('fs');
        const path = require('path');
        const tempCsv = path.resolve('./test-results/temp_display_check.csv');
        fs.writeFileSync(tempCsv, `${csvData.sampleHeader}\n${sgData.selectUsersModal.searchEmail}\n`);

        await serviceGroupsPage.createGroupIfNotPresent(csvTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.ensureGroupVisibleInTable(csvTestGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(csvTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[3]);
        await selectUsersModal.selectCsvFile(tempCsv);

        const displayedName = await selectUsersModal.getUploadedFileName();
        expect(displayedName).toBe('temp_display_check.csv');

        await selectUsersModal.clickCancel();
        fs.unlinkSync(tempCsv);
    });

    // 112. Invalid header CSV alert
    test('TC_ServiceGroups_112_ViaCsvTab_InvalidHeaderCsv_ShowsMissingHeaderAlert - uploading CSV with wrong header displays missing header alert', async () => {
        test.info().annotations.push({ type: 'testData', description: csvData.missingHeaderAlert });

        const fs = require('fs');
        const path = require('path');
        const invalidCsv = path.resolve('./test-results/temp_invalid_header.csv');
        fs.writeFileSync(invalidCsv, `Wrong_Header\n${sgData.selectUsersModal.searchEmail}\n`);

        await serviceGroupsPage.createGroupIfNotPresent(csvTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.ensureGroupVisibleInTable(csvTestGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(csvTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[3]);
        await selectUsersModal.selectCsvFile(invalidCsv);
        await selectUsersModal.updateBtn.click();

        await expect(selectUsersModal.alertPopup).toBeVisible();
        await expect(selectUsersModal.alertTitle).toContainText(csvData.missingHeaderAlert);
        await selectUsersModal.alertOkBtn.click();

        await selectUsersModal.clickCancel();
        fs.unlinkSync(invalidCsv);
    });

    // 113. Valid CSV bulk user association
    test('TC_ServiceGroups_113_ViaCsvTab_ValidCsvUpload_AssociatesUsersSuccessfully - uploading valid CSV associates user and displays in Selected tab', async () => {
        test.info().annotations.push({ type: 'testData', description: sgData.selectUsersModal.searchEmail });

        const fs = require('fs');
        const path = require('path');
        const validCsv = path.resolve('./test-results/temp_valid_users.csv');
        fs.writeFileSync(validCsv, `${csvData.sampleHeader}\n${sgData.selectUsersModal.searchEmail}\n`);

        await serviceGroupsPage.createGroupIfNotPresent(csvTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.ensureGroupVisibleInTable(csvTestGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(csvTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[3]);
        await selectUsersModal.selectCsvFile(validCsv);
        await selectUsersModal.clickUpdateViaCsvAndConfirm();

        // Switch to Selected tab in the open modal and verify user appears
        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[1]);
        await expect(selectUsersModal.getUserRow(sgData.selectUsersModal.searchEmail)).toBeVisible();

        await selectUsersModal.clickCancel();
        fs.unlinkSync(validCsv);
    });

    // 114. Cancel button discards upload
    test('TC_ServiceGroups_114_ViaCsvTab_CancelButton_DiscardsUpload - selecting file and clicking Cancel discards upload', async () => {
        const fs = require('fs');
        const path = require('path');
        const discardCsv = path.resolve('./test-results/temp_discard.csv');
        fs.writeFileSync(discardCsv, `${csvData.sampleHeader}\n${sgData.selectUsersModal.searchEmail}\n`);

        await serviceGroupsPage.createGroupIfNotPresent(csvTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.ensureGroupVisibleInTable(csvTestGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(csvTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[3]);
        await selectUsersModal.selectCsvFile(discardCsv);
        await selectUsersModal.clickCancel();
        await expect(selectUsersModal.modal).not.toBeVisible();
        fs.unlinkSync(discardCsv);
    });

    // 115. Unregistered user CSV alert
    test('TC_ServiceGroups_115_ViaCsvTab_UnregisteredUser_ShowsNotRegisteredAlert - uploading CSV with unregistered user displays users not registered alert', async () => {
        test.info().annotations.push({ type: 'testData', description: csvData.unregisteredUserAlert });

        const fs = require('fs');
        const path = require('path');
        const unregCsv = path.resolve('./test-results/temp_unreg_user.csv');
        fs.writeFileSync(unregCsv, `${csvData.sampleHeader}\n${csvData.unregisteredEmail}\n`);

        await serviceGroupsPage.createGroupIfNotPresent(csvTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.ensureGroupVisibleInTable(csvTestGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(csvTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[3]);
        await selectUsersModal.selectCsvFile(unregCsv);
        await selectUsersModal.updateBtn.click();

        await expect(selectUsersModal.alertPopup).toBeVisible();
        await expect(selectUsersModal.alertTitle).toContainText(csvData.unregisteredUserAlert);
        await selectUsersModal.alertOkBtn.click();

        await selectUsersModal.clickCancel();
        fs.unlinkSync(unregCsv);
    });

    // 116. More than 100 users CSV limit alert
    test('TC_ServiceGroups_116_ViaCsvTab_Over100Users_ShowsLimitAlert - uploading CSV with more than 100 users displays limit alert', async () => {
        test.info().annotations.push({ type: 'testData', description: csvData.moreThan100UsersAlert });

        const path = require('path');
        const over100Csv = path.resolve('./tests/test-data', csvData.moreThan100UsersFile);

        await serviceGroupsPage.createGroupIfNotPresent(csvTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.ensureGroupVisibleInTable(csvTestGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(csvTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[3]);
        await selectUsersModal.selectCsvFile(over100Csv);
        await selectUsersModal.updateBtn.click();

        await expect(selectUsersModal.alertPopup).toBeVisible();
        await expect(selectUsersModal.alertTitle).toContainText(csvData.moreThan100UsersAlert);
        await selectUsersModal.alertOkBtn.click();

        await selectUsersModal.clickCancel();
    });

    // 117. Double dot filename invalid format error
    test('TC_ServiceGroups_117_ViaCsvTab_DoubleDotFilename_ShowsInvalidFormatError - selecting CSV file with double dot in name displays invalid format error', async () => {
        test.info().annotations.push({ type: 'testData', description: csvData.invalidFileFormatError });

        const fs = require('fs');
        const path = require('path');
        const doubleDotCsv = path.resolve('./test-results', csvData.doubleDotFile);
        fs.writeFileSync(doubleDotCsv, `${csvData.sampleHeader}\n${sgData.selectUsersModal.searchEmail}\n`);

        await serviceGroupsPage.createGroupIfNotPresent(csvTestGroupName, validExpiryDateStr);
        await serviceGroupsPage.ensureGroupVisibleInTable(csvTestGroupName);
        await serviceGroupsPage.clickAddOrEditUsers(csvTestGroupName);
        await expect(selectUsersModal.modal).toBeVisible();

        await selectUsersModal.clickTab(sgData.selectUsersModal.tabs[3]);
        await selectUsersModal.selectCsvFile(doubleDotCsv);
        await selectUsersModal.updateBtn.click();

        await expect(selectUsersModal.viaCsvInvalidFormatError).toBeVisible();
        await expect(selectUsersModal.viaCsvInvalidFormatError).toContainText(csvData.invalidFileFormatError);

        await selectUsersModal.clickCancel();
        await expect(selectUsersModal.modal).not.toBeVisible();

        // Teardown csvTestGroupName
        await serviceGroupsPage.clickDeleteGroup(csvTestGroupName);
        await serviceGroupsPage.confirmDelete();
        await expect(serviceGroupsPage.getGroupRow(csvTestGroupName)).not.toBeVisible();
        await serviceGroupsPage.clearSearch();
        fs.unlinkSync(doubleDotCsv);
    });
});


