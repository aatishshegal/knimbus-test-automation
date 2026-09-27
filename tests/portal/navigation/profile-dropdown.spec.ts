import { test, expect } from '../../../src/fixtures';

test.describe('Global Navigation - Profile Dropdown Validations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PORTAL_URL as string);
  });

  test('Profile Dropdown - Displays user name, email, and primary navigation links', async ({ topNavigationBar }) => {
    await topNavigationBar.openProfileMenu();

    // Verify Name and Email are visible
    await expect(topNavigationBar.profileName).toBeVisible();
    await expect(topNavigationBar.profileEmail).toBeVisible();

    // Verify common links
    await expect(topNavigationBar.profileMenuProfileLink).toBeVisible();
    await expect(topNavigationBar.profileMenuMyLibraryLink).toBeVisible();
    await expect(topNavigationBar.profileMenuLogoutLink).toBeVisible();
  });

  test('Profile Dropdown - Librarian Dashboard link is visible for authorized user', async ({ topNavigationBar }) => {
    await topNavigationBar.openProfileMenu();
    await topNavigationBar.verifyLibrarianDashboardVisibility(true);
  });

  test('Profile Dropdown - Navigates to user profile page when clicking Profile link', async ({ topNavigationBar, profilePage, page }) => {
    await topNavigationBar.openProfileMenu();
    await topNavigationBar.profileMenuProfileLink.click();
    
    await expect(page).toHaveURL(/.*profile/);
    await expect(profilePage.profileHeader).toBeVisible();
  });

  test('Profile Dropdown - Navigates to My Library page when clicking My Library link', async ({ topNavigationBar, myLibraryPage, page }) => {
    await topNavigationBar.openProfileMenu();
    await topNavigationBar.profileMenuMyLibraryLink.click();
    
    await expect(page).toHaveURL(/.*myLibrary/);
    await expect(myLibraryPage.myLibraryHeader).toBeVisible();
  });

});

test.describe('Global Navigation - Logout Validation', () => {
  // Isolate the storage state so we don't invalidate the global session for other parallel tests
  test.use({ storageState: { cookies: [], origins: [] } });

  test('User Logout - Terminates active session and returns to public portal landing page', async ({ topNavigationBar, portalLoginPage, page, standardUser, termsAndConditionsModal }) => {
    await portalLoginPage.login(standardUser.email, standardUser.password);
    
    await termsAndConditionsModal.handleTermsAndConditionsIfVisible();

    await topNavigationBar.profileDropdown.click();
    await topNavigationBar.profileMenuLogoutLink.click();
    
    // After logout, it redirects to the public home page where Sign In button is visible
    await expect(portalLoginPage.signInPopupTrigger).toBeVisible({ timeout: 15000 });
  });
});
