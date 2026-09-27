import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

test.describe('Home Page - Publishers and Databases', () => {
  const widgetTitle = 'Publishers & Databases';

  test.beforeEach(async ({ page, homePage }) => {
    await page.goto(process.env.PORTAL_URL as string);
    await expect(homePage.homePageIdentifier).toBeVisible();
  });

  test('Home Page - Publisher and database items navigate to corresponding publisher results when clicked', async ({ homePage }) => {
    await homePage.verifyWidgetItemsClickable(widgetTitle, portalData.expectedPublishers.data);
  });
});
