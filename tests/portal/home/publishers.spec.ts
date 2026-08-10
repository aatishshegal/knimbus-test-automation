import { test, expect } from '../../../src/fixtures';
import homePageData from '../../test-data/home-page-data.json';

test.describe('Home Page - Publishers and Databases', () => {
  const widgetTitle = 'Publishers & Databases';

  test.beforeEach(async ({ portalLoginPage, homePageUser, homePage }) => {
    await portalLoginPage.login(homePageUser.email, homePageUser.password);
    await expect(homePage.homePageIdentifier).toBeVisible();
  });

  for (const publisher of homePageData.expectedPublishers) {
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
