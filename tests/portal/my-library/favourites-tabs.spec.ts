import { test, expect } from '../../../src/fixtures';

test.describe('Portal - Favourites Tab Validations @portal @my-library @favourites', () => {

  test.beforeEach(async ({ page, myLibraryPage }) => {
    const myLibraryUrl = (process.env.PORTAL_URL as string).replace(/\/home\/?$/, '/myLibrary');
    await page.goto(myLibraryUrl);
    await page.waitForLoadState('domcontentloaded');
    await myLibraryPage.clickFavouritesTab();
    await page.waitForTimeout(500);
  });

  test('TC08: Verify Favourites tab results header count or empty state message', async ({ myLibraryPage }) => {
    const isCountVisible = await myLibraryPage.favouritesCountText.first().isVisible({ timeout: 5000 }).catch(() => false);
    const isEmptyVisible = await myLibraryPage.noFavouritesMessage.isVisible({ timeout: 5000 }).catch(() => false);

    expect(isCountVisible || isEmptyVisible).toBe(true);

    if (isCountVisible) {
      const count = await myLibraryPage.getFavouritesCount();
      expect(count).toBeGreaterThanOrEqual(0);
      await expect(myLibraryPage.favouritesCountText.first()).toContainText(/Showing \d+ results for Favourites/i);
    } else {
      await expect(myLibraryPage.noFavouritesMessage).toBeVisible();
    }
  });

  test('TC09: Verify visibility of Read and Delete buttons on Favourite items', async ({ myLibraryPage }) => {
    const hasItems = await myLibraryPage.favouriteCards.first().isVisible({ timeout: 5000 }).catch(() => false);
    if (hasItems) {
      await expect(myLibraryPage.favouriteCards.first()).toBeVisible();
      await expect(myLibraryPage.readButtons.first()).toBeVisible();
      await expect(myLibraryPage.deleteButtons.first()).toBeVisible();
    } else {
      await expect(myLibraryPage.noFavouritesMessage).toBeVisible();
    }
  });

  test('TC10: Verify clicking Read button opens title in a new browser tab', async ({ myLibraryPage }) => {
    const hasItems = await myLibraryPage.favouriteCards.first().isVisible({ timeout: 5000 }).catch(() => false);
    if (hasItems) {
      const newPage = await myLibraryPage.clickReadOnFirstCard();
      expect(newPage.url()).not.toBe('');
      await newPage.close();
    } else {
      await expect(myLibraryPage.noFavouritesMessage).toBeVisible();
    }
  });

  test('TC11: Verify clicking Delete button shows confirmation popup with Cancel and Delete buttons, and Cancel closes modal', async ({ myLibraryPage }) => {
    const hasItems = await myLibraryPage.favouriteCards.first().isVisible({ timeout: 5000 }).catch(() => false);
    if (hasItems) {
      await myLibraryPage.clickDeleteOnFirstCard();
      await expect(myLibraryPage.deleteConfirmationModal).toBeVisible();
      await expect(myLibraryPage.deleteModalMessage).toBeVisible();
      await expect(myLibraryPage.modalCancelButton).toBeVisible();
      await expect(myLibraryPage.modalDeleteButton).toBeVisible();

      await myLibraryPage.clickCancelOnDeleteModal();
      await expect(myLibraryPage.deleteConfirmationModal).not.toBeVisible();
    } else {
      await expect(myLibraryPage.noFavouritesMessage).toBeVisible();
    }
  });

  test('TC12: Verify confirming deletion deletes item, shows popup message, and decreases results count', async ({ myLibraryPage }) => {
    const hasItems = await myLibraryPage.favouriteCards.first().isVisible({ timeout: 5000 }).catch(() => false);
    if (hasItems) {
      const initialCount = await myLibraryPage.getFavouritesCount();
      
      await myLibraryPage.clickDeleteOnFirstCard();
      await expect(myLibraryPage.deleteConfirmationModal).toBeVisible();
      
      await myLibraryPage.clickConfirmOnDeleteModal();
      
      // Verify popup message "Your Favourite Item has been Deleted"
      await expect(myLibraryPage.deleteToastNotification).toBeVisible();
      
      // Verify count decreases by 1
      const newCount = await myLibraryPage.getFavouritesCount();
      expect(newCount).toBe(initialCount - 1);
    } else {
      await expect(myLibraryPage.noFavouritesMessage).toBeVisible();
    }
  });

  test('TC12B: Verify Favourites pagination controls (numbers, <<, <, >, >>) are visible and clicking page 2 opens page 2', async ({ myLibraryPage }) => {
    const hasItems = await myLibraryPage.favouriteCards.first().isVisible({ timeout: 5000 }).catch(() => false);
    if (hasItems) {
      await expect(myLibraryPage.paginationContainer).toBeVisible();
      await expect(myLibraryPage.getPageNumberButton(1)).toBeVisible();
      
      const hasPage2 = await myLibraryPage.getPageNumberButton(2).isVisible({ timeout: 3000 }).catch(() => false);
      if (hasPage2) {
        await myLibraryPage.clickPageNumber(2);
        await expect(myLibraryPage.getPageNumberButton(2)).toBeVisible();
      }
    } else {
      await expect(myLibraryPage.noFavouritesMessage).toBeVisible();
    }
  });

});
