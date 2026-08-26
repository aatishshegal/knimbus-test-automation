import { test as setup, expect } from '../src/fixtures';
import { AdminApiService } from '../src/api/AdminApiService';
import * as fs from 'fs';
import * as path from 'path';

// Force an empty storage state so setup always gets a fresh browser
setup.use({ storageState: { cookies: [], origins: [] } });

setup('Global Setup - API Preconditions and UI Authentication', async ({ page, portalLoginPage, homePage, termsAndConditionsModal }) => {
  // Clean up old CSV reports
  const enrollmentCsvPath = path.join(__dirname, '..', 'test-results', 'Enrollment_Details_Validation_Report.csv');
  if (fs.existsSync(enrollmentCsvPath)) fs.unlinkSync(enrollmentCsvPath);

  const idAccessCsvPath = path.join(__dirname, '..', 'test-results', 'Id_Access_Info_Validation_Report.csv');
  if (fs.existsSync(idAccessCsvPath)) fs.unlinkSync(idAccessCsvPath);

  const adminApi = new AdminApiService();
  await adminApi.login();

  console.log('[Global Setup] Updating Tenant Security Settings (Favorable Preconditions)...');
  await adminApi.updateSecuritySettings({
    twoFactorAuth: false,
    automatedVerification: true,
    mandatoryFields: { isMandatory: false, fields: [] },
    domainRestriction: [],
    allFieldsEditable: true
  });

  const email = process.env.HOME_PAGE_USER_EMAIL as string;
  const password = process.env.HOME_PAGE_USER_PASSWORD as string;

  console.log(`[Global Setup] Ensuring correct password for ${email}...`);
  await adminApi.changeUserPassword(email, password).catch(async () => {
    // If the user doesn't exist, create it first
    await adminApi.addSingleUser("Home Automation", email);
    await adminApi.changeUserPassword(email, password);
  });

  await adminApi.close();
  console.log('[Global Setup] Backend configuration complete.');

  console.log('[Global Setup] Performing UI Login to cache session for all test workers...');
  await page.context().clearCookies();
  
  await page.goto(process.env.PORTAL_URL as string);
  await portalLoginPage.login(email, password);
  
  // Wait for the home page to load first
  await expect(homePage.homePageIdentifier).toBeVisible({ timeout: 15000 });
  
  // NOW check for the T&C popup (give it a moment to appear via React state if necessary)
  await page.waitForTimeout(2000);
  await termsAndConditionsModal.handleTermsAndConditionsIfVisible();
  
  await page.context().storageState({ path: '.auth/user.json' });
  console.log('[Global Setup] Global session cached successfully!');
});
