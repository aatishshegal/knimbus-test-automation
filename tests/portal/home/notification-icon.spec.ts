import { test, expect } from '../../../src/fixtures';

test.describe('Home Page - Notification Icon Validations', () => {
  test.beforeEach(async ({ page, portalLoginPage, homePage, homePageUser, context }) => {
    // Navigate to the base URL
    await page.goto(process.env.PORTAL_BASE_URL || 'https://sydneyuniversity.knimbus.com');
    
    // Check if the session is already active (via storageState)
    const isAlreadyLoggedIn = await homePage.homePageIdentifier.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (!isAlreadyLoggedIn) {
      console.log('Session expired or missing. Performing UI login...');
      await portalLoginPage.login(homePageUser.email, homePageUser.password);
      await expect(homePage.homePageIdentifier).toBeVisible();
      // Save the fresh session state so subsequent test cases can reuse it
      await context.storageState({ path: '.auth/user.json' });
    }
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
