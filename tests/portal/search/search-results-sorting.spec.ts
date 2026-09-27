import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

const scenario = portalData.searchResultScenarios.globalSearch;
const sortingScenarios = portalData.searchResultScenarios.sortingOptions;

test.describe('Search Results - Sorting Validations', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PORTAL_URL as string);
  });

  test('Search Results Sorting - Default sort option is Best Matched', async ({ topNavigationBar, searchResultPage }) => {
    await topNavigationBar.searchFor(scenario.query);
    await expect(searchResultPage.searchResultIdentifier).toBeAttached();

    await expect(searchResultPage.sortingDropdownToggle).toHaveText(new RegExp(scenario.defaultSorting, 'i'), { timeout: 15000 });
  });

  test.describe('Search Results Sorting - Dynamic Sort Options', () => {
    for (const sortConfig of sortingScenarios) {
      test(`Search Results Sorting - Results reorder correctly when applying sort: ${sortConfig.option}`, async ({ topNavigationBar, searchResultPage }) => {
        await topNavigationBar.searchFor(scenario.query);
        await expect(searchResultPage.searchResultIdentifier).toBeAttached();
        
        await expect(searchResultPage.sortingDropdownToggle).toHaveText(new RegExp(scenario.defaultSorting, 'i'), { timeout: 15000 });

        await searchResultPage.verifySortingApplied(sortConfig);
      });
    }
  });

  test('Search Results Sorting - Alphabetical sort order is preserved across pagination', async ({ topNavigationBar, searchResultPage }) => {
    await topNavigationBar.searchFor(scenario.query);
    await expect(searchResultPage.searchResultIdentifier).toBeAttached();

    await searchResultPage.verifyAlphabeticalSortAcrossPagination();
  });

  test('Search Results Sorting - Switching sort option resets pagination to page 1 while preserving active filters', async ({ topNavigationBar, searchResultPage }) => {
    await topNavigationBar.searchFor(scenario.query);
    await expect(searchResultPage.searchResultIdentifier).toBeAttached();

    await searchResultPage.verifySortChangePreservesFilterAndResetsPage();
  });
});
