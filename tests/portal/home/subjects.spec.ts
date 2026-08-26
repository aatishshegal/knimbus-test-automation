import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

test.describe('Home Page - Academic Subjects', () => {
  const widgetTitle = 'Academic Subjects';

  test.beforeEach(async ({ page, homePage }) => {
    await page.goto(process.env.PORTAL_URL as string);
    await expect(homePage.homePageIdentifier).toBeVisible();
  });

  test('Verify all academic subjects are clickable and navigate correctly', async ({ homePage }) => {
    // Calling the helper method to handle loop iteration inside the POM
    await homePage.verifyWidgetItemsClickable(widgetTitle, portalData.expectedSubjects.data);
  });
});
