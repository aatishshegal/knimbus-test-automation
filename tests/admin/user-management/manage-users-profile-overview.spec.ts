import { test, expect, Page } from '@playwright/test';
import { ManageUsersPage } from '../../../src/pages/admin/user-management/ManageUsersPage';
import { AdminDashboardLoginPage } from '../../../src/pages/admin/AdminDashboardLoginPage';
import { AdminApiService } from '../../../src/api/AdminApiService';
import profileData from '../../test-data/portal/profile-data.json';
import adminData from '../../test-data/admin-data.json';

test.describe('Manage Users - User Profile Overview - Basic Details', () => {

    const testEmail = `profiletest${Date.now()}@yopmail.com`;

    test.beforeAll(async () => {
        const adminApi = new AdminApiService();
        await adminApi.initFromState('.auth/admin.json');
        await adminApi.addSingleUser("Profile TestUser", testEmail);
        await adminApi.close();
    });

    test.beforeEach(async ({ page }) => {
        // Direct navigation to bypass dashboard clicks and save time
        await page.goto(process.env.ADMIN_TEST_URL + '/librarian/v2/elibrarySetup/userManagement/manageUsers');
    });

    test('TC_UserProfile_Email_Verification_From_Overview - verifies email in profile modal matches the clicked user', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        await manageUsersPage.searchForUser(testEmail);
        
        // Open the User Details Overview popup
        await manageUsersPage.clickUserDetailsOverview(testEmail);
        
        // Validate the email ID presented in the box matches the one we clicked on
        const profileEmail = page.locator('.profile-email');
        await expect(profileEmail).toHaveText(testEmail);
        
        // Close using the cross (X) icon present on top
        await page.locator('.fa-x').click();
        
        // Verify it remains on the Manage Users page by checking if modal hides
        await expect(manageUsersPage.userProfileModal).toBeHidden();
    });

    test('TC_UserProfile_Headers_Presence - verifies modal and tab headers are present', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        await manageUsersPage.searchForUser(testEmail);
        await manageUsersPage.clickUserDetailsOverview(testEmail);
        
        await expect(manageUsersPage.userProfileModal).toBeVisible();
        await expect(manageUsersPage.userProfileModal.getByText('Basic details')).toBeVisible();
        await expect(page.getByText('Enrollment details')).toBeVisible();
        
        await manageUsersPage.clickProfileCancel();
    });

    test('TC_UserProfile_Email_IsReadonly - verifies email field cannot be edited', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        await manageUsersPage.searchForUser(testEmail);
        await manageUsersPage.clickUserDetailsOverview(testEmail);
        
        const emailInput = manageUsersPage.getProfileLocator('email');
        await expect(emailInput).toBeDisabled();
        
        await manageUsersPage.clickProfileCancel();
    });

    test('TC_UserProfile_BasicDetails_UpdateSuccess - verifies saving valid data works', async ({ page }) => {
        const manageUsersPage = new ManageUsersPage(page);
        await manageUsersPage.searchForUser(testEmail);
        await manageUsersPage.clickUserDetailsOverview(testEmail);
        
        const fullNameInput = manageUsersPage.getProfileLocator('userName');
        await fullNameInput.fill(profileData['profile-basic-details.spec.ts'].positiveData.fullName);
        
        const mobileInput = manageUsersPage.getProfileLocator('contactNos');
        await mobileInput.fill(profileData['contact.spec.ts'].positiveData.mobile);

        // Additional Positive Validations
        const genderSelect = manageUsersPage.getProfileLocator('gender');
        await genderSelect.selectOption({ label: adminData.userManagement.newUserData.gender });
        
        const userTypeSelect = manageUsersPage.getProfileLocator('userType');
        await userTypeSelect.selectOption({ label: adminData.userManagement.newUserData.userType });
        
        const dobInput = manageUsersPage.getProfileLocator('dob');
        await dobInput.fill('2000-01-01');
        await page.keyboard.press('Enter');
        
        const expiryDateInput = manageUsersPage.getProfileLocator('raExpiryDate');
        await expiryDateInput.fill(adminData.userManagement.newUserData.expiryDate);
        await page.keyboard.press('Enter');
        
        const alternateEmailInput = manageUsersPage.getProfileLocator('alternateEmail');
        await alternateEmailInput.fill('alt_' + testEmail);
        
        await manageUsersPage.clickProfileSave();
        
        await expect(page.getByText(/Updated successfully/i).first()).toBeVisible({ timeout: 5000 });
    });

    test.describe('Negative Scenarios - Full Name', () => {
        const scenarios = profileData['profile-basic-details.spec.ts'].negativeScenarios.filter((s: any) => s.field === 'fullName');

        for (const scenario of scenarios) {
            test(`TC_UserProfile_FullName_${scenario.scenario.replace(/[^a-zA-Z0-9]/g, '')} - shows error`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: scenario.value });
                const manageUsersPage = new ManageUsersPage(page);
                await manageUsersPage.searchForUser(testEmail);
                await manageUsersPage.clickUserDetailsOverview(testEmail);
                
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
            test(`TC_UserProfile_Mobile_${scenario.scenario.replace(/[^a-zA-Z0-9]/g, '')} - shows error`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: scenario.value });
                const manageUsersPage = new ManageUsersPage(page);
                await manageUsersPage.searchForUser(testEmail);
                await manageUsersPage.clickUserDetailsOverview(testEmail);
                
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
            test(`TC_UserProfile_AlternateEmail_${scenario.scenario.replace(/[^a-zA-Z0-9]/g, '')}`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: scenario.value });
                const manageUsersPage = new ManageUsersPage(page);
                await manageUsersPage.searchForUser(testEmail);
                await manageUsersPage.clickUserDetailsOverview(testEmail);
                
                const altEmailInput = manageUsersPage.getProfileLocator('alternateEmail');
                
                if (scenario.bypassLength) {
                    await altEmailInput.evaluate((el: HTMLInputElement) => el.removeAttribute('maxlength'));
                }
                
                let inputValue = scenario.value;
                if (inputValue === 'SAME_AS_PRIMARY_EMAIL') {
                    inputValue = testEmail;
                }
                
                await altEmailInput.fill(inputValue);
                await altEmailInput.blur();
                
                await manageUsersPage.clickProfileSave();
                
                await expect(page.getByText(scenario.expectedError).first()).toBeVisible({ timeout: 5000 });
            });
        }
    });
    test.describe('Negative Scenarios - Enrollment Details', () => {
        // Map End User Portal JSON keys to Admin Dashboard DOM input names
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
            test(`TC_UserProfile_Enrollment_${scenario.field}_${scenario.scenario.replace(/[^a-zA-Z0-9]/g, '')}`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: scenario.value });
                const manageUsersPage = new ManageUsersPage(page);
                await manageUsersPage.searchForUser(testEmail);
                await manageUsersPage.clickUserDetailsOverview(testEmail);
                
                // Switch to Enrollment details tab
                await page.getByText('Enrollment details').click();
                
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
