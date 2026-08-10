import { test, expect } from '../../../src/fixtures';

test.describe('Global Navigation - Notification Icon Validations @navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PORTAL_URL as string);
  });

  test('Verify notification icon is present and clickable', async ({ topNavigationBar, page }) => {
    // Assert notification icon is visible
    await expect(topNavigationBar.notificationIcon).toBeVisible();

    // Google Translate injects overlays that intercept pointer events. Hide it before clicking.
    await page.evaluate(() => {
      const gTranslate = document.getElementById('google_translate_element');
      if (gTranslate) gTranslate.style.display = 'none';
      const skiptranslate = document.querySelector('.skiptranslate');
      if (skiptranslate) (skiptranslate as HTMLElement).style.display = 'none';
    });

    // Click the notification icon wrapper normally
    await topNavigationBar.notificationIcon.click();
    
    // Wait for the popup container to become visible.
    const popup = page.locator('.dropdown-menu.show, .popover, [role="dialog"], [role="tooltip"], .notification-dropdown, [data-popper-placement]').first();
    await expect(popup).toBeVisible({ timeout: 10000 });
  });
});
