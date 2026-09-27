import { test, expect } from '../../../src/fixtures';

test.describe('Global Navigation - Main Menu Validations', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PORTAL_URL as string);
  });

  test('Main Navigation Bar - Primary top menu navigation items are visible', async ({ topNavigationBar }) => {
    await expect(topNavigationBar.menuSource).toBeVisible();
    await expect(topNavigationBar.menuSection).toBeVisible();
    await expect(topNavigationBar.menuSubject).toBeVisible();
    await expect(topNavigationBar.menuContent).toBeVisible();
    await expect(topNavigationBar.menuAZList).toBeVisible();
  });

});
