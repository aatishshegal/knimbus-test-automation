import { test, expect } from '../../../src/fixtures';

test.describe('Portal - Contact @profile @contact', () => {
  test.beforeEach(async ({ page, topNavigationBar }) => {
    await page.goto(process.env.PORTAL_URL as string);
    await topNavigationBar.openProfileMenu();
    await topNavigationBar.profileMenuProfileLink.click();
    await page.waitForURL(/.*profile/i, { timeout: 15000 }).catch(() => {});
  });

  test('Verify Contact tab navigation and content', async ({ profilePage, page }) => {
    await profilePage.clickTab('Contact');
    await expect(page.locator('h1, h2, h3, .heading').filter({ hasText: /contact/i }).first()).toBeVisible();
  });
});
