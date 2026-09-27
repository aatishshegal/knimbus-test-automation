import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

const searchQueries: string[] = portalData.searchResultScenarios.saveSearchQueries;
const expectedTabs: string[] = portalData.searchResultScenarios.globalSearch.expectedTabs;

test.describe('Search Detail Page Functionality', () => {
  
  test('Search Detail Page - Validates item title match, read accessibility, favorite persistence, and share menu visibility', async ({ page, topNavigationBar, searchResultPage, myLibraryPage, detailPage }) => {
    const query = searchQueries[0];
    await page.goto(process.env.PORTAL_URL as string);
    await topNavigationBar.searchFor(query);
    
    // Step 2: Verify landing on Search Result page
    await searchResultPage.waitForResultsToReload();
    await expect(searchResultPage.searchResultIdentifier).toBeVisible();
    
    // Step 3: Verify the presence of tabs
    await expect(searchResultPage.tabsContainer).toBeVisible();
    await searchResultPage.verifyTabsPresent(expectedTabs);

    // Step 4: Click detail page icon for the first record
    const firstResultCard = searchResultPage.getSearchResultCard(0);
    await expect(firstResultCard).toBeVisible();
    
    const titleLocator = firstResultCard.locator('.title').first();
    const resultPageTitle = (await titleLocator.innerText()).trim();
    
    await firstResultCard.locator('a[title="View details"], .circle-icon-detail').first().click({ force: true });
    
    // Wait for the detail page to load
    await expect(detailPage.documentTitle).toBeVisible({ timeout: 15000 });
    
    // Step 5: Detail Page Validations
    const detailTitle = await detailPage.getDocumentTitle();
    expect(detailTitle.toLowerCase()).toEqual(resultPageTitle.toLowerCase());
    
    // Validate Read button
    const isReadReady = await detailPage.isReadButtonReady();
    expect(isReadReady).toBeTruthy();
    
    // Favourite Flow via POM
    const favToastText = await detailPage.ensureFavorited();
    expect(favToastText.toLowerCase()).toContain('favourite');
    
    // Navigate to My Library -> Favorites
    await topNavigationBar.navigateToMyLibrary();
    await myLibraryPage.favoritesTab.click();
    
    const isSavedInFavorites = await myLibraryPage.isFavoriteSaved(detailTitle, 5);
    expect(isSavedInFavorites).toBeTruthy();
    
    // Unfavourite Flow
    await topNavigationBar.searchFor(query);
    await searchResultPage.waitForResultsToReload();
    
    await searchResultPage.getSearchResultCard(0).locator('a[title="View details"], .circle-icon-detail').first().click({ force: true });
    await expect(detailPage.documentTitle).toBeVisible({ timeout: 15000 });
    
    const removeToastText = await detailPage.ensureUnfavorited();
    expect(removeToastText.toLowerCase()).toContain('remove');
    
    // Share Flow
    await expect(detailPage.shareIcon).toBeVisible();
    await detailPage.clickShare();
    await expect(detailPage.shareMenuContainer).toBeVisible();
  });
});
