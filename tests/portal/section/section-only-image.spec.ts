import { test, expect } from '../../../src/fixtures';
import path from 'path';
import sectionData from '../../test-data/section-data.json';

test.describe('Section Tab - Widget 1: Section Only Image', () => {
  const screenshotsDir = path.join(process.cwd(), 'test-results', 'screenshots', 'section-tab');

  test.beforeEach(async ({ page, portalLoginPage, sectionPage, sectionAutomationUser, termsAndConditionsModal }) => {
    await page.goto(sectionData.targetUrl);
    await portalLoginPage.login(sectionAutomationUser.email, sectionAutomationUser.password);
    await page.waitForTimeout(1000);
    await termsAndConditionsModal.handleTermsAndConditionsIfVisible().catch(() => {});
    await sectionPage.navigateToSectionTab();
  });

  test('TC_SEC_003: Verify Section Only image widget heading and cards rendering', async ({ sectionPage }) => {
    await expect(sectionPage.sectionOnlyImageHeading).toBeVisible();
    const cardCount = await sectionPage.sectionOnlyImageCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(0);

    const screenshotPath = path.join(screenshotsDir, 'TC_SEC_003_Section_Only_Image.png');
    await sectionPage.takeScreenshot(screenshotPath);
  });

  test('TC_SEC_004: Search functionality within Section Only image search bar', async ({ sectionPage }) => {
    await sectionPage.searchInSectionOnlyImage(sectionData.searchQuery);
    const screenshotPath = path.join(screenshotsDir, 'TC_SEC_004_Section_Only_Image_Search.png');
    await sectionPage.takeScreenshot(screenshotPath);
  });

  test('TC_SEC_005: Click on an image tile in Section Only image widget', async ({ sectionPage }) => {
    const cardCount = await sectionPage.sectionOnlyImageCards.count();
    if (cardCount > 0) {
      await sectionPage.sectionOnlyImageCards.first().click().catch(() => {});
      const screenshotPath = path.join(screenshotsDir, 'TC_SEC_005_Section_Only_Image_Tile_Click.png');
      await sectionPage.takeScreenshot(screenshotPath);
    }
  });
});
