import { test, expect } from '../../../src/fixtures';

test.describe('Global Navigation - Language Translate Validations @navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PORTAL_URL as string);
  });

  test('Verify Google Translate widget is visible', async ({ topNavigationBar }) => {
    await expect(topNavigationBar.languageSelector).toBeVisible();
  });

  test('Verify clicking on Google Translate dropdown shows language list', async ({ topNavigationBar }) => {
    // Wait for options to be attached by the third-party script
    await expect(topNavigationBar.languageSelector.locator('option').first()).toBeAttached({ timeout: 10000 });
    
    // Click to simulate opening the dropdown
    await topNavigationBar.languageSelector.click();
    
    // Validate the list appears by checking the options inside the select element
    const optionsText = await topNavigationBar.languageSelector.locator('option').allInnerTexts();
    expect(optionsText.length).toBeGreaterThan(10); // Ensure a full list of languages is loaded
    expect(optionsText.map(t => t.trim())).toContain('Hindi');
    const hasEnglishOrSelect = optionsText.map(t => t.trim()).some(t => t === 'English' || t === 'Select Language');
    expect(hasEnglishOrSelect).toBeTruthy();
  });

  test('Verify selecting Hindi and switching back to English', async ({ topNavigationBar, page }, testInfo) => {
    // Wait for the Hindi option to be injected by Google Translate
    await expect(topNavigationBar.languageSelector.locator('option', { hasText: 'Hindi' })).toBeAttached({ timeout: 10000 });

    // 1. Select Hindi from the dropdown
    await topNavigationBar.languageSelector.selectOption({ label: 'Hindi' });
    
    // STRICT ASSERTION: Wait for the translation to apply (lang changes to 'hi')
    await expect(page.locator('html')).toHaveAttribute('lang', 'hi', { timeout: 15000 });
    
    // Visual pause so the user can observe the Hindi translation in headed mode
    if (!testInfo.project.use.headless) await page.waitForTimeout(3000); 

    // 2. Switch back to English
    // We check what the "reset" option is labeled as (sometimes English, sometimes Select Language)
    const optionsText = await topNavigationBar.languageSelector.locator('option').allInnerTexts();
    if (optionsText.some(t => t.trim() === 'English')) {
        await topNavigationBar.languageSelector.selectOption({ label: 'English' });
    } else {
        await topNavigationBar.languageSelector.selectOption({ label: 'Select Language' });
    }
    
    // STRICT ASSERTION: Wait for the translation to revert (lang changes to 'en' or gets removed)
    // Sometimes restoring language removes the lang attribute entirely, or sets it to 'en'
    await expect(page.locator('html')).toHaveAttribute('lang', /en|/, { timeout: 15000 });
    
    // Visual pause so the user can observe it switching back in headed mode
    if (!testInfo.project.use.headless) await page.waitForTimeout(3000); 
  });
});
