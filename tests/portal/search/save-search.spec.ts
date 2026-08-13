import { test, expect } from '../../../src/fixtures';
import * as fs from 'fs';
import * as path from 'path';

// Load test data
const testDataPath = path.join(__dirname, '../../test-data/portal-data.json');
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));
const saveSearchQueries: string[] = testData.searchResultScenarios.saveSearchQueries;

test.describe('Save Search Functionality @search', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PORTAL_URL as string);
  });

  test('Verify "Save Search" button is present', async ({ topNavigationBar, searchResultPage }) => {
    const randomQuery = saveSearchQueries[Math.floor(Math.random() * saveSearchQueries.length)];
    await topNavigationBar.searchFor(randomQuery);
    
    // Ensure the results page loaded
    await expect(searchResultPage.searchResultIdentifier).toBeAttached();
    await expect(searchResultPage.searchCountText).toBeVisible({ timeout: 15000 });

    // Verify the "Save Search" button is present
    await expect(searchResultPage.saveSearchButton).toBeVisible();
  });

  test('Verify saving a search and its presence in My Library', async ({ topNavigationBar, searchResultPage, myLibraryPage }) => {
    const randomQuery = saveSearchQueries[Math.floor(Math.random() * saveSearchQueries.length)];
    
    // 1. Perform search
    await topNavigationBar.searchFor(randomQuery);
    await expect(searchResultPage.searchCountText).toBeVisible({ timeout: 15000 });

    // 2. Click Save Search
    await expect(searchResultPage.saveSearchButton).toBeVisible();
    await searchResultPage.saveSearchButton.click();

    // Wait for the backend API to process the save request before navigating away
    await searchResultPage.page.waitForTimeout(3000);

    // 3. Navigate to My Library
    await topNavigationBar.navigateToMyLibrary();
    await expect(myLibraryPage.myLibraryHeader).toBeAttached();

    // 4. Go to the Saved Search tab
    await expect(myLibraryPage.savedSearchTab).toBeVisible();
    await myLibraryPage.page.waitForTimeout(2000); // Wait for the page and tab handlers to be fully ready
    await myLibraryPage.savedSearchTab.click({ force: true });
    
    // Wait for network to settle so saved searches are fully loaded
    await myLibraryPage.page.waitForTimeout(3000);

    // 5. Verify the query is present in the Saved Search list (checking across pages if needed)
    const isQuerySaved = await myLibraryPage.isSearchSaved(randomQuery);
    
    if (!isQuerySaved) {
      console.error(`Expected to find "${randomQuery}" in saved searches, even after checking pagination.`);
    }
    expect(isQuerySaved).toBeTruthy();
  });

  test('Verify toast message when re-saving an already saved search', async ({ page, topNavigationBar, searchResultPage }) => {
    const randomQuery = saveSearchQueries[Math.floor(Math.random() * saveSearchQueries.length)];
    
    // 1. Perform search
    await topNavigationBar.searchFor(randomQuery);
    await expect(searchResultPage.searchCountText).toBeVisible({ timeout: 15000 });

    // 2. Click Save Search
    await expect(searchResultPage.saveSearchButton).toBeVisible();
    await page.waitForTimeout(2000); // Wait for Javascript listeners to fully attach
    await searchResultPage.saveSearchButton.click();
    
    // Wait for a toast
    const toast = page.locator('text=/search has been saved|already saved/i').last();
    await expect(toast).toBeVisible({ timeout: 10000 });
    let toastText = await toast.innerText();
    
    // 3. If it was a fresh save, we need to save it AGAIN to verify the "already saved" logic.
    if (!toastText.toLowerCase().includes('already')) {
      // Wait for it to disappear
      await expect(toast).not.toBeVisible({ timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(1000);
      await searchResultPage.saveSearchButton.click();
      
      const newToast = page.locator('text=/search has been saved|already saved/i').last();
      await expect(newToast).toBeVisible({ timeout: 10000 });
      toastText = await newToast.innerText();
    }
    
    // 4. Verify the Toast Popup shows it's already saved
    const isAlreadySavedMessage = toastText.toLowerCase().includes('already');
    
    if (!isAlreadySavedMessage) {
      console.error(`Expected toast to indicate already saved, but got: "${toastText}"`);
    }
    expect(isAlreadySavedMessage).toBeTruthy();
  });
});
