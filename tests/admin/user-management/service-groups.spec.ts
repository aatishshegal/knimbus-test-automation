import { test, expect } from '@playwright/test';
import { ServiceGroupsPage } from '../../../src/pages/admin/user-management/ServiceGroupsPage';
import { SelectResourcesModal } from '../../../src/pages/admin/user-management/SelectResourcesModal';
import { SelectUsersModal } from '../../../src/pages/admin/user-management/SelectUsersModal';
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

    const sgData = adminData.userManagement.serviceGroupsManagement;
    const serviceGroupsUrl = adminData.userManagement.expectedUrls.serviceGroups;

    // Helper date generator for future expiry
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const validExpiryDateStr = futureDate.toISOString().split('T')[0];

    test.beforeEach(async ({ page }) => {
        serviceGroupsPage = new ServiceGroupsPage(page);
        selectResourcesModal = new SelectResourcesModal(page);
        selectUsersModal = new SelectUsersModal(page);

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
});
