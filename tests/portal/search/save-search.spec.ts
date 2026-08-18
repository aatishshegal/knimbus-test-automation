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

    // 2. Click Save Search repeatedly until the "already saved" toast appears.
    // This perfectly handles both a fresh save (needs 2 clicks) and an existing save (needs 1 click).
    await expect(searchResultPage.saveSearchButton).toBeVisible();
    
    // Ensure no lingering toasts from previous tests are on screen before we start
    await expect(page.getByRole('alert').first()).toBeHidden({ timeout: 5000 }).catch(() => {});
    
    await expect(async () => {
      // Click the save button
      await searchResultPage.saveSearchButton.click();
      
      const toast = page.getByRole('alert').first();
      await expect(toast).toBeVisible({ timeout: 3000 });
      
      const text = await toast.innerText();
      console.log(`[DEBUG] Toast text received: "${text}"`);
      
      if (!text.toLowerCase().includes('already')) {
        // It was a fresh save. We MUST wait for this success toast to disappear
        // before we allow the block to retry, otherwise the next iteration will read the same old toast!
        await expect(toast).toBeHidden({ timeout: 10000 });
        throw new Error(`Expected toast to contain 'already', but got: ${text}`);
      }
      
      // If it contains 'already', the test passes!
      expect(text.toLowerCase()).toContain('already');
    }).toPass({ timeout: 25000 });
  });
});
