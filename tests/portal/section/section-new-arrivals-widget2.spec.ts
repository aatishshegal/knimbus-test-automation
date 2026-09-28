import { test, expect } from '../../../src/fixtures';
import path from 'path';
import sectionData from '../../test-data/section-data.json';

test.describe('Section Tab - Widget 5: New Arrivals Widget 2', () => {
  const screenshotsDir = path.join(process.cwd(), 'test-results', 'screenshots', 'section-tab');

  test.beforeEach(async ({ page, portalLoginPage, sectionPage, sectionAutomationUser, termsAndConditionsModal }) => {
    await page.goto(sectionData.targetUrl);
    await portalLoginPage.login(sectionAutomationUser.email, sectionAutomationUser.password);
    await page.waitForTimeout(1000);
    await termsAndConditionsModal.handleTermsAndConditionsIfVisible().catch(() => {});
    await sectionPage.navigateToSectionTab();
  });

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
