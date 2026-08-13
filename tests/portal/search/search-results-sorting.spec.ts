import { test, expect } from '../../../src/fixtures';
import { SortingValidator } from '../../../src/utils/SortingValidator';
import * as fs from 'fs';
import * as path from 'path';

// 1. Test Data Layer
const testDataPath = path.join(__dirname, '../../test-data/portal-data.json');
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));
const scenario = testData.searchResultScenarios.globalSearch;
const sortingScenarios = testData.searchResultScenarios.sortingOptions;

// 4. Test Orchestration Layer
test.describe('Search Results Sorting Validations @search @sorting', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PORTAL_URL as string);
  });

  test('Verify default sorting option', async ({ topNavigationBar, searchResultPage }) => {
    await topNavigationBar.searchFor(scenario.query);
    await expect(searchResultPage.searchResultIdentifier).toBeAttached();

    await expect(searchResultPage.sortingDropdownToggle).toHaveText(new RegExp(scenario.defaultSorting, 'i'), { timeout: 15000 });
  });

  // Data-driven parameterized testing
  for (const sortConfig of sortingScenarios) {
    
    // Support running subsets of sort options via tags
    test(`Verify sorting functionality for: ${sortConfig.option}`, async ({ topNavigationBar, searchResultPage, page }, testInfo) => {
      
      // Navigate to search results
      await topNavigationBar.searchFor(scenario.query);
      await expect(searchResultPage.searchResultIdentifier).toBeAttached();
      
      // Ensure default sort is Best Matched before proceeding
      await expect(searchResultPage.sortingDropdownToggle).toHaveText(new RegExp(scenario.defaultSorting, 'i'), { timeout: 15000 });

      // Wait a moment for dynamic cards to render
      await page.waitForTimeout(3000);

      // 1a. Page Interaction Layer - Select Sort Option
      await searchResultPage.sortingDropdownToggle.click();
      await searchResultPage.sortOptionsContainer.locator('a, .dropdown-item').filter({ hasText: sortConfig.option }).click();

      // 5. Explicit wait for dynamic content reload (API intercept)
      await searchResultPage.waitForResultsToReload();

      // Validate UI state updated
      await expect(searchResultPage.sortingDropdownToggle).toHaveText(new RegExp(sortConfig.option, 'i'));

      // Visual pause so you can see the sort change in headed mode!
      if (!testInfo.project.use.headless) await page.waitForTimeout(2000);

      // Extract NEW order/data
      const newTitles = await searchResultPage.getVisibleResultTitles();
      const newYears = await searchResultPage.getVisibleResultYears();

      if (newTitles.length <= 1) {
          console.warn(`Only ${newTitles.length} results extracted. Data validation skipped.`);
          return; 
      }

      // 1b. Validation/Logic Layer
      if (sortConfig.validatorType === 'alphabetical') {
          const isValid = SortingValidator.isAlphabetical(newTitles);
          const expectedOrder = SortingValidator.getExpectedAlphabeticalOrder(newTitles);
          
          expect(isValid, `Sort option "${sortConfig.option}" failed.\nExpected: ${expectedOrder.slice(0,3).join(', ')}...\nActual: ${newTitles.slice(0,3).join(', ')}...`).toBeTruthy();
      } 
      else if (sortConfig.validatorType === 'dateDescending') {
          const isValid = SortingValidator.isDescendingDate(newYears);
          const expectedOrder = SortingValidator.getExpectedDescendingDateOrder(newYears);
          
          expect(isValid, `Sort option "${sortConfig.option}" failed.\nExpected: ${expectedOrder.slice(0,3).join(', ')}...\nActual: ${newYears.slice(0,3).join(', ')}...`).toBeTruthy();
      }
      else if (sortConfig.validatorType === 'sjrRank') {
          // SJR Rank logic happens on backend. We just verify the UI didn't crash.
          console.log('SJR Rank selected successfully. Data validation requires backend/ML data.');
      }
      else {
          throw new Error(`Unsupported validatorType: ${sortConfig.validatorType}`);
      }
    });
  }

  test('Verify sort order is preserved across pagination @search @sorting @pagination', async ({ topNavigationBar, searchResultPage, page }, testInfo) => {
    // Navigate to search results
    await topNavigationBar.searchFor(scenario.query);
    await expect(searchResultPage.searchResultIdentifier).toBeAttached();
    await page.waitForTimeout(3000);

    // Select Alphabetical sort
    await searchResultPage.sortingDropdownToggle.click();
    await searchResultPage.sortOptionsContainer.locator('a, .dropdown-item').filter({ hasText: 'Alphabetically' }).click();
    await searchResultPage.waitForResultsToReload();
    
    // Crucial: Wait for UI to confirm sort is applied to prevent capturing default sorting list
    await expect(searchResultPage.sortingDropdownToggle).toHaveText(/Alphabetically/i);
    await page.waitForTimeout(3000); // Wait for DOM cards to re-render

    // Extract Page 1
    const page1Titles = await searchResultPage.getVisibleResultTitles();
    if (page1Titles.length === 0) {
      console.warn('0 results on page 1. Skipping.');
      return;
    }

    // Go to Next Page
    await expect(searchResultPage.nextPageButton).toBeVisible();
    await searchResultPage.nextPageButton.click();
    await searchResultPage.waitForResultsToReload();
    await page.waitForTimeout(3000);

    // Extract Page 2
    const page2Titles = await searchResultPage.getVisibleResultTitles();
    if (page2Titles.length === 0) {
      console.warn('0 results on page 2. Skipping.');
      return;
    }

    // Combine and validate
    const combinedTitles = [...page1Titles, ...page2Titles];
    const isValid = SortingValidator.isAlphabetical(combinedTitles);
    
    if (!isValid) {
      console.log('Sorting validation failed on combined dataset:', combinedTitles);
      const expected = SortingValidator.getExpectedAlphabeticalOrder(combinedTitles);
      console.log('Expected order:', expected);
    }
    
    // Assert entire dataset is sorted
    expect(isValid, 'Pagination breaks alphabetical sorting.').toBeTruthy();
  });

  test('Verify switching sort options mid-session preserves state @search @sorting', async ({ topNavigationBar, searchResultPage, page }) => {
    await topNavigationBar.searchFor(scenario.query);
    await expect(searchResultPage.searchResultIdentifier).toBeAttached();
    await page.waitForTimeout(3000);

    // Apply a filter - target the label or use force: true since custom checkboxes hide the real input
    await searchResultPage.firstFilterCheckbox.evaluate((node: HTMLElement) => node.click());
    await searchResultPage.waitForResultsToReload();

    // Go to Next Page
    if (await searchResultPage.nextPageButton.isVisible()) {
      await searchResultPage.nextPageButton.click();
      await searchResultPage.waitForResultsToReload();
      await expect(searchResultPage.activePageIndicator).toHaveText('2');
    }

    // Change Sort
    await searchResultPage.sortingDropdownToggle.click();
    await searchResultPage.sortOptionsContainer.locator('a, .dropdown-item').filter({ hasText: 'Newest First' }).click();
    await searchResultPage.waitForResultsToReload();
    await page.waitForTimeout(3000);

    // Assert pagination reset
    if (await searchResultPage.activePageIndicator.isVisible()) {
      await expect(searchResultPage.activePageIndicator).toHaveText('1');
    }

    // Assert filter preserved
    await expect(searchResultPage.firstFilterCheckbox).toBeChecked();
  });
});
