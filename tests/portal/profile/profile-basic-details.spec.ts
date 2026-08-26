import { test, expect, Page } from '@playwright/test';
import { TopNavigationBar } from '../../../src/pages/portal/TopNavigationBar';
import { ProfilePage } from '../../../src/pages/portal/ProfilePage';
import { AdminApiService } from '../../../src/api/AdminApiService';

import * as fs from 'fs';
import * as path from 'path';

// Load post-login profile data
const postLoginDataPath = path.resolve(__dirname, '../../../tests/test-data/postLoginProfileData.json');
const postLoginData = JSON.parse(fs.readFileSync(postLoginDataPath, 'utf-8'));
const fieldStates = postLoginData.fieldStates;
const positiveScenarios = postLoginData.positiveScenarios;

// Load field validation negative scenarios
const validationDataPath = path.resolve(__dirname, '../../../tests/test-data/field-validation-data.json');
const validationData = JSON.parse(fs.readFileSync(validationDataPath, 'utf-8'));
const fullNameScenarios = validationData.scenarios.filter((s: any) => s.field === 'FullName');
const summaryScenarios = validationData.scenarios.filter((s: any) => s.field === 'Summary');

const positiveFullName = positiveScenarios.filter((s: any) => s.field === 'FullName');
const positiveSummary = positiveScenarios.filter((s: any) => s.field === 'Summary');

// Load profile image upload scenarios
const imageUploadScenarios = postLoginData.imageUploadScenarios;

const csvFilePath = path.join(__dirname, '..', '..', '..', 'test-results', `Profile_Basic_Details_Validation_Report.csv`);

function logToCsv(testCaseName: string, scenario: string, field: string, testData: string, status: string, errorReason: string = '') {
    if (!fs.existsSync(csvFilePath)) {
        fs.writeFileSync(csvFilePath, 'Test Case Name,Scenario,Field,Test Data,Status,Error Reason\n');
    }
    const safeError = errorReason ? errorReason.replace(/"/g, '""').replace(/\n/g, ' ') : '';
    const row = `"${testCaseName}","${scenario}","${field}","${testData}","${status}","${safeError}"\n`;
    fs.appendFileSync(csvFilePath, row);
    
    // Console log for visibility during execution
    console.log(`[${status}] ${testCaseName} | Scenario: ${scenario} | Field: ${field} | Data: '${testData}'`);
    if (status === 'Fail' && errorReason) {
        console.log(`       -> Error: ${errorReason.substring(0, 150)}...`);
    }
}

function failTest(e: any, testInfo: any) {
    testInfo.errors.push(e);
    testInfo.status = 'failed';
}

test.describe('Profile - Basic Details & Image Upload Validations', () => {
  test.setTimeout(240000); // 4 minutes
  let page: Page;
  let topNav: TopNavigationBar;
  let profilePage: ProfilePage;
  let adminApi: AdminApiService;

  test.beforeAll(async ({ browser }) => {
      page = await browser.newPage();
      topNav = new TopNavigationBar(page);
      profilePage = new ProfilePage(page);
      
      const { AdminApiService } = require('../../../src/api/AdminApiService');
      adminApi = new AdminApiService();
      await adminApi.login();
      
      // Ensure all standard profile fields are editable before starting
      await adminApi.updateSecuritySettings({ 
          allFieldsEditable: true,
          mandatoryFields: { fields: [], isMandatory: false }
      });
  });

  test.beforeEach(async () => {
    await page.goto(process.env.PORTAL_URL as string || 'https://sydneyuniversity.knimbus.com/portal/v2/default/home');
    await topNav.openProfileMenu();
    await topNav.profileMenuProfileLink.click();
    await expect(profilePage.profileHeader).toBeVisible();
  });

  test.afterAll(async () => {
      console.log(`\n✅ Profile Basic Details CSV Report generated successfully: ${csvFilePath}\n`);
      if (adminApi) await adminApi.close();
      if (page) await page.close();
  });

  test('Positive & Negative Data Entry Validation', async ({}, testInfo) => {
      console.log('\n--- Starting: Positive & Negative Data Entry Validation ---');
      try {
          // Full Name Validation
          await profilePage.validateFullNameScenarios(fullNameScenarios, positiveFullName, logToCsv);

          // Summary Validation
          await profilePage.validateSummaryScenarios(summaryScenarios, positiveSummary, logToCsv);

          // DOB Validation
          await profilePage.validateDobScenarios(logToCsv);

          // Gender Validation
          await profilePage.validateGenderScenarios(logToCsv);

          // Image Upload Validation
          await profilePage.validateImageUploadScenarios(imageUploadScenarios, logToCsv);
          
      } catch (e: any) {
          failTest(e, testInfo);
          await profilePage.logFailureToCsv({}, [], logToCsv, e.message);
      }
  });

  test.describe('Admin Overrides / Preconditions', () => {
      test('[Negative] Verify user cannot change Full Name when it is disabled by Admin precondition', async () => {
          // Disable editing for ONLY Full Name (which in API is 'Name')
          await adminApi.updateSecuritySettings({ editableFields: { fields: ['Name'], isEditable: false } });
          await page.reload();
          await expect(profilePage.profileHeader).toBeVisible();
  
          await profilePage.clickEdit();
  
          // Confirm Full Name is disabled
          await expect(profilePage.fullNameInput).toBeDisabled();
  
          // Confirm other fields are still enabled
          await expect(profilePage.summaryTextarea).toBeEnabled();
          await expect(profilePage.genderDropdown).toBeEnabled();
          await expect(profilePage.dobInput).toBeEnabled();
  
          await profilePage.cancelBtn.click();
  
          // Revert it immediately so it doesn't break following tests
          await adminApi.updateSecuritySettings({ allFieldsEditable: true });
      });

      test('[Negative] Verify user cannot change Summary when it is disabled by Admin precondition', async () => {
          // Disable editing for ONLY the Summary field
          await adminApi.updateSecuritySettings({ editableFields: { fields: ['Summary'], isEditable: false } });
          await page.reload();
          await expect(profilePage.profileHeader).toBeVisible();
  
          await profilePage.clickEdit();
  
          // Confirm Summary is disabled
          await expect(profilePage.summaryTextarea).toBeDisabled();
          
          // Confirm other fields are still enabled
          await expect(profilePage.dobInput).toBeEnabled();
          await expect(profilePage.genderDropdown).toBeEnabled();
  
          await profilePage.cancelBtn.click();
  
          // Restore immediately
          await adminApi.updateSecuritySettings({ allFieldsEditable: true });
      });
  
      test('[Negative] Verify error when Summary is enabled, Mandatory, and left blank', async () => {
          // Make Summary mandatory.
          await adminApi.updateSecuritySettings({ mandatoryFields: { fields: ['Summary'], isMandatory: true } });
          await page.reload();
          await expect(profilePage.profileHeader).toBeVisible();
  
          await profilePage.clickEdit();
          await profilePage.summaryTextarea.fill('');
          await profilePage.summaryTextarea.blur();
          await profilePage.clickSave();
          
          const expectedError = postLoginData.summaryScenarios.mandatoryError;
          await expect.soft(page.locator('text=' + expectedError).first()).toBeVisible({ timeout: 5000 });
          
          await profilePage.cancelBtn.click();
          
          // Restore immediately
          await adminApi.updateSecuritySettings({ mandatoryFields: { fields: [], isMandatory: false } });
      });
  });
});
