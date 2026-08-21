import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

const refreshScenarios = portalData.researchPlusFederatedRefresh;

test.describe('Research+ Federated Refresh and Get More Scenarios', () => {

    test.beforeEach(async ({ page, homePage, topNavigationBar, researchPlusPage }) => {
        // Navigate to the portal, relying on the cached global session
        await page.goto(process.env.PORTAL_URL!);
        await expect(homePage.homePageIdentifier).toBeVisible();

        // Navigate to Research+ page
        await topNavigationBar.menuResearch.click();
        await expect(researchPlusPage.pageIdentifier).toBeVisible();
    });

    // Test Case 2: Validate Refresh Button Increments Count
    test(refreshScenarios[0].testCaseName, async ({ researchPlusPage, page }) => {
        const data = refreshScenarios[0];
        const randomQuery = data.queries[Math.floor(Math.random() * data.queries.length)];
        
        await page.waitForTimeout(3000);

        // Step 1: Ensure "All" tab is selected
        await researchPlusPage.allTab.click();

        // Step 2: Select Query Type
        await researchPlusPage.queryTypeDropdown1.selectOption({ label: data.queryType });

        // Step 3: Fill search query
        await researchPlusPage.searchBarInput1.fill(randomQuery);

        // Step 4: Perform Search
        await page.waitForTimeout(3000);
        await researchPlusPage.searchButton.click();

        // Step 5: Wait for results to be painted
        await expect(researchPlusPage.showingCountIndicator).toBeVisible({ timeout: 45000 });

        // Step 6: Store the initial count
        const initialCountText = await researchPlusPage.showingCountIndicator.innerText();
        const initialMatch = initialCountText.match(/Showing\s+([\d,]+)/);
        const initialCount = initialMatch ? parseInt(initialMatch[1].replace(/,/g, ''), 10) : 0;
        
        console.log(`[TEST] Initial count painted: ${initialCount}`);
        expect(initialCount).toBeGreaterThan(0);

        // Step 7: Wait for either 'Refresh' or 'Get More' button to appear
        // Federated search continues in the background. Sometimes it jumps straight to 'Get More'.
        await expect(researchPlusPage.refreshButton.or(researchPlusPage.getMoreButton)).toBeVisible({ timeout: 45000 });

        if (await researchPlusPage.getMoreButton.isVisible()) {
            console.log("[TEST] 'Get More' appeared first. Clicking it to trigger 'Refresh'...");
            await researchPlusPage.getMoreButton.click();
            // Wait for Refresh button to appear after clicking Get More
            await expect(researchPlusPage.refreshButton).toBeVisible({ timeout: 30000 });
        }

        // Step 8: Click the Refresh button
        await researchPlusPage.refreshButton.click();

        // Step 9: Wait for the count to increase or for the Get More button to appear indicating it's done fetching that batch
        // We can wait for the DOM text to change, or just wait for the hourglass to disappear
        await page.waitForTimeout(3000); // Give it a moment to update the DOM

        const newCountText = await researchPlusPage.showingCountIndicator.innerText();
        const newMatch = newCountText.match(/Showing\s+([\d,]+)/);
        const newCount = newMatch ? parseInt(newMatch[1].replace(/,/g, ''), 10) : 0;
        
        console.log(`[TEST] New count after Refresh: ${newCount}`);
        
        // Assert the count increased
        expect(newCount).toBeGreaterThan(initialCount);
    });

    // Test Case 3: Validate Get More Button and Progress Bar
    test(refreshScenarios[1].testCaseName, async ({ researchPlusPage, page }) => {
        const data = refreshScenarios[1];
        const randomQuery = data.queries[Math.floor(Math.random() * data.queries.length)];
        
        await page.waitForTimeout(3000);

        // Step 1: Ensure "All" tab is selected
        await researchPlusPage.allTab.click();

        // Step 2: Select Query Type
        await researchPlusPage.queryTypeDropdown1.selectOption({ label: data.queryType });

        // Step 3: Fill search query
        await researchPlusPage.searchBarInput1.fill(randomQuery);

        // Step 4: Perform Search
        await page.waitForTimeout(3000);
        await researchPlusPage.searchButton.click();

        // Step 5: Wait for results to be painted
        await expect(researchPlusPage.showingCountIndicator).toBeVisible({ timeout: 45000 });

        // Step 6: Wait for progress bar (hourglass) to complete/disappear
        // Note: Playwright's toBeHidden waits for it to not be in the DOM or not be visible
        await expect(researchPlusPage.pollingHourglass).toBeHidden({ timeout: 60000 });

        // Step 7: Click the Refresh button (it should be visible now that polling stopped for the first batch)
        if (await researchPlusPage.refreshButton.isVisible()) {
            await researchPlusPage.refreshButton.click();
        }

        // Step 8: Validate the 'Get More' button appears
        await expect(researchPlusPage.getMoreButton).toBeVisible({ timeout: 15000 });

        // Step 9: Click the 'Get More' button
        await researchPlusPage.getMoreButton.click();

        // Step 10: Validate progress bar appears
        await expect(researchPlusPage.pollingHourglass).toBeVisible({ timeout: 5000 });

        // Step 11: Wait for progress bar to finish and verify 'Refresh' button returns (if more results exist)
        // Note: Depending on the search, it might just stay at Get More if no more results, or return to Refresh
        await expect(researchPlusPage.pollingHourglass).toBeHidden({ timeout: 60000 });
        
        // Assert that at least one of the buttons is visible again (Refresh or Get More depending on API response)
        // Wrapped in a toPass block because React might take a moment to paint the button back into the DOM after the hourglass hides
        await expect(async () => {
            const isRefreshVisible = await researchPlusPage.refreshButton.isVisible();
            const isGetMoreVisible = await researchPlusPage.getMoreButton.isVisible();
            expect(isRefreshVisible || isGetMoreVisible).toBeTruthy();
        }).toPass({ timeout: 10000 });
    });

});
