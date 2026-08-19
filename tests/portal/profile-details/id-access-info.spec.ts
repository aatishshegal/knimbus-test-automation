import { test, expect } from '../../../src/fixtures';

test.describe('Portal - Id & Access Info @profile @id-access', () => {
  test.beforeEach(async ({ page, topNavigationBar }) => {
    await page.goto(process.env.PORTAL_URL as string);
    await topNavigationBar.openProfileMenu();
    await topNavigationBar.profileMenuProfileLink.click();
    await page.waitForURL(/.*profile/i, { timeout: 15000 }).catch(() => {});
  });

  test('Verify Id & Access Info tab navigation and content', async ({ profilePage, page }) => {
    await profilePage.clickTab('Id & Access Info');
    await expect(page.locator('h1, h2, h3, .heading').filter({ hasText: /id & access info/i }).first()).toBeVisible();
  });
});
