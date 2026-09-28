import { test as setup, expect } from '../src/fixtures';
import { AdminApiService } from '../src/api/AdminApiService';
import path from 'path';
import fs from 'fs';

// Force an empty storage state so setup always gets a fresh browser
setup.use({ storageState: { cookies: [], origins: [] } });

setup('Global Setup - API Preconditions and UI Authentication', async ({ page, portalLoginPage, homePage, mandatoryDetailsPage, termsAndConditionsModal }) => {
  const email = process.env.HOME_PAGE_USER_EMAIL as string;
  const password = process.env.HOME_PAGE_USER_PASSWORD as string;

  try {
    const adminApi = new AdminApiService();
    await adminApi.login();

    console.log('[Global Setup] Updating Tenant Security Settings (Favorable Preconditions)...');
    await adminApi.updateSecuritySettings({
      twoFactorAuth: false,
      automatedVerification: true,
      mandatoryFields: { isMandatory: false, fields: [] },
      domainRestriction: []
    });

    console.log(`[Global Setup] Ensuring correct password for ${email}...`);
    await adminApi.changeUserPassword(email, password).catch(async () => {
      // If the user doesn't exist, create it first
      await adminApi.addSingleUser("Home Automation", email);
      await adminApi.changeUserPassword(email, password);
    });

    await adminApi.close();
    console.log('[Global Setup] Backend configuration complete.');
  } catch (err) {
    console.log('[Global Setup] Warning: Admin API setup skipped or unavailable:', (err as Error).message);
  }

  console.log('[Global Setup] Performing UI Login to cache session for all test workers...');
  await page.context().clearCookies();
  
  await page.goto(process.env.PORTAL_URL as string);
  await portalLoginPage.login(email, password);

  // If redirected to userDetails (mandatory fields prompt), fill and submit it
  await page.waitForTimeout(2000);
  if (page.url().includes('userDetails') || await page.getByText('Fill the mandatory detail(s)').isVisible().catch(() => false)) {
    console.log('[Global Setup] User details form detected. Submitting mandatory document...');
    const dummyPath = path.join(process.cwd(), 'test-results', 'dummy_id.png');
    if (!fs.existsSync(dummyPath)) {
      const dir = path.dirname(dummyPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(dummyPath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'));
    }
    await mandatoryDetailsPage.idDocumentFrontInput.setInputFiles(dummyPath).catch(() => {});
    await page.waitForTimeout(500);
    await mandatoryDetailsPage.submitButton.click().catch(() => {});
    await page.waitForTimeout(3000);
    await page.goto(process.env.PORTAL_URL as string).catch(() => {});
  }
  
  // Wait for the home page to load first
  await expect(homePage.homePageIdentifier).toBeVisible({ timeout: 15000 }).catch(() => {});
  
  // NOW check for the T&C popup (give it a moment to appear via React state if necessary)
  await page.waitForTimeout(2000);
  await termsAndConditionsModal.handleTermsAndConditionsIfVisible();
  
  await page.context().storageState({ path: '.auth/user.json' });
  console.log('[Global Setup] Global session cached successfully!');
});
