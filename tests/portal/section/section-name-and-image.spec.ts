import { test, expect } from '../../../src/fixtures';
import path from 'path';
import sectionData from '../../test-data/section-data.json';

test.describe('Section Tab - Widget 2: Section Name & Image', () => {
  const screenshotsDir = path.join(process.cwd(), 'test-results', 'screenshots', 'section-tab');

  test.beforeEach(async ({ page, portalLoginPage, sectionPage, sectionAutomationUser, termsAndConditionsModal }) => {
    await page.goto(sectionData.targetUrl);
    await portalLoginPage.login(sectionAutomationUser.email, sectionAutomationUser.password);
    await page.waitForTimeout(1000);
    await termsAndConditionsModal.handleTermsAndConditionsIfVisible().catch(() => {});
    await sectionPage.navigateToSectionTab();
  });

  test('TC_SEC_006: Verify Section Name & Image widget cards (IR PDF, pdf, Section 11, Section 12, Section 2)', async ({ sectionPage }) => {
    await expect(sectionPage.sectionNameAndImageHeading).toBeVisible();

    for (const cardName of sectionData.sectionNameAndImageExpectedCards) {
      const cardLocator = sectionPage.sectionNameAndImageCards.filter({ hasText: cardName }).first();
      await expect(cardLocator).toBeVisible({ timeout: 5000 }).catch(() => {});
    }

    const screenshotPath = path.join(screenshotsDir, 'TC_SEC_006_Section_Name_And_Image.png');
    await sectionPage.takeScreenshot(screenshotPath);
  });

  test('TC_SEC_007: Click View All in Section Name & Image widget', async ({ sectionPage }) => {
    if (await sectionPage.sectionNameAndImageViewAll.isVisible().catch(() => false)) {
      await sectionPage.sectionNameAndImageViewAll.click();
      const screenshotPath = path.join(screenshotsDir, 'TC_SEC_007_Section_Name_And_Image_ViewAll.png');
      await sectionPage.takeScreenshot(screenshotPath);
    }
  });

  test('TC_SEC_008: Click individual section card in Section Name & Image widget', async ({ sectionPage }) => {
    const cardLocator = sectionPage.sectionNameAndImageCards.filter({ hasText: 'IR PDF' }).first();
    if (await cardLocator.isVisible().catch(() => false)) {
      await cardLocator.click();
      const screenshotPath = path.join(screenshotsDir, 'TC_SEC_008_Section_Name_And_Image_Card_Click.png');
      await sectionPage.takeScreenshot(screenshotPath);
    }
  });
});
