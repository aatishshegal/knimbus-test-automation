import { test, expect } from '../../../src/fixtures';

test.describe('Global Navigation - Main Menu Validations @navigation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PORTAL_URL as string);
  });

  test('Verify top menu items are present', async ({ topNavigationBar }) => {
    await expect(topNavigationBar.menuSource).toBeVisible();
    await expect(topNavigationBar.menuSection).toBeVisible();
    await expect(topNavigationBar.menuSubject).toBeVisible();
    await expect(topNavigationBar.menuContent).toBeVisible();
    await expect(topNavigationBar.menuAZList).toBeVisible();
  });

});
