import { test, expect } from '../../../src/fixtures';

test.describe('Global Navigation - Notification Icon Validations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PORTAL_URL as string);
  });

  test('Notification Icon - Bell icon is visible in top navigation bar', async ({ topNavigationBar }) => {
    await expect(topNavigationBar.notificationIcon).toBeVisible();
  });

  test('Notification Icon - Clicking notification icon opens notifications pop-up container', async ({ topNavigationBar, page }) => {
    await page.evaluate(() => {
      const gTranslate = document.getElementById('google_translate_element');
      if (gTranslate) gTranslate.style.display = 'none';
      const skiptranslate = document.querySelector('.skiptranslate');
      if (skiptranslate) (skiptranslate as HTMLElement).style.display = 'none';
    });

    await topNavigationBar.notificationIcon.click();
    
    const popup = page.locator('.dropdown-menu.show, .popover, [role="dialog"], [role="tooltip"], .notification-dropdown, [data-popper-placement]').first();
    await expect(popup).toBeVisible({ timeout: 10000 });
  });
});
