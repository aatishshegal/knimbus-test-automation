import { test, expect } from '../../../src/fixtures';
import * as fs from 'fs';

import portalData from '../../test-data/portal-data.json';

// We will use the specific test data block meant for inner search persistence testing
// (Or just use the first inner search query available in the data)
const testData = portalData.filterPanelScenarios.find(d => d.innerSearchQuery) || portalData.filterPanelScenarios[0];

test.describe('Inner Search Filter Persistence', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(process.env.PORTAL_URL as string);
    });

    test.setTimeout(180000);

    test('Verify Drilldown Filter remains intact across Sort, View, Pagination, and Category Filter changes', async ({ page, topNavigationBar, searchResultPage }, testInfo) => {
        const reportData: string[] = [];
        const csvHeader = 'Action,Expected,Result,Details\n';
        
        // Fetching test data dynamically from JSON file
        const globalQuery = testData.query;
        const innerQuery = testData.innerSearchQuery || 'Science';
        // Fallback to "Content Types" / "eBook" if categories array is empty in the JSON
        const categoryName = testData.categories && testData.categories.length > 0 ? testData.categories[0].name : 'Content Types';
        const filterValue = testData.categories && testData.categories.length > 0 ? testData.categories[0].values[0] : 'eBook';

        // Helper to log to CSV array
        const logResult = (action: string, expected: string, isPassed: boolean, details: string) => {
            const status = isPassed ? 'Passed' : 'Failed';
            reportData.push(`"${action}","${expected}","${status}","${details}"`);
            console.log(`[${status}] ${action} - ${details}`);
        };

        // 1. Initial Search
        await topNavigationBar.searchFor(globalQuery);
        await expect(searchResultPage.searchResultIdentifier).toBeAttached();
        await expect(searchResultPage.searchCountText).toBeVisible({ timeout: 15000 });

        // 2. Perform Inner Search (Drilldown)
        await searchResultPage.innerSearchInput.fill(innerQuery);
        await searchResultPage.innerSearchInput.press('Enter');
        await searchResultPage.waitForResultsToReload();

        // Verify Drilldown is applied initially
        let isIntact = await searchResultPage.filterPanel.isInnerSearchFilterApplied(innerQuery);
        expect(isIntact).toBeTruthy();
        logResult('Initial Inner Search', 'Drilldown filter should be applied', isIntact, 'Initial drilldown applied successfully');

        // 3. Action 1: Apply Sorting
        try {
            await searchResultPage.sortingDropdownToggle.click();
            await page.waitForTimeout(1000); // Wait for dropdown to populate

            // Fetch all available sort options from the dropdown
            const sortOptionsLocator = searchResultPage.sortOptionsContainer.locator('a, .dropdown-item');
            const count = await sortOptionsLocator.count();
            
            // Collect options and prioritize them
            const sortOptions: { index: number; text: string }[] = [];
            for (let i = 0; i < count; i++) {
                const text = await sortOptionsLocator.nth(i).innerText();
                sortOptions.push({ index: i, text: text.trim() });
            }
            
            // Move 'Best Matched' to the end of the array
            const bestMatchedIndex = sortOptions.findIndex(o => o.text.includes('Best Matched'));
            if (bestMatchedIndex !== -1) {
                const bestMatchedOption = sortOptions.splice(bestMatchedIndex, 1)[0];
                sortOptions.push(bestMatchedOption);
            }

            // Close the dropdown so we can click them cleanly in the loop
            await searchResultPage.sortingDropdownToggle.click();
            await page.waitForTimeout(500);

            // Loop and apply each sort option
            for (const option of sortOptions) {
                await searchResultPage.sortingDropdownToggle.click();
                await page.waitForTimeout(500); // Allow dropdown animation

                // Click the option
                const optionLocator = searchResultPage.sortOptionsContainer.locator('a, .dropdown-item').nth(option.index);
                await optionLocator.click();
                
                // Wait for search results to reload after sorting
                await searchResultPage.waitForResultsToReload();

                isIntact = await searchResultPage.filterPanel.isInnerSearchFilterApplied(innerQuery);
                logResult('Apply Sorting', `Filter intact after sorting by ${option.text}`, isIntact, `Drilldown was ${isIntact ? 'intact' : 'lost'} after sorting`);
                expect.soft(isIntact).toBeTruthy();
            }
        } catch (e) {
            logResult('Apply Sorting', 'Apply all sorting options', false, `Failed to interact with sorting: ${(e as Error).message}`);
            expect.soft(false, 'Apply Sorting failed').toBeTruthy();
        }

        // 4. Action 2: Change View Grid -> List -> Grid
        try {
            await searchResultPage.viewDropdownToggle.click();
            await searchResultPage.viewOptionList.click();
            await page.waitForTimeout(1000);

            isIntact = await searchResultPage.filterPanel.isInnerSearchFilterApplied(innerQuery);
            logResult('Toggle to List View', 'Filter intact after changing to list view', isIntact, `Drilldown was ${isIntact ? 'intact' : 'lost'} in list view`);
            expect.soft(isIntact).toBeTruthy();

            await searchResultPage.viewDropdownToggle.click();
            await searchResultPage.viewOptionGrid.click();
            await page.waitForTimeout(1000);

            isIntact = await searchResultPage.filterPanel.isInnerSearchFilterApplied(innerQuery);
            logResult('Toggle to Grid View', 'Filter intact after changing back to grid view', isIntact, `Drilldown was ${isIntact ? 'intact' : 'lost'} in grid view`);
            expect.soft(isIntact).toBeTruthy();
        } catch (e) {
            logResult('Change View', 'Toggle grid/list view', false, `Failed to toggle views: ${(e as Error).message}`);
            expect.soft(false, 'Change View failed').toBeTruthy();
        }

        // 5. Action 3: Pagination (Next Page x2)
        try {
            if (await searchResultPage.nextPageButton.isVisible()) {
                await searchResultPage.nextPageButton.click();
                await searchResultPage.waitForResultsToReload();

                isIntact = await searchResultPage.filterPanel.isInnerSearchFilterApplied(innerQuery);
                logResult('Pagination - Page 2', 'Filter intact after navigating to page 2', isIntact, `Drilldown was ${isIntact ? 'intact' : 'lost'} on page 2`);
                expect.soft(isIntact).toBeTruthy();

                if (await searchResultPage.nextPageButton.isVisible()) {
                    await searchResultPage.nextPageButton.click();
                    await searchResultPage.waitForResultsToReload();

                    isIntact = await searchResultPage.filterPanel.isInnerSearchFilterApplied(innerQuery);
                    logResult('Pagination - Page 3', 'Filter intact after navigating to page 3', isIntact, `Drilldown was ${isIntact ? 'intact' : 'lost'} on page 3`);
                    expect.soft(isIntact).toBeTruthy();
                }
            } else {
                logResult('Pagination', 'Pagination not tested', true, 'Not enough results to paginate');
            }
        } catch (e) {
            logResult('Pagination', 'Navigate to next page', false, `Failed to paginate: ${(e as Error).message}`);
            expect.soft(false, 'Pagination failed').toBeTruthy();
        }

        // 6. Action 4 & 5: Apply and Remove Category Filter
        try {
            await searchResultPage.filterPanel.applyFilterValue(categoryName, filterValue);

            isIntact = await searchResultPage.filterPanel.isInnerSearchFilterApplied(innerQuery);
            logResult('Apply Category Filter', `Filter intact after applying ${categoryName} -> ${filterValue}`, isIntact, `Drilldown was ${isIntact ? 'intact' : 'lost'}`);
            expect.soft(isIntact).toBeTruthy();

            // 7. Action 5: Remove specific category filter (NOT clear all)
            await searchResultPage.filterPanel.removeAppliedFilter(categoryName, filterValue);

            isIntact = await searchResultPage.filterPanel.isInnerSearchFilterApplied(innerQuery);
            logResult('Remove Category Filter', `Filter intact after explicitly removing ${filterValue} chip`, isIntact, `Drilldown was ${isIntact ? 'intact' : 'lost'}`);
            expect.soft(isIntact).toBeTruthy();
        } catch (e) {
            logResult('Category Filters', 'Apply/Remove filters', false, `Filter option ${filterValue} in ${categoryName} could not be interacted with. Error: ${(e as Error).message}`);
            expect.soft(false, 'Category Filters failed').toBeTruthy();
        }

        // 8. Generate CSV Report
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportDir = 'test-results';
        const reportPath = `${reportDir}/InnerSearch_Persistence_Report_${timestamp}.csv`;

        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        const csvContent = csvHeader + reportData.join('\n');
        fs.writeFileSync(reportPath, csvContent);

        await testInfo.attach('Inner Search Persistence Report', {
            body: csvContent,
            contentType: 'text/csv'
        });

        console.log(`\n✅ CSV Report generated successfully: ${reportPath}\n`);
    });
});
