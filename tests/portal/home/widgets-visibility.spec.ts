import { test, expect } from '../../../src/fixtures';
import homePageData from '../../test-data/home-page-data.json';

test.describe('Home Page - Widgets Visibility', () => {

  test.beforeEach(async ({ portalLoginPage, homePageUser, homePage }) => {
    await portalLoginPage.login(homePageUser.email, homePageUser.password);
    await expect(homePage.homePageIdentifier).toBeVisible();
  });

  for (const widgetTitle of homePageData.widgets) {
    test(`Verify ${widgetTitle} section is rendered on the Home Page`, async ({ homePage }) => {
      const widgetContainer = homePage.getWidgetContainer(widgetTitle);
      await expect(widgetContainer).toBeVisible();
    });
  }
});
