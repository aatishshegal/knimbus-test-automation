import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

test.describe('Home Page - Content Types Section', () => {
  const widgetTitle = 'Content Types';

  test.beforeEach(async ({ page, homePage }) => {
    await page.goto(process.env.PORTAL_URL as string);
    await expect(homePage.homePageIdentifier).toBeVisible();
  });

  test('Home Page - Content type cards navigate to corresponding content type results when clicked', async ({ homePage }) => {
    await homePage.verifyWidgetItemsClickable(widgetTitle, portalData.expectedContentTypes.data);
  });
});
