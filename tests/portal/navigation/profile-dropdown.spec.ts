import { test, expect } from '../../../src/fixtures';

test.describe('Global Navigation - Profile Dropdown Validations @navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PORTAL_URL as string);
  });

  test('Verify profile dropdown displays Name, Email and common links', async ({ topNavigationBar }) => {
    await topNavigationBar.openProfileMenu();

    // Verify Name and Email are visible
    await expect(topNavigationBar.profileName).toBeVisible();
    await expect(topNavigationBar.profileEmail).toBeVisible();

    // Verify common links
    await expect(topNavigationBar.profileMenuProfileLink).toBeVisible();
    await expect(topNavigationBar.profileMenuMyLibraryLink).toBeVisible();
    await expect(topNavigationBar.profileMenuLogoutLink).toBeVisible();
  });

  test('Verify Librarian Dashboard link conditionally based on presence', async ({ topNavigationBar }) => {
    await topNavigationBar.openProfileMenu();
    
    // Check if the link exists in the DOM for the current user
    const isLibrarianDashboardPresent = await topNavigationBar.profileMenuLibrarianDashboardLink.count() > 0;
    
    if (isLibrarianDashboardPresent) {
       console.log("Librarian Dashboard link is present for this user.");
       await expect(topNavigationBar.profileMenuLibrarianDashboardLink).toBeVisible();
    } else {
       console.log("Librarian Dashboard link is NOT present for this user (Not a librarian).");
       await expect(topNavigationBar.profileMenuLibrarianDashboardLink).toBeHidden();
    }
  });

  test('Verify clicking on Profile lands on Profile Page', async ({ topNavigationBar, profilePage, page }, testInfo) => {
    await topNavigationBar.openProfileMenu();
    await topNavigationBar.profileMenuProfileLink.click();
    
    // Hardcoded delay for visual testing purposes in headed mode
    if (!testInfo.project.use.headless) {
      await page.waitForTimeout(3000);
    }
    await expect(page).toHaveURL(/.*profile/);
    await expect(profilePage.profileHeader).toBeVisible();
  });

  test('Verify clicking on My Library lands on My Library Page', async ({ topNavigationBar, myLibraryPage, page }, testInfo) => {
    await topNavigationBar.openProfileMenu();
    await topNavigationBar.profileMenuMyLibraryLink.click();
    
    // Hardcoded delay for visual testing purposes in headed mode
    if (!testInfo.project.use.headless) {
      await page.waitForTimeout(3000);
    }
    await expect(page).toHaveURL(/.*myLibrary/);
    await expect(myLibraryPage.myLibraryHeader).toBeVisible();
  });

});

test.describe('Global Navigation - Logout Validation @navigation', () => {
  // Isolate the storage state so we don't invalidate the global session for other parallel tests
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Verify clicking Logout logs the user out', async ({ topNavigationBar, portalLoginPage, page, standardUser, termsAndConditionsModal }, testInfo) => {
    // 1. Manually login for this isolated test
    await portalLoginPage.login(standardUser.email, standardUser.password);
    
    // 2. Handle Terms and Conditions modal if it appears for the standard user
    // Wait briefly for the UI to transition and the modal to render (if applicable)
    await page.waitForTimeout(3000); 
    await termsAndConditionsModal.handleTermsAndConditionsIfVisible();

    await topNavigationBar.profileDropdown.click();
    await topNavigationBar.profileMenuLogoutLink.click();
    
    // Hardcoded delay for visual testing purposes in headed mode
    if (!testInfo.project.use.headless) {
      await page.waitForTimeout(3000);
    }
    // After logout, it redirects to the public home page where Sign In button is visible
    await expect(portalLoginPage.signInPopupTrigger).toBeVisible({ timeout: 15000 });
  });
});
