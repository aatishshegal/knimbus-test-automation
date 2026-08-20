import { test, expect } from '../../../src/fixtures';

test.describe('Research+ Landing Page', () => {
    test.beforeEach(async ({ page, homePage }) => {
        // Navigate to the portal, relying on the cached global session
        await page.goto(process.env.PORTAL_URL!);
        await expect(homePage.homePageIdentifier).toBeVisible();
    });

    test('Verify navigation to Research+ page', async ({ topNavigationBar, researchPlusPage }) => {
        // Step 1: Click on Research+ from navigation bar
        await topNavigationBar.menuResearch.click();

        // Step 2: Verify Research+ Page is visible
        await expect(researchPlusPage.pageIdentifier).toBeVisible();
    });

    test('Verify Search Tips availability on Research+ page', async ({ topNavigationBar, researchPlusPage }) => {
        // Navigate to Research+
        await topNavigationBar.menuResearch.click();
        await expect(researchPlusPage.pageIdentifier).toBeVisible();

        // Verify Search Tips availability
        await researchPlusPage.verifySearchTipsVisibility();
    });
});
