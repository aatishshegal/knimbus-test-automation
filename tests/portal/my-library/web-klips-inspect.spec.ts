import { test } from '../../../src/fixtures';

test('Inspect Web Klips DOM', async ({ page, myLibraryPage }) => {
  const myLibraryUrl = (process.env.PORTAL_URL as string).replace(/\/home\/?$/, '/myLibrary');
  await page.goto(myLibraryUrl);
  await page.waitForLoadState('domcontentloaded');

  console.log('Clicking Web Klips tab...');
  await myLibraryPage.clickWebKlipsTab();
  await page.waitForTimeout(2000);

  // Inspect "+ Add a web klip" button
  const addBtn = page.locator('button, a').filter({ hasText: /Add a web klip/i }).first();
  console.log('Is + Add a web klip button visible?', await addBtn.isVisible());

  if (await addBtn.isVisible().catch(() => false)) {
    await addBtn.click();
    await page.waitForTimeout(2000);

    const modalHtml = await page.evaluate(() => {
      const modal = document.querySelector('.modal-dialog, .modal-content, [role="dialog"], .fade.show');
      return modal ? modal.outerHTML : 'No modal found';
    });
    console.log('--- Add Web Klip Modal HTML ---');
    console.log(modalHtml);
  }
});
