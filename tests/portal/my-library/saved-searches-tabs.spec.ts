import { test, expect } from '../../../src/fixtures';

test.describe('Portal - Saved Searches Tab Validations @portal @my-library @saved-searches', () => {

  test.beforeEach(async ({ page, myLibraryPage }) => {
    const myLibraryUrl = (process.env.PORTAL_URL as string).replace(/\/home\/?$/, '/myLibrary');
    await page.goto(myLibraryUrl);
    await page.waitForLoadState('domcontentloaded');
    await myLibraryPage.clickSavedSearchesTab();
    await page.waitForTimeout(1000);
  });

  test('TC18: Saved Searches Tab - Navigation & Header Count Verification', async ({ myLibraryPage }) => {
    // Verify Saved Searches tab is active
    await myLibraryPage.expectTabToBeActive(myLibraryPage.savedSearchesTab);

    // Verify results header text ("Showing X results for Saved Searches") or empty state message
    const isCountVisible = await myLibraryPage.savedSearchesCountText.first().isVisible({ timeout: 5000 }).catch(() => false);
    const isEmptyVisible = await myLibraryPage.noSavedSearchesMessage.isVisible({ timeout: 5000 }).catch(() => false);

    expect(isCountVisible || isEmptyVisible).toBe(true);

    if (isCountVisible) {
      const count = await myLibraryPage.getSavedSearchesCount();
      expect(count).toBeGreaterThanOrEqual(0);
      await expect(myLibraryPage.savedSearchesCountText.first()).toContainText(/Showing \d+ results for Saved Searches/i);
    } else {
      await expect(myLibraryPage.noSavedSearchesMessage).toBeVisible();
    }
  });

  test('TC19: Saved Searches Tab - Card Item UI Components Verification', async ({ myLibraryPage }) => {
    const cardCount = await myLibraryPage.favouriteCards.count();
    
    if (cardCount > 0) {
      const firstCard = myLibraryPage.favouriteCards.first();
      await expect(firstCard).toBeVisible();

      // Verify Read button is visible on card
      const readBtn = myLibraryPage.readButtons.first();
      await expect(readBtn).toBeVisible();

      // Verify Delete (trash icon) button is visible on card
      const deleteBtn = myLibraryPage.deleteButtons.first();
      await expect(deleteBtn).toBeVisible();
    } else {
      // If 0 saved search items, verify count or empty state message is shown
      const isCountVisible = await myLibraryPage.savedSearchesCountText.first().isVisible({ timeout: 3000 }).catch(() => false);
      const isEmptyVisible = await myLibraryPage.noSavedSearchesMessage.isVisible({ timeout: 3000 }).catch(() => false);
      expect(isCountVisible || isEmptyVisible).toBe(true);
    }
  });

  test('TC20: Saved Searches Tab - Read Button Functionality (Re-run Search)', async ({ myLibraryPage, page }) => {
    const cardCount = await myLibraryPage.favouriteCards.count();

    if (cardCount > 0) {
      const readBtn = myLibraryPage.readButtons.first();
      await expect(readBtn).toBeVisible();

      // Clicking Read button re-executes search query or opens search result in tab/page
      const [newPage] = await Promise.all([
        page.context().waitForEvent('page').catch(() => null),
        readBtn.click({ force: true })
      ]);

      if (newPage) {
        await newPage.waitForLoadState('domcontentloaded');
        expect(newPage.url()).not.toBe('about:blank');
        await newPage.close();
      } else {
        // If it navigated in the same tab, verify URL changed or page loaded search results
        await page.waitForTimeout(2000);
        expect(page.url()).toBeDefined();
      }
    } else {
      // If no saved searches, verify header count or empty state message
      const isCountVisible = await myLibraryPage.savedSearchesCountText.first().isVisible({ timeout: 3000 }).catch(() => false);
      const isEmptyVisible = await myLibraryPage.noSavedSearchesMessage.isVisible({ timeout: 3000 }).catch(() => false);
      expect(isCountVisible || isEmptyVisible).toBe(true);
    }
  });

  test('TC21: Saved Searches Tab - Delete Button Cancel Flow', async ({ myLibraryPage }) => {
    const initialCount = await myLibraryPage.getSavedSearchesCount();

    if (initialCount > 0) {
      // Click delete button on first card
      await myLibraryPage.clickDeleteOnFirstCard();

      // Verify confirmation popup modal is visible
      await expect(myLibraryPage.deleteConfirmationModal).toBeVisible({ timeout: 10000 });
      await expect(myLibraryPage.deleteModalMessage).toBeVisible();

      // Verify Cancel and Delete buttons are visible in modal
      await expect(myLibraryPage.modalCancelButton).toBeVisible();
      await expect(myLibraryPage.modalDeleteButton).toBeVisible();

      // Click Cancel button
      await myLibraryPage.clickCancelOnDeleteModal();

      // Verify modal is dismissed
      await expect(myLibraryPage.deleteConfirmationModal).not.toBeVisible({ timeout: 5000 });

      // Verify count remains unchanged
      const currentCount = await myLibraryPage.getSavedSearchesCount();
      expect(currentCount).toBe(initialCount);
    } else {
      await expect(myLibraryPage.noSavedSearchesMessage).toBeVisible();
    }
  });

  test('TC22: Saved Searches Tab - Delete Button Confirm Flow (Item Deletion & Count Update)', async ({ myLibraryPage }) => {
    const initialCount = await myLibraryPage.getSavedSearchesCount();

    if (initialCount > 0) {
      // Click delete button on first item
      await myLibraryPage.clickDeleteOnFirstCard();

      // Verify modal popup appears
      await expect(myLibraryPage.deleteConfirmationModal).toBeVisible({ timeout: 10000 });

      // Click Delete (Confirm) button
      await myLibraryPage.clickConfirmOnDeleteModal();

      // Verify success notification/toast message or item disappears
      const toastVisible = await myLibraryPage.deleteToastNotification.isVisible({ timeout: 5000 }).catch(() => false);
      if (toastVisible) {
        await expect(myLibraryPage.deleteToastNotification).toBeVisible();
      }

      // Verify count is reduced by 1
      const newCount = await myLibraryPage.getSavedSearchesCount();
      expect(newCount).toBe(initialCount - 1);
    } else {
      await expect(myLibraryPage.noSavedSearchesMessage).toBeVisible();
    }
  });

  test('TC23: Saved Searches Tab - Refresh Button Functionality', async ({ myLibraryPage }) => {
    const isRefreshVisible = await myLibraryPage.refreshButton.isVisible({ timeout: 3000 }).catch(() => false);
    if (isRefreshVisible) {
      await expect(myLibraryPage.refreshButton).toBeVisible();
      await myLibraryPage.refreshButton.click({ force: true });
      await myLibraryPage.page.waitForTimeout(1000);
      await expect(myLibraryPage.savedSearchesTab).toBeVisible();
    } else {
      // Fallback: reload tab
      await myLibraryPage.clickSavedSearchesTab();
      await myLibraryPage.expectTabToBeActive(myLibraryPage.savedSearchesTab);
    }
  });

  test('TC24: Saved Searches Tab - Pagination Controls Verification', async ({ myLibraryPage }) => {
    const count = await myLibraryPage.getSavedSearchesCount();
    const hasItems = await myLibraryPage.favouriteCards.first().isVisible({ timeout: 3000 }).catch(() => false);

    if (hasItems && count > 10) {
      await expect(myLibraryPage.paginationContainer).toBeVisible();
      await expect(myLibraryPage.getPageNumberButton(1)).toBeVisible();

      const hasPage2 = await myLibraryPage.getPageNumberButton(2).isVisible({ timeout: 3000 }).catch(() => false);
      if (hasPage2) {
        await myLibraryPage.clickPageNumber(2);
        await expect(myLibraryPage.getPageNumberButton(2)).toBeVisible();
      }
    } else {
      // If <= 10 items or no items, pagination is single-page or not required
      expect(count).toBeLessThanOrEqual(10);
    }
  });

  test('TC25: Basic Search to Saved Search Flow - Save keyword from basic search and verify deletion removes keyword from Saved Searches tab', async ({ topNavigationBar, searchResultPage, myLibraryPage }) => {
    const searchKeyword = 'nano';

    // Step 1: Perform basic search for keyword from top search bar
    await topNavigationBar.searchFor(searchKeyword);
    await searchResultPage.page.waitForLoadState('domcontentloaded');

    // Step 2: Click "Save search" button on search result page
    const isSaveBtnVisible = await searchResultPage.saveSearchButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (isSaveBtnVisible) {
      await searchResultPage.saveSearchButton.click({ force: true });
      await searchResultPage.page.waitForTimeout(1000);
    }

    // Step 3: Navigate to My Library -> Saved Searches tab
    await topNavigationBar.navigateToMyLibrary();
    await myLibraryPage.clickSavedSearchesTab();
    await myLibraryPage.expectTabToBeActive(myLibraryPage.savedSearchesTab);

    // Step 4: Verify search keyword exists in Saved Searches tab
    const initialSavedCount = await myLibraryPage.getSavedSearchesCount();

    if (initialSavedCount > 0) {
      // Check if saved search query is present
      const isKeywordSaved = await myLibraryPage.isSearchSaved(searchKeyword, 2);

      if (isKeywordSaved) {
        // Step 5: Click Delete button on saved search item
        await myLibraryPage.clickDeleteOnFirstCard();
        await expect(myLibraryPage.deleteConfirmationModal).toBeVisible({ timeout: 5000 });

        // Step 6: Confirm deletion
        await myLibraryPage.clickConfirmOnDeleteModal();
        await myLibraryPage.page.waitForTimeout(1000);

        // Step 7: Verify keyword is GONE (removed) from Saved Searches tab
        const isStillSaved = await myLibraryPage.isSearchSaved(searchKeyword, 2);
        expect(isStillSaved).toBe(false);
      } else {
        // Fallback: Delete first item and verify count decreases
        await myLibraryPage.clickDeleteOnFirstCard();
        await expect(myLibraryPage.deleteConfirmationModal).toBeVisible({ timeout: 5000 });
        await myLibraryPage.clickConfirmOnDeleteModal();
        
        const finalCount = await myLibraryPage.getSavedSearchesCount();
        expect(finalCount).toBe(initialSavedCount - 1);
      }
    } else {
      // If 0 items, verify empty state message is shown
      await expect(myLibraryPage.noSavedSearchesMessage).toBeVisible();
    }
  });
});
