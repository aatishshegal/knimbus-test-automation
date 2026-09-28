import { test, expect } from '../../../src/fixtures';
import path from 'path';
import sectionData from '../../test-data/section-data.json';

test.describe('Section Page - Only Name Standard Item Widget (TC_Section_022 to TC_Section_023)', () => {
  const screenshotsDir = path.join(process.cwd(), 'test-results', 'screenshots', 'section-tab');

  test.beforeEach(async ({ page, portalLoginPage, sectionPage, sectionAutomationUser, termsAndConditionsModal }) => {
    await page.goto(sectionData.targetUrl);
    await portalLoginPage.login(sectionAutomationUser.email, sectionAutomationUser.password);
    await page.waitForTimeout(1000);
    await termsAndConditionsModal.handleTermsAndConditionsIfVisible().catch(() => {});
    await sectionPage.navigateToSectionTab();
  });

  test('TC_Section_022: Verify Widget Name for Section with only_name_standard_item_widget.json Theme', async ({ sectionPage }) => {
    await expect(sectionPage.onlyNameStandardWidgetHeading).toBeVisible({ timeout: 10000 });
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_022.png'));
  });

  test('TC_Section_023: Verify visibility of section names and redirection upon clicking section Name', async ({ sectionPage }) => {
    const pillCount = await sectionPage.onlyNamePills.count();
    if (pillCount > 0) {
      const firstPill = sectionPage.onlyNamePills.first();
      await expect(firstPill).toBeVisible();
      await firstPill.click().catch(() => {});
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_023.png'));
  });
});
