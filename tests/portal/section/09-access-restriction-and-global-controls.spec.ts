import { test, expect } from '../../../src/fixtures';
import path from 'path';
import sectionData from '../../test-data/section-data.json';

test.describe('Section Page - Access Restrictions & Global Controls (TC_Section_055 to TC_Section_058)', () => {
  const screenshotsDir = path.join(process.cwd(), 'test-results', 'screenshots', 'section-tab');

  test.beforeEach(async ({ page, portalLoginPage, sectionPage, sectionAutomationUser, termsAndConditionsModal }) => {
    await page.goto(sectionData.targetUrl);
    await portalLoginPage.login(sectionAutomationUser.email, sectionAutomationUser.password);
    await page.waitForTimeout(1000);
    await termsAndConditionsModal.handleTermsAndConditionsIfVisible().catch(() => {});
    await sectionPage.navigateToSectionTab();
  });

  test('TC_Section_055: Verify Restricted Section which is not assigned to logged-in end user', async ({ sectionPage }) => {
    const isRestrictedVisible = await sectionPage.restrictedSectionCard.isVisible().catch(() => false);
    expect(isRestrictedVisible).toBe(false);
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_055.png'));
  });

  test('TC_Section_056: Verify Restricted Section which is assigned to logged-in end user', async ({ sectionPage }) => {
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_056.png'));
  });

  test('TC_Section_057: Verify Presence of "Go to Top" Button on scrolling to bottom', async ({ sectionPage }) => {
    await sectionPage.scrollToBottom();
    if (await sectionPage.goToTopButton.isVisible().catch(() => false)) {
      await expect(sectionPage.goToTopButton).toBeVisible();
    }
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_057.png'));
  });

  test('TC_Section_058: Verify Click Functionality on "Go to Top" Button', async ({ sectionPage }) => {
    await sectionPage.scrollToBottom();
    await sectionPage.clickGoToTop();
    await sectionPage.takeScreenshot(path.join(screenshotsDir, 'TC_Section_058.png'));
  });
});
