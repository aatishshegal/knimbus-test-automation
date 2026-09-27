import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

const saveSearchQueries: string[] = portalData.searchResultScenarios.saveSearchQueries;

test.describe('Search Results - Content and Action Validations', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PORTAL_URL as string);
  });

  test('Search Result Content - Result cards display title, content type, read, detail, favorite, and share controls', async ({ topNavigationBar, searchResultPage }) => {
    const query = saveSearchQueries[0];
    await topNavigationBar.searchFor(query);
    await expect(searchResultPage.searchCountText).toBeVisible({ timeout: 15000 });

    const card = searchResultPage.getSearchResultCard(0);
    
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

  test('Search Result Content - Clicking card title opens full content in a new browser tab', async ({ page, topNavigationBar, searchResultPage }) => {
    const query = saveSearchQueries[1] || saveSearchQueries[0];
    await topNavigationBar.searchFor(query);
    await expect(searchResultPage.searchCountText).toBeVisible({ timeout: 15000 });

    const card = searchResultPage.getSearchResultCard(0);
    const titleElement = card.locator('.title');

    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      titleElement.click({ force: true })
    ]);

    expect(newPage.url()).not.toBeNull();
    expect(newPage.url().length).toBeGreaterThan(0);
    await newPage.close();
  });

  test('Search Result Content - Clicking Read button opens full content in a new browser tab', async ({ page, topNavigationBar, searchResultPage }) => {
    const query = saveSearchQueries[2] || saveSearchQueries[0];
    await topNavigationBar.searchFor(query);
    await expect(searchResultPage.searchCountText).toBeVisible({ timeout: 15000 });

    const card = searchResultPage.getSearchResultCard(0);
    const readBtn = card.locator('button[title="Read"], .btn:has-text("Read")').first();

    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      readBtn.click({ force: true })
    ]);

    expect(newPage.url()).not.toBeNull();
    expect(newPage.url().length).toBeGreaterThan(0);
    await newPage.close();
  });

  test('Search Result Content - Clicking Detail View icon navigates to item details page', async ({ page, topNavigationBar, searchResultPage }) => {
    const query = saveSearchQueries[3] || saveSearchQueries[0];
    await topNavigationBar.searchFor(query);
    await expect(searchResultPage.searchCountText).toBeVisible({ timeout: 15000 });

    const card = searchResultPage.getSearchResultCard(0);
    const detailIcon = card.locator('a[title="View details"], .circle-icon-detail').first();

    await detailIcon.click({ force: true });
    
    await expect(page).not.toHaveURL(/.*\/searchresult.*/, { timeout: 15000 });
  });

  test('Search Result Content - Adding item to favorites records it in My Library favorites list', async ({ topNavigationBar, searchResultPage, myLibraryPage }) => {
    const query = saveSearchQueries[0];
    await topNavigationBar.searchFor(query);
    await expect(searchResultPage.searchCountText).toBeVisible({ timeout: 15000 });

    const card = searchResultPage.getSearchResultCard(0);
    const contentTitle = await searchResultPage.toggleFavoriteAndEnsureAdded(card);

    // Navigate to My Library -> Favorites
    await topNavigationBar.navigateToMyLibrary();
    await expect(myLibraryPage.myLibraryHeader).toBeVisible({ timeout: 10000 });
    
    await expect(myLibraryPage.favoritesTab).toBeVisible({ timeout: 10000 });
    await myLibraryPage.favoritesTab.click({ force: true });
    
    const isSaved = await myLibraryPage.isFavoriteSaved(contentTitle);
    expect(isSaved).toBeTruthy();
  });

  test('Search Result Content - Removing item from favorites displays removal confirmation', async ({ topNavigationBar, searchResultPage }) => {
    const query = saveSearchQueries[1] || saveSearchQueries[0];
    await topNavigationBar.searchFor(query);
    await expect(searchResultPage.searchCountText).toBeVisible({ timeout: 15000 });

    const card = searchResultPage.getSearchResultCard(0);
    await searchResultPage.toggleFavoriteAndEnsureRemoved(card);
  });

});
