import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

const testData = portalData.filterPanelScenarios.find(d => d.innerSearchQuery) || portalData.filterPanelScenarios[0];
const globalQuery = testData.query;
const innerQuery = testData.innerSearchQuery || 'Science';
const categoryName = testData.categories && testData.categories.length > 0 ? testData.categories[0].name : 'Content Types';
const filterValue = testData.categories && testData.categories.length > 0 ? testData.categories[0].values[0] : 'eBook';

test.describe('Search Results - Inner Search Drilldown Filter Persistence', () => {

  test.beforeEach(async ({ page, topNavigationBar, searchResultPage }) => {
    await page.goto(process.env.PORTAL_URL as string);
    await topNavigationBar.searchFor(globalQuery);
    await expect(searchResultPage.searchResultIdentifier).toBeAttached();
    await expect(searchResultPage.searchCountText).toBeVisible({ timeout: 15000 });

    // Perform Inner Search (Drilldown)
    await searchResultPage.innerSearchInput.fill(innerQuery);
    await searchResultPage.innerSearchInput.press('Enter');
    await searchResultPage.waitForResultsToReload();

    // Verify initial drilldown is applied
    const isIntact = await searchResultPage.filterPanel.isInnerSearchFilterApplied(innerQuery);
    expect(isIntact).toBeTruthy();
  });

  test('Inner Search Persistence - Drilldown filter remains active when toggling result list and grid views', async ({ searchResultPage }) => {
    // Switch to List View and verify filter intact
    await searchResultPage.switchToListView();
    expect(await searchResultPage.filterPanel.isInnerSearchFilterApplied(innerQuery)).toBeTruthy();

    // Switch back to Grid View and verify filter intact
    await searchResultPage.switchToGridView();
    expect(await searchResultPage.filterPanel.isInnerSearchFilterApplied(innerQuery)).toBeTruthy();
  });

  test('Inner Search Persistence - Drilldown filter remains active across pagination next page navigation', async ({ searchResultPage }) => {
    await expect(searchResultPage.nextPageButton).toBeVisible();
    await searchResultPage.nextPageButton.click();
    await searchResultPage.waitForResultsToReload();

    expect(await searchResultPage.filterPanel.isInnerSearchFilterApplied(innerQuery)).toBeTruthy();
  });

  test('Inner Search Persistence - Drilldown filter remains active when applying category filters', async ({ searchResultPage }) => {
    await searchResultPage.filterPanel.applyFilterValue(categoryName, filterValue);
    expect(await searchResultPage.filterPanel.isInnerSearchFilterApplied(innerQuery)).toBeTruthy();
  });

  test('Inner Search Persistence - Drilldown filter remains active when removing individual category filters', async ({ searchResultPage }) => {
    await searchResultPage.filterPanel.applyFilterValue(categoryName, filterValue);
    expect(await searchResultPage.filterPanel.isInnerSearchFilterApplied(innerQuery)).toBeTruthy();

    await searchResultPage.filterPanel.removeAppliedFilter(categoryName, filterValue);
    expect(await searchResultPage.filterPanel.isInnerSearchFilterApplied(innerQuery)).toBeTruthy();
  });

});
