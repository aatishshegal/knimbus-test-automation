import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

test.describe('Global Navigation - Search Bar Validations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PORTAL_URL as string);
  });

  test('Search Bar - Search input field is visible on home page', async ({ topNavigationBar }) => {
    await expect(topNavigationBar.searchInput).toBeVisible();
  });

  test('Search Bar - Default search category dropdown selection is Title', async ({ topNavigationBar }) => {
    await expect(topNavigationBar.searchDropdown).toHaveValue('doc_title');
  });

  test('Search Bar - Search dropdown provides Title, Author, and Everything categories', async ({ topNavigationBar }) => {
    await expect(topNavigationBar.searchDropdown.locator('option').first()).toBeAttached();
    const optionsText = await topNavigationBar.searchDropdown.locator('option').allTextContents();
    expect(optionsText.map(t => t.trim())).toEqual(portalData.searchBarData.expectedDropdownOptions);
  });

  test('Search Bar - Input field displays expected placeholder text', async ({ topNavigationBar }) => {
    await expect(topNavigationBar.searchInput).toHaveAttribute('placeholder', portalData.searchBarData.expectedPlaceholder);
  });

  test('Search Bar - Search button remains disabled when input is empty', async ({ topNavigationBar }) => {
    await topNavigationBar.searchInput.clear();
    await expect(topNavigationBar.searchButton).toBeDisabled();
  });

  test('Search Bar - Search button remains disabled when input length is fewer than 3 characters', async ({ topNavigationBar }) => {
    await topNavigationBar.searchInput.clear();
    await topNavigationBar.searchInput.pressSequentially(portalData.searchBarData.invalidSearchTerm, { delay: 100 });
    await expect(topNavigationBar.searchButton).toBeDisabled();
  });

  test('Search Bar - Search button enables when valid input of 3 characters or more is entered', async ({ topNavigationBar }) => {
    await topNavigationBar.searchInput.clear();
    await topNavigationBar.searchInput.pressSequentially(portalData.searchBarData.validSearchTerm, { delay: 100 });
    await expect(topNavigationBar.searchButton).toBeEnabled();
  });

  test('Search Bar - Submitting query with default category navigates to search results page', async ({ topNavigationBar, searchResultPage, page }) => {
    await topNavigationBar.searchInput.clear();
    await topNavigationBar.searchInput.pressSequentially(portalData.searchBarData.navigationSearchTerm, { delay: 100 });
    await expect(topNavigationBar.searchButton).toBeEnabled();
    
    await topNavigationBar.searchButton.click();
    
    await expect(page).toHaveURL(/.*searchresult/);
    await expect(searchResultPage.searchResultIdentifier).toBeVisible({ timeout: 10000 });
  });

  test('Search Bar - Submitting query with Author category navigates to search results page', async ({ topNavigationBar, searchResultPage, page }) => {
    await topNavigationBar.searchDropdown.selectOption({ label: 'Author' });
    
    await topNavigationBar.searchInput.clear();
    await topNavigationBar.searchInput.pressSequentially(portalData.searchBarData.authorSearchTerm, { delay: 100 });
    await expect(topNavigationBar.searchButton).toBeEnabled();
    
    await topNavigationBar.searchButton.click();
    
    await expect(page).toHaveURL(/.*searchresult/);
    await expect(searchResultPage.searchResultIdentifier).toBeVisible({ timeout: 10000 });
  });

  test('Search Bar - Displays live auto-suggestion list as user types search query', async ({ topNavigationBar, page }) => {
    await topNavigationBar.searchInput.clear();
    await topNavigationBar.searchInput.pressSequentially(portalData.searchBarData.autoSuggestionTerm, { delay: 100 });
    
    const autoSuggestionBox = page.locator('div.suggested-result').first();
    await expect(autoSuggestionBox).toBeVisible({ timeout: 10000 });
    
    const firstSuggestionItem = autoSuggestionBox.locator('li.list-group-item').first();
    await expect(firstSuggestionItem).toBeVisible({ timeout: 10000 });
    
    const suggestionItemsCount = await autoSuggestionBox.locator('li.list-group-item').count();
    expect(suggestionItemsCount).toBeGreaterThan(0);
  });
});
