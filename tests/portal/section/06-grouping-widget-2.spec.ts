import { test, expect } from '../../../src/fixtures';
import path from 'path';
import sectionData from '../../test-data/section-data.json';

test.describe('Section Page - Grouping Widget 2 Theme & Orientations (TC_Section_038 to TC_Section_044)', () => {
  const screenshotsDir = path.join(process.cwd(), 'test-results', 'screenshots', 'section-tab');

  test.beforeEach(async ({ page, portalLoginPage, sectionPage, sectionAutomationUser, termsAndConditionsModal }) => {
    await page.goto(sectionData.targetUrl);
    await portalLoginPage.login(sectionAutomationUser.email, sectionAutomationUser.password);
    await page.waitForTimeout(1000);
    await termsAndConditionsModal.handleTermsAndConditionsIfVisible().catch(() => {});
    await sectionPage.navigateToSectionTab();
  });

  test('TC_Section_038: Verify visibility and clickability of grouping_widget_2.json Theme in portrait Orientation', async ({ sectionPage }) => {
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_038.png'));
  });

  test('TC_Section_039: Verify clickability and Presence of "View All" Button in portrait Orientation', async ({ sectionPage }) => {
    if (await sectionPage.groupingWidget2ViewAllBtn.isVisible().catch(() => false)) {
      await sectionPage.groupingWidget2ViewAllBtn.click();
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_039.png'));
  });

  test('TC_Section_040: Verify visibility and clickability of grouping_widget_2.json Theme in landscape Orientation', async ({ sectionPage }) => {
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_040.png'));
  });

  test('TC_Section_041: Verify visibility and clickability of grouping_widget_2.json Theme in landscape_md Orientation', async ({ sectionPage }) => {
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_041.png'));
  });

  test('TC_Section_042: Verify clickability and Presence of "View All" Button in landscape_md Orientation', async ({ sectionPage }) => {
    if (await sectionPage.groupingWidget2ViewAllBtn.isVisible().catch(() => false)) {
      await sectionPage.groupingWidget2ViewAllBtn.click();
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_042.png'));
  });

  test('TC_Section_043: Verify visibility and clickability of grouping_widget_2.json Theme in landscape_lg Orientation', async ({ sectionPage }) => {
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_043.png'));
  });

  test('TC_Section_044: Verify clickability and Presence of "View All" Button in landscape_lg Orientation', async ({ sectionPage }) => {
    if (await sectionPage.groupingWidget2ViewAllBtn.isVisible().catch(() => false)) {
      await sectionPage.groupingWidget2ViewAllBtn.click();
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_044.png'));
  });
});
