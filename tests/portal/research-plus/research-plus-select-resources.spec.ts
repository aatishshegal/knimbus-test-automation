import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

const advancedSearchData = portalData.researchPlusAdvancedSearch;

test.describe('Research+ Advanced Search - Select Resources', () => {

    test.beforeEach(async ({ page, homePage, topNavigationBar, researchPlusPage }) => {
        await page.goto(process.env.PORTAL_URL!);
        await expect(homePage.homePageIdentifier).toBeVisible();
        await topNavigationBar.menuResearch.click();
        await expect(researchPlusPage.pageIdentifier).toBeVisible();
    });

    const tabs = ['Subscribed', 'Open', 'All'];
    for (const tab of tabs) {
        test.describe(`Select Resources - ${tab} Tab Validations`, () => {
            test.beforeEach(async ({ researchPlusPage }) => {
                const tabLocator = tab === 'Subscribed' ? researchPlusPage.subscribedTab : (tab === 'Open' ? researchPlusPage.openTab : researchPlusPage.allTab);
                await tabLocator.click();
            });

            test(`Research Plus - ${tab} tab displays Select All button`, async ({ researchPlusPage }) => {
                await expect(researchPlusPage.selectAllButton).toBeVisible();
            });

            test(`Research Plus - ${tab} tab Select All checks all resources and toggles button to Default`, async ({ researchPlusPage }) => {
                await researchPlusPage.selectAllButton.click();
                
                // Ensure the list is populated and checkboxes are checked
                await expect(researchPlusPage.allResourcesList.first()).toBeVisible();
                await researchPlusPage.verifyAllResourcesChecked();

                await expect(researchPlusPage.defaultButton).toBeVisible();
                await expect(researchPlusPage.selectAllButton).toBeHidden();
            });

            test(`Research Plus - ${tab} tab Default button restores initial resource selection`, async ({ researchPlusPage }) => {
                await researchPlusPage.selectAllButton.click();
                await researchPlusPage.defaultButton.click();
                
                await expect(researchPlusPage.selectAllButton).toBeVisible();
                await expect(researchPlusPage.defaultButton).toBeHidden();
                
                // Ensure some are selected and some are not (default state)
                await researchPlusPage.verifyResourcesPartiallyChecked();
            });

            test(`Research Plus - ${tab} tab displays Clear All button`, async ({ researchPlusPage }) => {
                await expect(researchPlusPage.clearAllButton).toBeVisible();
            });

            test(`Research Plus - ${tab} tab Clear All deselects all resources and disables Search`, async ({ researchPlusPage }) => {
                // We need to have some query to enable Search button
                const fallbackQuery = portalData.researchPlusAdvancedSearch.defaultFallbackSearch;
                await researchPlusPage.searchBarInput1.fill(advancedSearchData.formReset?.query || fallbackQuery);
                await researchPlusPage.searchBarInput1.blur();
                
                await researchPlusPage.clearAllButton.click();
                
                // Verify no sources selected
                await researchPlusPage.verifyNoResourcesChecked();

                // Verify clear all is disabled and message is shown
                await expect(researchPlusPage.clearAllButton).toBeDisabled();
                const errorMsg = researchPlusPage.page.locator('text=' + advancedSearchData.selectResources.clearAllDisabledMessage);
                await expect(errorMsg).toBeVisible();

                // Verify global Search button is disabled
                await expect(researchPlusPage.searchButton).toBeDisabled();
            });

            test(`Research Plus - ${tab} tab search input filters displayed resources by keyword`, async ({ researchPlusPage }) => {
                const queryKey = tab as keyof typeof advancedSearchData.selectResources.searchQueries;
                const searchQuery = advancedSearchData.selectResources.searchQueries[queryKey];
                
                await researchPlusPage.sourceSearchInput.fill(searchQuery);

                // Verify filtered results show up and contain the search text
                await expect(researchPlusPage.allResourcesList.first()).toContainText(searchQuery, { ignoreCase: true });
                const visibleCount = await researchPlusPage.allResourcesList.count();
                expect(visibleCount).toBeGreaterThan(0);
            });
        });
    }

});
