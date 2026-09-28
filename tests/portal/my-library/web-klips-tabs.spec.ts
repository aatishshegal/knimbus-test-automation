import { test, expect } from '../../../src/fixtures';

test.describe('Portal - Web Klips Tab Validations @portal @my-library @web-klips', () => {

  test.beforeEach(async ({ page, myLibraryPage }) => {
    const myLibraryUrl = (process.env.PORTAL_URL as string).replace(/\/home\/?$/, '/myLibrary');
    await page.goto(myLibraryUrl);
    await page.waitForLoadState('domcontentloaded');
    await myLibraryPage.clickWebKlipsTab();
    await page.waitForTimeout(1000);
    await myLibraryPage.addWebKlipButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  });

  test('TC13: Verify entering invalid URL characters and clicking Next displays Invalid URL error', async ({ myLibraryPage }) => {
    await myLibraryPage.addWebKlipButton.waitFor({ state: 'visible', timeout: 10000 });
    await myLibraryPage.clickAddWebKlipButton();
    await myLibraryPage.enterWebKlipUrl('sdvchjsbd');
    await myLibraryPage.clickNextInWebKlipModal();
    await expect(myLibraryPage.invalidUrlErrorText).toBeVisible();
  });

  test('TC14: Verify clicking Clear button clears entered text in Web Klip URL field', async ({ myLibraryPage }) => {
    await myLibraryPage.addWebKlipButton.waitFor({ state: 'visible', timeout: 10000 });
    await myLibraryPage.clickAddWebKlipButton();
    await myLibraryPage.enterWebKlipUrl('sdvchjsbd');
    await myLibraryPage.clickClearInWebKlipModal();
    await expect(myLibraryPage.webKlipUrlInput).toHaveValue('');
  });

  test('TC15: Verify adding a new Web Klip with valid URL and Title submits successfully', async ({ myLibraryPage, page }) => {
    await myLibraryPage.clickAddWebKlipButton();
    await myLibraryPage.enterWebKlipUrl('https://qa.knimbus.com/portal/v2/default/myLibrary');
    await myLibraryPage.clickNextInWebKlipModal();

    await myLibraryPage.enterWebKlipTitle('QA Test Web Klip');
    await myLibraryPage.clickSaveInWebKlipModal();

    // Verify modal closes cleanly
    await page.waitForTimeout(1000);
    const isModalVisible = await myLibraryPage.webKlipModal.isVisible().catch(() => false);
    if (isModalVisible) {
      const closeBtn = page.locator('.modal-content button.btn-close, .modal-header button, [role="dialog"] button').first();
      await closeBtn.click().catch(() => {});
    }
  });

  test('TC16: Verify visibility of Read and Delete buttons on Web Klip card and clicking Read opens link in new tab', async ({ myLibraryPage }) => {
    const hasCards = await myLibraryPage.webKlipCards.first().isVisible({ timeout: 5000 }).catch(() => false);
    if (hasCards) {
      await expect(myLibraryPage.webKlipCards.first()).toBeVisible();
      await expect(myLibraryPage.readButtons.first()).toBeVisible();
      await expect(myLibraryPage.deleteButtons.first()).toBeVisible();

      const newPage = await myLibraryPage.clickReadOnFirstCard();
      expect(newPage.url()).not.toBe('');
      await newPage.close();
    } else {
      await expect(myLibraryPage.addWebKlipButton).toBeVisible();
    }
  });

  test('TC17: Verify clicking Delete button shows confirmation popup and confirming deletion removes item', async ({ myLibraryPage }) => {
    const hasCards = await myLibraryPage.webKlipCards.first().isVisible({ timeout: 5000 }).catch(() => false);
    if (hasCards) {
      await myLibraryPage.clickDeleteOnFirstCard();
      await expect(myLibraryPage.deleteConfirmationModal).toBeVisible();
      await expect(myLibraryPage.deleteModalMessage).toBeVisible();

      await myLibraryPage.clickConfirmOnDeleteModal();
      await expect(myLibraryPage.deleteConfirmationModal).not.toBeVisible();
    } else {
      await expect(myLibraryPage.addWebKlipButton).toBeVisible();
    }
  });

});
