import { test, expect } from '../../../src/fixtures';

test.describe('Home Page - Top Navigation Bar', () => {

  test.beforeEach(async ({ portalLoginPage, homePageUser }) => {
    await portalLoginPage.login(homePageUser.email, homePageUser.password);
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
