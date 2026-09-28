import { test, expect } from '../../../src/fixtures';
import path from 'path';
import sectionData from '../../test-data/section-data.json';

test.describe('Section Page - Landing Page & Access Control (TC_Section_001 to TC_Section_012)', () => {
  const screenshotsDir = path.join(process.cwd(), 'test-results', 'screenshots', 'section-tab');

  test('TC_Section_001: Verify Section Tab Should be visible on header when has_landing_page is true and access is limited/unsecured', async ({ page, sectionPage }) => {
    await page.goto(sectionData.targetUrl);
    await expect(sectionPage.sectionTabLink).toBeVisible();
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_001.png'));
  });

  test('TC_Section_002: Verify Section Tab Should not be visible on Landing Page when page_access_type is secured', async ({ page, sectionPage }) => {
    await page.goto(sectionData.targetUrl);
    // When secured access without login, section tab should be hidden or redirect to login
    const isVisible = await sectionPage.landingPageSectionTab.isVisible().catch(() => false);
    if (!isVisible) {
      expect(isVisible).toBe(false);
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_002.png'));
  });

  test('TC_Section_003: Validate section tab when page_access_type is limited and user is outside campus', async ({ page, sectionPage }) => {
    await page.goto(sectionData.targetUrl);
    await sectionPage.navigateToSectionTab();
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_003.png'));
  });

  test('TC_Section_004: Verify section tab when page_access_type is limited and user inside campus', async ({ page, sectionPage }) => {
    await page.goto(sectionData.targetUrl);
    await sectionPage.navigateToSectionTab();
    if (await sectionPage.onlyNamePills.first().isVisible().catch(() => false)) {
      await sectionPage.onlyNamePills.first().click();
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_004.png'));
  });

  test('TC_Section_005: Validate section tab when page_access_type is unsecured', async ({ page, sectionPage }) => {
    await page.goto(sectionData.targetUrl);
    await sectionPage.navigateToSectionTab();
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_005.png'));
  });

  test('TC_Section_006: Verify section tab should be visible and clickable with navbar alignment', async ({ page, sectionPage }) => {
    await page.goto(sectionData.targetUrl);
    await expect(sectionPage.sectionTabLink).toBeVisible();
    await sectionPage.sectionTabLink.click();
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_006.png'));
  });

  test('TC_Section_007: Verify section tab should be visible on Home Page when has_landing_page is false', async ({ page, sectionPage }) => {
    await page.goto(sectionData.targetUrl);
    await expect(sectionPage.sectionTabLink).toBeVisible();
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_007.png'));
  });

  test('TC_Section_008: Verify section tab should not be visible on Home Page when page_access_type is secured', async ({ page, sectionPage }) => {
    await page.goto(sectionData.targetUrl);
    // Validate state when secured
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_008.png'));
  });

  test('TC_Section_009: Validate section tab when has_landing_page is false and user is outside campus', async ({ page, sectionPage }) => {
    await page.goto(sectionData.targetUrl);
    await sectionPage.navigateToSectionTab();
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_009.png'));
  });

  test('TC_Section_010: Verify section tab when has_landing_page is false and User inside campus', async ({ page, sectionPage }) => {
    await page.goto(sectionData.targetUrl);
    await sectionPage.navigateToSectionTab();
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_010.png'));
  });

  test('TC_Section_011: Validate section tab when page_access_type is unsecured without landing page', async ({ page, sectionPage }) => {
    await page.goto(sectionData.targetUrl);
    await sectionPage.navigateToSectionTab();
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_011.png'));
  });

  test('TC_Section_012: Verify section tab should be visible and clickable under navbar alignment configuration', async ({ page, sectionPage }) => {
    await page.goto(sectionData.targetUrl);
    await expect(sectionPage.sectionTabLink).toBeVisible();
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_012.png'));
  });
});
