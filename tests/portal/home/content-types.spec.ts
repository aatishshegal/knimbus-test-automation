import { test, expect } from '../../../src/fixtures';
import homePageData from '../../test-data/home-page-data.json';

test.describe('Home Page - Content Types', () => {
  const widgetTitle = 'Content Types';

  test.beforeEach(async ({ page, homePage }) => {
    await page.goto(process.env.PORTAL_URL as string);
    await expect(homePage.homePageIdentifier).toBeVisible();
  });

  for (const contentType of homePageData.expectedContentTypes) {
    test(`Verify ${contentType} card is clickable and navigates correctly`, async ({ homePage, page }) => {
      const widgetContainer = homePage.getWidgetContainer(widgetTitle);
      await widgetContainer.scrollIntoViewIfNeeded();
      
      // Click the content type card
      await homePage.clickWidgetItem(widgetTitle, contentType);
      
      await page.waitForLoadState('networkidle');
      // Assert that navigation took place
      await expect(page).toHaveURL(/.*search|.*browse/i);
    });
  }
});
