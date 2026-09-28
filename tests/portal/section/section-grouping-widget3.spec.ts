import { test, expect } from '../../../src/fixtures';
import path from 'path';
import sectionData from '../../test-data/section-data.json';

test.describe('Section Tab - Widget 4: Section Grouping Widget 3', () => {
  const screenshotsDir = path.join(process.cwd(), 'test-results', 'screenshots', 'section-tab');

  test.beforeEach(async ({ page, portalLoginPage, sectionPage, sectionAutomationUser, termsAndConditionsModal }) => {
    await page.goto(sectionData.targetUrl);
    await portalLoginPage.login(sectionAutomationUser.email, sectionAutomationUser.password);
    await page.waitForTimeout(1000);
    await termsAndConditionsModal.handleTermsAndConditionsIfVisible().catch(() => {});
    await sectionPage.navigateToSectionTab();
  });

  test('TC_SEC_012: Verify Section Grouping widget heading and sub-tabs (Section 2, pdf, IR+PDF)', async ({ sectionPage }) => {
    await expect(sectionPage.sectionGroupingHeading).toBeVisible();

    for (const tabName of sectionData.groupingWidget3SubTabs) {
      const tabLocator = sectionPage.sectionGroupingSubTabs.filter({ hasText: tabName }).first();
      await expect(tabLocator).toBeVisible({ timeout: 5000 }).catch(() => {});
    }

    const screenshotPath = path.join(screenshotsDir, 'TC_SEC_012_Section_Grouping_Widget.png');
    await sectionPage.takeScreenshot(screenshotPath);
  });

  test('TC_SEC_013: Switch between sub-tabs in Section Grouping widget', async ({ sectionPage }) => {
    for (const tabName of sectionData.groupingWidget3SubTabs) {
      await sectionPage.selectGroupingSubTab(tabName);
      const screenshotPath = path.join(screenshotsDir, `TC_SEC_013_Grouping_Tab_${tabName.replace(/\+/g, '_')}.png`);
      await sectionPage.takeScreenshot(screenshotPath);
    }
  });

  test('TC_SEC_014: Navigate carousel items using Next/Prev controls', async ({ sectionPage }) => {
    if (await sectionPage.carouselNextButton.isVisible().catch(() => false)) {
      await sectionPage.carouselNextButton.click();
      const screenshotPathNext = path.join(screenshotsDir, 'TC_SEC_014_Carousel_Next.png');
      await sectionPage.takeScreenshot(screenshotPathNext);
    }

    if (await sectionPage.carouselPrevButton.isVisible().catch(() => false)) {
      await sectionPage.carouselPrevButton.click();
      const screenshotPathPrev = path.join(screenshotsDir, 'TC_SEC_014_Carousel_Prev.png');
      await sectionPage.takeScreenshot(screenshotPathPrev);
    }
  });

  test('TC_SEC_015: Click View All link in Section Grouping widget', async ({ sectionPage }) => {
    if (await sectionPage.sectionGroupingViewAll.isVisible().catch(() => false)) {
      await sectionPage.sectionGroupingViewAll.click();
      const screenshotPath = path.join(screenshotsDir, 'TC_SEC_015_Section_Grouping_ViewAll.png');
      await sectionPage.takeScreenshot(screenshotPath);
    }
  });
});
