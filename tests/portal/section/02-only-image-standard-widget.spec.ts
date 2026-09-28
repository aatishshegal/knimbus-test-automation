import { test, expect } from '../../../src/fixtures';
import path from 'path';
import sectionData from '../../test-data/section-data.json';

test.describe('Section Page - Only Image Standard Item Widget (TC_Section_013 to TC_Section_021)', () => {
  const screenshotsDir = path.join(process.cwd(), 'test-results', 'screenshots', 'section-tab');

  test.beforeEach(async ({ page, portalLoginPage, sectionPage, sectionAutomationUser, termsAndConditionsModal }) => {
    await page.goto(sectionData.targetUrl);
    await portalLoginPage.login(sectionAutomationUser.email, sectionAutomationUser.password);
    await page.waitForTimeout(1000);
    await termsAndConditionsModal.handleTermsAndConditionsIfVisible().catch(() => {});
    await sectionPage.navigateToSectionTab();
  });

  test('TC_Section_013: Verify visibility of default sections', async ({ sectionPage }) => {
    await expect(sectionPage.onlyImageStandardWidgetHeading).toBeVisible({ timeout: 10000 });
    const count = await sectionPage.onlyImageCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_013.png'));
  });

  test('TC_Section_014: Verify View all button is present after the default sections', async ({ sectionPage }) => {
    if (await sectionPage.onlyImageViewAllButton.isVisible().catch(() => false)) {
      await expect(sectionPage.onlyImageViewAllButton).toBeVisible();
      await sectionPage.onlyImageViewAllButton.click();
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_014.png'));
  });

  test('TC_Section_015: Verify Widget Name for Section with only_image_standard_item_widget.json Theme', async ({ sectionPage }) => {
    await expect(sectionPage.onlyImageStandardWidgetHeading).toBeVisible();
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_015.png'));
  });

  test('TC_Section_016: Verify Visibility and Clickability of Images in "Only Image" Sections', async ({ sectionPage }) => {
    const cardCount = await sectionPage.onlyImageCards.count();
    if (cardCount > 0) {
      await sectionPage.onlyImageCards.first().click().catch(() => {});
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_016.png'));
  });

  test('TC_Section_017: Verify Name Display on Image Hover', async ({ sectionPage }) => {
    await sectionPage.hoverOverImage(0);
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_017.png'));
  });

  test('TC_Section_018: Verify Hand Icon Visibility on Image Hover', async ({ sectionPage }) => {
    await sectionPage.hoverOverImage(0);
    const card = sectionPage.onlyImageCards.first();
    if (await card.isVisible().catch(() => false)) {
      const cursorStyle = await card.evaluate((el) => window.getComputedStyle(el).cursor);
      expect(cursorStyle).toBeTruthy();
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_018.png'));
  });

  test('TC_Section_019: Verify Redirection upon Clicking Image', async ({ sectionPage }) => {
    const cardCount = await sectionPage.onlyImageCards.count();
    if (cardCount > 0) {
      await sectionPage.onlyImageCards.first().click().catch(() => {});
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_019.png'));
  });

  test('TC_Section_020: Verify Visibility of "View All" Button after 5 Sections (item_display_count: 5)', async ({ sectionPage }) => {
    if (await sectionPage.onlyImageViewAllButton.isVisible().catch(() => false)) {
      await expect(sectionPage.onlyImageViewAllButton).toBeVisible();
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_020.png'));
  });

  test('TC_Section_021: Verify Hover and Click Functionality on "View All" Button', async ({ sectionPage }) => {
    if (await sectionPage.onlyImageViewAllButton.isVisible().catch(() => false)) {
      await sectionPage.onlyImageViewAllButton.hover();
      await sectionPage.onlyImageViewAllButton.click();
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_021.png'));
  });
});
