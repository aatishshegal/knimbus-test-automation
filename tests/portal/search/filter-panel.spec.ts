import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';

test.describe('Search Filter Panel Scenarios', () => {
  const scenarioData = portalData.filterPanelScenarios[0];
  const query = scenarioData.query;
  const category1 = scenarioData.categories[0].name; // Source
  const category1Values = scenarioData.categories[0].values; // IEEE, JSTOR
  const category2 = scenarioData.categories[1].name; // Content
  const category2Values = scenarioData.categories[1].values; // eBook
  
  let initialResultCount: number = 0;

  test.beforeEach(async ({ page, topNavigationBar, searchResultPage }) => {
    // Standard setup: login and search
    await page.goto(process.env.PORTAL_URL as string);
    await topNavigationBar.searchFor(query);
    await searchResultPage.waitForResultsToReload();
    
    // Store initial count to compare later
    initialResultCount = await searchResultPage.filterPanel.getResultCountText();
    expect(initialResultCount).toBeGreaterThan(0);
  });

  test('should display filter categories and counts in default state', async ({ searchResultPage }) => {
    const filterPanel = searchResultPage.filterPanel;
    
    await test.step(`Validate counts are visible for category "${category1}"`, async () => {
      const sourceCount = await filterPanel.getCategoryCount(category1);
      expect(sourceCount).toBeGreaterThanOrEqual(0);
    });
    
    await test.step(`Validate category "${category1}" button is present`, async () => {
      const catBtn = filterPanel.getCategoryButton(category1);
      await expect(catBtn).toBeVisible();
    });
  });

  test('should expand and collapse filter categories', async ({ searchResultPage }) => {
    const filterPanel = searchResultPage.filterPanel;
    const catBtn = filterPanel.getCategoryButton(category1);
    
    await test.step(`Expand category "${category1}"`, async () => {
      await filterPanel.expandFilter(category1);
    });
    
    const valueElement = filterPanel.filtersSidebar.getByText(category1Values[0], { exact: false }).first();
    
    await test.step(`Verify filter values are visible after expansion`, async () => {
      await expect(valueElement).toBeVisible();
    });
    
    await test.step(`Collapse category "${category1}" and verify elements are hidden`, async () => {
      await filterPanel.clickElement(catBtn, `Collapse ${category1}`);
      await expect(valueElement).toBeHidden();
    });
  });

  test('should open View All popup for categories with many filters', async ({ searchResultPage }) => {
    const filterPanel = searchResultPage.filterPanel;
    
    await test.step(`Open "View All" popup for category "${category1}"`, async () => {
      await filterPanel.openViewAllPopup(category1);
    });
    
    await test.step(`Verify the popup modal is visible`, async () => {
      const modal = searchResultPage.page.locator('.modal, .popup-container, .view-all-modal, .MuiDialog-root').first();
      await expect(modal).toBeVisible();
    });
  });

  test('should not display View All popup for categories with 5 or fewer filters', async ({ searchResultPage }) => {
    const filterPanel = searchResultPage.filterPanel;
    const categoryName = 'Access Type';
    
    await test.step(`Expand category "${categoryName}" (which typically has few filters)`, async () => {
      await filterPanel.expandFilter(categoryName);
    });
    
    await test.step(`Verify "View All" link is not present`, async () => {
      // By default, only the category we just expanded should have its contents visible
      // We check that NO View All link is visible in the sidebar right now
      const visibleViewAllLinks = filterPanel.filtersSidebar.getByRole('link', { name: /^View All/i }).locator('visible=true');
      await expect(visibleViewAllLinks).toHaveCount(0);
    });
  });

  test('should apply a single filter and update results', async ({ searchResultPage }) => {
    const filterPanel = searchResultPage.filterPanel;
    
    await test.step(`Apply filter "${category1Values[0]}" in category "${category1}"`, async () => {
      await filterPanel.applyFilterValue(category1, category1Values[0]);
    });
    
    await test.step(`Verify filter "${category1Values[0]}" is applied correctly`, async () => {
      const isApplied = await filterPanel.isFilterApplied(category1Values[0]);
      expect(isApplied).toBeTruthy();
    });
    
    await test.step(`Verify search result count updated correctly`, async () => {
      const newCount = await filterPanel.getResultCountText();
      expect(newCount).toBeLessThanOrEqual(initialResultCount);
    });
  });

  test('should remove an applied filter and revert results', async ({ searchResultPage }) => {
    const filterPanel = searchResultPage.filterPanel;
    
    await test.step(`Setup: Apply a filter first`, async () => {
      await filterPanel.applyFilterValue(category1, category1Values[0]);
      expect(await filterPanel.isFilterApplied(category1Values[0])).toBeTruthy();
    });
    
    await test.step(`Action: Remove the applied filter`, async () => {
      await filterPanel.removeAppliedFilter(category1, category1Values[0]);
    });
    
    await test.step(`Verify filter chip disappeared`, async () => {
      const isAppliedAfterRemove = await filterPanel.isFilterApplied(category1Values[0]);
      expect(isAppliedAfterRemove).toBeFalsy();
    });
    
    await test.step(`Verify result count reverted to initial value`, async () => {
      const revertedCount = await filterPanel.getResultCountText();
      expect(revertedCount).toBe(initialResultCount);
    });
  });

  test('should clear all applied filters at once', async ({ searchResultPage }) => {
    const filterPanel = searchResultPage.filterPanel;
    
    await test.step(`Setup: Apply multiple filters`, async () => {
      await filterPanel.applyFilterValue(category1, category1Values[0]);
      await filterPanel.applyFilterValue(category2, category2Values[0]);
      expect(await filterPanel.isFilterApplied(category1Values[0])).toBeTruthy();
    });
    
    await test.step(`Action: Click "Clear All"`, async () => {
      await filterPanel.clearAllFilters();
    });
    
    await test.step(`Verify all filter chips are gone`, async () => {
      expect(await filterPanel.isFilterApplied(category1Values[0])).toBeFalsy();
      expect(await filterPanel.isFilterApplied(category2Values[0])).toBeFalsy();
    });
    
    await test.step(`Verify result count reverted`, async () => {
      const revertedCount = await filterPanel.getResultCountText();
      expect(revertedCount).toBe(initialResultCount);
    });
  });

  test('should support applying multiple filters across different categories with strict count validation', async ({ searchResultPage }) => {
    const filterPanel = searchResultPage.filterPanel;
    let expectedCountCategory1 = 0;
    let expectedCountCategory2 = 0;
    
    await test.step(`Check count for "${category1Values[0]}" in category "${category1}" before applying`, async () => {
      expectedCountCategory1 = await filterPanel.getFilterValueCount(category1, category1Values[0]);
      console.log(`[LOG] Extracted count from label "${category1Values[0]}": ${expectedCountCategory1}`);
    });
    
    await test.step(`Apply filter "${category1Values[0]}" in category "${category1}"`, async () => {
      await filterPanel.applyFilterValue(category1, category1Values[0]);
    });
    
    await test.step(`Verify "Showing [count]" matches the applied filter's original count`, async () => {
      const currentCount = await filterPanel.getResultCountText();
      console.log(`[LOG] Global "Showing X for Y" count after first filter: ${currentCount}`);
      // Only do exact match if count is > 0 and exists, otherwise just check it reduced
      if (expectedCountCategory1 > 0) {
        expect(currentCount).toBe(expectedCountCategory1);
      } else {
        expect(currentCount).toBeLessThanOrEqual(initialResultCount);
      }
    });
    
    await test.step(`Check count for "${category2Values[0]}" in category "${category2}" before applying`, async () => {
      expectedCountCategory2 = await filterPanel.getFilterValueCount(category2, category2Values[0]);
      console.log(`[LOG] Extracted count from label "${category2Values[0]}": ${expectedCountCategory2}`);
    });
    
    await test.step(`Apply filter "${category2Values[0]}" in category "${category2}"`, async () => {
      await filterPanel.applyFilterValue(category2, category2Values[0]);
    });
    
    await test.step(`Verify "Showing [count]" strictly matches the second applied filter's count`, async () => {
      const currentCount = await filterPanel.getResultCountText();
      console.log(`[LOG] Global "Showing X for Y" count after second filter: ${currentCount}`);
      if (expectedCountCategory2 > 0) {
        expect(currentCount).toBe(expectedCountCategory2);
      } else {
        expect(currentCount).toBeLessThanOrEqual(expectedCountCategory1 || initialResultCount);
      }
    });
    
    await test.step(`Verify both filter chips are present in the applied section`, async () => {
      expect(await filterPanel.isFilterApplied(category1Values[0])).toBeTruthy();
      expect(await filterPanel.isFilterApplied(category2Values[0])).toBeTruthy();
    });
  });

});

test.describe('Custom Flow Search Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    // Only navigate to portal, do not perform a default search
    await page.goto(process.env.PORTAL_URL as string);
  });

  test('should preserve applied filters when switching tabs', async ({ topNavigationBar, searchResultPage }) => {
    const filterPanel = searchResultPage.filterPanel;
    const scenarioData2 = portalData.filterPanelScenarios[1];
    const customQuery = scenarioData2.query;
    const categoryName = scenarioData2.categories[0].name;
    const filterValue = scenarioData2.categories[0].values[0];
    
    await test.step(`Search for "${customQuery}"`, async () => {
      await topNavigationBar.searchFor(customQuery);
      await searchResultPage.waitForResultsToReload();
    });
    
    await test.step(`Apply filter "${filterValue}" in category "${categoryName}"`, async () => {
      await filterPanel.applyFilterValue(categoryName, filterValue);
      expect(await filterPanel.isFilterApplied(filterValue)).toBeTruthy();
    });
    
    await test.step(`Switch tab from "eCatalog" to "Research"`, async () => {
      await searchResultPage.getTabByName('Research').click();
      await searchResultPage.waitForResultsToReload();
    });
    
    await test.step(`Switch tab from "Research" to "Section"`, async () => {
      await searchResultPage.getTabByName('Section').click();
      await searchResultPage.waitForResultsToReload();
    });
    
    await test.step(`Switch tab back to "eCatalog"`, async () => {
      await searchResultPage.getTabByName('eCatalog').click();
      await searchResultPage.waitForResultsToReload();
    });
    
    await test.step(`Verify filter "${filterValue}" is still applied`, async () => {
      expect(await filterPanel.isFilterApplied(filterValue)).toBeTruthy();
    });
  });

  test('should reduce result count and show applied chip when using inner search box', async ({ topNavigationBar, searchResultPage }) => {
    const filterPanel = searchResultPage.filterPanel;
    const scenarioData3 = portalData.filterPanelScenarios[2];
    const baseQuery = scenarioData3.query;
    const innerSearchQuery = scenarioData3.innerSearchQuery as string;
    const expectedDrilldownText = scenarioData3.expectedDrilldownText as string;
    let baseSearchCount = 0;
    
    await test.step(`Search for base query: "${baseQuery}"`, async () => {
      await topNavigationBar.searchFor(baseQuery);
      await searchResultPage.waitForResultsToReload();
      baseSearchCount = await filterPanel.getResultCountText();
      expect(baseSearchCount).toBeGreaterThan(0);
    });
    
    await test.step(`Perform inner search for "${innerSearchQuery}"`, async () => {
      await searchResultPage.innerSearchInput.fill(innerSearchQuery);
      await searchResultPage.innerSearchInput.press('Enter');
      await searchResultPage.waitForResultsToReload();
    });
    
    await test.step(`Verify showing count decreased after inner search`, async () => {
      const newCount = await filterPanel.getResultCountText();
      console.log(`[LOG] Base count: ${baseSearchCount}, New count: ${newCount}`);
      expect(newCount).toBeLessThan(baseSearchCount);
    });
    
    await test.step(`Verify applied filter displays "${expectedDrilldownText}"`, async () => {
      expect(await filterPanel.isInnerSearchFilterApplied(innerSearchQuery)).toBeTruthy();
    });
  });
});
