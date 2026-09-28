import { test, expect } from '../../../src/fixtures';

test.describe('Portal - My Library Main Navigation & Tab Structure @portal @my-library', () => {

  test.beforeEach(async ({ page }) => {
    const myLibraryUrl = (process.env.PORTAL_URL as string).replace(/\/home\/?$/, '/myLibrary');
    await page.goto(myLibraryUrl);
    await page.waitForLoadState('domcontentloaded');
  });

  test('TC01: Verify navigation to My Library page and visibility of Header', async ({ myLibraryPage, page }) => {
    await expect(page).toHaveURL(/.*myLibrary/);
    await expect(myLibraryPage.myLibraryHeader).toBeVisible();
  });

  test('TC02: Verify visibility of all 4 My Library tabs (Favourites, Web Klips, Saved Searches, ORCID)', async ({ myLibraryPage }) => {
    await expect(myLibraryPage.favouritesTab).toBeVisible();
    await expect(myLibraryPage.webKlipsTab).toBeVisible();
    await expect(myLibraryPage.savedSearchesTab).toBeVisible();
    await expect(myLibraryPage.orcidTab).toBeVisible();
  });

  test('TC03: Verify Favourites tab is selected/active by default', async ({ myLibraryPage }) => {
    await myLibraryPage.expectTabToBeActive(myLibraryPage.favouritesTab);
  });

  test('TC04: Verify Web Klips tab is clickable and becomes active when clicked', async ({ myLibraryPage }) => {
    await myLibraryPage.clickWebKlipsTab();
    await myLibraryPage.expectTabToBeActive(myLibraryPage.webKlipsTab);
  });

  test('TC05: Verify Saved Searches tab is clickable and becomes active when clicked', async ({ myLibraryPage }) => {
    await myLibraryPage.clickSavedSearchesTab();
    await myLibraryPage.expectTabToBeActive(myLibraryPage.savedSearchesTab);
  });

  test('TC06: Verify ORCID tab is clickable and becomes active when clicked', async ({ myLibraryPage }) => {
    await myLibraryPage.clickOrcidTab();
    await myLibraryPage.expectTabToBeActive(myLibraryPage.orcidTab);
  });

  test('TC07: Verify switching between all 4 tabs sequentially', async ({ myLibraryPage }) => {
    // 1. Click Web Klips
    await myLibraryPage.clickWebKlipsTab();
    await myLibraryPage.expectTabToBeActive(myLibraryPage.webKlipsTab);

    // 2. Click Saved Searches
    await myLibraryPage.clickSavedSearchesTab();
    await myLibraryPage.expectTabToBeActive(myLibraryPage.savedSearchesTab);

    // 3. Click ORCID
    await myLibraryPage.clickOrcidTab();
    await myLibraryPage.expectTabToBeActive(myLibraryPage.orcidTab);

    // 4. Return to Favourites
    await myLibraryPage.clickFavouritesTab();
    await myLibraryPage.expectTabToBeActive(myLibraryPage.favouritesTab);
  });

});
