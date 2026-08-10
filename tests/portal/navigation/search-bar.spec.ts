import { test, expect } from '../../../src/fixtures';
import homePageData from '../../test-data/home-page-data.json';

test.describe('Global Navigation - Search Bar Validations @navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PORTAL_URL as string);
  });

  test('Verify search bar is present on home page', async ({ topNavigationBar }) => {
    await expect(topNavigationBar.searchInput).toBeVisible();
  });

  test('Verify default search dropdown is Title', async ({ topNavigationBar }) => {
    await expect(topNavigationBar.searchDropdown).toHaveValue('doc_title');
  });

  test('Verify search dropdown contains Title, Author, Everything', async ({ topNavigationBar }) => {
    const optionsText = await topNavigationBar.searchDropdown.locator('option').allInnerTexts();
    expect(optionsText.map(t => t.trim())).toEqual(homePageData.searchBarData.expectedDropdownOptions);
  });

  test('Verify search placeholder text', async ({ topNavigationBar }) => {
    await expect(topNavigationBar.searchInput).toHaveAttribute('placeholder', homePageData.searchBarData.expectedPlaceholder);
  });

  test('Verify search button is disabled when input is empty', async ({ topNavigationBar, page }) => {
    await topNavigationBar.searchInput.clear();
    if (process.argv.includes('--headed')) await page.waitForTimeout(1000); // Visual pause
    await expect(topNavigationBar.searchButton).toBeDisabled();
  });

  test('Verify search button is disabled when input has 2 characters', async ({ topNavigationBar, page }) => {
    await topNavigationBar.searchInput.clear();
    // Use pressSequentially with a delay to visually simulate real user typing
    await topNavigationBar.searchInput.pressSequentially(homePageData.searchBarData.invalidSearchTerm, { delay: 150 });
    if (process.argv.includes('--headed')) await page.waitForTimeout(1000); // Wait so user can see it
    await expect(topNavigationBar.searchButton).toBeDisabled();
  });

  test('Verify search button is enabled when input has 3 characters', async ({ topNavigationBar, page }) => {
    await topNavigationBar.searchInput.clear();
    // Use pressSequentially with a delay to visually simulate real user typing
    await topNavigationBar.searchInput.pressSequentially(homePageData.searchBarData.validSearchTerm, { delay: 150 });
    if (process.argv.includes('--headed')) await page.waitForTimeout(1000); // Wait so user can see it
    await expect(topNavigationBar.searchButton).toBeEnabled();
  });
});

