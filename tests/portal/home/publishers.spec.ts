import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

test.describe('Home Page - Publishers and Databases', () => {
  const widgetTitle = 'Publishers & Databases';

  test.beforeEach(async ({ page, homePage }) => {
    await page.goto(process.env.PORTAL_URL as string);
    await expect(homePage.homePageIdentifier).toBeVisible();
  });

  test('Verify all publisher cards are clickable and navigate correctly', async ({ homePage }) => {
    // Calling the helper method to handle loop iteration inside the POM
    await homePage.verifyWidgetItemsClickable(widgetTitle, portalData.expectedPublishers.data);
  });
});
