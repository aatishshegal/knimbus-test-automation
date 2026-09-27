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

    test('Research Plus - Refresh button increments result count as federated sources respond', async ({ researchPlusPage }) => {
        test.setTimeout(120000);
        const data = refreshScenarios[0];
        const searchQuery = data.queries[0];
        test.info().annotations.push({ type: 'testData', description: `${data.queryType}: ${searchQuery}` });

        await researchPlusPage.executeQueryTypeSearch(data.queryType, searchQuery, data.action);

        const initialCount = await researchPlusPage.getRenderedResultCount();
        expect(initialCount).toBeGreaterThan(0);

        const newCount = await researchPlusPage.triggerRefreshAndGetNewCount(initialCount);
        expect(newCount).toBeGreaterThan(initialCount);
    });

    test('Research Plus - Get More button displays polling indicator and fetches subsequent result batches', async ({ researchPlusPage }) => {
        test.setTimeout(120000);
        const data = refreshScenarios[1];
        const searchQuery = data.queries[0];
        test.info().annotations.push({ type: 'testData', description: `${data.queryType}: ${searchQuery}` });

        await researchPlusPage.executeQueryTypeSearch(data.queryType, searchQuery, data.action);

        await researchPlusPage.triggerGetMoreAndValidatePolling();

        await expect(async () => {
            const isRefreshVisible = await researchPlusPage.refreshButton.isVisible();
            const isGetMoreVisible = await researchPlusPage.getMoreButton.isVisible();
            expect(isRefreshVisible || isGetMoreVisible).toBeTruthy();
        }).toPass({ timeout: 10000 });
    });
});
