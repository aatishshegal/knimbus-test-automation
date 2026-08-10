import { test, expect } from '../../../src/fixtures';

test.describe('Home Page - Search Bar Validations', () => {
  test.beforeEach(async ({ page, portalLoginPage, homePage, homePageUser, context }) => {
    // Navigate to the base URL
    await page.goto(process.env.PORTAL_BASE_URL || 'https://sydneyuniversity.knimbus.com');
    
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

  test('Verify search bar is present on home page', async ({ topNavigationBar }) => {
    await expect(topNavigationBar.searchInput).toBeVisible();
  });

  test('Verify default search dropdown is Title', async ({ topNavigationBar }) => {
    await expect(topNavigationBar.searchDropdown).toHaveValue('doc_title');
  });

  test('Verify search dropdown contains Title, Author, Everything', async ({ topNavigationBar }) => {
    const optionsText = await topNavigationBar.searchDropdown.locator('option').allInnerTexts();
    expect(optionsText.map(t => t.trim())).toEqual(['Title', 'Author', 'Everything']);
  });

  test('Verify search placeholder text', async ({ topNavigationBar }) => {
    await expect(topNavigationBar.searchInput).toHaveAttribute('placeholder', 'Search journals, books, articles...');
  });

  test('Verify search button is disabled when input is empty', async ({ topNavigationBar }) => {
    await topNavigationBar.searchInput.clear();
    await expect(topNavigationBar.searchButton).toBeDisabled();
  });

  test('Verify search button is disabled when input has 2 characters', async ({ topNavigationBar }) => {
    await topNavigationBar.searchInput.fill('ab');
    await expect(topNavigationBar.searchButton).toBeDisabled();
  });

  test('Verify search button is enabled when input has 3 characters', async ({ topNavigationBar }) => {
    await topNavigationBar.searchInput.fill('abc');
    await expect(topNavigationBar.searchButton).toBeEnabled();
  });
});
