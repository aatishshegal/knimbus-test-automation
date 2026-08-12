import { test, expect } from '../../../src/fixtures';
import * as fs from 'fs';
import * as path from 'path';

// Load test data
const testDataPath = path.join(__dirname, '../../test-data/portal-data.json');
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));
const scenario = testData.searchResultScenarios.globalSearch;

test.describe('Search Results Validations @search', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PORTAL_URL as string);
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Add a visual pause when running in headed mode so the user can verify the UI
    if (!testInfo.project.use.headless) await page.waitForTimeout(2000);
  });

  test('Verify search navigation and core result layout', async ({ topNavigationBar, searchResultPage, page }) => {
    // 1. Perform search
    await topNavigationBar.searchFor(scenario.query);
    
    // 2. Verify URL routes to search results
    await expect(page).toHaveURL(/.*searchresult.*/);
    await expect(searchResultPage.searchResultIdentifier).toBeAttached();

    // 3. Verify all expected tabs are visible
    for (const tabName of scenario.expectedTabs) {
        const tab = searchResultPage.getTabByName(tabName);
        await expect(tab).toBeVisible({ timeout: 15000 });
    }
  });

  test('Verify eCatalog is the default active tab', async ({ topNavigationBar, searchResultPage }) => {
    await topNavigationBar.searchFor(scenario.query);
    await expect(searchResultPage.searchResultIdentifier).toBeAttached();

    const eCatalogTab = searchResultPage.getTabByName('eCatalog');
    await expect(eCatalogTab).toBeVisible();
  });

  test('Verify default view options', async ({ topNavigationBar, searchResultPage }) => {
    await topNavigationBar.searchFor(scenario.query);
    await expect(searchResultPage.searchResultIdentifier).toBeAttached();

    await expect(searchResultPage.viewDropdownToggle).toHaveText(new RegExp(scenario.defaultView), { timeout: 15000 });
  });

  test('Verify switching between Grid and List view layouts', async ({ topNavigationBar, searchResultPage, page }, testInfo) => {
    await topNavigationBar.searchFor(scenario.query);
    await expect(searchResultPage.searchResultIdentifier).toBeAttached();

    // Verify initial state is Grid View
    await expect(searchResultPage.viewDropdownToggle).toHaveText(/Grid View/i, { timeout: 15000 });

    // Switch to List View
    await searchResultPage.viewDropdownToggle.click();
    await searchResultPage.viewOptionList.click();
    
    // Verify the dropdown toggle now says "List View"
    await expect(searchResultPage.viewDropdownToggle).toHaveText(/List View/i);
    // Visual pause so you can see List View
    if (!testInfo.project.use.headless) await page.waitForTimeout(2000);

    // Switch back to Grid View
    await searchResultPage.viewDropdownToggle.click();
    await searchResultPage.viewOptionGrid.click();

    // Verify it switched back
    await expect(searchResultPage.viewDropdownToggle).toHaveText(/Grid View/i);
    // Visual pause so you can see Grid View
    if (!testInfo.project.use.headless) await page.waitForTimeout(2000);
  });

  test('Verify inner search box placeholder', async ({ topNavigationBar, searchResultPage }) => {
    await topNavigationBar.searchFor(scenario.query);
    await expect(searchResultPage.searchResultIdentifier).toBeAttached();

    await expect(searchResultPage.innerSearchInput).toBeVisible({ timeout: 15000 });
    await expect(searchResultPage.innerSearchInput).toHaveAttribute('placeholder', scenario.innerSearchPlaceholder);
  });

  test('Verify dynamic result count and filters sidebar', async ({ topNavigationBar, searchResultPage }) => {
    await topNavigationBar.searchFor(scenario.query);
    await expect(searchResultPage.searchResultIdentifier).toBeAttached();

    await expect(searchResultPage.searchCountText).toBeVisible({ timeout: 15000 });
    const countText = await searchResultPage.searchCountText.innerText();
    expect(countText.trim()).toMatch(new RegExp(scenario.showingTextRegex));

    await expect(searchResultPage.filtersSidebar).toBeVisible();
  });

});
