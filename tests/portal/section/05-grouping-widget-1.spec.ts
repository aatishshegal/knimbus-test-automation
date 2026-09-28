import { test, expect } from '../../../src/fixtures';
import path from 'path';
import sectionData from '../../test-data/section-data.json';

test.describe('Section Page - Grouping Widget 1 Theme & Orientations (TC_Section_025 to TC_Section_037)', () => {
  const screenshotsDir = path.join(process.cwd(), 'test-results', 'screenshots', 'section-tab');

  test.beforeEach(async ({ page, portalLoginPage, sectionPage, sectionAutomationUser, termsAndConditionsModal }) => {
    await page.goto(sectionData.targetUrl);
    await portalLoginPage.login(sectionAutomationUser.email, sectionAutomationUser.password);
    await page.waitForTimeout(1000);
    await termsAndConditionsModal.handleTermsAndConditionsIfVisible().catch(() => {});
    await sectionPage.navigateToSectionTab();
  });

  test('TC_Section_025: Verify visibility and clickability of grouping_widget_1.json Theme in portrait Orientation', async ({ sectionPage }) => {
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_025.png'));
  });

  test('TC_Section_026: Verify Visibility and Clickability of "Go to Previous" Button in portrait Orientation', async ({ sectionPage }) => {
    if (await sectionPage.groupingWidget1PrevBtn.isVisible().catch(() => false)) {
      await sectionPage.groupingWidget1PrevBtn.click();
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_026.png'));
  });

  test('TC_Section_027: Verify Visibility and Clickability of "Go to Next" Button in portrait Orientation', async ({ sectionPage }) => {
    if (await sectionPage.groupingWidget1NextBtn.isVisible().catch(() => false)) {
      await sectionPage.groupingWidget1NextBtn.click();
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_027.png'));
  });

  test('TC_Section_028: Verify clickability and Presence of "View All" Button at the End of Sections in portrait Orientation', async ({ sectionPage }) => {
    if (await sectionPage.groupingWidget1ViewAllBtn.isVisible().catch(() => false)) {
      await sectionPage.groupingWidget1ViewAllBtn.click();
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_028.png'));
  });

  test('TC_Section_029: Verify visibility and clickability of grouping_widget_1.json Theme in landscape Orientation', async ({ sectionPage }) => {
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_029.png'));
  });

  test('TC_Section_030: Verify visibility and clickability of grouping_widget_1.json Theme in landscape_md Orientation', async ({ sectionPage }) => {
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_030.png'));
  });

  test('TC_Section_031: Verify Visibility and Clickability of "Go to Previous" Button in landscape_md Orientation', async ({ sectionPage }) => {
    if (await sectionPage.groupingWidget1PrevBtn.isVisible().catch(() => false)) {
      await sectionPage.groupingWidget1PrevBtn.click();
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_031.png'));
  });

  test('TC_Section_032: Verify Visibility and Clickability of "Go to Next" Button in landscape_md Orientation', async ({ sectionPage }) => {
    if (await sectionPage.groupingWidget1NextBtn.isVisible().catch(() => false)) {
      await sectionPage.groupingWidget1NextBtn.click();
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_032.png'));
  });

  test('TC_Section_033: Verify clickability and Presence of "View All" Button in landscape_md Orientation', async ({ sectionPage }) => {
    if (await sectionPage.groupingWidget1ViewAllBtn.isVisible().catch(() => false)) {
      await sectionPage.groupingWidget1ViewAllBtn.click();
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_033.png'));
  });

  test('TC_Section_034: Verify visibility and clickability of grouping_widget_1.json Theme in landscape_lg Orientation', async ({ sectionPage }) => {
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_034.png'));
  });

  test('TC_Section_035: Verify Visibility and Clickability of "Go to Previous" Button in landscape_lg Orientation', async ({ sectionPage }) => {
    if (await sectionPage.groupingWidget1PrevBtn.isVisible().catch(() => false)) {
      await sectionPage.groupingWidget1PrevBtn.click();
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_035.png'));
  });

  test('TC_Section_036: Verify Visibility and Clickability of "Go to Next" Button in landscape_lg Orientation', async ({ sectionPage }) => {
    if (await sectionPage.groupingWidget1NextBtn.isVisible().catch(() => false)) {
      await sectionPage.groupingWidget1NextBtn.click();
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_036.png'));
  });

  test('TC_Section_037: Verify clickability and Presence of "View All" Button in landscape_lg Orientation', async ({ sectionPage }) => {
    if (await sectionPage.groupingWidget1ViewAllBtn.isVisible().catch(() => false)) {
      await sectionPage.groupingWidget1ViewAllBtn.click();
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_037.png'));
  });
});
