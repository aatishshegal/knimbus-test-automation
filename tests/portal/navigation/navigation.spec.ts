import { test, expect } from '../../../src/fixtures';

test.describe('Global Navigation - Top Navigation Bar', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PORTAL_URL as string);
  });

  test('Verify search bar is visible and clickable', async ({ topNavigationBar }) => {
    await expect(topNavigationBar.searchInput).toBeVisible();
    await expect(topNavigationBar.searchButton).toBeVisible();
  });

  test('Verify top menu items are present', async ({ topNavigationBar }) => {
    await expect(topNavigationBar.menuSource).toBeVisible();
    await expect(topNavigationBar.menuSection).toBeVisible();
    await expect(topNavigationBar.menuSubject).toBeVisible();
    await expect(topNavigationBar.menuContent).toBeVisible();
    await expect(topNavigationBar.menuAZList).toBeVisible();
  });

  test('Verify profile menu can be opened', async ({ topNavigationBar }) => {
    await expect(topNavigationBar.profileDropdown).toBeVisible();
  });

});
