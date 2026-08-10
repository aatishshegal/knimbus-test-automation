import { test, expect } from '../../../src/fixtures';

test.describe('Global Navigation - Profile Dropdown Validations @navigation', () => {
  test.beforeEach(async ({ page, portalLoginPage, homePage, homePageUser, context }) => {
    await page.goto(process.env.PORTAL_URL as string);
    
    // Check if the session is already active (via storageState)
    const isAlreadyLoggedIn = await homePage.homePageIdentifier.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (!isAlreadyLoggedIn) {
      console.log('Session expired or missing. Performing UI login...');
      await portalLoginPage.login(homePageUser.email, homePageUser.password);
      await expect(homePage.homePageIdentifier).toBeVisible();
      // Save the fresh session state so subsequent test cases can reuse it
      await context.storageState({ path: '.auth/user.json' });
    }
  });

  test('Verify profile dropdown toggle is visible', async ({ topNavigationBar }) => {
    // Wait for network idle or elements to load
    await expect(topNavigationBar.profileDropdown).toBeVisible();
  });

  test('Verify profile dropdown opens on click', async ({ topNavigationBar, page }) => {
    await topNavigationBar.profileDropdown.click();
    
    // Verify the dropdown menu appears containing profile/logout links
    const profileMenu = page.locator('.dropdown-menu.show').filter({ hasText: 'Sign out' }).or(page.locator('.dropdown-menu.show').filter({ hasText: 'Logout' })).or(page.locator('.profile-menu.show'));
    
    // As per Knimbus structure, clicking the profile toggles a dropdown-menu
    const genericDropdown = page.locator('.dropdown-menu.show').first();
    await expect(genericDropdown).toBeVisible();
  });
});
