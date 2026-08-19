import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

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
    // Wait for the options to actually render in the DOM before extracting texts
    await expect(topNavigationBar.searchDropdown.locator('option').first()).toBeAttached();
    const optionsText = await topNavigationBar.searchDropdown.locator('option').allTextContents();
    expect(optionsText.map(t => t.trim())).toEqual(portalData.searchBarData.expectedDropdownOptions);
  });

  test('Verify search placeholder text', async ({ topNavigationBar }) => {
    await expect(topNavigationBar.searchInput).toHaveAttribute('placeholder', portalData.searchBarData.expectedPlaceholder);
  });

  test('Verify search button is disabled when input is empty', async ({ topNavigationBar, page }, testInfo) => {
    await topNavigationBar.searchInput.clear();
    if (!testInfo.project.use.headless) await page.waitForTimeout(1000); // Visual pause
    await expect(topNavigationBar.searchButton).toBeDisabled();
  });

  test('Verify search button is disabled when input has 2 characters', async ({ topNavigationBar, page }, testInfo) => {
    await topNavigationBar.searchInput.clear();
    // Use pressSequentially with a delay to visually simulate real user typing
    await topNavigationBar.searchInput.pressSequentially(portalData.searchBarData.invalidSearchTerm, { delay: 150 });
    if (!testInfo.project.use.headless) await page.waitForTimeout(1000); // Wait so user can see it
    await expect(topNavigationBar.searchButton).toBeDisabled();
  });

  test('Verify search button is enabled when input has 3 characters', async ({ topNavigationBar, page }, testInfo) => {
    await topNavigationBar.searchInput.clear();
    // Use pressSequentially with a delay to visually simulate real user typing
    await topNavigationBar.searchInput.pressSequentially(portalData.searchBarData.validSearchTerm, { delay: 150 });
    if (!testInfo.project.use.headless) await page.waitForTimeout(1000); // Wait so user can see it
    await expect(topNavigationBar.searchButton).toBeEnabled();
  });

  test('Verify entering a query enables the search button and navigates to the search result page', async ({ topNavigationBar, searchResultPage, page }, testInfo) => {
    await topNavigationBar.searchInput.clear();
    await topNavigationBar.searchInput.pressSequentially(portalData.searchBarData.navigationSearchTerm, { delay: 150 });
    await expect(topNavigationBar.searchButton).toBeEnabled();
    
    if (!testInfo.project.use.headless) await page.waitForTimeout(1000); // Visual pause before click
    await topNavigationBar.searchButton.click();
    
    if (!testInfo.project.use.headless) await page.waitForTimeout(3000); // Visual pause before asserting new page
    
    // Assert navigation to search results page
    await expect(page).toHaveURL(/.*searchresult/);
    await expect(searchResultPage.searchResultIdentifier).toBeVisible({ timeout: 10000 });
  });

  test('Verify selecting Author from dropdown and searching navigates to search result page', async ({ topNavigationBar, searchResultPage, page }, testInfo) => {
    // Select Author from dropdown
    await topNavigationBar.searchDropdown.selectOption({ label: 'Author' });
    
    await topNavigationBar.searchInput.clear();
    await topNavigationBar.searchInput.pressSequentially(portalData.searchBarData.authorSearchTerm, { delay: 150 });
    await expect(topNavigationBar.searchButton).toBeEnabled();
    
    if (!testInfo.project.use.headless) await page.waitForTimeout(1000); // Visual pause before click
    await topNavigationBar.searchButton.click();
    
    if (!testInfo.project.use.headless) await page.waitForTimeout(3000); // Visual pause before asserting new page
    
    // Assert navigation to search results page
    await expect(page).toHaveURL(/.*searchresult/);
    await expect(searchResultPage.searchResultIdentifier).toBeVisible({ timeout: 10000 });
  });

  test('Verify auto suggestions are displayed after typing a query', async ({ topNavigationBar, page }, testInfo) => {
    await topNavigationBar.searchInput.clear();
    
    // Enter query in search box (using data-driven term as requested)
    await topNavigationBar.searchInput.pressSequentially(portalData.searchBarData.autoSuggestionTerm, { delay: 150 });
    
    // Wait for 2 seconds as requested
    await page.waitForTimeout(2000);
    
    // Check auto suggestions are displayed
    // The auto suggestions container is a div with class 'suggested-result' containing list items
    const autoSuggestionBox = page.locator('div.suggested-result').first();
    await expect(autoSuggestionBox).toBeVisible();
    
    // Verify there is at least one suggestion item
    const suggestionItemsCount = await autoSuggestionBox.locator('li.list-group-item').count();
    expect(suggestionItemsCount).toBeGreaterThan(0);
    
    if (!testInfo.project.use.headless) await page.waitForTimeout(1000); // Visual pause
  });
});
