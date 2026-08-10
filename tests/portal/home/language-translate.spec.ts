import { test, expect } from '../../../src/fixtures';

test.describe('Home Page - Language Translate Validations', () => {
  test.beforeEach(async ({ page, portalLoginPage, homePage, homePageUser, context }) => {
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

  test('Verify Google Translate widget is visible', async ({ topNavigationBar }) => {
    await expect(topNavigationBar.languageSelector).toBeVisible();
  });

  test('Verify Google Translate widget contains default language options', async ({ topNavigationBar }) => {
    // Assert that we have language options available. We wait for a known option (French) to attach.
    await expect(topNavigationBar.languageSelector.locator('option', { hasText: 'French' })).toBeAttached({ timeout: 10000 });
    
    const optionsText = await topNavigationBar.languageSelector.locator('option').allInnerTexts();
    expect(optionsText.map(t => t.trim())).toContain('Arabic');
    expect(optionsText.map(t => t.trim())).toContain('French');
  });
});
