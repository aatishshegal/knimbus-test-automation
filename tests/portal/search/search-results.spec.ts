import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

const scenario = portalData.searchResultScenarios.globalSearch;

test.describe('Search Results - General Layout and Navigation Validations', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PORTAL_URL as string);
  });

  test('Search Results - Global search navigation routes to search results page and displays tabs', async ({ topNavigationBar, searchResultPage, page }) => {
    await topNavigationBar.searchFor(scenario.query);
    
    await expect(page).toHaveURL(/.*searchresult.*/);
    await expect(searchResultPage.searchResultIdentifier).toBeAttached();

    await searchResultPage.verifyTabsPresent(scenario.expectedTabs);
  });

  test('Search Results - Default active result tab is eCatalog', async ({ topNavigationBar, searchResultPage }) => {
    await topNavigationBar.searchFor(scenario.query);
    await expect(searchResultPage.searchResultIdentifier).toBeAttached();

    const eCatalogTab = searchResultPage.getTabByName('eCatalog');
    await expect(eCatalogTab).toBeVisible();
  });

  test('Search Results - Default search result view layout is Grid View', async ({ topNavigationBar, searchResultPage }) => {
    await topNavigationBar.searchFor(scenario.query);
    await expect(searchResultPage.searchResultIdentifier).toBeAttached();

    await expect(searchResultPage.viewDropdownToggle).toHaveText(new RegExp(scenario.defaultView), { timeout: 15000 });
  });

  test('Search Results - Switching between Grid View and List View updates display layout', async ({ topNavigationBar, searchResultPage }) => {
    await topNavigationBar.searchFor(scenario.query);
    await expect(searchResultPage.searchResultIdentifier).toBeAttached();

    await expect(searchResultPage.viewDropdownToggle).toHaveText(/Grid View/i, { timeout: 15000 });

    await searchResultPage.switchToListView();
    await searchResultPage.switchToGridView();
  });

  test('Search Results - Inner search within results input displays expected placeholder text', async ({ topNavigationBar, searchResultPage }) => {
    await topNavigationBar.searchFor(scenario.query);
    await expect(searchResultPage.searchResultIdentifier).toBeAttached();

    await expect(searchResultPage.innerSearchInput).toBeVisible({ timeout: 15000 });
    await expect(searchResultPage.innerSearchInput).toHaveAttribute('placeholder', scenario.innerSearchPlaceholder);
  });

  test('Search Results - Displays total result count text and filters sidebar container', async ({ topNavigationBar, searchResultPage }) => {
    await topNavigationBar.searchFor(scenario.query);
    await expect(searchResultPage.searchResultIdentifier).toBeAttached();

    await expect(searchResultPage.searchCountText).toBeVisible({ timeout: 15000 });
    const countText = await searchResultPage.searchCountText.innerText();
    expect(countText.trim()).toMatch(new RegExp(scenario.showingTextRegex));

    await expect(searchResultPage.filtersSidebar).toBeVisible();
  });

});
