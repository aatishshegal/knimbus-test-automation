import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

test.describe('Home Page - Publishers and Databases', () => {
  const widgetTitle = 'Publishers & Databases';

  test.beforeEach(async ({ page, homePage }) => {
    await page.goto(process.env.PORTAL_URL as string);
    await expect(homePage.homePageIdentifier).toBeVisible();
  });

  for (const publisher of portalData.expectedPublishers) {
    test(`Verify ${publisher} is clickable and navigates correctly`, async ({ homePage, page }) => {
      // Scroll widget into view
      const widgetContainer = homePage.getWidgetContainer(widgetTitle);
      await widgetContainer.scrollIntoViewIfNeeded();

      // Click the publisher
      await homePage.clickWidgetItem(widgetTitle, publisher);
      
      // Since it navigates, wait for URL change or search results
      await page.waitForLoadState('networkidle');
      // Assert that we are on a search/results page
      await expect(page).toHaveURL(/.*search|.*browse/i);
    });
  }
});
