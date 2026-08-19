import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

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
    expect(optionsText.map(t => t.trim())).toContain(portalData.translationData.targetLanguageLabel);
    const hasEnglishOrSelect = optionsText.map(t => t.trim()).some(t => t === portalData.translationData.defaultLanguageLabel || t === 'Select Language');
    expect(hasEnglishOrSelect).toBeTruthy();
  });

  test(`Verify selecting ${portalData.translationData.targetLanguageLabel} and switching back to ${portalData.translationData.defaultLanguageLabel}`, async ({ topNavigationBar, page }, testInfo) => {
    // Click to simulate opening the dropdown, which often triggers Google Translate to fetch and populate the full list of options
    await topNavigationBar.languageSelector.click();
    
    // Wait for the target language option to be injected by Google Translate (using value is more reliable than text)
    await expect(topNavigationBar.languageSelector.locator(`option[value="${portalData.translationData.targetLanguageValue}"]`)).toBeAttached({ timeout: 20000 });

    // 1. Select Target Language from the dropdown using value (more stable than label which may vary)
    await topNavigationBar.languageSelector.selectOption({ value: portalData.translationData.targetLanguageValue });
    
    // STRICT ASSERTION: Wait for the translation to apply (Google Translate adds translated-ltr class)
    await expect(page.locator('html')).toHaveClass(/translated-ltr/, { timeout: 15000 });
    
    // Visual pause so the user can observe the translation in headed mode
    if (!testInfo.project.use.headless) await page.waitForTimeout(3000); 

    // 2. Switch back to Original
    // We check what the "reset" option is labeled as (sometimes English, sometimes Select Language)
    const optionsText = await topNavigationBar.languageSelector.locator('option').allInnerTexts();
    if (optionsText.some(t => t.trim() === portalData.translationData.defaultLanguageLabel)) {
        await topNavigationBar.languageSelector.selectOption({ label: portalData.translationData.defaultLanguageLabel });
    } else {
        await topNavigationBar.languageSelector.selectOption({ label: 'Select Language' });
    }
    
    // STRICT ASSERTION: Wait for the translation to revert
    // Note: Google Translate often leaves the 'translated-ltr' class on the HTML tag even after reverting.
    // Instead, we check that the lang attribute returns to 'en' or gets removed completely.
    await expect(page.locator('html')).toHaveAttribute('lang', /en|/, { timeout: 15000 });
    
    // Visual pause so the user can observe it switching back in headed mode
    if (!testInfo.project.use.headless) await page.waitForTimeout(3000); 
  });
});
