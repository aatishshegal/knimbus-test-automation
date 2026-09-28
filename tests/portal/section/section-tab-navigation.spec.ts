import { test, expect } from '../../../src/fixtures';
import path from 'path';
import fs from 'fs';
import sectionData from '../../test-data/section-data.json';

test.describe('Section Tab - Authentication & Navigation', () => {
  const screenshotsDir = path.join(process.cwd(), 'test-results', 'screenshots', 'section-tab');

  test.beforeAll(() => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  test('TC_SEC_001: End user login and navigation to Section tab with screenshot', async ({ page, portalLoginPage, sectionPage, sectionAutomationUser, termsAndConditionsModal }) => {
    await page.goto(sectionData.targetUrl);
    await portalLoginPage.login(sectionAutomationUser.email, sectionAutomationUser.password);
    await page.waitForTimeout(1000);
    await termsAndConditionsModal.handleTermsAndConditionsIfVisible().catch(() => {});

    await sectionPage.navigateToSectionTab();
    await expect(sectionPage.sectionTabLink).toBeVisible();

    const screenshotPath = path.join(screenshotsDir, 'TC_SEC_001_Section_Tab_Loaded.png');
    await sectionPage.takeScreenshot(screenshotPath);
  });

  test('TC_SEC_002: Verify visibility of all 5 section widgets on page', async ({ page, portalLoginPage, sectionPage, sectionAutomationUser, termsAndConditionsModal }) => {
    await page.goto(sectionData.targetUrl);
    await portalLoginPage.login(sectionAutomationUser.email, sectionAutomationUser.password);
    await page.waitForTimeout(1000);
    await termsAndConditionsModal.handleTermsAndConditionsIfVisible().catch(() => {});

    await sectionPage.navigateToSectionTab();

    await expect(sectionPage.sectionOnlyImageHeading).toBeVisible({ timeout: 10000 });
    await expect(sectionPage.sectionNameAndImageHeading).toBeVisible({ timeout: 10000 });
    await expect(sectionPage.sectionOnlyNameHeading).toBeVisible({ timeout: 10000 });
    await expect(sectionPage.sectionGroupingHeading).toBeVisible({ timeout: 10000 });
    await expect(sectionPage.newArrivalsHeading).toBeVisible({ timeout: 10000 });
  });
});
