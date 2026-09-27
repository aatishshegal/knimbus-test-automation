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
    test('Research Plus - Query Type dropdown defaults to Title', async ({ researchPlusPage }) => {
        const selectedOption = await researchPlusPage.queryTypeDropdown1.evaluate((el: HTMLSelectElement) => el.options[el.selectedIndex].text);
        expect(selectedOption.trim()).toBe(portalData.researchPlusAdvancedSearch.defaultQueryType);
    });

    // Case: Verify Search box Placeholder text
    test('Research Plus - Search box displays Enter search query placeholder', async ({ researchPlusPage, page }) => {
        const labelText = await page.locator('label').filter({ hasText: portalData.researchPlusAdvancedSearch.searchPlaceholder }).first().innerText();
        expect(labelText.trim()).toBe(portalData.researchPlusAdvancedSearch.searchPlaceholder);
    });

    // Case: Verify clicking outside search box shows validation error
    test('Research Plus - Blurring empty search input displays required validation error', async ({ researchPlusPage, page }) => {
        await researchPlusPage.searchBarInput1.click();
        await researchPlusPage.searchBarInput1.blur();
        
        // Wait for validation error
        const errorMsg = page.getByText(portalData.researchPlusAdvancedSearch.validationError);
        await expect(errorMsg).toBeVisible({ timeout: 5000 });
    });

    // Case: Verify default Match dropdown selection is All
    test('Research Plus - Match dropdown defaults to All', async ({ researchPlusPage }) => {
        const selectedOption = await researchPlusPage.matchDropdown.evaluate((el: HTMLSelectElement) => el.options[el.selectedIndex].text);
        expect(selectedOption.trim()).toBe(portalData.researchPlusAdvancedSearch.defaultMatch);
    });

    // Case: Verify Add Query Type button is present
    test('Research Plus - Add Query Type button is displayed when fewer than three rows are active', async ({ researchPlusPage }) => {
        await expect(researchPlusPage.addQueryTypeBtn).toBeVisible();
    });

    // Case: Verify clicking Add Query Type opens second row
    test('Research Plus - Adding second query row displays secondary inputs and preserves primary row', async ({ researchPlusPage }) => {
        await researchPlusPage.addQueryTypeBtn.click();
        await expect(researchPlusPage.queryTypeDropdown2).toBeVisible();
        await expect(researchPlusPage.searchBarInput2).toBeVisible();
        
        // Verify the first row doesn't have an X.
        const row1RemoveCount = await researchPlusPage.page.locator('.row').first().locator('a[title*="emove"]').count();
        expect(row1RemoveCount).toBe(0);
    });

    // Case: Verify clicking Add Query Type on the second row opens third
    test('Research Plus - Adding third query row displays tertiary inputs', async ({ researchPlusPage }) => {
        await researchPlusPage.addQueryTypeBtn.click(); // opens 2nd
        await researchPlusPage.addQueryTypeBtn.click(); // opens 3rd
        
        await expect(researchPlusPage.queryTypeDropdown3).toBeVisible();
        await expect(researchPlusPage.searchBarInput3).toBeVisible();
    });

    // Case: Verify Add Query Type button is removed when 3 types are open
    test('Research Plus - Add Query Type button is hidden when three rows are active', async ({ researchPlusPage }) => {
        await researchPlusPage.addQueryTypeBtn.click(); // 2nd
        await researchPlusPage.addQueryTypeBtn.click(); // 3rd
        
        await expect(researchPlusPage.addQueryTypeBtn).toBeHidden();
    });

    // Case: Verify remove buttons present for 2nd and 3rd query types
    test('Research Plus - Remove buttons are displayed for second and third query rows', async ({ researchPlusPage }) => {
        await researchPlusPage.addQueryTypeBtn.click(); // 2nd
        await expect(researchPlusPage.getRemoveBtn()).toBeVisible();
        await researchPlusPage.addQueryTypeBtn.click(); // 3rd
        await expect(researchPlusPage.getRemoveBtn()).toBeVisible();
    });

    // Case: Verify clicking remove restores Add button
    test('Research Plus - Removing query row restores Add Query Type button', async ({ researchPlusPage }) => {
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

    test('Research Plus - Blurring empty second query input displays validation error', async ({ researchPlusPage, page }) => {
        await researchPlusPage.addQueryTypeBtn.click();
        await researchPlusPage.searchBarInput2.click();
        await researchPlusPage.searchBarInput2.blur();
        
        const errorMsg = page.getByText(advancedSearchData.searchBoxRemoveRowError).last();
        await expect(errorMsg).toBeVisible({ timeout: 5000 });
    });

    test('Research Plus - Search button is disabled when any active query input is empty', async ({ researchPlusPage }) => {
        await researchPlusPage.addQueryTypeBtn.click();
        await expect(researchPlusPage.searchButton).toBeDisabled();
    });

    // Case: From/To Year short year validation
    test('Research Plus - Publication year inputs reject values with fewer than four digits', async ({ researchPlusPage, page }) => {
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

    test('Research Plus - From Year rejects non-numeric input and displays validation error', async ({ researchPlusPage, page }) => {
        await researchPlusPage.fromYearInput.fill(advancedSearchData.pubYearValidation.nonNumericYear);
        await researchPlusPage.fromYearInput.blur();
        
        const errorMsg = page.getByText(advancedSearchData.pubYearNumericError).first();
        await expect(errorMsg).toBeVisible({ timeout: 5000 });
    });

    test('Research Plus - To Year rejects non-numeric input and displays validation error', async ({ researchPlusPage, page }) => {
        await researchPlusPage.toYearInput.fill(advancedSearchData.pubYearValidation.nonNumericYear);
        await researchPlusPage.toYearInput.blur();
        
        const errorMsg = page.getByText(advancedSearchData.pubYearNumericError).first();
        await expect(errorMsg).toBeVisible({ timeout: 5000 });
    });

    test('Research Plus - Populating From Year automatically mirrors value into To Year', async ({ researchPlusPage }) => {
        await researchPlusPage.fromYearInput.fill(advancedSearchData.pubYearValidation.validToYear);
        await expect(researchPlusPage.toYearInput).toHaveValue(advancedSearchData.pubYearValidation.validToYear);
    });

    test('Research Plus - Leaving From Year empty while filling To Year displays required error', async ({ researchPlusPage, page }) => {
        await researchPlusPage.toYearInput.fill(advancedSearchData.pubYearValidation.validToYear);
        await researchPlusPage.toYearInput.blur();
        
        const errorMsg = page.getByText(advancedSearchData.pubYearMissingFromError).first();
        await expect(errorMsg).toBeVisible();
    });

    test('Research Plus - Entering From Year greater than To Year displays invalid range error', async ({ researchPlusPage, page }) => {
        await researchPlusPage.fromYearInput.fill(advancedSearchData.pubYearValidation.invalidGreaterFromYear);
        await researchPlusPage.toYearInput.fill(advancedSearchData.pubYearValidation.validToYear);
        await researchPlusPage.toYearInput.blur();
        
        const errorMsg = page.getByText(advancedSearchData.pubYearRangeError).first();
        await expect(errorMsg).toBeVisible();
    });

    test('Research Plus - Entering future From Year displays year exceeds current year error', async ({ researchPlusPage, page }) => {
        const futureYear = new Date().getFullYear() + 1;
        await researchPlusPage.fromYearInput.fill(futureYear.toString());
        await researchPlusPage.fromYearInput.blur();
        
        const errorMsg = page.getByText(advancedSearchData.pubYearFutureError).first();
        await expect(errorMsg).toBeVisible();
    });

});
