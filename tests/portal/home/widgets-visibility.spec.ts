import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

test.describe('Home Page - Widgets Visibility', () => {

  test.beforeEach(async ({ page, homePage }) => {
    await page.goto(process.env.PORTAL_URL as string);
    await expect(homePage.homePageIdentifier).toBeVisible();
  });

  for (const widgetTitle of portalData.widgets) {
    test(`Verify ${widgetTitle} section is rendered on the Home Page`, async ({ homePage }) => {
      const widgetContainer = homePage.getWidgetContainer(widgetTitle);
      await expect(widgetContainer).toBeVisible();
    });
  }
});
