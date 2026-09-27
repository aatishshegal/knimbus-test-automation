import { test, expect } from '@playwright/test';
import { ManageUsersPage } from '../../../src/pages/admin/user-management/ManageUsersPage';
import { AdminApiService } from '../../../src/api/AdminApiService';
import profileData from '../../test-data/portal/profile-data.json';
import adminData from '../../test-data/admin-data.json';

test.describe('Manage Users - User Profile Overview - User Details Tab', () => {

    const ovData = adminData.userManagement.userProfileOverview;
    const cgData = ovData.contentGroups;
    const sgData = ovData.serviceGroups;

    // =========================================================================
    // 1. BASIC DETAILS & ENROLLMENT DETAILS SECTION
    // =========================================================================
    test.describe('Basic Details & Enrollment Details', () => {
        const basicUserEmail = `profile_basic_${Date.now()}@yopmail.com`;

        test.beforeAll(async () => {
            const adminApi = new AdminApiService();
            await adminApi.initFromState('.auth/admin.json');
            await adminApi.addSingleUser("Profile BasicUser", basicUserEmail);
            await adminApi.close();
        });

        test.beforeEach(async ({ page }) => {
            await page.goto(process.env.ADMIN_TEST_URL + '/librarian/v2/elibrarySetup/userManagement/manageUsers');
        });

        test('TC_ManageUsers_UserOverview_Email_Verification - verifies email in profile modal matches the clicked user', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(basicUserEmail);
            await manageUsersPage.clickUserDetailsOverview(basicUserEmail);
            
            const profileEmail = page.locator('.profile-email');
            await expect(profileEmail).toHaveText(basicUserEmail);
            
            await manageUsersPage.closeUserProfileModalViaCrossIcon();
            await expect(manageUsersPage.userProfileModal).toBeHidden();
        });

        test('TC_ManageUsers_UserOverview_Headers_Presence - verifies modal and section headers are present', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(basicUserEmail);
            await manageUsersPage.clickUserDetailsOverview(basicUserEmail);
            
            await expect(manageUsersPage.userProfileModal).toBeVisible();
            await expect(manageUsersPage.userProfileModal.getByText(ovData.sections.basicDetails)).toBeVisible();
            await expect(manageUsersPage.userProfileModal.getByText(ovData.sections.enrollmentDetails)).toBeVisible();
            await expect(manageUsersPage.userProfileModal.getByText(ovData.sections.groupDetails)).toBeVisible();
            
            await manageUsersPage.clickProfileCancel();
        });

        test('TC_ManageUsers_UserOverview_Email_IsReadonly - verifies email field cannot be edited', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(basicUserEmail);
            await manageUsersPage.clickUserDetailsOverview(basicUserEmail);
            
            const emailInput = manageUsersPage.getProfileLocator('email');
            await expect(emailInput).toBeDisabled();
            
            await manageUsersPage.clickProfileCancel();
        });

        test('TC_ManageUsers_UserOverview_BasicDetails_UpdateSuccess - verifies saving valid data works', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(basicUserEmail);
            await manageUsersPage.clickUserDetailsOverview(basicUserEmail);
            
            const fullNameInput = manageUsersPage.getProfileLocator('userName');
            await fullNameInput.fill(profileData['profile-basic-details.spec.ts'].positiveData.fullName);
            
            const mobileInput = manageUsersPage.getProfileLocator('contactNos');
            await mobileInput.fill(profileData['contact.spec.ts'].positiveData.mobile);

            const genderSelect = manageUsersPage.getProfileLocator('gender');
            await genderSelect.selectOption({ label: adminData.userManagement.newUserData.gender });
            
            const userTypeSelect = manageUsersPage.getProfileLocator('userType');
            await userTypeSelect.selectOption({ label: adminData.userManagement.newUserData.userType });
            
            const dobInput = manageUsersPage.getProfileLocator('dob');
            await dobInput.fill(adminData.userManagement.newUserData.dob);
            await manageUsersPage.userProfileModal.getByText(ovData.sections.basicDetails).click();
            
            const alternateEmailInput = manageUsersPage.getProfileLocator('alternateEmail');
            await alternateEmailInput.fill('alt_' + basicUserEmail);
            
            await manageUsersPage.clickProfileSave();
            
            await expect(page.getByText(/Updated successfully/i).first()).toBeVisible({ timeout: 5000 });
        });

        test.describe('Negative Scenarios - Full Name', () => {
            const scenarios = profileData['profile-basic-details.spec.ts'].negativeScenarios.filter((s: any) => s.field === 'fullName');

            for (const scenario of scenarios) {
                test(`TC_ManageUsers_UserOverview_FullName_${scenario.scenario.replace(/[^a-zA-Z0-9]/g, '')} - shows error`, async ({ page }) => {
                    test.info().annotations.push({ type: 'testData', description: scenario.value });
                    const manageUsersPage = new ManageUsersPage(page);
                    await manageUsersPage.searchForUser(basicUserEmail);
                    await manageUsersPage.clickUserDetailsOverview(basicUserEmail);
                    
                    const fullNameInput = manageUsersPage.getProfileLocator('userName');
                    
                    if (scenario.bypassLength) {
                        await fullNameInput.evaluate((el: HTMLInputElement) => el.removeAttribute('maxlength'));
                    }
                    
                    await fullNameInput.fill(scenario.value);
                    await fullNameInput.blur();
                    
                    await manageUsersPage.clickProfileSave();
                    
                    await expect(page.getByText(scenario.expectedError).first()).toBeVisible({ timeout: 5000 });
                });
            }
        });

        test.describe('Negative Scenarios - Mobile', () => {
            const scenarios = profileData['contact.spec.ts'].negativeScenarios.filter((s: any) => 
                s.field === 'mobile' && !s.scenario.includes('Blank')
            );

            for (const scenario of scenarios) {
                test(`TC_ManageUsers_UserOverview_Mobile_${scenario.scenario.replace(/[^a-zA-Z0-9]/g, '')} - shows error`, async ({ page }) => {
                    test.info().annotations.push({ type: 'testData', description: scenario.value });
                    const manageUsersPage = new ManageUsersPage(page);
                    await manageUsersPage.searchForUser(basicUserEmail);
                    await manageUsersPage.clickUserDetailsOverview(basicUserEmail);
                    
                    const mobileInput = manageUsersPage.getProfileLocator('contactNos');
                    
                    if (scenario.bypassLength) {
                        await mobileInput.evaluate((el: HTMLInputElement) => el.removeAttribute('maxlength'));
                    }
                    
                    await mobileInput.fill(scenario.value);
                    await mobileInput.blur();
                    
                    await manageUsersPage.clickProfileSave();
                    
                    await expect(page.getByText(scenario.expectedError).first()).toBeVisible({ timeout: 5000 });
                });
            }
        });

        test.describe('Negative Scenarios - Alternate Email', () => {
            const scenarios = profileData['profile-basic-details.spec.ts'].negativeScenarios.filter((s: any) => 
                s.field === 'alternateEmail' && !s.scenario.includes('Blank') && !s.scenario.includes('Whitespace')
            );

            for (const scenario of scenarios) {
                test(`TC_ManageUsers_UserOverview_AlternateEmail_${scenario.scenario.replace(/[^a-zA-Z0-9]/g, '')}`, async ({ page }) => {
                    test.info().annotations.push({ type: 'testData', description: scenario.value });
                    const manageUsersPage = new ManageUsersPage(page);
                    await manageUsersPage.searchForUser(basicUserEmail);
                    await manageUsersPage.clickUserDetailsOverview(basicUserEmail);
                    
                    const altEmailInput = manageUsersPage.getProfileLocator('alternateEmail');
                    
                    if (scenario.bypassLength) {
                        await altEmailInput.evaluate((el: HTMLInputElement) => el.removeAttribute('maxlength'));
                    }
                    
                    let inputValue = scenario.value;
                    if (inputValue === 'SAME_AS_PRIMARY_EMAIL') {
                        inputValue = basicUserEmail;
                    }
                    
                    await altEmailInput.fill(inputValue);
                    await altEmailInput.blur();
                    
                    await manageUsersPage.clickProfileSave();
                    
                    await expect(page.getByText(scenario.expectedError).first()).toBeVisible({ timeout: 5000 });
                });
            }
        });

        test.describe('Negative Scenarios - Enrollment Details', () => {
            const adminFieldMap: Record<string, string> = {
                'idNumber': 'staffId',
                'college': 'affiliation',
                'qualification': 'degree',
                'areaOfStudy': 'speciality',
                'admissionYear': 'year'
            };

            const scenarios = profileData['enrollment-details.spec.ts'].negativeScenarios.filter((s: any) => 
                !s.scenario.includes('Blank') && !s.scenario.includes('Unselected')
            );

            for (const scenario of scenarios) {
                test(`TC_ManageUsers_UserOverview_Enrollment_${scenario.field}_${scenario.scenario.replace(/[^a-zA-Z0-9]/g, '')}`, async ({ page }) => {
                    test.info().annotations.push({ type: 'testData', description: scenario.value });
                    const manageUsersPage = new ManageUsersPage(page);
                    await manageUsersPage.searchForUser(basicUserEmail);
                    await manageUsersPage.clickUserDetailsOverview(basicUserEmail);
                    
                    await page.getByText(ovData.sections.enrollmentDetails).click();
                    
                    const adminFieldName = adminFieldMap[scenario.field] || scenario.field;
                    const fieldInput = manageUsersPage.getProfileLocator(adminFieldName);
                    
                    if (scenario.bypassLength) {
                        await fieldInput.evaluate((el: HTMLInputElement) => el.removeAttribute('maxlength'));
                    }
                    
                    await fieldInput.fill(scenario.value);
                    await fieldInput.blur();
                    
                    await manageUsersPage.clickProfileSave();
                    
                    await expect(page.getByText(scenario.expectedError).first()).toBeVisible({ timeout: 5000 });
                });
            }
        });
    });

    // =========================================================================
    // 2. GROUP DETAILS - CONTENT GROUP SECTION
    // =========================================================================
    test.describe('Group Details - Content Group', () => {
        const cgEmailA = `cg_user_a_${Date.now()}@yopmail.com`;
        const cgEmailB = `cg_user_b_${Date.now()}@yopmail.com`;

        test.beforeAll(async () => {
            const adminApi = new AdminApiService();
            await adminApi.initFromState('.auth/admin.json');
            await adminApi.addSingleUser("ContentGroup UserA", cgEmailA);
            await adminApi.addSingleUser("ContentGroup UserB", cgEmailB);
            await adminApi.close();
        });

        test.beforeEach(async ({ page }) => {
            await page.goto(process.env.ADMIN_TEST_URL + '/librarian/v2/elibrarySetup/userManagement/manageUsers');
        });

        test('TC_ManageUsers_UserOverview_ContentGroup_Dropdown_Expands - Clicking on Content Group opens list of content groups', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(cgEmailA);
            await manageUsersPage.clickUserDetailsOverview(cgEmailA);

            await manageUsersPage.openContentGroupDropdown();
            await expect(manageUsersPage.contentGroupDropdown).toBeVisible();

            await manageUsersPage.clickProfileCancel();
        });

        test('TC_ManageUsers_UserOverview_ContentGroup_Items_Have_Checkboxes - Group name list items render with selectable checkboxes', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(cgEmailA);
            await manageUsersPage.clickUserDetailsOverview(cgEmailA);

            await manageUsersPage.openContentGroupDropdown();
            const count = await manageUsersPage.contentGroupOptions.count();
            expect(count).toBeGreaterThan(0);

            const firstOption = manageUsersPage.contentGroupOptions.first();
            await expect(firstOption.locator('button svg')).toBeVisible();

            await manageUsersPage.clickProfileCancel();
        });

        test('TC_ManageUsers_UserOverview_ContentGroup_Clear_All_Disabled_When_None_Selected - Clear all button is disabled when no group is selected', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(cgEmailA);
            await manageUsersPage.clickUserDetailsOverview(cgEmailA);

            await manageUsersPage.openContentGroupDropdown();
            await expect(manageUsersPage.contentGroupClearAllBtn).toBeDisabled();

            await manageUsersPage.clickProfileCancel();
        });

        test('TC_ManageUsers_UserOverview_ContentGroup_Select_Multiple_And_Save - Selecting multiple groups and saving assigns only the selected groups', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            const groupsToSelect = [cgData.testGroups[0], cgData.testGroups[1]];

            await manageUsersPage.searchForUser(cgEmailA);
            await manageUsersPage.clickUserDetailsOverview(cgEmailA);

            await manageUsersPage.selectContentGroup(groupsToSelect[0]);
            await manageUsersPage.selectContentGroup(groupsToSelect[1]);
            await manageUsersPage.saveProfileAndExpectSuccess();

            await manageUsersPage.searchForUser(cgEmailA);
            await manageUsersPage.clickUserDetailsOverview(cgEmailA);

            await manageUsersPage.verifyOnlyContentGroupsSelected(groupsToSelect);

            await manageUsersPage.clickProfileCancel();
        });

        test('TC_ManageUsers_UserOverview_ContentGroup_Select_All_And_Save - Select All selects all groups and persists post save', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);

            await manageUsersPage.searchForUser(cgEmailA);
            await manageUsersPage.clickUserDetailsOverview(cgEmailA);

            await manageUsersPage.clickSelectAllContentGroups();
            await manageUsersPage.saveProfileAndExpectSuccess();

            await manageUsersPage.searchForUser(cgEmailA);
            await manageUsersPage.clickUserDetailsOverview(cgEmailA);

            await manageUsersPage.verifyAllContentGroupsSelected();

            await manageUsersPage.clickProfileCancel();
        });

        test('TC_ManageUsers_UserOverview_ContentGroup_Deselect_Option_And_Save - Deselecting a group and saving updates allocation', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            const groupToDeselect = cgData.testGroups[0];

            await manageUsersPage.searchForUser(cgEmailA);
            await manageUsersPage.clickUserDetailsOverview(cgEmailA);

            await manageUsersPage.selectContentGroup(groupToDeselect);
            await manageUsersPage.saveProfileAndExpectSuccess();

            await manageUsersPage.searchForUser(cgEmailA);
            await manageUsersPage.clickUserDetailsOverview(cgEmailA);

            const isSelected = await manageUsersPage.isContentGroupOptionSelected(groupToDeselect);
            expect(isSelected).toBeFalsy();

            await manageUsersPage.clickProfileCancel();
        });

        test('TC_ManageUsers_UserOverview_ContentGroup_Clear_All_Action_And_Save - Clear all removes all selected groups and persists', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);

            await manageUsersPage.searchForUser(cgEmailA);
            await manageUsersPage.clickUserDetailsOverview(cgEmailA);

            await manageUsersPage.clickClearAllContentGroups();
            await manageUsersPage.saveProfileAndExpectSuccess();

            await manageUsersPage.searchForUser(cgEmailA);
            await manageUsersPage.clickUserDetailsOverview(cgEmailA);

            await manageUsersPage.verifyOnlyContentGroupsSelected([]);

            await manageUsersPage.clickProfileCancel();
        });

        test('TC_ManageUsers_UserOverview_ContentGroup_Selection_Count_Display - Count of selected groups is accurately displayed post save', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);

            await manageUsersPage.searchForUser(cgEmailA);
            await manageUsersPage.clickUserDetailsOverview(cgEmailA);

            await manageUsersPage.selectContentGroup(cgData.testGroups[0]);
            await manageUsersPage.closeContentGroupDropdown();
            let value = await manageUsersPage.getContentGroupInputValue();
            expect(value).toContain(`1 ${cgData.singleCountSuffix}`);

            await manageUsersPage.selectContentGroup(cgData.testGroups[1]);
            await manageUsersPage.closeContentGroupDropdown();
            value = await manageUsersPage.getContentGroupInputValue();
            expect(value).toContain(`2 ${cgData.pluralCountSuffix}`);

            await manageUsersPage.saveProfileAndExpectSuccess();

            await manageUsersPage.searchForUser(cgEmailA);
            await manageUsersPage.clickUserDetailsOverview(cgEmailA);

            value = await manageUsersPage.getContentGroupInputValue();
            expect(value).toContain(`2 ${cgData.pluralCountSuffix}`);

            await manageUsersPage.clickProfileCancel();
        });

        test('TC_ManageUsers_UserOverview_ContentGroup_Unsaved_Selections_Discarded_On_Close - Discards pending group selections when closing modal without saving', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);

            await manageUsersPage.searchForUser(cgEmailA);
            await manageUsersPage.clickUserDetailsOverview(cgEmailA);

            await manageUsersPage.selectContentGroup(cgData.testGroups[2]);
            await manageUsersPage.clickProfileCancel();

            await manageUsersPage.searchForUser(cgEmailA);
            await manageUsersPage.clickUserDetailsOverview(cgEmailA);

            const isSelected = await manageUsersPage.isContentGroupOptionSelected(cgData.testGroups[2]);
            expect(isSelected).toBeFalsy();

            await manageUsersPage.clickProfileCancel();
        });

        test('TC_ManageUsers_UserOverview_ContentGroup_Manual_Full_Selection_Counter_Matches_Select_All - Manually checking each option updates counter identically to Select All', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);

            await manageUsersPage.searchForUser(cgEmailA);
            await manageUsersPage.clickUserDetailsOverview(cgEmailA);

            await manageUsersPage.clickClearAllContentGroups();
            await manageUsersPage.selectAllContentGroupsManually(cgData.testGroups);
            await manageUsersPage.closeContentGroupDropdown();

            const manualValue = await manageUsersPage.getContentGroupInputValue();
            expect(manualValue).toContain(`${cgData.testGroups.length} ${cgData.pluralCountSuffix}`);

            await manageUsersPage.clickProfileCancel();
        });

        test('TC_ManageUsers_UserOverview_ContentGroup_Backdrop_Click_Collapses_Dropdown - Clicking outside the dropdown within modal closes the options menu', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);

            await manageUsersPage.searchForUser(cgEmailA);
            await manageUsersPage.clickUserDetailsOverview(cgEmailA);

            await manageUsersPage.openContentGroupDropdown();
            await expect(manageUsersPage.contentGroupDropdown).toBeVisible();

            await manageUsersPage.closeContentGroupDropdownViaBackdrop();
            await expect(manageUsersPage.contentGroupDropdown).toBeHidden();

            await manageUsersPage.clickProfileCancel();
        });

        test('TC_ManageUsers_UserOverview_ContentGroup_Clear_All_Instantly_Redisables_Itself - Clicking Clear all immediately disables the button and resets counter', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);

            await manageUsersPage.searchForUser(cgEmailA);
            await manageUsersPage.clickUserDetailsOverview(cgEmailA);

            await manageUsersPage.selectContentGroup(cgData.testGroups[0]);
            await expect(manageUsersPage.contentGroupClearAllBtn).toBeEnabled();

            await manageUsersPage.clickClearAllContentGroups();
            await expect(manageUsersPage.contentGroupClearAllBtn).toBeDisabled();

            await manageUsersPage.closeContentGroupDropdown();
            const value = await manageUsersPage.getContentGroupInputValue();
            expect(value).toBe(cgData.defaultPlaceholder);

            await manageUsersPage.clickProfileCancel();
        });

        test('TC_ManageUsers_UserOverview_ContentGroup_User_To_User_State_Isolation - Group allocation on one user does not affect another user', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);

            await manageUsersPage.searchForUser(cgEmailA);
            await manageUsersPage.clickUserDetailsOverview(cgEmailA);
            await manageUsersPage.clickClearAllContentGroups();
            await manageUsersPage.selectContentGroup(cgData.testGroups[0]);
            await manageUsersPage.saveProfileAndExpectSuccess();

            await manageUsersPage.searchForUser(cgEmailB);
            await manageUsersPage.clickUserDetailsOverview(cgEmailB);

            await manageUsersPage.verifyOnlyContentGroupsSelected([]);

            await manageUsersPage.clickProfileCancel();
        });
    });

    // =========================================================================
    // 3. GROUP DETAILS - SERVICE GROUP SECTION
    // =========================================================================
    test.describe('Group Details - Service Group', () => {
        const sgEmailA = `sg_user_a_${Date.now()}@yopmail.com`;
        const sgEmailB = `sg_user_b_${Date.now()}@yopmail.com`;

        test.beforeAll(async () => {
            const adminApi = new AdminApiService();
            await adminApi.initFromState('.auth/admin.json');
            await adminApi.addSingleUser("ServiceGroup UserA", sgEmailA);
            await adminApi.addSingleUser("ServiceGroup UserB", sgEmailB);
            await adminApi.close();
        });

        test.beforeEach(async ({ page }) => {
            await page.goto(process.env.ADMIN_TEST_URL + '/librarian/v2/elibrarySetup/userManagement/manageUsers');
        });

        test('TC_ManageUsers_UserOverview_ServiceGroup_Dropdown_Options_Visible - Clicking on Service Group displays list of available options', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(sgEmailA);
            await manageUsersPage.clickUserDetailsOverview(sgEmailA);

            await manageUsersPage.scrollToGroupDetails();
            await expect(manageUsersPage.userProfileServiceGroupSelect).toBeVisible();

            const options = await manageUsersPage.userProfileServiceGroupSelect.locator('option').allInnerTexts();
            const trimmedOptions = options.map(t => t.trim());
            expect(trimmedOptions).toContain(sgData.defaultPlaceholder);
            expect(trimmedOptions).toContain(sgData.activeGroup);
            expect(trimmedOptions).toContain(sgData.expiredGroup);

            await manageUsersPage.clickProfileCancel();
        });

        test('TC_ManageUsers_UserOverview_ServiceGroup_Single_Select_Enforcement - Only one service group can be selected at a time', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(sgEmailA);
            await manageUsersPage.clickUserDetailsOverview(sgEmailA);

            await manageUsersPage.selectProfileServiceGroup(sgData.activeGroup);
            const firstSelected = await manageUsersPage.getSelectedProfileServiceGroup();
            expect(firstSelected).toBe(sgData.activeGroup);

            await manageUsersPage.selectProfileServiceGroup(sgData.expiredGroup);
            const secondSelected = await manageUsersPage.getSelectedProfileServiceGroup();
            expect(secondSelected).toBe(sgData.expiredGroup);

            await manageUsersPage.clickProfileCancel();
        });

        test('TC_ManageUsers_UserOverview_ServiceGroup_Expired_Group_Displays_Warning - Selecting expired service group displays warning message while allowing selection', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(sgEmailA);
            await manageUsersPage.clickUserDetailsOverview(sgEmailA);

            await manageUsersPage.selectProfileServiceGroup(sgData.expiredGroup);

            const isWarningVisible = await manageUsersPage.isProfileServiceGroupExpiredWarningVisible();
            expect(isWarningVisible).toBeTruthy();

            const selectedGroup = await manageUsersPage.getSelectedProfileServiceGroup();
            expect(selectedGroup).toBe(sgData.expiredGroup);

            await manageUsersPage.clickProfileCancel();
        });

        test('TC_ManageUsers_UserOverview_ServiceGroup_Active_Group_Clears_Expired_Warning - Switching from expired group to active group clears the warning message', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(sgEmailA);
            await manageUsersPage.clickUserDetailsOverview(sgEmailA);

            await manageUsersPage.selectProfileServiceGroup(sgData.expiredGroup);
            expect(await manageUsersPage.isProfileServiceGroupExpiredWarningVisible()).toBeTruthy();

            await manageUsersPage.selectProfileServiceGroup(sgData.activeGroup);
            expect(await manageUsersPage.isProfileServiceGroupExpiredWarningVisible()).toBeFalsy();

            await manageUsersPage.clickProfileCancel();
        });

        test('TC_ManageUsers_UserOverview_ServiceGroup_Save_Populates_Expiry_Date - Allocating service group automatically populates Expiry Date on save', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(sgEmailA);
            await manageUsersPage.clickUserDetailsOverview(sgEmailA);

            await manageUsersPage.selectProfileServiceGroup(sgData.activeGroup);
            await manageUsersPage.saveProfileAndExpectSuccess();

            await manageUsersPage.searchForUser(sgEmailA);
            await manageUsersPage.clickUserDetailsOverview(sgEmailA);

            const allocatedGroup = await manageUsersPage.getSelectedProfileServiceGroup();
            expect(allocatedGroup).toBe(sgData.activeGroup);

            const expiryDate = await manageUsersPage.getProfileRaExpiryDateValue();
            expect(expiryDate).toBe(sgData.activeGroupExpiryDate);

            await manageUsersPage.clickProfileCancel();
        });

        test('TC_ManageUsers_UserOverview_ServiceGroup_Reassign_To_Another_Group - User with existing service group can be moved to another group', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(sgEmailA);
            await manageUsersPage.clickUserDetailsOverview(sgEmailA);

            await manageUsersPage.selectProfileServiceGroup(sgData.expiredGroup);
            await manageUsersPage.saveProfileAndExpectSuccess();

            await manageUsersPage.searchForUser(sgEmailA);
            await manageUsersPage.clickUserDetailsOverview(sgEmailA);

            const allocatedGroup = await manageUsersPage.getSelectedProfileServiceGroup();
            expect(allocatedGroup).toBe(sgData.expiredGroup);

            await manageUsersPage.clickProfileCancel();
        });

        test('TC_ManageUsers_UserOverview_ServiceGroup_Unsaved_Selection_Discarded_On_Close - Changing selection without clicking save discards changes', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(sgEmailA);
            await manageUsersPage.clickUserDetailsOverview(sgEmailA);

            await manageUsersPage.selectProfileServiceGroup(sgData.activeGroup);
            await manageUsersPage.clickProfileCancel();

            await manageUsersPage.searchForUser(sgEmailA);
            await manageUsersPage.clickUserDetailsOverview(sgEmailA);

            const allocatedGroup = await manageUsersPage.getSelectedProfileServiceGroup();
            expect(allocatedGroup).toBe(sgData.expiredGroup);

            await manageUsersPage.clickProfileCancel();
        });

        test('TC_ManageUsers_UserOverview_ServiceGroup_Modal_Close_Via_Close_Button - User Profile modal closes cleanly when clicking Close button', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(sgEmailA);
            await manageUsersPage.clickUserDetailsOverview(sgEmailA);

            await expect(manageUsersPage.userProfileModal).toBeVisible();
            await manageUsersPage.closeUserProfileModalViaCloseButton();
            await expect(manageUsersPage.userProfileModal).toBeHidden();
        });

        test('TC_ManageUsers_AssignServiceGroup_Modal_Close_Via_Escape_And_Backdrop - Assign Service Group modal closes when clicking escape or tapping outside', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(sgEmailB);

            // Test Escape key dismissal
            await manageUsersPage.clickAssignGroup(sgEmailB);
            await expect(manageUsersPage.assignGroupModal).toBeVisible();
            await manageUsersPage.closeAssignGroupModalViaEscape();
            await expect(manageUsersPage.assignGroupModal).toBeHidden();

            // Test Backdrop click dismissal
            await manageUsersPage.clickAssignGroup(sgEmailB);
            await expect(manageUsersPage.assignGroupModal).toBeVisible();
            await manageUsersPage.closeAssignGroupModalViaBackdrop();
            await expect(manageUsersPage.assignGroupModal).toBeHidden();
        });

        test('TC_ManageUsers_UserOverview_ServiceGroup_Allocation_Persists_On_Rechecking_Overview - Re-checking user overview confirms assigned group persistence', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(sgEmailA);
            await manageUsersPage.clickUserDetailsOverview(sgEmailA);

            await manageUsersPage.selectProfileServiceGroup(sgData.activeGroup);
            await manageUsersPage.saveProfileAndExpectSuccess();

            await manageUsersPage.searchForUser(sgEmailA);
            await manageUsersPage.clickUserDetailsOverview(sgEmailA);

            const allocatedGroup = await manageUsersPage.getSelectedProfileServiceGroup();
            expect(allocatedGroup).toBe(sgData.activeGroup);

            await manageUsersPage.clickProfileCancel();
        });

        test('TC_ManageUsers_UserOverview_ServiceGroup_Unassign_Group_Restores_Default - Selecting default placeholder unassigns service group', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);
            await manageUsersPage.searchForUser(sgEmailA);
            await manageUsersPage.clickUserDetailsOverview(sgEmailA);

            await manageUsersPage.selectProfileServiceGroup(sgData.defaultPlaceholder);
            await manageUsersPage.saveProfileAndExpectSuccess();

            await manageUsersPage.searchForUser(sgEmailA);
            await manageUsersPage.clickUserDetailsOverview(sgEmailA);

            const allocatedGroup = await manageUsersPage.getSelectedProfileServiceGroup();
            expect(allocatedGroup).toBe(sgData.defaultPlaceholder);

            await manageUsersPage.clickProfileCancel();
        });

        test('TC_ManageUsers_UserOverview_ServiceGroup_User_To_User_State_Isolation - Service group assigned to one user does not affect another user', async ({ page }) => {
            const manageUsersPage = new ManageUsersPage(page);

            await manageUsersPage.searchForUser(sgEmailA);
            await manageUsersPage.clickUserDetailsOverview(sgEmailA);
            await manageUsersPage.selectProfileServiceGroup(sgData.activeGroup);
            await manageUsersPage.saveProfileAndExpectSuccess();

            await manageUsersPage.searchForUser(sgEmailB);
            await manageUsersPage.clickUserDetailsOverview(sgEmailB);

            const userBGroup = await manageUsersPage.getSelectedProfileServiceGroup();
            expect(userBGroup).toBe(sgData.defaultPlaceholder);

            await manageUsersPage.clickProfileCancel();
        });
    });
});
