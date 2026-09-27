import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

test.describe('Global Navigation - Language Translate Validations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PORTAL_URL as string);
  });

  test('Global Navigation - Google Translate selector is visible in top navigation bar', async ({ topNavigationBar }) => {
    await expect(topNavigationBar.languageSelector).toBeVisible();
  });

  test('Global Navigation - Clicking Google Translate dropdown displays list of available languages', async ({ topNavigationBar }) => {
    await expect(topNavigationBar.languageSelector.locator('option').first()).toBeAttached({ timeout: 10000 });
    await topNavigationBar.languageSelector.click();
    
    const optionsText = await topNavigationBar.languageSelector.locator('option').allInnerTexts();
    expect(optionsText.length).toBeGreaterThan(10);
    expect(optionsText.map(t => t.trim())).toContain(portalData.translationData.targetLanguageLabel);
  });

  test(`Global Navigation - Selecting ${portalData.translationData.targetLanguageLabel} applies translation and resetting restores ${portalData.translationData.defaultLanguageLabel}`, async ({ topNavigationBar, page }) => {
    // Ensure Google Translate widget options are loaded
    await expect(topNavigationBar.languageSelector.locator('option').first()).toBeAttached({ timeout: 15000 });

    // 1. Select Target Language from the dropdown
    await topNavigationBar.selectLanguage(portalData.translationData.targetLanguageValue);
    
    // Validate translation class is applied to HTML root
    await expect(page.locator('html')).toHaveClass(/translated-ltr/, { timeout: 15000 });

    // 2. Switch back to Default Language
    await topNavigationBar.resetLanguageToDefault(portalData.translationData.defaultLanguageLabel);
    
    // Validate the page lang attribute or removal of translated class
    await expect(page.locator('html')).toHaveAttribute('lang', /^en/i, { timeout: 15000 });
  });
});
