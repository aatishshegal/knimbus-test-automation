import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

test.describe('Home Page - Academic Subjects', () => {
  const widgetTitle = 'Academic Subjects';

  test.beforeEach(async ({ page, homePage }) => {
    await page.goto(process.env.PORTAL_URL as string);
    await expect(homePage.homePageIdentifier).toBeVisible();
  });

  for (const subject of portalData.expectedSubjects) {
    test(`Verify subject ${subject} is clickable and navigates correctly`, async ({ homePage, page }) => {
      // Scroll widget into view
      const widgetContainer = homePage.getWidgetContainer(widgetTitle);
      await widgetContainer.scrollIntoViewIfNeeded();

      // Click the subject
      await homePage.clickWidgetItem(widgetTitle, subject);
      
      // Navigate
      await page.waitForLoadState('networkidle');
      // Assert that we are on a search/results page
      await expect(page).toHaveURL(/.*search|.*browse/i);
    });
  }
});
