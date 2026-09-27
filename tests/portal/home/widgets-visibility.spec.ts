import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

test.describe('Home Page - Widgets Visibility', () => {

  test.beforeEach(async ({ page, homePage }) => {
    await page.goto(process.env.PORTAL_URL as string);
    await expect(homePage.homePageIdentifier).toBeVisible();
  });

  test('Home Page Widgets - Renders all configured sections on home page landing', async ({ homePage }) => {
    await homePage.verifyWidgetsVisibility(portalData.widgets.data);
  });
});
