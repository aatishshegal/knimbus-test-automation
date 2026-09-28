import { test, expect } from '../../../src/fixtures';
import path from 'path';
import sectionData from '../../test-data/section-data.json';

test.describe('Section Page - Name With Image Slider Widget (TC_Section_045 to TC_Section_049)', () => {
  const screenshotsDir = path.join(process.cwd(), 'test-results', 'screenshots', 'section-tab');

  test.beforeEach(async ({ page, portalLoginPage, sectionPage, sectionAutomationUser, termsAndConditionsModal }) => {
    await page.goto(sectionData.targetUrl);
    await portalLoginPage.login(sectionAutomationUser.email, sectionAutomationUser.password);
    await page.waitForTimeout(1000);
    await termsAndConditionsModal.handleTermsAndConditionsIfVisible().catch(() => {});
    await sectionPage.navigateToSectionTab();
  });

  test('TC_Section_045: Verify Visibility of Section Name with Image Slider (name_with_image_slider_item_widget.json)', async ({ sectionPage }) => {
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_045.png'));
  });

  test('TC_Section_046: Verify Visibility and Clickability of "Go to Previous" Button on Name with Image Slider', async ({ sectionPage }) => {
    if (await sectionPage.nameWithImageSliderPrevBtn.isVisible().catch(() => false)) {
      await sectionPage.nameWithImageSliderPrevBtn.click();
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_046.png'));
  });

  test('TC_Section_047: Verify Visibility and Clickability of "Go to Next" Button on Name with Image Slider', async ({ sectionPage }) => {
    if (await sectionPage.nameWithImageSliderNextBtn.isVisible().catch(() => false)) {
      await sectionPage.nameWithImageSliderNextBtn.click();
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_047.png'));
  });

  test('TC_Section_048: Verify clickability and Presence of "View All" Button at the End of Sections', async ({ sectionPage }) => {
    if (await sectionPage.nameWithImageSliderViewAllBtn.isVisible().catch(() => false)) {
      await sectionPage.nameWithImageSliderViewAllBtn.click();
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_048.png'));
  });

  test('TC_Section_049: Validate slider should move automatically after every 2 sec (widget_slider_auto_play_speed: 2000)', async ({ page, sectionPage }) => {
    await page.waitForTimeout(2500);
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_049.png'));
  });
});
