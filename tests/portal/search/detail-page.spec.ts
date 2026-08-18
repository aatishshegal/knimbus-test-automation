import { test, expect } from '../../../src/fixtures';
import * as fs from 'fs';
import * as path from 'path';

const testDataPath = path.join(__dirname, '../../test-data/portal-data.json');
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));
const searchQueries: string[] = testData.searchResultScenarios.saveSearchQueries;
const expectedTabs: string[] = testData.searchResultScenarios.globalSearch.expectedTabs;

test.describe('Search Detail Page Functionality', () => {
  
  // To avoid tests interfering with global shared settings if we mutated admin data,
  // we would use a specific user or setup. However, since we rely on caching
  // and are just doing search functionality (read-only from admin perspective),
  // we can utilize the standard cached session.
  
  test('Verify search result landing, tabs, detail page, favorite and share flow', async ({ page, topNavigationBar, searchResultPage, myLibraryPage, detailPage }) => {
    
    // Step 1: Navigate to portal and search using data-driven query
    // The session is already cached by global.setup.ts, so we are logged in.
    const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];
    await page.goto(process.env.PORTAL_URL as string);
    await topNavigationBar.searchFor(randomQuery);
    
    // Step 2: Verify landing on Search Result page
    await searchResultPage.waitForResultsToReload();
    await expect(searchResultPage.searchResultIdentifier).toBeVisible();
    
    // Step 3: Verify the presence of tabs
    // Note: Tab sequence/names can be dynamic, so we just check for their visibility if they exist
    // For robust E2E, we'll wait for the tab container
    await expect(searchResultPage.tabsContainer).toBeVisible();
    
    // Use framework data instead of hardcoded array, and encapsulate logic in POM
    await searchResultPage.verifyTabsPresent(expectedTabs);

    // Step 4: Ensure eCatalog tab is active (if it exists) and click detail page icon for the first record
    // In Knimbus, the default is usually the first tab (eCatalog).
    const firstResultCard = searchResultPage.getSearchResultCard(0);
    await expect(firstResultCard).toBeVisible();
    
    // Capture title
    const titleLocator = firstResultCard.locator('.title').first();
    const resultPageTitle = (await titleLocator.innerText()).trim();
    console.log(`[Validation] Extracted doc_title from Result Page: "${resultPageTitle}"`);
    
    // Click detail icon
    await firstResultCard.locator('a[title="View details"], .circle-icon-detail').first().click({ force: true });
    
    // Wait for the detail page to load
    await expect(detailPage.documentTitle).toBeVisible({ timeout: 15000 });
    
    // Step 5: Detail Page Validations
    
    // 5.1 Match the title
    const detailTitle = await detailPage.getDocumentTitle();
    console.log(`[Validation] Extracted doc_title from Detail Page: "${detailTitle}"`);
    expect(detailTitle.toLowerCase()).toEqual(resultPageTitle.toLowerCase());
    
    // 5.2 Validate Read button
    const isReadReady = await detailPage.isReadButtonReady();
    expect(isReadReady).toBeTruthy();
    console.log(`[Validation] Read button is present and clickable.`);
    
    // 5.3 Favourite Flow
    await detailPage.toggleFavorite();
    
    // Validate toast message
    await expect(detailPage.toastNotification).toBeVisible({ timeout: 10000 });
    const favToastText = await detailPage.toastNotification.innerText();
    console.log(`[Validation] Favourite Toast received: "${favToastText}"`);
    expect(favToastText.toLowerCase()).toContain('favourite'); // Validating presence of word favourite/saved
    
    // Navigate to My Library -> Favorites
    await topNavigationBar.navigateToMyLibrary();
    await myLibraryPage.favoritesTab.click();
    
    // Verify title exists in Favorites using pagination
    console.log(`[Validation] Searching for "${detailTitle}" in Favorites...`);
    const isSavedInFavorites = await myLibraryPage.isFavoriteSaved(detailTitle, 5); // Check up to 5 pages
    expect(isSavedInFavorites).toBeTruthy();
    console.log(`[Validation] Verified "${detailTitle}" is present in My Library Favorites.`);
    
    // 5.4 Unfavourite Flow
    // Navigate back to the detail page for the same item using the same query
    await topNavigationBar.searchFor(randomQuery);
    await searchResultPage.waitForResultsToReload();
    
    // Note: To ensure we unfavourite the exact same item, we find it again.
    // If pagination shifted, we could search for the exact title, but clicking first is consistent here.
    await searchResultPage.getSearchResultCard(0).locator('a[title="View details"], .circle-icon-detail').first().click({ force: true });
    await expect(detailPage.documentTitle).toBeVisible({ timeout: 15000 });
    
    await detailPage.toggleFavorite(); // Toggle again to remove
    
    // Validate removed toast message
    await expect(detailPage.toastNotification).toBeVisible({ timeout: 10000 });
    const removeToastText = await detailPage.toastNotification.innerText();
    console.log(`[Validation] Unfavourite Toast received: "${removeToastText}"`);
    expect(removeToastText.toLowerCase()).toContain('remove');
    
    // 5.5 Share Flow
    await expect(detailPage.shareIcon).toBeVisible();
    await detailPage.clickShare();
    
    // Validate share list/menu opens
    await expect(detailPage.shareMenuContainer).toBeVisible();
    console.log(`[Validation] Share menu successfully opened.`);
  });
});
