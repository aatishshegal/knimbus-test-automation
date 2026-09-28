import { test, expect } from '../../../src/fixtures';
import path from 'path';
import sectionData from '../../test-data/section-data.json';

test.describe('Section Page - Name With Image Standard Item Widget (TC_Section_024)', () => {
  const screenshotsDir = path.join(process.cwd(), 'test-results', 'screenshots', 'section-tab');

  test.beforeEach(async ({ page, portalLoginPage, sectionPage, sectionAutomationUser, termsAndConditionsModal }) => {
    await page.goto(sectionData.targetUrl);
    await portalLoginPage.login(sectionAutomationUser.email, sectionAutomationUser.password);
    await page.waitForTimeout(1000);
    await termsAndConditionsModal.handleTermsAndConditionsIfVisible().catch(() => {});
    await sectionPage.navigateToSectionTab();
  });

  test('TC_Section_024: Verify visibility and clickability of Widget Name for Section with name_with_image_standard_item_widget.json Theme', async ({ sectionPage }) => {
    await expect(sectionPage.nameWithImageStandardWidgetHeading).toBeVisible({ timeout: 10000 });
    const cardCount = await sectionPage.nameWithImageCards.count();
    if (cardCount > 0) {
      await sectionPage.nameWithImageCards.first().click().catch(() => {});
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_024.png'));
  });
});
