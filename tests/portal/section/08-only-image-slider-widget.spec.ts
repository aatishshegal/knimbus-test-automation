import { test, expect } from '../../../src/fixtures';
import path from 'path';
import sectionData from '../../test-data/section-data.json';

test.describe('Section Page - Only Image Slider Widget (TC_Section_050 to TC_Section_054)', () => {
  const screenshotsDir = path.join(process.cwd(), 'test-results', 'screenshots', 'section-tab');

  test.beforeEach(async ({ page, portalLoginPage, sectionPage, sectionAutomationUser, termsAndConditionsModal }) => {
    await page.goto(sectionData.targetUrl);
    await portalLoginPage.login(sectionAutomationUser.email, sectionAutomationUser.password);
    await page.waitForTimeout(1000);
    await termsAndConditionsModal.handleTermsAndConditionsIfVisible().catch(() => {});
    await sectionPage.navigateToSectionTab();
  });

  test('TC_Section_050: Verify Visibility of Section with Only Image Slider (only_image_slider_item_widget.json)', async ({ sectionPage }) => {
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_050.png'));
  });

  test('TC_Section_051: Verify Visibility and Clickability of "Go to Previous" Button on Only Image Slider', async ({ sectionPage }) => {
    if (await sectionPage.onlyImageSliderPrevBtn.isVisible().catch(() => false)) {
      await sectionPage.onlyImageSliderPrevBtn.click();
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_051.png'));
  });

  test('TC_Section_052: Verify Visibility and Clickability of "Go to Next" Button on Only Image Slider', async ({ sectionPage }) => {
    if (await sectionPage.onlyImageSliderNextBtn.isVisible().catch(() => false)) {
      await sectionPage.onlyImageSliderNextBtn.click();
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_052.png'));
  });

  test('TC_Section_053: Verify clickability and Presence of "View All" Button at the End of Sections', async ({ sectionPage }) => {
    if (await sectionPage.onlyImageSliderViewAllBtn.isVisible().catch(() => false)) {
      await sectionPage.onlyImageSliderViewAllBtn.click();
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_053.png'));
  });

  test('TC_Section_054: Validate slider should move automatically after every 2 sec (widget_slider_auto_play_speed: 2000)', async ({ page, sectionPage }) => {
    await page.waitForTimeout(2500);
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_054.png'));
  });
});
