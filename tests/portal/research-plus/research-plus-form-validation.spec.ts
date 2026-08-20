import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

const advancedSearchData = portalData.researchPlusAdvancedSearch;

test.describe('Research+ Advanced Search', () => {

    test.beforeEach(async ({ page, homePage, topNavigationBar, researchPlusPage }) => {
        await page.goto(process.env.PORTAL_URL!);
        await expect(homePage.homePageIdentifier).toBeVisible();
        await topNavigationBar.menuResearch.click();
        await expect(researchPlusPage.pageIdentifier).toBeVisible();
    });

    // Case: Verify Query Type default selection should be Title
    test('Verify default Query Type selection is Title', async ({ researchPlusPage }) => {
        const selectedOption = await researchPlusPage.queryTypeDropdown1.evaluate((el: HTMLSelectElement) => el.options[el.selectedIndex].text);
        expect(selectedOption.trim()).toBe(portalData.researchPlusAdvancedSearch.defaultQueryType);
    });

    // Case: Verify Search box Placeholder text
    test('Verify search box placeholder text is correct', async ({ researchPlusPage, page }) => {
        // According to our DOM dump, the label says "Enter search query".
        const labelText = await page.locator('label').filter({ hasText: portalData.researchPlusAdvancedSearch.searchPlaceholder }).first().innerText();
        expect(labelText.trim()).toBe(portalData.researchPlusAdvancedSearch.searchPlaceholder);
    });

    // Case: Verify clicking outside search box shows validation error
    test('Verify clicking outside search box shows validation error message', async ({ researchPlusPage, page }) => {
        await researchPlusPage.searchBarInput1.click();
        await researchPlusPage.searchBarInput1.blur();
        
        // Wait for validation error
        const errorMsg = page.getByText(portalData.researchPlusAdvancedSearch.validationError);
        await expect(errorMsg).toBeVisible({ timeout: 5000 });
    });

    // Case: Verify default Match dropdown selection is All
    test('Verify default Match dropdown selection is All', async ({ researchPlusPage }) => {
        const selectedOption = await researchPlusPage.matchDropdown.evaluate((el: HTMLSelectElement) => el.options[el.selectedIndex].text);
        expect(selectedOption.trim()).toBe(portalData.researchPlusAdvancedSearch.defaultMatch);
    });

    // Case: Verify Add Query Type button is present
    test('Verify Add Query Type button is present when less than 3 query types are open', async ({ researchPlusPage }) => {
        await expect(researchPlusPage.addQueryTypeBtn).toBeVisible();
    });

    // Case: Verify clicking Add Query Type opens second row
    test('Verify clicking Add Query Type opens a second query type and removes controls from the first', async ({ researchPlusPage }) => {
        await researchPlusPage.addQueryTypeBtn.click();
        await expect(researchPlusPage.queryTypeDropdown2).toBeVisible();
        await expect(researchPlusPage.searchBarInput2).toBeVisible();
        
        // Verify the first row doesn't have an X.
        const row1RemoveCount = await researchPlusPage.page.locator('.row').first().locator('a[title*="emove"]').count();
        expect(row1RemoveCount).toBe(0);
    });

    // Case: Verify clicking Add Query Type on the second row opens third
    test('Verify clicking Add Query Type on the second query type opens a third', async ({ researchPlusPage }) => {
        await researchPlusPage.addQueryTypeBtn.click(); // opens 2nd
        await researchPlusPage.addQueryTypeBtn.click(); // opens 3rd
        
        await expect(researchPlusPage.queryTypeDropdown3).toBeVisible();
        await expect(researchPlusPage.searchBarInput3).toBeVisible();
    });

    // Case: Verify Add Query Type button is removed when 3 types are open
    test('Verify Add Query Type button is removed when 3 query types are open', async ({ researchPlusPage }) => {
        await researchPlusPage.addQueryTypeBtn.click(); // 2nd
        await researchPlusPage.addQueryTypeBtn.click(); // 3rd
        
        await expect(researchPlusPage.addQueryTypeBtn).toBeHidden();
    });

    // Case: Verify remove buttons present for 2nd and 3rd query types
    test('Verify second and third query types have remove buttons', async ({ researchPlusPage }) => {
        await researchPlusPage.addQueryTypeBtn.click(); // 2nd
        await expect(researchPlusPage.getRemoveBtn()).toBeVisible();
        await researchPlusPage.addQueryTypeBtn.click(); // 3rd
        await expect(researchPlusPage.getRemoveBtn()).toBeVisible();
    });

    // Case: Verify clicking remove restores Add button
    test('Verify clicking remove button removes the query type and restores Add button', async ({ researchPlusPage }) => {
        await researchPlusPage.addQueryTypeBtn.click(); // 2nd
        await researchPlusPage.addQueryTypeBtn.click(); // 3rd
        
        // Remove 3rd
        await researchPlusPage.getRemoveBtn().click();
        await expect(researchPlusPage.queryTypeDropdown3).toBeHidden();
        
        // + symbol should appear again
        await expect(researchPlusPage.addQueryTypeBtn).toBeVisible();
        
        // Remove 2nd
        await researchPlusPage.getRemoveBtn().click();
        await expect(researchPlusPage.queryTypeDropdown2).toBeHidden();
        
        // + symbol should remain visible
        await expect(researchPlusPage.addQueryTypeBtn).toBeVisible();
    });

    // --- NEW ENTER QUERY CASES ---

    test('Verify clicking outside second query box shows validation error', async ({ researchPlusPage, page }) => {
        await researchPlusPage.addQueryTypeBtn.click();
        await researchPlusPage.searchBarInput2.click();
        await researchPlusPage.searchBarInput2.blur();
        
        const errorMsg = page.getByText(advancedSearchData.searchBoxRemoveRowError).last();
        await expect(errorMsg).toBeVisible({ timeout: 5000 });
    });

    test('Verify Search button is disabled if any open query box is blank', async ({ researchPlusPage }) => {
        await researchPlusPage.addQueryTypeBtn.click();
        // Since we didn't fill anything, both inputs are blank. Search should be disabled.
        await expect(researchPlusPage.searchButton).toBeDisabled();
    });

    // Case: From/To Year short year validation
    test('Verify From/To Year with less than 4 characters shows validation error', async ({ researchPlusPage, page }) => {
        // From Year validation
        await researchPlusPage.fromYearInput.fill(advancedSearchData.pubYearValidation.shortYear);
        await researchPlusPage.fromYearInput.blur();
        
        let errorMsg = page.getByText(advancedSearchData.pubYearCharLenError).first();
        await expect(errorMsg).toBeVisible();
        
        await researchPlusPage.fromYearInput.clear();

        // To Year validation
        await researchPlusPage.toYearInput.fill(advancedSearchData.pubYearValidation.shortYear);
        await researchPlusPage.toYearInput.blur();
        
        errorMsg = page.getByText(advancedSearchData.pubYearCharLenError).first();
        await expect(errorMsg).toBeVisible();
    });

    test('Verify From Year non-numeric characters shows validation error', async ({ researchPlusPage, page }) => {
        await researchPlusPage.fromYearInput.fill(advancedSearchData.pubYearValidation.nonNumericYear);
        await researchPlusPage.fromYearInput.blur();
        
        const errorMsg = page.getByText(advancedSearchData.pubYearNumericError).first();
        await expect(errorMsg).toBeVisible({ timeout: 5000 });
    });

    test('Verify To Year non-numeric characters shows validation error', async ({ researchPlusPage, page }) => {
        await researchPlusPage.toYearInput.fill(advancedSearchData.pubYearValidation.nonNumericYear);
        await researchPlusPage.toYearInput.blur();
        
        const errorMsg = page.getByText(advancedSearchData.pubYearNumericError).first();
        await expect(errorMsg).toBeVisible({ timeout: 5000 });
    });

    test('Verify typing in From Year automatically populates To Year', async ({ researchPlusPage }) => {
        await researchPlusPage.fromYearInput.fill(advancedSearchData.pubYearValidation.validToYear);
        await expect(researchPlusPage.toYearInput).toHaveValue(advancedSearchData.pubYearValidation.validToYear);
    });

    test('Verify leaving From Year blank while filling To Year shows required error', async ({ researchPlusPage, page }) => {
        // Ensure From year is empty (it is by default)
        
        // Enter data in TO year to trigger from year requirement
        await researchPlusPage.toYearInput.fill(advancedSearchData.pubYearValidation.validToYear);
        await researchPlusPage.toYearInput.blur();
        
        const errorMsg = page.getByText(advancedSearchData.pubYearMissingFromError).first();
        await expect(errorMsg).toBeVisible();
    });

    test('Verify From Year being greater than To Year shows validation error', async ({ researchPlusPage, page }) => {
        await researchPlusPage.fromYearInput.fill(advancedSearchData.pubYearValidation.invalidGreaterFromYear);
        await researchPlusPage.toYearInput.fill(advancedSearchData.pubYearValidation.validToYear);
        await researchPlusPage.toYearInput.blur();
        
        const errorMsg = page.getByText(advancedSearchData.pubYearRangeError).first();
        await expect(errorMsg).toBeVisible();
    });

    test('Verify From Year greater than current year shows validation error', async ({ researchPlusPage, page }) => {
        const futureYear = new Date().getFullYear() + 1;
        await researchPlusPage.fromYearInput.fill(futureYear.toString());
        await researchPlusPage.fromYearInput.blur();
        
        const errorMsg = page.getByText(advancedSearchData.pubYearFutureError).first();
        await expect(errorMsg).toBeVisible();
    });

});
