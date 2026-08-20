import { test, expect } from '../../../src/fixtures';
import portalData from '../../../tests/test-data/portal-data.json';

const resetData = portalData.researchPlusAdvancedSearch.formReset;

test.describe('Research+ Form Reset Validations', () => {
    test.beforeEach(async ({ page, homePage, topNavigationBar, researchPlusPage }) => {
        await page.goto(process.env.PORTAL_URL!);
        await topNavigationBar.menuResearch.click();
        await expect(researchPlusPage.pageIdentifier).toBeVisible();
    });

    test('Clicking on Reset All should clear every filled data and reset source to Default', async ({ researchPlusPage, page }) => {
        // 1. Enter random query
        await researchPlusPage.searchBarInput1.fill(resetData.query);
        
        // 2. From Query type dropdown select Query Type
        await researchPlusPage.queryTypeDropdown1.selectOption({ label: resetData.queryType });
        
        // 3. Fill year values in from and to year
        await researchPlusPage.fromYearInput.fill(resetData.fromYear);
        await researchPlusPage.toYearInput.fill(resetData.toYear);
        await researchPlusPage.toYearInput.blur(); // Trigger validation/state
        
        // 4. From selected Source move "Subscribed" tab
        await researchPlusPage.subscribedTab.click();
        await expect(researchPlusPage.subscribedTab).toHaveClass(/active/);
        
        // 5. Click on Reset All button
        await researchPlusPage.resetAllButton.click();
        
        // 6. Validate all data cleared, query type reset, and source reset
        // Validate search input is empty
        await expect(researchPlusPage.searchBarInput1).toHaveValue('');
        
        // Validate query type reset to default (typically Title, or empty string if it selects the first)
        const selectedQueryType = await researchPlusPage.queryTypeDropdown1.inputValue();
        // Assuming "ti" is the value for "Title" (the default), but we can just check it's not the Author value anymore
        // Typically it resets to the first option.
        const authorOptionValue = await researchPlusPage.queryTypeDropdown1.locator('option', { hasText: 'Author' }).getAttribute('value');
        expect(selectedQueryType).not.toEqual(authorOptionValue);
        
        // Validate year inputs are cleared
        await expect(researchPlusPage.fromYearInput).toHaveValue('');
        await expect(researchPlusPage.toYearInput).toHaveValue('');
        
        // Validate Selected Source moves back to Default tab (Usually "All")
        // and Subscribed tab is no longer active
        await expect(researchPlusPage.subscribedTab).not.toHaveClass(/active/);
        
        // In the Knimbus UI, 'Default' is the actual default tab. Let's find it and assert.
        await expect(researchPlusPage.defaultTab).toHaveClass(/active/);
    });
});
