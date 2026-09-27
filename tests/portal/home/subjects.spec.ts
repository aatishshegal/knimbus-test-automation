import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

test.describe('Home Page - Academic Subjects', () => {
  const widgetTitle = 'Academic Subjects';

  test.beforeEach(async ({ page, homePage }) => {
    await page.goto(process.env.PORTAL_URL as string);
    await expect(homePage.homePageIdentifier).toBeVisible();
  });

  test('Home Page - Academic subjects navigate to corresponding subject search results when clicked', async ({ homePage }) => {
    await homePage.verifyWidgetItemsClickable(widgetTitle, portalData.expectedSubjects.data);
  });
});
