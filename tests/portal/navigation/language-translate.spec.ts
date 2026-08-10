import { test, expect } from '../../../src/fixtures';

test.describe('Global Navigation - Language Translate Validations @navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PORTAL_URL as string);
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
