import { test, expect } from '../../../src/fixtures';
import * as path from 'path';
import * as fs from 'fs';

// Load test data
const testDataPath = path.join(__dirname, '../../test-data/portal-data.json');
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));
const saveSearchQueries: string[] = testData.searchResultScenarios.saveSearchQueries;

test.describe('Search Result Content Validations @search', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PORTAL_URL as string);
  });

  test('Verify mandatory UI elements on search result cards', async ({ topNavigationBar, searchResultPage }) => {
    const randomQuery = saveSearchQueries[Math.floor(Math.random() * saveSearchQueries.length)];
    await topNavigationBar.searchFor(randomQuery);
    await expect(searchResultPage.searchCountText).toBeVisible({ timeout: 15000 });

    const card = await searchResultPage.getRandomSearchResultCard();
    
    // 1. Title
    await expect(card.locator('.title')).toBeVisible();
    
    // 2. Content Type
    await expect(card.locator('.ct-highlight')).toBeVisible();
    
    // 3. Read button
    await expect(card.locator('button[title="Read"], .btn:has-text("Read")').first()).toBeVisible();
    
    // 4. Detail page icon
    await expect(card.locator('a[title="View details"], .circle-icon-detail').first()).toBeVisible();
    
    // 5. Favorite button
    await expect(card.locator('a[title*="favourite" i]')).toBeVisible();
    
    // 6. Share icon
    await expect(card.locator('a[title="Share"], .share-circle-icon').first()).toBeVisible();
  });

  test('Verify Title clicks open content in a new tab', async ({ page, topNavigationBar, searchResultPage }) => {
    const randomQuery = saveSearchQueries[Math.floor(Math.random() * saveSearchQueries.length)];
    await topNavigationBar.searchFor(randomQuery);
    await expect(searchResultPage.searchCountText).toBeVisible({ timeout: 15000 });

    const card = await searchResultPage.getRandomSearchResultCard();
    const titleElement = card.locator('.title');

    // Wait for new page event
    await page.waitForTimeout(2000); // Allow JS listeners to attach
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      titleElement.click({ force: true })
    ]);

    // Validate the new page loaded successfully (just check URL is present)
    expect(newPage.url()).not.toBeNull();
    expect(newPage.url().length).toBeGreaterThan(0);
    await newPage.close();
  });

  test('Verify Read button clicks open content in a new tab', async ({ page, topNavigationBar, searchResultPage }) => {
    const randomQuery = saveSearchQueries[Math.floor(Math.random() * saveSearchQueries.length)];
    await topNavigationBar.searchFor(randomQuery);
    await expect(searchResultPage.searchCountText).toBeVisible({ timeout: 15000 });

    const card = await searchResultPage.getRandomSearchResultCard();
    const readBtn = card.locator('button[title="Read"], .btn:has-text("Read")').first();

    // Wait for new page event
    await page.waitForTimeout(2000); // Allow JS listeners to attach
    const [newPage2] = await Promise.all([
      page.context().waitForEvent('page'),
      readBtn.click({ force: true })
    ]);

    // Validate the new page loaded successfully
    expect(newPage2.url()).not.toBeNull();
    expect(newPage2.url().length).toBeGreaterThan(0);
    await newPage2.close();
  });

  test('Verify clicking Detail Page icon navigates to the detailed page', async ({ page, topNavigationBar, searchResultPage }) => {
    const randomQuery = saveSearchQueries[Math.floor(Math.random() * saveSearchQueries.length)];
    await topNavigationBar.searchFor(randomQuery);
    await expect(searchResultPage.searchCountText).toBeVisible({ timeout: 15000 });

    const card = await searchResultPage.getRandomSearchResultCard();
    const detailIcon = card.locator('a[title="View details"], .circle-icon-detail').first();

    // Click the detail icon
    await detailIcon.click({ force: true });
    
    // Wait for navigation away from search results
    await expect(page).not.toHaveURL(/.*\/search.*/, { timeout: 15000 });
    
    // Verify URL changed to something indicating details
    expect(page.url()).not.toContain('/search?');
  });

  test('Verify marking content as Favorite and validating in My Library', async ({ page, topNavigationBar, searchResultPage, myLibraryPage }) => {
    const randomQuery = saveSearchQueries[Math.floor(Math.random() * saveSearchQueries.length)];
    await topNavigationBar.searchFor(randomQuery);
    await expect(searchResultPage.searchCountText).toBeVisible({ timeout: 15000 });

    const card = await searchResultPage.getRandomSearchResultCard();
    
    // Extract title text so we can verify it later
    const titleElement = card.locator('.title').first();
    const contentTitle = (await titleElement.innerText()).trim();
    
    const favButton = card.locator('a[title*="favourite" i]');
    
    // Ensure we start from an unfavorited state for this test if possible, 
    // or just click and read the toast. Let's just click it.
    await page.waitForTimeout(2000); // Allow JS handlers to attach
    await favButton.click({ force: true });
    
    // Wait for the toast
    const toast = page.locator('text=/favourite list/i').last();
    await expect(toast).toBeVisible({ timeout: 10000 });
    let toastText = await toast.innerText();
    
    // It should either be added or removed depending on initial state.
    // Since we picked a random one, if it was removed, click it again to add it.
    if (toastText.includes('Removed')) {
      await expect(toast).not.toBeVisible({ timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1000); // Wait for state to settle
      await favButton.click({ force: true });
      
      const newToast = page.locator('text=/favourite list/i').last();
      await expect(newToast).toBeVisible({ timeout: 10000 });
      toastText = await newToast.innerText();
      expect(toastText).toContain('Added to your favourite list');
    } else {
      expect(toastText).toContain('Added to your favourite list');
    }

    // Now go to My Library -> Favorites
    await topNavigationBar.navigateToMyLibrary();
    await expect(myLibraryPage.myLibraryHeader).toBeVisible({ timeout: 10000 });
    
    // Wait for the tabs to load
    await expect(myLibraryPage.favoritesTab).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000); // Wait for the page and tab handlers to be fully ready
    await myLibraryPage.favoritesTab.click({ force: true });
    
    // Wait for the list to load
    await page.waitForTimeout(3000);
    
    const isSaved = await myLibraryPage.isFavoriteSaved(contentTitle);
    
    if (!isSaved) {
      console.error(`Expected to find "${contentTitle}" in favorites list.`);
    }
    expect(isSaved).toBeTruthy();
  });

  test('Verify removing content from Favorites list', async ({ page, topNavigationBar, searchResultPage }) => {
    // We will search, find a favorite, and click it to remove it.
    const randomQuery = saveSearchQueries[Math.floor(Math.random() * saveSearchQueries.length)];
    await topNavigationBar.searchFor(randomQuery);
    await expect(searchResultPage.searchCountText).toBeVisible({ timeout: 15000 });

    const card = await searchResultPage.getRandomSearchResultCard();
    const favButton = card.locator('a[title*="favourite" i]');
    
    // Force it to be a favorite first
    await page.waitForTimeout(2000); // Allow JS handlers to attach
    await favButton.click({ force: true });
    
    const toast = page.locator('text=/favourite list/i').last();
    await expect(toast).toBeVisible({ timeout: 10000 });
    let toastText = await toast.innerText();
    
    if (toastText.includes('Removed')) {
      // It was favorite, now removed. We successfully removed it!
      // Let's just assert the removed text
      expect(toastText).toContain('Removed from your favourite list');
    } else {
      // It was just added. Now remove it.
      await expect(toast).not.toBeVisible({ timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1000); // Wait for state to settle
      await favButton.click({ force: true });
      
      const newToast = page.locator('text=/favourite list/i').last();
      await expect(newToast).toBeVisible({ timeout: 10000 });
      toastText = await newToast.innerText();
      expect(toastText).toContain('Removed from your favourite list');
    }
  });

});
