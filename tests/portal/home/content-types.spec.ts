import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

test.describe('Home Page - Content Types Section', () => {
  const widgetTitle = 'Content Types';

  test.beforeEach(async ({ page, homePage }) => {
    await page.goto(process.env.PORTAL_URL as string);
    await expect(homePage.homePageIdentifier).toBeVisible();
  });

  test('Verify all content type cards are clickable and navigate correctly', async ({ homePage }) => {
    // Calling the helper method to handle loop iteration inside the POM
    await homePage.verifyWidgetItemsClickable(widgetTitle, portalData.expectedContentTypes.data);
  });
});
