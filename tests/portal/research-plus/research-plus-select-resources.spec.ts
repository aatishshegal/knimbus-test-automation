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

            test(`Verify click on Clear All deselects sources and disables Search button in ${tab} tab`, async ({ researchPlusPage }) => {
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
