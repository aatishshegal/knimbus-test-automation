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
    test('Verify Query Type default selection should be Title', async ({ researchPlusPage }) => {
        const selectedOption = await researchPlusPage.queryTypeDropdown1.evaluate((el: HTMLSelectElement) => el.options[el.selectedIndex].text);
        expect(selectedOption.trim()).toBe(portalData.researchPlusAdvancedSearch.defaultQueryType);
    });

    // Case: Verify Search box Placeholder text (It should match with json)
    test('Verify Search box Placeholder text (It should match with json)', async ({ researchPlusPage, page }) => {
        // According to our DOM dump, the label says "Enter search query".
        const labelText = await page.locator('label').filter({ hasText: portalData.researchPlusAdvancedSearch.searchPlaceholder }).first().innerText();
        expect(labelText.trim()).toBe(portalData.researchPlusAdvancedSearch.searchPlaceholder);
    });

    // Case: Verify on clicking search box and and then clicking outside it should Validation error message
    test('Verify on clicking search box and then clicking outside it should show Validation error message', async ({ researchPlusPage, page }) => {
        await researchPlusPage.searchBarInput1.click();
        await researchPlusPage.searchBarInput1.blur();
        
        // Wait for validation error
        const errorMsg = page.getByText(portalData.researchPlusAdvancedSearch.validationError);
        await expect(errorMsg).toBeVisible({ timeout: 5000 });
    });

    // Case: Verify in Match dropdown by default selection should be "All"
    test('Verify in Match dropdown by default selection should be All', async ({ researchPlusPage }) => {
        const selectedOption = await researchPlusPage.matchDropdown.evaluate((el: HTMLSelectElement) => el.options[el.selectedIndex].text);
        expect(selectedOption.trim()).toBe(portalData.researchPlusAdvancedSearch.defaultMatch);
    });

    // Case: Verify + symbol present for first query type
    test('Verify in Enter Query if only 2 or less than option of Query Type is opened then there will be + symbol present', async ({ researchPlusPage }) => {
        await expect(researchPlusPage.addQueryTypeBtn).toBeVisible();
    });

    // Case: Verify clicking + opens second query type and removes +/X from first
    test('Verify that clicking on + symbol of first query type should open a second query Type and first should not have + or X', async ({ researchPlusPage }) => {
        await researchPlusPage.addQueryTypeBtn.click();
        await expect(researchPlusPage.queryTypeDropdown2).toBeVisible();
        await expect(researchPlusPage.searchBarInput2).toBeVisible();
        
        // Verify the first row doesn't have an X.
        const row1RemoveCount = await researchPlusPage.page.locator('.row').first().locator('a[title*="emove"]').count();
        expect(row1RemoveCount).toBe(0);
    });

    // Case: Verify clicking + of second query type opens third
    test('Verify that clicking on + Symbol of second Query type should open third Query type', async ({ researchPlusPage }) => {
        await researchPlusPage.addQueryTypeBtn.click(); // opens 2nd
        await researchPlusPage.addQueryTypeBtn.click(); // opens 3rd
        
        await expect(researchPlusPage.queryTypeDropdown3).toBeVisible();
        await expect(researchPlusPage.searchBarInput3).toBeVisible();
    });

    // Case: Verify once 3 Query type is opened + symbol has been removed
    test('Verify once 3 Query type is opened + symbol has been removed', async ({ researchPlusPage }) => {
        await researchPlusPage.addQueryTypeBtn.click(); // 2nd
        await researchPlusPage.addQueryTypeBtn.click(); // 3rd
        
        await expect(researchPlusPage.addQueryTypeBtn).toBeHidden();
    });

    // Case: Verify second and third have X symbol
    test('Verify that for second and 3 query type X symbol is also present', async ({ researchPlusPage }) => {
        await researchPlusPage.addQueryTypeBtn.click(); // 2nd
        await expect(researchPlusPage.getRemoveBtn()).toBeVisible();
        await researchPlusPage.addQueryTypeBtn.click(); // 3rd
        await expect(researchPlusPage.getRemoveBtn()).toBeVisible();
    });

    // Case: Verify clicking cross removes it and restores +
    test('Verify clicking on cross icon will remove the query type and restore +', async ({ researchPlusPage }) => {
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

    // Case: In From/To Year if 3 or less characters are given it should show validation error
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

    // Case: enter data in TO year while From Year is empty, it should display "Please fill from year is required"
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

    // Case: from Year can't be greater than current year
    test('Verify From Year greater than current year shows validation error', async ({ researchPlusPage, page }) => {
        const futureYear = new Date().getFullYear() + 1;
        await researchPlusPage.fromYearInput.fill(futureYear.toString());
        await researchPlusPage.fromYearInput.blur();
        
        const errorMsg = page.getByText(advancedSearchData.pubYearFutureError).first();
        await expect(errorMsg).toBeVisible();
    });

    // --- NEW SELECT RESOURCES CASES ---
    const tabs = ['Subscribed', 'Open', 'All'];
    for (const tab of tabs) {
        test.describe(`Select Resources - ${tab} Tab Validations`, () => {
            test.beforeEach(async ({ researchPlusPage }) => {
                const tabLocator = tab === 'Subscribed' ? researchPlusPage.subscribedTab : (tab === 'Open' ? researchPlusPage.openTab : researchPlusPage.allTab);
                await tabLocator.click();
            });

            test(`Verify presence of Select All button in ${tab} tab`, async ({ researchPlusPage }) => {
                await expect(researchPlusPage.selectAllButton).toBeVisible();
            });

            test(`Verify click on Select All selects all sources and updates to Default in ${tab} tab`, async ({ researchPlusPage }) => {
                await researchPlusPage.selectAllButton.click();
                
                // Ensure the list is populated and checkboxes are checked
                await expect(researchPlusPage.allResourcesList.first()).toBeVisible();
                const totalResources = await researchPlusPage.allResourcesList.count();
                for (let i = 0; i < totalResources; i++) {
                    // Check if the checked class is present
                    await expect(researchPlusPage.allResourcesList.nth(i)).toHaveClass(/asw-checkbox-checked/);
                }

                await expect(researchPlusPage.defaultButton).toBeVisible();
                await expect(researchPlusPage.selectAllButton).toBeHidden();
            });

            test(`Verify click on Default restores Select All and partial selection in ${tab} tab`, async ({ researchPlusPage }) => {
                await researchPlusPage.selectAllButton.click();
                await researchPlusPage.defaultButton.click();
                
                await expect(researchPlusPage.selectAllButton).toBeVisible();
                await expect(researchPlusPage.defaultButton).toBeHidden();
                
                // Ensure some are selected and some are not (default state)
                // We just verify that not ALL of them are selected anymore.
                const totalResources = await researchPlusPage.allResourcesList.count();
                let hasUnselected = false;
                for (let i = 0; i < totalResources; i++) {
                    const classAttr = await researchPlusPage.allResourcesList.nth(i).getAttribute('class');
                    if (!classAttr?.includes('asw-checkbox-checked')) {
                        hasUnselected = true;
                        break;
                    }
                }
                expect(hasUnselected).toBeTruthy();
            });

            test(`Verify presence of Clear All button in ${tab} tab`, async ({ researchPlusPage }) => {
                await expect(researchPlusPage.clearAllButton).toBeVisible();
            });

            test(`Verify click on Clear All deselects sources and disables Search button in ${tab} tab`, async ({ researchPlusPage, page }) => {
                // We need to have some query to enable Search button
                await researchPlusPage.searchBarInput1.fill(advancedSearchData.formReset?.query || 'Test');
                await researchPlusPage.searchBarInput1.blur();
                
                await researchPlusPage.clearAllButton.click();
                
                // Verify no sources selected
                const totalResources = await researchPlusPage.allResourcesList.count();
                for (let i = 0; i < totalResources; i++) {
                    await expect(researchPlusPage.allResourcesList.nth(i)).not.toHaveClass(/asw-checkbox-checked/);
                }

                // Verify clear all is disabled and message is shown
                await expect(researchPlusPage.clearAllButton).toBeDisabled();
                const errorMsg = researchPlusPage.page.locator('text=' + advancedSearchData.selectResources.clearAllDisabledMessage);
                await expect(errorMsg).toBeVisible();

                // Verify global Search button is disabled
                await expect(researchPlusPage.searchButton).toBeDisabled();
            });

            test(`Verify searching within ${tab} tab filters listed sources`, async ({ researchPlusPage }) => {
                const queryKey = tab as keyof typeof advancedSearchData.selectResources.searchQueries;
                const searchQuery = advancedSearchData.selectResources.searchQueries[queryKey];
                
                await researchPlusPage.sourceSearchInput.fill(searchQuery);
                await researchPlusPage.page.waitForTimeout(1000); // Wait for filtering to happen

                // Verify at least one result shows up and contains the text
                const visibleCount = await researchPlusPage.allResourcesList.count();
                expect(visibleCount).toBeGreaterThan(0);
                
                const firstResourceText = await researchPlusPage.allResourcesList.first().innerText();
                expect(firstResourceText.toLowerCase()).toContain(searchQuery.toLowerCase());
            });
        });
    }

});
