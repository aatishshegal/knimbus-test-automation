import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

test.describe('Research+ Functionality', () => {
    test.beforeEach(async ({ page, homePage }) => {
        // Navigate to the portal, relying on the cached global session
        await page.goto(process.env.PORTAL_URL!);
        await expect(homePage.homePageIdentifier).toBeVisible();
    });

    test('It will land on Research+ Page (Verify this)', async ({ topNavigationBar, researchPlusPage, page }) => {
        // Step 1: Click on Research+ from navigation bar
        await topNavigationBar.menuResearch.click();

        // Step 2: Verify Research+ Page is visible
        await expect(researchPlusPage.pageIdentifier).toBeVisible();

        const formHtml = await page.locator('.asw-connector-wrapper').first().innerHTML().catch(() => 'no form');
        console.log('[TEST] FORM HTML: ', formHtml);
    });

    test('On this page verify Search Tips availability', async ({ topNavigationBar, researchPlusPage }) => {
        // Navigate to Research+
        await topNavigationBar.menuResearch.click();
        await expect(researchPlusPage.pageIdentifier).toBeVisible();

        // Verify Search Tips availability
        await researchPlusPage.verifySearchTipsVisibility();
    });

    test('Verify by performing search', async ({ topNavigationBar, researchPlusPage, page }) => {
        // Navigate to Research+
        await topNavigationBar.menuResearch.click();
        await expect(researchPlusPage.pageIdentifier).toBeVisible();

        // Extract parameters from test data
        const searchData = portalData.researchPlus;

        const randomQuery = searchData.queries[Math.floor(Math.random() * searchData.queries.length)];

        // Perform the search
        await researchPlusPage.performSearch(
            searchData.queryTypeLabel,
            searchData.queryTypeValue,
            randomQuery,
            searchData.resourceTab
        );

        // Verify that post clicking on search it will land result page of Research+
        // Wait for the URL to change to the search results page
        await expect(page).toHaveURL(/search/i);
        
        // Also verify that the Results are painted by checking the URL query parameters
        // since we searched for "Agentic"
        // since we searched for the randomly selected query
        const currentUrl = page.url();
        expect.soft(currentUrl).toContain(encodeURIComponent(randomQuery));
        
        // Confirm results are painted and global search tabs are absent
        await researchPlusPage.verifyResultsPaintedAndNoTabs();
    });

    test('Verify History option retains selected resources after performing a search', async ({ topNavigationBar, researchPlusPage, page }) => {
        // Step 2: Go to Research+
        await topNavigationBar.menuResearch.click();
        await expect(researchPlusPage.pageIdentifier).toBeVisible();

        // Step 3: Pick a random search query from the allowed list in portalData
        const searchQuery = portalData.researchPlus.queries[Math.floor(Math.random() * portalData.researchPlus.queries.length)];
        await researchPlusPage.searchBarInput.fill(searchQuery);

        // Steps 4-5: Go to "All" tab and Clear All sources
        await researchPlusPage.clearAllResources();

        // Step 6: Randomly select 2 to 3 sources and store the list
        const randomlySelectedSources = await researchPlusPage.selectRandomResources(3, portalData.researchPlus.allowedSources);
        console.log(`[TEST] Randomly selected sources: ${randomlySelectedSources.join(', ')}`);

        // Step 7: Perform search
        await researchPlusPage.searchButton.click();
        await page.waitForURL(/search/i, { timeout: 30000 }).catch(() => {});
        
        // Wait for results to be painted
        await researchPlusPage.verifyResultsPaintedAndNoTabs();

        // Step 8: Click on Research+ from navigation bar again
        await topNavigationBar.menuResearch.click();
        await expect(researchPlusPage.pageIdentifier).toBeVisible();

        // Step 9-10: Visit History tab and extract selected resources
        const historySelectedSources = await researchPlusPage.getHistorySelectedResources();
        console.log(`[TEST] History selected sources: ${historySelectedSources.join(', ')}`);

        // Step 11: Match the selected sources
        expect.soft(historySelectedSources).toEqual(randomlySelectedSources);
    });
    test('Verify default sorting on result page after selecting one source is Source', async ({ topNavigationBar, researchPlusPage, searchResultPage, page }) => {
        await topNavigationBar.menuResearch.click();
        await expect(researchPlusPage.pageIdentifier).toBeVisible();

        const searchQuery = portalData.researchPlus.guaranteedResultsQuery;
        await researchPlusPage.searchBarInput.fill(searchQuery);

        await researchPlusPage.clearAllResources();

        await researchPlusPage.selectSpecificResources([portalData.researchPlus.guaranteedResultsSources[0]]);

        await researchPlusPage.searchButton.click();
        await page.waitForURL(/search/i, { timeout: 30000 }).catch(() => {});
        
        await researchPlusPage.verifyResultsPaintedAndNoTabs();

        const activeSort = await searchResultPage.getActiveSortOption();
        expect.soft(activeSort).toContain('Source');
    });

    test('Verify default sorting on result page after selecting multiple sources is Best Matched', async ({ topNavigationBar, researchPlusPage, searchResultPage, page }) => {
        await topNavigationBar.menuResearch.click();
        await expect(researchPlusPage.pageIdentifier).toBeVisible();

        const searchQuery = portalData.researchPlus.guaranteedResultsQuery;
        await researchPlusPage.searchBarInput.fill(searchQuery);

        await researchPlusPage.clearAllResources();

        await researchPlusPage.selectSpecificResources(portalData.researchPlus.guaranteedResultsSources);

        await researchPlusPage.searchButton.click();
        await page.waitForURL(/search/i, { timeout: 30000 }).catch(() => {});
        
        await researchPlusPage.verifyResultsPaintedAndNoTabs();

        const activeSort = await searchResultPage.getActiveSortOption();
        expect.soft(activeSort).toContain('Best Matched');
    });

    test('Verify the result page contains data from selected Publication year range only', async ({ topNavigationBar, researchPlusPage, searchResultPage, page }) => {
        const { FilterPanelPage } = require('../../../src/pages/portal/FilterPanelPage');
        const filterPanelPage = new FilterPanelPage(page);
        
        await topNavigationBar.menuResearch.click();
        await expect(researchPlusPage.pageIdentifier).toBeVisible();

        const fromYear = 2018;
        const toYear = 2025;
        
        await researchPlusPage.enterPublicationYearRange(fromYear, toYear);

        const searchQuery = portalData.researchPlus.guaranteedResultsQuery;
        await researchPlusPage.searchBarInput.fill(searchQuery);

        await researchPlusPage.clearAllResources();
        await researchPlusPage.selectSpecificResources(portalData.researchPlus.guaranteedResultsSources);

        await researchPlusPage.searchButton.click();
        await page.waitForURL(/search/i, { timeout: 30000 }).catch(() => {});
        
        // Wait for results to be painted! (User explicitly requested this)
        await researchPlusPage.verifyResultsPaintedAndNoTabs();
        
        // Wait for the filter sidebar to be visible
        await filterPanelPage.filtersSidebar.waitFor({ state: 'visible', timeout: 15000 });

        // Get the list of years from the Publication Year filter
        const yearLabels = await filterPanelPage.getFilterValues('Publication year');
        console.log(`[TEST] Extracted Publication Years: ${yearLabels.join(', ')}`);
        
        expect(yearLabels.length, 'There should be at least one publication year returned to validate the filter').toBeGreaterThan(0);

        // Verify that all extracted years are within the provided range
        for (const label of yearLabels) {
            // Label might look like "2020 (15)" or just "2020"
            const yearMatch = label.match(/\b(19|20)\d{2}\b/);
            if (yearMatch) {
                const year = parseInt(yearMatch[0], 10);
                expect.soft(year).toBeGreaterThanOrEqual(fromYear);
                expect.soft(year).toBeLessThanOrEqual(toYear);
            }
        }
    });
});
