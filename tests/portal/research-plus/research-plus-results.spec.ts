import { test, expect } from '../../../src/fixtures';
import { FilterPanelPage } from '../../../src/pages/portal/FilterPanelPage';
import portalData from '../../test-data/portal-data.json';

test.describe('Research+ Functionality', () => {
    test.beforeEach(async ({ page, homePage }) => {
        // Navigate to the portal, relying on the cached global session
        await page.goto(process.env.PORTAL_URL!);
        await expect(homePage.homePageIdentifier).toBeVisible();
    });

    test('Research Plus - Executing search navigates to search results and renders federated count without global tabs', async ({ topNavigationBar, researchPlusPage, page }) => {
        // Navigate to Research+
        await topNavigationBar.menuResearch.click();
        await expect(researchPlusPage.pageIdentifier).toBeVisible();

        const searchData = portalData.researchPlus;
        const searchQuery = searchData.queries[0];

        // Perform the search
        await researchPlusPage.performSearch(
            searchData.queryTypeLabel,
            searchData.queryTypeValue,
            searchQuery,
            searchData.resourceTab
        );

        // Verify navigation to results page
        await expect(page).toHaveURL(/search/i);
        
        // Confirm results are painted and global search tabs are absent
        await researchPlusPage.verifyResultsPaintedAndNoTabs();
    });

    test('Research Plus - History tab retains previously selected search resources after query execution', async ({ topNavigationBar, researchPlusPage, page }) => {
        // Go to Research+
        await topNavigationBar.menuResearch.click();
        await expect(researchPlusPage.pageIdentifier).toBeVisible();

        const searchQuery = portalData.researchPlus.queries[0];
        await researchPlusPage.searchBarInput.fill(searchQuery);

        // Go to "All" tab and Clear All sources
        await researchPlusPage.clearAllResources();

        // Select 3 sources deterministically and store the list
        const selectedSources = await researchPlusPage.selectResourcesByCount(3, portalData.researchPlus.allowedSources);

        // Perform search
        await researchPlusPage.searchButton.click();
        await page.waitForURL(/search/i, { timeout: 30000 }).catch(() => {});
        
        // Wait for results to be painted
        await researchPlusPage.verifyResultsPaintedAndNoTabs();

        // Click on Research+ from navigation bar again
        await topNavigationBar.menuResearch.click();
        await expect(researchPlusPage.pageIdentifier).toBeVisible();

        // Visit History tab and extract selected resources
        const historySelectedSources = await researchPlusPage.getHistorySelectedResources();

        // Match the selected sources
        expect(historySelectedSources).toEqual(selectedSources);
    });

    test('Research Plus - Single source search defaults result page sorting to Source', async ({ topNavigationBar, researchPlusPage, searchResultPage, page }) => {
        await topNavigationBar.menuResearch.click();
        await expect(researchPlusPage.pageIdentifier).toBeVisible();

        const searchQuery = portalData.researchPlus.guaranteedResultsQuery;
        await researchPlusPage.searchBarInput.fill(searchQuery);

        await researchPlusPage.clearAllResources();
        await researchPlusPage.selectSpecificResources([portalData.researchPlus.guaranteedResultsSources[0]]);

        await researchPlusPage.searchButton.click();
        await page.waitForURL(/search/i, { timeout: 30000 }).catch(() => {});
        
        await researchPlusPage.verifyResultsPaintedAndNoTabs();

        await expect(searchResultPage.sortingDropdownToggle).toContainText('Source', { timeout: 15000 });
    });

    test('Research Plus - Multiple sources search defaults result page sorting to Best Matched', async ({ topNavigationBar, researchPlusPage, searchResultPage, page }) => {
        await topNavigationBar.menuResearch.click();
        await expect(researchPlusPage.pageIdentifier).toBeVisible();

        const searchQuery = portalData.researchPlus.guaranteedResultsQuery;
        await researchPlusPage.searchBarInput.fill(searchQuery);

        await researchPlusPage.clearAllResources();
        await researchPlusPage.selectSpecificResources(portalData.researchPlus.guaranteedResultsSources);

        await researchPlusPage.searchButton.click();
        await page.waitForURL(/search/i, { timeout: 30000 }).catch(() => {});
        
        await researchPlusPage.verifyResultsPaintedAndNoTabs();

        await expect(searchResultPage.sortingDropdownToggle).toContainText('Best Matched', { timeout: 15000 });
    });

    test('Research Plus - Publication year range filter restricts result years to specified boundary', async ({ topNavigationBar, researchPlusPage, page }) => {
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
        
        await researchPlusPage.verifyResultsPaintedAndNoTabs();
        
        await filterPanelPage.filtersSidebar.waitFor({ state: 'visible', timeout: 15000 });

        const yearLabels = await filterPanelPage.getFilterValues('Publication year');
        expect(yearLabels.length, 'There should be at least one publication year returned to validate the filter').toBeGreaterThan(0);

        await filterPanelPage.verifyYearLabelsWithinRange(yearLabels, fromYear, toYear);
    });
});
