import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

const saveSearchQueries: string[] = portalData.searchResultScenarios.saveSearchQueries;

test.describe('Search Results - Save Search Functionality', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PORTAL_URL as string);
  });

  test('Save Search - Save Search button is visible on search results page', async ({ topNavigationBar, searchResultPage }) => {
    const query = saveSearchQueries[0];
    await topNavigationBar.searchFor(query);
    
    // Ensure the results page loaded
    await expect(searchResultPage.searchResultIdentifier).toBeAttached();
    await expect(searchResultPage.searchCountText).toBeVisible({ timeout: 15000 });

    // Verify the "Save Search" button is present
    await expect(searchResultPage.saveSearchButton).toBeVisible();
  });

  test('Save Search - Saving search query records it in user My Library saved searches list', async ({ topNavigationBar, searchResultPage, myLibraryPage }) => {
    const query = saveSearchQueries[1] || saveSearchQueries[0];
    
    // 1. Perform search
    await topNavigationBar.searchFor(query);
    await expect(searchResultPage.searchCountText).toBeVisible({ timeout: 15000 });

    // 2. Click Save Search
    await expect(searchResultPage.saveSearchButton).toBeVisible();
    await searchResultPage.clickSaveSearch();

    // 3. Navigate to My Library
    await topNavigationBar.navigateToMyLibrary();
    await expect(myLibraryPage.myLibraryHeader).toBeAttached();

    // 4. Go to the Saved Search tab
    await expect(myLibraryPage.savedSearchTab).toBeVisible();
    await myLibraryPage.savedSearchTab.click({ force: true });

    // 5. Verify the query is present in the Saved Search list
    const isQuerySaved = await myLibraryPage.isSearchSaved(query);
    expect(isQuerySaved).toBeTruthy();
  });

  test('Save Search - Attempting to re-save an already saved query displays already saved toast notification', async ({ topNavigationBar, searchResultPage }) => {
    const query = saveSearchQueries[2] || saveSearchQueries[0];
    
    // 1. Perform search
    await topNavigationBar.searchFor(query);
    await expect(searchResultPage.searchCountText).toBeVisible({ timeout: 15000 });

    // 2. Click Save Search until already saved notification is verified via POM
    await expect(searchResultPage.saveSearchButton).toBeVisible();
    await searchResultPage.triggerDuplicateSaveSearch();
  });
});
