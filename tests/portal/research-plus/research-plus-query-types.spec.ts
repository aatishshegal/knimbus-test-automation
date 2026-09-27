import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

const queryTypeScenarios = portalData.researchPlusQueryTypes;

test.describe('Research+ Query Type Search Scenarios', () => {
    test.beforeEach(async ({ page, homePage, topNavigationBar, researchPlusPage }) => {
        // Navigate to the portal, relying on the cached global session
        await page.goto(process.env.PORTAL_URL!);
        await expect(homePage.homePageIdentifier).toBeVisible();

        // Navigate to Research+ page
        await topNavigationBar.menuResearch.click();
        await expect(researchPlusPage.pageIdentifier).toBeVisible();
    });

    for (const data of queryTypeScenarios) {
        const sourceLabel = data.action === 'defaultSources' ? 'default sources' : `${data.specificSource} source`;
        const testTitle = `Research Plus - Query Type ${data.queryType} retrieves matching results using ${sourceLabel}`;

        test(testTitle, async ({ researchPlusPage }) => {
            test.setTimeout(120000); // 120s for federated sources

            const searchQuery = data.queries[0];
            test.info().annotations.push({ type: 'testData', description: `${data.queryType}: ${searchQuery}` });

            await researchPlusPage.executeQueryTypeSearch(
                data.queryType,
                searchQuery,
                data.action,
                data.specificSource
            );

            const count = await researchPlusPage.getRenderedResultCount();
            expect(count, `Search for "${searchQuery}" under ${data.queryType} should return greater than 0 results`).toBeGreaterThan(0);
        });
    }
});
