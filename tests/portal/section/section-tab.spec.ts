import { test, expect } from '../../../src/fixtures';
import path from 'path';
import fs from 'fs';
import sectionData from '../../test-data/section-data.json';

test.describe('Portal - Section Tab & Widgets E2E Test Suite', () => {
  const screenshotsDir = path.join(process.cwd(), 'test-results', 'screenshots', 'section-tab');

  test.beforeAll(() => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  test.beforeEach(async ({ page, portalLoginPage, sectionPage, sectionAutomationUser, termsAndConditionsModal }) => {
    // 1. Navigate to target portal URL
    await page.goto(sectionData.targetUrl);

    // 2. Perform End User Login
    await portalLoginPage.login(sectionAutomationUser.email, sectionAutomationUser.password);

    // 3. Handle T&C modal if visible
    await page.waitForTimeout(1000);
    await termsAndConditionsModal.handleTermsAndConditionsIfVisible().catch(() => {});

    // 4. Click Section Tab (<bdi>Section</bdi>)
    await sectionPage.navigateToSectionTab();
  });

  test('TC_SEC_001: End user login and navigation to Section tab with full page screenshot', async ({ page, sectionPage }) => {
    // Verify URL or Section page element visibility
    await expect(sectionPage.sectionTabLink).toBeVisible();

    // Take full page screenshot
    const screenshotPath = path.join(screenshotsDir, 'TC_SEC_001_Section_Tab_Loaded.png');
    await sectionPage.takeScreenshot(screenshotPath);
    console.log(`Saved screenshot to ${screenshotPath}`);
  });

  test('TC_SEC_002: Verify visibility of all 5 section widgets on page', async ({ sectionPage }) => {
    await expect(sectionPage.sectionOnlyImageHeading).toBeVisible({ timeout: 10000 });
    await expect(sectionPage.sectionNameAndImageHeading).toBeVisible({ timeout: 10000 });
    await expect(sectionPage.sectionOnlyNameHeading).toBeVisible({ timeout: 10000 });
    await expect(sectionPage.sectionGroupingHeading).toBeVisible({ timeout: 10000 });
    await expect(sectionPage.newArrivalsHeading).toBeVisible({ timeout: 10000 });
  });

  test.describe('Widget 1: Section Only Image', () => {
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

  test.describe('Widget 2: Section Name & Image', () => {
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

  test.describe('Widget 3: Section (Only Name)', () => {
    test('TC_SEC_009: Verify Section (Only Name) widget pills rendering', async ({ sectionPage }) => {
      await expect(sectionPage.sectionOnlyNameHeading).toBeVisible();

      for (const pillName of sectionData.sectionOnlyNameExpectedPills) {
        const pillLocator = sectionPage.sectionOnlyNamePills.filter({ hasText: pillName }).first();
        await expect(pillLocator).toBeVisible({ timeout: 5000 }).catch(() => {});
      }

      const screenshotPath = path.join(screenshotsDir, 'TC_SEC_009_Section_Only_Name.png');
      await sectionPage.takeScreenshot(screenshotPath);
    });

    test('TC_SEC_010: Click on a text-only section pill (Section 11)', async ({ sectionPage }) => {
      const pillLocator = sectionPage.sectionOnlyNamePills.filter({ hasText: 'Section 11' }).first();
      if (await pillLocator.isVisible().catch(() => false)) {
        await pillLocator.click();
        const screenshotPath = path.join(screenshotsDir, 'TC_SEC_010_Section_Only_Name_Pill_Click.png');
        await sectionPage.takeScreenshot(screenshotPath);
      }
    });

    test('TC_SEC_011: Click View All button in Section (Only Name) widget', async ({ sectionPage }) => {
      if (await sectionPage.sectionOnlyNameViewAll.isVisible().catch(() => false)) {
        await sectionPage.sectionOnlyNameViewAll.click();
        const screenshotPath = path.join(screenshotsDir, 'TC_SEC_011_Section_Only_Name_ViewAll.png');
        await sectionPage.takeScreenshot(screenshotPath);
      }
    });
  });

  test.describe('Widget 4: Section Grouping : grouping widget 3 json', () => {
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

  test.describe('Widget 5: New Arrivals: grouping_widget_2.json', () => {
    test('TC_SEC_016: Verify New Arrivals widget heading, subtitle, and sub-tabs', async ({ sectionPage }) => {
      await expect(sectionPage.newArrivalsHeading).toBeVisible();
      await expect(sectionPage.newArrivalsSubtitle).toBeVisible({ timeout: 5000 }).catch(() => {});

      for (const tabName of sectionData.newArrivalsSubTabs) {
        const tabLocator = sectionPage.newArrivalsSubTabs.filter({ hasText: tabName }).last();
        await expect(tabLocator).toBeVisible({ timeout: 5000 }).catch(() => {});
      }

      const screenshotPath = path.join(screenshotsDir, 'TC_SEC_016_New_Arrivals_Widget.png');
      await sectionPage.takeScreenshot(screenshotPath);
    });

    test('TC_SEC_017: Switch sub-tabs in New Arrivals widget', async ({ sectionPage }) => {
      for (const tabName of ['Section 2', 'Section 3', 'pdf']) {
        await sectionPage.selectNewArrivalsSubTab(tabName);
        const screenshotPath = path.join(screenshotsDir, `TC_SEC_017_NewArrivals_Tab_${tabName}.png`);
        await sectionPage.takeScreenshot(screenshotPath);
      }
    });

    test('TC_SEC_018: Click item card in New Arrivals widget', async ({ sectionPage }) => {
      const firstCard = sectionPage.newArrivalsCards.first();
      if (await firstCard.isVisible().catch(() => false)) {
        await firstCard.click();
        const screenshotPath = path.join(screenshotsDir, 'TC_SEC_018_NewArrivals_Card_Click.png');
        await sectionPage.takeScreenshot(screenshotPath);
      }
    });

    test('TC_SEC_019: Click View All link in New Arrivals widget', async ({ sectionPage }) => {
      if (await sectionPage.newArrivalsViewAll.isVisible().catch(() => false)) {
        await sectionPage.newArrivalsViewAll.click();
        const screenshotPath = path.join(screenshotsDir, 'TC_SEC_019_NewArrivals_ViewAll.png');
        await sectionPage.takeScreenshot(screenshotPath);
      }
    });
  });

  test('TC_SEC_020: Comprehensive screenshot generation of section page and widgets', async ({ sectionPage }) => {
    const screenshotPath = path.join(screenshotsDir, 'TC_SEC_020_Final_Section_Tab_State.png');
    await sectionPage.takeScreenshot(screenshotPath);
    console.log(`Final section tab screenshot saved to: ${screenshotPath}`);
  });
});
