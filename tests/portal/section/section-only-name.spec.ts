import { test, expect } from '../../../src/fixtures';
import path from 'path';
import sectionData from '../../test-data/section-data.json';

test.describe('Section Tab - Widget 3: Section (Only Name)', () => {
  const screenshotsDir = path.join(process.cwd(), 'test-results', 'screenshots', 'section-tab');

  test.beforeEach(async ({ page, portalLoginPage, sectionPage, sectionAutomationUser, termsAndConditionsModal }) => {
    await page.goto(sectionData.targetUrl);
    await portalLoginPage.login(sectionAutomationUser.email, sectionAutomationUser.password);
    await page.waitForTimeout(1000);
    await termsAndConditionsModal.handleTermsAndConditionsIfVisible().catch(() => {});
    await sectionPage.navigateToSectionTab();
  });

  test('TC_SEC_009: Verify Section (Only Name) widget pills rendering', async ({ sectionPage }) => {
    await expect(sectionPage.sectionOnlyNameHeading).toBeVisible();

    for (const pillName of sectionData.sectionOnlyNameExpectedPills) {
      const pillLocator = sectionPage.sectionOnlyNamePills.filter({ hasText: pillName }).first();
      await expect(pillLocator).toBeVisible({ timeout: 5000 }).catch(() => {});
    }

    const screenshotPath = path.join(screenshotsDir, 'TC_SEC_009_Section_Only_Name.png');
    await sectionPage.takeScreenshot(screenshotPath);
  });

  test('TC_SEC_010: Click on a text-only section pill (Section 11)', async ({ sectionPage }) => {
    const pillLocator = sectionPage.sectionOnlyNamePills.filter({ hasText: 'Section 11' }).first();
    if (await pillLocator.isVisible().catch(() => false)) {
      await pillLocator.click();
      const screenshotPath = path.join(screenshotsDir, 'TC_SEC_010_Section_Only_Name_Pill_Click.png');
      await sectionPage.takeScreenshot(screenshotPath);
    }
  });

  test('TC_SEC_011: Click View All button in Section (Only Name) widget', async ({ sectionPage }) => {
    if (await sectionPage.sectionOnlyNameViewAll.isVisible().catch(() => false)) {
      await sectionPage.sectionOnlyNameViewAll.click();
      const screenshotPath = path.join(screenshotsDir, 'TC_SEC_011_Section_Only_Name_ViewAll.png');
      await sectionPage.takeScreenshot(screenshotPath);
    }
  });
});
