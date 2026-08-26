import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

test.describe('Home Page - Widgets Visibility', () => {

  test.beforeEach(async ({ page, homePage }) => {
    await page.goto(process.env.PORTAL_URL as string);
    await expect(homePage.homePageIdentifier).toBeVisible();
  });

  test('Verify all configured widgets are rendered on the Home Page', async ({ homePage }) => {
    // Calling the helper method to handle loop iteration inside the POM
    await homePage.verifyWidgetsVisibility(portalData.widgets.data);
  });
});
